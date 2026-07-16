"use client";

import { useState } from "react";
import { useFetch } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

type Post = { id: number; title: string; body: string };

const API_BASE = "https://jsonplaceholder.typicode.com";
const POST_IDS = [1, 2, 3] as const;
/* jsonplaceholder has no post 0 — responds 404, which the hook turns into
   an Error("HTTP error! status: 404"). */
const BROKEN_URL = `${API_BASE}/posts/0`;

const postUrl = (id: number) => `${API_BASE}/posts/${id}`;

/* Mirrors the usage snippet in lib/hook-docs.ts — keep in sync. The hook
   refetches when url changes but never resets loading/error/data between
   requests, so the parent remounts this reader via key={url} to give every
   request fresh hook state. */
function PostReader({ url }: { url: string }) {
  const { data, error, loading } = useFetch<Post>(url);

  return (
    <>
      <dl>
        <DemoReadout label="loading">{String(loading)}</DemoReadout>
        <DemoReadout label="error">
          {error ? error.message : "null"}
        </DemoReadout>
        <DemoReadout label="data">
          {data ? `#${data.id} ${data.title}` : "null"}
        </DemoReadout>
      </dl>
      <p className="min-h-16 font-mono text-xs leading-relaxed" aria-live="polite">
        {loading ? (
          <span className="text-accent">fetching…</span>
        ) : error ? (
          <span className="text-gray-body">
            request failed — {error.message}
          </span>
        ) : data ? (
          <span className="text-slate-syntax">{data.body}</span>
        ) : null}
      </p>
    </>
  );
}

export function UseFetchDocDemo() {
  const [url, setUrl] = useState(postUrl(POST_IDS[0]));

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {POST_IDS.map((id) => (
          <DemoButton
            key={id}
            aria-pressed={url === postUrl(id)}
            onClick={() => setUrl(postUrl(id))}
          >
            Post {id}
          </DemoButton>
        ))}
        <DemoButton
          aria-pressed={url === BROKEN_URL}
          onClick={() => setUrl(BROKEN_URL)}
        >
          404
        </DemoButton>
      </div>
      <dl>
        <DemoReadout label="url">{url.replace(API_BASE, "…")}</DemoReadout>
      </dl>
      <PostReader key={url} url={url} />
    </div>
  );
}
