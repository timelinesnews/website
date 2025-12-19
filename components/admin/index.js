// pages/admin/index.js
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import AdminLayout from "../../components/admin/AdminLayout"; // ✅ CORRECT
import { api } from "../../services/api";
import ModerationList from "../../components/admin/ModerationList";

export default function AdminDashboard() {
  const router = useRouter();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    setLoading(true);
    try {
      const items = await api.getPendingNews();
      setPending(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load pending news:", err);
      setPending([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!id) return;
    setProcessing(true);
    try {
      await api.approveNews(id);
      setPending((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      alert("Approve failed");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id, reason = "") => {
    if (!id) return;
    setProcessing(true);
    try {
      await api.rejectNews(id, reason);
      setPending((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      alert("Reject failed");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    setProcessing(true);
    try {
      await api.deleteNews(id);
      setPending((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      alert("Delete failed");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AdminLayout>
      <Navbar />

      <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 18px" }}>
        <h1 style={{ marginBottom: 12 }}>
          Admin Dashboard — Moderation
        </h1>

        <div style={{ color: "#666", marginBottom: 18 }}>
          Approve or reject pending news submitted by users.
        </div>

        {loading ? (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            ⏳ Loading...
          </div>
        ) : pending.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 40, color: "#666" }}>
            No pending items.
          </div>
        ) : (
          <>
            <ModerationList
              items={pending}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDelete}
            />

            {processing && (
              <div style={{ marginTop: 16, color: "#555" }}>
                Processing… please wait
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
