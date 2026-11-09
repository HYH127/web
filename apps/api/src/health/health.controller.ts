import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../auth/decorators/auth.decorators";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("health")
@Public()
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "健康检查：进程存活 + 数据库连通性" })
  async check() {
    const dbUp = await this.prisma.ping();
    return {
      status: dbUp ? "ok" : "degraded",
      service: "wem-api",
      version: "0.1.0",
      uptime: Number(process.uptime().toFixed(1)),
      database: dbUp ? "up" : "down",
      timestamp: new Date().toISOString(),
    };
  }
}
