import React, { useState, useEffect } from 'react';
import type { SubState, SpinInfo, GameState } from '../hooks/usePachinko';
import './Reels.css';

const Reel = ({ spinning, value }: { spinning: boolean, value: string }) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '1'];
  const index = value === '-' ? 0 : parseInt(value) - 1;

  return (
    <div className="reel">
      <div 
        className={`reel-strip ${spinning ? 'spinning' : ''}`}
        style={spinning ? undefined : { transform: `translateY(calc(-100% / 10 * ${index}))` }}
      >
        {digits.map((n, i) => (
          <div key={i} className="reel-item">
            <div 
              className="sprite" 
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(/${n}.png)`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

interface ReelsProps {
  subState: SubState;
  spinInfo: SpinInfo | null;
  speedMode: 0 | 1 | 2;
  gameState: GameState;
}

export const Reels: React.FC<ReelsProps> = ({ subState, spinInfo, speedMode }) => {
  const [reelSpinning, setReelSpinning] = useState([false, false, false]);
  const [reels, setReels] = useState(['1', '1', '1']);
  const [isVibrating, setIsVibrating] = useState(false);

  useEffect(() => {
    if (subState === 'SPINNING' && spinInfo) {
      setReels(spinInfo.finalReels);
      setReelSpinning([true, true, true]);

      const L_STOP = speedMode === 2 ? 100 : speedMode === 1 ? 500 : 1000;
      const R_STOP = speedMode === 2 ? 200 : speedMode === 1 ? 1000 : 2000;

      // 1. 左停止
      const t1 = setTimeout(() => {
        setReelSpinning(prev => [false, prev[1], prev[2]]);
      }, L_STOP);

      // 2. 右停止
      const t2 = setTimeout(() => {
        setReelSpinning(prev => [prev[0], prev[1], false]);
        
        // 3. リーチの場合のタメ演出（バイブ＆フラッシュ）
        if (spinInfo.isReach) {
          setIsVibrating(true);
          setTimeout(() => setIsVibrating(false), 800);
        }
      }, R_STOP);

      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      // STOPPINGやWIN_PRESENTATIONに入ったらすべて停止
      setReelSpinning([false, false, false]);
    }
  }, [subState, spinInfo, speedMode]);

  return (
    <>
      <div className={`reels-container ${isVibrating ? 'shake-hard' : ''}`}>
        <div className="reels">
          <Reel spinning={reelSpinning[0]} value={reels[0]} />
          <Reel spinning={reelSpinning[1]} value={reels[1]} />
          <Reel spinning={reelSpinning[2]} value={reels[2]} />
        </div>
      </div>
      <div className={`reach-flash ${isVibrating ? 'active' : ''}`}></div>
    </>
  );
};
