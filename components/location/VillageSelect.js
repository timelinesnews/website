// components/location/VillageSelect.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

/* ============================================================================
   🇮🇳 PUNJAB FALLBACK VILLAGES
============================================================================ */
const PUNJAB_FALLBACK = {
  Ludhiana: ["Dehlon", "Dakha", "Gill", "Mullanpur", "Jodhan", "Sahnewal"],
  Amritsar: ["Ajnala", "Chheharta", "Raja Sansi", "Jandiala"],
  Jalandhar: ["Adampur", "Kartarpur", "Nakodar"],
  Moga: ["Baghapurana", "Nihal Singh Wala"],
  Barnala: ["Tapa", "Dhanaula"],
};

const normalize = (list) =>
  Array.isArray(list) ? list.map((name) => ({ name })) : [];

/* ============================================================================
   DEBOUNCE HELPER
============================================================================ */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ============================================================================
   COMPONENT
============================================================================ */
export default function VillageSelect({
  countryCode,
  stateCode,
  cityName,
  value,
  onChange,
  placeholder = "Select Village",
  disableTyping = false,
  disabled = false,
  style = {},
  className = "",
}) {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://backend-7752.onrender.com/api/v1";

  const CACHE_KEY = `tl_villages_${countryCode}_${stateCode}_${cityName}`;

  /* ============================================================================
     FETCH VILLAGES
  ============================================================================ */
  const fetchVillages = async (query = "") => {
    if (!countryCode || !stateCode || !cityName) {
      setVillages([]);
      onChange?.("");
      return;
    }

    // Cache only full list
    if (query === "") {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          setVillages(JSON.parse(cached));
          return;
        }
      } catch {
        /* ignore cache errors */
      }
    }

    setLoading(true);

    try {
      const res = await axios.get(
        `${base}/locations/villages`,
        {
          params: {
            countryCode,
            stateCode,
            cityName,
            search: query,
            limit: 200,
          },
        }
      );

      let data = res.data?.data || [];
      if (!Array.isArray(data)) data = [];

      let normalized = data
        .map((v) => ({
          name:
            v.name ||
            v.village ||
            v.label ||
            v.area ||
            v.locality ||
            "",
        }))
        .filter((v) => v.name)
        .sort((a, b) => a.name.localeCompare(b.name));

      // Punjab fallback
      if (
        normalized.length === 0 &&
        stateCode.toUpperCase() === "PB"
      ) {
        normalized = normalize(
          PUNJAB_FALLBACK[cityName] || []
        );
      }

      setVillages(normalized);

      if (query === "") {
        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify(normalized)
          );
        } catch {
          /* ignore cache errors */
        }
      }
    } catch (err) {
      console.error("❌ VillageSelect error:", err);

      if (stateCode.toUpperCase() === "PB") {
        setVillages(
          normalize(PUNJAB_FALLBACK[cityName] || [])
        );
      } else {
        setVillages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================================
     LOAD ON CITY CHANGE
  ============================================================================ */
  useEffect(() => {
    if (cityName) {
      setSearch("");
      fetchVillages("");
    } else {
      setVillages([]);
    }
  }, [countryCode, stateCode, cityName]);

  /* ============================================================================
     DEBOUNCED SEARCH
  ============================================================================ */
  const debouncedFetch = useCallback(
    debounce((q) => fetchVillages(q), 400),
    [countryCode, stateCode, cityName]
  );

  useEffect(() => {
    if (disableTyping) return;
    if (!search.trim()) {
      fetchVillages("");
    } else {
      debouncedFetch(search.trim());
    }
  }, [search, disableTyping]);

  /* ============================================================================
     UI
  ============================================================================ */
  return (
    <div style={styles.wrapper}>
      {/* SEARCH INPUT */}
      {!disableTyping && (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search village…"
          disabled={!cityName || disabled}
          className={className}
          style={{ ...styles.input, ...style }}
        />
      )}

      {/* DROPDOWN */}
      <select
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={!cityName || loading || disabled}
        style={{
          ...styles.select,
          backgroundColor: loading ? "#f8fafc" : "#fff",
        }}
      >
        <option value="">
          {loading ? "Loading villages…" : placeholder}
        </option>

        {villages.map((v, i) => (
          <option key={`${v.name}-${i}`} value={v.name}>
            {v.name}
          </option>
        ))}
      </select>
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
    gap: 8,
    width: "100%",
  },

  input: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    fontSize: 15,
    outline: "none",
  },

  select: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    fontSize: 15,
    cursor: "pointer",
    outline: "none",
  },
};
