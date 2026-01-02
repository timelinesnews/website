// components/location/CitySelect.js
import React, { useEffect, useState } from "react";
import axios from "axios";

/* ============================================================
   CitySelect (HYBRID)
   - mode="input"   → typing + suggestions (Create page)
   - mode="select"  → dropdown only (Main page)
   - DEFAULT = input
============================================================ */

const locationRegex = /^[A-Za-z\s]{0,50}$/;

const normalize = (t = "") =>
  t.replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function CitySelect({
  countryCode,
  stateCode,              // 🔥 ADDED (important)
  value,
  onChange,
  placeholder = "Enter City",
  className = "",
  style = {},
  disabled = false,
  mode = "input",
}) {
  const [cities, setCities] = useState([]);
  const [input, setInput] = useState(value || "");
  const [loading, setLoading] = useState(false);

  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://backend-7752.onrender.com/api/v1";

  /* ============================================================
     LOAD CITIES (BACKEND)
     ⚠️ backend needs countryCode + stateCode
  ============================================================ */
  useEffect(() => {
    let mounted = true;

    // dropdown ke liye stateCode mandatory
    if (!countryCode || !stateCode) {
      setCities([]);
      return;
    }

    async function loadCities() {
      setLoading(true);
      try {
        const res = await axios.get(
          `${base}/locations/cities/${countryCode}/${stateCode}`
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
     SYNC VALUE FROM PARENT
  ============================================================ */
  useEffect(() => {
    setInput(value || "");
  }, [value]);

  /* ============================================================
     HANDLE INPUT (CREATE PAGE)
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
      {/* ================= INPUT MODE ================= */}
      {mode === "input" && (
        <>
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
        </>
      )}

      {/* ================= SELECT MODE (MAIN PAGE) ================= */}
      {mode === "select" && (
        <select
          id="city"
          name="city"
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled || loading || !countryCode || !stateCode}
          style={{
            ...styles.select,
            ...style,
            backgroundColor: loading ? "#f8fafc" : "#fff",
          }}
          className={className}
        >
          <option value="">
            {loading ? "Loading cities…" : "Select City"}
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
