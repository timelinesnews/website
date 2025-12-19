// pages/search.js
import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "../services/api";

/* 🔐 BACKEND URL (safe for prod + vercel) */
const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND ||
  "https://backend-7752.onrender.com";

export default function SearchPage() {
  const router = useRouter();
  const { query } = router.query;

  const [allNews, setAllNews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= IMAGE FIX ================= */
  const fullImage = (url) =>
    !url
      ? "/placeholder.jpg"
      : url.startsWith("http")
      ? url
      : `${BACKEND}/${url.replace(/^\//, "")}`;

  /* ================= LOAD ALL NEWS ================= */
  const loadNews = useCallback(async () => {
    if (!query) return;
    setLoading(true);
    try {
      const data = await api.getNews();
      setAllNews(Array.isArray(data) ? data : []);
    } catch {
      setAllNews([]);
    }
    setLoading(false);
  }, [query]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  /* ================= FILTER NEWS ================= */
  useEffect(() => {
    if (!query || allNews.length === 0) {
      setFiltered([]);
      return;
    }

    const q = query.toLowerCase();

    const results = allNews.filter((item) => {
      const text = `
        ${item.headline}
        ${(item.content || "").replace(/<[^>]+>/g, "")}
        ${item.category}
        ${item.location?.city}
        ${item.location?.state}
        ${item.location?.country}
      `
        .toLowerCase()
        .trim();

      return text.includes(q);
    });

    setFiltered(results);
  }, [query, allNews]);

  const pageTitle = query
    ? `Search: ${query} | TIMELINES`
    : "Search | TIMELINES";

  return (
    <>
      {/* 🔍 SEO (important for Adsense) */}
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={`Search results for "${query}" on TIMELINES. Find latest and local news easily.`}
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
        <h2 style={{ fontSize: "26px", fontWeight: 700 }}>
          Search Results
        </h2>

        {/* Query Label */}
        {query && (
          <p style={{ color: "#555", marginBottom: 15 }}>
            Showing results for: <b>"{query}"</b>
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ marginTop: 40, textAlign: "center" }}>
            ⏳ Loading…
          </div>
        )}

        {/* No Results */}
        {!loading && query && filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              marginTop: 40,
              color: "#777",
              fontSize: 16,
            }}
          >
            🔍 No results found.
            <div style={{ marginTop: 10, fontSize: 14 }}>
              Try different keywords or check spelling.
            </div>
          </div>
        )}

        {/* Results Count */}
        {!loading && filtered.length > 0 && (
          <div
            style={{
              marginBottom: 12,
              color: "#333",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            {filtered.length} result
            {filtered.length > 1 ? "s" : ""} found
          </div>
        )}

        {/* Results */}
        <div style={{ marginTop: 10 }}>
          {filtered.map((item) => (
            <Link
              key={item._id}
              href={`/news/${item._id}`}
              style={cardStyle}
            >
              <img
                src={fullImage(item.image)}
                alt={item.headline}
                style={imgStyle}
                loading="lazy"
              />

              <div style={{ flex: 1 }}>
                <h3 style={headlineStyle}>{item.headline}</h3>

                <div style={metaStyle}>
                  {item.category || "General"} •{" "}
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>

                <div style={descStyle}>
                  {(item.content || "")
                    .replace(/<[^>]+>/g, "")
                    .slice(0, 120)}
                  …
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

/* ===========================================================
   Styles
=========================================================== */

const cardStyle = {
  display: "flex",
  gap: 12,
  padding: 12,
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  marginBottom: 14,
  textDecoration: "none",
  color: "#111",
  transition: "transform 0.2s ease",
};

const imgStyle = {
  width: 120,
  height: 85,
  borderRadius: 10,
  objectFit: "cover",
};

const headlineStyle = {
  margin: 0,
  fontSize: 17,
  fontWeight: 700,
};

const metaStyle = {
  marginTop: 4,
  color: "#666",
  fontSize: 13,
};

const descStyle = {
  marginTop: 6,
  color: "#444",
  fontSize: 14,
  lineHeight: 1.5,
};
