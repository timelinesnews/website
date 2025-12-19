// components/NewsCard.js
import React from "react";
import Link from "next/link";

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND ||
  "https://backend-7752.onrender.com";

export default function NewsCard({ item }) {
  // ❌ no item or no id → render nothing
  if (!item || !item._id) return null;

  // ✅ always use string id
  const newsId = String(item._id);

  /* =============================
        IMAGE HANDLER
  ============================= */
  const fixImage = (url) => {
    if (!url) return "/placeholder.jpg";
    return url.startsWith("http")
      ? url
      : `${BACKEND}/${url.replace(/^\/+/, "")}`;
  };

  /* =============================
        LOCATION TEXT
  ============================= */
  const locationText = [
    item?.location?.village,
    item?.location?.city,
    item?.location?.state,
    item?.location?.country,
  ]
    .filter(Boolean)
    .join(", ");

  /* =============================
        CLEAN EXCERPT (NO HTML)
  ============================= */
  const cleanText = item?.content
    ? item.content.replace(/<[^>]+>/g, "")
    : "";

  const excerpt =
    cleanText.length > 140
      ? cleanText.slice(0, 140) + "…"
      : cleanText;

  /* =============================
        DATE
  ============================= */
  const dateText = item?.createdAt
    ? new Date(item.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <Link href={`/news/${newsId}`} style={styles.card}>
      {/* IMAGE */}
      <img
        src={fixImage(item.image)}
        alt={item.headline || "News image"}
        loading="lazy"
        style={styles.img}
      />

      {/* CONTENT */}
      <div style={styles.content}>
        {/* CATEGORY */}
        {item.category && (
          <span style={styles.category}>{item.category}</span>
        )}

        {/* HEADLINE */}
        <h3 style={styles.headline}>
          {item.headline || "Untitled news"}
        </h3>

        {/* LOCATION */}
        {locationText && (
          <div style={styles.locationBadge}>
            📍 {locationText}
          </div>
        )}

        {/* EXCERPT */}
        {excerpt && <p style={styles.desc}>{excerpt}</p>}

        {/* META */}
        <div style={styles.metaRow}>
          <span>📅 {dateText}</span>
          <span>👁 {item.views ?? 0}</span>
        </div>
      </div>
    </Link>
  );
}

/* ====================== STYLES ====================== */
const styles = {
  card: {
    display: "flex",
    gap: 14,
    padding: 14,
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    textDecoration: "none",
    color: "#111",
    cursor: "pointer",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },

  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  img: {
    width: 132,
    height: 100,
    borderRadius: 12,
    objectFit: "cover",
    flexShrink: 0,
    background: "#f1f5f9",
  },

  category: {
    background: "#eef2ff",
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    color: "#4f46e5",
    marginBottom: 6,
    width: "fit-content",
  },

  headline: {
    margin: "2px 0",
    fontSize: 17,
    fontWeight: 700,
    lineHeight: 1.35,
  },

  locationBadge: {
    marginTop: 6,
    background: "#e7f5ff",
    color: "#1c7ed6",
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    width: "fit-content",
  },

  desc: {
    marginTop: 6,
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.45,
  },

  metaRow: {
    marginTop: "auto",
    paddingTop: 10,
    fontSize: 12,
    color: "#64748b",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
};
