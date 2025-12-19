import React from "react";

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND || "https://backend-7752.onrender.com";

export default function CommentItem({ comment, onDelete, userId }) {
  if (!comment) return null;

  const isOwner = comment.user?._id === userId;

  /* =============================
        AVATAR HANDLER
  ============================= */
  const avatar =
    comment.user?.avatar
      ? comment.user.avatar.startsWith("http")
        ? comment.user.avatar
        : `${BACKEND}/${comment.user.avatar.replace(/^\/+/, "")}`
      : "/user-avatar.png";

  /* =============================
        DATE FORMAT
  ============================= */
  const timeText = comment.createdAt
    ? new Date(comment.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div style={styles.card}>
      <div style={styles.row}>
        {/* AVATAR */}
        <img
          src={avatar}
          alt="avatar"
          style={styles.avatar}
        />

        {/* CONTENT */}
        <div style={styles.content}>
          {/* NAME + TIME */}
          <div style={styles.header}>
            <span style={styles.name}>
              {comment.user?.name ||
                comment.user?.username ||
                "User"}
            </span>
            <span style={styles.time}>{timeText}</span>
          </div>

          {/* TEXT */}
          <div style={styles.text}>{comment.text}</div>
        </div>

        {/* DELETE */}
        {isOwner && (
          <button
            onClick={() => onDelete?.(comment._id)}
            style={styles.deleteBtn}
            title="Delete comment"
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================
   STYLES
============================ */
const styles = {
  card: {
    background: "#ffffff",
    padding: 14,
    borderRadius: 14,
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },

  row: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    objectFit: "cover",
    background: "#f1f5f9",
  },

  content: {
    flex: 1,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },

  name: {
    fontWeight: 700,
    fontSize: 15,
    color: "#0f172a",
  },

  time: {
    fontSize: 12,
    color: "#64748b",
    whiteSpace: "nowrap",
  },

  text: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 1.45,
    marginTop: 4,
    wordBreak: "break-word",
  },

  deleteBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    color: "#dc2626",
    padding: 4,
  },
};
