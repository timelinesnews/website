import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { api } from "../../services/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const emailRef = useRef(null);
  const router = useRouter();

  // Auto-redirect if logged in
  useEffect(() => {
    if (localStorage.getItem("admin_token")) router.push("/admin");
    if (emailRef.current) emailRef.current.focus();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.post("/admin/login", { email, password });
      localStorage.setItem("admin_token", res.data.token);
      router.push("/admin");
    } catch (err) {
      setErrorMsg("Invalid email or password.");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#eef1f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "380px",
          background: "#fff",
          padding: "35px",
          borderRadius: "14px",
          boxShadow: "0 4px 25px rgba(0,0,0,0.12)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
            fontWeight: "600",
          }}
        >
          TIMELINES Admin Login
        </h2>

        {/* Error Message */}
        {errorMsg && (
          <div
            style={{
              background: "#ffdddd",
              color: "#b30000",
              padding: "10px 12px",
              marginBottom: "18px",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            {errorMsg}
          </div>
        )}

        <label>Email</label>
        <input
          ref={emailRef}
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <label>Password</label>
        <div style={{ position: "relative" }}>
          <input
            type={showPass ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...inputStyle, paddingRight: "40px" }}
          />

          {/* Show/Hide Password */}
          <span
            onClick={() => setShowPass(!showPass)}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "#555",
              fontSize: "14px",
            }}
          >
            {showPass ? "Hide" : "Show"}
          </span>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: loading ? "#777" : "#111",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "15px",
            fontSize: "16px",
            transition: "0.3s",
          }}
        >
          {loading ? (
            <span style={{ fontSize: "15px" }}>Verifying...</span>
          ) : (
            "Login"
          )}
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "5px",
  marginBottom: "18px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  outline: "none",
  fontSize: "14px",
};
