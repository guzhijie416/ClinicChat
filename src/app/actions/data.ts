
'use server';

import { getClinicData, getAvailableStaff } from '@/lib/data';
import type { ClinicData, Staff } from '@/types';

export async function getClinicDataForClient(): Promise<ClinicData> {
    return await getClinicData();
}

export async function getAvailableStaffForClient(): Promise<Staff[]> {
    return await getAvailableStaff();
}
