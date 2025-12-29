
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, X, ShieldAlert } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'success';
  requireTextConfirmation?: boolean; // تفعيل الكتابة للتأكيد
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, type = 'danger',
  requireTextConfirmation = false
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      setError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireTextConfirmation && confirmText !== 'حذف') {
      setError(true);
      return;
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
            type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
          }`}>
            {requireTextConfirmation ? <ShieldAlert size={32} /> : (type === 'danger' ? <AlertCircle size={32} /> : <CheckCircle2 size={32} />)}
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">{message}</p>

          {requireTextConfirmation && (
            <div className="space-y-3 text-right">
              <label className="text-xs font-bold text-slate-400 mr-2">اكتب كلمة "حذف" للتأكيد:</label>
              <input 
                type="text"
                autoFocus
                className={`w-full px-4 py-3 bg-slate-50 border ${error ? 'border-red-500 bg-red-50' : 'border-slate-200'} rounded-2xl outline-none focus:ring-2 focus:ring-red-500 text-center font-bold`}
                placeholder="كلمة التأكيد هنا"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value);
                  if (e.target.value === 'حذف') setError(false);
                }}
              />
              {error && <p className="text-[10px] text-red-500 font-bold pr-2">يجب كتابة كلمة "حذف" بدقة للمتابعة</p>}
            </div>
          )}
        </div>
        <div className="p-6 bg-slate-50 flex gap-3">
          <button 
            onClick={handleConfirm}
            className={`flex-1 py-3 rounded-2xl font-bold text-white transition-all shadow-lg active:scale-95 ${
              type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
            }`}
          >
            {confirmLabel}
          </button>
          <button 
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 transition-all"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
