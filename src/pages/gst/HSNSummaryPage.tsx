import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api-client";

export default function HSNSummaryPage() {
  const { data: invoiceItems = [], isLoading } = useQuery({
    queryKey: ["hsn_summary"],
    queryFn: () => api.get<any[]>("/invoice-items"),
  });

  const hsnMap: Record<string, { hsn: string; count: number; taxable: number; tax: number; total: number }> = {};
  invoiceItems.forEach((item: any) => {
    const hsn = item.items?.hsn_code || item.items?.hsnCode || "N/A";
    if (!hsnMap[hsn]) hsnMap[hsn] = { hsn, count: 0, taxable: 0, tax: 0, total: 0 };
    hsnMap[hsn].count += Number(item.quantity);
    hsnMap[hsn].taxable += Number(item.amount);
    hsnMap[hsn].tax += Number(item.tax_amount || item.taxAmount);
    hsnMap[hsn].total += Number(item.amount) + Number(item.tax_amount || item.taxAmount);
  });

  const rows = Object.values(hsnMap).sort((a, b) => b.total - a.total);

  return (
    <div>
      <PageHeader title="HSN Summary" subtitle="HSN-wise tax summary from invoices" />
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading ? <div className="p-12 text-center text-muted-foreground">Loading...</div> : rows.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No invoice data to summarize.</div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">HSN Code</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Qty</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Taxable Value</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Tax</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Total</th>
            </tr></thead>
            <tbody>{rows.map(r => (
              <tr key={r.hsn} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-5 py-3 font-medium text-card-foreground">{r.hsn}</td>
                <td className="px-5 py-3 text-right text-muted-foreground">{r.count}</td>
                <td className="px-5 py-3 text-right text-card-foreground">₹{r.taxable.toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-muted-foreground">₹{r.tax.toLocaleString()}</td>
                <td className="px-5 py-3 text-right font-medium text-card-foreground">₹{r.total.toLocaleString()}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
