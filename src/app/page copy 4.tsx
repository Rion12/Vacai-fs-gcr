"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

import { auth, db } from "@/lib/firebaseClient";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { CopilotChat, CopilotKitCSSProperties } from "@copilotkit/react-ui";
import { useCoAgent, useCopilotAction } from "@copilotkit/react-core";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [themeColor, setThemeColor] = useState("#45acee");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

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
  }

  const icons = {
    flight: "✈️",
    train: "🚆",
    hotel: "🏨",
    carRental: "🚗",
    activity: "🎟️",
    default: "📍",
    other: "❓",
  };

  const colors = {
    flight: "#4C8BF5",
    train: "#FF7D35",
    hotel: "#2ECC71",
    carRental: "#F39C12",
    activity: "#9B59B6",
    default: "#7F8C8D",
    other: "#95A5A6",
  };

  type HopType = "flight" | "train" | "hotel" | "carRental" | "activity" | "other";

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

  function YourMainContent({ themeColor }: { themeColor: string }) {
    const { state } = useCoAgent<AgentState>({
      name: "my_agent",
      initialState: {
        itinerary: {
          hops: [
            {
              type: "flight",
              name: "UA101",
              details: "San Francisco to New York, Economy Class",
              date: "Nov 10",
              time: "10:30 AM",
              location: "SFO",
            },
            {
              type: "hotel",
              name: "Hilton Midtown",
              details: "3 nights, includes breakfast",
              date: "Nov 10-13",
              location: "New York",
            },
            {
              type: "train",
              name: "Amtrak",
              details: "New York to Washington DC",
              date: "Nov 14",
              time: "9:00 AM",
              location: "Penn Station",
            },
            {
              type: "activity",
              name: "Liberty Tour",
              details: "Guided tour with ferry",
              date: "Nov 12",
              time: "1:00 PM",
              location: "Battery Park",
            },
            {
              type: "flight",
              name: "DL202",
              details: "New York to DC, Business Class",
              date: "Nov 15",
              time: "3:00 PM",
              location: "NY Airport",
            },
            {
              type: "carRental",
              name: "Uber Ride",
              details: "Airport to hotel",
              date: "Nov 15",
              time: "4:00 PM",
              location: "DC Airport",
            },
            {
              type: "hotel",
              name: "Marriott Hotel",
              details: "2 nights stay",
              date: "Nov 15-17",
              location: "Washington DC",
            },
            {
              type: "activity",
              name: "Museum Visit",
              details: "DC Museum all day pass",
              date: "Nov 16",
              time: "11:00 AM",
              location: "DC Museum",
            },
          ],
        },
      },
    });

    useCopilotAction({
      name: "get_weather",
      description: "Get the weather for a given location.",
      available: "remote",
      parameters: [{ name: "location", type: "string", required: true }],
      render: ({ args }) => <WeatherCard location={args.location ?? "?"} themeColor={themeColor} />,
    });

    return <ItineraryTimelineZigzag itinerary={state.itinerary} />;
  }

  function WeatherCard({ location, themeColor }: { location: string; themeColor: string }) {
    return (
      <div
        style={{
          padding: 16,
          borderRadius: 12,
          backgroundColor: themeColor,
          color: "#fff",
          maxWidth: 320,
          boxShadow: `0 8px 20px ${themeColor}aa`,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          fontWeight: "600",
        }}
      >
        Weather info for <b>{location}</b> would load here.
      </div>
    );
  }

  function ItineraryNode({
    hop,
    color,
    icon,
    isExpanded,
    onToggle,
  }: {
    hop: ItineraryHop;
    color: string;
    icon: string;
    isExpanded: boolean;
    onToggle: () => void;
  }) {
    return (
      <motion.div
        layout
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.1, boxShadow: `0 8px 20px ${color}aa` }}
        onClick={onToggle}
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
        role="button"
        aria-expanded={isExpanded}
        style={{
          cursor: "pointer",
          padding: 14,
          userSelect: "none",
          background: `linear-gradient(135deg, ${color}, ${color}cc)`,
          borderRadius: 16,
          boxShadow: isExpanded ? `0 0 28px ${color}cc` : `0 0 14px ${color}88`,
          color: "#fff",
          width: 160,
          margin: "0 6px",
          outline: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <div style={{ fontSize: 36, lineHeight: 1 }}>{icon}</div>
        <div
          style={{
            fontWeight: "700",
            marginTop: 10,
            textAlign: "center",
            userSelect: "text",
            color: "#fff",
            textShadow: `0 0 5px rgba(0,0,0,0.4)`,
          }}
        >
          {hop.name}
        </div>
        <div style={{ fontSize: 13, marginTop: 4, textAlign: "center" }}>
          {hop.date} {hop.time ? `| ${hop.time}` : ""}
        </div>
        {hop.location && (
          <div
            style={{
              fontSize: 12,
              fontStyle: "italic",
              marginTop: 2,
              textAlign: "center",
              color: "#eee",
              userSelect: "text",
            }}
          >
            {hop.location}
          </div>
        )}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            style={{
              marginTop: 12,
              fontSize: 14,
              color: "#eef2f7",
              textAlign: "center",
              userSelect: "text",
              fontWeight: "400",
              maxHeight: 280,
              overflowY: "auto",
            }}
          >
            {hop.details || "No additional details."}
          </motion.div>
        )}
      </motion.div>
    );
  }

  function ItineraryTimelineZigzag({ itinerary }: { itinerary: Itinerary }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const pathRefs = useRef<{ [key: string]: SVGPathElement | null }>({});

    useEffect(() => {
      function updateWidth() {
        if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
      }
      updateWidth();
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }, []);

    const nodeWidth = 170;
    const nodeHeight = 160;
    const maxPerRow = Math.max(1, Math.floor(containerWidth / nodeWidth));

    const rows: ItineraryHop[][] = [];
    for (let i = 0, k = 0; i < itinerary.hops.length; i += maxPerRow, k++) {
      const currElements = itinerary.hops.slice(i, i + maxPerRow);
      rows.push(k % 2 === 1 ? [...currElements].reverse() : currElements);
    }
    const svgHeight = rows.length * nodeHeight;

    const getNodeCenterX = (idx: number, rowLength: number, rowIndex: number) =>
      rowIndex % 2 === 0 ? idx * nodeWidth + nodeWidth / 2 : (rowLength - 1 - idx) * nodeWidth + nodeWidth / 2;

    useEffect(() => {
      Object.entries(pathRefs.current).forEach(([key, path]) => {
        if (path) {
          const length = path.getTotalLength();
          path.style.strokeDasharray = `${length}`;
          path.style.strokeDashoffset = `${length}`;
          setTimeout(() => {
            path.style.transition = "stroke-dashoffset 1s ease";
            path.style.strokeDashoffset = "0";
          }, 100);
        }
      });
    }, [containerWidth, itinerary]);

    return (
      <div
        ref={containerRef}
        style={{
          position: "relative",
          padding: 30,
          boxSizing: "border-box",
          background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
          borderRadius: 18,
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)",
          userSelect: "none",
          minHeight: svgHeight + 100,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <svg
          width={containerWidth}
          height={svgHeight}
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 0 }}
        >
          {rows.map((row, rowIndex) => {
            const y = rowIndex * nodeHeight + nodeHeight / 2;
            const rowLength = row.length;

            return row.map((_, i) => {
              if (i === 0) return null;
              const startX = getNodeCenterX(i - 1, rowLength, rowIndex);
              const endX = getNodeCenterX(i, rowLength, rowIndex);
              const key = `h-${rowIndex}-${i}`;
              return (
                <path
                  key={key}
                  ref={(el) => {
                    pathRefs.current[key] = el;
                  }}
                  d={`M${startX},${y} C${startX + 40},${y - 30} ${endX - 40},${y - 30} ${endX},${y}`}
                  stroke={themeColor + "cc"}
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                />
              );
            });
          })}
          {rows.map((row, rowIndex) => {
            if (rowIndex === rows.length - 1) return null;

            const currentRowLength = row.length;
            const nextRowLength = rows[rowIndex + 1].length;

            const currentRowEndX = getNodeCenterX(currentRowLength - 1, currentRowLength, rowIndex);
            const currentRowEndY = rowIndex * nodeHeight + nodeHeight / 2;

            const nextRowEndX = getNodeCenterX(nextRowLength - 1, nextRowLength, rowIndex + 1);
            const nextRowYTop = (rowIndex + 1) * nodeHeight + nodeHeight / 2;

            return (
              <g key={`v-${rowIndex}`}>
                <line
                  x1={currentRowEndX}
                  y1={currentRowEndY}
                  x2={currentRowEndX}
                  y2={currentRowEndY + 20}
                  stroke={themeColor + "cc"}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                <path
                  d={`
                    M${currentRowEndX},${currentRowEndY + 20}
                    C${currentRowEndX + 20},${currentRowEndY + 20}
                     ${nextRowEndX - 20},${nextRowYTop - 20}
                     ${nextRowEndX},${nextRowYTop - 20}
                  `}
                  stroke={themeColor + "cc"}
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                />
                <line
                  x1={nextRowEndX}
                  y1={nextRowYTop - 20}
                  x2={nextRowEndX}
                  y2={nextRowYTop}
                  stroke={themeColor + "cc"}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>

        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: rowIndex < rows.length - 1 ? 60 : 0,
              gap: 10,
            }}
          >
            {row.map((hop, i) => {
              const flatIndex =
                rowIndex % 2 === 1 ? row.length - 1 - i + rowIndex * maxPerRow : i + rowIndex * maxPerRow;
              const icon = icons[hop.type] || icons.other;
              // Use vibrant colors but fallback if you'd prefer themeColor, here we keep original hop-type colors
              const color = colors[hop.type] || colors.other;

              return (
                <ItineraryNode
                  key={flatIndex}
                  hop={hop}
                  color={color}
                  icon={icon}
                  isExpanded={activeIndex === flatIndex}
                  onToggle={() => setActiveIndex(activeIndex === flatIndex ? null : flatIndex)}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }

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
      <header
        style={{
          backdropFilter: "blur(12px)",
          background: themeColor + "cc",
          borderBottom: `2px solid ${themeColor}ee`,
          padding: "0.9rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "600",
          fontSize: "1.4rem",
          color: "#fff",
          userSelect: "none",
          boxShadow: `0 2px 10px ${themeColor}aa`,
          zIndex: 1000,
        }}
      >
        <h1 style={{ margin: 0, color: "white", fontWeight: "700" }}>VacAI ✈️</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontSize: 14, opacity: 0.85, userSelect: "text" }}>{profile.name || user.email}</span>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "transparent",
              border: `1.5px solid #fff`,
              borderRadius: 6,
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

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px" }}>
        <YourMainContent themeColor={themeColor} />
      </div>

      <CopilotChat
        labels={{
          title: "VacAI",
          initial: `👋 Hi, there! You're chatting with VacAI.\n\nI am your comprehensive travel companion.\n\nPro tip: You can also use me for quick tools like:\n- "Set the theme to orange"\n- "Get the weather in SF"\n\nAs you interact with me, you'll see the UI update in real-time.`,
        }}
      />
    </main>
  );
}
