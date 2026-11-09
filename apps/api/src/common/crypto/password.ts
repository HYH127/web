import {
  createHash,
  randomBytes,
  randomInt,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

const KEY_LENGTH = 64;
const SALT_BYTES = 16;

/**
 * 口令哈希：scrypt$<salt>$<hash>
 *
 * 选 scrypt 而不是 bcrypt/argon2：Node 内置，不需要原生编译，
 * 在 Windows / Alpine / serverless 上都不会因为 prebuild 缺失而挂。
 * 参数沿用 Node 默认（N=16384, r=8, p=1），约 50–80ms/次。
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derived = (await scrypt(password.normalize("NFKC"), salt, KEY_LENGTH)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

/**
 * 校验口令。返回 needsRehash 用于将来平滑升级参数：
 * 解析失败的哈希一律判失败，不抛错（避免把异常变成 500 泄露细节）。
 */
export async function verifyPassword(
  password: string,
  stored: string | null | undefined,
): Promise<{ ok: boolean; needsRehash: boolean }> {
  if (!stored) return { ok: false, needsRehash: false };

  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return { ok: false, needsRehash: false };

  const expected = Buffer.from(hash, "hex");
  if (expected.length !== KEY_LENGTH) return { ok: false, needsRehash: false };

  const derived = (await scrypt(password.normalize("NFKC"), salt, KEY_LENGTH)) as Buffer;
  const ok = timingSafeEqual(derived, expected);
  return { ok, needsRehash: false };
}

/** 用户不存在时也跑一次等价的 scrypt，避免「响应快=账号不存在」的枚举时序差 */
export async function burnPasswordTime(password: string): Promise<void> {
  try {
    await scrypt(password.normalize("NFKC"), "00000000000000000000000000000000", KEY_LENGTH);
  } catch {
    /* 只用于拉平耗时，失败不影响主流程 */
  }
}

/**
 * 验证码只存哈希。加 pepper 防止数据库泄露后被离线穷举
 * （6 位数字空间只有 100 万，裸 sha256 一秒就能跑完）。
 */
export function hashVerificationCode(code: string, email: string): string {
  const pepper = process.env.VERIFICATION_PEPPER ?? process.env.JWT_SECRET ?? "dev-pepper";
  return createHash("sha256").update(`${code}:${email}:${pepper}`).digest("hex");
}

/** 生成 6 位数字验证码（密码学安全随机，不用 Math.random） */
export function randomVerificationCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** 定长字符串的安全比较，长度不同直接返回 false */
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
