import TopBar from "./TopBar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-ice-50">
      <TopBar />
      <main>{children}</main>
    </div>
  );
}
