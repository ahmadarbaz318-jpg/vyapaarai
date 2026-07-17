import React from 'react';
import Modal from './Modal.jsx';
import { FiAlertTriangle } from 'react-icons/fi';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', description, confirmLabel = 'Confirm', danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center gap-3">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${danger ? 'bg-red-50 text-danger' : 'bg-blue-50 text-primary'}`}>
          <FiAlertTriangle className="text-2xl" />
        </div>
        <p className="text-sm text-slate-500">{description}</p>
        <div className="flex gap-3 w-full mt-2">
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 text-sm rounded-xl font-semibold text-white transition ${danger ? 'bg-danger hover:bg-red-600' : 'btn-primary'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
