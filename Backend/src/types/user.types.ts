export type UserRole = "OWNER" | "ADMIN" | "BARBER" | "CUSTOMER";

// data stored in JWT token, used to identify the user
export interface UserPayload {
  id: string;
  shopId: string;
  shopSlug: string;
  fullName: string;
  email: string;
  role: UserRole;
  roles: UserRole[];
}

// structure of a user record in the database.
export interface UserRecord {
  id: string;
  shop_id: string;
  shop_slug: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  profile_image_url: string | null;
  profile_image_position_x: number;
  profile_image_position_y: number;
  password_hash: string;
  role: UserRole;
  roles: UserRole[];
}

export function hasRole(
  user: Pick<UserPayload, "role" | "roles">,
  role: UserRole,
): boolean {
  return user.role === role || user.roles.includes(role);
}
