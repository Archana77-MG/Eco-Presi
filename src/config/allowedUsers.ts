import { Role } from '../types';

export interface AllowedUserConfig {
  email: string;
  name: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
}

/**
 * Editable list of authorized users allowed to log into Ecotria Presidency.
 * Supports Email, Google SSO, and WhatsApp Phone login.
 */
export const ALLOWED_USERS: AllowedUserConfig[] = [
  {
    email: 'admin@presidencyuniversity.in',
    name: 'Dr. Ramesh Rao (Registrar / Admin)',
    role: 'Admin',
    phone: '+919845012345',
  },
  {
    email: 'facility@gmail.com',
    name: 'Suresh Kumar (Chief Facility Officer)',
    role: 'Facility Manager',
    phone: '+919880123456',
  },
  {
    email: 'archanaaishu240@gmail.com',
    name: 'Archana (Campus Sustainability Lead)',
    role: 'Admin',
    phone: '+919741098765',
  },
];

export const ALLOWED_WHATSAPP_USERS = [
  {
    phone: '+919880123456',
    name: 'Suresh Kumar',
    role: 'Facility Manager' as Role,
    email: 'facility@gmail.com',
  },
  {
    phone: '+919845012345',
    name: 'Dr. Ramesh Rao',
    role: 'Admin' as Role,
    email: 'admin@presidencyuniversity.in',
  },
  {
    phone: '+919741098765',
    name: 'Archana (Sustainability Lead)',
    role: 'Admin' as Role,
    email: 'archanaaishu240@gmail.com',
  },
];

export const DEFAULT_TARIFFS = {
  electricityPerKwh: 8.0, // ₹ 8 / kWh (BESCOM commercial institutional tariff)
  waterPerKl: 40.0,       // ₹ 40 / kL (BWSSB / tanker supply)
  wastePerKg: 5.0,        // ₹ 5 / kg disposal & processing fee
};

export const CAMPUS_DETAILS = {
  institution: 'Presidency University',
  campus: 'Itgalpura, Rajanukunte, Yelahanka, Bengaluru, Karnataka 560064',
  tagline: 'Smart Campus Resource & Sustainability Management',
  coordinates: '13.1672° N, 77.5342° E',
  established: 2013,
  studentsCount: 14500,
  staffCount: 1200,
  areaAcres: 65,
};
