export interface Barber {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  profileImagePositionX: number;
  profileImagePositionY: number;
  role?: string;
  rating?: number | null;
}

export interface BarberService {
  id: string;
  name: string;
  durationMinutes: number;
  price: string;
}

export interface BarberAvailability {
  barber: Barber;
  service: BarberService;
  slots: string[];
}
