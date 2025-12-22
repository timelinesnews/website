import axios from "axios";

/* ======================================================
   🔗 BASE URL
====================================================== */
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://backend-7752.onrender.com/api/v1";

/* ======================================================
   ⚙️ AXIOS INSTANCE
====================================================== */
const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 25000,
  headers: {
    Accept: "application/json",
  },
});

/* ======================================================
   🔑 TOKEN HELPERS
====================================================== */
const AUTH_KEY = "auth_token";
const ADMIN_KEY = "admin_token";

export const setAuthToken = (token) => {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(AUTH_KEY, token);
  else localStorage.removeItem(AUTH_KEY);
};

export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_KEY);
};

export const getAdminToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_KEY);
};

/* ======================================================
   🛡 REQUEST INTERCEPTOR
====================================================== */
instance.interceptors.request.use(
  (config) => {
    if (config?.url?.includes("undefined")) {
      console.error("🚨 BLOCKED API REQUEST:", config.url);
      return Promise.reject(new Error("Blocked undefined request"));
    }

    if (typeof window !== "undefined") {
      const admin = getAdminToken();
      const user = getAuthToken();
      const token = admin || user;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (err) => Promise.reject(err)
);

/* ======================================================
   🛡 RESPONSE INTERCEPTOR (NO AUTO LOGOUT)
====================================================== */
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      console.warn("⚠️ 401 received (token preserved)");
    }
    return Promise.reject(err);
  }
);

/* ======================================================
   🛡 HELPERS
====================================================== */
const safe = (res) => res?.data ?? null;

const errOut = (err) => {
  if (err?.response?.data) return err.response.data;
  return { message: err?.message || "Something went wrong" };
};

/* ======================================================
   🧩 API OBJECT
====================================================== */
export const api = {
  /* ============================
       🔥 FIREBASE AUTH
  ============================ */
  firebaseLogin: async (idToken) => {
    if (!idToken) return { error: "Missing token" };
    try {
      const res = await instance.post("/auth/firebase-login", { idToken });
      const data = res?.data;

      const token =
        data?.token ||
        data?.data?.token ||
        data?.accessToken;

      if (token) setAuthToken(token);
      else console.error("❌ Firebase login: token missing", data);

      return data;
    } catch (err) {
      return { error: errOut(err) };
    }
  },

  /* ============================
       👤 BASIC AUTH (FIXED)
  ============================ */
  login: async (payload) => {
    try {
      const res = await instance.post("/auth/login", payload);
      const data = res?.data;

      // ✅ SUPPORT ALL RESPONSE SHAPES
      const token =
        data?.token ||
        data?.data?.token ||
        data?.accessToken;

      if (token) {
        setAuthToken(token);
      } else {
        console.error("❌ Login success but token missing", data);
        return { error: { message: "Login token missing" } };
      }

      return data;
    } catch (err) {
      return { error: errOut(err) };
    }
  },

  signup: async (payload) => {
    try {
      const res = await instance.post("/auth/signup", payload);
      return safe(res);
    } catch (err) {
      return { error: errOut(err) };
    }
  },

  logout: async () => {
    setAuthToken(null);
    return { success: true };
  },

  /* ============================
       👤 PROFILE
  ============================ */
  getProfile: async () => {
    try {
      const res = await instance.get("/auth/me");
      return safe(res);
    } catch {
      console.warn("Profile load failed, token kept");
      return null;
    }
  },

  updateProfile: async (formData) => {
    try {
      const res = await instance.put("/auth/update", formData, {
        headers:
          formData instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : {},
      });
      return safe(res);
    } catch (err) {
      return { error: errOut(err) };
    }
  },

  /* ============================
       🌍 LOCATION
  ============================ */
  getStates: async (countryCode) => {
    if (!countryCode) return [];
    try {
      const res = await instance.get(`/locations/states/${countryCode}`);
      return safe(res)?.data ?? [];
    } catch {
      return [];
    }
  },

  getCities: async (countryCode, stateCode) => {
    if (!countryCode || !stateCode) return [];
    try {
      const res = await instance.get(
        `/locations/cities/${countryCode}/${stateCode}`
      );
      return safe(res)?.data ?? [];
    } catch {
      return [];
    }
  },

  getVillages: async (params) => {
    if (!params) return [];
    try {
      const res = await instance.get(`/locations/villages`, { params });
      return safe(res)?.data ?? [];
    } catch {
      return [];
    }
  },

  /* ============================
       📰 NEWS
  ============================ */
  getNews: async (params = {}) => {
    try {
      const res = await instance.get("/news", { params });
      return safe(res)?.data ?? [];
    } catch {
      return [];
    }
  },

  getNewsById: async (id) => {
    if (!id) return null;
    try {
      const res = await instance.get(`/news/${id}`);
      return safe(res)?.data ?? null;
    } catch {
      return null;
    }
  },

  createNews: async (formData) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${BASE_URL}/news`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      return await res.json();
    } catch {
      return { error: { message: "Upload failed" } };
    }
  },

  /* ============================
       💬 COMMENTS
  ============================ */
  getComments: async (newsId) => {
    if (!newsId) return [];
    try {
      const res = await instance.get(`/news/${newsId}/comments`);
      return safe(res)?.comments ?? [];
    } catch {
      return [];
    }
  },
};

export default instance;
