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
     LOAD NEWS (SAFE)
  ========================= */
  const loadNews = useCallback(async () => {
    if (!id) return;

    setLoadingNews(true);
    setMsg("");

    try {
      const res = await api.getNewsById(id);

      const safeNews =
        res?.news || res?.data?.news || res?.data || res || null;

      if (!safeNews || !(safeNews._id || safeNews.id)) {
        console.warn("⚠️ Invalid news payload:", res);
        setNews(null);
        setMsg("News not found");
      } else {
        setNews({
          ...safeNews,
          _id: safeNews._id || safeNews.id,
        });
      }
    } catch (err) {
      console.error("Load news error:", err);
      setMsg("❌ Failed to load news");
      setNews(null);
    }

    setLoadingNews(false);
  }, [id]);

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
    }
    setLoadingComments(false);
  }, []);

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    if (!id) return;
    loadProfile();
    loadNews();
  }, [id, loadProfile, loadNews]);

  /* =========================
     LOAD COMMENTS AFTER NEWS
  ========================= */
  useEffect(() => {
    if (!news?._id) return;
    loadComments(news._id);
  }, [news, loadComments]);

  /* =========================
     COMMENT ACTIONS
  ========================= */
  const handlePostComment = async (text) => {
    if (!news?._id) return;
    try {
      const res = await api.addComment(news._id, text);
      if (!res?.error) loadComments(news._id);
      else alert("❌ Failed to post comment");
    } catch {
      alert("Error posting comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!news?._id) return;
    try {
      await api.deleteComment(news._id, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {
      alert("Error deleting comment");
    }
  };

  /* =========================
     IMAGE FIX
  ========================= */
  const fixURL = (url) => {
    if (!url) return "/default-user.png";
    if (url.startsWith("http")) return url;
    return `${BACKEND}/${url.replace(/^\//, "")}`;
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
  const isOwner =
    profile && profile._id === news.user?._id;

  const isAdmin = profile?.role === "admin";

  /* =========================
     LOCATION TEXT
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

        {news.photoUrl && (
          <img
            src={fixURL(news.photoUrl)}
            alt={news.headline}
            style={styles.mainImage}
          />
        )}

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
          <CommentBox onSubmit={handlePostComment} />
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
            onDelete={handleDeleteComment}
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
