// data stored in JWT token, used to identify the user
export interface UserPayload {
  id: string;
  shopId: string;
  shopSlug: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "BARBER" | "CUSTOMER";
}

// structure of a user record in the database.
export interface UserRecord {
  id: string;
  shop_id: string;
  shop_slug: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: "ADMIN" | "BARBER" | "CUSTOMER";
}
