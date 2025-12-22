import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { api, getAuthToken } from "../../services/api";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= LOAD PROFILE (SAFE & CORRECT) ================= */
  const loadProfile = useCallback(async () => {
    const token = getAuthToken();

    // 🔴 Truly not logged in
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const profileRes = await api.getProfile();
      const u = profileRes?.data || profileRes;

      // 🟡 Backend slow / failed → DON'T logout
      if (!u || !u._id) {
        setError("PROFILE_NOT_READY");
        return;
      }

      setUser(u);
      setError(null);

      try {
        const res = await api.get(`/news/user/${u._id}`);
        setMyPosts(res?.data || []);
      } catch {
        setMyPosts([]);
      }
    } catch (err) {
      // 🟡 Network / 429 / temporary error
      console.warn("Profile load failed:", err?.message);
      setError("TEMP_ERROR");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /* ================= LOGOUT ================= */
  const logoutUser = () => {
    api.logout();
    router.replace("/login");
  };

  /* ================= STATES ================= */

  // ⏳ First load
  if (loading) {
    return <div style={styles.loading}>⏳ Loading profile…</div>;
  }

  // 🟡 Token exists but backend slow / rate-limited
  if (!user && getAuthToken()) {
    return (
      <div style={styles.loading}>
        ⏳ Preparing your profile…
        <p style={{ marginTop: 10, color: "#666" }}>
          Please wait a moment
        </p>
      </div>
    );
  }

  // 🔴 No token → login
  if (!user) {
    return (
      <div style={styles.loading}>
        <p style={{ marginBottom: 16 }}>
          You need to log in to view your profile.
        </p>
        <button style={styles.btn} onClick={() => router.push("/login")}>
          🔐 Go to Login
        </button>
      </div>
    );
  }

  /* ================= POST CARD ================= */
  const PostCard = ({ item }) => (
    <div style={styles.postCard}>
      <h3
        style={styles.postTitle}
        onClick={() => router.push(`/news/${item._id}`)}
      >
        {item.headline}
      </h3>

      {item.photoUrl && (
        <img
          src={item.photoUrl}
          alt={item.headline}
          loading="lazy"
          style={styles.postImage}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      )}

      <p style={styles.postDesc}>
        {(item.content || "").replace(/<[^>]+>/g, "").slice(0, 120)}…
      </p>

      <div style={styles.actionRow}>
        <button
          style={styles.editBtn}
          onClick={() => router.push(`/news/edit/${item._id}`)}
        >
          ✏️ Edit
        </button>

        <button
          style={styles.deleteBtn}
          onClick={async () => {
            if (!confirm("Delete this post?")) return;
            await api.delete(`/news/${item._id}`);
            setMyPosts((prev) => prev.filter((p) => p._id !== item._id));
          }}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>
          {user.firstName} {user.lastName} (@{user.username}) | TIMELINES
        </title>
      </Head>

      <div style={styles.wrapper}>
        <div style={styles.cover}></div>

        <div style={styles.profileTopCard}>
          <img
            src={user.profilePicture || "/default-user.png"}
            alt={user.username}
            style={styles.avatar}
            onError={(e) => (e.currentTarget.src = "/default-user.png")}
          />

          <div style={styles.name}>
            {user.firstName} {user.lastName}
          </div>
          <div style={styles.username}>@{user.username}</div>

          <div style={styles.location}>
            📍 {user.city}, {user.state}, {user.country}
          </div>

          <div style={styles.btnRow}>
            <button
              onClick={() => router.push("/profile/edit")}
              style={styles.btn}
            >
              ✏️ Edit Profile
            </button>

            <button
              onClick={logoutUser}
              style={{ ...styles.btn, background: "#ffe5e5", color: "#c00" }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        <h2 style={styles.sectionTitle}>My Posts</h2>

        {myPosts.length === 0 ? (
          <div style={styles.empty}>
            You haven't posted anything yet.
          </div>
        ) : (
          myPosts.map((item) => <PostCard key={item._id} item={item} />)
        )}
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
  location: { fontSize: 14, color: "#555", marginTop: 4 },
  btnRow: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginTop: 18,
  },
  btn: {
    padding: "8px 16px",
    borderRadius: 10,
    border: "1px solid #ddd",
    cursor: "pointer",
    fontWeight: 600,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginTop: 30,
  },
  postCard: {
    background: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
  },
  postImage: {
    width: "100%",
    height: 220,
    objectFit: "cover",
    borderRadius: 14,
    margin: "10px 0",
    cursor: "pointer",
  },
  postDesc: { color: "#444" },
  actionRow: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  editBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid #ccc",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid #fca5a5",
    background: "#fee2e2",
    color: "#b91c1c",
    cursor: "pointer",
  },
  empty: { textAlign: "center", marginTop: 40 },
  loading: { textAlign: "center", marginTop: 60 },
};
