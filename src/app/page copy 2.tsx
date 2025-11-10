"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseClient";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { CopilotSidebar, CopilotKitCSSProperties } from "@copilotkit/react-ui";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [themeColor, setThemeColor] = useState("#45acee");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // 👈 loading state

  // --- Watch for Firebase Auth changes ---
  useEffect(() => {
    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        if (snap.exists()) {
          setProfile(snap.data());
          if (snap.data().preferences?.themeColor)
            setThemeColor(snap.data().preferences.themeColor);
        }
      }
    });
  }, []);

  // --- Handle login/signup ---
  const handleAuth = async () => {
    setError("");
    setLoading(true); // start loading
    try {
      const cred = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      if (!isLogin) {
        await setDoc(doc(db, "users", cred.user.uid), {
          email: cred.user.email,
          createdAt: new Date().toISOString(),
          preferences: { themeColor },
        });
      }
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      let message = "Something went wrong.";
      switch (err.code) {
        case "auth/invalid-email":
          message = "Invalid email address.";
          break;
        case "auth/user-not-found":
          message = "No account found with that email.";
          break;
        case "auth/wrong-password":
          message = "Incorrect password.";
          break;
        case "auth/weak-password":
          message = "Password should be at least 6 characters.";
          break;
        case "auth/email-already-in-use":
          message = "This email is already registered.";
          break;
        default:
          message = err.message || "Authentication failed.";
      }
      setError(message);
    } finally {
      setLoading(false); // stop loading
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile({});
  };

  // --- Auth Page ---
  if (!user)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-500 via-purple-500 to-indigo-600 text-white px-4">
        <div className="w-full max-w-md backdrop-blur-lg bg-white/10 p-10 rounded-2xl shadow-2xl border border-white/20 text-center">
          <h1 className="text-3xl font-bold mb-6">
            {isLogin ? "Welcome Back" : "Join VacAI"}
          </h1>

          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full mb-3 p-3 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50"
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full mb-4 p-3 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50"
          />

          {/* ⚠️ Error Message */}
          {error && (
            <div className="bg-red-500/30 text-red-100 border border-red-300/30 rounded-lg p-2 mb-4 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            className={`w-full py-3 font-semibold rounded-lg shadow transition ${
              loading
                ? "bg-white/50 text-gray-400 cursor-not-allowed"
                : "bg-white text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner /> Processing...
              </div>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>

          <p className="mt-4 text-sm text-white/80">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setError("");
                setIsLogin(!isLogin);
              }}
              className="underline hover:text-white"
              disabled={loading}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        <p className="mt-8 text-white/60 text-sm italic tracking-wide">
          ✈️ Plan smarter, travel better with VacAI
        </p>
      </div>
    );

  // --- Logged-in Page ---
  return (
    <main
      style={{ "--copilot-kit-primary-color": themeColor } as CopilotKitCSSProperties}
      className="min-h-screen w-full bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 text-white flex flex-col"
    >
      {/* Header */}
      <header className="w-full backdrop-blur-md bg-white/10 border-b border-white/20 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">VacAI ✈️</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-90">
            {profile.name || user.email}
          </span>
          <button
            onClick={handleLogout}
            className="bg-white/30 hover:bg-white/50 text-sm px-4 py-1 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-5xl mx-auto backdrop-blur-md bg-white/15 border border-white/20 rounded-3xl shadow-xl p-8 text-center">
          <h2 className="text-4xl font-bold mb-2">Welcome to VacAI 🌍</h2>
          <p className="text-white/80 mb-8">
            Hey {profile.name || user.email}! Let’s plan your next adventure.
          </p>

          <div className="relative w-full overflow-hidden rounded-2xl">
            <CopilotSidebar
              defaultOpen={true}
              clickOutsideToClose={false}
              labels={{
                title: "VacAI Assistant",
                initial: `👋 Hello ${
                  profile.name || user.email
                }! I'm your travel copilot. How can I help today?`,
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

// --- Simple Spinner Component ---
function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-indigo-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
}
