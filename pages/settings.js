// pages/settings.js
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { api } from "../services/api";
import { useRouter } from "next/router";

export default function Settings() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /* ======================================================
      LOAD USER + PROTECT ROUTE
  ====================================================== */
  useEffect(() => {
    if (!router.isReady) return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadProfile() {
      try {
        const res = await api.getProfile();
        setUser(res?.user || res);
      } catch (err) {
        console.error("Settings load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  if (loading)
    return <div style={styles.loading}>⏳ Loading settings…</div>;

  if (!user)
    return (
      <div style={{ textAlign: "center", marginTop: 60, color: "red" }}>
        ❌ Failed to load profile
      </div>
    );

  return (
    <>
      {/* 🔍 SEO */}
      <Head>
        <title>Settings | TIMELINES</title>
        <meta
          name="description"
          content="Manage your TIMELINES account settings, privacy, preferences and security."
        />
      </Head>

      <div style={styles.page}>
        {/* TITLE */}
        <h1 style={styles.title}>Settings</h1>

        {/* =====================================
                ACCOUNT
        ====================================== */}
        <SectionHeader title="Account" />

        <SettingTile
          icon="👤"
          title="Edit Profile"
          subtitle="Update your name, username, and location"
          onClick={() => router.push("/profile/edit")}
        />

        <SettingTile
          icon="🔒"
          title="Change Password"
          subtitle="Update your login password"
          onClick={() => router.push("/change-password")}
        />

        <SettingTile
          icon="⭐"
          title="Premium Membership"
          subtitle="Ad-free experience & exclusive perks"
          onClick={() => router.push("/Premium")}
        />

        <SettingTile
          icon="🎁"
          title="Referral Program"
          subtitle="Invite friends and earn rewards"
          onClick={() => router.push("/Referral")}
        />

        {/* =====================================
                PRIVACY
        ====================================== */}
        <SectionHeader title="Privacy & Legal" />

        <SettingTile
          icon="🛡️"
          title="Privacy Policy"
          onClick={() => router.push("/privacy-policy")}
        />

        <SettingTile
          icon="📄"
          title="Terms & Conditions"
          onClick={() => router.push("/terms")}
        />

        {/* =====================================
                PREFERENCES
        ====================================== */}
        <SectionHeader title="Preferences" />

        <SettingTile
          icon="🌐"
          title="Language"
          subtitle="English, Punjabi, Hindi"
          onClick={() => alert("Language selection coming soon")}
        />

        <SettingTile
          icon="🌙"
          title="Dark Mode"
          trailing={
            <input
              type="checkbox"
              onClick={(e) => e.stopPropagation()}
              onChange={() => alert("Dark mode coming soon")}
            />
          }
        />

        <SettingTile
          icon="🔔"
          title="Notifications"
          subtitle="Enable or disable app alerts"
          trailing={
            <input
              type="checkbox"
              checked={notifications}
              onClick={(e) => e.stopPropagation()}
              onChange={() => setNotifications(!notifications)}
            />
          }
        />

        {/* =====================================
                SUPPORT
        ====================================== */}
        <SectionHeader title="Support & Feedback" />

        <SettingTile
          icon="❓"
          title="Help Center"
          onClick={() => router.push("/help-HelpCenter")}
        />

        <SettingTile
          icon="📝"
          title="Send Feedback"
          onClick={() => router.push("/Feedback")}
        />

        <SettingTile
          icon="⭐"
          title="Rate Us"
          onClick={() => alert("Rating feature coming soon")}
        />

        {/* =====================================
                LOGOUT
        ====================================== */}
        <button
          style={styles.logoutBtn}
          onClick={() => setShowLogoutConfirm(true)}
        >
          🚪 Logout
        </button>

        {showLogoutConfirm && (
          <LogoutPopup
            onCancel={() => setShowLogoutConfirm(false)}
            onLogout={() => {
              api.logout();
              router.push("/login");
            }}
          />
        )}
      </div>
    </>
  );
}

/* ======================================================
        COMPONENTS
====================================================== */

function SectionHeader({ title }) {
  return <div style={styles.sectionHeader}>{title}</div>;
}

function SettingTile({ icon, title, subtitle, trailing, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        ...styles.tile,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={styles.tileLeft}>
        <div style={styles.tileIcon}>{icon}</div>
        <div>
          <div style={styles.tileTitle}>{title}</div>
          {subtitle && (
            <div style={styles.tileSubtitle}>{subtitle}</div>
          )}
        </div>
      </div>

      {trailing && <div>{trailing}</div>}
    </div>
  );
}

function LogoutPopup({ onCancel, onLogout }) {
  return (
    <div style={styles.popupOverlay}>
      <div style={styles.popupBox}>
        <h3 style={{ marginBottom: 10 }}>Confirm Logout</h3>
        <p style={{ color: "#666", marginBottom: 20 }}>
          Are you sure you want to log out?
        </p>

        <div style={styles.popupActions}>
          <button
            onClick={onCancel}
            style={styles.cancelBtn}
          >
            Cancel
          </button>
          <button
            onClick={onLogout}
            style={styles.confirmLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======================================================
        STYLES
====================================================== */
const styles = {
  page: {
    padding: 20,
    maxWidth: 850,
    margin: "0 auto",
    fontFamily: "Inter, sans-serif",
  },

  title: {
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 25,
  },

  sectionHeader: {
    marginTop: 25,
    marginBottom: 8,
    color: "#666",
    fontSize: 14,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  tile: {
    padding: 16,
    background: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  tileLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  tileIcon: { fontSize: 22 },
  tileTitle: { fontSize: 16, fontWeight: 700 },
  tileSubtitle: { fontSize: 13, color: "#777", marginTop: 3 },

  logoutBtn: {
    width: "100%",
    padding: 14,
    background: "#e53935",
    borderRadius: 10,
    border: "none",
    color: "#fff",
    fontWeight: 700,
    fontSize: 16,
    marginTop: 30,
    cursor: "pointer",
  },

  loading: {
    textAlign: "center",
    marginTop: 60,
    fontSize: 18,
    color: "#555",
  },

  popupOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
  },

  popupBox: {
    width: "90%",
    maxWidth: 380,
    background: "#fff",
    borderRadius: 14,
    padding: 20,
    boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
  },

  popupActions: {
    display: "flex",
    gap: 12,
  },

  cancelBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: 8,
    background: "#eee",
    border: "1px solid #ccc",
    cursor: "pointer",
  },

  confirmLogout: {
    flex: 1,
    padding: "12px",
    borderRadius: 8,
    background: "#e53935",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
  },
};
