import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "../services/api";

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND ||
  "https://backend-7752.onrender.com";

export default function Navbar() {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [dropdown, setDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const dropdownRef = useRef(null);

  /* =========================
     LOAD PROFILE (SAFE)
  ========================= */
  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const res = await api.getProfile();
        if (!active) return;

        const user = res?.user || res;
        if (!user) {
          setProfile(null);
          return;
        }

        const fixedUser = { ...user };

        if (
          fixedUser.avatar &&
          !fixedUser.avatar.startsWith("http")
        ) {
          fixedUser.avatar = `${BACKEND}/${fixedUser.avatar.replace(
            /^\/+/,
            ""
          )}`;
        }

        setProfile(fixedUser);
      } catch (err) {
        setProfile(null);
      } finally {
        active && setLoadingProfile(false);
      }
    };

    loadProfile();
    return () => (active = false);
  }, []);

  /* =========================
     CLOSE DROPDOWN OUTSIDE
  ========================= */
  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, []);

  /* =========================
     CLOSE ON ROUTE CHANGE
  ========================= */
  useEffect(() => {
    setDropdown(false);
    setMobileMenu(false);
  }, [router.asPath]);

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/search?query=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch { }
    setProfile(null);
    router.push("/login");
  };

  const DefaultAvatar = () => (
    <div style={styles.defaultIcon}>
      <img
        src="/default-user.png"
        alt="user"
        style={{ width: "60%" }}
      />
    </div>
  );

  return (
    <nav style={styles.navbar}>
      {/* LOGO */}
      <Link href="/" legacyBehavior>
        <a style={styles.logoBox}>
          <img src="/logo.png" alt="TIMELINES" style={styles.logo} />
        </a>
      </Link>

      {/* SEARCH */}
      <div style={styles.searchWrapper}>
        <input
          placeholder="Search news…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          style={styles.searchInput}
        />
      </div>

      {/* RIGHT */}
      <div style={styles.rightSection}>
        <button
          onClick={() => router.push("/create")}
          style={styles.createBtn}
        >
          ✏️ Create
        </button>

        <div className="desktop" style={styles.desktopMenu}>
          <Link href="/" legacyBehavior>
            <a style={styles.navBtn}>Home</a>
          </Link>
          <Link href="/categories" legacyBehavior>
            <a style={styles.navBtn}>Categories</a>
          </Link>

          {profile?.role === "admin" && (
            <Link href="/admin" legacyBehavior>
              <a style={{ ...styles.navBtn, ...styles.adminBtn }}>
                ⚡ Admin
              </a>
            </Link>
          )}
        </div>

        {/* AVATAR */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <div
            style={styles.avatarWrapper}
            onClick={() => setDropdown((p) => !p)}
          >
            {!loadingProfile && profile?.avatar ? (
              <img
                src={profile.avatar}
                alt="avatar"
                style={styles.avatar}
              />
            ) : (
              <DefaultAvatar />
            )}
          </div>

          {dropdown && (
            <div style={styles.dropdownMenu}>
              {profile ? (
                <>
                  <Link href="/profile" legacyBehavior>
                    <a style={styles.dropdownItem}>Profile</a>
                  </Link>
                  <Link href="/settings" legacyBehavior>
                    <a style={styles.dropdownItem}>Settings</a>
                  </Link>
                  <Link href="/saved" legacyBehavior>
                    <a style={styles.dropdownItem}>⭐ Saved</a>
                  </Link>

                  <button
                    onClick={logout}
                    style={{
                      ...styles.dropdownItem,
                      ...styles.logoutBtn,
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" legacyBehavior>
                  <a style={styles.dropdownItem}>Login</a>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <div
          className="mobile-btn"
          style={styles.mobileBtn}
          onClick={() => setMobileMenu((p) => !p)}
        >
          ☰
        </div>
      </div>

      {mobileMenu && (
        <div style={styles.mobileMenu}>
          <Link href="/" legacyBehavior>
            <a style={styles.mobileItem}>Home</a>
          </Link>
          <Link href="/categories" legacyBehavior>
            <a style={styles.mobileItem}>Categories</a>
          </Link>
          <Link href="/saved" legacyBehavior>
            <a style={styles.mobileItem}>⭐ Saved</a>
          </Link>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop {
            display: none !important;
          }
          .mobile-btn {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 18px",
    background: "#fff",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  },
  logoBox: { display: "flex", alignItems: "center" },
  logo: { height: 52 },
  searchWrapper: { flex: 1, margin: "0 16px" },
  searchInput: {
    width: "100%",
    padding: "10px 16px",
    borderRadius: 30,
    border: "1px solid #ddd",
  },
  rightSection: { display: "flex", alignItems: "center", gap: 10 },
  desktopMenu: { display: "flex", gap: 6 },
  navBtn: {
    padding: "8px 12px",
    borderRadius: 8,
    fontWeight: 600,
    textDecoration: "none",
    color: "#111",
  },
  adminBtn: { background: "#e63946", color: "#fff" },
  createBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "2px solid rgba(79,70,229,0.15)",
    background: "transparent",
    color: "#4f46e5",
    fontWeight: 700,
    cursor: "pointer",
  },
  avatarWrapper: { cursor: "pointer" },
  avatar: { width: 40, height: 40, borderRadius: "50%" },
  defaultIcon: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#eef2ff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownMenu: {
    position: "absolute",
    right: 0,
    top: 55,
    background: "#fff",
    borderRadius: 12,
    width: 210,
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  },
  dropdownItem: {
    padding: "12px 14px",
    display: "block",
    textDecoration: "none",
    color: "#111",
    borderBottom: "1px solid #eee",
    background: "transparent",
    width: "100%",
    textAlign: "left",
  },
  logoutBtn: { color: "#c92a2a", fontWeight: 700 },
  mobileBtn: { display: "none", fontSize: 22, cursor: "pointer" },
  mobileMenu: {
    position: "absolute",
    top: 70,
    right: 10,
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  },
  mobileItem: {
    fontWeight: 600,
    color: "#111",
    textDecoration: "none",
  },
};
