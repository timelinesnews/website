// components/location/StateSelect.js
import React, { useEffect, useState } from "react";
import axios from "axios";

/* ============================================================================
   🇮🇳 INDIA STATES (FALLBACK / FAST LOAD)
============================================================================ */
const INDIA_STATES = [
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "DL", name: "Delhi" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JK", name: "Jammu & Kashmir" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "MH", name: "Maharashtra" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "OD", name: "Odisha" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TG", name: "Telangana" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
];

export default function StateSelect({
  countryCode,
  value,
  onChange,
  placeholder = "Select State",
  style = {},
  className = "",
  disabled = false,
}) {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);

  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://backend-7752.onrender.com/api/v1";

  /* ============================================================================
     LOAD STATES WHEN COUNTRY CHANGES
     - Instant India fallback
     - Backend fetch for others
     - Safe normalization
  ============================================================================ */
  useEffect(() => {
    let mounted = true;

    if (!countryCode) {
      setStates([]);
      onChange?.("");
      return;
    }

    // 🇮🇳 INDIA → INSTANT LOAD
    if (
      countryCode === "IN" ||
      countryCode === "IND" ||
      countryCode === "India"
    ) {
      setStates(INDIA_STATES);
      return;
    }

    async function fetchStates() {
      setLoading(true);

      try {
        const res = await axios.get(
          `${base}/locations/states/${countryCode}`
        );

        let data = res.data?.data || res.data || [];
        if (!Array.isArray(data)) data = [];

        const normalized = data
          .map((s) => ({
            code:
              s.code ||
              s.state_code ||
              s.short ||
              s._id ||
              s.name,
            name: s.name || s.state_name || s.code,
          }))
          .filter((s) => s.code && s.name)
          .sort((a, b) => a.name.localeCompare(b.name));

        if (mounted) {
          setStates(
            normalized.length > 0 ? normalized : INDIA_STATES
          );
        }
      } catch (err) {
        console.error("❌ StateSelect error:", err);
        if (mounted) setStates(INDIA_STATES);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchStates();
    return () => {
      mounted = false;
    };
  }, [countryCode, base, onChange]);

  /* ============================================================================
     UI
  ============================================================================ */
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={!countryCode || loading || disabled}
      className={className}
      style={{
        ...styles.select,
        ...style,
        backgroundColor: loading ? "#f8fafc" : "#fff",
      }}
    >
      <option value="">
        {loading ? "Loading states…" : placeholder}
      </option>

      {states.map((s) => (
        <option key={s.code} value={s.code}>
          {s.name}
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
    fontSize: 15,
    width: "100%",
    cursor: "pointer",
    outline: "none",
    transition: "border 0.15s ease",
  },
};
