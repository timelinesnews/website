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
    if (typeof window !== "undefined") {
      const token = getAdminToken() || getAuthToken();
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
      console.warn("⚠️ 401 received – token preserved");
    }
    return Promise.reject(err);
  }
);

/* ======================================================
   🧩 HELPERS
====================================================== */
const safe = (res) => res?.data ?? null;

const errOut = (err) => {
  if (err?.response?.data) return err.response.data;
  return { message: err?.message || "Something went wrong" };
};

/* ======================================================
   🧩 API
====================================================== */
export const api = {
  /* =========================
       🔐 LOGIN
  ========================= */
  login: async (payload) => {
    try {
      const res = await instance.post("/auth/login", payload);
      const data = res?.data;

      const token =
        data?.token ||
        data?.data?.token ||
        data?.accessToken;

      if (!token) {
        return { error: { message: "Login token missing" } };
      }

      // ✅ ONLY store token – NO /me CALL HERE
      setAuthToken(token);

      return {
        success: true,
        user: data?.user || null,
      };
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

  /* =========================
       👤 PROFILE
  ========================= */
  getProfile: async () => {
    try {
      const res = await instance.get("/auth/me");
      return safe(res);
    } catch (err) {
      // ✅ IMPORTANT: return explicit error
      return { error: true };
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

  /* =========================
       📰 NEWS
  ========================= */
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
};

export default instance;
