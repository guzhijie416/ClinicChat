
'use server';

import { getClinicData, getAvailableStaff, getScheduledStaffForDay, getAllBookings as getAllBookingsFromDb } from '@/lib/data';
import type { ClinicData, Staff, Booking } from '@/types';

export async function getClinicDataForClient(): Promise<ClinicData> {
    return await getClinicData();
}

export async function getAllBookingsForClient(): Promise<Booking[]> {
    return await getAllBookingsFromDb();
}

export async function getAvailableStaffForClient(forDate?: Date): Promise<Staff[]> {
    return await getAvailableStaff(forDate);
}

export async function getScheduledStaffForClient(forDate?: Date): Promise<Staff[]> {
    // This function is intended to be called from the client if needed,
    // wrapping the server-side logic from lib/data.ts.
    // It correctly defaults to the current date if none is provided.
    return await getScheduledStaffForDay(forDate || new Date());
}
