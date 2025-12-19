import React from "react";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* LEFT */}
        <div style={styles.section}>
          <img src="/logo.png" alt="TIMELINES" style={styles.logo} />
          <p style={styles.tagline}>
            TIMELINES is a community-driven news platform where local voices
            matter. Share real news, discover stories, and stay informed.
          </p>
        </div>

        {/* CENTER */}
        <div style={styles.section}>
          <h4 style={styles.title}>Quick Links</h4>
          <Link href="/" style={styles.link}>Home</Link>
          <Link href="/categories" style={styles.link}>Categories</Link>
          <Link href="/create" style={styles.link}>Create News</Link>
          <Link href="/saved" style={styles.link}>Saved</Link>
        </div>

        {/* RIGHT */}
        <div style={styles.section}>
          <h4 style={styles.title}>Legal</h4>
          <Link href="/about" style={styles.link}>About Us</Link>
          <Link href="/privacy" style={styles.link}>Privacy Policy</Link>
          <Link href="/terms" style={styles.link}>Terms & Conditions</Link>
          <Link href="/contact" style={styles.link}>Contact</Link>
        </div>
      </div>

      {/* BOTTOM */}
      <div style={styles.bottom}>
        © {year} TIMELINES. All rights reserved.
      </div>
    </footer>
  );
}

/* ===============================
        STYLES
=============================== */
const styles = {
  footer: {
    marginTop: 60,
    background: "#0f172a",
    color: "#e5e7eb",
    padding: "50px 20px 20px",
  },

  container: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 30,
  },

  section: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  logo: {
    height: 50,
    marginBottom: 10,
  },

  tagline: {
    fontSize: 14,
    lineHeight: 1.6,
    color: "#cbd5f5",
  },

  title: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 6,
    color: "#f8fafc",
  },

  link: {
    textDecoration: "none",
    color: "#cbd5f5",
    fontSize: 14,
  },

  bottom: {
    marginTop: 40,
    paddingTop: 16,
    borderTop: "1px solid rgba(255,255,255,0.1)",
    textAlign: "center",
    fontSize: 13,
    color: "#94a3b8",
  },
};
