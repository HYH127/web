/**
 * 注册风控的纯函数集合：邮箱规范化 / 一次性邮箱 / 口令强度。
 * 不依赖 Nest，方便单测和复用。
 */

/** 常见一次性 / 临时邮箱域名（前缀匹配，覆盖子域） */
const DISPOSABLE_DOMAINS = [
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "33mail.com",
  "anonbox.net",
  "burnermail.io",
  "dispostable.com",
  "dropmail.me",
  "emailondeck.com",
  "fakeinbox.com",
  "getnada.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "harakirimail.com",
  "inboxkitten.com",
  "maildrop.cc",
  "mailinator.com",
  "mailnesia.com",
  "mintemail.com",
  "mohmal.com",
  "moakt.com",
  "sharklasers.com",
  "spam4.me",
  "spambox.us",
  "temp-mail.io",
  "temp-mail.org",
  "tempail.com",
  "tempmail.com",
  "tempmail.net",
  "tempmailo.com",
  "throwawaymail.com",
  "trashmail.com",
  "trashmail.de",
  "yopmail.com",
  "yopmail.fr",
  "guerrillamailblock.com",
  "grr.la",
  "spam.la",
  "mailcatch.com",
  "email-temp.com",
  "linshiyouxiang.net",
  "chacuo.net",
  "mailto.plus",
];

/** 出现频率最高的弱口令（只保留前若干，命中了就是弱） */
const COMMON_PASSWORDS = new Set([
  "123456789",
  "1234567890",
  "12345678",
  "123456789a",
  "password",
  "password1",
  "password123",
  "passw0rd",
  "qwerty123",
  "qwertyuiop",
  "abc123456",
  "iloveyou",
  "admin123",
  "administrator",
  "letmein123",
  "welcome123",
  "changeme",
  "a123456789",
  "1qaz2wsx3edc",
  "woaini1314",
  "5201314520",
  "aa123456789",
  "p@ssw0rd",
]);

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function emailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  return at === -1 ? "" : email.slice(at + 1);
}

export function isDisposableEmail(email: string): boolean {
  const domain = emailDomain(email);
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.some((item) => domain === item || domain.endsWith(`.${item}`));
}

export interface PasswordAssessment {
  ok: boolean;
  /** 0–4，仅用于前端强度条 */
  score: number;
  issues: string[];
}

/**
 * 口令策略（注册 / 改密共用）：
 * - 长度 10–128
 * - 至少两类字符（大小写 / 数字 / 符号）
 * - 不包含邮箱前缀、不是常见弱口令、没有 4 连重复
 *
 * 下限定 10 而不是 12，是为了兼顾外贸客户里常见的长口令习惯，
 * 真正的强度由「字符类 + 黑名单 + 验证码 + 登录锁定」共同保证。
 */
export function assessPassword(password: string, email?: string): PasswordAssessment {
  const issues: string[] = [];
  const value = password ?? "";

  if (value.length < 10) issues.push("密码至少 10 位");
  if (value.length > 128) issues.push("密码不能超过 128 位");
  if (/\s/.test(value)) issues.push("密码不能包含空格");

  const classes = [
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /\d/.test(value),
    /[^a-zA-Z0-9]/.test(value),
  ].filter(Boolean).length;
  if (classes < 2) issues.push("至少包含字母、数字、符号中的两类");

  if (/(.)\1{3,}/.test(value)) issues.push("不要使用 4 个以上连续重复字符");
  if (COMMON_PASSWORDS.has(value.toLowerCase())) issues.push("这个密码太常见，换一个");

  if (email) {
    const local = email.split("@")[0]?.toLowerCase() ?? "";
    if (local.length >= 4 && value.toLowerCase().includes(local)) {
      issues.push("密码不要包含邮箱前缀");
    }
  }

  const score = Math.max(
    0,
    Math.min(
      4,
      (value.length >= 10 ? 1 : 0) +
        (value.length >= 14 ? 1 : 0) +
        (classes >= 3 ? 1 : 0) +
        (classes >= 4 ? 1 : 0),
    ),
  );

  return { ok: issues.length === 0, score, issues };
}

/** 去掉控制字符与零宽字符，压缩连续空行（正文类输入统一走这里） */
export function sanitizeText(raw: string, maxLength: number): string {
  return raw
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/[\u200b-\u200f\u2028\u2029\ufeff]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, maxLength);
}

/** 统计正文里的链接数量，用于垃圾询盘启发式判断 */
export function countLinks(text: string): number {
  const matches = text.match(/https?:\/\/|www\.|\.(com|cn|net|org|ru|top|xyz)\b/gi);
  return matches ? matches.length : 0;
}
