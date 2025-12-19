import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../services/api";
import Loader from "./Loader";

/**
 * ProtectedRoute
 * Wrap any page that requires authentication
 *
 * Usage:
 * <ProtectedRoute>
 *   <CreatePage />
 * </ProtectedRoute>
 *
 * Admin only:
 * <ProtectedRoute adminOnly>
 *   <AdminPage />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  adminOnly = false,
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const res = await api.getProfile();
        const user = res?.user || res;

        if (!user) throw new Error("No user");

        if (adminOnly && user.role !== "admin") {
          router.replace("/");
          return;
        }

        if (mounted) {
          setAuthorized(true);
        }
      } catch (err) {
        router.replace(`/login?next=${router.asPath}`);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [adminOnly, router]);

  if (loading) {
    return <Loader fullScreen text="Checking access…" />;
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
