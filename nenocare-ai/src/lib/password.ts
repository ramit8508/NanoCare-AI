import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, stored: string) => {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) {
    return false;
  }

  const testHash = scryptSync(password, salt, 64).toString("hex");
  const hashBuffer = Buffer.from(hash, "hex");
  const testBuffer = Buffer.from(testHash, "hex");

  if (hashBuffer.length !== testBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, testBuffer);
};
