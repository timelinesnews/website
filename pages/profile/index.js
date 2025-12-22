import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { api, getAuthToken } from "../../services/api";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("posts"); // posts | followers | following

  /* ================= LOAD PROFILE ================= */
  const loadProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const profileRes = await api.getProfile();
      const raw = profileRes?.user || profileRes;
      const userId = raw?._id || raw?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const normalizedUser = {
        ...raw,
        _id: String(userId),
        followers: raw?.followers || [],
        following: raw?.following || [],
      };

      setUser(normalizedUser);

      try {
        const res = await api.get(`/news/user/${normalizedUser._id}`);
        setMyPosts(res?.data || []);
      } catch {
        setMyPosts([]);
      }
    } catch (err) {
      console.warn("Profile load error:", err?.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /* ================= STATES ================= */
  if (loading) {
    return <div style={styles.loading}>⏳ Loading profile…</div>;
  }

  if (!user && getAuthToken()) {
    return (
      <div style={styles.loading}>
        ⏳ Preparing your profile…
        <p style={{ color: "#666" }}>Please wait a moment</p>
      </div>
    );
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
  const followersCount = Array.isArray(user.followers)
    ? user.followers.length
    : Number(user.followers || 0);
  const followingCount = Array.isArray(user.following)
    ? user.following.length
    : Number(user.following || 0);

  /* ================= POST CARD ================= */
  const PostCard = ({ item }) => (
    <div
      style={styles.postCard}
      onClick={() => router.push(`/news/${item._id}`)}
    >
      <h3 style={styles.postTitle}>{item.headline}</h3>
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
          <div style={{ fontSize: 13, color: "#666" }}>
            @{u.username}
          </div>
        </div>
      </div>
    );
  };

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

          {user.bio && (
            <p style={styles.bio}>{user.bio}</p>
          )}

          <div style={styles.location}>
            📍 {user.city}, {user.state}, {user.country}
          </div>

          {user.createdAt && (
            <div style={styles.memberSince}>
              Member since{" "}
              {new Date(user.createdAt).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </div>
          )}

          {/* ===== STATS ===== */}
          <div style={styles.statsRow}>
            <div
              onClick={() => setTab("posts")}
              style={{
                ...styles.statBox,
                ...(tab === "posts" ? styles.activeStat : {}),
              }}
            >
              <b>{postsCount}</b>
              <span>Posts</span>
            </div>

            <div
              onClick={() => setTab("followers")}
              style={{
                ...styles.statBox,
                ...(tab === "followers" ? styles.activeStat : {}),
              }}
            >
              <b>{followersCount}</b>
              <span>Followers</span>
            </div>

            <div
              onClick={() => setTab("following")}
              style={{
                ...styles.statBox,
                ...(tab === "following" ? styles.activeStat : {}),
              }}
            >
              <b>{followingCount}</b>
              <span>Following</span>
            </div>
          </div>

          <div style={styles.btnRow}>
            <button
              style={styles.btn}
              onClick={() => router.push("/profile/edit")}
            >
              ✏️ Edit Profile
            </button>
            <button
              style={{ ...styles.btn, background: "#fee2e2", color: "#b91c1c" }}
              onClick={() => {
                api.logout();
                router.replace("/login");
              }}
            >
              🚪 Logout
            </button>
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
  bio: {
    fontSize: 14,
    color: "#444",
    marginTop: 6,
    maxWidth: 520,
    marginInline: "auto",
  },
  location: { fontSize: 14, color: "#555", marginTop: 4 },
  memberSince: { fontSize: 12, color: "#777", marginTop: 4 },

  statsRow: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: 18,
  },
  statBox: {
    cursor: "pointer",
    textAlign: "center",
    paddingBottom: 6,
  },
  activeStat: {
    borderBottom: "2px solid #2563eb",
  },

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

  postCard: {
    background: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    cursor: "pointer",
  },
  postTitle: { fontSize: 17, fontWeight: 700 },

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

  empty: { textAlign: "center", marginTop: 30, color: "#666" },
  loading: { textAlign: "center", marginTop: 60 },
};
