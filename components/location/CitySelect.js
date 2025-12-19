// components/location/CitySelect.js
import React, { useEffect, useState } from "react";
import axios from "axios";

/* ============================================================================
   🇮🇳 PUNJAB FALLBACK (ONLY IF BACKEND FAILS)
============================================================================ */
const PUNJAB_CITIES = [
  "Ludhiana",
  "Amritsar",
  "Jalandhar",
  "Patiala",
  "Bathinda",
  "Mohali",
  "Hoshiarpur",
  "Moga",
  "Firozpur",
  "Fatehgarh Sahib",
  "Barnala",
  "Mansa",
  "Kapurthala",
  "Sangrur",
  "Faridkot",
  "Gurdaspur",
  "Pathankot",
  "Rupnagar",
  "Muktsar",
  "Tarn Taran",
];

const fallbackPunjab = PUNJAB_CITIES.map((name) => ({ name }));

export default function CitySelect({
  countryCode,
  stateCode,
  value,
  onChange,
  placeholder = "Select City",
  className = "",
  style = {},
  disabled = false,
}) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://backend-7752.onrender.com/api/v1";

  const CACHE_KEY = `tl_cities_${countryCode}_${stateCode}`;

  /* ============================================================================
     LOAD CITIES ON COUNTRY / STATE CHANGE
     - Session cache
     - Backend fetch
     - Punjab fallback
  ============================================================================ */
  useEffect(() => {
    let mounted = true;

    if (!countryCode || !stateCode) {
      setCities([]);
      onChange?.("");
      return;
    }

    async function loadCities() {
      setLoading(true);

      /* -----------------------------
         1️⃣ CACHE (SESSION)
      ----------------------------- */
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (mounted) setCities(parsed);
          setLoading(false);
          return;
        }
      } catch {
        /* ignore cache errors */
      }

      /* -----------------------------
         2️⃣ BACKEND
      ----------------------------- */
      try {
        const res = await axios.get(
          `${base}/locations/cities/${countryCode}/${stateCode}`
        );

        let data = res.data?.data || res.data || [];
        if (!Array.isArray(data)) data = [];

        const normalized = data
          .map((c) => ({
            name:
              c.name ||
              c.city ||
              c.label ||
              c.district ||
              c.value ||
              "",
          }))
          .filter((c) => c.name)
          .sort((a, b) => a.name.localeCompare(b.name));

        // Punjab fallback if backend empty
        const finalData =
          normalized.length === 0 &&
          stateCode.toUpperCase() === "PB"
            ? fallbackPunjab
            : normalized;

        if (mounted) setCities(finalData);

        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify(finalData)
          );
        } catch {
          /* ignore cache errors */
        }
      } catch (err) {
        console.error("❌ CitySelect error:", err);

        if (mounted) {
          setCities(
            stateCode.toUpperCase() === "PB"
              ? fallbackPunjab
              : []
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCities();
    return () => {
      mounted = false;
    };
  }, [countryCode, stateCode, base, onChange]);

  /* ============================================================================
     UI
  ============================================================================ */
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={!stateCode || loading || disabled}
      className={className}
      style={{
        ...styles.select,
        ...style,
        backgroundColor: loading ? "#f8fafc" : "#fff",
      }}
    >
      <option value="">
        {loading ? "Loading cities…" : placeholder}
      </option>

      {cities.map((c, idx) => (
        <option key={`${c.name}-${idx}`} value={c.name}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

/* ============================================================================
   STYLES
============================================================================ */
const styles = {
  select: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    width: "100%",
    fontSize: 15,
    cursor: "pointer",
    outline: "none",
    transition: "border 0.15s ease",
  },
};
