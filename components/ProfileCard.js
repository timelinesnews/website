import React from "react";

/* 🔐 BACKEND URL */
const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND ||
  "https://backend-7752.onrender.com";

export default function ProfileCard({ user }) {
  if (!user) return null;

  /* =============================
        AVATAR FIX
  ============================= */
  const avatarUrl = (() => {
    if (!user.avatar) return "/user-avatar.png";
    if (user.avatar.startsWith("http")) return user.avatar;
    return `${BACKEND}/${user.avatar.replace(/^\/+/, "")}`;
  })();

  /* =============================
        LOCATION TEXT
  ============================= */
  const locationText = [
    user.city,
    user.state,
    user.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div style={styles.card}>
      {/* AVATAR */}
      <img
        src={avatarUrl}
        alt={user.username || "User avatar"}
        style={styles.avatar}
        onError={(e) => {
          e.currentTarget.src = "/user-avatar.png";
        }}
      />

      {/* INFO */}
      <div style={{ flex: 1 }}>
        <h2 style={styles.name}>
          {user.name || "Unnamed User"}
        </h2>

        {user.username && (
          <div style={styles.username}>
            @{user.username}
          </div>
        )}

        {locationText && (
          <div style={styles.location}>
            📍 {locationText}
          </div>
        )}
      </div>
    </div>
  );
}

/* ====================== STYLES ====================== */
const styles = {
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 14,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginBottom: 20,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    objectFit: "cover",
    background: "#f1f5f9",
    flexShrink: 0,
    border: "2px solid #e5e7eb",
  },

  name: {
    margin: "0 0 4px",
    fontWeight: 800,
    fontSize: 20,
    color: "#111",
  },

  username: {
    color: "#4f46e5",
    fontWeight: 600,
    marginBottom: 6,
  },

  location: {
    fontSize: 14,
    color: "#555",
  },
};
