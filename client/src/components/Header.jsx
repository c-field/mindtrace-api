export default function Header() {
  return (
        <header
          className="bg-slate-800 text-white border-b border-slate-600 sticky top-0 z-50 pt-[2px] pb-[2px]">
      <div className="header-content">
        <div className="logo">
          {/* iOS-optimized MindTrace Brain Network Logo */}
          <div className="w-7 h-7 rounded-lg overflow-hidden">
            <img src="/logo.png" alt="MindTrace logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-display text-xl app-text-primary">MindTrace</h1>
        </div>
      </div>
    </header>
  );
}