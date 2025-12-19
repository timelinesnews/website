import React from "react";
import CommentItem from "./CommentItem";

export default function CommentList({
  comments = [],
  onDelete,
  userId,
}) {
  const total = Array.isArray(comments) ? comments.length : 0;

  return (
    <div style={styles.wrapper}>
      {/* HEADER */}
      <h3 style={styles.title}>
        💬 Comments <span style={styles.count}>({total})</span>
      </h3>

      {/* EMPTY STATE */}
      {total === 0 && (
        <div style={styles.empty}>
          No comments yet — be the first to start the conversation.
        </div>
      )}

      {/* COMMENT ITEMS */}
      {total > 0 && (
        <div style={styles.list}>
          {comments.map((c, index) => (
            <div key={c._id || index} style={styles.itemWrapper}>
              <CommentItem
                comment={c}
                userId={userId}
                onDelete={onDelete}
              />

              {index !== total - 1 && (
                <div style={styles.divider} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =====================================
   STYLES
===================================== */
const styles = {
  wrapper: {
    marginTop: 30,
  },

  title: {
    fontSize: 18,
    fontWeight: 800,
    marginBottom: 14,
    color: "#0f172a",
  },

  count: {
    fontWeight: 600,
    color: "#64748b",
  },

  empty: {
    textAlign: "center",
    padding: "18px 12px",
    fontSize: 15,
    color: "#64748b",
    background: "#f8fafc",
    borderRadius: 12,
    border: "1px dashed #e5e7eb",
  },

  list: {
    marginTop: 12,
  },

  itemWrapper: {
    padding: "6px 0",
  },

  divider: {
    height: 1,
    background: "#e5e7eb",
    margin: "10px 0",
  },
};
