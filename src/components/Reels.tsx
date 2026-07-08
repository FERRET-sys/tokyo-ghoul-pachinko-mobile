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
      const pCount = spinInfo.pseudoCount || 0;
      
      let finalStops = spinInfo.finalReels;
      let pseudo1Stops = [(Math.floor(Math.random() * 9) + 1).toString(), (Math.floor(Math.random() * 9) + 1).toString(), (Math.floor(Math.random() * 9) + 1).toString()];
      let pseudo2Stops = [(Math.floor(Math.random() * 9) + 1).toString(), (Math.floor(Math.random() * 9) + 1).toString(), (Math.floor(Math.random() * 9) + 1).toString()];
      let pseudo3Stops = [(Math.floor(Math.random() * 9) + 1).toString(), (Math.floor(Math.random() * 9) + 1).toString(), (Math.floor(Math.random() * 9) + 1).toString()];
      
      if (pseudo1Stops[0] === pseudo1Stops[1] && pseudo1Stops[1] === pseudo1Stops[2]) pseudo1Stops[2] = ((parseInt(pseudo1Stops[2]) % 9) + 1).toString();
      if (pseudo2Stops[0] === pseudo2Stops[1] && pseudo2Stops[1] === pseudo2Stops[2]) pseudo2Stops[2] = ((parseInt(pseudo2Stops[2]) % 9) + 1).toString();
      if (pseudo3Stops[0] === pseudo3Stops[1] && pseudo3Stops[1] === pseudo3Stops[2]) pseudo3Stops[2] = ((parseInt(pseudo3Stops[2]) % 9) + 1).toString();

      setReels(pCount > 0 ? pseudo1Stops : finalStops);
      setReelSpinning([true, true, true]);

      const L_STOP = speedMode === 2 ? 100 : speedMode === 1 ? 500 : 1000;
      const R_STOP = speedMode === 2 ? 200 : speedMode === 1 ? 1000 : 2000;
      
      let timers: NodeJS.Timeout[] = [];

      timers.push(setTimeout(() => setReelSpinning(prev => [false, prev[1], prev[2]]), L_STOP));
      timers.push(setTimeout(() => setReelSpinning(prev => [prev[0], prev[1], false]), R_STOP));

      const scheduleReachTease = (baseDelay: number) => {
        if (!spinInfo.isReach) {
          timers.push(setTimeout(() => setReelSpinning(prev => [prev[0], false, prev[2]]), baseDelay + R_STOP));
          return;
        }
        
        // リーチ煽り（中リールのコマ送り）
        timers.push(setTimeout(() => {
          setIsVibrating(true);
          // 停止予定の1つ前の数字を表示（当落の直前）
          const targetNum = parseInt(finalStops[1]);
          const prevNum = targetNum === 1 ? 9 : targetNum - 1;
          setReels(prev => [prev[0], prevNum.toString(), prev[2]]);
          setReelSpinning(prev => [prev[0], false, prev[2]]); // 一旦停止して見せる
        }, baseDelay + R_STOP));
        
        // 最終結果を表示
        timers.push(setTimeout(() => {
          setReels(prev => [prev[0], finalStops[1], prev[2]]);
        }, baseDelay + R_STOP + 800)); // 0.8秒後に最終結果に切り替え
      };

      if (pCount === 0) {
        scheduleReachTease(0);
      }

      if (pCount >= 1) {
        timers.push(setTimeout(() => {
          setReels(pCount > 1 ? pseudo2Stops : finalStops);
          setReelSpinning([true, true, true]);
        }, 4000));
        timers.push(setTimeout(() => setReelSpinning(prev => [false, prev[1], prev[2]]), 4000 + L_STOP));
        timers.push(setTimeout(() => setReelSpinning(prev => [prev[0], prev[1], false]), 4000 + R_STOP));
        if (pCount === 1) scheduleReachTease(4000);
      }

      if (pCount >= 2) {
        timers.push(setTimeout(() => {
          setReels(pCount > 2 ? pseudo3Stops : finalStops);
          setReelSpinning([true, true, true]);
        }, 8000));
        timers.push(setTimeout(() => setReelSpinning(prev => [false, prev[1], prev[2]]), 8000 + L_STOP));
        timers.push(setTimeout(() => setReelSpinning(prev => [prev[0], prev[1], false]), 8000 + R_STOP));
        if (pCount === 2) scheduleReachTease(8000);
      }

      if (pCount >= 3) {
        timers.push(setTimeout(() => {
          setReels(finalStops);
          setReelSpinning([true, true, true]);
        }, 12000));
        timers.push(setTimeout(() => setReelSpinning(prev => [false, prev[1], prev[2]]), 12000 + L_STOP));
        timers.push(setTimeout(() => setReelSpinning(prev => [prev[0], prev[1], false]), 12000 + R_STOP));
        if (pCount === 3) scheduleReachTease(12000);
      }

      return () => timers.forEach(clearTimeout);
    } else if (subState === 'IDLE' && spinInfo) {
      setReelSpinning([false, false, false]);
      setIsVibrating(false);
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
