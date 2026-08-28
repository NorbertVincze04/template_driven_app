import { Barber, BarberService } from '../models/barber.model';

export const LOCAL_BARBERS: Barber[] = [
  {
    id: 'local-sophia-marin',
    name: 'Sophia Marin',
    email: 'sophia@salonluxe.local',
    phoneNumber: '+40 721 555 101',
    profileImageUrl:
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=480&q=80',
    profileImagePositionX: 50,
    profileImagePositionY: 35,
    role: 'Senior Stylist',
    rating: 4.9,
  },
  {
    id: 'local-alex-popescu',
    name: 'Alex Popescu',
    email: 'alex@salonluxe.local',
    phoneNumber: '+40 721 555 202',
    profileImageUrl:
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=480&q=80',
    profileImagePositionX: 50,
    profileImagePositionY: 30,
    role: 'Color Specialist',
    rating: 4.8,
  },
];

export const LOCAL_BARBER_SERVICES: Record<string, BarberService[]> = {
  'local-sophia-marin': [
    {
      id: 'local-sophia-signature-cut',
      name: 'Signature Cut',
      durationMinutes: 60,
      price: '75',
    },
    {
      id: 'local-sophia-color-refresh',
      name: 'Color Refresh',
      durationMinutes: 120,
      price: '145',
    },
    {
      id: 'local-sophia-transformation',
      name: 'Complete Transformation',
      durationMinutes: 180,
      price: '240',
    },
  ],
  'local-alex-popescu': [
    {
      id: 'local-alex-signature-cut',
      name: 'Signature Cut',
      durationMinutes: 45,
      price: '65',
    },
    {
      id: 'local-alex-color-refresh',
      name: 'Color Refresh',
      durationMinutes: 105,
      price: '135',
    },
    {
      id: 'local-alex-transformation',
      name: 'Complete Transformation',
      durationMinutes: 150,
      price: '220',
    },
  ],
};
