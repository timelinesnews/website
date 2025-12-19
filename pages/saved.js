// pages/saved.js
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "../services/api";

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND || "https://backend-7752.onrender.com";

export default function Saved() {
  const router = useRouter();

  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ======================================================
      AUTH CHECK + LOAD SAVED NEWS
  ====================================================== */
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    loadSaved();
  }, []);

  async function loadSaved() {
    try {
      setLoading(true);
      const res = await api.getBookmarks();
      setSaved(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to load bookmarks:", err);
      setSaved([]);
    } finally {
      setLoading(false);
    }
  }

  /* ======================================================
      IMAGE FIX
  ====================================================== */
  const fullUrl = (url) =>
    !url
      ? "/placeholder.jpg"
      : url.startsWith("http")
      ? url
      : `${BACKEND}/${url.replace(/^\/+/, "")}`;

  /* ======================================================
      REMOVE BOOKMARK
  ====================================================== */
  const removeBookmark = async (id) => {
    if (!confirm("Remove this saved news?")) return;

    try {
      await api.unbookmarkNews(id);
      setSaved((prev) => prev.filter((n) => n._id !== id));
    } catch {
      alert("Failed to remove bookmark");
    }
  };

  /* ======================================================
      UI
  ====================================================== */
  return (
    <>
      {/* SEO */}
      <Head>
        <title>Saved News | TIMELINES</title>
        <meta
          name="description"
          content="Your saved news articles on TIMELINES."
        />
      </Head>

      <div style={styles.wrapper}>
        <h1 style={styles.title}>⭐ Saved News</h1>

        {/* Loading */}
        {loading && (
          <div style={styles.loading}>⏳ Loading saved posts…</div>
        )}

        {/* Empty */}
        {!loading && saved.length === 0 && (
          <div style={styles.empty}>
            You haven't saved any news yet.
            <div style={{ marginTop: 12 }}>
              <Link href="/" style={styles.exploreLink}>
                🔍 Explore news
              </Link>
            </div>
          </div>
        )}

        {/* List */}
        <div style={{ marginTop: 20 }}>
          {saved.map((item) => (
            <div key={item._id} style={styles.card}>
              {/* Image */}
              {item.image && (
                <img
                  src={fullUrl(item.image)}
                  style={styles.image}
                  onClick={() => router.push(`/news/${item._id}`)}
                />
              )}

              {/* Content */}
              <div style={{ flex: 1 }}>
                <h2
                  style={styles.headline}
                  onClick={() => router.push(`/news/${item._id}`)}
                >
                  {item.headline}
                </h2>

                <div style={styles.meta}>
                  {item.category || "General"} •{" "}
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>

                <p style={styles.desc}>
                  {item.description?.slice(0, 160)}…
                </p>

                <div style={styles.btnRow}>
                  <button
                    onClick={() => router.push(`/news/${item._id}`)}
                    style={styles.readBtn}
                  >
                    Read More
                  </button>

                  <button
                    onClick={() => removeBookmark(item._id)}
                    style={styles.removeBtn}
                  >
                    Remove ★
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ======================================================
   STYLES
====================================================== */
const styles = {
  wrapper: {
    maxWidth: 900,
    margin: "40px auto",
    padding: "0 18px",
    fontFamily: "Inter, sans-serif",
  },

  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 30,
  },

  loading: {
    textAlign: "center",
    marginTop: 60,
    fontSize: 16,
    color: "#444",
  },

  empty: {
    textAlign: "center",
    color: "#666",
    marginTop: 40,
    fontSize: 16,
  },

  exploreLink: {
    color: "#4f46e5",
    fontWeight: 600,
    textDecoration: "none",
  },

  card: {
    display: "flex",
    gap: 16,
    padding: 18,
    marginBottom: 24,
    borderRadius: 14,
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  },

  image: {
    width: 200,
    height: 140,
    objectFit: "cover",
    borderRadius: 12,
    cursor: "pointer",
  },

  headline: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
    cursor: "pointer",
    color: "#111",
  },

  meta: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },

  desc: {
    color: "#333",
    marginBottom: 14,
    lineHeight: 1.5,
  },

  btnRow: {
    display: "flex",
    gap: 12,
  },

  readBtn: {
    padding: "8px 14px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },

  removeBtn: {
    padding: "8px 14px",
    background: "#ffe5e5",
    color: "#d32f2f",
    border: "1px solid #f1b3b3",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
};
