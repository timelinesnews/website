// components/location/CountrySelect.js
import React, { useEffect, useState } from "react";
import axios from "axios";

/* ============================================================================
   COUNTRY SELECT (PRODUCTION READY)
   - Endpoint auto-detection
   - LocalStorage cache with expiry
   - Defensive data normalization
   - Clean, consistent UI
============================================================================ */

export default function CountrySelect({
  value,
  onChange,
  apiBase,
  placeholder = "Select Country",
  style = {},
  className = "",
  disabled = false,
}) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const base =
    apiBase ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://backend-7752.onrender.com/api/v1";

  const ENDPOINTS = [
    "/locations/countries",
    "/api/locations/countries",
    "/api/v1/locations/countries",
    "/countries",
  ];

  const CACHE_KEY = "tl_countries_cache_v1";
  const CACHE_EXPIRY = 1000 * 60 * 60 * 24 * 7; // 7 days

  /* ============================================================================
     LOAD COUNTRIES (CACHE + AUTO ENDPOINT)
  ============================================================================ */
  useEffect(() => {
    let mounted = true;

    async function loadCountries() {
      setLoading(true);
      setError("");

      /* -----------------------------
         1️⃣ CACHE CHECK (CLIENT ONLY)
      ----------------------------- */
      if (typeof window !== "undefined") {
        try {
          const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
          if (cached && Date.now() - cached.time < CACHE_EXPIRY) {
            if (mounted) setCountries(cached.data);
            setLoading(false);
            return;
          }
        } catch {
          /* ignore cache errors */
        }
      }

      /* -----------------------------
         2️⃣ TRY ENDPOINTS
      ----------------------------- */
      let response = null;

      for (const ep of ENDPOINTS) {
        try {
          const res = await axios.get(base + ep);
          if (res?.status === 200) {
            response = res;
            break;
          }
        } catch {
          /* try next endpoint */
        }
      }

      if (!response) {
        if (mounted) setError("Unable to load countries");
        setLoading(false);
        return;
      }

      /* -----------------------------
         3️⃣ NORMALIZE DATA
      ----------------------------- */
      let list = response.data?.data || response.data || [];
      if (!Array.isArray(list)) list = [];

      const normalized = list
        .map((item) => ({
          code:
            item.code ||
            item.country_code ||
            item.short ||
            item._id ||
            item.name,
          name: item.name || item.country || item.code,
        }))
        .filter((c) => c.code && c.name)
        .sort((a, b) => a.name.localeCompare(b.name));

      /* -----------------------------
         4️⃣ SAVE CACHE
      ----------------------------- */
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ time: Date.now(), data: normalized })
          );
        } catch {
          /* ignore cache errors */
        }
      }

      if (mounted) setCountries(normalized);
      setLoading(false);
    }

    loadCountries();
    return () => {
      mounted = false;
    };
  }, [base]);

  /* ============================================================================
     UI
  ============================================================================ */
  return (
    <div style={styles.wrapper}>
      <select
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled || loading || !!error}
        className={className}
        style={{
          ...styles.select,
          ...style,
          backgroundColor: loading ? "#f8fafc" : "#fff",
        }}
      >
        <option value="">
          {loading ? "Loading countries…" : placeholder}
        </option>

        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>

      {error && (
        <span style={styles.error}>
          {error}. Please refresh.
        </span>
      )}
    </div>
  );
}

/* ============================================================================
   STYLES
============================================================================ */
const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  select: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    fontSize: 15,
    cursor: "pointer",
    width: "100%",
    outline: "none",
    transition: "border 0.15s ease",
  },

  error: {
    fontSize: 13,
    color: "#dc2626",
    fontWeight: 600,
  },
};
