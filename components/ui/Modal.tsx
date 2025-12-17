import React from 'react';
import { Icons } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-black/5 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold leading-none tracking-tight">
                    {title}
                </h3>
                <button 
                    onClick={onClose}
                    className="rounded-full p-1 text-slate-400 opacity-70 transition-opacity hover:opacity-100 hover:bg-slate-100"
                >
                    <Icons.X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </div>
        <div className="overflow-y-auto pr-2 -mr-2">
            {children}
        </div>
      </div>
    </div>
  );
};