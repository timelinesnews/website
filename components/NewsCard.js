// components/NewsCard.js
import React from "react";
import Link from "next/link";

/* 🔐 BACKEND */
const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://backend-7752.onrender.com";

/* =========================
   URL NORMALIZER (SAFE)
========================= */
const fullUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("http")) return url;
  return `${BACKEND}/${url.replace(/^\/+/, "")}`;
};

export default function NewsCard({ item }) {
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
     IMAGE RESOLUTION (🔥 FINAL FIX)
  ========================= */
  const imageSrc =
    fullUrl(item.photoUrl) ||               // 📰 news image
    fullUrl(item.image) ||                  // 🖼 alt image field
    fullUrl(item.cover) ||                  // 🧱 cover
    fullUrl(item.thumbnail) ||              // 🎞 thumbnail
    "/placeholder.jpg";                     // 🧱 fallback

  /* =========================
     LOCATION
  ========================= */
  const locationText = [
    item?.location?.village,
    item?.location?.city,
    item?.location?.state,
    item?.location?.country,
  ]
    .filter(Boolean)
    .join(", ");

  /* =========================
     TEXT CLEAN
  ========================= */
  const cleanText = String(item.content || "").replace(/<[^>]+>/g, "");
  const excerpt =
    cleanText.length > 140
      ? cleanText.slice(0, 140) + "…"
      : cleanText;

  /* =========================
     DATE
  ========================= */
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
    <Link href={`/news/${newsId}`} legacyBehavior prefetch={false}>
      <a style={styles.card}>
        {/* IMAGE */}
        <img
          src={imageSrc}
          alt={item.headline || "News"}
          loading="lazy"
          style={styles.image}
          onError={(e) => {
            e.currentTarget.src = "/placeholder.jpg";
          }}
        />

        {/* CONTENT */}
        <div style={styles.content}>
          {item.category && (
            <span style={styles.category}>{item.category}</span>
          )}

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
  );
}

/* =========================
   STYLES
========================= */
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
    transition: "transform .15s ease, box-shadow .15s ease",
  },
  image: {
    width: 132,
    height: 100,
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
  category: {
    background: "#eef2ff",
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    color: "#4f46e5",
    width: "fit-content",
    marginBottom: 6,
  },
  headline: {
    fontSize: 17,
    fontWeight: 700,
    lineHeight: 1.35,
    margin: "2px 0",
  },
  location: {
    marginTop: 6,
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
};
