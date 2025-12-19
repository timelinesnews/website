import React from "react";

export default function Loader({
  size = 48,
  text = "Loading…",
  fullScreen = false,
}) {
  if (fullScreen) {
    return (
      <div style={styles.fullScreen}>
        <Spinner size={size} />
        {text && <p style={styles.text}>{text}</p>}
      </div>
    );
  }

  return (
    <div style={styles.inline}>
      <Spinner size={size} />
      {text && <p style={styles.text}>{text}</p>}
    </div>
  );
}

/* ===============================
        SPINNER
=============================== */
function Spinner({ size }) {
  return (
    <div
      style={{
        ...styles.spinner,
        width: size,
        height: size,
      }}
    />
  );
}

/* ===============================
        STYLES
=============================== */
const styles = {
  inline: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 10,
  },

  fullScreen: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },

  spinner: {
    border: "4px solid rgba(79,70,229,0.15)",
    borderTop: "4px solid #4f46e5",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  text: {
    fontSize: 14,
    color: "#475569",
    fontWeight: 600,
  },
};

/* ===============================
        GLOBAL KEYFRAMES
=============================== */
<style jsx global>{`
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`}</style>;
