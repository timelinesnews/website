// pages/news/[id].js
import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "../../services/api";

import CommentBox from "../../components/comments/CommentBox";
import CommentList from "../../components/comments/CommentList";

/* 🔐 BACKEND URL (safe for prod) */
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
  const [loadingComments, setLoadingComments] = useState(true);
  const [msg, setMsg] = useState("");

  /* ======================================================
     LOAD PROFILE
  ====================================================== */
  const loadProfile = useCallback(async () => {
    try {
      const p = await api.getProfile();
      if (p?.user || p) setProfile(p.user || p);
    } catch {
      setProfile(null);
    }
  }, []);

  /* ======================================================
     LOAD NEWS (🔥 REAL FIX HERE)
  ====================================================== */
  const loadNews = useCallback(async () => {
    if (!id) return;

    setLoadingNews(true);
    try {
      const res = await api.getNewsById(id);

      // 🔥 HANDLE BOTH API SHAPES (wrapped & direct)
      const safeNews = res?.data || res || null;

      if (!safeNews?._id && !safeNews?.id) {
        console.warn("⚠️ Invalid news payload:", res);
        setMsg("News not found");
        setNews(null);
      } else {
        setNews(safeNews);
      }
    } catch (err) {
      console.error("Load news error:", err);
      setMsg("❌ Failed to load news.");
      setNews(null);
    }
    setLoadingNews(false);
  }, [id]);

  /* ======================================================
     LOAD COMMENTS
  ====================================================== */
  const loadComments = useCallback(async () => {
    if (!id) return;

    setLoadingComments(true);
    try {
      const list = await api.getComments(id);
      setComments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn("Comments load error:", err);
      setComments([]);
    }
    setLoadingComments(false);
  }, [id]);

  /* ======================================================
     INITIAL LOAD
  ====================================================== */
  useEffect(() => {
    if (!id) return;
    loadProfile();
    loadNews();
    loadComments();
  }, [id, loadProfile, loadNews, loadComments]);

  /* ======================================================
     COMMENT POSTING
  ====================================================== */
  const handlePostComment = async (text) => {
    try {
      const res = await api.addComment(id, text);
      if (!res?.error) loadComments();
      else alert("❌ Failed to post comment");
    } catch {
      alert("Error posting comment");
    }
  };

  /* ======================================================
     DELETE COMMENT
  ====================================================== */
  const handleDeleteComment = async (commentId) => {
    try {
      await api.deleteComment(id, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {
      alert("Error deleting comment");
    }
  };

  /* ======================================================
     IMAGE FIX
  ====================================================== */
  const fixURL = (url) =>
    !url
      ? "/placeholder.jpg"
      : url.startsWith("http")
        ? url
        : `${BACKEND}/${url.replace(/^\//, "")}`;

  /* ======================================================
     SHARE
  ====================================================== */
  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(window.location.href)}`
    );
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    alert("🔗 Link copied!");
  };

  /* ======================================================
     DELETE POST
  ====================================================== */
  const deletePost = async () => {
    if (!confirm("Delete this post permanently?")) return;

    try {
      await api.deleteNews(id);
      router.push("/profile/posts");
    } catch {
      alert("Error deleting post");
    }
  };

  /* ======================================================
     LOADING / NOT FOUND
  ====================================================== */
  if (loadingNews) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        ⏳ Loading…
      </div>
    );
  }

  if (!news) {
    return (
      <div style={{ textAlign: "center", marginTop: 80, color: "red" }}>
        {msg || "News not found"}
      </div>
    );
  }

  /* ======================================================
     OWNER CHECK (SAFE)
  ====================================================== */
  const isOwner =
    profile &&
    (profile._id === news?.userId ||
      profile.username === news?.username);

  const isAdmin = profile && profile.role === "admin";

  /* ======================================================
     LOCATION TEXT
  ====================================================== */
  const locationText = [
    news?.location?.village,
    news?.location?.city,
    news?.location?.state,
    news?.location?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const pageTitle = `${news.headline} | TIMELINES`;

  /* ======================================================
     UI
  ====================================================== */
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

        <img
          src={fixURL(news.image)}
          alt={news.headline}
          style={styles.mainImage}
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
              onClick={() => router.push(`/news/edit/${id}`)}
            >
              ✏️ Edit
            </button>

            <button
              style={styles.deleteBtn}
              onClick={deletePost}
            >
              🗑 Delete
            </button>
          </div>
        )}

        <div
          style={styles.description}
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        <h3 style={{ marginTop: 30 }}>Share this news</h3>

        <div style={styles.shareRow}>
          <button style={styles.shareBtn} onClick={shareWhatsApp}>
            📲 WhatsApp
          </button>

          <button
            style={styles.shareBtn}
            onClick={() =>
              window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  window.location.href
                )}`
              )
            }
          >
            👍 Facebook
          </button>

          <button style={styles.shareBtn} onClick={copyLink}>
            🔗 Copy Link
          </button>
        </div>

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
          <p style={{ color: "#888" }}>
            No comments yet. Be the first!
          </p>
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

/* ======================================================
   STYLES (UNCHANGED)
===================================================== */
const styles = {
  container: {
    maxWidth: 850,
    margin: "30px auto",
    padding: "0 16px",
    fontFamily: "Inter, sans-serif",
  },
  headline: {
    fontSize: 30,
    fontWeight: 800,
    marginBottom: 10,
  },
  badgeRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  category: {
    background: "#e8f0fe",
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    color: "#1a73e8",
  },
  location: {
    background: "#e7f5ff",
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    color: "#1c7ed6",
  },
  mainImage: {
    width: "100%",
    borderRadius: 14,
    margin: "20px 0",
    objectFit: "cover",
    maxHeight: 420,
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    color: "#555",
    fontSize: 14,
  },
  description: {
    fontSize: 17,
    lineHeight: 1.7,
    marginTop: 20,
    color: "#333",
  },
  ownerRow: {
    marginTop: 14,
    display: "flex",
    gap: 10,
  },
  editBtn: {
    padding: "8px 14px",
    background: "#1971c2",
    color: "white",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "8px 14px",
    background: "#ff4d4d",
    color: "white",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
  shareRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  shareBtn: {
    padding: "10px 14px",
    background: "#eee",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },
};
