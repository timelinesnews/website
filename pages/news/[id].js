import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "../../services/api";

import CommentBox from "../../components/comments/CommentBox";
import CommentList from "../../components/comments/CommentList";

/* 🔐 BACKEND URL */
const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND ||
  "https://backend-7752.onrender.com";

export default function NewsView() {
  const router = useRouter();
  const { id } = router.query;

  const [news, setNews] = useState(null);
  const [profile, setProfile] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [msg, setMsg] = useState("");

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
      setMsg("❌ Invalid news link");
      setLoadingNews(false);
      return;
    }

    setLoadingNews(true);
    setMsg("");

    try {
      const res = await api.getNewsById(safeId);
      const data = res?.data || res || null;

      if (!data || !(data._id || data.id)) {
        setNews(null);
        setMsg("News not found");
      } else {
        setNews({
          ...data,
          _id: data._id || data.id,
        });
      }
    } catch (err) {
      console.error("Load news error:", err);
      setMsg("❌ Failed to load news");
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
    setLoadingComments(true);
    try {
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
    if (!safeId) return;
    loadProfile();
    loadNews();
  }, [safeId, loadProfile, loadNews]);

  useEffect(() => {
    if (news?._id) loadComments(news._id);
  }, [news?._id, loadComments]);

  /* =========================
     IMAGE HELPERS (FIXED)
  ========================= */
  const getNewsImage = () => {
    if (!news?.photoUrl) return "/placeholder.jpg";

    if (news.photoUrl.startsWith("http")) {
      return news.photoUrl; // Cloudinary
    }

    return `${BACKEND}/${news.photoUrl.replace(/^\/+/, "")}`; // backend image
  };

  /* =========================
     DELETE POST
  ========================= */
  const deletePost = async () => {
    if (!news?._id) return;
    if (!confirm("Delete this post permanently?")) return;
    try {
      await api.deleteNews(news._id);
      router.push("/profile/posts");
    } catch {
      alert("Error deleting post");
    }
  };

  /* =========================
     LOADING / NOT FOUND
  ========================= */
  if (loadingNews) {
    return <div style={{ textAlign: "center", marginTop: 80 }}>⏳ Loading…</div>;
  }

  if (!news) {
    return (
      <div style={{ textAlign: "center", marginTop: 80, color: "red" }}>
        {msg || "News not found"}
      </div>
    );
  }

  /* =========================
     OWNER / ADMIN
  ========================= */
  const isOwner = profile && profile._id === news.user?.id;
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

  const pageTitle = `${news.headline} | TIMELINES`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
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
          <span style={styles.category}>{news.category}</span>
          {locationText && (
            <span style={styles.location}>📍 {locationText}</span>
          )}
        </div>

        {/* NEWS IMAGE */}
        <img
          src={getNewsImage()}
          alt={news.headline}
          style={styles.mainImage}
          onError={(e) => {
            e.currentTarget.src = "/placeholder.jpg";
          }}
        />

        <div style={styles.metaRow}>
          <span>
            📅{" "}
            {news.createdAt
              ? new Date(news.createdAt).toLocaleDateString()
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
          <p style={{ color: "#888" }}>
            <Link href="/login">Sign in</Link> to comment.
          </p>
        )}

        {loadingComments ? (
          <p>⏳ Loading comments…</p>
        ) : comments.length === 0 ? (
          <p style={{ color: "#888" }}>No comments yet. Be the first!</p>
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
  metaRow: { display: "flex", justifyContent: "space-between", fontSize: 14 },
  description: { fontSize: 17, lineHeight: 1.7, marginTop: 20 },
  ownerRow: { marginTop: 14, display: "flex", gap: 10 },
  editBtn: { padding: "8px 14px", background: "#1971c2", color: "white" },
  deleteBtn: { padding: "8px 14px", background: "#ff4d4d", color: "white" },
};
