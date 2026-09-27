import React from 'react';
import { MT5AccountCenterModal } from './MT5AccountCenterModal';
import { ConnectedTradingAccount } from '@/types/mt5';

export interface ConnectMT5ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (account?: ConnectedTradingAccount) => void;
  targetDashboardId?: string;
  initialTab?: 'connect' | 'create';
}

/**
 * ConnectMT5Modal - MT5 Account Center 2.0
 * Fully backward-compatible wrapper around the upgraded MT5 Account Center.
 */
export function ConnectMT5Modal(props: ConnectMT5ModalProps) {
  return (
    <MT5AccountCenterModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      onSuccess={props.onSuccess}
      targetDashboardId={props.targetDashboardId}
      initialTab={props.initialTab || 'connect'}
    />
  );
}

export { MT5AccountCenterModal };
