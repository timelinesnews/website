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

      /* 🔥 Load & NORMALIZE user's posts */
      const allNews = await api.getNews();

      const posts = (Array.isArray(allNews) ? allNews : [])
        .filter(
          (n) =>
            n?.createdBy?._id === u._id ||
            n?.userId === u._id
        )
        .map((n) => ({
          ...n,
          _id:
            n._id ||
            n.id ||
            n.newsId ||
            n?.news?._id, // 🔥 HARD NORMALIZATION
        }))
        .filter((n) => {
          if (!n._id) {
            console.warn("🚫 Dropped profile post without id:", n);
            return false;
          }
          return true;
        });

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

  /* 🔥 FIXED POST CARD */
  const PostCard = ({ item }) => {
    const postId = item?._id;

    const handleOpen = () => {
      if (!postId) {
        console.error("❌ Blocked navigation without postId:", item);
        return;
      }
      router.push(`/news/${postId}`);
    };

    return (
      <div style={styles.postCard} onClick={handleOpen}>
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
  };

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
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={`View ${user.name}'s profile and posts on TIMELINES.`}
        />
      </Head>

      <div style={styles.wrapper}>
        <div style={styles.cover}></div>

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

        <div style={styles.statsRow}>
          <StatCard label="Posts" value={myPosts.length} icon="📰" />
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

        {showFollowers && (
          <UserListModal
            title="Followers"
            list={user.followers || []}
            onClose={() => setShowFollowers(false)}
          />
        )}

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

/* ================= STYLES ================= */
const styles = { /* unchanged styles */ };
