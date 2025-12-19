// pages/help-HelpCenter.js
import React, { useState } from "react";
import Navbar from "../components/Navbar";

export default function HelpCenter() {
  return (
    <>
      <Navbar />

      <div style={container}>
        <h1 style={title}>🆘 Help Center</h1>

        <div style={card}>
          <p style={text}>
            Welcome to <strong>TIMELINES Help Center</strong>. Here you’ll find
            answers to common questions and guidance on how to use the platform
            smoothly.
          </p>

          {/* FAQ SECTION */}
          <h3 style={section}>📌 Frequently Asked Questions</h3>

          <FAQ
            q="How do I post news?"
            a="Go to the Create page → enter headline & content → select category & location → upload image → post."
          />

          <FAQ
            q="Why is my news under review?"
            a="All news goes through AI-based moderation to prevent harmful, fake, or misleading content."
          />

          <FAQ
            q="How do I earn money on TIMELINES?"
            a="You earn from ads shown on your news posts. 85% of the ad revenue goes directly to you."
          />

          <FAQ
            q="How can I change my password?"
            a="Open Settings → Change Password → enter old and new password."
          />

          <FAQ
            q="How does the referral program work?"
            a="Invite friends using your referral code. You earn ₹5 when a referred user uses the app for at least 1 hour."
          />

          <FAQ
            q="Can I edit or delete my news?"
            a="Yes. Open your post → click Edit or Delete (available to post owner or admin)."
          />

          {/* SUPPORT SECTION */}
          <h3 style={section}>💬 Need More Help?</h3>

          <div style={supportBox}>
            <p style={{ margin: 0 }}>
              📧 Email us at:
              <br />
              <strong>support@timelinesapp.com</strong>
            </p>

            <p style={{ marginTop: 10, fontSize: 14, color: "#555" }}>
              We usually respond within 24–48 hours.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* =====================================================
    FAQ ITEM (Expandable)
===================================================== */
function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={faqBox}>
      <div style={faqQuestion} onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <span style={{ fontWeight: 700 }}>{open ? "−" : "+"}</span>
      </div>

      {open && <div style={faqAnswer}>{a}</div>}
    </div>
  );
}

/* =====================================================
    STYLES
===================================================== */

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

const section = {
  marginTop: 30,
  marginBottom: 12,
  fontSize: 20,
  fontWeight: 800,
};

/* FAQ */
const faqBox = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 14,
  marginBottom: 12,
  background: "#fafafa",
};

const faqQuestion = {
  display: "flex",
  justifyContent: "space-between",
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 700,
};

const faqAnswer = {
  marginTop: 10,
  fontSize: 15,
  color: "#555",
  lineHeight: 1.6,
};

/* Support */
const supportBox = {
  marginTop: 10,
  padding: 18,
  borderRadius: 12,
  background: "#f1f5ff",
  border: "1px solid #dbe3ff",
  fontSize: 16,
};
