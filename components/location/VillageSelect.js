// components/location/VillageSelect.js
import React, { useEffect, useState } from "react";
import axios from "axios";

/* ============================================================
   VillageSelect (Dropdown + Type)
   - Shows existing villages (backend)
   - Allows typing new village
   - Alphabets only
============================================================ */

const locationRegex = /^[A-Za-z\s]{0,50}$/;

const normalize = (t = "") =>
  t.replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function VillageSelect({
  countryCode,
  stateCode,
  cityName,
  value,
  onChange,
  placeholder = "Enter or Select Village",
  className = "",
  style = {},
  disabled = false,
}) {
  const [villages, setVillages] = useState([]);
  const [input, setInput] = useState(value || "");
  const [loading, setLoading] = useState(false);

  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://backend-7752.onrender.com/api/v1";

  /* ============================================================
     LOAD VILLAGES (backend)
  ============================================================ */
  useEffect(() => {
    let mounted = true;

    if (!countryCode || !stateCode || !cityName) {
      setVillages([]);
      return;
    }

    async function loadVillages() {
      setLoading(true);
      try {
        const res = await axios.get(
          `${base}/locations/villages`,
          {
            params: { countryCode, stateCode, cityName },
          }
        );

        const data = Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        if (mounted) {
          setVillages(
            data
              .map((v) => v.name)
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b))
          );
        }
      } catch (err) {
        console.error("❌ VillageSelect load error:", err);
        if (mounted) setVillages([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadVillages();
    return () => {
      mounted = false;
    };
  }, [countryCode, stateCode, cityName, base]);

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
        disabled={disabled || !cityName}
        onChange={(e) => handleInput(e.target.value)}
        style={{
          ...styles.input,
          ...style,
          marginBottom: 6,
        }}
        className={className}
      />

      {/* DROPDOWN (SUGGESTIONS) */}
      {villages.length > 0 && cityName && (
        <select
          value=""
          disabled={disabled || loading}
          onChange={(e) => handleInput(e.target.value)}
          style={styles.select}
        >
          <option value="">
            {loading ? "Loading villages…" : "Select from existing villages"}
          </option>

          {villages.map((v) => (
            <option key={v} value={v}>
              {v}
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
