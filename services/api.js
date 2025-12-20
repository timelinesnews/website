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
   🛡 HARD BLOCK: NEVER ALLOW /undefined REQUESTS
====================================================== */
instance.interceptors.request.use(
  (config) => {
    if (config?.url?.includes("undefined")) {
      console.error(
        "🚨 BLOCKED API REQUEST WITH UNDEFINED:",
        config.method?.toUpperCase(),
        config.url
      );
      return Promise.reject(
        new Error("Blocked request with undefined id")
      );
    }

    if (typeof window !== "undefined") {
      const admin = getAdminToken();
      const user = getAuthToken();

      if (admin) config.headers.Authorization = `Bearer ${admin}`;
      else if (user)
        config.headers.Authorization = `Bearer ${user}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

/* ======================================================
   🛡 RESPONSE HELPERS
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
      return safe(res);
    } catch (err) {
      console.error("firebaseLogin error:", errOut(err));
      return { error: errOut(err) };
    }
  },

  firebaseLoginAndStoreToken: async (idToken) => {
    const data = await api.firebaseLogin(idToken);
    if (data?.token) setAuthToken(data.token);
    return data;
  },

  /* ============================
       👤 BASIC AUTH
  ============================ */
  login: async (payload) => {
    try {
      const res = await instance.post("/auth/login", payload);
      if (res?.data?.token) setAuthToken(res.data.token);
      return safe(res);
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

  updatePaymentMethod: async (payload) => {
    try {
      const res = await instance.put("/auth/payment-method", payload);
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
    if (!id) {
      console.warn("🚫 getNewsById blocked (invalid id):", id);
      return null;
    }
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
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      return await res.json();
    } catch {
      return { error: { message: "Upload failed" } };
    }
  },

  updateNews: async (id, formData) => {
    if (!id) return { error: "Invalid id" };
    try {
      const res = await instance.put(`/news/${id}`, formData);
      return safe(res);
    } catch (err) {
      return { error: errOut(err) };
    }
  },

  deleteNews: async (id) => {
    if (!id) return { error: "Invalid id" };
    try {
      const res = await instance.delete(`/news/${id}`);
      return safe(res);
    } catch (err) {
      return { error: errOut(err) };
    }
  },

  likeNews: async (id) => {
    if (!id) {
      console.warn("🚫 likeNews blocked (invalid id):", id);
      return null;
    }
    try {
      const res = await instance.post(`/news/${id}/like`);
      return safe(res);
    } catch {
      return null;
    }
  },

  incrementView: async (id) => {
    if (!id) {
      console.warn("🚫 incrementView blocked (invalid id):", id);
      return null;
    }
    try {
      const res = await instance.post(`/news/${id}/view`);
      return safe(res);
    } catch {
      return null;
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

  addComment: async (newsId, text) => {
    if (!newsId || !text) return { error: "Invalid comment" };
    try {
      const res = await instance.post(`/news/${newsId}/comment`, { text });
      return safe(res);
    } catch (err) {
      return { error: errOut(err) };
    }
  },

  deleteComment: async (newsId, commentId) => {
    if (!newsId || !commentId)
      return { error: "Invalid comment" };
    try {
      const res = await instance.delete(
        `/news/${newsId}/comment/${commentId}`
      );
      return safe(res);
    } catch (err) {
      return { error: errOut(err) };
    }
  },

  /* ============================
       🔧 UTILS
  ============================ */
  getBaseUrl: () => BASE_URL,
};

export default instance;
