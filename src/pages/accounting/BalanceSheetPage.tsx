import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { accountsApi } from "@/lib/api";

export default function BalanceSheetPage() {
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: accountsApi.list });
  const assets = accounts.filter((a: any) => a.account_type === "asset");
  const liabilities = accounts.filter((a: any) => a.account_type === "liability");
  const equity = accounts.filter((a: any) => a.account_type === "equity");
  const totalAssets = assets.reduce((s: number, a: any) => s + Number(a.balance), 0);
  const totalLiabilities = liabilities.reduce((s: number, a: any) => s + Number(a.balance), 0);
  const totalEquity = equity.reduce((s: number, a: any) => s + Number(a.balance), 0);

  const Section = ({ title, items, total }: { title: string; items: any[]; total: number }) => (
    <div className="bg-card rounded-lg border border-border">
      <div className="px-5 py-4 border-b border-border"><h3 className="text-sm font-semibold text-card-foreground">{title}</h3></div>
      {items.length === 0 ? <div className="p-8 text-center text-muted-foreground text-sm">No accounts.</div> : (
        <div className="divide-y divide-border">
          {items.map((a: any) => (
            <div key={a.id} className="flex justify-between px-5 py-3">
              <span className="text-sm text-card-foreground">{a.name}</span>
              <span className="text-sm font-medium text-card-foreground">₹{Number(a.balance).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between px-5 py-3 bg-muted/50 font-bold">
            <span className="text-sm text-card-foreground">Total {title}</span>
            <span className="text-sm text-card-foreground">₹{total.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader title="Balance Sheet" subtitle="Financial position statement" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Assets" items={assets} total={totalAssets} />
        <div className="space-y-6">
          <Section title="Liabilities" items={liabilities} total={totalLiabilities} />
          <Section title="Equity" items={equity} total={totalEquity} />
        </div>
      </div>
    </div>
  );
}
