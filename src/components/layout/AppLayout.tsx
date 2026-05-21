import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Desktop sidebar — always visible */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Mobile header bar */}
        <div className="md:hidden flex items-center gap-2 px-4 py-2 border-b border-border bg-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm gradient-text">{t('common.appName')}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
