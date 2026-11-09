import { SetMetadata } from "@nestjs/common";
import { SKIP_ENVELOPE_KEY } from "../interceptors/response.interceptor";

/** 标记接口跳过统一响应包装（如文件流、第三方回调） */
export const SkipEnvelope = () => SetMetadata(SKIP_ENVELOPE_KEY, true);
