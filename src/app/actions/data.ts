
'use server';

import { getClinicData, getAllBookings as getAllBookingsFromDb } from '@/lib/data';
import type { ClinicData, Staff, Booking, DailyReportData } from '@/types';
import { isSameDay, parseISO } from 'date-fns';

export async function getClinicDataForClient(): Promise<ClinicData> {
    return await getClinicData();
}

export async function getAllBookingsForClient(): Promise<Booking[]> {
    return await getAllBookingsFromDb();
}

export async function getAvailableStaffForClient(forDate?: Date): Promise<Staff[]> {
    const { getAvailableStaff } = await import('@/lib/data');
    return await getAvailableStaff(forDate);
}

export async function getScheduledStaffForClient(forDate?: Date): Promise<Staff[]> {
    const { getScheduledStaffForDay } = await import('@/lib/data');
    // This function is intended to be called from the client if needed,
    // wrapping the server-side logic from lib/data.ts.
    // It correctly defaults to the current date if none is provided.
    return await getScheduledStaffForDay(forDate || new Date());
}

export async function generateDailyReport(date: Date): Promise<DailyReportData> {
  const clinicData = await getClinicData();
  const allBookings = await getAllBookingsFromDb();

  const reportDate = new Date(date);

  const dailyBookings = allBookings.filter(booking => {
    try {
      const bookingDate = parseISO(booking.bookingTime);
      return isSameDay(bookingDate, reportDate);
    } catch {
      return false;
    }
  });

  const reportItems = dailyBookings.map(booking => {
    const service = clinicData.massageServices.find(s => s.id === booking.massageServiceId);
    const therapist = clinicData.staff.find(t => t.id === booking.staffId);
    return {
      therapistName: therapist?.name || 'Unknown',
      serviceName: service?.name || 'Unknown',
      price: service?.price || 0,
    };
  });

  const totalAmount = reportItems.reduce((sum, item) => sum + item.price, 0);

  return {
    date: reportDate.toISOString(),
    items: reportItems,
    total: totalAmount,
  };
}
