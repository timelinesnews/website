import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "../../services/api";

/* 🔐 BACKEND URL (safe) */
const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND ||
  "https://backend-7752.onrender.com";

export default function MyPosts() {
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ======================================================
     LOAD PROFILE + MY POSTS
  ====================================================== */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      /* ---------- PROFILE ---------- */
      const profileRes = await api.getProfile();
      const user = profileRes?.user || profileRes;

      if (!user?._id) {
        router.replace("/login");
        return;
      }

      setProfile(user);

      /* ---------- NEWS ---------- */
      const newsRes = await api.getNews();
      const allNews =
        newsRes?.news ||
        newsRes?.data ||
        newsRes ||
        [];

      const list = Array.isArray(allNews) ? allNews : [];

      /* ---------- FILTER + NORMALIZE MY POSTS ---------- */
      const safePosts = list
        .filter((p) => {
          if (!p) return false;

          const postUserId =
            p?.createdBy?._id ||
            p?.author?._id ||
            p?.userId ||
            p?.user?._id ||
            null;

          if (postUserId) {
            return String(postUserId) === String(user._id);
          }

          if (p?.username && user?.username) {
            return p.username === user.username;
          }

          return false;
        })
        .map((p) => {
          const realId =
            p?._id ||
            p?.id ||
            p?.newsId ||
            p?.news?._id;

          if (!realId) {
            console.warn("🚫 Dropped post without resolvable id:", p);
            return null;
          }

          return {
            ...p,
            _id: String(realId), // 🔥 FORCE STRING ID
          };
        })
        .filter(Boolean);

      setPosts(safePosts);
    } catch (err) {
      console.error("❌ Failed to load profile posts:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     IMAGE FIX (MAIN FIX)
  ====================================================== */
  const fixImage = (post) => {
    const img =
      post?.photoUrl ||
      post?.image ||
      post?.cover ||
      post?.thumbnail ||
      null;

    if (!img) return "/placeholder.jpg";
    if (img.startsWith("http")) return img;

    return `${BACKEND}/${img.replace(/^\/+/, "")}`;
  };

  /* ======================================================
     SAFE NAVIGATION
  ====================================================== */
  const openPost = (post) => {
    if (!post?._id) {
      console.error("🚨 Blocked navigation without post id:", post);
      return;
    }
    router.push(`/news/${post._id}`);
  };

  /* ======================================================
     LOADING / EMPTY
  ====================================================== */
  if (loading) {
    return (
      <div style={styles.loading}>
        ⏳ Loading your posts…
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Posts | TIMELINES</title>
        <meta
          name="description"
          content="Manage and edit all your news posts on TIMELINES."
        />
      </Head>

      <div style={styles.wrapper}>
        <h1 style={styles.title}>My News Posts</h1>

        {profile && (
          <div style={styles.subTitle}>
            Showing posts created by{" "}
            <b>{profile.name || profile.username}</b>
          </div>
        )}

        {posts.length === 0 && (
          <div style={styles.emptyBox}>
            You haven’t created any posts yet.
            <br />
            <Link href="/create" style={styles.createLink}>
              ➕ Create your first news post
            </Link>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          {posts.map((post) => (
            <div key={post._id} style={styles.card}>
              <img
                src={fixImage(post)}
                alt={post.headline}
                loading="lazy"
                style={styles.image}
                onClick={() => openPost(post)}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.jpg";
                }}
              />

              <div style={{ flex: 1 }}>
                <h3
                  style={styles.headline}
                  onClick={() => openPost(post)}
                >
                  {post.headline}
                </h3>

                <div style={styles.meta}>
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleString()
                    : "—"}
                </div>

                <div style={styles.stats}>
                  <span>👍 {post.likes || 0}</span>
                  <span>👁️ {post.views || 0}</span>
                </div>
              </div>

              <button
                onClick={() =>
                  router.push(`/news/edit/${post._id}`)
                }
                style={styles.editBtn}
              >
                ✏️ Edit
              </button>
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
    marginBottom: 10,
  },
  subTitle: {
    color: "#555",
    marginBottom: 16,
  },
  loading: {
    textAlign: "center",
    marginTop: 60,
    fontSize: 18,
    color: "#555",
  },
  emptyBox: {
    textAlign: "center",
    background: "#f5f7fa",
    padding: 28,
    borderRadius: 12,
    marginTop: 40,
    fontSize: 16,
    color: "#666",
  },
  createLink: {
    color: "#4f46e5",
    fontWeight: 600,
    fontSize: 15,
    textDecoration: "none",
  },
  card: {
    display: "flex",
    gap: 16,
    padding: 14,
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
    marginBottom: 16,
    alignItems: "center",
    border: "1px solid #ededed",
  },
  image: {
    width: 140,
    height: 100,
    borderRadius: 10,
    objectFit: "cover",
    cursor: "pointer",
  },
  headline: {
    margin: "0 0 6px",
    fontSize: 18,
    fontWeight: 700,
    color: "#111",
    cursor: "pointer",
  },
  meta: {
    fontSize: 13,
    color: "#666",
  },
  stats: {
    marginTop: 6,
    fontSize: 13,
    color: "#444",
    display: "flex",
    gap: 14,
  },
  editBtn: {
    padding: "8px 14px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    whiteSpace: "nowrap",
  },
};
