// components/admin/ModerationList.js
import React, { useState } from "react";

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND ||
  "https://backend-7752.onrender.com";

export default function ModerationList({
  items = [],
  onApprove,
  onReject,
  onDelete,
}) {
  const [processingId, setProcessingId] = useState(null);

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div style={styles.empty}>
        No items to moderate.
      </div>
    );
  }

  const safeId = (item) => item?._id || item?.id;

  const handleAction = async (item, action) => {
    const id = safeId(item);
    if (!id || processingId) return;

    setProcessingId(id);
    try {
      await action(id);
    } catch (err) {
      console.error("Admin action failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const imageUrl = (url) => {
    if (!url) return "/placeholder.jpg";
    return url.startsWith("http")
      ? url
      : `${BACKEND}/${url.replace(/^\/+/, "")}`;
  };

  return (
    <div style={styles.list}>
      {items.map((item) => {
        const id = safeId(item);
        if (!id) return null;

        const busy = processingId === id;

        return (
          <div key={id} style={styles.card}>
            {/* IMAGE */}
            {item.image ? (
              <img
                src={imageUrl(item.image)}
                alt={item.headline}
                style={styles.image}
              />
            ) : (
              <div style={styles.imagePlaceholder} />
            )}

            {/* CONTENT */}
            <div style={styles.content}>
              <div style={styles.header}>
                <div style={styles.headline}>
                  {item.headline || "Untitled news"}
                </div>
                <div style={styles.time}>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString("en-IN")
                    : ""}
                </div>
              </div>

              <div style={styles.desc}>
                {(item.content || item.description || "")
                  .slice(0, 260)}
                {(item.content || item.description || "").length >
                  260 && "…"}
              </div>

              {/* ACTIONS */}
              <div style={styles.actions}>
                <button
                  disabled={busy}
                  onClick={() =>
                    handleAction(item, onApprove)
                  }
                  style={{
                    ...styles.btn,
                    ...styles.approve,
                    ...(busy ? styles.disabled : {}),
                  }}
                >
                  {busy ? "Processing…" : "Approve"}
                </button>

                <button
                  disabled={busy}
                  onClick={() => {
                    const reason = prompt(
                      "Optional rejection reason:",
                      ""
                    );
                    handleAction(item, (id) =>
                      onReject?.(id, reason || "")
                    );
                  }}
                  style={{
                    ...styles.btn,
                    ...styles.reject,
                    ...(busy ? styles.disabled : {}),
                  }}
                >
                  Reject
                </button>

                <button
                  disabled={busy}
                  onClick={() => {
                    if (
                      confirm(
                        "Delete this news permanently?"
                      )
                    ) {
                      handleAction(item, onDelete);
                    }
                  }}
                  style={{
                    ...styles.btn,
                    ...styles.delete,
                    ...(busy ? styles.disabled : {}),
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================
   STYLES
============================ */
const styles = {
  list: {
    display: "grid",
    gap: 16,
  },

  empty: {
    marginTop: 30,
    textAlign: "center",
    color: "#64748b",
    fontSize: 15,
    fontWeight: 600,
  },

  card: {
    display: "flex",
    gap: 14,
    background: "#fff",
    padding: 14,
    borderRadius: 14,
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  },

  image: {
    width: 120,
    height: 84,
    objectFit: "cover",
    borderRadius: 10,
    flexShrink: 0,
    background: "#f1f5f9",
  },

  imagePlaceholder: {
    width: 120,
    height: 84,
    borderRadius: 10,
    background: "#f1f5f9",
    flexShrink: 0,
  },

  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },

  headline: {
    fontWeight: 800,
    fontSize: 16,
    color: "#0f172a",
  },

  time: {
    fontSize: 12,
    color: "#64748b",
    whiteSpace: "nowrap",
  },

  desc: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.45,
    marginBottom: 10,
  },

  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  btn: {
    padding: "8px 14px",
    borderRadius: 10,
    border: "none",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },

  approve: {
    background: "#16a34a",
    color: "#fff",
  },

  reject: {
    background: "#f59e0b",
    color: "#fff",
  },

  delete: {
    background: "#fff",
    color: "#b91c1c",
    border: "1px solid #f3c1c1",
  },

  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};
