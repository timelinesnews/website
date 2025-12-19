// pages/Feedback.js
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { api } from "../services/api";

export default function Feedback() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [error, setError] = useState("");

  /* ===============================
      AUTH GUARD
  =============================== */
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) router.replace("/login");
  }, []);

  /* ===============================
      SUBMIT HANDLER
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (message.trim().length < 5) {
      setError("Please write a meaningful feedback (min 5 characters).");
      return;
    }

    try {
      setStatus("sending");

      // 🔒 Backend ready (safe even if endpoint not active yet)
      if (api.sendFeedback) {
        await api.sendFeedback({ message });
      }

      setMessage("");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError("Failed to send feedback. Please try again later.");
    }
  };

  return (
    <>
      <Navbar />

      <div style={container}>
        <h1 style={title}>📝 Send Feedback</h1>

        <div style={card}>
          {status === "success" ? (
            <div style={successBox}>
              ✅ Thank you!
              <br />
              Your feedback helps us improve TIMELINES.
            </div>
          ) : (
            <>
              <p style={text}>
                We value your feedback. Share your thoughts, suggestions, or
                issues so we can make TIMELINES better for everyone.
              </p>

              <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
                <textarea
                  placeholder="Write your feedback here…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={textarea}
                  disabled={status === "sending"}
                  required
                />

                {error && <div style={errorText}>❌ {error}</div>}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{
                    ...button,
                    background:
                      status === "sending" ? "#9bbcf2" : "#4a90e2",
                    cursor:
                      status === "sending" ? "not-allowed" : "pointer",
                  }}
                >
                  {status === "sending" ? "Submitting…" : "Submit Feedback"}
                </button>
              </form>
            </>
          )}
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

const textarea = {
  width: "100%",
  padding: 16,
  borderRadius: 12,
  border: "1px solid #d1d5db",
  fontSize: 16,
  outline: "none",
  resize: "vertical",
  minHeight: 140,
  marginTop: 10,
};

const button = {
  marginTop: 16,
  padding: 14,
  width: "100%",
  background: "#4a90e2",
  color: "#fff",
  fontWeight: 700,
  borderRadius: 12,
  border: "none",
  fontSize: 16,
};

const successBox = {
  textAlign: "center",
  fontSize: 18,
  padding: 30,
  color: "#166534",
  background: "#ecfdf5",
  borderRadius: 14,
  border: "1px solid #a7f3d0",
  fontWeight: 600,
};

const errorText = {
  marginTop: 10,
  color: "#b91c1c",
  fontWeight: 600,
};
