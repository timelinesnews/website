// pages/_app.js
import "../styles/globals.css";
import Layout from "../components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/* ======================================================
   TOP LOADING BAR (Route Change Indicator)
====================================================== */
function LoadingBar() {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "3px",
          background: "#4f46e5",
          animation: "loadingBar 1s linear infinite",
          zIndex: 9999,
        }}
      />
      <style>{`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  /* ------------------------------------------------------
     Routes WITHOUT layout/navbar
     (Auth & full-screen pages)
  ------------------------------------------------------ */
  const noLayoutRoutes = [
    "/login",
    "/signup",
  ];

  /* ------------------------------------------------------
     ROUTE CHANGE EVENTS
  ------------------------------------------------------ */
  useEffect(() => {
    const handleStart = () => setIsRouteLoading(true);

    const handleEnd = () => {
      setIsRouteLoading(false);

      // Scroll to top safely
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleEnd);
    router.events.on("routeChangeError", handleEnd);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleEnd);
      router.events.off("routeChangeError", handleEnd);
    };
  }, [router]);

  const hideLayout = noLayoutRoutes.includes(router.pathname);

  /* ------------------------------------------------------
     RENDER
  ------------------------------------------------------ */
  return (
    <>
      {/* Global Route Loading Bar */}
      {isRouteLoading && <LoadingBar />}

      {/* Page Rendering */}
      {hideLayout ? (
        // 🔓 Auth / Fullscreen Pages
        <Component {...pageProps} />
      ) : (
        // 🧭 Normal Pages with Navbar/Layout
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </>
  );
}
