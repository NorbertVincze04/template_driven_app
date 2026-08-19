export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  secretKey: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export function validateRegisterRequest(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.fullName || typeof data.fullName !== "string") {
    errors.push("fullName is required");
  }
  if (!data.email || typeof data.email !== "string") {
    errors.push("email is required");
  }
  if (!data.password || typeof data.password !== "string") {
    errors.push("password is required");
  }
  if (!data.secretKey || typeof data.secretKey !== "string") {
    errors.push("secretKey is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateLoginRequest(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.email || typeof data.email !== "string") {
    errors.push("email is required");
  }
  if (!data.password || typeof data.password !== "string") {
    errors.push("password is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
