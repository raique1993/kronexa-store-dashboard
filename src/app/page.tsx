"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const TID = process.env.NEXT_PUBLIC_TENANT_ID || "b2c3d4e5-0001-0000-0000-000000000001";
const P = "#6C3FE8"; const C = "#00E5FF"; const G = "#22c55e"; const R = "#f87171"; const O = "#FF6B35";

function Card({ label, val, sub, color = P, badge }: any) {
  return (
    <div style={{ background: "#12122A", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: 20, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color }} />
      <div style={{ fontSize: 11, color: "#505070", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {label}
        {badge && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 100, background: badge > 0 ? "rgba(34,197,94,.1)" : "rgba(239,68,68,.1)", color: badge > 0 ? G : R }}>{badge > 0 ? "+" : ""}{badge}%</span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>{val}</div>
      {sub && <div style={{ fontSize: 11, color: "#505070" }}>{sub}</div>}
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<any>({ vendas: 0, pedidos: 0, clientes: 0, nps: "—", criticos: 0 });
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [periodo, setPeriodo] = useState("hoje");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [periodo]);

  async function load() {
    setLoading(true);
    const hoje = new Date().toISOString().split("T")[0];
    const d7 = new Date(Date.now() - 7*864e5).toISOString();
    const d30 = new Date(Date.now() - 30*864e5).toISOString();
    const desde = periodo === "hoje" ? hoje+"T00:00:00" : periodo === "semana" ? d7 : d30;

    const [{ data: peds }, { data: clts }, { data: prods }, { data: npsD }] = await Promise.all([
      sb.from("ks_pedidos").select("total,status,criado_em,nome_cliente,telefone_cliente,forma_pagamento").eq("tenant_id", TID).gte("criado_em", desde).order("criado_em", { ascending: false }),
      sb.from("ks_clientes").select("id", { count: "exact" }).eq("tenant_id", TID).gte("criado_em", desde),
      sb.from("ks_produtos").select("nome,vendas_total,preco,estoque_atual,estoque_minimo,categoria").eq("tenant_id", TID).eq("ativo", true).order("vendas_total", { ascending: false }).limit(5),
      sb.from("ks_avaliacoes_nps").select("nota").eq("tenant_id", TID).gte("criado_em", desde).eq("status", "RESPONDIDO"),
    ]);

    const ok = (peds || []).filter((p: any) => !["PENDENTE","CANCELADO"].includes(p.status));
    const rec = ok.reduce((s: number, p: any) => s + (p.total || 0), 0);
    const nps = npsD?.length ? (npsD.reduce((s: number, n: any) => s + n.nota, 0) / npsD.length).toFixed(1) : "—";
    const crit = (prods || []).filter((p: any) => p.estoque_atual <= p.estoque_minimo).length;

    setData({ vendas: rec, pedidos: ok.length, clientes: clts?.length || 0, nps, criticos: crit });
    setPedidos((peds || []).slice(0, 8));
    setProdutos(prods || []);
    setLoading(false);
  }

  const chartData = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map(d => ({ name: d, v: Math.floor(Math.random()*4000+500) }));
  const stCls: any = { PENDENTE: O, APROVADO: G, SEPARANDO: "#93c5fd", PRONTO: "#c4b5fd", ENTREGUE: G, CANCELADO: R };

  return (
    <div style={{ background: "#08081A", minHeight: "100vh", color: "#F0F0FF", fontFamily: "-apple-system,sans-serif", WebkitFontSmoothing: "antialiased" }}>
      {/* NAV */}
      <nav style={{ background: "#12122A", borderBottom: "1px solid rgba(255,255,255,.08)", height: 56, display: "flex", alignItems: "center", padding: "0 20px", gap: 10, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: .5 }}>KRO<span style={{ color: P }}>NEXA</span></div>
        <div style={{ fontSize: 10, fontWeight: 700, background: "rgba(108,63,232,.2)", color: P, padding: "2px 8px", borderRadius: 100 }}>STORE</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
          {[["Dashboard","/"],["Atend.","https://store.kronexa.com.br/portal-atendente.html"],["Estoque","https://store.kronexa.com.br/portal-estoque.html"],["Financeiro","https://store.kronexa.com.br/portal-financeiro.html"],["Marketing","https://store.kronexa.com.br/portal-marketing.html"]].map(([n,h]) => (
            <a key={n} href={h} style={{ padding: "6px 11px", borderRadius: 7, fontSize: 12, color: n==="Dashboard" ? "#F0F0FF" : "#9090b0", background: n==="Dashboard" ? "rgba(108,63,232,.15)" : "transparent" }}>{n}</a>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
        {/* TOOLBAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -.5 }}>Dashboard</h1>
            <div style={{ fontSize: 13, color: "#9090b0", marginTop: 2 }}>{new Date().toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long" })}</div>
          </div>
          <div style={{ display: "flex", gap: 3, background: "#1a1a35", borderRadius: 8, padding: 3 }}>
            {["hoje","semana","mês"].map(t => (
              <button key={t} onClick={() => setPeriodo(t)} style={{ padding: "5px 13px", border: "none", cursor: "pointer", borderRadius: 6, fontSize: 12, fontWeight: periodo===t ? 700 : 500, background: periodo===t ? "#12122A" : "transparent", color: periodo===t ? "#F0F0FF" : "#9090b0", transition: "all .2s" }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
            ))}
          </div>
        </div>

        {/* MÉTRICAS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12, marginBottom: 20 }}>
          <Card label="Receita" val={loading ? "..." : `R$ ${data.vendas.toFixed(0)}`} sub={`${data.pedidos} pedidos`} color={G} badge={12} />
          <Card label="Clientes novos" val={loading ? "..." : data.clientes} sub="no período" color={P} badge={8} />
          <Card label="NPS médio" val={loading ? "..." : data.nps} sub="satisfação" color={C} badge={3} />
          <Card label="Ticket médio" val={loading ? "..." : data.pedidos > 0 ? `R$ ${(data.vendas/data.pedidos).toFixed(0)}` : "—"} sub="por pedido" color={O} badge={-2} />
          <Card label="Estoque crítico" val={loading ? "..." : data.criticos} sub="precisam reposição" color={data.criticos > 0 ? R : G} />
        </div>

        {/* GRÁFICO + TOP PRODUTOS */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
          <div style={{ background: "#12122A", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Vendas da semana</div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: "#505070", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#505070", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1a1a35", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="v" fill={P} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: "#12122A", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🏆 Top Produtos</div>
            {produtos.length === 0 && <div style={{ fontSize: 12, color: "#505070", textAlign: "center", padding: 24 }}>Execute o SQL para ver produtos</div>}
            {produtos.map((p: any, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: i < produtos.length-1 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                <span style={{ fontSize: 14 }}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{p.nome}</div>
                  <div style={{ fontSize: 10, color: "#505070" }}>{p.vendas_total || 0} vendas · {p.categoria}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: G }}>R$ {p.preco}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PEDIDOS */}
        <div style={{ background: "#12122A", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: "1px solid rgba(255,255,255,.06)", fontSize: 13, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Pedidos recentes
            <a href="https://store.kronexa.com.br/portal-atendente.html" style={{ fontSize: 11, color: P }}>Gerenciar →</a>
          </div>
          {pedidos.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#505070", fontSize: 13 }}>
              Nenhum pedido ainda.<br />Configure o WhatsApp e comece a vender!
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["#","Cliente","Total","Pagto","Status","Hora"].map(h => <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#505070", textTransform: "uppercase", letterSpacing: .5, background: "#1a1a35" }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {pedidos.map((p: any, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "#505070" }}>#{p.numero_pedido || i+1}</td>
                    <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>{p.nome_cliente || p.telefone_cliente || "—"}</td>
                    <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 700, color: G }}>R$ {(p.total||0).toFixed(2)}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "#9090b0" }}>{p.forma_pagamento || "PIX"}</td>
                    <td style={{ padding: "10px 16px" }}><span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 10, fontWeight: 700, background: `${stCls[p.status]}22`, color: stCls[p.status] }}>{p.status}</span></td>
                    <td style={{ padding: "10px 16px", fontSize: 11, color: "#505070" }}>{new Date(p.criado_em).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
