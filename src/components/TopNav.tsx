import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AppView } from '../types/audit';

interface TopNavProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onSaveProgress: () => void;
  justSaved: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeView,
  onNavigate,
  onSaveProgress,
  justSaved,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: AppView; label: string }> = [
    { id: 'overview', label: 'Inicio' },
    { id: 'audit', label: 'Auditoría' },
    { id: 'report', label: 'Informe y Rúbrica' },
    { id: 'certificate', label: 'Certificado' },
  ];

  const handleSelect = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 md:gap-8 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('overview')}
          className="font-editorial max-w-[260px] truncate text-left text-sm font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 sm:max-w-none sm:text-lg"
        >
          Auditoría Administrativa · Prof. Liz Acuña
        </button>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-6 text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`relative py-1 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-900 ${
                  isActive
                    ? 'text-blue-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute right-0 bottom-0 left-0 h-0.5 bg-blue-900"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onSaveProgress}
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 whitespace-nowrap shrink-0"
          >
            {justSaved ? 'Avance guardado' : 'Guardar avance'}
          </button>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <nav aria-label="Menú móvil" className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-blue-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                onSaveProgress();
                setMobileMenuOpen(false);
              }}
              className="mt-2 w-full rounded-lg bg-blue-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-800"
            >
              {justSaved ? 'Avance guardado' : 'Guardar avance'}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
