import { buildLlmsIndex } from "@/lib/llms";

/* /llms.txt — the concise, llmstxt.org-standard index. No request input, so it
   is prerendered to a static file at build time. */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildLlmsIndex(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
