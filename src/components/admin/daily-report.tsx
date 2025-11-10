
'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import type { DailyReportData, ClinicData } from '@/types';
import { generateDailyReport } from '@/app/actions/data';
import { useToast } from '@/hooks/use-toast';

interface DailyReportProps {
  clinicData: ClinicData;
}

export function DailyReport({ clinicData }: DailyReportProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [report, setReport] = useState<DailyReportData | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerateReport = () => {
    if (!date) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a date to generate the report.',
      });
      return;
    }
    startTransition(async () => {
      const result = await generateDailyReport(date);
      setReport(result);
    });
  };

  const downloadCSV = () => {
    if (!report) return;

    const headers = ['Therapist', 'Service', 'Price'];
    const csvRows = [headers.join(',')];

    report.items.forEach(item => {
      const values = [
        `"${item.therapistName}"`,
        `"${item.serviceName}"`,
        item.price.toFixed(2),
      ];
      csvRows.push(values.join(','));
    });
    
    // Add total
    csvRows.push('');
    csvRows.push(`"Total",,${report.total.toFixed(2)}`);

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `daily_report_${format(new Date(report.date), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Revenue Report</CardTitle>
        <CardDescription>
          Generate a summary of services and revenue for a specific day.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[280px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleGenerateReport} disabled={isPending}>
            {isPending ? 'Generating...' : 'Create Daily Report'}
          </Button>
        </div>

        {report && (
          <div className="pt-4">
            <h3 className="font-bold text-lg mb-2">
              Report for {format(new Date(report.date), 'PPP')}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Therapist</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.items.length > 0 ? (
                  report.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.therapistName}</TableCell>
                      <TableCell>{item.serviceName}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No bookings found for this day.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                    <TableCell colSpan={2} className="font-bold text-right">Total</TableCell>
                    <TableCell className="font-bold text-right">${report.total.toFixed(2)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </CardContent>
      {report && (
         <CardFooter>
            <Button onClick={downloadCSV} variant="secondary">
                <Download className="mr-2 h-4 w-4" />
                Download CSV
            </Button>
         </CardFooter>
      )}
    </Card>
  );
}
