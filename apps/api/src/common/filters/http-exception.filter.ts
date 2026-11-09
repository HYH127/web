import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

const CODE_BY_STATUS: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  422: "VALIDATION_ERROR",
  423: "LOCKED",
  429: "TOO_MANY_REQUESTS",
  500: "INTERNAL_ERROR",
  503: "SERVICE_UNAVAILABLE",
};

const isProduction = process.env.NODE_ENV === "production";

/**
 * 统一错误结构：
 * { success: false, error: { code, message, details?, path, timestamp } }
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_ERROR";
    let message = "服务器内部错误";
    let details: unknown;
    let shouldLog = false;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = CODE_BY_STATUS[status] ?? "HTTP_ERROR";
      const body = exception.getResponse();

      if (typeof body === "string") {
        message = body;
      } else if (body && typeof body === "object") {
        const payload = body as {
          message?: string | string[];
          code?: string;
          details?: unknown;
          error?: string;
        };
        code = payload.code ?? code;
        if (Array.isArray(payload.message)) {
          message = "请求参数校验失败";
          details = payload.message;
        } else if (payload.message) {
          message = payload.message;
        } else {
          message = exception.message;
        }
        details = details ?? payload.details;
      }
    } else if (exception instanceof Error) {
      // 生产环境不把内部异常信息回给客户端（可能含 SQL、路径、堆栈片段）
      message = isProduction ? "服务器内部错误，请稍后重试" : exception.message;
      shouldLog = true;
    }

    if (status >= 500 || shouldLog) {
      this.logger.error(
        `${request.method} ${request.originalUrl} → ${status}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
        path: request.originalUrl,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
