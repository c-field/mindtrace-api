export default function Header() {
  return (
    <header
      className="bg-slate-800 text-white fixed top-0 left-0 right-0 z-50 flex items-center justify-center min-h-[var(--header-height)]"
      style={{ position: 'fixed' }}>

      <div className="flex justify-center">
        <div className="flex items-center gap-2">
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