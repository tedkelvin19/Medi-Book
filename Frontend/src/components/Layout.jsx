import Sidebar from './Sidebar';

export default function Layout({ children, title, subtitle }) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-56 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-7 flex-shrink-0">
          <div>
            <h1 className="text-base font-serif font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center cursor-pointer">
            <span className="text-white text-xs">🔔</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-7">
          {children}
        </main>
      </div>
    </div>
  );
}