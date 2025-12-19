// pages/Signup.js
import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { auth } from "../firebase/firebaseClient";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { api } from "../services/api";

export default function Signup() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= VALIDATION ================= */
  const validate = () => {
    if (!fullName.trim()) return "Full name is required.";
    if (!email.includes("@")) return "Invalid email address.";
    if (password.length < 6)
      return "Password must be at least 6 characters.";
    if (password !== confirmPassword)
      return "Passwords do not match.";
    return null;
  };

  /* ================= SIGNUP HANDLER ================= */
  const handleSignup = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setMessage("");

    const error = validate();
    if (error) {
      setMessage("❌ " + error);
      return;
    }

    setIsLoading(true);

    try {
      /* 1️⃣ Firebase Signup */
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = userCred.user;

      /* 2️⃣ Get Firebase ID Token */
      const idToken = await firebaseUser.getIdToken();

      /* 3️⃣ Send token to backend */
      const data = await api.firebaseLogin(idToken);

      if (data?.token) {
        localStorage.setItem("auth_token", data.token);

        // store name temporarily (used on edit-profile)
        localStorage.setItem("temp_fullName", fullName);

        setMessage("🎉 Account created! Redirecting...");

        setTimeout(() => {
          router.push("/edit-profile");
        }, 1000);
      } else {
        setMessage(
          "❌ Signup failed: " + (data?.message || "Server error")
        );
      }
    } catch (err) {
      console.error("Signup error:", err);

      let msg = "❌ Something went wrong.";

      if (err.code === "auth/email-already-in-use")
        msg = "⚠️ Email already in use.";
      else if (err.code === "auth/invalid-email")
        msg = "⚠️ Invalid email address.";
      else if (err.code === "auth/weak-password")
        msg = "⚠️ Password is too weak.";

      setMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 🔍 SEO (important for trust & Adsense) */}
      <Head>
        <title>Signup | TIMELINES</title>
        <meta
          name="description"
          content="Create a TIMELINES account to post news, follow creators, and stay updated with local and global stories."
        />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "30px",
          backgroundImage: "url('/slides/slide1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        />

        {/* Card */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "420px",
            padding: "35px",
            backgroundColor: "#fff",
            borderRadius: "18px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            textAlign: "center",
          }}
        >
          <img
            src="/logo.png"
            alt="TIMELINES Logo"
            style={{ height: "120px", marginBottom: "6px" }}
          />

          <h2
            style={{
              fontSize: "26px",
              fontWeight: "700",
              marginBottom: "18px",
            }}
          >
            Create Your Account
          </h2>

          <form
            onSubmit={handleSignup}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
              style={inputStyle}
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              autoComplete="new-password"
              required
              style={inputStyle}
            />

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "14px",
                borderRadius: "12px",
                backgroundColor: "#4a90e2",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "700",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading
                ? "⏳ Creating Account..."
                : "Create Account"}
            </button>
          </form>

          {message && (
            <p
              style={{
                marginTop: "16px",
                color: message.includes("🎉")
                  ? "green"
                  : "#ff3f3f",
                fontWeight: "600",
              }}
            >
              {message}
            </p>
          )}

          <p
            style={{
              marginTop: "20px",
              fontSize: "14px",
              color: "#555",
            }}
          >
            Already have an account?{" "}
            <a
              href="/login"
              style={{
                color: "#4a90e2",
                textDecoration: "underline",
                fontWeight: "600",
              }}
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

/* ================= INPUT STYLE ================= */
const inputStyle = {
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #ccc",
  fontSize: "16px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};
