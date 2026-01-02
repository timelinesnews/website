// components/location/CitySelect.js
import React, { useEffect, useState } from "react";
import axios from "axios";

/* ============================================================
   CitySelect (Dropdown + Type)
   - Shows existing cities
   - Allows typing new city
   - Alphabets only
============================================================ */

const locationRegex = /^[A-Za-z\s]{0,50}$/;

const normalize = (t = "") =>
  t.replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function CitySelect({
  countryCode,
  stateCode,
  value,
  onChange,
  placeholder = "Enter or Select City",
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
     LOAD CITIES (backend)
  ============================================================ */
  useEffect(() => {
    let mounted = true;

    if (!countryCode || !stateCode) {
      setCities([]);
      return;
    }

    async function loadCities() {
      setLoading(true);
      try {
        const res = await axios.get(
          `${base}/locations/cities`,
          {
            params: { countryCode, stateCode },
          }
        );

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
  }, [countryCode, stateCode, base]);

  /* ============================================================
     SYNC EXTERNAL VALUE
  ============================================================ */
  useEffect(() => {
    setInput(value || "");
  }, [value]);

  /* ============================================================
     INPUT CHANGE
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
      {/* TEXT INPUT */}
      <input
        type="text"
        value={input}
        placeholder={placeholder}
        disabled={disabled || !stateCode}
        onChange={(e) => handleInput(e.target.value)}
        style={{
          ...styles.input,
          ...style,
          marginBottom: 6,
        }}
        className={className}
      />

      {/* DROPDOWN (SUGGESTIONS) */}
      {cities.length > 0 && stateCode && (
        <select
          value=""
          disabled={disabled || loading}
          onChange={(e) => handleInput(e.target.value)}
          style={styles.select}
        >
          <option value="">
            {loading ? "Loading cities…" : "Select from existing cities"}
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
