import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Receipt, CreditCard, ArrowUpRight, FileCheck } from "lucide-react";
import { accountsApi } from "@/lib/api";

const typeColors: Record<string, string> = {
  asset: "text-primary",
  liability: "text-warning",
  equity: "text-success",
  income: "text-success",
  expense: "text-destructive",
};

export default function ChartOfAccountsPage() {
  const { data: accounts = [], isLoading } = useQuery({ queryKey: ["accounts"], queryFn: accountsApi.list });

  const totals = {
    asset: accounts.filter((a: any) => a.account_type === "asset").reduce((s: number, a: any) => s + Number(a.balance), 0),
    liability: accounts.filter((a: any) => a.account_type === "liability").reduce((s: number, a: any) => s + Number(a.balance), 0),
    income: accounts.filter((a: any) => a.account_type === "income").reduce((s: number, a: any) => s + Number(a.balance), 0),
    expense: accounts.filter((a: any) => a.account_type === "expense").reduce((s: number, a: any) => s + Number(a.balance), 0),
  };

  return (
    <div>
      <PageHeader title="Chart of Accounts" subtitle="View and manage account structure" action={{ label: "New Account", onClick: () => {} }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Assets" value={`₹${totals.asset.toLocaleString()}`} icon={ArrowUpRight} />
        <StatCard title="Total Liabilities" value={`₹${totals.liability.toLocaleString()}`} icon={Receipt} />
        <StatCard title="Total Income" value={`₹${totals.income.toLocaleString()}`} icon={CreditCard} />
        <StatCard title="Total Expense" value={`₹${totals.expense.toLocaleString()}`} icon={FileCheck} />
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Code</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Account Name</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Balance</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc: any) => (
                  <tr key={acc.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{acc.code}</td>
                    <td className="px-5 py-3 font-medium text-card-foreground">{acc.name}</td>
                    <td className={`px-5 py-3 font-medium text-xs capitalize ${typeColors[acc.account_type] || ""}`}>{acc.account_type}</td>
                    <td className="px-5 py-3 text-right font-medium text-card-foreground">₹{Number(acc.balance).toLocaleString()}</td>
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
