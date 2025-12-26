// components/NewsCard.js
import React from "react";
import Link from "next/link";

/* 🔐 BACKEND */
const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://backend-7752.onrender.com";

/* =========================
   URL NORMALIZER (BULLETPROOF)
========================= */
const normalizeUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BACKEND}/${url.replace(/^\/+/, "")}`;
};

/* =========================
   IMAGE PICKER (🔥 GUARANTEED)
========================= */
const getImage = (item) => {
  return (
    normalizeUrl(item?.photoUrl) ||
    normalizeUrl(item?.image) ||
    normalizeUrl(item?.thumbnail) ||
    normalizeUrl(item?.cover) ||
    "/placeholder.jpg"
  );
};

export default function NewsCard({ item, showActions = false, onDelete }) {
  /* =========================
     HARD SAFETY
  ========================= */
  if (!item) return null;

  const newsId = item._id || item.id || item.newsId;
  if (!newsId) {
    console.warn("🚫 NewsCard skipped (no id)", item);
    return null;
  }

  /* =========================
     DATA
  ========================= */
  const imageSrc = getImage(item);

  const locationText = [
    item?.location?.village,
    item?.location?.city,
    item?.location?.state,
    item?.location?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const cleanText = String(item.content || "").replace(/<[^>]+>/g, "");
  const excerpt =
    cleanText.length > 140
      ? cleanText.slice(0, 140) + "…"
      : cleanText;

  const dateText = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "—";

  /* =========================
     UI
  ========================= */
  return (
    <div style={styles.wrapper}>
      <Link href={`/news/${newsId}`} legacyBehavior prefetch={false}>
        <a style={styles.card}>
          {/* IMAGE (ALWAYS PRESENT) */}
          <img
            src={imageSrc}
            alt={item.headline || "News"}
            loading="lazy"
            style={styles.image}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/placeholder.jpg";
            }}
          />

          {/* CONTENT */}
          <div style={styles.content}>
            <div style={styles.topRow}>
              {item.category && (
                <span style={styles.category}>{item.category}</span>
              )}

              {item.status && (
                <span
                  style={{
                    ...styles.status,
                    color:
                      item.status === "approved"
                        ? "#15803d"
                        : item.status === "rejected"
                          ? "#b91c1c"
                          : "#a16207",
                    background:
                      item.status === "approved"
                        ? "#dcfce7"
                        : item.status === "rejected"
                          ? "#fee2e2"
                          : "#fef9c3",
                  }}
                >
                  {item.status.toUpperCase()}
                </span>
              )}
            </div>

            <h3 style={styles.headline}>
              {item.headline || "Untitled news"}
            </h3>

            {locationText && (
              <div style={styles.location}>📍 {locationText}</div>
            )}

            {excerpt && <p style={styles.desc}>{excerpt}</p>}

            <div style={styles.meta}>
              <span>📅 {dateText}</span>
              <span>👁 {item.views ?? 0}</span>
            </div>
          </div>
        </a>
      </Link>

      {/* OWNER ACTIONS (OPTIONAL) */}
      {showActions && (
        <div style={styles.actions}>
          <button
            style={styles.actionBtn}
            onClick={() => (window.location.href = `/news/edit/${newsId}`)}
          >
            ✏️ Edit
          </button>
          <button
            style={{ ...styles.actionBtn, color: "#b91c1c" }}
            onClick={() => onDelete && onDelete(newsId)}
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  wrapper: {
    marginBottom: 14,
  },
  card: {
    display: "flex",
    gap: 14,
    padding: 14,
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    textDecoration: "none",
    color: "#111",
    transition: "transform .15s ease, box-shadow .15s ease",
  },
  image: {
    width: 140,
    height: 105,
    borderRadius: 12,
    objectFit: "cover",
    background: "#f1f5f9",
    flexShrink: 0,
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
  },
  category: {
    background: "#eef2ff",
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    color: "#4f46e5",
  },
  status: {
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 999,
    fontWeight: 700,
  },
  headline: {
    fontSize: 17,
    fontWeight: 700,
    lineHeight: 1.35,
    margin: "6px 0 2px",
  },
  location: {
    marginTop: 4,
    background: "#e7f5ff",
    color: "#1c7ed6",
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 13,
    width: "fit-content",
  },
  desc: {
    marginTop: 6,
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.45,
  },
  meta: {
    marginTop: "auto",
    fontSize: 12,
    color: "#64748b",
    display: "flex",
    justifyContent: "space-between",
  },
  actions: {
    display: "flex",
    gap: 10,
    marginTop: 8,
  },
  actionBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#f8fafc",
    cursor: "pointer",
    fontWeight: 600,
  },
};
