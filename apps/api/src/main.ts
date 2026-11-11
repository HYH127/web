import "reflect-metadata";
import {
  BadRequestException,
  Logger,
  ValidationPipe,
  type ValidationError,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";

const isProduction = process.env.NODE_ENV === "production";

/** 把 class-validator 的嵌套错误摊平成 [{ field, message }] */
function flattenValidationErrors(
  errors: ValidationError[],
  parent = "",
): Array<{ field: string; message: string }> {
  const rows: Array<{ field: string; message: string }> = [];
  for (const error of errors) {
    const path = parent ? `${parent}.${error.property}` : error.property;
    if (error.constraints) {
      for (const message of Object.values(error.constraints)) {
        rows.push({ field: path, message });
      }
    }
    if (error.children && error.children.length > 0) {
      rows.push(...flattenValidationErrors(error.children, path));
    }
  }
  return rows;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix("api");

  // 反向代理后面才信任 X-Forwarded-For；直连时开启会让攻击者伪造来源 IP 绕过限流
  if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
  }

  // 安全响应头。CSP 交给前端页面，API 只返回 JSON；
  // /uploads 需要允许跨源加载（前端在 3000，静态资源在 4000）。
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: "no-referrer" },
      hsts: isProduction ? { maxAge: 15552000, includeSubDomains: true } : false,
    }),
  );

  // 会话 Cookie 解析
  app.use(cookieParser());

  // 请求体上限：正常业务 JSON 都在几十 KB 内，超过 100kb 直接拒绝，
  // 避免超大 JSON 拖死单线程事件循环（图片走 multipart，不受此限制）
  app.useBodyParser("json", { limit: "100kb" });
  app.useBodyParser("urlencoded", { limit: "100kb", extended: true });

  // 工厂记录上传的图片（占位方案：本地磁盘 /uploads）
  const uploadRoot = process.env.UPLOAD_DIR ?? join(process.cwd(), "uploads");
  mkdirSync(uploadRoot, { recursive: true });
  app.useStaticAssets(uploadRoot, {
    prefix: "/uploads/",
    maxAge: "7d",
    // 上传目录只放图片：禁止嗅探成 HTML，避免被当成 XSS 载体
    setHeaders: (response) => {
      response.setHeader("X-Content-Type-Options", "nosniff");
      response.setHeader("Content-Security-Policy", "default-src 'none'; img-src 'self'");
    },
  });

  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(","),
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"],
    maxAge: 600,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // 出现未声明的字段直接 400：避免脏字段被悄悄带进 service
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: false,
      exceptionFactory: (errors) => {
        const details = flattenValidationErrors(errors);
        return new BadRequestException({
          code: "VALIDATION_ERROR",
          message: details[0]?.message ?? "请求参数校验失败",
          details,
        });
      },
    }),
  );

  // 统一响应结构 + 统一错误结构
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // 接口文档等于把整套路由、字段、鉴权方式摊开给外部看。
  // 生产环境默认关闭，确实需要对外时显式设 ENABLE_API_DOCS=true。
  const docsEnabled = !isProduction || process.env.ENABLE_API_DOCS === "true";
  if (docsEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("NORDEL Trade API")
      .setDescription(
        "外贸独立站接口文档。统一响应结构：{ success, data, meta } / 统一错误结构：{ success: false, error: { code, message, details } }。除标注 public 的接口外均需登录（HttpOnly Cookie 或 Bearer Token）。",
      )
      .setVersion("0.2.0")
      .addBearerAuth()
      .addCookieAuth("nordel_at")
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  } else {
    // 生产环境连路由都不挂，避免任何形式的探测
    Logger.log("API 文档已关闭（生产环境）", "Bootstrap");
  }

  // 只监听回环地址：Nginx / Next 都在本机，外部没有理由直连 4000。
  // 绑 0.0.0.0 时，一旦安全组或防火墙被放宽，http://IP:4000 会绕过
  // HTTPS、绕过 Nginx 的所有响应头，把 Cookie 暴露在明文链路上。
  const port = Number(process.env.PORT ?? 4000);
  const host = process.env.HOST ?? "127.0.0.1";
  await app.listen(port, host);

  Logger.log(`API   → http://${host}:${port}/api`, "Bootstrap");
  Logger.log(`Health→ http://${host}:${port}/api/health`, "Bootstrap");
}

void bootstrap();
