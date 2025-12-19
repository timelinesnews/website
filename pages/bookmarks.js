// pages/Bookmarks.js
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "../services/api";

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND || "https://backend-7752.onrender.com";

export default function BookmarksPage() {
  const router = useRouter();

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ======================================================
      PROTECT ROUTE + LOAD BOOKMARKS
  ====================================================== */
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    loadBookmarks();
  }, []);

  async function loadBookmarks() {
    try {
      setLoading(true);
      const data = await api.getBookmarks();
      setBookmarks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Bookmarks load error:", err);
    } finally {
      setLoading(false);
    }
  }

  /* ======================================================
      REMOVE BOOKMARK
  ====================================================== */
  const removeBookmark = async (id) => {
    if (!confirm("Remove this saved news?")) return;

    const ok = await api.unbookmarkNews(id);
    if (ok) {
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
    }
  };

  /* ======================================================
      IMAGE FIX
  ====================================================== */
  const fullImg = (url) => {
    if (!url) return "/placeholder.jpg";
    return url.startsWith("http")
      ? url
      : `${BACKEND}/${url.replace(/^\//, "")}`;
  };

  /* ======================================================
      UI
  ====================================================== */
  return (
    <>
      {/* 🔍 SEO */}
      <Head>
        <title>Saved News | TIMELINES</title>
        <meta
          name="description"
          content="View and manage your saved news articles on TIMELINES."
        />
      </Head>

      <div style={styles.wrapper}>
        <h1 style={styles.title}>⭐ Saved News</h1>

        {/* Loading */}
        {loading && (
          <div style={styles.loading}>
            ⏳ Loading your saved posts...
          </div>
        )}

        {/* Empty */}
        {!loading && bookmarks.length === 0 && (
          <div style={styles.empty}>
            You haven't saved any news yet.
            <div style={{ marginTop: 10 }}>
              <Link href="/" style={styles.exploreLink}>
                🔍 Explore news
              </Link>
            </div>
          </div>
        )}

        {/* List */}
        <div style={{ marginTop: 20 }}>
          {bookmarks.map((post) => (
            <div key={post._id} style={styles.card}>
              {/* Image */}
              <img
                src={fullImg(post.image)}
                alt={post.headline}
                style={styles.image}
                onClick={() => router.push(`/news/${post._id}`)}
              />

              {/* Content */}
              <div style={{ flex: 1 }}>
                <Link
                  href={`/news/${post._id}`}
                  style={styles.headlineLink}
                >
                  <h3 style={styles.headline}>{post.headline}</h3>
                </Link>

                <div style={styles.meta}>
                  {post.category || "General"} •{" "}
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>

                <button
                  onClick={() => removeBookmark(post._id)}
                  style={styles.removeBtn}
                >
                  ✖ Remove
                </button>
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
    padding: 20,
    maxWidth: 900,
    margin: "0 auto",
    fontFamily: "Inter, sans-serif",
  },

  title: {
    fontSize: 26,
    fontWeight: 800,
    marginBottom: 20,
  },

  loading: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#444",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#666",
    fontSize: 16,
  },

  exploreLink: {
    color: "#4f46e5",
    fontWeight: 600,
    textDecoration: "none",
  },

  card: {
    display: "flex",
    gap: 14,
    padding: 14,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
    marginBottom: 16,
    alignItems: "center",
    border: "1px solid #eee",
  },

  image: {
    width: 130,
    height: 85,
    borderRadius: 10,
    objectFit: "cover",
    cursor: "pointer",
  },

  headlineLink: {
    textDecoration: "none",
    color: "#111",
  },

  headline: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
  },

  meta: {
    marginTop: 6,
    fontSize: 13,
    color: "#666",
  },

  removeBtn: {
    marginTop: 10,
    padding: "6px 12px",
    fontSize: 13,
    background: "#ffe6e6",
    color: "#cc0000",
    border: "1px solid #ffcccc",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },
};
