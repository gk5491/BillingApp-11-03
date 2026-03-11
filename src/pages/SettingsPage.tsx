import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Building2, Users, Receipt, FileText, ArrowLeft, Trash2, Star, Edit2, Check, X } from "lucide-react";
import { gstSettingsApi, taxRatesApi, documentSequencesApi, userRolesApi } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Section = null | "organization" | "users" | "taxes" | "invoice";

export default function SettingsPage() {
  const [section, setSection] = useState<Section>(null);

  if (section) {
    return (
      <div>
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => setSection(null)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
        </Button>
        {section === "organization" && <OrganizationSection />}
        {section === "users" && <UsersSection />}
        {section === "taxes" && <TaxesSection />}
        {section === "invoice" && <InvoiceSettingsSection />}
      </div>
    );
  }

  const sections = [
    { key: "organization" as Section, icon: Building2, label: "Organization", desc: "Company details, GSTIN, address" },
    { key: "users" as Section, icon: Users, label: "Users & Roles", desc: "Manage team and permissions" },
    { key: "taxes" as Section, icon: Receipt, label: "Taxes", desc: "GST slabs and tax configuration" },
    { key: "invoice" as Section, icon: FileText, label: "Invoice Settings", desc: "Document numbering and prefixes" },
  ];

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure your accounting system" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button key={s.key} onClick={() => setSection(s.key)} className="bg-card rounded-xl border border-border p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-accent group-hover:bg-primary/10 transition-colors">
                  <Icon className="w-5 h-5 text-accent-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-card-foreground">{s.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ===== Organization =====
function OrganizationSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: gst, isLoading } = useQuery({ queryKey: ["gst_settings"], queryFn: gstSettingsApi.get });
  const [form, setForm] = useState<any>(null);

  const currentForm = form || gst || {};
  const updateField = (field: string, value: any) => setForm({ ...currentForm, [field]: value });

  const saveMutation = useMutation({
    mutationFn: (data: any) => gstSettingsApi.upsert(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["gst_settings"] }); toast({ title: "Settings saved" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  if (isLoading) return <div className="text-center text-muted-foreground py-12">Loading...</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4 font-display">Organization Settings</h2>
      <div className="bg-card border border-border rounded-xl p-6 space-y-4 max-w-lg">
        <div className="space-y-2"><Label>Legal Name</Label><Input value={currentForm.legal_name || ""} onChange={e => updateField("legal_name", e.target.value)} /></div>
        <div className="space-y-2"><Label>Trade Name</Label><Input value={currentForm.trade_name || ""} onChange={e => updateField("trade_name", e.target.value)} /></div>
        <div className="space-y-2"><Label>GSTIN</Label><Input value={currentForm.gstin || ""} onChange={e => updateField("gstin", e.target.value)} placeholder="22AAAAA0000A1Z5" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>State</Label><Input value={currentForm.state || ""} onChange={e => updateField("state", e.target.value)} /></div>
          <div className="space-y-2"><Label>State Code</Label><Input value={currentForm.state_code || ""} onChange={e => updateField("state_code", e.target.value)} /></div>
        </div>
        <Button onClick={() => saveMutation.mutate(currentForm)} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

// ===== Users =====
function UsersSection() {
  const { data: roles = [], isLoading } = useQuery({ queryKey: ["user_roles"], queryFn: userRolesApi.list });

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4 font-display">Users & Roles</h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading...</div>
        ) : roles.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/40">
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
            </tr></thead>
            <tbody>
              {roles.map((r: any) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-5 py-2.5 text-card-foreground">{(r as any).profiles?.display_name || "—"}</td>
                  <td className="px-5 py-2.5 text-muted-foreground">{(r as any).profiles?.email || "—"}</td>
                  <td className="px-5 py-2.5"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">{r.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ===== Taxes (Full GST Slab Management) =====
function TaxesSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: taxes = [], isLoading } = useQuery({ queryKey: ["tax_rates"], queryFn: taxRatesApi.list });
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const cgst = Number(rate) / 2;
  const sgst = Number(rate) / 2;
  const igst = Number(rate);

  const createMutation = useMutation({
    mutationFn: () => taxRatesApi.create({
      name: name || `GST ${rate}%`,
      rate: Number(rate),
      tax_type: "GST",
      cgst,
      sgst,
      igst,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax_rates"] });
      setName(""); setRate(""); setShowAdd(false);
      toast({ title: "Tax slab added" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: taxRatesApi.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tax_rates"] }); toast({ title: "Tax slab deleted" }); },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      // Unset all defaults first, then set the new one
      for (const t of taxes) {
        if ((t as any).is_default) {
          await taxRatesApi.update((t as any).id, { is_default: false });
        }
      }
      await taxRatesApi.update(id, { is_default: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax_rates"] });
      toast({ title: "Default tax slab updated" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => taxRatesApi.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tax_rates"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground font-display">Tax Rates (GST Slabs)</h2>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "Cancel" : "+ Add Tax Slab"}
        </Button>
      </div>

      {showAdd && (
        <div className="bg-card border border-border rounded-xl p-5 mb-4 max-w-lg">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">New GST Slab</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Slab Name</Label>
              <Input placeholder="e.g. GST 18%" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Rate (%)</Label>
              <Input placeholder="18" type="number" value={rate} onChange={e => setRate(e.target.value)} />
            </div>
          </div>
          {rate && Number(rate) > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 mb-3 text-xs space-y-1">
              <p className="font-medium text-card-foreground">Auto-calculated split:</p>
              <div className="flex gap-4 text-muted-foreground">
                <span>CGST: {cgst}%</span>
                <span>SGST: {sgst}%</span>
                <span>IGST: {igst}%</span>
              </div>
            </div>
          )}
          <Button size="sm" onClick={() => createMutation.mutate()} disabled={!rate || createMutation.isPending}>
            {createMutation.isPending ? "Adding..." : "Add Slab"}
          </Button>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground mt-2">Loading…</p>
          </div>
        ) : taxes.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No tax slabs configured. Add your first GST slab.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tax Name</th>
                <th className="text-right px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Rate</th>
                <th className="text-right px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">CGST</th>
                <th className="text-right px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">SGST</th>
                <th className="text-right px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">IGST</th>
                <th className="text-center px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Default</th>
                <th className="text-center px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active</th>
                <th className="text-right px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {taxes.map((t: any) => (
                <TaxSlabRow
                  key={t.id}
                  tax={t}
                  onSetDefault={() => setDefaultMutation.mutate(t.id)}
                  onToggleActive={(active: boolean) => toggleActiveMutation.mutate({ id: t.id, is_active: active })}
                  onDelete={() => { if (confirm("Delete this tax slab?")) deleteMutation.mutate(t.id); }}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TaxSlabRow({ tax, onSetDefault, onToggleActive, onDelete }: {
  tax: any;
  onSetDefault: () => void;
  onToggleActive: (active: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="font-medium text-card-foreground">{tax.name}</span>
          {tax.is_default && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
              <Star className="w-2.5 h-2.5" /> Default
            </span>
          )}
        </div>
      </td>
      <td className="px-5 py-2.5 text-right font-medium text-card-foreground">{tax.rate}%</td>
      <td className="px-5 py-2.5 text-right text-muted-foreground">{tax.cgst ?? (tax.rate / 2)}%</td>
      <td className="px-5 py-2.5 text-right text-muted-foreground">{tax.sgst ?? (tax.rate / 2)}%</td>
      <td className="px-5 py-2.5 text-right text-muted-foreground">{tax.igst ?? tax.rate}%</td>
      <td className="px-5 py-2.5 text-center">
        {!tax.is_default && (
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-primary" onClick={onSetDefault}>
            Set Default
          </Button>
        )}
      </td>
      <td className="px-5 py-2.5 text-center">
        <Switch checked={tax.is_active} onCheckedChange={onToggleActive} />
      </td>
      <td className="px-5 py-2.5 text-right">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onDelete}>
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </Button>
      </td>
    </tr>
  );
}

// ===== Invoice Settings =====
function InvoiceSettingsSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: sequences = [], isLoading } = useQuery({ queryKey: ["document_sequences"], queryFn: documentSequencesApi.list });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: any) => documentSequencesApi.update(id, updates),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["document_sequences"] }); toast({ title: "Sequence updated" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4 font-display">Document Number Series</h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? <div className="p-8 text-center text-muted-foreground">Loading...</div> : sequences.length === 0 ? <div className="p-8 text-center text-muted-foreground">No sequences configured.</div> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/40">
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Document Type</th>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Prefix</th>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Next #</th>
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Padding</th>
              <th className="text-right px-5 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"></th>
            </tr></thead>
            <tbody>{sequences.map((s: any) => (
              <SequenceRow key={s.id} seq={s} onSave={(id: string, updates: any) => updateMutation.mutate({ id, updates })} />
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function SequenceRow({ seq, onSave }: { seq: any; onSave: (id: string, updates: any) => void }) {
  const [prefix, setPrefix] = useState(seq.prefix);
  const [nextNum, setNextNum] = useState(seq.next_number);
  const [padding, setPadding] = useState(seq.padding);
  const changed = prefix !== seq.prefix || nextNum !== seq.next_number || padding !== seq.padding;

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-5 py-2.5 text-card-foreground capitalize">{seq.document_type.replace(/_/g, " ")}</td>
      <td className="px-5 py-2"><Input className="h-8 w-24" value={prefix} onChange={e => setPrefix(e.target.value)} /></td>
      <td className="px-5 py-2"><Input className="h-8 w-20" type="number" value={nextNum} onChange={e => setNextNum(Number(e.target.value))} /></td>
      <td className="px-5 py-2"><Input className="h-8 w-16" type="number" value={padding} onChange={e => setPadding(Number(e.target.value))} /></td>
      <td className="px-5 py-2 text-right">
        {changed && <Button size="sm" className="h-7 text-xs" onClick={() => onSave(seq.id, { prefix, next_number: nextNum, padding })}>Save</Button>}
      </td>
    </tr>
  );
}
