import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "../../services/api";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  /* ================= LOAD PROFILE ================= */
  const loadProfile = useCallback(async () => {
    try {
      const profile = await api.getProfile();
      if (!profile) {
        router.replace("/login");
        return;
      }

      const u = profile.user || profile;
      setUser(u);

      /* LOAD MY POSTS */
      const res = await api.getNews();
      const list = Array.isArray(res) ? res : res?.data || [];

      const posts = list
        .filter(
          (n) =>
            n?.user?.id === u._id ||
            n?.userId === u._id
        )
        .map((n) => ({
          ...n,
          _id: n._id || n.id,
        }))
        .filter((n) => n._id);

      setMyPosts(posts);
    } catch (err) {
      console.error("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const logoutUser = () => {
    api.logout();
    router.push("/login");
  };

  /* ================= POST CARD ================= */
  const PostCard = ({ item }) => {
    const openPost = () => {
      if (!item?._id) return;
      router.push(`/news/${item._id}`);
    };

    return (
      <div style={styles.postCard} onClick={openPost}>
        <h3 style={styles.postTitle}>{item.headline}</h3>

        <img
          src={item.photoUrl || "/placeholder.jpg"}
          alt={item.headline}
          loading="lazy"
          style={styles.postImage}
          onError={(e) => {
            e.currentTarget.src = "/placeholder.jpg";
          }}
        />

        <p style={styles.postDesc}>
          {(item.content || "")
            .replace(/<[^>]+>/g, "")
            .slice(0, 120)}
          …
        </p>
      </div>
    );
  };

  /* ================= LOADING ================= */
  if (loading) {
    return <div style={styles.loading}>⏳ Loading profile…</div>;
  }

  if (!user) {
    return <div style={styles.loading}>❌ Failed to load profile.</div>;
  }

  return (
    <>
      <Head>
        <title>{user.name} (@{user.username}) | TIMELINES</title>
      </Head>

      <div style={styles.wrapper}>
        <div style={styles.cover}></div>

        <div style={styles.profileTopCard}>
          <div style={styles.avatarWrapper}>
            <img
              src={user.avatar || "/default-user.png"}
              alt={user.name}
              style={styles.avatar}
              onError={(e) => {
                e.currentTarget.src = "/default-user.png";
              }}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={styles.name}>{user.name}</div>
            <div style={styles.username}>@{user.username}</div>
            <div style={styles.location}>
              📍 {user.city}, {user.state}, {user.country}
            </div>
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
          myPosts.map((item) => (
            <PostCard key={item._id} item={item} />
          ))
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
  avatarWrapper: { display: "flex", justifyContent: "center" },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: "50%",
    objectFit: "cover",
  },
  name: { fontSize: 23, fontWeight: 800 },
  username: { color: "#777" },
  location: { fontSize: 14, color: "#555" },
  btnRow: { display: "flex", gap: 12, justifyContent: "center", marginTop: 18 },
  btn: { padding: "8px 16px", borderRadius: 10 },
  sectionTitle: { fontSize: 22, fontWeight: 700, marginTop: 30 },
  postCard: {
    background: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    cursor: "pointer",
  },
  postTitle: { fontSize: 18, fontWeight: 700 },
  postImage: {
    width: "100%",
    height: 220,
    objectFit: "cover",
    borderRadius: 14,
    margin: "10px 0",
  },
  postDesc: { color: "#444" },
  empty: { textAlign: "center", marginTop: 40 },
  loading: { textAlign: "center", marginTop: 60 },
};
