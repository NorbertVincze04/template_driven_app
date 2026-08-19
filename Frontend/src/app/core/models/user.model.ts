export interface User {
  name: string;
  email: string;
  password: string;
  type: string;
  profileImageUrl?: string;
  tenantId: string;
  token?: string;
}
