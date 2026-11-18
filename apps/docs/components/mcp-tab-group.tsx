"use client";

import { useState } from "react";

type TabKey =
  | "cursor"
  | "claude-code"
  | "antigravity"
  | "codex"
  | "claude"
  | "windsurf"
  | "cline"
  | "local";

interface McpTabGroupProps {
  cursorContent: React.ReactNode;
  claudeCodeContent: React.ReactNode;
  antigravityContent?: React.ReactNode;
  codexContent?: React.ReactNode;
  claudeContent: React.ReactNode;
  windsurfContent: React.ReactNode;
  clineContent?: React.ReactNode;
  localContent: React.ReactNode;
}

export function McpTabGroup({
  cursorContent,
  claudeCodeContent,
  antigravityContent,
  codexContent,
  claudeContent,
  windsurfContent,
  clineContent,
  localContent,
}: McpTabGroupProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("cursor");

  const tabs: { key: TabKey; label: string; badge?: string }[] = [
    { key: "cursor", label: "Cursor", badge: "IDE" },
    { key: "claude-code", label: "Claude Code", badge: "CLI" },
    { key: "antigravity", label: "Antigravity", badge: "Google" },
    { key: "codex", label: "Codex / OpenAI", badge: "OpenAI" },
    { key: "claude", label: "Claude Desktop", badge: "Desktop" },
    { key: "windsurf", label: "Windsurf", badge: "IDE" },
    { key: "cline", label: "VS Code / Cline", badge: "Extension" },
    { key: "local", label: "Local Workspace", badge: "Dev" },
  ];

  return (
    <div className="mt-6 flex flex-col">
      {/* Sleek Segmented Pill Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05] w-fit">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 whitespace-nowrap ${
                isActive
                  ? "bg-accent text-ground shadow-sm shadow-accent/25"
                  : "text-gray-body hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[9px] font-mono uppercase tracking-wider ${
                    isActive
                      ? "bg-ground/20 text-ground"
                      : "bg-accent/15 text-accent"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-5">
        {activeTab === "cursor" && cursorContent}
        {activeTab === "claude-code" && claudeCodeContent}
        {activeTab === "antigravity" && antigravityContent}
        {activeTab === "codex" && codexContent}
        {activeTab === "claude" && claudeContent}
        {activeTab === "windsurf" && windsurfContent}
        {activeTab === "cline" && clineContent}
        {activeTab === "local" && localContent}
      </div>
    </div>
  );
}
