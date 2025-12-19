// pages/Referral.js
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "../services/api";

export default function Referral() {
  const router = useRouter();

  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ======================================================
      AUTH + LOAD REFERRAL CODE
  ======================================================= */
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const profile = await api.getProfile();
        const user = profile?.user || profile;

        if (user?.username && user?._id) {
          setReferralCode(
            `TL${user.username.toUpperCase()}${user._id.slice(-4)}`
          );
        } else {
          setReferralCode("TL-USER-REF");
        }
      } catch (err) {
        console.error("Referral load error:", err);
        setReferralCode("TL-USER-REF");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ======================================================
      COPY HANDLER
  ======================================================= */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      alert("Failed to copy referral code");
    }
  };

  /* ======================================================
      SHARE HANDLER
  ======================================================= */
  const shareWhatsApp = () => {
    const text = `Join TIMELINES & earn money by sharing news 📰

Use my referral code: ${referralCode}

👉 https://thetimelines.in`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  /* ======================================================
      LOADING
  ======================================================= */
  if (loading) {
    return (
      <div style={styles.loading}>
        ⏳ Loading referral details…
      </div>
    );
  }

  /* ======================================================
      UI
  ======================================================= */
  return (
    <>
      <Head>
        <title>Referral Program | TIMELINES</title>
        <meta
          name="description"
          content="Invite friends to TIMELINES and earn rewards through the referral program."
        />
      </Head>

      <div style={styles.page}>
        <h1 style={styles.title}>🎁 Referral Program</h1>

        <div style={styles.card}>
          {/* Intro */}
          <p style={styles.text}>
            Invite your friends and earn <strong>₹5</strong> for each valid
            referral. The referred user must use the app for at least{" "}
            <strong>1 hour</strong>.
          </p>

          {/* Referral Code Box */}
          <div style={styles.refBox}>
            <span style={styles.refCode}>{referralCode}</span>

            <button onClick={handleCopy} style={styles.copyBtn}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Share Buttons */}
          <div style={styles.shareRow}>
            <button style={styles.shareBtn} onClick={shareWhatsApp}>
              📲 Share on WhatsApp
            </button>
          </div>

          {/* How It Works */}
          <h3 style={styles.section}>How It Works</h3>
          <ul style={styles.list}>
            <li>Share your referral code with friends.</li>
            <li>They sign up on TIMELINES.</li>
            <li>They use the app for at least 1 hour.</li>
            <li>
              You get <strong>₹5</strong> credited to your wallet.
            </li>
          </ul>

          {/* Coming Soon */}
          <div style={styles.comingSoonBox}>
            🔒 Referral program is coded and tested, but will be activated soon
            by admin.
          </div>
        </div>
      </div>
    </>
  );
}

/* ======================================================
      STYLES
====================================================== */

const styles = {
  page: {
    maxWidth: 850,
    margin: "30px auto",
    padding: 20,
    fontFamily: "Inter, sans-serif",
  },

  title: {
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 20,
    textAlign: "center",
  },

  card: {
    background: "#fff",
    padding: 26,
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },

  text: {
    fontSize: 16,
    color: "#333",
    lineHeight: 1.7,
  },

  section: {
    fontSize: 20,
    fontWeight: 700,
    marginTop: 25,
    marginBottom: 10,
    color: "#222",
  },

  list: {
    paddingLeft: 20,
    marginBottom: 20,
    color: "#444",
    fontSize: 16,
    lineHeight: 1.6,
  },

  refBox: {
    marginTop: 20,
    padding: "14px 16px",
    background: "#f1f5ff",
    borderRadius: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #d6e1ff",
    gap: 10,
    flexWrap: "wrap",
  },

  refCode: {
    fontWeight: 800,
    fontSize: 20,
    color: "#1a237e",
    wordBreak: "break-all",
  },

  copyBtn: {
    padding: "8px 16px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },

  shareRow: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  shareBtn: {
    padding: "10px 16px",
    background: "#25D366",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },

  comingSoonBox: {
    marginTop: 30,
    padding: 16,
    borderRadius: 12,
    background: "#fff8e1",
    border: "1px solid #ffe9b5",
    color: "#7a5c00",
    fontWeight: 600,
    textAlign: "center",
  },

  loading: {
    textAlign: "center",
    marginTop: 80,
    fontSize: 18,
    color: "#555",
    fontFamily: "Inter, sans-serif",
  },
};
