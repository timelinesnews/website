import React from "react";

const categories = [
  "All",
  "Trending",
  "Politics",
  "Sports",
  "Technology",
  "Entertainment",
  "World",
  "Business",
  "Local",
];

export default function CategoryTabs({ active, setActive }) {
  return (
    <div style={styles.wrapper}>
      {categories.map((cat) => {
        const isActive = active === cat;

        return (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            style={{
              ...styles.tab,
              ...(isActive ? styles.activeTab : {}),
            }}
            aria-pressed={isActive}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}

/* ====================== STYLES ====================== */
const styles = {
  wrapper: {
    display: "flex",
    gap: 10,
    padding: "10px 4px",
    overflowX: "auto",
    whiteSpace: "nowrap",
    scrollbarWidth: "none", // Firefox
    msOverflowStyle: "none", // IE
  },

  tab: {
    padding: "8px 18px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    color: "#334155",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.15s ease",
    flexShrink: 0,
  },

  activeTab: {
    background: "#4f46e5",
    color: "#fff",
    borderColor: "#4f46e5",
    boxShadow: "0 4px 12px rgba(79,70,229,0.35)",
  },
};
