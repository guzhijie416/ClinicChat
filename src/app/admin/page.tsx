import { getClinicData, getAllBookings } from "@/lib/data";
import { ClinicForm } from "@/components/admin/clinic-form";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingsList } from "@/components/admin/bookings-list";
import { Separator } from "@/components/ui/separator";

export default async function AdminPage() {
  const clinicData = await getClinicData();
  const bookings = await getAllBookings();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your clinic's information and view bookings.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <BookingsList bookings={bookings} clinicData={clinicData} />

        <Separator />
        
        <Card>
          <CardHeader>
             <CardTitle>Business Details</CardTitle>
             <CardDescription>This information will be used by the AI to answer client questions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ClinicForm defaultValues={clinicData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
