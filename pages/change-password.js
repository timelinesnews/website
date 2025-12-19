// pages/change-password.js
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { api } from "../services/api";
import { useRouter } from "next/router";

export default function ChangePassword() {
  const router = useRouter();

  /* ------------------ States ------------------ */
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  /* ------------------ Protect Route ------------------ */
  useEffect(() => {
    if (!router.isReady) return;
    const token = localStorage.getItem("auth_token");
    if (!token) router.replace("/login");
  }, [router]);

  /* ------------------ Submit Handler ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setMsg("");

    if (newPass !== confirmPass) {
      setMsg("❌ New password & confirm password do not match");
      return;
    }

    if (newPass.length < 6) {
      setMsg("❌ Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await api.changePassword({
        currentPassword: oldPass,
        newPassword: newPass,
      });

      if (res?.success) {
        setMsg("✅ Password updated successfully!");
        setOldPass("");
        setNewPass("");
        setConfirmPass("");

        setTimeout(() => router.push("/profile"), 900);
      } else {
        setMsg(res?.message || "❌ Failed to update password");
      }
    } catch (err) {
      console.error(err);
      setMsg("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔍 SEO */}
      <Head>
        <title>Change Password | TIMELINES</title>
        <meta
          name="description"
          content="Securely change your TIMELINES account password."
        />
      </Head>

      <div style={styles.page}>
        <h2 style={styles.title}>Change Password</h2>

        <div style={styles.card}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <PasswordInput
              placeholder="Old Password"
              value={oldPass}
              setValue={setOldPass}
              show={showOld}
              setShow={setShowOld}
              autoComplete="current-password"
            />

            <PasswordInput
              placeholder="New Password"
              value={newPass}
              setValue={setNewPass}
              show={showNew}
              setShow={setShowNew}
              autoComplete="new-password"
            />

            <PasswordInput
              placeholder="Confirm New Password"
              value={confirmPass}
              setValue={setConfirmPass}
              show={showConfirm}
              setShow={setShowConfirm}
              autoComplete="new-password"
            />

            <button
              disabled={loading}
              type="submit"
              style={{
                ...styles.saveBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "⏳ Updating..." : "Update Password"}
            </button>
          </form>

          {msg && (
            <p
              style={{
                marginTop: 15,
                color: msg.includes("success") ? "green" : "#ff3f3f",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {msg}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------
   PASSWORD INPUT FIELD
------------------------------------------------------ */
function PasswordInput({
  placeholder,
  value,
  setValue,
  show,
  setShow,
  autoComplete,
}) {
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        required
        autoComplete={autoComplete}
        onChange={(e) => setValue(e.target.value)}
        style={styles.input}
      />

      <span onClick={() => setShow(!show)} style={styles.eye}>
        {show ? "👁️" : "👁️‍🗨️"}
      </span>
    </div>
  );
}

/* ------------------------------------------------------
   STYLES
------------------------------------------------------ */
const styles = {
  page: {
    maxWidth: 450,
    margin: "30px auto",
    padding: 20,
    fontFamily: "Inter, sans-serif",
  },

  title: {
    fontSize: 26,
    fontWeight: 800,
    marginBottom: 20,
    textAlign: "center",
  },

  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 14,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #ccc",
    fontSize: 16,
    outline: "none",
    background: "#fafafa",
  },

  eye: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: 20,
    userSelect: "none",
  },

  saveBtn: {
    padding: 14,
    borderRadius: 12,
    background: "#4f46e5",
    color: "white",
    fontWeight: 700,
    border: "none",
    fontSize: 16,
  },
};
