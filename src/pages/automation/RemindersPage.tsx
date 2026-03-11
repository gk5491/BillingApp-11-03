import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function RemindersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Payment Reminders</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4" /> Overdue Invoice Reminders</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Automatic reminders are sent when invoices become overdue. Configure timing in Settings → Notifications.</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4" /> Bill Payment Reminders</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Get notified before bill due dates. Configure in Settings → Notifications.</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
