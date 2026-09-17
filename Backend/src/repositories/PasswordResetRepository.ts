import { pool } from "../db.ts";
import bcrypt from "bcrypt";
import crypto from "node:crypto";

const CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateSixDigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function hexEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export class PasswordResetRepository {
  // Replaces any previous codes for this user with a freshly generated one
  // and returns the plain code so the caller can email it (only the hash is stored).
  static async createCode(shopId: string, userId: string): Promise<string> {
    const code = generateSixDigitCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

    await pool.query(
      `DELETE FROM password_reset_codes WHERE shop_id = $1 AND user_id = $2`,
      [shopId, userId],
    );
    await pool.query(
      `INSERT INTO password_reset_codes (shop_id, user_id, code_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [shopId, userId, codeHash, expiresAt],
    );

    return code;
  }

  // Verifies the latest unused, unexpired code and, on success, issues a
  // one-time reset token so the raw code never has to be resent alongside
  // the new password.
  static async verifyCode(
    shopId: string,
    userId: string,
    code: string,
  ): Promise<string | null> {
    const { rows } = await pool.query<{ id: string; codeHash: string }>(
      `SELECT id, code_hash AS "codeHash" FROM password_reset_codes
       WHERE shop_id = $1 AND user_id = $2 AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [shopId, userId],
    );
    const record = rows[0];
    if (!record) return null;

    const matches = await bcrypt.compare(code, record.codeHash);
    if (!matches) return null;

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = new Date(
      Date.now() + RESET_TOKEN_TTL_MS,
    ).toISOString();

    await pool.query(
      `UPDATE password_reset_codes
       SET used_at = NOW(), reset_token_hash = $2, reset_token_expires_at = $3
       WHERE id = $1`,
      [record.id, hashToken(resetToken), resetTokenExpiresAt],
    );

    return resetToken;
  }

  // Verifies and consumes a reset token issued by verifyCode; single use.
  static async consumeResetToken(
    shopId: string,
    userId: string,
    resetToken: string,
  ): Promise<boolean> {
    const { rows } = await pool.query<{ id: string; resetTokenHash: string }>(
      `SELECT id, reset_token_hash AS "resetTokenHash" FROM password_reset_codes
       WHERE shop_id = $1 AND user_id = $2 AND reset_token_hash IS NOT NULL
         AND reset_token_used_at IS NULL AND reset_token_expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [shopId, userId],
    );
    const record = rows[0];
    if (!record || !hexEquals(record.resetTokenHash, hashToken(resetToken))) {
      return false;
    }

    await pool.query(
      `UPDATE password_reset_codes SET reset_token_used_at = NOW() WHERE id = $1`,
      [record.id],
    );
    return true;
  }
}
