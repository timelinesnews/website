import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../components/admin/AdminLayout";
import { api } from "../../services/api";

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    pendingPosts: 0,
    reportedPosts: 0,
    totalEarnings: 0,
  });

  const [loading, setLoading] = useState(true);

  // 🔒 Protect Admin Route
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchStats();
  }, []);

  // 📊 Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("admin_token"),
        },
      });
      setStats(res.data);
    } catch (err) {
      console.log("Stats fetch error:", err);
    }
    setLoading(false);
  };

  return (
    <AdminLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ marginBottom: "20px" }}>Admin Dashboard</h1>
      </div>

      {loading ? (
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <div className="spinner"></div>
          <p style={{ marginTop: 10 }}>Fetching dashboard data...</p>
        </div>
      ) : (
        <DashboardGrid stats={stats} />
      )}

      <style>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #ddd;
          border-top-color: #111;
          border-radius: 50%;
          margin: 0 auto;
          animation: spin 0.9s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
}

// 📦 Reusable Dashboard Grid + Card
function DashboardGrid({ stats }) {
  const cards = [
    { title: "Total Users", value: stats.totalUsers },
    { title: "Total Posts", value: stats.totalPosts },
    { title: "Pending Approvals", value: stats.pendingPosts },
    { title: "Reported Posts", value: stats.reportedPosts },
    { title: "Platform Earnings", value: `₹${stats.totalEarnings}` },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
        marginTop: 20,
      }}
    >
      {cards.map((card, i) => (
        <DashboardCard key={i} title={card.title} value={card.value} />
      ))}
    </div>
  );
}

function DashboardCard({ title, value }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
        transition: "0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <h2 style={{ margin: 0, fontSize: "30px" }}>{value}</h2>
      <p style={{ marginTop: 10, color: "#555" }}>{title}</p>
    </div>
  );
}
