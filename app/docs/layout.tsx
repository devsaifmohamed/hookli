import { MobileDocsNav, Sidebar } from "@/components/Sidebar";

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 sm:px-6">
      <MobileDocsNav />
      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 py-10 md:pl-10">{children}</main>
      </div>
    </div>
  );
}
