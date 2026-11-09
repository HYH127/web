import { Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, type JwtModuleOptions } from "@nestjs/jwt";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

const logger = new Logger("AuthModule");

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.get<string>("JWT_SECRET") ?? "";
        const isProd = config.get<string>("NODE_ENV") === "production";

        // 生产环境拒绝弱密钥；开发环境给一个可用的兜底并告警，
        // 避免「忘了配」变成所有人共用一个公开默认密钥上线。
        if (secret.length < 32) {
          if (isProd) {
            throw new Error("JWT_SECRET 缺失或过短（至少 32 位），拒绝启动");
          }
          logger.warn("JWT_SECRET 未配置或过短，开发环境使用临时密钥（重启后旧会话失效）");
        }

        const expiresIn = (config.get<string>("JWT_EXPIRES_IN") ?? "2d") as
          | number
          | `${number}${"s" | "m" | "h" | "d"}`;
        return {
          secret: secret.length >= 32 ? secret : "dev-only-jwt-secret-do-not-use-in-production-32",
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
