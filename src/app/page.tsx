"use client";

// import React, { useEffect, useState } from "react";
import React, { useRef, useEffect, useState } from "react";

import { auth, db } from "@/lib/firebaseClient";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { CopilotSidebar, CopilotKitCSSProperties, CopilotChat } from "@copilotkit/react-ui";
import { useCoAgent, useCopilotAction } from "@copilotkit/react-core";

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
  
  useCopilotAction({
      name: "setThemeColor",
      available: "remote",
      parameters: [{
        name: "themeColor",
        description: "The theme color to set. Make sure to pick nice colors.",
        required: true,
      }],
      handler({ themeColor }) {
        setThemeColor(themeColor);
      },
  });

  useCopilotAction({
    name: "get_weather",
    description: "Get the weather for a given location.",
    available: "remote",
    parameters: [
      { name: "location", type: "string", required: true },
    ],
    render: ({ args }) => {
      return <WeatherCard location={args.location} themeColor={themeColor} />
    },
  });

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-500 to-indigo-600 text-white px-4">
        <div className="w-full max-w-md backdrop-blur-lg bg-white/10 p-10 rounded-2xl shadow-2xl border border-white/20 text-center">
          <h1 className="text-3xl font-bold mb-6">
            {isLogin ? "VacAI Login" : "Join VacAI"}
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

        {/* <p className="mt-8 text-white/60 text-sm italic tracking-wide">
          <img src="favicon.ico" alt="VacAI Logo" className="h-10 w-10" /> Plan smarter, travel better with VacAI
        </p> */}
        <p className="mt-8 flex items-center text-white/60 text-md italic tracking-wide gap-2">
          <img src="favicon.ico" alt="VacAI Logo" className="h-10 w-10" />
          Plan smarter, travel better with VacAI
        </p>

      </div>
    );

  // --- Logged-in Page ---
  return (
    <main
      style={{ "--copilot-kit-primary-color": themeColor } as CopilotKitCSSProperties}
      className="min-h-screen w-full flex flex-col"
      // className="min-h-screen w-full bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 text-white flex flex-col"
    >
      {/* Header */}
      {/* <header className="w-full backdrop-blur-md bg-white/10 border-b border-white/20 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">VacAI ✈️</h1>
        <img className="text-2xl font-semibold">VacAI ✈️</h1>
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
      </header> */}
      <header className="w-full backdrop-blur-md bg-white/10 border-b border-white/20 px-6 py-4 flex justify-between items-center">
  <div className="flex items-center gap-2">
    <img src="favicon.ico" alt="VacAI Logo" className="h-10 w-10" />
    <h1 className="text-2xl font-semibold">VacAI </h1>
  </div>
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
      {/* <YourMainContent themeColor={themeColor} /> */}
      <CopilotChat
      // <CopilotPopup
      // <CopilotSidebar
              // clickOutsideToClose={false}
              // defaultOpen={true}
              imageUploadsEnabled={true}
              labels={{
                title: "VacAI",
                initial: "👋 Hi, there! You're chatting with VacAI. \n\n I am your comprehensive travel companion. \n\n Pro tip :  You can also use me for quick tools for your service. \n\nFor example you can try:\n-  \"Set the theme to orange\"\n-  \"Get the weather in SF\"\n\nAs you interact with me, you'll see the UI update in real-time to reflect relevent information."
              }}
            />
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




type HopType = "flight" | "train" | "hotel" | "carRental" | "activity" | "other";

interface ItineraryHop {
  type: HopType;
  name: string;
  details: string;
  date: string;       // Can be ISO string or range string (e.g. "2025-11-10 to 2025-11-13")
  time?: string;      // Optional time info
  location?: string;  // Optional location description
}

interface Itinerary {
  hops: ItineraryHop[];
}

interface ItineraryCardProps {
  itinerary: Itinerary;
}
// State of the agent, make sure this aligns with your agent's state.
type AgentState = {
  itinerary: Itinerary;
}

function YourMainContent({ themeColor }: { themeColor: string }) {
  // 🪁 Shared State: https://docs.copilotkit.ai/coagents/shared-state
  const { state, setState } = useCoAgent<AgentState>({
    name: "my_agent",
//     initialState: {
//       itinerary: {
//         hops: [
//   { type: "flight", name: "UA101", date: "Nov 10", time: "10:30 AM", location: "SFO" },
//   { type: "hotel", name: "Hilton Midtown", date: "Nov 10-13", location: "NY" },
//   { type: "train", name: "Amtrak", date: "Nov 14", time: "9:00 AM", location: "Penn Station" },
//   { type: "activity", name: "Liberty Tour", date: "Nov 12", time: "1:00 PM", location: "Battery Park" },
//   { type: "flight", name: "DL202", date: "Nov 15", time: "3:00 PM", location: "NY" },
//   { type: "carRental", name: "Uber Ride", date: "Nov 15", time: "4:00 PM", location: "Airport" },
//   { type: "hotel", name: "Marriott Hotel", date: "Nov 15-17", location: "DC" },
//   { type: "activity", name: "Museum Visit", date: "Nov 16", time: "11:00 AM", location: "DC Museum" },
// ]
//         // [
//         //   {
//         //     type: "flight",
//         //     name: "Flight UA101",
//         //     details: "San Francisco to New York, Economy Class",
//         //     date: "2025-11-10",
//         //     time: "10:30 AM",
//         //     location: "SFO Airport",
//         //   },
//         //   {
//         //     type: "hotel",
//         //     name: "Hilton Midtown",
//         //     details: "3 nights, includes breakfast",
//         //     date: "2025-11-10 to 2025-11-13",
//         //     time: "",
//         //     location: "New York City",
//         //   },
//         //   {
//         //     type: "train",
//         //     name: "Amtrak Acela Express",
//         //     details: "New York to Washington DC",
//         //     date: "2025-11-14",
//         //     time: "9:00 AM",
//         //     location: "Penn Station",
//         //   },
//         //   {
//         //     type: "activity",
//         //     name: "Statue of Liberty Tour",
//         //     details: "Guided tour with ferry",
//         //     date: "2025-11-12",
//         //     time: "1:00 PM",
//         //     location: "Battery Park",
//         //   },
//         // ]
//       },
//     },
  })

  //🪁 Generative UI: https://docs.copilotkit.ai/coagents/generative-ui
  useCopilotAction({
    name: "get_weather",
    description: "Get the weather for a given location.",
    available: "remote",
    parameters: [
      { name: "location", type: "string", required: true },
    ],
    render: ({ args }) => {
      return <WeatherCard location={args.location} themeColor={themeColor} />
    },
  });

  //  useCopilotAction({
  //   name: "render_itinerary",
  //   description: "Visually render the itinerary.",
  //   available: "remote",
  //   parameters: [
  //     { name: "location", type: "string", required: true },
  //   ],
  //   render: ({ args }) => {
  //     return <WeatherCard location={args.location} themeColor={themeColor} />
  //   },
  // });


  // Icons for different hop types
  const icons = {
    flight: "✈️",
    train: "🚆",
    hotel: "🏨",
    carRental: "🚗",
    activity: "🎟️",
    default: "📍",
    other: "❓",
  };

  // Color themes for different hop types
  const colors = {
    flight: "#4C8BF5",
    train: "#FF7D35",
    hotel: "#2ECC71",
    carRental: "#F39C12",
    activity: "#9B59B6",
    default: "#7F8C8D",
    other: "#95A5A6",
  };

  function ItineraryTimeline2({ itinerary }: ItineraryCardProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
      function updateWidth() {
        if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
      }
      updateWidth();
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }, []);

    const nodeWidth = 150;
    const nodeHeight = 130;
    const maxPerRow = Math.max(1, Math.floor(containerWidth / nodeWidth));

    const rows = [];
    for (let i = 0,k = 0; i < itinerary.hops.length; i += maxPerRow,k+=1) {
        const reversed = k % 2 === 1;
        const currElements =  itinerary.hops.slice(i, i + maxPerRow);
        rows.push(reversed ? [...currElements].reverse() : currElements);
      // rows.push(itinerary.hops.slice(i, i + maxPerRow));
      
    }

    const svgHeight = rows.length * nodeHeight;

    return (
      <div
        ref={containerRef}
        style={{
          position: "relative",
          padding: 30,
          boxSizing: "border-box",
          background: "linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgb(0 0 0 / 0.1)",
          userSelect: "none",
        }}
      >
        {/* SVG Lines */}
        <svg
          width={containerWidth}
          height={svgHeight}
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 0 }}
        >
          {/* Horizontal connections */}
          {rows.map((row, rowIndex) => {
            const y = rowIndex * nodeHeight + nodeHeight / (2-(rowIndex%2));
            return row.map((_, i) => {
              if (i === 0) return null;
              const startX = (i - 1) * nodeWidth + nodeWidth / 2;
              const endX = i * nodeWidth + nodeWidth / 2;
              return (
                <path
                  key={`h-${rowIndex}-${i}`}
                  d={`M${startX},${y} C${startX + 30},${y - 25} ${endX - 30},${y - 25} ${endX},${y}`}
                  stroke="#5555ffcc"
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              );
            });
          })}

          {/* Vertical connections */}
          {rows.map((row, rowIndex) => {
            if (rowIndex === rows.length - 1) return null;
            const currentRowEndX = (row.length - 1) * nodeWidth + nodeWidth / 2;
            const currentRowEndY = rowIndex * nodeHeight + nodeHeight / 2;
            const nextRowStartX = nodeWidth / 2;
            const nextRowEndX = (row.length - 1) * nodeWidth + nodeWidth / 2;
            const nextRowStartY = (rowIndex + 1) * nodeHeight + nodeHeight;
            const nextRowEndY = (rowIndex + 1) * nodeHeight + nodeHeight;

            return (
              <g key={`v-${rowIndex}`}>
                {/* Vertical line down */}
                <line
                  x1={currentRowEndX}
                  y1={currentRowEndY}
                  x2={currentRowEndX}
                  y2={currentRowEndY + 20}
                  stroke="#5555ffcc"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                {/* Curved horizontal */}
                {/* <path
                  d={`
                  M${currentRowEndX},${currentRowEndY + 20}
                  C${currentRowEndX + 15},${currentRowEndY + 20}
                   ${nextRowStartX - 15},${nextRowStartY - 20}
                   ${nextRowStartX},${nextRowStartY - 20}
                `}
                  stroke="#5555ffcc"
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                /> */}
                <path
                  d={`
                  M${currentRowEndX},${currentRowEndY + 20}
                  C${currentRowEndX + 15},${currentRowEndY + 20}
                   ${nextRowEndX - 15},${nextRowEndY - 20}
                   ${nextRowEndX},${nextRowEndY - 20}
                `}
                  stroke="#5555ffcc"
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Vertical line down */}
                {/* <line
                  x1={nextRowStartX}
                  y1={nextRowStartY - 20}
                  x2={nextRowStartX}
                  y2={nextRowStartY}
                  stroke="#5555ffcc"
                  strokeWidth={3}
                  strokeLinecap="round"
                /> */}
                 <line
                  x1={nextRowEndX}
                  y1={nextRowEndY - 20}
                  x2={nextRowEndX}
                  y2={nextRowEndY}
                  stroke="#5555ffcc"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{ display: "flex", justifyContent: "center", marginBottom: rowIndex < rows.length - 1 ? 60 : 0 }}
          >
            {row.map((hop, i) => {
              const icon = icons[hop.type] || icons.other;
              const color = colors[hop.type] || colors.other;

              return (
                <div
                  key={i}
                  style={{
                    flex: `0 0 ${nodeWidth}px`,
                    textAlign: "center",
                    position: "relative",
                    zIndex: 1,
                    cursor: "pointer",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow = `0 8px 16px ${color}aa`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  title={`${hop.name}\n${hop.date} ${hop.time || ""}\n${hop.location || ""}`}
                  tabIndex={0}
                >
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${color}, #0000${color.slice(1)})`,
                      color: "#fff",
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "auto",
                      boxShadow: `0 0 18px ${color}aa`,
                      fontSize: 30,
                      userSelect: "none",
                    }}
                  >
                    {icon}
                  </div>
                  <div style={{ marginTop: 14, fontWeight: 600, fontSize: 15, color: "#222" }}>{hop.name}</div>
                  <div style={{ fontSize: 13, color: "#555" }}>
                    {hop.date} {hop.time ? `| ${hop.time}` : ""}
                  </div>
                  {hop.location && <div style={{ fontSize: 12, color: "#888", fontStyle: "italic" }}>{hop.location}</div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: themeColor }}
      className="h-screen w-screen flex justify-center items-center flex-col transition-colors duration-300"
    >
      <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">Itinerary</h1>
        <p className="text-gray-200 text-center italic mb-6">Your itinerary, visualized! 🪁</p>
        <hr className="border-white/20 my-6" />
        {state.itinerary && state.itinerary.hops.length > 0 && <div className="flex flex-col gap-3">
          {/* {state.itinerary?.map((proverb, index) => (
            <div
              key={index}
              className="bg-white/15 p-4 rounded-xl text-white relative group hover:bg-white/20 transition-all"
            >
              <p className="pr-8">{proverb}</p>
              <button
                onClick={() => setState({
                  ...state,
                  itinerary: state.itinerary?.filter((_, i) => i !== index),
                })}
                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity
                  bg-red-500 hover:bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))} */
           state.itinerary && state.itinerary.hops.length > 0 && <ItineraryTimeline2 itinerary={state.itinerary} />
          }
        </div>}
        {state.itinerary?.hops.length === 0 && <p className="text-center text-white/80 italic my-8">
          Not a place to go yet. Ask the assistant to plan a trip!
        </p>}
      </div>
    </div>
  );
}

// Simple sun icon for the weather card
function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14 text-yellow-200">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="2" stroke="currentColor" />
    </svg>
  );
}

// Weather card component where the location and themeColor are based on what the agent
// sets via tool calls.
function WeatherCard({ location, themeColor }: { location?: string, themeColor: string }) {
  return (
    <div
      style={{ backgroundColor: themeColor }}
      className="rounded-xl shadow-xl mt-6 mb-4 max-w-md w-full"
    >
      <div className="bg-white/20 p-4 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white capitalize">{location}</h3>
            <p className="text-white">Current Weather</p>
          </div>
          <SunIcon />
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div className="text-3xl font-bold text-white">70°</div>
          <div className="text-sm text-white">Clear skies</div>
        </div>

        <div className="mt-4 pt-4 border-t border-white">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-white text-xs">Humidity</p>
              <p className="text-white font-medium">45%</p>
            </div>
            <div>
              <p className="text-white text-xs">Wind</p>
              <p className="text-white font-medium">5 mph</p>
            </div>
            <div>
              <p className="text-white text-xs">Feels Like</p>
              <p className="text-white font-medium">72°</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


