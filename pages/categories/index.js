// pages/categories/index.js
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const categories = [
  "Trending",
  "Latest",
  "Politics",
  "Sports",
  "Technology",
  "Entertainment",
  "World",
  "Business",
  "Health",
  "Local",
  "Education",
  "Travel",
  "Crime",
  "Weather",
  "Other",
];

export default function CategoriesPage() {
  const router = useRouter();

  const openCategory = (cat) => {
    router.push(`/categories/${encodeURIComponent(cat)}`);
  };

  return (
    <>
      {/* 🔍 SEO (important for Adsense & Google) */}
      <Head>
        <title>News Categories | TIMELINES</title>
        <meta
          name="description"
          content="Explore news categories like Politics, Sports, Technology, Entertainment, Business, Health and more on TIMELINES."
        />
      </Head>

      <div
        style={{
          maxWidth: "900px",
          margin: "25px auto",
          padding: "20px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
          }}
        >
          Categories
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "16px",
          }}
        >
          {categories.map((cat) => (
            <div
              key={cat}
              onClick={() => openCategory(cat)}
              style={card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 22px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(0,0,0,0.08)";
              }}
            >
              <div style={emoji}>{pickEmoji(cat)}</div>
              <div style={title}>{cat}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ================= STYLES ================= */
const card = {
  background: "#ffffff",
  padding: "24px 18px",
  borderRadius: "14px",
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  cursor: "pointer",
  textAlign: "center",
  transition: "all 0.25s ease",
  border: "1px solid #eef0f3",
};

const emoji = {
  fontSize: "34px",
  marginBottom: "10px",
};

const title = {
  fontSize: "17px",
  fontWeight: "600",
  color: "#333",
};

/* ================= EMOJI PICKER ================= */
function pickEmoji(cat) {
  switch (cat.toLowerCase()) {
    case "trending":
      return "🔥";
    case "latest":
      return "⏱️";
    case "politics":
      return "🏛️";
    case "sports":
      return "⚽";
    case "technology":
      return "💻";
    case "entertainment":
      return "🎬";
    case "world":
      return "🌍";
    case "business":
      return "💼";
    case "health":
      return "❤️";
    case "local":
      return "📍";
    case "education":
      return "📚";
    case "travel":
      return "✈️";
    case "crime":
      return "🚨";
    case "weather":
      return "⛅";
    default:
      return "📰";
  }
}
