// pages/news/edit/[id].js
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "../../../services/api";

// Location Components
import CountrySelect from "../../../components/location/CountrySelect";
import StateSelect from "../../../components/location/StateSelect";
import CitySelect from "../../../components/location/CitySelect";
import VillageSelect from "../../../components/location/VillageSelect";

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND || "https://backend-7752.onrender.com";

export default function EditNewsPage() {
  const router = useRouter();
  const { id } = router.query;

  /* =========================
        STATES
  ========================= */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    headline: "",
    content: "",       // 🔥 FIX
    category: "",
    country: "",
    state: "",
    city: "",
    village: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  /* =========================
        CATEGORY LIST
  ========================= */
  const categories = [
    "Politics",
    "Sports",
    "Entertainment",
    "Technology",
    "Health",
    "Business",
    "World",
    "Local",
    "Crime",
    "Other",
  ];

  /* =========================
        AUTH + LOAD NEWS
  ========================= */
  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    loadNews();
  }, [id]);

  const loadNews = async () => {
    setLoading(true);
    setMsg("");

    try {
      const res = await api.getNewsById(id);
      const news = res?.news || res;
      if (!news) throw new Error("News not found");

      const loc = news.location || {};

      setForm({
        headline: news.headline || "",
        content: news.content || "",   // 🔥 FIX
        category: news.category || "",
        country: loc.country || "",
        state: loc.state || "",
        city: loc.city || "",
        village: loc.village || "",
      });

      if (news.image) {
        setExistingImage(
          news.image.startsWith("http")
            ? news.image
            : `${BACKEND}/${news.image.replace(/^\/+/, "")}`
        );
      }
    } catch (err) {
      console.error(err);
      setMsg("❌ Failed to load news.");
    }

    setLoading(false);
  };

  /* =========================
        IMAGE HANDLER
  ========================= */
  const handleImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      setMsg("❌ Please upload a valid image file.");
      return;
    }

    if (f.size > 5 * 1024 * 1024) {
      setMsg("❌ Image must be under 5MB.");
      return;
    }

    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  /* =========================
        UPDATE FIELD
  ========================= */
  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /* =========================
        VALIDATION
  ========================= */
  const validate = () => {
    if (!form.headline.trim()) return "Headline is required.";
    if (form.headline.length < 10)
      return "Headline must be at least 10 characters.";
    if (!form.content.trim()) return "Content is required.";
    if (!form.category) return "Please select a category.";
    if (!form.country || !form.state || !form.city)
      return "Country, state and city are required.";
    return null;
  };

  /* =========================
        SAVE NEWS
  ========================= */
  const save = async (e) => {
    e.preventDefault();
    setMsg("");

    const error = validate();
    if (error) {
      setMsg("❌ " + error);
      return;
    }

    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("headline", form.headline);
      fd.append("content", form.content);   // 🔥 FIX
      fd.append("category", form.category);
      fd.append("country", form.country);
      fd.append("state", form.state);
      fd.append("city", form.city);
      fd.append("village", form.village || "");

      if (imageFile) fd.append("image", imageFile);

      const token = localStorage.getItem("auth_token");

      const res = await fetch(`${BACKEND}/api/v1/news/${id}`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Update failed");

      setMsg("✅ News updated successfully!");
      setTimeout(() => router.push(`/news/${id}`), 800);
    } catch (err) {
      setMsg("❌ " + err.message);
    }

    setSaving(false);
  };

  /* =========================
        DELETE NEWS
  ========================= */
  const deleteNews = async () => {
    if (!confirm("Delete this news permanently?")) return;

    setDeleting(true);
    setMsg("");

    try {
      const token = localStorage.getItem("auth_token");

      const res = await fetch(`${BACKEND}/api/v1/news/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Delete failed");

      router.push("/profile/posts");
    } catch (err) {
      setMsg("❌ " + err.message);
    }

    setDeleting(false);
  };

  /* =========================
        LOADING
  ========================= */
  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        ⏳ Loading news…
      </div>
    );

  /* =========================
        UI
  ========================= */
  return (
    <>
      <Head>
        <title>Edit News | TIMELINES</title>
      </Head>

      <div style={styles.wrapper}>
        <h2 style={styles.title}>✏️ Edit News</h2>

        <form onSubmit={save} style={styles.card}>
          {/* HEADLINE */}
          <label style={styles.label}>Headline</label>
          <input
            value={form.headline}
            onChange={(e) => updateField("headline", e.target.value)}
            style={styles.input}
          />

          {/* CONTENT */}
          <label style={styles.label}>Content</label>
          <textarea
            value={form.content}
            onChange={(e) => updateField("content", e.target.value)}
            style={{ ...styles.input, minHeight: 120 }}
          />

          {/* CATEGORY */}
          <label style={styles.label}>Category</label>
          <select
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            style={styles.input}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          {/* LOCATION */}
          <div style={styles.grid}>
            <CountrySelect
              value={form.country}
              onChange={(v) => {
                updateField("country", v);
                updateField("state", "");
                updateField("city", "");
                updateField("village", "");
              }}
            />

            <StateSelect
              countryCode={form.country}
              value={form.state}
              onChange={(v) => {
                updateField("state", v);
                updateField("city", "");
                updateField("village", "");
              }}
            />

            <CitySelect
              countryCode={form.country}
              stateCode={form.state}
              value={form.city}
              onChange={(v) => {
                updateField("city", v);
                updateField("village", "");
              }}
            />

            {form.city && (
              <VillageSelect
                countryCode={form.country}
                stateCode={form.state}
                cityName={form.city}
                value={form.village}
                onChange={(v) => updateField("village", v)}
              />
            )}
          </div>

          {/* IMAGE */}
          <label style={styles.label}>Image</label>
          <div style={styles.imageRow}>
            <input type="file" accept="image/*" onChange={handleImage} />
            {(preview || existingImage) && (
              <img src={preview || existingImage} style={styles.preview} />
            )}
          </div>

          {/* MESSAGE */}
          {msg && (
            <div
              style={{
                marginTop: 12,
                color: msg.startsWith("✅") ? "green" : "red",
                fontWeight: 600,
              }}
            >
              {msg}
            </div>
          )}

          {/* ACTIONS */}
          <div style={styles.actions}>
            <button disabled={saving} style={styles.saveBtn}>
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={() => router.push(`/news/${id}`)}
              style={styles.cancelBtn}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={deleteNews}
              disabled={deleting}
              style={styles.deleteBtn}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

/* =========================
        STYLES
========================= */
const styles = {
  wrapper: {
    maxWidth: 850,
    margin: "30px auto",
    padding: 16,
    fontFamily: "Inter, sans-serif",
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    marginBottom: 16,
  },
  card: {
    padding: 20,
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 6px 18px rgba(0,0,0,0.07)",
  },
  label: {
    fontWeight: 700,
    marginTop: 14,
    display: "block",
  },
  input: {
    padding: 12,
    width: "100%",
    borderRadius: 10,
    border: "1px solid #ccc",
    fontSize: 15,
    marginTop: 6,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
    marginTop: 14,
  },
  imageRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginTop: 10,
  },
  preview: {
    width: 140,
    height: 95,
    objectFit: "cover",
    borderRadius: 10,
  },
  actions: {
    display: "flex",
    gap: 10,
    marginTop: 20,
  },
  saveBtn: {
    background: "#1a73e8",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
  },
  cancelBtn: {
    padding: "10px 18px",
    borderRadius: 8,
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
  },
  deleteBtn: {
    marginLeft: "auto",
    padding: "10px 18px",
    background: "#ff4d4d",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
  },
};
