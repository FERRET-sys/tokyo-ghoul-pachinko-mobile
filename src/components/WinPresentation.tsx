import React, { useEffect, useState } from 'react';
import type { WinInfo } from '../hooks/usePachinko';
import './WinPresentation.css';

interface WinPresentationProps {
  winInfo: WinInfo | null;
  completeWin: () => void;
  isActive: boolean;
}

export const WinPresentation: React.FC<WinPresentationProps> = ({ winInfo, completeWin, isActive }) => {
  const skipBokuwa = winInfo?.isCinematic || false;
  
  const [displayPayout, setDisplayPayout] = useState(0);
  const [isPopping, setIsPopping] = useState(false);

  // Auto-complete win presentation
  useEffect(() => {
    if (!isActive) return;
    const duration = skipBokuwa ? 4500 : 10500; // スキップ時は4.5秒で終了
    const timer = setTimeout(() => {
      completeWin();
    }, duration);
    return () => clearTimeout(timer);
  }, [completeWin, isActive, skipBokuwa]);

  // 出玉のカウントアップ演出
  useEffect(() => {
    if (!isActive || !winInfo) return;
    setDisplayPayout(0);
    setIsPopping(false);

    const delay = skipBokuwa ? 500 : 6000;
    const duration = 2000; // カウントアップにかける時間 (2秒)
    const startTime = Date.now() + delay;

    const timer = setInterval(() => {
      const now = Date.now();
      if (now < startTime) return;

      const elapsed = now - startTime;
      if (elapsed >= duration) {
        setDisplayPayout(winInfo.payout);
        setIsPopping(true);
        clearInterval(timer);
        
        setTimeout(() => setIsPopping(false), 500);
      } else {
        const progress = elapsed / duration;
        // easeOutQuart 減速しながらカウントアップ
        const easeOut = 1 - Math.pow(1 - progress, 4);
        setDisplayPayout(Math.floor(easeOut * winInfo.payout));
      }
    }, 30);

    return () => clearInterval(timer);
  }, [isActive, winInfo, skipBokuwa]);

  if (!isActive || !winInfo) return null;

  return (
    <div className={`win-presentation-container ${skipBokuwa ? 'skip-bokuwa' : ''}`}>
      <div className="rainbow-bg"></div>
      <div className="text-bokuwa">僕は</div>
      <div className="text-ghoul">喰種だ</div>
      <div className="text-payout">
        <span className={`payout-number ${isPopping ? 'pop-animation' : ''}`}>
          {displayPayout}
        </span>
        <span className="payout-suffix"> 獲得</span>
      </div>
    </div>
  );
};
