"use client"

import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type Props = {
  activeMembers: number
  referralsThisMonth: number
  thankYousThisMonth: number
  labels: string[]
  referralsSeries: number[]
  thankYousSeries: number[]
}

export default function DashboardClient({
  activeMembers,
  referralsThisMonth,
  thankYousThisMonth,
  labels,
  referralsSeries,
  thankYousSeries,
}: Props) {
  const data = {
    labels,
    datasets: [
      {
        label: "Indicações",
        data: referralsSeries,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: "Obrigados",
        data: thankYousSeries,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Últimos meses" },
    },
  }

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 12 }}>Dashboard de Performance</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <div style={{ padding: 12, borderRadius: 8, background: "#0b1220", color: "#fff", minWidth: 180 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Membros ativos</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{activeMembers}</div>
        </div>

        <div style={{ padding: 12, borderRadius: 8, background: "#07122a", color: "#fff", minWidth: 220 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Indicações este mês</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{referralsThisMonth}</div>
        </div>

        <div style={{ padding: 12, borderRadius: 8, background: "#07121a", color: "#fff", minWidth: 220 }}>
    <div style={{ fontSize: 12, opacity: 0.8 }}>&quot;Obrigados&quot; este mês</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{thankYousThisMonth}</div>
        </div>
      </div>

      <div style={{ background: "#fff", padding: 12, borderRadius: 8 }}>
        <Bar options={options} data={data} />
      </div>
    </div>
  )
}
