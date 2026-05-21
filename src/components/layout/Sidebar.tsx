import { NavLink } from 'react-router-dom';
import { Wallet, MessageCircle, Users, Settings, Shield, FlaskConical, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings.store';
import { useTranslation } from 'react-i18next';

interface Props {
  onClose?: () => void;
}

export function Sidebar({ onClose }: Props) {
  const { t } = useTranslation();
  const { networkMode, setNetworkMode } = useSettingsStore();
  const isTestnet = networkMode === 'testnet';

  const links = [
    { to: '/wallet', label: t('sidebar.wallet'), icon: Wallet },
    { to: '/chat', label: t('sidebar.aiChat'), icon: MessageCircle },
    { to: '/contacts', label: t('sidebar.contacts'), icon: Users },
    { to: '/settings', label: t('sidebar.settings'), icon: Settings },
  ];

  return (
    <aside className="w-56 h-full bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg gradient-text">AI Wallet</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => onClose?.()}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground shadow-nav-active'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        <button
          onClick={() => setNetworkMode(isTestnet ? 'mainnet' : 'testnet')}
          className={cn(
            'flex items-center gap-2 w-full px-3 py-2 rounded-full text-sm font-medium transition-colors',
            isTestnet
              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          )}
        >
          <FlaskConical className="w-4 h-4" />
          {isTestnet ? t('sidebar.testnetMode') : t('sidebar.testnet')}
        </button>
        <div className="text-xs text-text-tertiary text-center">v1.0.0</div>
      </div>
    </aside>
  );
}
