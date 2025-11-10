"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { auth, db } from "@/lib/firebaseClient";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import {
  CopilotChat,
  CopilotKitCSSProperties,
  CopilotPopup,
  CopilotSidebar,
} from "@copilotkit/react-ui";
import { useCoAgent } from "@copilotkit/react-core";

export default function Home() {
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>({});
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLogin, setIsLogin] = React.useState(true);
  const [themeColor, setThemeColor] = React.useState("#45acee");
  const [error, setError] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  const [showItinerarySidebar, setShowItinerarySidebar] = useState(false);

  // Use the shared agent state for itinerary
  const { state } = useCoAgent<AgentState>({
    name: "my_agent",
    initialState: { itinerary: { hops: [] } },
  });


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

  const handleAuth = async () => {
    setError("");
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile({});
  };

  function Spinner() {
    return (
      <svg
        className="animate-spin h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        style={{ color: themeColor }}
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

  if (!user) {
    return (
      <AuthScreen
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        loading={loading}
        error={error}
        setError={setError}
        handleAuth={handleAuth}
        themeColor={themeColor}
      />
    );
  }

  type HopType =
    | "flight"
    | "train"
    | "hotel"
    | "carRental"
    | "activity"
    | "other";
  interface ItineraryHop {
    type: HopType;
    name: string;
    details?: string;
    date: string;
    time?: string;
    location?: string;
  }
  interface Itinerary {
    hops: ItineraryHop[];
  }
  type AgentState = {
    itinerary: Itinerary;
  };

  // Colors/icons for itinerary hops
  const colors = {
    flight: "#4C8BF5",
    train: "#FF7D35",
    hotel: "#2ECC71",
    carRental: "#F39C12",
    activity: "#9B59B6",
    default: "#7F8C8D",
    other: "#95A5A6",
  };

  const icons = {
    flight: "✈️",
    train: "🚆",
    hotel: "🏨",
    carRental: "🚗",
    activity: "🎟️",
    default: "📍",
    other: "❓",
  };

  // Header with See Itinerary button and theme-based styling
  const Header = () => (
    <header
      style={{
        backdropFilter: "blur(12px)",
        background: themeColor + "cc",
        borderBottom: `2px solid ${themeColor}ee`,
        padding: "0.8rem 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: "600",
        fontSize: "1.4rem",
        color: "#fff",
        userSelect: "none",
        boxShadow: `0 2px 12px ${themeColor}aa`,
        zIndex: 1000,
        position: "sticky",
        top: 0,
      }}
    >
      <h1 style={{ margin: 0, fontWeight: "700" }}>VacAI ✈️</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => setShowItinerarySidebar(true)}
          style={{
            backgroundColor: "transparent",
            border: `2px solid #fff`,
            borderRadius: 8,
            padding: "6px 14px",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background-color 0.3s ease",
            userSelect: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = themeColor)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          aria-label="View Itinerary"
          title="View Itinerary"
        >
          See Itinerary
        </button>
        <span style={{ fontSize: 14, opacity: 0.85, userSelect: "text" }}>
          {profile.name || user.email}
        </span>
        <button
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
          style={{
            backgroundColor: "transparent",
            border: `2px solid #fff`,
            borderRadius: 8,
            padding: "6px 14px",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background-color 0.3s ease",
            userSelect: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = themeColor)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          Logout
        </button>
      </div>
    </header>
  );

  // Animated Itinerary Sidebar Content - animates new items on arrival
  const ItinerarySidebarContent = () => {
    const hops = state.itinerary.hops || [];

    return (
      <div
        style={{
          padding: 24,
          color: "#222",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
          borderRadius: 8,
          boxShadow: "0 10px 30px rgb(0 0 0 / 0.1)",
        }}
      >
        <h2 style={{ marginBottom: 16, color: themeColor }}>
          Your Itinerary {hops.length === 0 ? "(Empty)" : ""}
        </h2>
        {hops.length === 0 && (
          <p style={{ color: "#999", fontStyle: "italic", textAlign: "center", marginTop: 40 }}>
            No itinerary data available.
          </p>
        )}

        <div
          style={{
            overflowY: "auto",
            flexGrow: 1,
            paddingRight: 8,
            marginTop: 8,
          }}
          aria-live="polite"
          role="list"
        >
          <AnimatePresence initial={false}>
            {hops.map((hop, index) => (
              <motion.div
                key={hop.name + hop.date + index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                style={{
                  marginBottom: 18,
                  paddingBottom: 18,
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                }}
                role="listitem"
              >
                <div
                  style={{
                    fontSize: 30,
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    backgroundColor: colors[hop.type] || colors.default,
                    color: "#fff",
                    boxShadow: `0 0 12px ${colors[hop.type] || colors.default}aa`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    userSelect: "none",
                  }}
                  aria-label={hop.type}
                  title={hop.type}
                >
                  {icons[hop.type] || icons.default}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h3
                    style={{
                      margin: 0,
                      color: themeColor,
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    {hop.name}
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#444", userSelect: "text" }}>
                    {hop.details}
                  </p>
                  <p
                    style={{
                      marginTop: 4,
                      fontWeight: "600",
                      color: colors[hop.type] || colors.default,
                      fontSize: 13,
                      userSelect: "text",
                    }}
                  >
                    {hop.date} {hop.time ? `| ${hop.time}` : ""}
                  </p>
                  {hop.location && (
                    <p
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: "#999",
                        fontStyle: "italic",
                        userSelect: "text",
                      }}
                    >
                      Location: {hop.location}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // Main page content placeholder
  const YourMainContent = () => {
    return (
      <div
        style={{
          padding: 24,
          color: "#fff",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          minHeight: "400px",
          textAlign: "center",
          userSelect: "none",
        }}
      >
        <h2 style={{ fontSize: 28, fontWeight: "700", marginBottom: 14 }}>
          Welcome to VacAI 🌍
        </h2>
        <p style={{ fontSize: 16, opacity: 0.85 }}>
          Hi {profile.name || user.email}! Click "See Itinerary" to open your
          travel plan and view updates live.
        </p>
      </div>
    );
  };

  return (
    <main
      style={{
        "--copilot-kit-primary-color": themeColor,
        background: `linear-gradient(135deg, ${themeColor}bb, ${themeColor}88 80%)`,
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      } as React.CSSProperties}
    >
      <Header />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <YourMainContent />
      </div>

       <CopilotPopup
        // open={showItinerarySidebar}
        // onClose={() => setShowItinerarySidebar(false)}
        labels={{
          title: "VacAI Itinerary",
          initial: "Your travel itinerary will appear here as it updates.",
        }}
      >
        {/* <ItinerarySidebarContent /> */}
      </CopilotPopup>

      <CopilotChat
        labels={{
          title: "VacAI",
          initial: `👋 Hi, there! You're chatting with VacAI.\n\nI am your comprehensive travel companion.\n\nPro tip: You can also use me for quick tools like:\n- "Set the theme to orange"\n- "Get the weather in SF"\n\nAs you interact with me, you'll see the UI update in real-time.`,
        }}
      />
    </main>
  );
}

// AuthScreen component can be reused from your previous code or modularized

function AuthScreen({
  email,
  password,
  setEmail,
  setPassword,
  isLogin,
  setIsLogin,
  loading,
  error,
  setError,
  handleAuth,
  themeColor,
}: {
  email: string;
  password: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  isLogin: boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  handleAuth: () => Promise<void>;
  themeColor: string;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background: `linear-gradient(to bottom right, ${themeColor}, #3b82f6, #9333ea)`,
        color: "white",
      }}
    >
      <div
        className="w-full max-w-md backdrop-blur-lg p-10 rounded-2xl shadow-2xl text-center"
        style={{
          background: "rgba(255 255 255 / 0.12)",
          border: `1px solid rgba(255 255 255 / 0.40)`,
          color: "white",
        }}
      >
        <h1 className="text-3xl font-bold mb-6">{isLogin ? "Welcome Back" : "Join VacAI"}</h1>

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full mb-3 p-3 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="w-full mb-4 p-3 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
        />

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
              : "bg-white text-indigo-700 hover:bg-indigo-50"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner themeColor={themeColor} /> Processing...
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
}

function Spinner({ themeColor }: { themeColor: string }) {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      style={{ color: themeColor }}
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
