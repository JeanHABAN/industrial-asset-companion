import { createContext, useCallback, useContext, useState } from 'react';

type Toast = { id: number; text: string };
type ToastCtx = { show: (text: string) => void };

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const show = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setItems(prev => [...prev, { id, text }]);
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 2500);
  }, []);
  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {/* container */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {items.map(t => (
          <div
            key={t.id}
            className="px-4 py-2 rounded bg-emerald-900 border border-emerald-700 text-emerald-50 shadow-lg"
          >
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
