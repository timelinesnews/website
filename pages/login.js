// pages/Login.js
import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { auth } from "../firebase/firebaseClient";
import { signInWithEmailAndPassword } from "firebase/auth";
import { api } from "../services/api";

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleFirebaseLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setMessage("");

    if (!emailOrUsername || !password) {
      setMessage("⚠️ Please enter email and password");
      return;
    }

    try {
      setIsLoading(true);

      /* ============================================================
         STEP 1 — Firebase Email/Password login
      ============================================================ */
      const result = await signInWithEmailAndPassword(
        auth,
        emailOrUsername,
        password
      );

      const idToken = await result.user.getIdToken();

      /* ============================================================
         STEP 2 — Send Firebase token to backend
      ============================================================ */
      const backendResp = await api.firebaseLoginAndStoreToken(idToken);

      if (backendResp?.token) {
        setMessage("✅ Login successful! Redirecting...");
        setTimeout(() => router.push("/"), 900);
      } else {
        setMessage(
          backendResp?.message ||
            "❌ Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      console.error(err);

      if (err.code === "auth/user-not-found") {
        setMessage("❌ No account found with this email");
      } else if (err.code === "auth/wrong-password") {
        setMessage("❌ Incorrect password");
      } else if (err.code === "auth/too-many-requests") {
        setMessage("⚠️ Too many attempts. Try again later.");
      } else {
        setMessage("❌ Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 🔍 SEO (important for trust & Adsense) */}
      <Head>
        <title>Login | TIMELINES</title>
        <meta
          name="description"
          content="Login to TIMELINES to read, post, and manage local and global news."
        />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: "url('/slides/slide1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          padding: "20px",
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
          }}
        />

        {/* Main Card */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "420px",
            padding: "40px 30px",
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            color: "#000",
            boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            textAlign: "center",
          }}
        >
          {/* Logo */}
          <img
            src="/logo.png"
            alt="TIMELINES Logo"
            style={{
              height: "120px",
              display: "block",
              margin: "0 auto 12px auto",
            }}
          />

          <h2
            style={{
              fontSize: "26px",
              fontWeight: "700",
              marginBottom: "6px",
            }}
          >
            Welcome to TIMELINES
          </h2>

          <p
            style={{
              fontSize: "15px",
              color: "#666",
              marginBottom: "26px",
              lineHeight: "22px",
            }}
          >
            Login using your email & password to continue.
          </p>

          {/* Form */}
          <form
            onSubmit={handleFirebaseLogin}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <input
              type="email"
              placeholder="Email"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              required
              autoComplete="email"
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
                border: "none",
                fontSize: "17px",
                fontWeight: "600",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "0.25s",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "⏳ Logging in..." : "Login"}
            </button>
          </form>

          {/* Message */}
          {message && (
            <p
              style={{
                marginTop: "20px",
                color: message.includes("successful")
                  ? "green"
                  : "#ff3f3f",
                fontWeight: "500",
              }}
            >
              {message}
            </p>
          )}

          {/* Signup Link */}
          <p
            style={{
              marginTop: "25px",
              fontSize: "14px",
              color: "#555",
            }}
          >
            Don’t have an account?{" "}
            <a
              href="/signup"
              style={{
                color: "#4a90e2",
                textDecoration: "underline",
                fontWeight: "600",
              }}
            >
              Signup
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

/* ================= INPUT STYLE ================= */
const inputStyle = {
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #ccc",
  fontSize: "16px",
  outline: "none",
};
