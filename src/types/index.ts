export type ClinicData = {
  name: string;
  address: string;
  hours: string;
  phone: string;
  availableStaff: { name: string }[];
  faq: { question: string; answer: string }[];
};

export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
};
