// components/NewsList.js
import React from "react";
import NewsCard from "./NewsCard";
import Loader from "./Loader";

/**
 * NewsList
 *
 * Props:
 * - news: array of news items
 * - loading: boolean
 * - emptyText: string
 */
export default function NewsList({
  news = [],
  loading = false,
  emptyText = "No news found.",
}) {
  /* =============================
        LOADING
  ============================= */
  if (loading) {
    return <Loader text="Loading news…" />;
  }

  /* =============================
        INVALID / EMPTY DATA
  ============================= */
  if (!Array.isArray(news) || news.length === 0) {
    return <div style={styles.empty}>{emptyText}</div>;
  }

  /* =============================
        HARD FILTER (🔥 REAL FIX)
        allow _id OR id only
  ============================= */
  const safeNews = news.filter((item) => {
    const id = item?._id || item?.id;
    if (!id) {
      console.warn("🚫 Dropped news without id:", item);
      return false;
    }
    return true;
  });

  if (safeNews.length === 0) {
    return (
      <div style={styles.empty}>
        No valid news available.
      </div>
    );
  }

  /* =============================
        LIST
  ============================= */
  return (
    <div style={styles.list}>
      {safeNews.map((item) => {
        const key = String(item._id || item.id);

        return (
          <NewsCard
            key={key}
            item={{
              ...item,
              _id: item._id || item.id, // 🔥 normalize once
            }}
          />
        );
      })}
    </div>
  );
}

/* ====================== STYLES ====================== */
const styles = {
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  empty: {
    marginTop: 40,
    color: "#64748b",
    textAlign: "center",
    fontSize: 16,
    fontWeight: 600,
  },
};
