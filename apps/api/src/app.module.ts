import { Module } from "@nestjs/common";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { RolesGuard } from "./auth/guards/roles.guard";
import { FactoryModule } from "./factory/factory.module";
import { HealthModule } from "./health/health.module";
import { InquiryModule } from "./inquiry/inquiry.module";
import { PrismaModule } from "./prisma/prisma.module";
import { PrismaService } from "./prisma/prisma.service";
import { TradeModule } from "./trade/trade.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // 全局限流：默认每 IP 每分钟 120 次；敏感接口在 controller 上用 @Throttle 单独收紧
    ThrottlerModule.forRoot({
      throttlers: [{ name: "default", ttl: 60_000, limit: 120 }],
      errorMessage: "请求过于频繁，请稍后再试",
      // 去掉 IPv4-mapped IPv6 前缀，避免同一台机器被算成两个来源
      getTracker: (req: Record<string, any>) => {
        const forwarded = req.headers?.["x-forwarded-for"];
        const raw =
          typeof forwarded === "string" && forwarded.length > 0
            ? forwarded.split(",")[0].trim()
            : req.ip;
        return String(raw ?? "unknown").replace(/^::ffff:/, "");
      },
    }),

    PrismaModule,
    AuthModule,
    HealthModule,
    TradeModule,
    FactoryModule,
    InquiryModule,
  ],
  providers: [
    // 顺序即执行顺序：先限流，再鉴权，最后角色
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector, jwt: JwtService, prisma: PrismaService) =>
        new JwtAuthGuard(reflector, jwt, prisma),
      inject: [Reflector, JwtService, PrismaService],
    },
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new RolesGuard(reflector),
      inject: [Reflector],
    },
  ],
})
export class AppModule {}
