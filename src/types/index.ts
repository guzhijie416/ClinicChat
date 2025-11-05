export type Staff = { 
  id: string;
  name: string; 
};

export type Session = {
  id: string;
  staffId: string;
  massageType: string;
  duration: number; // in minutes
  startTime: string; // ISO string
};

export type ClinicData = {
  name: string;
  address: string;
  hours: string;
  phone: string;
  staff: Staff[];
  sessions: Session[];
  faq: { question: string; answer: string }[];
};

export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
};