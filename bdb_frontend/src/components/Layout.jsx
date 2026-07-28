import TopBar from "./TopBar";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <TopBar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
