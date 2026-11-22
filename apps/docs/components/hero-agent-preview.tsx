"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SparklesIcon, ArrowRightIcon } from "@/components/icons";
import { HOOKS } from "@/lib/hooks-registry";

const IDE_NAMES = [
  "Cursor · Composer Agent",
  "Claude Code · Terminal",
  "Windsurf · Cascade Agent",
];

const CODE_SNIPPET = `import { useDebounceValue, useLocalStorage } from 'hookli';

export function SearchBox() {
  const [query, setQuery] = useLocalStorage('recent-search', '');
  const [debounced] = useDebounceValue(query, 300);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search hooks..."
    />
  );
}`;

export function HeroAgentPreview({ className = "" }: { className?: string }) {
  const [ideIndex, setIdeIndex] = useState(0);
  const [phase, setPhase] = useState<"user" | "tool" | "result" | "code" | "done">("user");
  const [userText, setUserText] = useState("");
  const [codeText, setCodeText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fullPrompt = "Build a debounced search input that persists the last query";

  // Viewport intersection observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Simulation sequence
  useEffect(() => {
    if (!isVisible) return;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        setUserText(fullPrompt);
        setCodeText(CODE_SNIPPET);
        setPhase("done");
      }, 0);
      return () => clearTimeout(timer);
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    if (phase === "user") {
      if (userText.length < fullPrompt.length) {
        timeoutId = setTimeout(() => {
          setUserText(fullPrompt.slice(0, userText.length + 1));
        }, 35);
      } else {
        timeoutId = setTimeout(() => setPhase("tool"), 500);
      }
    } else if (phase === "tool") {
      timeoutId = setTimeout(() => setPhase("result"), 800);
    } else if (phase === "result") {
      timeoutId = setTimeout(() => setPhase("code"), 600);
    } else if (phase === "code") {
      if (codeText.length < CODE_SNIPPET.length) {
        // type code in chunks for snappy realistic speed
        timeoutId = setTimeout(() => {
          setCodeText(CODE_SNIPPET.slice(0, codeText.length + 3));
        }, 15);
      } else {
        timeoutId = setTimeout(() => setPhase("done"), 100);
      }
    } else if (phase === "done") {
      timeoutId = setTimeout(() => {
        // cycle to next IDE and restart
        setIdeIndex((prev) => (prev + 1) % IDE_NAMES.length);
        setUserText("");
        setCodeText("");
        setPhase("user");
      }, 4500);
    }

    return () => clearTimeout(timeoutId);
  }, [isVisible, phase, userText, codeText]);

  return (
    <div
      ref={containerRef}
      className={`hero-agent-card relative w-full max-w-2xl overflow-hidden rounded-2xl border border-accent/25 bg-ground-raised/95 text-left backdrop-blur-xl transition-all duration-300 hover:border-accent/40 ${className}`}
    >
      {/* IDE Header Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-white/10" />
            <span className="size-2.5 rounded-full bg-white/10" />
            <span className="size-2.5 rounded-full bg-white/10" />
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-gray-body/80">
            <SparklesIcon className="size-3 text-accent" />
            <span className="transition-opacity duration-300">
              {IDE_NAMES[ideIndex]}
            </span>
          </div>
        </div>

        {/* MCP Live Status */}
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
          </span>
          <span>hookli MCP active</span>
        </div>
      </div>

      {/* Terminal / Chat Simulation Body */}
      <div className="flex min-h-[290px] flex-col gap-3 p-4 sm:p-5 font-mono text-xs">
        {/* User Prompt */}
        <div className="flex items-start gap-2 text-fg">
          <span className="text-accent font-bold select-none">&gt;</span>
          <p className="leading-relaxed">
            {userText}
            {phase === "user" && (
              <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-accent animate-pulse align-middle" />
            )}
          </p>
        </div>

        {/* Tool Invocation */}
        {(phase === "tool" || phase === "result" || phase === "code" || phase === "done") && (
          <div className="flex flex-col gap-1.5 rounded-lg border border-accent/20 bg-accent/[0.04] p-3 text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-accent">
              <span className="text-[10px] uppercase font-bold tracking-wider rounded bg-accent/20 px-1.5 py-0.2 border border-accent/30">
                MCP Tool Call
              </span>
              <span className="font-semibold text-fg">
                hookli.search_hooks
              </span>
              <span className="text-gray-body/70 text-[11px]">
                &#123; query: &quot;debounce persist&quot; &#125;
              </span>
            </div>

            {(phase === "result" || phase === "code" || phase === "done") && (
              <div className="text-[11px] text-gray-body/90 pl-1 border-l-2 border-accent/40 mt-1">
                ✓ Found: <strong className="text-white">useDebounceValue</strong> (State),{" "}
                <strong className="text-white">useLocalStorage</strong> (State) — 0 dependencies, SSR-safe
              </div>
            )}
          </div>
        )}

        {/* Generated Code Output */}
        {(phase === "code" || phase === "done") && (
          <div className="relative overflow-hidden rounded-lg border border-white/[0.06] bg-ground/80 p-3.5">
            <pre className="text-gray-body text-xs leading-relaxed overflow-x-auto">
              <code>{codeText}</code>
            </pre>
            {phase === "code" && (
              <span className="inline-block w-1.5 h-3.5 bg-accent animate-pulse align-middle" />
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.015] px-4 py-2.5 text-xs">
        <span className="text-gray-body/60">
          Zero hallucinations · Real TypeScript AST · {HOOKS.length} hooks
        </span>
        <Link
          href="/docs/mcp"
          className="inline-flex items-center gap-1 font-semibold text-accent hover:text-accent-hover transition-colors"
        >
          <span>Connect your IDE</span>
          <ArrowRightIcon className="size-3" />
        </Link>
      </div>
    </div>
  );
}
