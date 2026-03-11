import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { journalEntriesApi, accountsApi } from "@/lib/api";

export default function TrialBalancePage() {
  const { data: entries = [] } = useQuery({ queryKey: ["journal_entries"], queryFn: journalEntriesApi.list });
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: accountsApi.list });

  const balances = accounts.map((acc: any) => {
    let debit = 0, credit = 0;
    entries.forEach((e: any) => {
      e.journal_entry_lines?.forEach((l: any) => {
        if (l.account_id === acc.id) { debit += Number(l.debit); credit += Number(l.credit); }
      });
    });
    return { ...acc, totalDebit: debit + (["asset", "expense"].includes(acc.account_type) ? Number(acc.balance) : 0), totalCredit: credit + (["liability", "equity", "income"].includes(acc.account_type) ? Number(acc.balance) : 0) };
  }).filter((a: any) => a.totalDebit > 0 || a.totalCredit > 0);

  const totalDr = balances.reduce((s: number, a: any) => s + a.totalDebit, 0);
  const totalCr = balances.reduce((s: number, a: any) => s + a.totalCredit, 0);

  return (
    <div>
      <PageHeader title="Trial Balance" subtitle="Account balances summary" />
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Code</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Account</th>
            <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Debit</th>
            <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Credit</th>
          </tr></thead>
          <tbody>
            {balances.length === 0 ? (
              <tr><td colSpan={4} className="p-12 text-center text-muted-foreground">No data yet.</td></tr>
            ) : (<>
              {balances.map((a: any) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{a.code}</td>
                  <td className="px-5 py-3 text-card-foreground">{a.name}</td>
                  <td className="px-5 py-3 text-right font-medium text-card-foreground">{a.totalDebit > 0 ? `₹${a.totalDebit.toLocaleString()}` : "—"}</td>
                  <td className="px-5 py-3 text-right font-medium text-card-foreground">{a.totalCredit > 0 ? `₹${a.totalCredit.toLocaleString()}` : "—"}</td>
                </tr>
              ))}
              <tr className="bg-muted/50 font-bold">
                <td colSpan={2} className="px-5 py-3 text-card-foreground">Total</td>
                <td className="px-5 py-3 text-right text-card-foreground">₹{totalDr.toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-card-foreground">₹{totalCr.toLocaleString()}</td>
              </tr>
            </>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
