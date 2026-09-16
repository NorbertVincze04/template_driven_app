export interface OwnerAnalytics {
  totalBookings: number;
  peakBookedHours: Array<{ hour: string; bookings: number }>;
  mostPopularService: { name: string; bookings: number } | null;
  retention: {
    returningCustomers: number;
    totalCustomers: number;
    rate: number;
  };
  topBarbers: Array<{
    id: string;
    name: string;
    completedAppointments: number;
    rating: number | null;
    ratingCount: number;
  }>;
}
