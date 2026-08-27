import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  validateLoginRequest,
  validateRegisterRequest,
} from "../src/validators/auth.validator.ts";

describe("validateRegisterRequest", () => {
  it("accepts a complete registration payload", () => {
    const result = validateRegisterRequest({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "s3cret-pass",
      phoneNumber: "0712345678",
    });

    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, []);
  });

  it("reports every missing field", () => {
    const result = validateRegisterRequest({});

    assert.equal(result.valid, false);
    assert.deepEqual(result.errors, [
      "fullName is required",
      "email is required",
      "password is required",
      "phoneNumber is required",
    ]);
  });
});

describe("validateLoginRequest", () => {
  it("accepts a complete login payload", () => {
    const result = validateLoginRequest({
      email: "ada@example.com",
      password: "s3cret-pass",
    });

    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, []);
  });

  it("rejects a payload without credentials", () => {
    const result = validateLoginRequest({});

    assert.equal(result.valid, false);
    assert.ok(result.errors.length > 0);
  });
});
