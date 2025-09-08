"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function XpPage({ title, children }: Props) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const timeText = useMemo(
    () => now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    [now]
  );

  return (
    <div className="w-full min-h-screen" style={{ fontFamily: "Tahoma, Verdana, 'Segoe UI', sans-serif" }}>
      <div
        className="relative w-full min-h-screen overflow-hidden"
        style={{ background: "linear-gradient(180deg, #3aa0ff 0%, #2f7adf 40%, #2b8b57 100%)" }}
      >
        {/* Centered XP-like Window */}
        <div className="w-full flex justify-center pt-14 pb-20 px-4">
          <div
            className="w-full max-w-5xl rounded-sm overflow-hidden"
            style={{ border: "1px solid #0a246a", boxShadow: "2px 2px 0 rgba(0,0,0,0.25)" }}
          >
            {/* Title bar */}
            <div
              className="h-8 px-3 flex items-center justify-between"
              style={{ color: "#fff", background: "linear-gradient(180deg, #3b6ea5 0%, #2b5aa0 100%)", boxShadow: "0 1px 0 #6fa1da inset, 0 -1px 0 #183a7a inset" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white" style={{ boxShadow: "inset 0 0 0 1px #2b5aa0" }} />
                <span className="font-bold text-sm drop-shadow">{title}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs opacity-90">{timeText}</span>
              </div>
            </div>
            {/* Content area */}
            <div
              className="p-4"
              style={{ background: "#ECE9D8", borderTop: "1px solid #fff", boxShadow: "inset 1px 1px 0 #ffffff, inset -1px -1px 0 #b5b1a7" }}
            >
              {children}
            </div>
          </div>
        </div>

        {/* Taskbar */}
        <div
          className="absolute left-0 right-0 bottom-0 h-12 flex items-center"
          style={{ background: "linear-gradient(180deg, #3b6ea5 0%, #295a9e 100%)", boxShadow: "0 -1px 0 #7fa7d9 inset, 0 -2px 0 #1f4a86 inset" }}
        >
          <button
            className="mx-1 my-1 px-3 rounded-sm text-sm font-bold flex items-center gap-2 shadow"
            style={{ color: "#fff", background: "linear-gradient(180deg, #5db15d 0%, #2f8a2f 100%)", boxShadow: "0 1px 0 #8dd38d inset, 0 -1px 0 #1d5f1d inset", border: "1px solid #1b5e1b" }}
            type="button"
            onClick={() => { }}
          >
            <div className="grid grid-cols-2 gap-0.5">
              <span className="w-2 h-2 bg-white block" />
              <span className="w-2 h-2 bg-white block" />
              <span className="w-2 h-2 bg-white block" />
              <span className="w-2 h-2 bg-white block" />
            </div>
            Start
          </button>
          <div className="flex-1" />
          <div className="w-28 flex items-center justify-end pr-3 text-sm select-none" style={{ color: "#111" }}>{timeText}</div>
        </div>
      </div>
    </div>
  );
}
