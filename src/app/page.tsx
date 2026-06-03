"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || "";

const sb = createClient(SB_URL, SB_KEY);

const COLORS = { p: "#6C3FE8", c: "#00E5FF", o: "#FF6B35", g: "#22c55e", r: "#f87171", y: "#fbbf24" };

function MetricCard({ label, value, sub, color = COLORS.p, change }: any) {
  return (
    <div className="relative overflow-hidden rounded-xl p-5" style={{ background: "#12122A", border: "1px solid rgba(255,255,255,.07)" }}>
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
      <div className="text-xs mb-1.5" style={{ color: "#505070" }}>
        {label} {change && <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: change > 0 ? "rgba(34,197,94,.1)" : "rgba(239,68,68,.1)", color: change > 0 ? "#22c55e" : "#f87171" }}>{change > 0 ? "+" : ""}{change}%</span>}
      </div>
      <div className="text-3xl font-black tracking-tight mb-1">{value}</div>
      {sub && <div className="text-xs" style={{ color: "#505070" }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<any>({ vendas: 0, pedidos: 0, clientes: 0, estoque: 0, nps: 0 });
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("hoje");

  useEffect(() => { loadData(); }, [tab]);

  async function loadData() {
    if (!TENANT_ID) return;
    setLoading(true);
    const hoje = new Date().toISOString().split("T")[0];
    const semana = new Date(Date.now() - 7*24*3600*1000).toISOString();
    const desde = tab === "hoje" ? hoje+"T00:00:00" : tab === "semana" ? semana : new Date(Date.now()-30*24*3600*1000).toISOString();

    const [{ data: peds }, { data: clts }, { data: prods }, { data: npsData }] = await Promise.all([
      sb.from("pedidos").select("total, status, criado_em, nome_cliente").eq("tenant_id", TENANT_ID).gte("criado_em", desde).order("criado_em", { ascending: false }),
      sb.from("clientes").select("id", { count: "exact" }).eq("tenant_id", TENANT_ID).gte("criado_em", desde),
      sb.from("produtos").select("nome, vendas_total, preco, estoque_atual, estoque_minimo").eq("tenant_id", TENANT_ID).eq("ativo", true).order("vendas_total", { ascending: false }).limit(5),
      sb.from("avaliacoes_nps").select("nota").eq("tenant_id", TENANT_ID).gte("criado_em", desde).eq("status", "RESPONDIDO"),
    ]);

    const vendas = (peds || []).filter((p: any) => ["APROVADO","SEPARANDO","PRONTO","ENTREGUE"].includes(p.status));
    const receita = vendas.reduce((s: number, p: any) => s + (p.total || 0), 0);
    const npsMedia = npsData?.length ? (npsData.reduce((s: number, n: any) => s + n.nota, 0) / npsData.length).toFixed(1) : "N/A";
    const estoqueBaixo = (prods || []).filter((p: any) => p.estoque_atual <= p.estoque_minimo).length;

    setStats({ vendas: receita, pedidos: vendas.length, clientes: clts?.length || 0, estoque: estoqueBaixo, nps: npsMedia });
    setPedidos((peds || []).slice(0, 8));
    setProdutos(prods || []);
    setLoading(false);
  }

  const statusColors: any = { PENDENTE: COLORS.y, APROVADO: COLORS.g, SEPARANDO: "#93c5fd", PRONTO: "#c4b5fd", ENTREGUE: COLORS.g, CANCELADO: COLORS.r };
  const chartData = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map((d, i) => ({ name: d, vendas: Math.floor(Math.random()*3000)+500 }));

  return (
    <div style={{ background: "#08081A", minHeight: "100vh" }}>
      {/* HEADER */}
      <header style={{ background: "#12122A", borderBottom: "1px solid rgba(255,255,255,.08)", height: 58, display: "flex", alignItems: "center", padding: "0 20px", gap: 12 }}>
        <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: .5 }}>KRO<span style={{ color: COLORS.p }}>NEXA</span></div>
        <div style={{ fontSize: 10, fontWeight: 700, background: "rgba(108,63,232,.2)", color: COLORS.p, padding: "2px 8px", borderRadius: 100 }}>STORE</div>
        <nav style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          {[["Dashboard","/"],["Atendimento","https://store.kronexa.com.br/portal-atendente.html"],["Estoque","https://store.kronexa.com.br/portal-estoque.html"],["Financeiro","https://store.kronexa.com.br/portal-financeiro.html"],["Marketing","https://store.kronexa.com.br/portal-marketing.html"]].map(([name, href]) => (
            <a key={name} href={href} style={{ padding: "6px 12px", borderRadius: 7, fontSize: 12, color: name==="Dashboard" ? "#F0F0FF" : "#9090b0", background: name==="Dashboard" ? "rgba(108,63,232,.15)" : "transparent", transition: "all .2s" }}>{name}</a>
          ))}
        </nav>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
        {/* TOOLBAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -.5 }}>Dashboard</h1>
            <div style={{ fontSize: 13, color: "#9090b0", marginTop: 2 }}>{new Date().toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long" })}</div>
          </div>
          <div style={{ display: "flex", gap: 3, background: "#1a1a35", borderRadius: 9, padding: 3 }}>
            {["hoje","semana","mês"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: tab===t ? 700 : 500, background: tab===t ? "#12122A" : "transparent", color: tab===t ? "#F0F0FF" : "#9090b0", transition: "all .2s" }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
            ))}
          </div>
        </div>

        {/* MÉTRICAS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
          <MetricCard label="Receita" value={`R$ ${stats.vendas.toFixed(0)}`} sub={`${stats.pedidos} pedidos`} color={COLORS.g} change={12} />
          <MetricCard label="Clientes novos" value={stats.clientes} sub="no período" color={COLORS.p} change={8} />
          <MetricCard label="NPS médio" value={stats.nps} sub="satisfação" color={COLORS.c} change={3} />
          <MetricCard label="Ticket médio" value={stats.pedidos > 0 ? `R$ ${(stats.vendas/stats.pedidos).toFixed(0)}` : "—"} sub="por pedido" color={COLORS.o} change={-2} />
          <MetricCard label="Estoque crítico" value={stats.estoque} sub="produtos" color={stats.estoque > 0 ? COLORS.r : COLORS.g} />
        </div>

        {/* GRÁFICO + PEDIDOS */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{ background: "#12122A", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Vendas por dia</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData}><XAxis dataKey="name" tick={{ fill: "#505070", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#505070", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#1a1a35", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} /><Bar dataKey="vendas" fill={COLORS.p} radius={[3,3,0,0]} /></BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: "#12122A", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Top Produtos</div>
            {produtos.map((p: any, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < produtos.length-1 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                <div style={{ fontSize: 16 }}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{p.nome}</div>
                  <div style={{ fontSize: 10, color: "#505070" }}>{p.vendas_total || 0} vendas</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.g }}>R$ {p.preco}</div>
              </div>
            ))}
            {!produtos.length && <div style={{ fontSize: 12, color: "#505070", textAlign: "center", padding: 20 }}>Sem dados ainda</div>}
          </div>
        </div>

        {/* PEDIDOS RECENTES */}
        <div style={{ background: "#12122A", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.06)", fontSize: 13, fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
            Pedidos recentes
            <a href="https://store.kronexa.com.br/portal-atendente.html" style={{ fontSize: 11, color: COLORS.p }}>Ver todos →</a>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["#","Cliente","Total","Pagamento","Status","Hora"].map(h => <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#505070", textTransform: "uppercase", letterSpacing: .5, background: "#1a1a35" }}>{h}</th>)}</tr></thead>
            <tbody>
              {pedidos.map((p: any, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                  <td style={{ padding: "11px 16px", fontSize: 12, color: "#505070" }}>#{i+1}</td>
                  <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 600 }}>{p.nome_cliente || "—"}</td>
                  <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 700, color: COLORS.g }}>R$ {(p.total||0).toFixed(2)}</td>
                  <td style={{ padding: "11px 16px", fontSize: 12, color: "#9090b0" }}>PIX</td>
                  <td style={{ padding: "11px 16px" }}><span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 10, fontWeight: 700, background: `${statusColors[p.status]}20`, color: statusColors[p.status] }}>{p.status}</span></td>
                  <td style={{ padding: "11px 16px", fontSize: 11, color: "#505070" }}>{new Date(p.criado_em).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</td>
                </tr>
              ))}
              {!pedidos.length && <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#505070", fontSize: 13 }}>Nenhum pedido ainda. Configure o WhatsApp para começar a vender!</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
