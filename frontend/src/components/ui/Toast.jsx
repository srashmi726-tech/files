import { useState, useEffect } from 'react';

let _show = null;

export function showToast(message, type = 'success') {
  if (_show) _show({ message, type, id: Date.now() });
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _show = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3500);
    };
    return () => { _show = null; };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-fade-in px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${
            t.type === 'error'
              ? 'bg-red-500/90 text-white'
              : 'bg-emerald-500/90 text-white'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
