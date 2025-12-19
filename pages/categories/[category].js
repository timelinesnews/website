// pages/categories/[category].js
import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "../../services/api";

/* 🔐 BACKEND URL (safe for prod) */
const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND ||
  "https://backend-7752.onrender.com";

export default function CategoryPage() {
  const router = useRouter();
  const { category } = router.query;

  const [news, setNews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= IMAGE FIX ================= */
  const fullImg = (url) =>
    !url
      ? "/placeholder.jpg"
      : url.startsWith("http")
      ? url
      : `${BACKEND}/${url.replace(/^\//, "")}`;

  /* ================= LOAD NEWS ================= */
  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const all = await api.getNews();
      setNews(Array.isArray(all) ? all : []);
    } catch (e) {
      console.warn("Failed to load category news");
      setNews([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  /* ================= FILTER LOGIC ================= */
  useEffect(() => {
    if (!category || !news.length) return;

    const cat = category.toLowerCase();

    let results = [];

    if (cat === "latest") {
      results = [...news].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (cat === "trending") {
      results = [...news]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 20);
    } else {
      results = news.filter(
        (item) => item.category?.toLowerCase() === cat
      );
    }

    setFiltered(results);
  }, [category, news]);

  const titleText = category
    ? `${category.charAt(0).toUpperCase() + category.slice(1)} News`
    : "Category News";

  return (
    <>
      {/* 🔍 SEO (very important for Adsense) */}
      <Head>
        <title>{titleText} | TIMELINES</title>
        <meta
          name="description"
          content={`Read latest ${category} news on TIMELINES. Stay updated with verified and local news stories.`}
        />
      </Head>

      <div
        style={{
          maxWidth: "900px",
          margin: "20px auto",
          padding: "20px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: 10,
            textTransform: "capitalize",
          }}
        >
          {titleText}
        </h1>

        <p style={{ color: "#666", marginBottom: 20 }}>
          Showing results for: <b>{category}</b>
        </p>

        {/* Loading */}
        {loading && <div>⏳ Loading news...</div>}

        {/* No Results */}
        {!loading && filtered.length === 0 && (
          <p style={{ color: "#999", marginTop: 20 }}>
            No news found in this category.
          </p>
        )}

        {/* News Cards */}
        <div>
          {filtered.map((item) => (
            <Link
              key={item._id}
              href={`/news/${item._id}`}
              style={card}
            >
              {/* Image */}
              <img
                src={fullImg(item.image)}
                alt={item.headline}
                style={imgStyle}
                loading="lazy"
              />

              {/* Info */}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>
                  {item.headline}
                </h3>

                <div
                  style={{
                    marginTop: 6,
                    color: "#666",
                    fontSize: 13,
                  }}
                >
                  {item.category} •{" "}
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>

                <p
                  style={{
                    marginTop: 6,
                    color: "#444",
                    fontSize: 14,
                  }}
                >
                  {(item.content || "")
                    .replace(/<[^>]+>/g, "")
                    .slice(0, 110)}
                  …
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

/* ================= STYLES ================= */

const card = {
  display: "flex",
  gap: 12,
  padding: 12,
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  marginBottom: 14,
  textDecoration: "none",
  color: "#111",
  cursor: "pointer",
  transition: "transform 0.2s ease",
};

const imgStyle = {
  width: 120,
  height: 85,
  borderRadius: 10,
  objectFit: "cover",
};
