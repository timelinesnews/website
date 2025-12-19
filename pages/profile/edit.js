// pages/profile/edit.js
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "../../services/api";

/* 🔐 BACKEND URL */
const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND ||
  "https://backend-7752.onrender.com";

export default function EditProfile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    username: "",
    country: "",
    state: "",
    city: "",
    village: "",
  });

  /* ==========================================================
     LOAD PROFILE
  ========================================================== */
  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const profile = await api.getProfile();
      if (!profile) {
        router.replace("/login");
        return;
      }

      const u = profile.user || profile;

      let avatar = u.avatar || "";
      if (avatar && !avatar.startsWith("http")) {
        avatar = `${BACKEND}/${avatar.replace(/^\/+/, "")}`;
      }

      setForm({
        name: u.name || "",
        username: u.username || "",
        country: u.country || "",
        state: u.state || "",
        city: u.city || "",
        village: u.village || "",
      });

      setAvatarPreview(avatar || "/user-avatar.png");
    } catch (err) {
      console.error("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================================
     INPUT HANDLER
  ========================================================== */
  const updateField = (key, value) => {
    if (key === "username") {
      value = value.replace(/\s+/g, "").toLowerCase();
    }
    setForm((p) => ({ ...p, [key]: value }));
  };

  /* ==========================================================
     AVATAR CHANGE
  ========================================================== */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  /* ==========================================================
     SAVE PROFILE
  ========================================================== */
  const saveProfile = async () => {
    if (!form.name.trim()) {
      alert("Name cannot be empty.");
      return;
    }

    if (!form.username.trim()) {
      alert("Username cannot be empty.");
      return;
    }

    setSaving(true);

    try {
      const data = new FormData();
      Object.keys(form).forEach((k) => data.append(k, form[k]));
      if (avatarFile) data.append("avatar", avatarFile);

      const res = await api.updateProfile(data);

      if (res?.success) {
        alert("✅ Profile updated successfully!");
        router.push("/profile");
      } else {
        alert("❌ " + (res?.message || "Update failed."));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     LOADING
  ========================================================== */
  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        ⏳ Loading profile…
      </div>
    );

  /* ==========================================================
     UI
  ========================================================== */
  return (
    <>
      {/* 🔍 SEO */}
      <Head>
        <title>Edit Profile | TIMELINES</title>
        <meta
          name="description"
          content="Edit your TIMELINES profile details, avatar and location."
        />
      </Head>

      <div style={styles.wrapper}>
        {/* BACK */}
        <button onClick={() => router.back()} style={styles.backBtn}>
          ← Back
        </button>

        <h1 style={styles.title}>Edit Profile</h1>

        {/* AVATAR */}
        <div style={styles.avatarSection}>
          <div style={{ position: "relative" }}>
            <img
              src={avatarPreview}
              style={styles.avatar}
              alt="Profile avatar"
            />

            <label htmlFor="avatarInput" style={styles.avatarEditBtn}>
              ✏️
            </label>

            <input
              id="avatarInput"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
          </div>

          <div style={styles.avatarInfo}>
            Tap the pencil to change avatar
          </div>
        </div>

        {/* FORM */}
        {Object.keys(form).map((key) => (
          <div style={styles.formGroup} key={key}>
            <label style={styles.label}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            <input
              style={styles.input}
              value={form[key]}
              autoComplete={key}
              onChange={(e) =>
                updateField(key, e.target.value)
              }
              placeholder={`Enter your ${key}`}
            />
          </div>
        ))}

        {/* SAVE */}
        <button
          onClick={saveProfile}
          disabled={saving}
          style={{
            ...styles.saveBtn,
            background: saving ? "#999" : "#4f46e5",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving…" : "💾 Save Changes"}
        </button>
      </div>
    </>
  );
}

/* ==========================================================
   STYLES
========================================================== */
const styles = {
  wrapper: {
    maxWidth: 560,
    margin: "0 auto",
    padding: 20,
    fontFamily: "Inter, sans-serif",
  },

  backBtn: {
    background: "transparent",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    marginBottom: 15,
  },

  title: {
    fontSize: 26,
    fontWeight: 800,
    marginBottom: 20,
  },

  avatarSection: {
    textAlign: "center",
    marginBottom: 30,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #ddd",
  },

  avatarEditBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    background: "#4f46e5",
    color: "#fff",
    fontSize: 14,
    padding: "6px 8px",
    borderRadius: "50%",
    cursor: "pointer",
  },

  avatarInfo: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
  },

  formGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: 600,
    color: "#555",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: 10,
    border: "1px solid #ccc",
    fontSize: 15,
    marginTop: 5,
    outline: "none",
    background: "#f9f9f9",
  },

  saveBtn: {
    width: "100%",
    marginTop: 25,
    padding: "12px",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    color: "#fff",
    border: "none",
  },
};
