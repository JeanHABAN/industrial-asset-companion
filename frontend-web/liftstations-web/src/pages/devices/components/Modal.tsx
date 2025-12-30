import React from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function Modal({ open, title, onClose, children, footer }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white text-slate-900 rounded-xl shadow-xl w-[min(680px,90vw)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
