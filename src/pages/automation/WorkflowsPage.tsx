import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workflowsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function WorkflowsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", trigger_event: "invoice_created" });

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => workflowsApi.list(),
  });

  const createMut = useMutation({
    mutationFn: () => workflowsApi.create({ name: form.name, triggerEvent: form.trigger_event }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["workflows"] }); setOpen(false); toast({ title: "Workflow created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => workflowsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workflows"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Workflows</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Workflow</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Workflow</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Workflow Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Select value={form.trigger_event} onValueChange={(v) => setForm({ ...form, trigger_event: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice_created">Invoice Created</SelectItem>
                  <SelectItem value="payment_received">Payment Received</SelectItem>
                  <SelectItem value="invoice_overdue">Invoice Overdue</SelectItem>
                  <SelectItem value="low_stock">Low Stock Alert</SelectItem>
                  <SelectItem value="bill_due">Bill Due</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => createMut.mutate()} disabled={!form.name} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Trigger</TableHead><TableHead>Active</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow> :
            workflows.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No workflows</TableCell></TableRow> :
            workflows.map((w: any) => (
              <TableRow key={w.id}>
                <TableCell className="font-medium">{w.name}</TableCell>
                <TableCell className="capitalize">{(w.trigger_event || w.triggerEvent)?.replace(/_/g, " ")}</TableCell>
                <TableCell>{w.is_active || w.isActive ? "✓" : "—"}</TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(w.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
