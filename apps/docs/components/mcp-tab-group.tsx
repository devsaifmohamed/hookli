"use client";

import { useState } from "react";

type TabKey = "ide" | "cli" | "local";

interface McpTabGroupProps {
  ideContent: React.ReactNode;
  cliContent: React.ReactNode;
  localContent: React.ReactNode;
}

export function McpTabGroup({
  ideContent,
  cliContent,
  localContent,
}: McpTabGroupProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("ide");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "ide", label: "IDE / Editor" },
    { key: "cli", label: "CLI Agent" },
    { key: "local", label: "Local Dev" },
  ];

  return (
    <div className="mt-6 flex flex-col">
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05] w-fit">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 whitespace-nowrap ${
                isActive
                  ? "bg-accent text-ground shadow-sm shadow-accent/25"
                  : "text-gray-body hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {activeTab === "ide" && ideContent}
        {activeTab === "cli" && cliContent}
        {activeTab === "local" && localContent}
      </div>
    </div>
  );
}
