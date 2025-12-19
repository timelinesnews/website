// pages/profile/index.js
import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "../../services/api";

/* 🔐 BACKEND URL (safe for prod) */
const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND ||
  "https://backend-7752.onrender.com";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
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

      if (u.avatar && !u.avatar.startsWith("http")) {
        u.avatar = `${BACKEND}/${u.avatar.replace(/^\/+/, "")}`;
      }

      setUser(u);

      /* Load user's posts */
      const allNews = await api.getNews();
      const posts = (Array.isArray(allNews) ? allNews : []).filter(
        (n) =>
          n?.createdBy?._id === u._id ||
          n?.userId === u._id
      );

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

  const fullUrl = (url) =>
    !url
      ? null
      : url.startsWith("http")
      ? url
      : `${BACKEND}/${url.replace(/^\/+/, "")}`;

  const logoutUser = () => {
    api.logout();
    router.push("/login");
  };

  /* ================= SMALL COMPONENTS ================= */

  const StatCard = ({ label, value, icon, onClick }) => (
    <div style={styles.statCard} onClick={onClick}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );

  const UserListModal = ({ title, list = [], onClose }) => (
    <div style={styles.modalOverlay}>
      <div style={styles.modalBox}>
        <h3 style={styles.modalTitle}>{title}</h3>

        {list.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>
            No users found.
          </p>
        ) : (
          list.map((u, i) => (
            <div key={i} style={styles.modalUserRow}>
              <img
                src={fullUrl(u.avatar) || "/default.png"}
                alt={u.name}
                loading="lazy"
                style={styles.modalAvatar}
              />
              <div>
                <div style={styles.modalName}>{u.name}</div>
                <div style={styles.modalUsername}>
                  @{u.username}
                </div>
              </div>
            </div>
          ))
        )}

        <button style={styles.modalCloseBtn} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );

  const PostCard = ({ item }) => (
    <div
      style={styles.postCard}
      onClick={() => router.push(`/news/${item._id}`)}
    >
      <h3 style={styles.postTitle}>{item.headline}</h3>

      {item.image && (
        <img
          src={fullUrl(item.image)}
          style={styles.postImage}
          alt={item.headline}
          loading="lazy"
        />
      )}

      <p style={styles.postDesc}>
        {(item.content || "")
          .replace(/<[^>]+>/g, "")
          .slice(0, 120)}
        …
      </p>
    </div>
  );

  /* ================= LOADING ================= */
  if (loading)
    return (
      <div style={styles.loading}>⏳ Loading profile…</div>
    );

  if (!user)
    return (
      <div style={styles.loading}>
        ❌ Failed to load profile.
      </div>
    );

  const pageTitle = `${user.name} (@${user.username}) | TIMELINES`;

  return (
    <>
      {/* 🔍 SEO */}
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={`View ${user.name}'s profile and posts on TIMELINES.`}
        />
      </Head>

      <div style={styles.wrapper}>
        {/* Cover */}
        <div style={styles.cover}></div>

        {/* Profile Card */}
        <div style={styles.profileTopCard}>
          <div style={styles.avatarWrapper}>
            {user.avatar ? (
              <img
                src={user.avatar}
                style={styles.avatar}
                alt={user.name}
              />
            ) : (
              <div style={styles.emptyAvatar}>
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
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
              onClick={() => router.push("/settings")}
              style={styles.btn}
            >
              ⚙️ Settings
            </button>

            <button
              onClick={logoutUser}
              style={{
                ...styles.btn,
                background: "#ffe5e5",
                color: "#c00",
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <StatCard
            label="Posts"
            value={myPosts.length}
            icon="📰"
          />
          <StatCard
            label="Followers"
            value={user.followers?.length || 0}
            icon="👥"
            onClick={() => setShowFollowers(true)}
          />
          <StatCard
            label="Following"
            value={user.following?.length || 0}
            icon="➡️"
            onClick={() => setShowFollowing(true)}
          />
        </div>

        {/* Posts */}
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

        {/* Followers Modal */}
        {showFollowers && (
          <UserListModal
            title="Followers"
            list={user.followers || []}
            onClose={() => setShowFollowers(false)}
          />
        )}

        {/* Following Modal */}
        {showFollowing && (
          <UserListModal
            title="Following"
            list={user.following || []}
            onClose={() => setShowFollowing(false)}
          />
        )}
      </div>
    </>
  );
}

/* ================================
        STYLES
================================ */
const styles = {
  wrapper: {
    maxWidth: 900,
    margin: "0 auto",
    paddingBottom: 60,
    fontFamily: "Inter, sans-serif",
  },

  cover: {
    width: "100%",
    height: 140,
    borderRadius: "0 0 16px 16px",
    background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
  },

  profileTopCard: {
    background: "#fff",
    padding: 24,
    borderRadius: 16,
    marginTop: -55,
    marginBottom: 25,
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    textAlign: "center",
  },

  avatarWrapper: {
    display: "flex",
    justifyContent: "center",
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #fff",
    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
  },

  emptyAvatar: {
    width: 110,
    height: 110,
    borderRadius: "50%",
    background: "#e1e5ff",
    color: "#4f46e5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 42,
    fontWeight: 700,
  },

  name: { fontSize: 23, fontWeight: 800 },
  username: { fontSize: 15, color: "#777" },
  location: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },

  btnRow: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginTop: 18,
    flexWrap: "wrap",
  },

  btn: {
    padding: "8px 16px",
    background: "#eef2ff",
    borderRadius: 10,
    fontSize: 14,
    border: "1px solid #d1d5ff",
    cursor: "pointer",
    transition: "0.2s ease",
  },

  statsRow: {
    display: "flex",
    gap: 16,
    marginBottom: 28,
  },

  statCard: {
    flex: 1,
    background: "#fff",
    padding: 16,
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    cursor: "pointer",
  },

  statIcon: { fontSize: 22, marginBottom: 6 },

  statValue: {
    fontSize: 22,
    fontWeight: 800,
    color: "#4f46e5",
  },

  statLabel: { fontSize: 13, color: "#666" },

  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 12,
  },

  postCard: {
    background: "#fff",
    padding: 18,
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    marginBottom: 16,
    boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
    cursor: "pointer",
  },

  postTitle: { fontSize: 18, fontWeight: 700 },

  postImage: {
    width: "100%",
    height: 220,
    objectFit: "cover",
    borderRadius: 14,
    marginBottom: 10,
  },

  postDesc: { color: "#444" },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
    fontSize: 16,
  },

  loading: {
    textAlign: "center",
    marginTop: 60,
    fontSize: 18,
    color: "#555",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },

  modalBox: {
    width: 360,
    background: "#fff",
    padding: 20,
    borderRadius: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 12,
  },

  modalUserRow: {
    display: "flex",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },

  modalAvatar: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    objectFit: "cover",
  },

  modalName: { fontWeight: 600 },
  modalUsername: { fontSize: 14, color: "#666" },

  modalCloseBtn: {
    width: "100%",
    padding: 10,
    marginTop: 16,
    borderRadius: 8,
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};
