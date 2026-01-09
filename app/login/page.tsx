// app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type MeResponse = {
  loggedIn?: boolean;
  role?: "admin" | "user" | null;

  // (optional compatibility if your API returns different keys)
  authenticated?: boolean;
  user?: { role?: "admin" | "user" | null };
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect away from /login
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const me = (await res.json().catch(() => ({}))) as MeResponse;

        if (cancelled) return;

        // Prefer your new shape: { loggedIn, role }
        const loggedIn =
          typeof me.loggedIn === "boolean"
            ? me.loggedIn
            : !!me.authenticated;

        const role =
          me.role ?? me.user?.role ?? null;

        if (loggedIn) {
          router.replace(role === "admin" ? "/admin/dashboard" : "/store");
          return;
        }
      } catch {
        // ignore errors -> show login form
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid credentials");
        return;
      }

      // login success -> cookie is already set by backend
      if (data.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/store");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="auth-page">
        <div className="auth-card auth-loading">Checking session...</div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>

        {error && (
          <p className="auth-error" role="alert" aria-live="polite">
            {error}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email" className="contact-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="contact-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password" className="contact-label">
              Password
            </label>
            <div className="password-row">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="contact-input"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="auth-alt">
          <span className="auth-alt-text">New here?</span>
          <Link className="btn auth-alt-btn" href="/signup">
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}

