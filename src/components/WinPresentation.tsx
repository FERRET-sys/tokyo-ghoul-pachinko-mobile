import React, { useEffect } from 'react';
import type { WinInfo } from '../hooks/usePachinko';
import './WinPresentation.css';

interface WinPresentationProps {
  winInfo: WinInfo | null;
  startPayout: () => void;
  isActive: boolean;
}

export const WinPresentation: React.FC<WinPresentationProps> = ({ winInfo, startPayout, isActive }) => {
  const skipBokuwa = winInfo?.isCinematic || false;

  // Auto-complete win presentation
  useEffect(() => {
    if (!isActive) return;
    const duration = skipBokuwa ? 2500 : 8500; // 短くしてすぐアタッカーへ
    const timer = setTimeout(() => {
      startPayout();
    }, duration);
    return () => clearTimeout(timer);
  }, [startPayout, isActive, skipBokuwa]);

  if (!isActive || !winInfo) return null;

  return (
    <div className={`win-presentation-container ${skipBokuwa ? 'skip-bokuwa' : ''}`}>
      <div className="rainbow-bg"></div>
      <div className="text-bokuwa">僕は</div>
      <div className="text-ghoul">喰種だ</div>
      <div className="text-payout">
        <span className="payout-suffix" style={{ fontSize: '1.2rem', marginTop: '40px' }}>
          右を狙え！
        </span>
      </div>
    </div>
  );
};
