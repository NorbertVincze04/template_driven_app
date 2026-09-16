export interface ManagementUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  roles: string[];
  barberPrivateNote: string | null;
  isActive: boolean;
}
