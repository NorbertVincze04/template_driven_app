// data stored in JWT token, used to identify the user
export interface UserPayload {
  id: number;
  fullName: string;
  email: string;
  type: "admin" | "user";
}

// structure of a user record in the database.
export interface UserRecord {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  type: "admin" | "user";
  tenant_id: string;
}
