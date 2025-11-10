
export type Staff = { 
  id: string;
  name: string; 
};

export type MassageService = {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
};

export type Session = {
  id: string;
  staffId: string;
  massageServiceId: string;
  startTime: string; // ISO string
  bookingTime?: string; // Maintain for backward compatibility with delete logic
};

export type FAQ = {
  id?: string;
  question: string;
  answer: string;
};

// e.g. { 'staff-id-1': [1, 2, 5] } means staff 1 works on Mon, Tue, Fri
export type WeeklySchedule = {
  [staffId: string]: number[]; // Array of numbers 0 (Sun) to 6 (Sat)
}

export type ClinicData = {
  name: string;
  address: string;
  hours: string;
  phone: string;
  staff: Staff[];
  massageServices: MassageService[];
  sessions: Session[];
  faq: FAQ[];
  weeklySchedule: WeeklySchedule;
};

export type Message = {
  id:string;
  content: string;
  role: 'user' | 'assistant';
};

export type Booking = {
  id: string;
  name: string;
  massageServiceId: string;
  staffId: string;
  bookingTime: string; // ISO string
};

export type DailyReportItem = {
  therapistName: string;
  serviceName: string;
  price: number;
};

export type DailyReportData = {
  date: string;
  items: DailyReportItem[];
  total: number;
};
