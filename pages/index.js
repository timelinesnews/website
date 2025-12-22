"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";

import CategoryTabs from "../components/CategoryTabs";
import TrendingSlider from "../components/TrendingSlider";
import NewsList from "../components/NewsList";

import CountrySelect from "../components/location/CountrySelect";
import StateSelect from "../components/location/StateSelect";
import CitySelect from "../components/location/CitySelect";
import VillageSelect from "../components/location/VillageSelect";

/* 🔐 BACKEND URL */
const BACKEND =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://backend-7752.onrender.com";

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const [country, setCountry] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [cityName, setCityName] = useState("");
  const [village, setVillage] = useState("");
  const [detecting, setDetecting] = useState(false);

  /* ========================= LOAD SAVED LOCATION ========================= */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(localStorage.getItem("tl_location") || "{}");
      setCountry(saved.country || "");
      setStateCode(saved.state || "");
      setCityName(saved.city || "");
      setVillage(saved.village || "");
    } catch { }
  }, []);

  /* ========================= SAVE LOCATION ========================= */
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      "tl_location",
      JSON.stringify({
        country,
        state: stateCode,
        city: cityName,
        village,
      })
    );
  }, [country, stateCode, cityName, village]);

  /* ========================= LOAD NEWS (FIXED) ========================= */
  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/news");

      // ✅ CORRECT DATA EXTRACTION (THIS WAS THE BUG)
      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      console.log("NEWS FROM API:", list); // 👈 debug

      if (!list.length) {
        setNews([]);
        setLoading(false);
        return;
      }

      const sorted = list
        .filter((n) => n && n._id)
        .sort(
          (a, b) =>
            (b.views || 0) - (a.views || 0) ||
            new Date(b.createdAt) - new Date(a.createdAt)
        );

      setNews(sorted);
    } catch (err) {
      console.error("Failed to load news:", err);
      setNews([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  /* ========================= IMAGE FIX ========================= */
  const fixImage = (url) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http")) return url;
    return `${BACKEND}/${url.replace(/^\//, "")}`;
  };

  /* ========================= AUTO LOCATION ========================= */
  const autoLocate = async () => {
    try {
      setDetecting(true);
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      setCountry(data.country_code || "");
      setStateCode(data.region_code || "");
      setCityName(data.city || "");
      setVillage("");
    } catch {
      alert("Auto location failed");
    } finally {
      setDetecting(false);
    }
  };

  /* ========================= LOCATION FILTER ========================= */
  const locationFiltered = news.filter((item) => {
    if (country && item.location?.country !== country) return false;
    if (stateCode && item.location?.state !== stateCode) return false;
    if (cityName && item.location?.city !== cityName) return false;
    if (village && item.location?.village !== village) return false;
    return true;
  });

  /* ========================= CATEGORY FILTER ========================= */
  const categoryFiltered =
    activeCategory === "All"
      ? locationFiltered
      : locationFiltered.filter(
        (n) =>
          n.category?.toLowerCase() ===
          activeCategory.toLowerCase()
      );

  // 🛟 FALLBACK: AT LEAST ONE POST
  const finalNews =
    categoryFiltered.length > 0
      ? categoryFiltered
      : news.length > 0
        ? [news[0]]
        : [];

  const trendingNews = news.slice(0, 10);

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        ⏳ Loading news...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ⭐ LOCATION BAR */}
      <div style={styles.locationBar}>
        <button
          onClick={autoLocate}
          disabled={detecting}
          style={{
            ...styles.autoBtn,
            opacity: detecting ? 0.6 : 1,
          }}
        >
          {detecting ? "Detecting..." : "📍 Auto Locate"}
        </button>

        <div style={styles.itemBox}>
          <CountrySelect value={country} onChange={setCountry} />
        </div>

        <div style={styles.itemBox}>
          <StateSelect
            countryCode={country}
            value={stateCode}
            onChange={setStateCode}
          />
        </div>

        <div style={styles.itemBox}>
          <CitySelect
            countryCode={country}
            stateCode={stateCode}
            value={cityName}
            onChange={setCityName}
          />
        </div>

        {cityName && (
          <div style={styles.itemBox}>
            <VillageSelect
              countryCode={country}
              stateCode={stateCode}
              cityName={cityName}
              value={village}
              onChange={setVillage}
              disableTyping
            />
          </div>
        )}
      </div>

      {/* 🔥 TRENDING */}
      <h2 style={styles.heading}>🔥 Most Viewed</h2>
      {trendingNews.length > 0 ? (
        <TrendingSlider items={trendingNews} />
      ) : (
        <p style={styles.emptyText}>No trending news found.</p>
      )}

      {/* 📂 CATEGORIES */}
      <h2 style={{ ...styles.heading, marginTop: 40 }}>
        Categories
      </h2>
      <CategoryTabs
        active={activeCategory}
        setActive={setActiveCategory}
      />

      {/* 📰 NEWS */}
      <h2
        style={{
          ...styles.heading,
          textAlign: "center",
          marginTop: 40,
        }}
      >
        News
      </h2>

      {finalNews.length > 0 ? (
        <NewsList
          news={finalNews.map((n) => ({
            ...n,
            image: fixImage(n.photoUrl),
          }))}
        />
      ) : (
        <p style={styles.emptyText}>No news found.</p>
      )}
    </div>
  );
}

/* ========================= STYLES ========================= */
const styles = {
  container: {
    maxWidth: 1120,
    margin: "40px auto",
    padding: "0 18px",
  },
  locationBar: {
    background: "#fff",
    padding: "14px 20px",
    borderRadius: 12,
    boxShadow: "0 4px 14px rgba(0,0,0,0.07)",
    display: "flex",
    gap: 14,
    overflowX: "auto",
    whiteSpace: "nowrap",
    marginBottom: 35,
  },
  itemBox: {
    minWidth: 160,
    display: "inline-block",
  },
  autoBtn: {
    padding: "10px 18px",
    background: "#4f46e5",
    color: "#fff",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
  },
  emptyText: {
    color: "#777",
    fontSize: 16,
  },
  loadingBox: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 20,
    color: "#444",
  },
};
