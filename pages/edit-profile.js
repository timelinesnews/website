import React, { useState, useEffect } from "react";
import { api, getAuthToken } from "../services/api";
import { useRouter } from "next/router";

export default function EditProfile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [user, setUser] = useState(null);

  // Editable fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");

  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [village, setVillage] = useState("");
  const [age, setAge] = useState("");

  // Dropdown list data
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [villagesList, setVillagesList] = useState([]);

  // Avatar
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("/user-avatar.png");

  // Username validation state
  const [usernameError, setUsernameError] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState(true);

  /* LOAD USER PROFILE */
  useEffect(() => {
    const loadUser = async () => {
      const token = getAuthToken();
      if (!token) return router.push("/login");

      const data = await api.getProfile();
      if (!data?.user) return router.push("/login");

      const u = data.user;
      setUser(u);

      setFirstName(u.firstName || "");
      setLastName(u.lastName || "");
      setUsername(u.username || "");
      setPreview(u.profilePicture || "/user-avatar.png");

      setCountry(u.country || "India");
      setState(u.state || "");
      setCity(u.city || "");
      setVillage(u.village || "");
      setAge(u.age || "");

      setLoading(false);
    };

    loadUser();
  }, []);

  /* STRICT USERNAME VALIDATION */
  const validateUsername = (value) => {
    const val = value.toLowerCase();

    if (val.length < 3 || val.length > 30) {
      setUsernameError("Username must be 3–30 characters.");
      setIsUsernameValid(false);
      return;
    }

    if (!/^[a-z0-9._]+$/.test(val)) {
      setUsernameError("Only letters, numbers, dot (.) and underscore (_) allowed.");
      setIsUsernameValid(false);
      return;
    }

    if (val.includes("..")) {
      setUsernameError("Username cannot contain consecutive dots (..)");
      setIsUsernameValid(false);
      return;
    }

    setUsernameError("");
    setIsUsernameValid(true);
  };

  useEffect(() => {
    if (username) validateUsername(username);
  }, [username]);

  /* LOAD STATE LIST */
  useEffect(() => {
    if (!country) return;

    const fetchStates = async () => {
      try {
        const res = await api.getStates(country);
        setStatesList(res.states || []);
      } catch {
        setStatesList([]);
      }
    };

    fetchStates();
  }, [country]);

  /* LOAD CITY LIST */
  useEffect(() => {
    if (!state) return;

    const fetchCities = async () => {
      try {
        const res = await api.getCities(state);
        setCitiesList(res.cities || []);
      } catch {
        setCitiesList([]);
      }
    };

    fetchCities();
  }, [state]);

  /* LOAD VILLAGE LIST */
  useEffect(() => {
    if (!city) return;

    const fetchVillages = async () => {
      try {
        const res = await api.getVillages(city);
        setVillagesList(res.villages || []);
      } catch {
        setVillagesList([]);
      }
    };

    fetchVillages();
  }, [city]);

  /* IMAGE PREVIEW */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  /* SAVE PROFILE */
  const handleSave = async (e) => {
    e.preventDefault();

    if (!isUsernameValid) {
      setMessage("❌ Fix username before saving.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("username", username.toLowerCase());
      formData.append("country", country);
      formData.append("state", state);
      formData.append("city", city);
      formData.append("village", village);
      formData.append("age", age);

      if (avatar) formData.append("picture", avatar);

      const data = await api.updateProfile(formData);

      if (data?.success) {
        setMessage("✅ Profile updated successfully!");
        setTimeout(() => router.push("/"), 1300);
      } else {
        setMessage("❌ " + (data?.message || "Update failed"));
      }
    } catch {
      setMessage("❌ Something went wrong.");
    }

    setSaving(false);
  };

  /* LOADING SCREEN */
  if (loading)
    return <div style={loadingBox}>⏳ Loading profile...</div>;

  return (
    <div style={container}>
      <h2 style={title}>Edit Profile</h2>

      <div style={card}>
        {/* Avatar Section */}
        <div style={avatarWrapper}>
          <div style={avatarFrame}>
            <img src={preview} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          <label htmlFor="uploadPhoto" style={uploadBtn}>
            Upload New Photo
          </label>
          <input id="uploadPhoto" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
        </div>

        {/* FORM */}
        <form onSubmit={handleSave} style={formWrapper}>
          <div style={row}>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" style={input} required />
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" style={input} required />
          </div>

          {/* Username with strict validation */}
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="Username"
              style={input}
              required
            />

            {usernameError && (
              <p style={{ fontSize: "13px", color: "red", marginTop: "4px" }}>{usernameError}</p>
            )}
          </div>

          {/* LOCATION FIELDS */}
          <select value={state} onChange={(e) => setState(e.target.value)} style={input} required>
            <option value="">Select State</option>
            {statesList.map((s, i) => <option key={i} value={s}>{s}</option>)}
          </select>

          <select value={city} onChange={(e) => setCity(e.target.value)} style={input} required>
            <option value="">Select City</option>
            {citiesList.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>

          <select value={village} onChange={(e) => setVillage(e.target.value)} style={input} required>
            <option value="">Select Village</option>
            {villagesList.map((v, i) => <option key={i} value={v}>{v}</option>)}
          </select>

          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" style={input} required />

          <input type="email" value={user.email} readOnly style={readOnly} />
          <input type="text" value={user.phone} readOnly style={readOnly} />

          <button
            type="submit"
            disabled={saving || !isUsernameValid}
            style={{
              ...saveBtn,
              background: !isUsernameValid ? "#888" : "#4a90e2",
              cursor: !isUsernameValid ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "⏳ Saving..." : "Save Changes"}
          </button>
        </form>

        {message && <p style={messageStyle}>{message}</p>}
      </div>
    </div>
  );
}

/* STYLES */
const container = {
  maxWidth: "800px",
  margin: "20px auto",
  padding: "20px",
  fontFamily: "Inter, sans-serif",
};

const loadingBox = {
  textAlign: "center",
  marginTop: "80px",
  fontSize: "20px",
  color: "#555",
};

const title = {
  fontSize: "26px",
  fontWeight: "700",
  marginBottom: "18px",
};

const card = {
  background: "#fff",
  padding: "25px",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
};

const avatarWrapper = {
  textAlign: "center",
  marginBottom: "25px",
};

const avatarFrame = {
  height: "140px",
  width: "140px",
  borderRadius: "50%",
  overflow: "hidden",
  margin: "0 auto",
  border: "3px solid #4a90e2",
  boxShadow: "0px 2px 10px rgba(0,0,0,0.15)",
};

const uploadBtn = {
  display: "inline-block",
  marginTop: "14px",
  padding: "10px 18px",
  background: "#4a90e2",
  color: "white",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
};

const formWrapper = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const row = {
  display: "flex",
  gap: "10px",
};

const input = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "16px",
  outline: "none",
  width: "100%",
  background: "#fff",
};

const readOnly = {
  ...input,
  background: "#f1f1f1",
  cursor: "not-allowed",
};

const saveBtn = {
  padding: "14px",
  background: "#4a90e2",
  color: "white",
  fontWeight: 700,
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  marginTop: "10px",
  fontSize: "16px",
};

const messageStyle = {
  marginTop: "15px",
  textAlign: "center",
  fontWeight: 600,
  color: "green",
};
