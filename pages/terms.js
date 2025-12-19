// pages/terms.js
import React from "react";
import Head from "next/head";

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms & Conditions | TIMELINES</title>
        <meta
          name="description"
          content="Terms and Conditions governing the use of the TIMELINES platform."
        />
      </Head>

      <div style={styles.page}>
        {/* TITLE */}
        <h1 style={styles.title}>Terms & Conditions</h1>

        {/* CARD */}
        <div style={styles.card}>
          {/* Last Updated */}
          <p style={styles.updated}>
            Last updated: <strong>{new Date().toLocaleDateString()}</strong>
          </p>

          <p>
            Welcome to <strong>TIMELINES</strong>. By accessing or using our
            website or application, you agree to be bound by these Terms &
            Conditions, our Privacy Policy, and all applicable laws and
            regulations. If you do not agree, please discontinue use
            immediately.
          </p>

          <Section number="1" title="Acceptance of Terms" />
          <p>
            These Terms apply to all users of TIMELINES. Continued use of the
            platform constitutes your acceptance of any updates or changes to
            these Terms.
          </p>

          <Section number="2" title="User Responsibilities" />
          <ul style={styles.list}>
            <li>You must provide accurate and truthful information.</li>
            <li>You will not post abusive, hateful, illegal, or misleading content.</li>
            <li>You are solely responsible for the accuracy of news you publish.</li>
            <li>You must not misuse, exploit, or attempt to harm the platform.</li>
          </ul>

          <Section number="3" title="Content Ownership & License" />
          <p>
            You retain ownership of the content you submit. However, by posting
            on TIMELINES, you grant us a non-exclusive, royalty-free license to:
          </p>
          <ul style={styles.list}>
            <li>Display and distribute your content on the platform</li>
            <li>Show content in trending, discovery, or promotional sections</li>
            <li>Modify or remove content for moderation or legal reasons</li>
          </ul>

          <Section number="4" title="Content Moderation" />
          <p>
            TIMELINES uses AI-based systems and human moderators to ensure a safe
            environment. Content may be removed if it:
          </p>
          <ul style={styles.list}>
            <li>Contains hate speech, violence, or harassment</li>
            <li>Spreads fake news, misinformation, or spam</li>
            <li>Violates any laws or community guidelines</li>
            <li>Includes explicit, adult, or harmful material</li>
          </ul>

          <Section number="5" title="Account Suspension & Termination" />
          <p>
            We reserve the right to suspend or permanently terminate accounts
            that:
          </p>
          <ul style={styles.list}>
            <li>Repeatedly violate these Terms</li>
            <li>Engage in illegal, fraudulent, or harmful activities</li>
            <li>Attempt to manipulate earnings, ads, or referrals</li>
          </ul>

          <Section number="6" title="Earnings, Payments & Rewards" />
          <p>
            If you participate in monetization, referral, or reward programs,
            you acknowledge that:
          </p>
          <ul style={styles.list}>
            <li>Earnings depend on views, ads, engagement, and platform rules</li>
            <li>Fraud or misuse may result in withheld or cancelled payouts</li>
            <li>You are responsible for providing correct payment details</li>
          </ul>

          <Section number="7" title="Limitation of Liability" />
          <p>
            TIMELINES is not liable for:
          </p>
          <ul style={styles.list}>
            <li>Incorrect or misleading user-generated content</li>
            <li>Loss of earnings due to rule violations or technical issues</li>
            <li>Any damages arising from the use of the platform</li>
          </ul>

          <Section number="8" title="Changes to Terms" />
          <p>
            We may update these Terms at any time. Continued use of TIMELINES
            after changes means you accept the revised Terms.
          </p>

          <Section number="9" title="Contact Information" />
          <p>
            For legal questions or concerns, contact us at:
            <br />
            <strong>legal@timelinesapp.com</strong>
          </p>
        </div>
      </div>
    </>
  );
}

/* --------------------------------------------------
   SECTION TITLE
-------------------------------------------------- */
function Section({ number, title }) {
  return (
    <h3 style={styles.sectionTitle}>
      {number}. {title}
    </h3>
  );
}

/* --------------------------------------------------
   STYLES
-------------------------------------------------- */
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
