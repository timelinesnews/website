import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { api, getAuthToken } from "../../services/api";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("posts"); // posts | followers | following | analytics

  /* ================= LOAD PROFILE ================= */
  const loadProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);

      const profileRes = await api.getProfile();
      const raw = profileRes?.user || profileRes;
      const userId = raw?._id || raw?.id;

      if (!userId) return;

      const normalizedUser = {
        ...raw,
        _id: String(userId),
        followers: Array.isArray(raw?.followers) ? raw.followers : [],
        following: Array.isArray(raw?.following) ? raw.following : [],
      };

      setUser(normalizedUser);

      /* 🔥 SAFE: use API helper (nothing removed) */
      const posts = await api.getUserPosts(normalizedUser._id);
      setMyPosts(Array.isArray(posts) ? posts : []);
    } catch (err) {
      console.warn("Profile load error:", err?.message);
      setMyPosts([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!router.isReady) return;
    loadProfile();
  }, [router.isReady, loadProfile]);

  /* ================= STATES ================= */
  if (loading) {
    return <div style={styles.loading}>⏳ Loading profile…</div>;
  }

  if (!user) {
    return (
      <div style={styles.loading}>
        <p>You need to log in.</p>
        <button style={styles.btn} onClick={() => router.push("/login")}>
          🔐 Login
        </button>
      </div>
    );
  }

  /* ================= COUNTS ================= */
  const postsCount = myPosts.length;
  const followersCount = user.followers.length;
  const followingCount = user.following.length;

  /* ================= DELETE POST ================= */
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const res = await api.deleteNews(id);
    if (!res?.error) {
      setMyPosts((prev) => prev.filter((p) => p._id !== id));
    } else {
      alert("Failed to delete post");
    }
  };

  /* ================= POST CARD ================= */
  const PostCard = ({ item }) => (
    <div style={styles.postCard}>
      <div
        style={{ cursor: "pointer" }}
        onClick={() => router.push(`/news/${item._id}`)}
      >
        <h3 style={styles.postTitle}>{item.headline}</h3>

        {item.status && (
          <span
            style={{
              fontSize: 12,
              color:
                item.status === "approved"
                  ? "green"
                  : item.status === "rejected"
                    ? "red"
                    : "#ca8a04",
            }}
          >
            {item.status.toUpperCase()}
          </span>
        )}
      </div>

      {/* OWNER ACTIONS */}
      <div style={styles.postActions}>
        <button
          style={styles.smallBtn}
          onClick={() => router.push(`/news/edit/${item._id}`)}
        >
          ✏️ Edit
        </button>
        <button
          style={{ ...styles.smallBtn, color: "#b91c1c" }}
          onClick={() => handleDelete(item._id)}
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );

  /* ================= USER ROW ================= */
  const UserRow = ({ u }) => {
    if (!u) return null;

    return (
      <div style={styles.userRow}>
        <img
          src={u.profilePicture || "/default-user.png"}
          alt={u.username}
          style={styles.userAvatar}
          onError={(e) => (e.currentTarget.src = "/default-user.png")}
        />
        <div>
          <div style={{ fontWeight: 700 }}>
            {u.firstName || ""} {u.lastName || ""}
            {u.verified && (
              <span style={{ marginLeft: 6, color: "#3b82f6" }}>✔️</span>
            )}
          </div>
          <div style={{ fontSize: 13, color: "#666" }}>@{u.username}</div>
        </div>
      </div>
    );
  };

  /* ================= ANALYTICS ================= */
  const totalViews = myPosts.reduce(
    (sum, p) => sum + (Number(p.views) || 0),
    0
  );
  const totalLikes = myPosts.reduce(
    (sum, p) => sum + (Number(p.likesCount) || 0),
    0
  );

  return (
    <>
      <Head>
        <title>
          {user.firstName} {user.lastName} (@{user.username}) | TIMELINES
        </title>
      </Head>

      <div style={styles.wrapper}>
        <div style={styles.cover} />

        <div style={styles.profileTopCard}>
          <img
            src={user.profilePicture || "/default-user.png"}
            alt={user.username}
            style={styles.avatar}
            onError={(e) => (e.currentTarget.src = "/default-user.png")}
          />

          <div style={styles.name}>
            {user.firstName} {user.lastName}
            {user.verified && (
              <span style={{ marginLeft: 6, color: "#3b82f6" }}>✔️</span>
            )}
          </div>

          <div style={styles.username}>@{user.username}</div>

          {user.bio && <p style={styles.bio}>{user.bio}</p>}

          <div style={styles.location}>
            📍 {user.city}, {user.state}, {user.country}
          </div>

          <div style={styles.statsRow}>
            <div onClick={() => setTab("posts")} style={styles.statBox}>
              <b>{postsCount}</b>
              <span>Posts</span>
            </div>
            <div onClick={() => setTab("followers")} style={styles.statBox}>
              <b>{followersCount}</b>
              <span>Followers</span>
            </div>
            <div onClick={() => setTab("following")} style={styles.statBox}>
              <b>{followingCount}</b>
              <span>Following</span>
            </div>
            <div onClick={() => setTab("analytics")} style={styles.statBox}>
              <b>📊</b>
              <span>Analytics</span>
            </div>
          </div>
        </div>

        {/* ===== TABS CONTENT ===== */}
        <div style={{ marginTop: 24 }}>
          {tab === "posts" &&
            (myPosts.length === 0 ? (
              <div style={styles.empty}>No posts yet.</div>
            ) : (
              myPosts.map((p) => <PostCard key={p._id} item={p} />)
            ))}

          {tab === "followers" &&
            (followersCount === 0 ? (
              <div style={styles.empty}>No followers yet.</div>
            ) : (
              user.followers.map((u, i) => <UserRow key={i} u={u} />)
            ))}

          {tab === "following" &&
            (followingCount === 0 ? (
              <div style={styles.empty}>Not following anyone.</div>
            ) : (
              user.following.map((u, i) => <UserRow key={i} u={u} />)
            ))}

          {tab === "analytics" && (
            <div style={styles.analyticsBox}>
              <h3>📊 Post Analytics</h3>
              <p>Total Posts: {postsCount}</p>
              <p>Total Views: {totalViews}</p>
              <p>Total Likes: {totalLikes}</p>
              <p style={{ fontSize: 13, color: "#777" }}>
                Detailed graphs coming soon
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ================= STYLES ================= */
const styles = {
  wrapper: { maxWidth: 900, margin: "0 auto", paddingBottom: 60 },
  cover: {
    height: 140,
    background: "linear-gradient(135deg,#4f46e5,#3b82f6)",
  },
  profileTopCard: {
    background: "#fff",
    padding: 24,
    marginTop: -55,
    borderRadius: 16,
    textAlign: "center",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: 10,
  },
  name: { fontSize: 23, fontWeight: 800 },
  username: { color: "#777" },
  bio: { fontSize: 14, color: "#444", marginTop: 6 },
  location: { fontSize: 14, color: "#555", marginTop: 4 },

  statsRow: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: 18,
  },
  statBox: { cursor: "pointer", textAlign: "center" },

  postCard: {
    background: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  postTitle: { fontSize: 17, fontWeight: 700 },

  postActions: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  smallBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    cursor: "pointer",
    background: "#f9fafb",
  },

  userRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 12,
    background: "#fff",
    borderRadius: 12,
    marginBottom: 10,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    objectFit: "cover",
  },

  analyticsBox: {
    background: "#fff",
    padding: 20,
    borderRadius: 14,
  },

  empty: { textAlign: "center", marginTop: 30, color: "#666" },
  loading: { textAlign: "center", marginTop: 60 },
};
