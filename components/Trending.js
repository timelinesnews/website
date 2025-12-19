// components/Trending.js
import React from "react";
import TrendingSlider from "./TrendingSlider";
import Loader from "./Loader";

/**
 * Trending
 *
 * Props:
 * - news: array of trending news
 * - loading: boolean (optional)
 */
export default function Trending({
  news = [],
  loading = false,
}) {
  /* =============================
        LOADING
  ============================= */
  if (loading) {
    return <Loader text="Loading trending news…" />;
  }

  /* =============================
        EMPTY
  ============================= */
  if (!Array.isArray(news) || news.length === 0) {
    return null;
  }

  return (
    <section style={styles.wrapper}>
      <h2 style={styles.title}>🔥 Trending</h2>
      <TrendingSlider news={news} />
    </section>
  );
}

/* ====================== STYLES ====================== */
const styles = {
  wrapper: {
    marginBottom: 30,
  },

  title: {
    marginBottom: 14,
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
  },
};
