import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video, Users, CheckCircle2 } from 'lucide-react';

export const revalidate = 0;

export default async function MentorSchedulePage() {
  const scheduleSlots = [
    {
      id: 'slot-1',
      day: 'Monday',
      time: '16:00 - 18:00 IST',
      topic: 'VAPT Exploit Payload Debugging & Lab Guidance',
      bookedBy: 'Gurkaranvir Singh (TS-C142)',
      status: 'BOOKED',
    },
    {
      id: 'slot-2',
      day: 'Wednesday',
      time: '15:00 - 17:00 IST',
      topic: 'AI & Machine Learning Threat Model Consultation',
      bookedBy: 'Gurmandeep Kaur (TS-A103)',
      status: 'BOOKED',
    },
    {
      id: 'slot-3',
      day: 'Friday',
      time: '17:00 - 19:00 IST',
      topic: 'Bug Bounty Reconnaissance & Report Proof of Concept',
      bookedBy: 'Open Slot',
      status: 'AVAILABLE',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <Badge variant="security" className="mb-2">1-ON-1 ACADEMIC MENTORSHIP</Badge>
        <h1 className="tse-h1 text-primary font-sans">Office Hours & Mentorship Schedule</h1>
        <p className="tse-body-sm text-muted">
          Manage 1-on-1 video mentorship slots, consult on practical exploit labs, and guide career paths.
        </p>
      </div>

      <div className="space-y-4">
        {scheduleSlots.map((slot) => (
          <Card key={slot.id} className="border border-border p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={slot.status === 'BOOKED' ? 'security' : 'outline'}>
                    {slot.status}
                  </Badge>
                  <span className="font-bold text-sm font-mono text-primary flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-security-green-dark" />
                    {slot.day} ({slot.time})
                  </span>
                </div>

                <h3 className="tse-h3 text-primary">{slot.topic}</h3>
                <p className="text-xs font-mono text-slate-500">
                  Student: <strong className="text-slate-800">{slot.bookedBy}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {slot.status === 'BOOKED' ? (
                  <Button variant="security" size="sm" className="font-bold gap-2 text-xs">
                    <Video className="w-4 h-4" />
                    Join Video Room
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="text-xs">
                    Open Slot
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
