import React from 'react';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative w-full max-w-[520px] rounded-[14px] bg-white shadow-[0px_10px_25px_rgba(0,0,0,0.15)] border border-[#E5E7EB] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[16px] sm:text-[18px] font-bold text-[#101828]" style={{ fontFamily: 'Arimo, sans-serif' }}>
              {title}
            </h3>
            {message && (
              <p className="mt-2 text-[13px] sm:text-[14px] text-[#6A7282]" style={{ fontFamily: 'Arimo, sans-serif' }}>
                {message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-50 text-[#6A7282]"
            aria-label="Close"
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-5 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-[10px] border border-[#D1D5DC] text-[#364153] text-[14px] font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Arimo, sans-serif' }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2.5 rounded-[10px] text-white text-[14px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
              danger ? 'bg-[#FF0000] hover:bg-[#D60000]' : 'bg-[#2ECC71] hover:bg-[#27AE60]'
            }`}
            style={{ fontFamily: 'Arimo, sans-serif' }}
          >
            {loading ? 'Please wait...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

