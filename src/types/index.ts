
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
};

export type FAQ = {
  id?: string;
  question: string;
  answer: string;
};

export type ClinicData = {
  name: string;
  address: string;
  hours: string;
  phone: string;
  staff: Staff[];
  massageServices: MassageService[];
  sessions: Session[];
  faq: FAQ[];
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
    
