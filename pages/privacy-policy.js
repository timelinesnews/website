// pages/privacy-policy.js
import React from "react";
import Head from "next/head";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | TIMELINES</title>
        <meta
          name="description"
          content="Privacy Policy of TIMELINES – how we collect, use, and protect user data."
        />
      </Head>

      <div style={styles.page}>
        {/* TITLE */}
        <h1 style={styles.title}>Privacy Policy</h1>

        {/* CARD */}
        <div style={styles.card}>
          {/* LAST UPDATED */}
          <p style={styles.updated}>
            Last updated:{" "}
            <strong>{new Date().toLocaleDateString()}</strong>
          </p>

          {/* INTRO */}
          <p>
            At <strong>TIMELINES</strong>, your privacy is extremely important to
            us. This Privacy Policy explains what information we collect, how we
            use it, and the steps we take to keep it secure.
          </p>

          <Section number="1" title="Information We Collect" />
          <p>We may collect the following types of information:</p>
          <ul style={styles.list}>
            <li>Personal details (name, username, email, phone number)</li>
            <li>Content you create (news posts, images, comments)</li>
            <li>Location information (country, state, city, village)</li>
            <li>Device & usage data (IP address, browser, app analytics)</li>
          </ul>

          <Section number="2" title="How We Use Your Information" />
          <p>Your information is used to:</p>
          <ul style={styles.list}>
            <li>Operate, maintain, and improve the TIMELINES platform</li>
            <li>Show relevant, location-based news content</li>
            <li>Ensure safety, prevent fraud, and enforce policies</li>
            <li>Provide customer support and respond to queries</li>
            <li>Analyze usage to enhance performance and features</li>
          </ul>

          <Section number="3" title="Sharing of Information" />
          <p>
            We <strong>do not sell</strong> your personal data. Information may
            be shared only with:
          </p>
          <ul style={styles.list}>
            <li>Trusted service providers (analytics, hosting, moderation)</li>
            <li>Law enforcement authorities, if required by law</li>
            <li>Authorized internal moderators for safety & verification</li>
          </ul>

          <Section number="4" title="Your Rights & Choices" />
          <p>You have the right to:</p>
          <ul style={styles.list}>
            <li>Access and edit your personal information</li>
            <li>Delete your account at any time</li>
            <li>Manage notification preferences</li>
            <li>Request a copy of your stored data (coming soon)</li>
          </ul>

          <Section number="5" title="Data Security" />
          <p>
            We use encryption, secure servers, and strict access controls to
            protect your data. While we take strong precautions, no system can
            be guaranteed 100% secure.
          </p>

          <Section number="6" title="Children’s Privacy" />
          <p>
            TIMELINES is not intended for children under the age of 13. Accounts
            found to belong to users under 13 will be removed immediately.
          </p>

          <Section number="7" title="Changes to This Policy" />
          <p>
            This Privacy Policy may be updated from time to time. Any important
            changes will be communicated through the app or website.
          </p>

          <Section number="8" title="Contact Information" />
          <p>
            If you have any questions or concerns about this Privacy Policy,
            please contact us at:
            <br />
            <strong>support@timelinesapp.com</strong>
          </p>
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------
   SECTION TITLE
------------------------------------------------------- */
function Section({ number, title }) {
  return (
    <h3 style={styles.sectionTitle}>
      {number}. {title}
    </h3>
  );
}

/* -------------------------------------------------------
   STYLES
------------------------------------------------------- */
const styles = {
  page: {
    maxWidth: 900,
    margin: "30px auto",
    padding: "20px",
    fontFamily: "Inter, sans-serif",
  },

  title: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: 800,
    marginBottom: 25,
  },

  card: {
    background: "#fff",
    padding: 30,
    borderRadius: 18,
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    lineHeight: 1.75,
    fontSize: 16,
    color: "#333",
  },

  updated: {
    color: "#555",
    marginBottom: 22,
    fontSize: 14,
  },

  sectionTitle: {
    marginTop: 30,
    marginBottom: 12,
    fontSize: 20,
    fontWeight: 700,
    color: "#222",
  },

  list: {
    paddingLeft: 22,
    marginBottom: 16,
    lineHeight: 1.7,
  },
};
