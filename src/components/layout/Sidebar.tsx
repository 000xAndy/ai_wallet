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
    <aside className="w-56 h-full bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-brand-500" />
          <span className="font-bold text-lg gradient-text">AI Wallet</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 text-gray-400 hover:text-gray-200">
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
                ? 'bg-brand-600/20 text-brand-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800 space-y-2">
        <button
          onClick={() => setNetworkMode(isTestnet ? 'mainnet' : 'testnet')}
          className={cn(
            'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isTestnet
              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
              : 'bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-700'
          )}
        >
          <FlaskConical className="w-4 h-4" />
          {isTestnet ? t('sidebar.testnetMode') : t('sidebar.testnet')}
        </button>
        <div className="text-xs text-gray-600 text-center">v1.0.0</div>
      </div>
    </aside>
  );
}
