import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { accountsApi } from "@/lib/api";

export default function ProfitLossPage() {
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: accountsApi.list });
  const income = accounts.filter((a: any) => a.account_type === "income");
  const expense = accounts.filter((a: any) => a.account_type === "expense");
  const totalIncome = income.reduce((s: number, a: any) => s + Number(a.balance), 0);
  const totalExpense = expense.reduce((s: number, a: any) => s + Number(a.balance), 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div>
      <PageHeader title="Profit & Loss" subtitle="Income and expense statement" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border">
          <div className="px-5 py-4 border-b border-border"><h3 className="text-sm font-semibold text-card-foreground">Income</h3></div>
          {income.length === 0 ? <div className="p-8 text-center text-muted-foreground text-sm">No income accounts.</div> : (
            <div className="divide-y divide-border">
              {income.map((a: any) => (
                <div key={a.id} className="flex justify-between px-5 py-3">
                  <span className="text-sm text-card-foreground">{a.name}</span>
                  <span className="text-sm font-medium text-card-foreground">₹{Number(a.balance).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between px-5 py-3 bg-muted/50 font-bold">
                <span className="text-sm text-card-foreground">Total Income</span>
                <span className="text-sm text-card-foreground">₹{totalIncome.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
        <div className="bg-card rounded-lg border border-border">
          <div className="px-5 py-4 border-b border-border"><h3 className="text-sm font-semibold text-card-foreground">Expenses</h3></div>
          {expense.length === 0 ? <div className="p-8 text-center text-muted-foreground text-sm">No expense accounts.</div> : (
            <div className="divide-y divide-border">
              {expense.map((a: any) => (
                <div key={a.id} className="flex justify-between px-5 py-3">
                  <span className="text-sm text-card-foreground">{a.name}</span>
                  <span className="text-sm font-medium text-card-foreground">₹{Number(a.balance).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between px-5 py-3 bg-muted/50 font-bold">
                <span className="text-sm text-card-foreground">Total Expenses</span>
                <span className="text-sm text-card-foreground">₹{totalExpense.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={`mt-6 p-5 rounded-lg border border-border ${netProfit >= 0 ? "bg-primary/5" : "bg-destructive/5"}`}>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-card-foreground">{netProfit >= 0 ? "Net Profit" : "Net Loss"}</span>
          <span className={`text-2xl font-bold ${netProfit >= 0 ? "text-primary" : "text-destructive"}`}>₹{Math.abs(netProfit).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
