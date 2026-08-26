export interface User {
  id?: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  password: string;
  type: string;
  profileImageUrl?: string;
  profileImagePositionX?: number;
  profileImagePositionY?: number;
  tenantId: string;
  token?: string;
}
