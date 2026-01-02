// components/location/CitySelect.js
import React, { useEffect, useState } from "react";
import axios from "axios";

/* ============================================================
   CitySelect (Type + Optional Dropdown)
   - City manually type ho sakdi aa
   - Existing cities backend ton suggest hon
============================================================ */

const locationRegex = /^[A-Za-z\s]{0,50}$/;

const normalize = (t = "") =>
  t.replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function CitySelect({
  countryCode,
  value,
  onChange,
  placeholder = "Enter City",
  className = "",
  style = {},
  disabled = false,
}) {
  const [cities, setCities] = useState([]);
  const [input, setInput] = useState(value || "");
  const [loading, setLoading] = useState(false);

  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://backend-7752.onrender.com/api/v1";

  /* ============================================================
     LOAD CITIES (OPTIONAL SUGGESTIONS)
     🔥 stateCode dependency removed
  ============================================================ */
  useEffect(() => {
    let mounted = true;

    if (!countryCode) {
      setCities([]);
      return;
    }

    async function loadCities() {
      setLoading(true);
      try {
        const res = await axios.get(`${base}/locations/cities`, {
          params: { countryCode },
        });

        const data = Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        if (mounted) {
          setCities(
            data
              .map((c) => c.name)
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b))
          );
        }
      } catch (err) {
        console.error("❌ CitySelect load error:", err);
        if (mounted) setCities([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCities();
    return () => {
      mounted = false;
    };
  }, [countryCode, base]);

  /* ============================================================
     SYNC VALUE FROM PARENT
  ============================================================ */
  useEffect(() => {
    setInput(value || "");
  }, [value]);

  /* ============================================================
     HANDLE INPUT
  ============================================================ */
  const handleInput = (v) => {
    if (!locationRegex.test(v)) return;

    setInput(v);
    onChange?.(normalize(v));
  };

  /* ============================================================
     UI
  ============================================================ */
  return (
    <div style={{ width: "100%" }}>
      {/* CITY INPUT */}
      <input
        type="text"
        id="city"
        name="city"
        value={input}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => handleInput(e.target.value)}
        style={{
          ...styles.input,
          ...style,
          marginBottom: cities.length ? 6 : 0,
        }}
        className={className}
      />

      {/* CITY SUGGESTIONS (OPTIONAL) */}
      {cities.length > 0 && (
        <select
          value=""
          disabled={disabled || loading}
          onChange={(e) => handleInput(e.target.value)}
          style={styles.select}
          name="city_suggestions"
        >
          <option value="">
            {loading ? "Loading cities…" : "Select existing city"}
          </option>

          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

/* ============================================================
   STYLES
============================================================ */
const styles = {
  input: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    width: "100%",
    fontSize: 15,
    outline: "none",
  },
  select: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    width: "100%",
    fontSize: 14,
    background: "#fafafa",
    cursor: "pointer",
  },
};
