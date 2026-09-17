export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
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
  if (!data.phoneNumber || typeof data.phoneNumber !== "string") {
    errors.push("phoneNumber is required");
  } else if (!/^0[237]\d{8}$/.test(data.phoneNumber)) {
    errors.push(
      "phoneNumber must contain 10 digits and start with 02, 03, or 07",
    );
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

export function validateForgotPasswordRequest(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.email || typeof data.email !== "string") {
    errors.push("email is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateVerifyResetCodeRequest(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.email || typeof data.email !== "string") {
    errors.push("email is required");
  }
  if (
    !data.code ||
    typeof data.code !== "string" ||
    !/^\d{6}$/.test(data.code)
  ) {
    errors.push("a valid 6-digit code is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateResetPasswordRequest(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.email || typeof data.email !== "string") {
    errors.push("email is required");
  }
  if (!data.resetToken || typeof data.resetToken !== "string") {
    errors.push("resetToken is required");
  }
  if (
    !data.newPassword ||
    typeof data.newPassword !== "string" ||
    data.newPassword.length < 8
  ) {
    errors.push("newPassword must be at least 8 characters");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
