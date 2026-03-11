import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader, DataToolbar } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { CreateDialog } from "@/components/CreateDialog";
import { expensesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function ExpensesPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({ queryKey: ["expenses"], queryFn: expensesApi.list });

  const createMutation = useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setOpen(false);
      toast({ title: "Expense created successfully" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: expensesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: "Expense deleted" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      category: fd.get("category") as string,
      amount: Number(fd.get("amount")),
      description: fd.get("description") as string,
      payment_mode: fd.get("payment_mode") as string || "cash",
    });
  };

  const filtered = expenses.filter((ex: any) =>
    ex.category?.toLowerCase().includes(search.toLowerCase()) ||
    ex.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Track and manage business expenses">
        <CreateDialog title="New Expense" buttonLabel="New Expense" open={open} onOpenChange={setOpen}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Category *</Label><Input name="category" required /></div>
            <div className="space-y-2"><Label>Amount *</Label><Input name="amount" type="number" step="0.01" required /></div>
            <div className="space-y-2"><Label>Description</Label><Input name="description" /></div>
            <div className="space-y-2"><Label>Payment Mode</Label><Input name="payment_mode" placeholder="cash" /></div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Expense"}
            </Button>
          </form>
        </CreateDialog>
      </PageHeader>
      <DataToolbar searchPlaceholder="Search expenses..." onSearch={setSearch} />

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No expenses yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Vendor</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Description</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ex: any) => (
                  <tr key={ex.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-muted-foreground">{ex.date}</td>
                    <td className="px-5 py-3 font-medium text-card-foreground">{ex.category}</td>
                    <td className="px-5 py-3 text-card-foreground">{ex.vendors?.name || "—"}</td>
                    <td className="px-5 py-3 text-right font-medium text-card-foreground">₹{Number(ex.amount).toLocaleString()}</td>
                    <td className="px-5 py-3 text-muted-foreground">{ex.description || "—"}</td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => {
                        if (confirm("Delete?")) deleteMutation.mutate(ex.id);
                      }}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
