import React, { useEffect, useState } from 'react';
import type { SpinInfo } from '../hooks/usePachinko';
import './PseudoRen.css';

interface PseudoRenProps {
  isActive: boolean;
  spinInfo: SpinInfo | null;
}

export const PseudoRen: React.FC<PseudoRenProps> = ({ isActive, spinInfo }) => {
  const [phase, setPhase] = useState<number>(0);
  const [showFail, setShowFail] = useState(false);

  useEffect(() => {
    if (!isActive || !spinInfo) {
      setPhase(0);
      setShowFail(false);
      return;
    }

    const pseudo = spinInfo.pseudoCount;
    if (!spinInfo.hasPseudoAnim) return;

    setPhase(1); // Scatter 1
    
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => {
      if (pseudo === 0) {
        setShowFail(true);
      } else {
        setPhase(2); // Keizoku x1
      }
    }, 1500));

    if (pseudo >= 1) {
      timers.push(setTimeout(() => {
        setPhase(3); // Scatter 2
      }, 4000));

      timers.push(setTimeout(() => {
        if (pseudo === 1) {
          setShowFail(true);
        } else {
          setPhase(4); // Keizoku x2
        }
      }, 5500));
    }

    if (pseudo >= 2) {
      timers.push(setTimeout(() => {
        setPhase(5); // Scatter 3
      }, 8000));
      timers.push(setTimeout(() => {
        if (pseudo === 2) {
          setShowFail(true);
        } else {
          setPhase(6); // Keizoku x3
        }
      }, 9500));
    }

    if (pseudo >= 3) {
      timers.push(setTimeout(() => {
        setPhase(7); // Scatter 4
      }, 12000));
      timers.push(setTimeout(() => {
        setShowFail(true); // Final evaporate before reach
      }, 13500));
    }

    return () => timers.forEach(clearTimeout);
  }, [isActive, spinInfo]);

  if (!isActive || phase === 0) return null;

  return (
    <div className="pseudo-ren-container">
      {/* 散らばった文字 */}
      {(phase === 1 || phase === 3 || phase === 5 || phase === 7) && !showFail && (
        <div className="scattered-text">
          <span className="char char1">間</span>
          <span className="char char2">違</span>
          <span className="char char3">っ</span>
          <span className="char char4">て</span>
          <span className="char char5">い</span>
          <span className="char char6">る</span>
        </div>
      )}

      {/* 蒸発（失敗） */}
      {showFail && (
        <div className="evaporate-text">
          <span className="char char1">間</span>
          <span className="char char2">違</span>
          <span className="char char3">っ</span>
          <span className="char char4">て</span>
          <span className="char char5">い</span>
          <span className="char char6">る</span>
        </div>
      )}

      {/* 結合成功（継続） */}
      {(phase === 2 || phase === 4 || phase === 6) && (
        <div className="combined-success">
          <div className="keizoku-bg">継続</div>
          <div className="multiplier-text">×{phase === 2 ? '1' : phase === 4 ? '2' : '3'}</div>
          <div className="vertical-box">
            <div className="vertical-text">間違っている</div>
          </div>
        </div>
      )}
    </div>
  );
};
