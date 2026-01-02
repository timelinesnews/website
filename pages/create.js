// pages/create.js
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { api, getAuthToken } from "../services/api";
import { useRouter } from "next/router";

// Location
import CountrySelect from "../components/location/CountrySelect";

export default function Create() {
  const router = useRouter();

  /* ===============================
      FORM STATES
  =============================== */
  const [form, setForm] = useState({
    headline: "",
    content: "",
    category: "",
    country: "",
    state: "",
    city: "",
    village: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const categories = [
    "Politics",
    "Sports",
    "Entertainment",
    "Technology",
    "Health",
    "Business",
    "Local",
    "Crime",
    "Other",
  ];

  /* ===============================
      REGEX (alphabets only)
  =============================== */
  const locationRegex = /^[A-Za-z\s]{2,50}$/;

  /* ===============================
      AUTH
  =============================== */
  useEffect(() => {
    const init = async () => {
      const token = getAuthToken();
      if (!token) return router.replace("/login");

      try {
        const p = await api.getProfile();
        const u = p?.user || p;
        if (!u) return router.replace("/login");

        setForm((prev) => ({
          ...prev,
          country: u.country || "",
        }));
      } catch {
        router.replace("/login");
      }
    };

    init();
  }, []);

  /* ===============================
      IMAGE HANDLER
  =============================== */
  const handleImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      setMsg("❌ Please upload a valid image file.");
      return;
    }

    if (f.size > 5 * 1024 * 1024) {
      setMsg("❌ Image size must be under 5MB.");
      return;
    }

    setImage(f);
    setPreview(URL.createObjectURL(f));
  };

  /* ===============================
      UPDATE FIELD
  =============================== */
  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ===============================
      COUNTRY CHANGE
  =============================== */
  const changeCountry = (v) => {
    updateField("country", v);
    updateField("state", "");
    updateField("city", "");
    updateField("village", "");
  };

  /* ===============================
      VALIDATION
  =============================== */
  const validateForm = () => {
    if (!form.headline.trim()) return "Headline is required.";
    if (form.headline.length < 10)
      return "Headline should be at least 10 characters.";

    if (!form.content.trim()) return "Content is required.";
    if (form.content.length < 50)
      return "Content should be at least 50 characters.";

    if (!form.category) return "Please select a category.";
    if (!form.country) return "Country is required.";

    if (!locationRegex.test(form.state))
      return "State must contain only alphabets.";

    if (!locationRegex.test(form.city))
      return "City must contain only alphabets.";

    if (form.village && !locationRegex.test(form.village))
      return "Village must contain only alphabets.";

    if (!image) return "Please upload an image.";

    return null;
  };

  /* ===============================
      SUBMIT
  =============================== */
  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    const error = validateForm();
    if (error) {
      setMsg("❌ " + error);
      return;
    }

    setIsLoading(true);

    try {
      const fd = new FormData();
      fd.append("headline", form.headline);
      fd.append("content", form.content);
      fd.append("category", form.category);
      fd.append("country", form.country);
      fd.append("state", form.state);
      fd.append("city", form.city);
      fd.append("village", form.village || "");
      fd.append("photoUrl", image);

      const res = await api.createNews(fd);

      if (res?.success) {
        setMsg("✅ News posted successfully!");

        setForm((prev) => ({
          ...prev,
          headline: "",
          content: "",
          category: "",
          state: "",
          city: "",
          village: "",
        }));

        setImage(null);
        setPreview(null);

        setTimeout(() => router.push("/"), 1200);
      } else {
        setMsg("❌ " + (res?.message || "Failed to post news."));
      }
    } catch (err) {
      console.error(err);
      setMsg("⚠️ Something went wrong. Please try again.");
    }

    setIsLoading(false);
  };

  /* ===============================
      UI
  =============================== */
  return (
    <>
      <Head>
        <title>Create News | TIMELINES</title>
      </Head>

      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>📰 Create News Post</h2>

          <form onSubmit={submit} style={styles.form}>
            <input
              placeholder="Headline"
              value={form.headline}
              onChange={(e) => updateField("headline", e.target.value)}
              style={styles.input}
            />

            <textarea
              placeholder="Write full news content…"
              value={form.content}
              onChange={(e) => updateField("content", e.target.value)}
              style={{ ...styles.input, minHeight: 120 }}
            />

            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              style={styles.input}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            {/* LOCATION */}
            <CountrySelect value={form.country} onChange={changeCountry} />

            <input
              placeholder="Enter State"
              value={form.state}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || locationRegex.test(v)) {
                  updateField("state", v);
                }
              }}
              style={styles.input}
            />

            <input
              placeholder="Enter City"
              value={form.city}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || locationRegex.test(v)) {
                  updateField("city", v);
                }
              }}
              style={styles.input}
            />

            <input
              placeholder="Enter Village (optional)"
              value={form.village}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || locationRegex.test(v)) {
                  updateField("village", v);
                }
              }}
              style={styles.input}
            />

            {/* IMAGE */}
            <input type="file" accept="image/*" onChange={handleImage} />
            {preview && <img src={preview} style={styles.preview} />}

            <button disabled={isLoading} style={styles.btn}>
              {isLoading ? "Posting…" : "🚀 Post News"}
            </button>
          </form>

          {msg && (
            <div style={{ marginTop: 12, fontWeight: 600 }}>{msg}</div>
          )}
        </div>
      </div>
    </>
  );
}

/* ===============================
      STYLES
=============================== */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: 20,
  },
  card: {
    background: "#fff",
    padding: 25,
    borderRadius: 18,
    maxWidth: 720,
    margin: "0 auto",
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    marginBottom: 20,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  input: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #d3d8e5",
    fontSize: 16,
  },
  preview: {
    width: "100%",
    marginTop: 12,
    borderRadius: 12,
  },
  btn: {
    padding: 14,
    fontSize: 16,
    borderRadius: 12,
    background: "#3b5bdb",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
  },
};
