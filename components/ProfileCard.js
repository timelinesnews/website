import React from "react";

export default function ProfileCard({ user }) {
  if (!user) return null;

  return (
    <div
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        gap: 20,
      }}
    >
      <img
        src={user.avatar || "/user-avatar.png"}
        alt="avatar"
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />

      <div style={{ flex: 1 }}>
        <h2 style={{ margin: "0 0 4px", fontWeight: 800 }}>
          {user.name || "Unnamed User"}
        </h2>

        <div style={{ color: "#666", marginBottom: 8 }}>
          @{user.username}
        </div>

        {user.city && (
          <div style={{ fontSize: 14, color: "#444" }}>
            {user.city}, {user.state}, {user.country}
          </div>
        )}
      </div>
    </div>
  );
}
