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

/* 🔐 BACKEND URL (single source of truth) */
const BACKEND =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://backend-7752.onrender.com";

export default function Home() {
  /* ========================= STATES ========================= */
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
    } catch {
      /* ignore */
    }
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

  /* ========================= LOAD NEWS ========================= */
  const loadNews = useCallback(async () => {
    setLoading(true);

    try {
      const data = await api.getNews();

      const safeData = Array.isArray(data)
        ? data.filter((n) => {
            if (!n?._id) {
              console.warn("⚠️ Dropped news without _id:", n);
              return false;
            }
            return true;
          })
        : [];

      setNews(safeData);
    } catch (err) {
      console.warn("Failed to load news:", err);
      setNews([]);
    }

    setLoading(false);
  }, []);

  /* 🔁 Reload news when location changes */
  useEffect(() => {
    loadNews();
  }, [loadNews, country, stateCode, cityName, village]);

  /* ========================= FIX IMAGE ========================= */
  const fixImage = useCallback(
    (url) => {
      if (!url) return "/placeholder.jpg";
      if (url.startsWith("http")) return url;
      return `${BACKEND}/${url.replace(/^\//, "")}`;
    },
    []
  );

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
      alert("Location auto-detect failed.");
    } finally {
      setDetecting(false);
    }
  };

  /* ========================= LOCATION CHANGES ========================= */
  const changeCountry = (v) => {
    setCountry(v);
    setStateCode("");
    setCityName("");
    setVillage("");
  };

  const changeState = (v) => {
    setStateCode(v);
    setCityName("");
    setVillage("");
  };

  const changeCity = (v) => {
    setCityName(v);
    setVillage("");
  };

  /* ========================= FILTER LOGIC ========================= */
  const filteredByLocation = news.filter((item) => {
    if (country && item.location?.country !== country) return false;
    if (stateCode && item.location?.state !== stateCode) return false;
    if (cityName && item.location?.city !== cityName) return false;
    if (village && item.location?.village !== village) return false;
    return true;
  });

  const filteredNews =
    activeCategory === "All"
      ? filteredByLocation
      : filteredByLocation.filter(
          (item) =>
            item.category?.toLowerCase() ===
            activeCategory.toLowerCase()
        );

  const latestNews = filteredNews
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((n) => ({
      ...n,
      image: fixImage(n.image),
    }));

  const trendingNews = filteredByLocation
    .slice()
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10)
    .map((n) => ({
      ...n,
      image: fixImage(n.image),
    }));

  /* ========================= LOADING UI ========================= */
  if (loading) {
    return (
      <div style={styles.loadingBox}>
        ⏳ Loading news...
      </div>
    );
  }

  /* ========================= UI ========================= */
  return (
    <div style={styles.container}>
      {/* ⭐ Location Bar ⭐ */}
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
          <CountrySelect value={country} onChange={changeCountry} />
        </div>

        <div style={styles.itemBox}>
          <StateSelect
            countryCode={country}
            value={stateCode}
            onChange={changeState}
          />
        </div>

        <div style={styles.itemBox}>
          <CitySelect
            countryCode={country}
            stateCode={stateCode}
            value={cityName}
            onChange={changeCity}
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
              disableTyping={true}
            />
          </div>
        )}
      </div>

      {/* TRENDING */}
      <h2 style={styles.heading}>🔥 Trending</h2>
      {trendingNews.length > 0 ? (
        <TrendingSlider items={trendingNews} />
      ) : (
        <p style={styles.emptyText}>No trending news found.</p>
      )}

      {/* CATEGORIES */}
      <h2 style={{ ...styles.heading, marginTop: 40 }}>Categories</h2>
      <CategoryTabs
        active={activeCategory}
        setActive={setActiveCategory}
      />

      {/* LATEST */}
      <h2
        style={{
          ...styles.heading,
          textAlign: "center",
          marginTop: 40,
        }}
      >
        Latest News
      </h2>

      {latestNews.length > 0 ? (
        <NewsList news={latestNews} />
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
    flexWrap: "nowrap",
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
    whiteSpace: "nowrap",
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
