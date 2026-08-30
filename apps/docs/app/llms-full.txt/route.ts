import { buildLlmsFull } from "@/lib/llms";

/* /llms-full.txt — the whole library in one Markdown document (every hook via
   the shared renderer). No request input, so it is prerendered at build time. */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildLlmsFull(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
