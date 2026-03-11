import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { journalEntriesApi } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

export default function JournalEntriesPage() {
  const { data: entries = [], isLoading } = useQuery({ queryKey: ["journal_entries"], queryFn: journalEntriesApi.list });

  return (
    <div>
      <PageHeader title="Journal Entries" subtitle="Manual journal entries" action={{ label: "New Entry", onClick: () => {} }} />

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No journal entries yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Entry #</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Description</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Debit</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Credit</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e: any) => {
                  const totalDebit = e.journal_entry_lines?.reduce((s: number, l: any) => s + Number(l.debit), 0) || 0;
                  const totalCredit = e.journal_entry_lines?.reduce((s: number, l: any) => s + Number(l.credit), 0) || 0;
                  return (
                    <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-primary">{e.document_number}</td>
                      <td className="px-5 py-3 text-muted-foreground">{e.date}</td>
                      <td className="px-5 py-3"><StatusBadge status={e.journal_type} /></td>
                      <td className="px-5 py-3 text-card-foreground">{e.description || "—"}</td>
                      <td className="px-5 py-3 text-right font-medium text-card-foreground">₹{totalDebit.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right font-medium text-card-foreground">₹{totalCredit.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
