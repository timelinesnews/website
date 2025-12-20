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
        🔥 HARD NORMALIZATION
        (THIS WAS MISSING)
  ============================= */
  const normalizedNews = news
    .map((item) => {
      const realId =
        item?._id ||
        item?.id ||
        item?.newsId ||
        item?.news?._id;

      if (!realId) {
        console.warn("🚫 Dropped news without resolvable id:", item);
        return null;
      }

      return {
        // prefer nested news object if exists
        ...(item.news || item),

        // force correct id
        _id: String(realId),

        // normalize common fields
        image:
          item.image ||
          item.photoUrl ||
          item.news?.image ||
          item.news?.photoUrl,

        content:
          item.content ||
          item.news?.content,

        location:
          item.location ||
          item.news?.location,

        category:
          item.category ||
          item.news?.category,

        createdAt:
          item.createdAt ||
          item.news?.createdAt,

        views:
          item.views ??
          item.news?.views ??
          0,
      };
    })
    .filter(Boolean);

  if (normalizedNews.length === 0) {
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
      {normalizedNews.map((item) => (
        <NewsCard
          key={item._id}
          item={item}
        />
      ))}
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
