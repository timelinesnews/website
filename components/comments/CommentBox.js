import React, { useState, useRef, useEffect } from "react";

export default function CommentBox({ onSubmit }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  const maxChars = 400;

  /* =============================
        AUTO RESIZE
  ============================= */
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      textareaRef.current.scrollHeight + "px";
  }, [text]);

  /* =============================
        POST COMMENT
  ============================= */
  const handlePost = async () => {
    if (!text.trim() || loading) return;

    try {
      setLoading(true);
      await onSubmit(text.trim());
      setText("");
    } finally {
      setLoading(false);
    }
  };

  /* =============================
        KEY HANDLER
  ============================= */
  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePost();
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* TEXTAREA */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => {
          if (e.target.value.length <= maxChars) {
            setText(e.target.value);
          }
        }}
        onKeyDown={handleKey}
        placeholder="Write a comment…"
        style={styles.input}
        disabled={loading}
      />

      {/* FOOTER */}
      <div style={styles.footer}>
        <span
          style={{
            ...styles.charCount,
            color: text.length >= maxChars ? "#dc2626" : "#64748b",
          }}
        >
          {text.length}/{maxChars}
        </span>

        <button
          onClick={handlePost}
          disabled={!text.trim() || loading}
          style={{
            ...styles.button,
            ...(loading || !text.trim()
              ? styles.buttonDisabled
              : styles.buttonActive),
          }}
        >
          {loading ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
}

/* ==============================
   STYLES
============================== */
const styles = {
  wrapper: {
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    background: "#f8fafc",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },

  input: {
    width: "100%",
    minHeight: 70,
    padding: "12px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    fontSize: 15,
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
  },

  footer: {
    marginTop: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  charCount: {
    fontSize: 13,
    fontWeight: 600,
  },

  button: {
    padding: "8px 20px",
    borderRadius: 999,
    color: "#fff",
    border: "none",
    fontSize: 14,
    fontWeight: 700,
    transition: "background 0.15s ease",
  },

  buttonActive: {
    background: "#4f46e5",
    cursor: "pointer",
  },

  buttonDisabled: {
    background: "#c7c9d1",
    cursor: "not-allowed",
  },
};
