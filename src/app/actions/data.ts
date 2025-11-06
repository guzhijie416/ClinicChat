
'use server';

import { getClinicData, getAvailableStaff, getScheduledStaffForDay } from '@/lib/data';
import type { ClinicData, Staff } from '@/types';

export async function getClinicDataForClient(): Promise<ClinicData> {
    return await getClinicData();
}

export async function getScheduledStaffForClient(forDate?: Date): Promise<Staff[]> {
    return await getScheduledStaffForDay(forDate);
}

export async function getAvailableStaffForClient(forDate?: Date): Promise<Staff[]> {
    return await getAvailableStaff(forDate);
}
