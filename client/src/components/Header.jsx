export default function Header() {
  return (
    <header className="bg-slate-600 text-white border-b border-slate-600 sticky top-0 z-50 pt-[2px] pb-[2px]">
      <div className="header-content">
        <div className="logo">
          {/* iOS-optimized MindTrace Brain Network Logo */}
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center relative">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-white"
              fill="currentColor"
            >
              {/* Brain outline */}
              <path d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 3 1.5 4.5C8.5 14 9.5 15.5 10 17c.5 1.5 1 3 2 4s2.5 1 4 0 1.5-2.5 2-4c.5-1.5 1.5-3 2.5-4.5C21.5 11 22 9.5 22 8c0-3.5-2.5-6-6-6-1.5 0-3 .5-4 1.5C11 2.5 9.5 2 8 2Z" opacity="0.3"/>
              {/* Neural network connections */}
              <circle cx="9" cy="7" r="1" />
              <circle cx="15" cy="7" r="1" />
              <circle cx="12" cy="9" r="1" />
              <circle cx="8" cy="11" r="1" />
              <circle cx="16" cy="11" r="1" />
              <circle cx="12" cy="13" r="1" />
              {/* Connection lines */}
              <line x1="9" y1="7" x2="12" y2="9" stroke="currentColor" strokeWidth="0.5" opacity="0.7"/>
              <line x1="15" y1="7" x2="12" y2="9" stroke="currentColor" strokeWidth="0.5" opacity="0.7"/>
              <line x1="12" y1="9" x2="8" y2="11" stroke="currentColor" strokeWidth="0.5" opacity="0.7"/>
              <line x1="12" y1="9" x2="16" y2="11" stroke="currentColor" strokeWidth="0.5" opacity="0.7"/>
              <line x1="8" y1="11" x2="12" y2="13" stroke="currentColor" strokeWidth="0.5" opacity="0.7"/>
              <line x1="16" y1="11" x2="12" y2="13" stroke="currentColor" strokeWidth="0.5" opacity="0.7"/>
            </svg>
          </div>
          <h1 className="logo-text font-bold app-text-primary">MindTrace</h1>
        </div>
      </div>
    </header>
  );
}