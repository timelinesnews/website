// pages/Premium.js
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Navbar from "../components/Navbar";

export default function Premium() {
  const router = useRouter();

  /* ===============================
      AUTH GUARD
  =============================== */
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) router.replace("/login");
  }, []);

  return (
    <>
      <Head>
        <title>Premium Membership | TIMELINES</title>
        <meta
          name="description"
          content="Upgrade to TIMELINES Premium for an ad-free experience and exclusive features."
        />
      </Head>

      <Navbar />

      <div style={container}>
        <h1 style={title}>⭐ TIMELINES Premium</h1>

        <div style={card}>
          <p style={text}>
            Upgrade to <strong>TIMELINES Premium</strong> and enjoy a cleaner,
            faster, and more powerful news experience.
          </p>

          <ul style={list}>
            <li>🚫 Completely ad-free experience</li>
            <li>⚡ Priority approval for news posts</li>
            <li>📊 Premium analytics & insights (coming)</li>
            <li>💬 Faster support response</li>
            <li>🏆 Special premium badge on profile</li>
          </ul>

          <div style={priceBox}>
            <div>
              <div style={{ fontSize: 14, color: "#666" }}>
                Monthly Plan
              </div>
              <strong style={{ fontSize: 24 }}>₹119 / month</strong>
            </div>

            <button style={buttonDisabled} disabled>
              Coming Soon
            </button>
          </div>

          <div style={noteBox}>
            🔒 Payments are temporarily disabled.
            <br />
            Premium will be activated after official launch.
          </div>
        </div>
      </div>
    </>
  );
}

/* ===============================
      STYLES
=============================== */

const container = {
  maxWidth: 850,
  margin: "30px auto",
  padding: 20,
  fontFamily: "Inter, sans-serif",
};

const title = {
  fontSize: 30,
  fontWeight: 800,
  marginBottom: 20,
  textAlign: "center",
};

const card = {
  background: "#fff",
  padding: 26,
  borderRadius: 16,
  boxShadow: "0 6px 22px rgba(0,0,0,0.08)",
};

const text = {
  fontSize: 16,
  color: "#333",
  lineHeight: 1.7,
};

const list = {
  marginTop: 18,
  marginBottom: 26,
  fontSize: 16,
  color: "#444",
  lineHeight: 1.7,
};

const priceBox = {
  marginTop: 10,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const buttonDisabled = {
  padding: "14px 22px",
  background: "#c7c7c7",
  color: "#555",
  fontWeight: 700,
  border: "none",
  borderRadius: 12,
  cursor: "not-allowed",
};

const noteBox = {
  marginTop: 22,
  padding: 14,
  borderRadius: 12,
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  color: "#555",
  fontSize: 14,
  textAlign: "center",
};
