"use client";

import { useCoAgent, useCopilotAction } from "@copilotkit/react-core";
import { CopilotKitCSSProperties, CopilotSidebar } from "@copilotkit/react-ui";
// import { useState } from "react";
import React, { useRef, useEffect, useState } from "react";

export default function CopilotKitPage() {
  const [themeColor, setThemeColor] = useState("#45acee");

  // 🪁 Frontend Actions: https://docs.copilotkit.ai/guides/frontend-actions
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

  return (
    <main style={{ "--copilot-kit-primary-color": themeColor } as CopilotKitCSSProperties}>
      <YourMainContent themeColor={themeColor} />
      <CopilotSidebar
        clickOutsideToClose={false}
        defaultOpen={true}
        labels={{
          title: "VacAI",
          initial: "👋 Hi, there! You're chatting with VacAI. \n\n I am your comprehensive travel companion. \n\n Pro tip :  You can also use me for quick tools for your service. \n\nFor example you can try:\n-  \"Set the theme to orange\"\n-  \"Get the weather in SF\"\n\nAs you interact with me, you'll see the UI update in real-time to reflect relevent information."
        }}
      />
    </main>
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
    initialState: {
      itinerary: {
        hops: [
  { type: "flight", name: "UA101", date: "Nov 10", time: "10:30 AM", location: "SFO" },
  { type: "hotel", name: "Hilton Midtown", date: "Nov 10-13", location: "NY" },
  { type: "train", name: "Amtrak", date: "Nov 14", time: "9:00 AM", location: "Penn Station" },
  { type: "activity", name: "Liberty Tour", date: "Nov 12", time: "1:00 PM", location: "Battery Park" },
  { type: "flight", name: "DL202", date: "Nov 15", time: "3:00 PM", location: "NY" },
  { type: "carRental", name: "Uber Ride", date: "Nov 15", time: "4:00 PM", location: "Airport" },
  { type: "hotel", name: "Marriott Hotel", date: "Nov 15-17", location: "DC" },
  { type: "activity", name: "Museum Visit", date: "Nov 16", time: "11:00 AM", location: "DC Museum" },
]
        // [
        //   {
        //     type: "flight",
        //     name: "Flight UA101",
        //     details: "San Francisco to New York, Economy Class",
        //     date: "2025-11-10",
        //     time: "10:30 AM",
        //     location: "SFO Airport",
        //   },
        //   {
        //     type: "hotel",
        //     name: "Hilton Midtown",
        //     details: "3 nights, includes breakfast",
        //     date: "2025-11-10 to 2025-11-13",
        //     time: "",
        //     location: "New York City",
        //   },
        //   {
        //     type: "train",
        //     name: "Amtrak Acela Express",
        //     details: "New York to Washington DC",
        //     date: "2025-11-14",
        //     time: "9:00 AM",
        //     location: "Penn Station",
        //   },
        //   {
        //     type: "activity",
        //     name: "Statue of Liberty Tour",
        //     details: "Guided tour with ferry",
        //     date: "2025-11-12",
        //     time: "1:00 PM",
        //     location: "Battery Park",
        //   },
        // ]
      },
    },
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

  function ItineraryCard({ itinerary }: ItineraryCardProps) {
    return (
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 20,
          maxWidth: 600,
          backgroundColor: "#fff",
          boxShadow: "0 4px 10px rgb(0 0 0 / 0.1)",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <h2 style={{ marginBottom: 16, color: "#333" }}>Your Itinerary</h2>
        {itinerary.hops.map((hop, index) => {
          const icon = icons[hop.type] || icons.default;
          const color = colors[hop.type] || colors.default;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 16,
                paddingBottom: 16,
                borderBottom: index !== itinerary.hops.length - 1 ? "1px solid #eee" : "none",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  padding: 12,
                  borderRadius: "50%",
                  backgroundColor: color,
                  color: "#fff",
                  marginRight: 16,
                  minWidth: 60,
                  textAlign: "center",
                  boxShadow: `0 0 8px ${color}88`,
                }}
                aria-label={hop.type}
                title={hop.type}
              >
                {icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 4px", color: "#222" }}>{hop.name}</h3>
                <p style={{ margin: 0, color: "#666", fontSize: 14 }}>{hop.details}</p>
                <p style={{ margin: "4px 0 0", fontWeight: "bold", color: color }}>
                  {hop.date} | {hop.time}
                </p>
                {hop.location && (
                  <p style={{ margin: "4px 0 0", color: "#999", fontSize: 12 }}>
                    Location: {hop.location}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // function ItineraryTimeline({ itinerary }: ItineraryCardProps) {
  //   return (
  //     <div
  //       style={{
  //         display: "flex",
  //         alignItems: "center",
  //         gap: 0,
  //         padding: 20,
  //         maxWidth: 900,
  //         margin: "auto",
  //       }}
  //     >
  //       {itinerary.hops.map((hop, index) => {
  //         const icon = icons[hop.type] || icons.other;
  //         const color = colors[hop.type] || colors.other;
  //         const isLast = index === itinerary.hops.length - 1;

  //         return (
  //           <div
  //             key={index}
  //             style={{
  //               display: "flex",
  //               flexDirection: "column",
  //               alignItems: "center",
  //               position: "relative",
  //               flex: 1,
  //               padding: "0 10px",
  //             }}
  //           >
  //             {/* Node circle with icon */}
  //             <div
  //               style={{
  //                 backgroundColor: color,
  //                 color: "#fff",
  //                 width: 64,
  //                 height: 64,
  //                 borderRadius: "50%",
  //                 display: "flex",
  //                 alignItems: "center",
  //                 justifyContent: "center",
  //                 fontSize: 28,
  //                 fontWeight: "bold",
  //                 boxShadow: `0 0 12px ${color}88`,
  //                 zIndex: 10,
  //               }}
  //               aria-label={hop.type}
  //               title={hop.type}
  //             >
  //               {icon}
  //             </div>

  //             {/* Connecting line except for last node */}
  //             {!isLast && (
  //               <div
  //                 style={{
  //                   position: "absolute",
  //                   top: 32,
  //                   right: 0,
  //                   height: 4,
  //                   backgroundColor: color,
  //                   width: "100%",
  //                   maxWidth: "calc(100% - 64px)",
  //                   zIndex: 1,
  //                 }}
  //               />
  //             )}

  //             {/* Hop details */}
  //             <div
  //               style={{
  //                 marginTop: 12,
  //                 textAlign: "center",
  //                 maxWidth: 140,
  //                 color: "#333",
  //                 fontWeight: "600",
  //                 fontSize: 14,
  //                 lineHeight: 1.3,
  //               }}
  //             >
  //               <div>{hop.name}</div>
  //               <div style={{ fontWeight: "normal", fontSize: 12, color: "#666" }}>
  //                 {hop.date} {hop.time ? `| ${hop.time}` : ""}
  //               </div>
  //               {hop.location && (
  //                 <div style={{ fontWeight: "normal", fontSize: 12, color: "#999" }}>
  //                   {hop.location}
  //                 </div>
  //               )}
  //             </div>
  //           </div>
  //         );
  //       })}
  //     </div>
  //   );
  // }


  // function ItineraryTimeline({ itinerary }: ItineraryCardProps) {
  //   const maxPerRow = 4;
  //   const rowHeight = 120;
  //   const nodeWidth = 150;

  //   // Split itinerary into rows
  //   const rows = [];
  //   for (let i = 0; i < itinerary.hops.length; i += maxPerRow) {
  //     rows.push(itinerary.hops.slice(i, i + maxPerRow));
  //   }

  //   return (
  //     <div style={{ width: "100%", padding: 20, boxSizing: "border-box", position: "relative" }}>
  //       <svg
  //         style={{ position: "absolute", top: 0, left: 0, width: "100%", height: rows.length * rowHeight }}
  //       >
  //         {rows.map((row, rowIndex) => {
  //           const y = rowIndex * rowHeight + 32; // vertical center for nodes
  //           return row.map((_, i) => {
  //             if (i === 0) return null;

  //             // Horizontal curve connecting same row nodes
  //             const startX = (i - 1) * nodeWidth + 32;
  //             const endX = i * nodeWidth + 32;
  //             return (
  //               <path
  //                 key={`h-${rowIndex}-${i}`}
  //                 d={`M${startX},${y} C${startX + 40},${y - 30} ${endX - 40},${y - 30} ${endX},${y}`}
  //                 stroke="#bbb"
  //                 strokeWidth={3}
  //                 fill="none"
  //               />
  //             );
  //           });
  //         })}

  //         {/* Vertical connections between rows */}
  //         {rows.length > 1 &&
  //           rows.map((row, rowIndex) => {
  //             if (rowIndex === rows.length - 1) return null; // no next row after last
  //             const currentRowEndX = (row.length - 1) * nodeWidth + 32;
  //             const currentRowEndY = rowIndex * rowHeight + 32;

  //             const nextRowStartX = 32;
  //             const nextRowStartY = (rowIndex + 1) * rowHeight + 32;

  //             return (
  //               <g key={`v-${rowIndex}`}>
  //                 {/* Vertical line down */}
  //                 <line
  //                   x1={currentRowEndX}
  //                   y1={currentRowEndY}
  //                   x2={currentRowEndX}
  //                   y2={currentRowEndY + 30}
  //                   stroke="#bbb"
  //                   strokeWidth={3}
  //                 />
  //                 {/* Horizontal curve to next row start */}
  //                 <path
  //                   d={`
  //                     M${currentRowEndX},${currentRowEndY + 30}
  //                     C${currentRowEndX + 20},${currentRowEndY + 30}
  //                      ${nextRowStartX - 20},${nextRowStartY - 30}
  //                      ${nextRowStartX},${nextRowStartY - 30}
  //                   `}
  //                   stroke="#bbb"
  //                   strokeWidth={3}
  //                   fill="none"
  //                 />
  //                 {/* Vertical line down into next node */}
  //                 <line
  //                   x1={nextRowStartX}
  //                   y1={nextRowStartY - 30}
  //                   x2={nextRowStartX}
  //                   y2={nextRowStartY}
  //                   stroke="#bbb"
  //                   strokeWidth={3}
  //                 />
  //               </g>
  //             );
  //           })}
  //       </svg>

  //       {rows.map((row, rowIndex) => (
  //         <div
  //           key={rowIndex}
  //           style={{
  //             display: "flex",
  //             justifyContent: "center",
  //             marginBottom: rowIndex < rows.length - 1 ? 60 : 0,
  //           }}
  //         >
  //           {row.map((hop, i) => {
  //             const icon = icons[hop.type] || icons.other;
  //             const color = colors[hop.type] || colors.other;
  //             return (
  //               <div
  //                 key={i}
  //                 style={{
  //                   flex: "0 0 150px",
  //                   textAlign: "center",
  //                   position: "relative",
  //                   zIndex: 1,
  //                 }}
  //               >
  //                 <div
  //                   style={{
  //                     backgroundColor: color,
  //                     color: "#fff",
  //                     width: 64,
  //                     height: 64,
  //                     borderRadius: "50%",
  //                     display: "flex",
  //                     alignItems: "center",
  //                     justifyContent: "center",
  //                     margin: "auto",
  //                     boxShadow: `0 0 12px ${color}88`,
  //                   }}
  //                   aria-label={hop.type}
  //                   title={hop.type}
  //                 >
  //                   {icon}
  //                 </div>
  //                 <div style={{ marginTop: 8 }}>
  //                   <div style={{ fontWeight: 600, fontSize: 14, color: "#222" }}>{hop.name}</div>
  //                   <div style={{ fontSize: 12, color: "#555" }}>
  //                     {hop.date} {hop.time ? `| ${hop.time}` : ""}
  //                   </div>
  //                   {hop.location && (
  //                     <div style={{ fontSize: 12, color: "#888" }}>{hop.location}</div>
  //                   )}
  //                 </div>
  //               </div>
  //             );
  //           })}
  //         </div>
  //       ))}
  //     </div>
  //   );
  // }

  function ItineraryTimeline({ itinerary }: ItineraryCardProps) {
    // const containerRef = useRef(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    // Track container width for responsive layout
    useEffect(() => {
      if (!containerRef.current) return;
      setContainerWidth(containerRef.current.offsetWidth);

      const handleResize = () => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.offsetWidth);
        }
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const nodeWidth = 150;
    const nodeHeight = 120;
    const maxPerRow = Math.max(1, Math.floor(containerWidth / nodeWidth));

    // Split itinerary into rows
    const rows = [];
    for (let i = 0; i < itinerary.hops.length; i += maxPerRow) {
      rows.push(itinerary.hops.slice(i, i + maxPerRow));
    }

    // Calculate SVG height
    const svgHeight = rows.length * nodeHeight;

    return (
      <div ref={containerRef} style={{ position: "relative", padding: 20, boxSizing: "border-box" }}>
        {/* SVG for lines */}
        <svg
          width={containerWidth}
          height={svgHeight}
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 0 }}
        >
          {/* Horizontal connections in rows */}
          {rows.map((row, rowIndex) => {
            const y = rowIndex * nodeHeight + nodeHeight / 2;

            return row.map((_, i) => {
              if (i === 0) return null;

              const startX = (i - 1) * nodeWidth + nodeWidth / 2;
              const endX = i * nodeWidth + nodeWidth / 2;

              return (
                <path
                  key={`h-${rowIndex}-${i}`}
                  d={`M${startX},${y} C${startX + 30},${y - 25} ${endX - 30},${y - 25} ${endX},${y}`}
                  stroke="#bbb"
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                />
              );
            });
          })}

          {/* Vertical connections between rows */}
          {rows.map((row, rowIndex) => {
            if (rowIndex === rows.length - 1) return null;

            const currentRowEndX = (row.length - 1) * nodeWidth + nodeWidth / 2;
            const currentRowEndY = rowIndex * nodeHeight + nodeHeight / 2;

            const nextRowStartX = nodeWidth / 2;
            const nextRowStartY = (rowIndex + 1) * nodeHeight + nodeHeight / 2;

            return (
              <g key={`v-${rowIndex}`}>
                {/* Vertical line down */}
                <line
                  x1={currentRowEndX}
                  y1={currentRowEndY}
                  x2={currentRowEndX}
                  y2={currentRowEndY + 20}
                  stroke="#bbb"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                {/* Curved horizontal line */}
                <path
                  d={`
                  M${currentRowEndX},${currentRowEndY + 20}
                  C${currentRowEndX + 15},${currentRowEndY + 20}
                   ${nextRowStartX - 15},${nextRowStartY - 20}
                   ${nextRowStartX},${nextRowStartY - 20}
                `}
                  stroke="#bbb"
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Vertical line down into node */}
                <line
                  x1={nextRowStartX}
                  y1={nextRowStartY - 20}
                  x2={nextRowStartX}
                  y2={nextRowStartY}
                  stroke="#bbb"
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
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: rowIndex < rows.length - 1 ? 40 : 0,
              gap: 0,
            }}
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
                    padding: "0 5px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: color,
                      color: "#fff",
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "auto",
                      boxShadow: `0 0 12px ${color}88`,
                    }}
                    aria-label={hop.type}
                    title={hop.type}
                  >
                    {icon}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#222" }}>{hop.name}</div>
                    <div style={{ fontSize: 12, color: "#555" }}>
                      {hop.date} {hop.time ? `| ${hop.time}` : ""}
                    </div>
                    {hop.location && <div style={{ fontSize: 12, color: "#888" }}>{hop.location}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }


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

const bounceTransition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};

function ItineraryTimelineZigzag({ itinerary }: ItineraryCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  // const [activeIndex, setActiveIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pathsLength, setPathsLength] = useState({});

  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const nodeWidth = 160;
  const nodeHeight = 140;
  const maxPerRow = Math.max(1, Math.floor(containerWidth / nodeWidth));

  // const rows = [];
  const rows: ItineraryHop[][] = [];
  for (let i = 0; i < itinerary.hops.length; i += maxPerRow) {
    rows.push(itinerary.hops.slice(i, i + maxPerRow));
  }

  const svgHeight = rows.length * nodeHeight;

  // Helper to get node center X position within container for normal and reversed rows
  const getNodeCenterX = (index: number, rowLength: number, rowIndex: number) => {
    if (rowIndex % 2 === 0) {
      // even row: left to right
      return index * nodeWidth + nodeWidth / 2;
    } else {
      // odd row: right to left
      return (rowLength - 1 - index) * nodeWidth + nodeWidth / 2;
    }
  };

  // Animate SVG paths: store refs and update dashoffset based on lengths
  // const pathRefs = useRef({});
  const pathRefs = useRef<{ [key: string]: SVGPathElement | null }>({});

  useEffect(() => {
    // const lengths = {};
    const lengths: { [key: string]: number } = {};
    Object.entries(pathRefs.current).forEach(([key, path]) => {
      if (path) {
        lengths[key] = path.getTotalLength();
        path.style.strokeDasharray = lengths[key].toString();;
        path.style.strokeDashoffset = lengths[key].toString();;
        // Animate dash offset to zero to show stroke drawing
        setTimeout(() => {
          path.style.transition = "stroke-dashoffset 1s ease";
          path.style.strokeDashoffset = "0";
        }, 100);
      }
    });
    setPathsLength(lengths);
  }, [containerWidth, itinerary]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        padding: 30,
        boxSizing: "border-box",
        background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
        borderRadius: 14,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
        userSelect: "none",
        minHeight: svgHeight + 100,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
          const y = rowIndex * nodeHeight + nodeHeight / 2;
          const rowLength = row.length;

          return row.map((_: any, i: number) => {
            if (i === 0) return null;

            const startX = getNodeCenterX(i - 1, rowLength, rowIndex);
            const endX = getNodeCenterX(i, rowLength, rowIndex);
            const key = `h-${rowIndex}-${i}`;

            return (
              <path
                key={key}
                ref={(el) => {pathRefs.current[key] = el}}
                d={`M${startX},${y} C${startX + (endX > startX ? 45 : -45)},${y - 40} ${endX - (endX > startX ? 45 : -45)},${y - 40} ${endX},${y}`}
                stroke="#4a90e2"
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
              />
            );
          });
        })}

        {/* Vertical connections */}
        {rows.map((row, rowIndex) => {
          if (rowIndex === rows.length - 1) return null;

          const currentRowLength = row.length;
          const nextRowLength = rows[rowIndex + 1].length;

          const currentRowEndIndex = rowIndex % 2 === 0 ? currentRowLength - 1 : 0;
          const nextRowStartIndex = (rowIndex + 1) % 2 === 0 ? 0 : nextRowLength - 1;

          const currentRowEndX = getNodeCenterX(currentRowEndIndex, currentRowLength, rowIndex);
          const currentRowEndY = rowIndex * nodeHeight + nodeHeight / 2;

          const nextRowStartX = getNodeCenterX(nextRowStartIndex, nextRowLength, rowIndex + 1);
          const nextRowStartY = (rowIndex + 1) * nodeHeight + nodeHeight / 2;

          const key = `v-${rowIndex}`;

          return (
            <g key={key}>
              <line
                ref={(el) => {pathRefs.current[`${key}-l1`] = el}}
                x1={currentRowEndX}
                y1={currentRowEndY}
                x2={currentRowEndX}
                y2={currentRowEndY + 25}
                stroke="#4a90e2"
                strokeWidth={4}
                strokeLinecap="round"
              />
              <path
                ref={(el) => {pathRefs.current[`${key}-p`] = el}}
                d={`
                  M${currentRowEndX},${currentRowEndY + 25}
                  C${currentRowEndX + (nextRowStartX > currentRowEndX ? 30 : -30)},${currentRowEndY + 25}
                   ${nextRowStartX - (nextRowStartX > currentRowEndX ? 30 : -30)},${nextRowStartY - 25}
                   ${nextRowStartX},${nextRowStartY - 25}
                `}
                stroke="#4a90e2"
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
              />
              <line
                ref={(el) => {pathRefs.current[`${key}-l2`] = el}}
                x1={nextRowStartX}
                y1={nextRowStartY - 25}
                x2={nextRowStartX}
                y2={nextRowStartY}
                stroke="#4a90e2"
                strokeWidth={4}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {rows.map((row, rowIndex) => {
        const reversed = rowIndex % 2 === 1;
        const displayRow = reversed ? [...row].reverse() : row;

        return (
          <div
            key={rowIndex}
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: rowIndex < rows.length - 1 ? 70 : 0,
              gap: 20,
            }}
          >
            {displayRow.map((hop: ItineraryHop, i: number) => {
              const icon = icons[hop.type] || icons.other;
              const color = colors[hop.type] || colors.other;
              const isActive = activeIndex === i + rowIndex * maxPerRow;

              return (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  onClick={() => setActiveIndex(isActive ? null : i + rowIndex * maxPerRow)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveIndex(isActive ? null : i + rowIndex * maxPerRow);
                    }
                  }}
                  style={{
                    flex: `0 0 ${nodeWidth}px`,
                    textAlign: "center",
                    cursor: "pointer",
                    position: "relative",
                    userSelect: "none",
                    transition: "transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55), box-shadow 0.3s ease",
                    boxShadow: isActive ? `0 10px 25px ${color}bb` : "none",
                    transform: isActive ? "scale(1.15)" : "scale(1)",
                    borderRadius: 12,
                    background: isActive
                      ? `radial-gradient(circle at center, ${color}33, transparent 70%)`
                      : "transparent",
                    outline: isActive ? `2px solid ${color}` : "none",
                    padding: 10,
                  }}
                  title={`${hop.name}\n${hop.date} ${hop.time || ""}\n${hop.location || ""}`}
                >
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${color}, #0000${color.slice(1)})`,
                      color: "#fff",
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "auto",
                      boxShadow: `0 0 25px ${color}bb`,
                      fontSize: 34,
                      userSelect: "none",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    {icon}
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      fontWeight: "700",
                      fontSize: 17,
                      color: "#0a1a4f",
                      textShadow: "0 1px 1px #cfd8ff",
                      userSelect: "text",
                    }}
                  >
                    {hop.name}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#334080",
                      userSelect: "text",
                      marginBottom: hop.location ? 3 : 0,
                    }}
                  >
                    {hop.date} {hop.time ? `| ${hop.time}` : ""}
                  </div>
                  {hop.location && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6577bc",
                        fontStyle: "italic",
                        userSelect: "text",
                      }}
                    >
                      {hop.location}
                    </div>
                  )}

                  {/* Expanded details panel */}
                  {isActive && (
                    <div
                      style={{
                        marginTop: 12,
                        backgroundColor: "#f4f7ff",
                        padding: 10,
                        borderRadius: 8,
                        boxShadow: `0 4px 20px ${color}66`,
                        fontSize: 13,
                        color: "#222",
                        lineHeight: 1.4,
                        userSelect: "text",
                        textAlign: "left",
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      <strong>Details:</strong>
                      <p>{hop.details || "No additional details available."}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const dashArray = "8 6";

function ItineraryTimelineZigzag2({ itinerary }: ItineraryCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);

  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const nodeWidth = 160;
  const nodeHeight = 140;
  const maxPerRow = Math.max(1, Math.floor(containerWidth / nodeWidth));

  const rows: ItineraryHop[][] = [];
  for (let i = 0; i < itinerary.hops.length; i += maxPerRow) {
    rows.push(itinerary.hops.slice(i, i + maxPerRow));
  }

  const svgHeight = rows.length * nodeHeight;

  // Calculate X position of node center for normal and reversed rows
  const getNodeCenterX = (index: number, rowLength: number, rowIndex: number) => {
    if (rowIndex % 2 === 0) {
      // even row: left to right
      return index * nodeWidth + nodeWidth / 2;
    } else {
      // odd row: right to left
      return (rowLength - 1 - index) * nodeWidth + nodeWidth / 2;
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        padding: 30,
        boxSizing: "border-box",
        background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
        borderRadius: 14,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
        userSelect: "none",
        minHeight: svgHeight + 100,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        overflowX: "auto",
      }}
    >
      {/* SVG Lines */}
      <svg
        width={containerWidth}
        height={svgHeight}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "auto", zIndex: 0 }}
      >
        {/* Horizontal dashed connections */}
        {rows.map((row, rowIndex) => {
          const y = rowIndex * nodeHeight + nodeHeight / 2;
          const rowLength = row.length;

          return row.map((_, i) => {
            if (i === 0) return null;
            const startX = getNodeCenterX(i - 1, rowLength, rowIndex);
            const endX = getNodeCenterX(i, rowLength, rowIndex);
            const key = `h-${rowIndex}-${i}`;
            const isHovered = hoveredLine === key;

            return (
              <path
                key={key}
                d={`M${startX},${y} C${startX + (endX > startX ? 40 : -40)},${y - 30} ${
                  endX - (endX > startX ? 40 : -40)
                },${y - 30} ${endX},${y}`}
                stroke={isHovered ? "#ff6f61" : "#5555ffcc"}
                strokeWidth={isHovered ? 5 : 3}
                strokeDasharray={dashArray}
                fill="none"
                strokeLinecap="round"
                style={{ transition: "stroke 0.3s ease, stroke-width 0.3s ease", cursor: "pointer" }}
                onMouseEnter={() => setHoveredLine(key)}
                onMouseLeave={() => setHoveredLine(null)}
              />
            );
          });
        })}

        {/* Vertical dashed connections */}
        {rows.map((row, rowIndex) => {
          if (rowIndex === rows.length - 1) return null;

          const currentRowLength = row.length;
          const nextRowLength = rows[rowIndex + 1].length;

          const currentRowEndIndex = rowIndex % 2 === 0 ? currentRowLength - 1 : 0;
          const nextRowStartIndex = (rowIndex + 1) % 2 === 0 ? 0 : nextRowLength - 1;

          const currentRowEndX = getNodeCenterX(currentRowEndIndex, currentRowLength, rowIndex);
          const currentRowEndY = rowIndex * nodeHeight + nodeHeight / 2;

          const nextRowStartX = getNodeCenterX(nextRowStartIndex, nextRowLength, rowIndex + 1);
          const nextRowStartY = (rowIndex + 1) * nodeHeight + nodeHeight / 2;

          const keyBase = `v-${rowIndex}`;

          const lines = [
            { x1: currentRowEndX, y1: currentRowEndY, x2: currentRowEndX, y2: currentRowEndY + 20, key: `${keyBase}-l1` },
            {
              d: `
                M${currentRowEndX},${currentRowEndY + 20}
                C${currentRowEndX + (nextRowStartX > currentRowEndX ? 25 : -25)},${currentRowEndY + 20}
                 ${nextRowStartX - (nextRowStartX > currentRowEndX ? 25 : -25)},${nextRowStartY - 20}
                 ${nextRowStartX},${nextRowStartY - 20}
              `,
              key: `${keyBase}-p`,
            },
            { x1: nextRowStartX, y1: nextRowStartY - 20, x2: nextRowStartX, y2: nextRowStartY, key: `${keyBase}-l2` },
          ];

          return (
            <g key={keyBase}>
              {lines.map((line) =>
                "d" in line ? (
                  <path
                    key={line.key}
                    d={line.d}
                    stroke={hoveredLine === line.key ? "#ff6f61" : "#5555ffcc"}
                    strokeWidth={hoveredLine === line.key ? 5 : 3}
                    strokeDasharray={dashArray}
                    fill="none"
                    strokeLinecap="round"
                    style={{ transition: "stroke 0.3s ease, stroke-width 0.3s ease", cursor: "pointer" }}
                    onMouseEnter={() => setHoveredLine(line.key)}
                    onMouseLeave={() => setHoveredLine(null)}
                  />
                ) : (
                  <line
                    key={line.key}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke={hoveredLine === line.key ? "#ff6f61" : "#5555ffcc"}
                    strokeWidth={hoveredLine === line.key ? 5 : 3}
                    strokeDasharray={dashArray}
                    strokeLinecap="round"
                    style={{ transition: "stroke 0.3s ease, stroke-width 0.3s ease", cursor: "pointer" }}
                    onMouseEnter={() => setHoveredLine(line.key)}
                    onMouseLeave={() => setHoveredLine(null)}
                  />
                )
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {rows.map((row, rowIndex) => {
        const reversed = rowIndex % 2 === 1;
        const displayRow = reversed ? [...row].reverse() : row;

        return (
          <div
            key={rowIndex}
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: rowIndex < rows.length - 1 ? 70 : 0,
              gap: 20,
            }}
          >
            {displayRow.map((hop, i) => {
              const icon = icons[hop.type] || icons.other;
              const color = colors[hop.type] || colors.other;
              const globalIndex = rowIndex * maxPerRow + i;
              // Adjust index if row is reversed
              const trueIndex = reversed ? row.length - 1 - i : i;
              const isActive = activeIndex === globalIndex;

              return (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  onClick={() => setActiveIndex(isActive ? null : globalIndex)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveIndex(isActive ? null : globalIndex);
                    }
                  }}
                  style={{
                    flex: `0 0 ${nodeWidth}px`,
                    textAlign: "center",
                    cursor: "pointer",
                    position: "relative",
                    userSelect: "none",
                    transition: "transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55), box-shadow 0.3s ease",
                    boxShadow: isActive ? `0 10px 25px ${color}bb` : "none",
                    transform: isActive ? "scale(1.15)" : "scale(1)",
                    borderRadius: 12,
                    background: isActive
                      ? `radial-gradient(circle at center, ${color}33, transparent 70%)`
                      : "transparent",
                    outline: isActive ? `2px solid ${color}` : "none",
                    padding: 10,
                  }}
                  title={`${hop.name}\n${hop.date} ${hop.time || ""}\n${hop.location || ""}`}
                >
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${color}, #0000${color.slice(1)})`,
                      color: "#fff",
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "auto",
                      boxShadow: `0 0 25px ${color}bb`,
                      fontSize: 34,
                      userSelect: "none",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    {icon}
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      fontWeight: "700",
                      fontSize: 17,
                      color: "#0a1a4f",
                      textShadow: "0 1px 1px #cfd8ff",
                      userSelect: "text",
                    }}
                  >
                    {hop.name}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#334080",
                      userSelect: "text",
                      marginBottom: hop.location ? 3 : 0,
                    }}
                  >
                    {hop.date} {hop.time ? `| ${hop.time}` : ""}
                  </div>
                  {hop.location && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6577bc",
                        fontStyle: "italic",
                        userSelect: "text",
                      }}
                    >
                      {hop.location}
                    </div>
                  )}

                  {/* Expanded details panel */}
                  {isActive && (
                    <div
                      style={{
                        marginTop: 12,
                        backgroundColor: "#f4f7ff",
                        padding: 10,
                        borderRadius: 8,
                        boxShadow: `0 4px 20px ${color}66`,
                        fontSize: 13,
                        color: "#222",
                        lineHeight: 1.4,
                        userSelect: "text",
                        textAlign: "left",
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      <strong>Details:</strong>
                      <p>{hop.details || "No additional details available."}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const nodeBoxW = 150, nodeBoxH = 120;



interface Props {
  itinerary: ItineraryHop[];
  columns?: number; // You can customize columns per row
}

function ItineraryGridLines({ itinerary, columns = 3 }: Props) {
  // Refs to node boxes
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  // Node center positions in container coordinates
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);
  // Responsive
  useEffect(() => {
    function measurePositions() {
      if (!gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      setPositions(
        nodeRefs.current.map((el) => {
          if (!el) return { x: 0, y: 0 };
          const r = el.getBoundingClientRect();
          return {
            x: r.left - rect.left + r.width / 2,
            y: r.top - rect.top + r.height / 2,
          };
        })
      );
    }
    measurePositions();
    window.addEventListener("resize", measurePositions);
    return () => window.removeEventListener("resize", measurePositions);
  }, [itinerary, columns]);

  // Arrange in zigzag grid per rows
  const rows: ItineraryHop[][] = [];
  for (let i = 0; i < itinerary.length; i += columns) {
    rows.push(itinerary.slice(i, i + columns));
  }

  // For display: node index in itinerary vs visual grid (for zigzag)
  const displayOrder: number[] = [];
  rows.forEach((row, ri) => {
    const rowBase = ri * columns;
    if (ri % 2 === 0) {
      for (let j = 0; j < row.length; ++j) displayOrder.push(rowBase + j);
    } else {
      for (let j = row.length - 1; j >= 0; --j) displayOrder.push(rowBase + j);
    }
  });

  // Used for visual row/col
  function getGridIdx(idx: number) {
    // idx is display index in nodes
    let k = 0;
    for (let r = 0; r < rows.length; ++r) {
      const L = rows[r].length;
      if (idx < k + L) {
        const c = (r % 2 === 0) ? (idx - k) : (L - 1 - (idx - k));
        return { row: r, col: c };
      }
      k += L;
    }
    return { row: 0, col: 0 };
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
      borderRadius: 14,
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      padding: 30,
      position: "relative"
    }}>
      {/* SVG overlay for the lines */}
      <div style={{position: 'relative'}}>
        <div ref={gridRef} style={{position: 'relative'}}>
          <svg
            width="100%"
            height={rows.length * nodeBoxH + 20}
            style={{position:'absolute',left:0,top:0,zIndex:1,pointerEvents:'none'}}
          >
            {positions.length > 1 && positions.map((pos, i) => {
              if (i >= positions.length - 1) return null;
              const next = positions[i + 1];
              if (!next) return null;
              // Draw a dashed cubic line from pos to next
              const dx = next.x - pos.x, dy = next.y - pos.y;
              // Control points for gentle curve
              const ctrlX = pos.x + dx / 2, ctrlY = pos.y;
              const ctrlX2 = pos.x + dx / 2, ctrlY2 = next.y;
              return (
                <path
                  key={i}
                  d={`M${pos.x},${pos.y} C${ctrlX},${ctrlY} ${ctrlX2},${ctrlY2} ${next.x},${next.y}`}
                  stroke="#3477f5"
                  strokeWidth={3}
                  fill="none"
                  strokeDasharray={dashArray}
                  style={{ transition: "stroke 0.3s" }}
                />
              );
            })}
          </svg>
          {/* The grid of nodes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, ${nodeBoxW}px)`,
              rowGap: '60px',
              columnGap: '32px',
              justifyContent:'center',
              zIndex:2,
              position:'relative',
              minHeight: rows.length * nodeBoxH
            }}
          >
            {displayOrder.map((itIdx, gridIdx) => {
              const hop = itinerary[itIdx];
              const { row, col } = getGridIdx(gridIdx);
              // For zigzag effect: flip row direction
              const justify =
                row % 2 === 0 ? "center" : "center";
              return (
                <div
                  ref={(el) => { nodeRefs.current[gridIdx] = el || null }}
                  key={gridIdx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: justify,
                    width: nodeBoxW,
                    height: nodeBoxH,
                    background:'rgba(255,255,255,0.8)',
                    borderRadius:12,
                    boxShadow:'0 6px 18px #c4dafc55',
                    position:'relative',
                  }}
                >
                  <div style={{
                    background: colors[hop.type] || colors.other,
                    width: 52, height:52, borderRadius:'50%',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    color:'#fff',fontSize:28,margin:'8px 0'
                  }}>{icons[hop.type] || icons.other}</div>
                  <div style={{fontWeight:700,fontSize:18,color:'#1C3177',marginBottom:6}}>
                    {hop.name}
                  </div>
                  <div style={{fontSize:15, color:'#334080'}}>
                    {hop.date}{hop.time ? ' | '+hop.time : ''}
                  </div>
                  {hop.location && <div style={{fontSize:13, fontStyle:'italic', color:'#6a83b1',marginTop:3}}>
                    {hop.location}
                  </div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
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
            // state.itinerary && state.itinerary.hops.length > 0 && <ItineraryTimelineZigzag2 itinerary={state.itinerary} />
            // state.itinerary && state.itinerary.hops.length > 0 && <ItineraryGridLines itinerary={state.itinerary.hops} />
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
