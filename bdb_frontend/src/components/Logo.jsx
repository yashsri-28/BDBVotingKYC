export default function Logo({ size = "md", withWordmark = true, dark = false }) {
  const sizes = { sm: "h-8", md: "h-12", lg: "h-20" };
  return (
    <div className="flex items-center gap-3">
      <img
        src="/images/bdb-logo.png"
        alt="Bharat Diamond Bourse"
        className={`${sizes[size]} w-auto object-contain`}
      />
      {withWordmark && (
        <div className={`leading-tight ${dark ? "text-white" : "text-navy-900"}`}>
          <div className="brand-serif text-xl font-semibold tracking-wide">
            Election Verification Portal
          </div>
          <div className={`text-[11px] tracking-[0.2em] uppercase ${dark ? "text-steel-300" : "text-steel-400"}`}>
            Bharat Diamond Bourse
          </div>
        </div>
      )}
    </div>
  );
}
