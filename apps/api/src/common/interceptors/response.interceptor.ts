import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, map } from "rxjs";

export const SKIP_ENVELOPE_KEY = "skip_envelope";

export interface ApiEnvelope<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

/**
 * 统一成功响应结构：{ success: true, data, meta? }
 * - service 返回 { data, meta } 时自动展开
 * - 已带 success 字段或标记 @SkipEnvelope() 时原样返回
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiEnvelope<T> | T>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiEnvelope<T> | T> {
    const skip = Reflect.getMetadata(
      SKIP_ENVELOPE_KEY,
      context.getHandler(),
    ) as boolean | undefined;

    return next.handle().pipe(
      map((payload) => {
        if (skip) return payload;
        if (payload && typeof payload === "object" && "success" in payload) {
          return payload;
        }
        if (
          payload &&
          typeof payload === "object" &&
          "data" in payload &&
          Object.keys(payload).every((key) => key === "data" || key === "meta")
        ) {
          const { data, meta } = payload as {
            data: T;
            meta?: Record<string, unknown>;
          };
          return meta ? { success: true as const, data, meta } : { success: true as const, data };
        }
        return { success: true as const, data: payload };
      }),
    );
  }
}
