import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "../../services/api";

import CommentBox from "../../components/comments/CommentBox";
import CommentList from "../../components/comments/CommentList";

/* 🔐 BACKEND */
const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://backend-7752.onrender.com";

/* =========================
   IMAGE NORMALIZER
========================= */
const normalizeUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BACKEND}/${url.replace(/^\/+/, "")}`;
};

export default function NewsView() {
  const router = useRouter();
  const { id } = router.query;

  const [news, setNews] = useState(null);
  const [profile, setProfile] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     SAFE NEWS ID
  ========================= */
  const safeId =
    typeof id === "string" && id !== "undefined" && id !== "null"
      ? id
      : null;

  /* =========================
     LOAD PROFILE
  ========================= */
  const loadProfile = useCallback(async () => {
    try {
      const res = await api.getProfile();
      setProfile(res?.user || res || null);
    } catch {
      setProfile(null);
    }
  }, []);

  /* =========================
     LOAD NEWS
  ========================= */
  const loadNews = useCallback(async () => {
    if (!safeId) {
      setError("Invalid news link");
      setLoadingNews(false);
      return;
    }

    try {
      setLoadingNews(true);
      setError("");

      const res = await api.getNewsById(safeId);
      const data = res?.data || res;

      if (!data?._id) {
        setError("News not found");
        setNews(null);
        return;
      }

      setNews(data);
    } catch (err) {
      console.error("Load news error:", err);
      setError("Failed to load news");
      setNews(null);
    } finally {
      setLoadingNews(false);
    }
  }, [safeId]);

  /* =========================
     LOAD COMMENTS
  ========================= */
  const loadComments = useCallback(async (newsId) => {
    if (!newsId) return;
    try {
      setLoadingComments(true);
      const list = await api.getComments(newsId);
      setComments(Array.isArray(list) ? list : []);
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    if (!router.isReady) return;
    loadProfile();
    loadNews();
  }, [router.isReady, loadProfile, loadNews]);

  useEffect(() => {
    if (news?._id) loadComments(news._id);
  }, [news?._id, loadComments]);

  /* =========================
     DELETE POST (OWNER / ADMIN)
  ========================= */
  const deletePost = async () => {
    if (!news?._id) return;
    if (!confirm("Delete this post permanently?")) return;

    try {
      await api.delete(`/news/${news._id}`);
      router.push("/profile");
    } catch {
      alert("Failed to delete post");
    }
  };

  /* =========================
     LOADING / ERROR
  ========================= */
  if (loadingNews) {
    return <div style={styles.center}>⏳ Loading…</div>;
  }

  if (!news) {
    return (
      <div style={{ ...styles.center, color: "red" }}>
        {error || "News not found"}
      </div>
    );
  }

  /* =========================
     OWNER CHECK
  ========================= */
  const isOwner = profile && profile._id === news.user?._id;
  const isAdmin = profile?.role === "admin";

  /* =========================
     LOCATION
  ========================= */
  const locationText = [
    news.location?.village,
    news.location?.city,
    news.location?.state,
    news.location?.country,
  ]
    .filter(Boolean)
    .join(", ");

  /* =========================
     IMAGE
  ========================= */
  const imageSrc =
    normalizeUrl(news.photoUrl) ||
    normalizeUrl(news.image) ||
    normalizeUrl(news.cover) ||
    normalizeUrl(news.thumbnail) ||
    null;

  return (
    <>
      <Head>
        <title>{news.headline} | TIMELINES</title>
        <meta
          name="description"
          content={(news.content || "")
            .replace(/<[^>]+>/g, "")
            .slice(0, 160)}
        />
      </Head>

      <div style={styles.container}>
        <h1 style={styles.headline}>{news.headline}</h1>

        <div style={styles.badgeRow}>
          {news.category && (
            <span style={styles.category}>{news.category}</span>
          )}
          {locationText && (
            <span style={styles.location}>📍 {locationText}</span>
          )}
        </div>

        {imageSrc && (
          <img
            src={imageSrc}
            alt={news.headline}
            style={styles.mainImage}
            loading="lazy"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}

        <div style={styles.metaRow}>
          <span>
            📅{" "}
            {news.createdAt
              ? new Date(news.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              : "—"}
          </span>
          <span>👁 {news.views || 0} views</span>
        </div>

        {(isOwner || isAdmin) && (
          <div style={styles.ownerRow}>
            <button
              style={styles.editBtn}
              onClick={() => router.push(`/news/edit/${news._id}`)}
            >
              ✏️ Edit
            </button>
            <button style={styles.deleteBtn} onClick={deletePost}>
              🗑 Delete
            </button>
          </div>
        )}

        <div
          style={styles.description}
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        <h2 style={{ marginTop: 40 }}>Comments</h2>

        {profile ? (
          <CommentBox
            newsId={news._id}
            onSubmit={() => loadComments(news._id)}
          />
        ) : (
          <p style={{ color: "#777" }}>
            <Link href="/login">Sign in</Link> to comment
          </p>
        )}

        {loadingComments ? (
          <p>⏳ Loading comments…</p>
        ) : comments.length === 0 ? (
          <p style={{ color: "#777" }}>No comments yet</p>
        ) : (
          <CommentList
            comments={comments}
            onDelete={() => loadComments(news._id)}
            userId={profile?._id}
          />
        )}
      </div>
    </>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  center: { textAlign: "center", marginTop: 80 },
  container: { maxWidth: 850, margin: "30px auto", padding: "0 16px" },
  headline: { fontSize: 30, fontWeight: 800 },
  badgeRow: { display: "flex", gap: 10, marginBottom: 14 },
  category: { background: "#e8f0fe", padding: "4px 10px", borderRadius: 8 },
  location: { background: "#e7f5ff", padding: "4px 10px", borderRadius: 8 },
  mainImage: {
    width: "100%",
    borderRadius: 14,
    margin: "20px 0",
    maxHeight: 420,
    objectFit: "cover",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 14,
    color: "#555",
  },
  description: { fontSize: 17, lineHeight: 1.7, marginTop: 20 },
  ownerRow: { marginTop: 14, display: "flex", gap: 10 },
  editBtn: {
    padding: "8px 14px",
    background: "#2563eb",
    color: "white",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "8px 14px",
    background: "#dc2626",
    color: "white",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
};
