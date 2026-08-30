import { hookToMarkdown } from "@/lib/hook-markdown";
import { HOOKS, getHook } from "@/lib/hooks-registry";

/* /docs/<slug>/llms.txt — the machine-readable twin of every hook page: that
   one hook rendered through the shared Markdown renderer. Prerendered for every
   hook alongside its HTML page. */
export function generateStaticParams() {
  return HOOKS.map(({ slug }) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const hook = getHook(slug);

  if (!hook) {
    return new Response("Not found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(`${hookToMarkdown(hook)}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
