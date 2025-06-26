import mindtraceLogoPath from "@assets/Screenshot 2025-06-09 at 22.02.36_1750939481522.png";

export default function Header() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
          <img src={mindtraceLogoPath} alt="MindTrace Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-xl font-serif font-semibold app-primary">MindTrace</h1>
      </div>
      <div className="app-text-secondary">
        <span className="text-sm">{currentDate}</span>
      </div>
    </header>
  );
}
