import React from "react";
import Link from "next/link";

const BACKEND = "https://backend-7752.onrender.com";

export default function TrendingSlider({ items }) {
  /* =============================
        EMPTY / INVALID
  ============================= */
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div style={{ color: "#666", padding: "10px 0" }}>
        No trending news available
      </div>
    );
  }

  /* =============================
        IMAGE FIX
  ============================= */
  const fullImg = (url) => {
    if (!url) return "/placeholder.jpg";
    return url.startsWith("http")
      ? url
      : `${BACKEND}/${url.replace(/^\/+/, "")}`;
  };

  /* =============================
        FILTER SAFE ITEMS
        (prevents /news/undefined)
  ============================= */
  const safeItems = items.filter((item) => {
    if (!item?._id) {
      console.warn("⚠️ Trending item missing _id:", item);
      return false;
    }
    return true;
  });

  if (safeItems.length === 0) {
    return (
      <div style={{ color: "#666", padding: "10px 0" }}>
        No valid trending news available
      </div>
    );
  }

  return (
    <div style={styles.slider}>
      {safeItems.map((item) => {
        const newsId = String(item._id);

        const locationText = [
          item?.location?.city,
          item?.location?.state,
          item?.location?.country,
        ]
          .filter(Boolean)
          .join(", ");

        const headline =
          item?.headline || "Untitled news";

        return (
          <Link
            key={newsId}
            href={`/news/${newsId}`}
            style={styles.card}
          >
            {/* Background Image */}
            <img
              src={fullImg(item.image)}
              alt={headline}
              style={styles.image}
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg";
              }}
            />

            {/* Gradient overlay */}
            <div style={styles.overlay} />

            {/* Content */}
            <div style={styles.content}>
              {item.category && (
                <div style={styles.categoryBadge}>
                  {item.category}
                </div>
              )}

              <h3 style={styles.title}>
                {headline.length > 75
                  ? headline.slice(0, 75) + "…"
                  : headline}
              </h3>

              {locationText && (
                <div style={styles.locationBadge}>
                  📍 {locationText}
                </div>
              )}

              <div style={styles.views}>
                👁 {item.views || 0} views
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ====================== STYLES ====================== */
const styles = {
  slider: {
    display: "flex",
    overflowX: "auto",
    gap: 16,
    padding: "10px 0",
    scrollSnapType: "x mandatory",
    scrollBehavior: "smooth",

    /* Hide Scrollbars */
    msOverflowStyle: "none",
    scrollbarWidth: "none",
  },

  card: {
    minWidth: 260,
    maxWidth: 260,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    scrollSnapAlign: "start",
    flexShrink: 0,
    background: "#000",
    cursor: "pointer",
    textDecoration: "none",
    color: "#fff",
    transition: "transform 0.25s ease",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.92,
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.1) 10%, rgba(0,0,0,0.75) 100%)",
  },

  content: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    color: "#fff",
  },

  categoryBadge: {
    background: "rgba(255,255,255,0.22)",
    padding: "3px 10px",
    fontSize: 12,
    borderRadius: 20,
    display: "inline-block",
    marginBottom: 6,
    backdropFilter: "blur(3px)",
  },

  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.3,
  },

  locationBadge: {
    marginTop: 6,
    background: "rgba(255,255,255,0.25)",
    padding: "5px 10px",
    fontSize: 12,
    borderRadius: 8,
    display: "inline-block",
    backdropFilter: "blur(4px)",
  },

  views: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.9,
  },
};
