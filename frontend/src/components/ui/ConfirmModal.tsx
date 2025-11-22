/**
 * Confirm Modal Component
 * Modal reutilizable para confirmaciones
 */

import type { ReactNode } from 'react';
import { IconX, IconAlertCircle } from '@tabler/icons-react';
import Button from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'ghost';
  icon?: ReactNode;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'primary',
  icon,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-200">
          <div className="flex items-start gap-3">
            {icon || (
              <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <IconAlertCircle size={24} className="text-blue-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {typeof message === 'string' ? (
            <p className="text-gray-600 leading-relaxed">{message}</p>
          ) : (
            message
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
