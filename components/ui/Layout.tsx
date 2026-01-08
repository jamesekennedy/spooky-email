import React, { useState } from 'react';
import { LogOut, LayoutDashboard, FileText, Settings, Ghost, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user?: { username: string } | null;
  onLogout?: () => void;
  currentStep: number;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, currentStep }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shadow-xl border-r border-slate-800
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Ghost className="h-6 w-6 text-orange-500" />
            <h1 className="text-xl font-bold tracking-tight text-white">SpookyEmail</h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-2 md:hidden">
          <p className="text-xs text-slate-400">Hauntingly Good Outreach</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentStep === 1 ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs shrink-0">1</span>
            Upload CSV
          </div>
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentStep === 2 ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs shrink-0">2</span>
            Write Template
          </div>
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentStep === 3 ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs shrink-0">3</span>
            Preview
          </div>
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentStep === 4 ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs shrink-0">4</span>
            Generate
          </div>
        </nav>

        {user && (
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate text-slate-200">{user.username}</p>
              </div>
              {onLogout && (
                <button onClick={onLogout} className="text-slate-400 hover:text-white transition-colors" title="Logout">
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 w-full relative">
        
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 shrink-0 z-10 shadow-md">
           <div className="flex items-center gap-2">
            <Ghost className="h-6 w-6 text-orange-500" />
            <span className="font-bold text-white">SpookyEmail</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="text-slate-200 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto h-full flex flex-col">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
};