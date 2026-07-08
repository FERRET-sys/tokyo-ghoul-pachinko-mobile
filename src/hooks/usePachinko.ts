import React, { useState, useEffect, useCallback } from 'react';
import { SPECS } from '../constants/pachinkoSpecs';

export type GameState = 'NORMAL' | 'RUSH';
export type SubState = 'IDLE' | 'SPINNING' | 'PRE_WIN_CINEMATIC' | 'WIN_PRESENTATION' | 'CHARGE';
export type ReserveColor = 'white' | 'blinking' | 'blue' | 'green' | 'kaneki-unbroken' | 'purple' | 'red' | 'gold' | 'kaneki-broken' | 'rainbow';

export interface SpinInfo {
  isWin: boolean;
  isReach: boolean;
  finalReels: string[];
  pseudoCount: number;
  hasPseudoAnim: boolean;
}

export interface ReserveEvent {
  id: string;
  color: ReserveColor;
}

export interface WinInfo {
  type: string;
  payout: number;
  nextState: GameState;
  isCinematic?: boolean;
  isCharge?: boolean;
}

export interface SpinData {
  id: string;
  isWin: boolean;
  isReach: boolean;
  isCharge: boolean;
  nextWinInfo: WinInfo | null;
  finalReels: string[];
  color: ReserveColor;
  pseudoCount: number;
  hasPseudoAnim: boolean;
}

function generateSpinData(gameState: GameState): SpinData {
  let isWin = false;
  let isCharge = false;
  let isReach = false;
  let nextWinInfo: WinInfo | null = null;
  let finalReels = ['1', '2', '3'];

  if (gameState === 'NORMAL') {
    isWin = Math.random() < 1 / SPECS.NORMAL_PROBABILITY;
    isCharge = !isWin && Math.random() < 1 / SPECS.CHARGE_PROBABILITY;
    
    if (isWin) {
      isReach = true;
      if (Math.random() < 0.5) {
        nextWinInfo = { type: 'RUSH_ENTRY', payout: SPECS.PAYOUT_1500, nextState: 'RUSH', isCinematic: true };
        const odd = ['1', '3', '5', '7'][Math.floor(Math.random() * 4)];
        finalReels = [odd, odd, odd];
      } else {
        nextWinInfo = { type: 'NORMAL_WIN', payout: SPECS.PAYOUT_1500, nextState: 'NORMAL', isCinematic: false };
        const even = ['2', '4', '6', '8'][Math.floor(Math.random() * 4)];
        finalReels = [even, even, even];
      }
    } else if (isCharge) {
      nextWinInfo = { type: 'CHARGE', payout: SPECS.PAYOUT_CHARGE, nextState: 'NORMAL', isCharge: true };
      finalReels = ['1', '3', '5'];
    } else {
      isReach = Math.random() < 0.05;
      if (isReach) {
        const reachNumber = Math.floor(Math.random() * 9) + 1;
        const missNumber = (reachNumber % 9) + 1;
        finalReels = [reachNumber.toString(), missNumber.toString(), reachNumber.toString()];
      } else {
        finalReels = [
          (Math.floor(Math.random() * 9) + 1).toString(),
          (Math.floor(Math.random() * 9) + 1).toString(),
          (Math.floor(Math.random() * 9) + 1).toString()
        ];
        if (finalReels[0] === finalReels[2] || (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2])) {
          finalReels[1] = ((parseInt(finalReels[1]) % 9) + 1).toString();
        }
      }
    }
  } else {
    isWin = Math.random() < 1 / SPECS.RUSH_PROBABILITY;
    if (isWin) {
      isReach = true;
      if (Math.random() < 0.03) {
        nextWinInfo = { type: 'RUSH_6000', payout: SPECS.PAYOUT_6000, nextState: 'RUSH', isCinematic: false };
        finalReels = ['7', '7', '7'];
      } else {
        nextWinInfo = { type: 'RUSH_3000', payout: SPECS.PAYOUT_3000, nextState: 'RUSH', isCinematic: false };
        finalReels = ['3', '3', '3'];
      }
    } else {
      finalReels = [
        (Math.floor(Math.random() * 9) + 1).toString(),
        (Math.floor(Math.random() * 9) + 1).toString(),
        (Math.floor(Math.random() * 9) + 1).toString()
      ];
      if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
        finalReels[2] = ((parseInt(finalReels[2]) % 9) + 1).toString();
      }
    }
  }

  let color: ReserveColor = 'white';
  const randColor = Math.random();
  
  if (gameState === 'RUSH') {
    color = 'blinking';
  } else {
    if (isWin) {
      if (nextWinInfo?.nextState === 'RUSH' && randColor < 0.1) color = 'rainbow';
      else if (randColor < 0.25) color = 'kaneki-broken';
      else if (randColor < 0.55) color = 'gold';
      else if (randColor < 0.80) color = 'red';
      else if (randColor < 0.90) color = 'purple';
      else if (randColor < 0.92) color = 'kaneki-unbroken';
      else if (randColor < 0.95) color = 'green';
      else if (randColor < 0.97) color = 'blue';
      else if (randColor < 0.99) color = 'blinking';
      else color = 'white';
    } else if (isReach) {
      if (randColor < 0.01) color = 'gold';
      else if (randColor < 0.06) color = 'red';
      else if (randColor < 0.20) color = 'purple';
      else if (randColor < 0.35) color = 'kaneki-unbroken';
      else if (randColor < 0.65) color = 'green';
      else if (randColor < 0.85) color = 'blue';
      else if (randColor < 0.95) color = 'blinking';
      else color = 'white';
    } else if (isCharge) {
      if (randColor < 0.1) color = 'purple';
      else if (randColor < 0.4) color = 'green';
      else if (randColor < 0.7) color = 'blue';
      else if (randColor < 0.9) color = 'blinking';
      else color = 'white';
    } else {
      if (randColor < 0.05) color = 'blue';
      else if (randColor < 0.2) color = 'blinking';
      else color = 'white';
    }
  }

  let pseudoCount = 0;
  const randPseudo = Math.random();
  if (gameState === 'NORMAL') {
    if (isWin) {
      if (randPseudo < 0.6) pseudoCount = 3;
      else if (randPseudo < 0.7) pseudoCount = 2;
    } else if (isReach) {
      if (randPseudo < 0.2) pseudoCount = 3;
      else if (randPseudo < 0.5) pseudoCount = 2;
    } else if (!isCharge) {
      if (randPseudo < 0.02) pseudoCount = 2;
    }
  }

  const hasPseudoAnim = gameState === 'NORMAL' && (pseudoCount >= 1 || (pseudoCount === 0 && Math.random() < 0.02));

  return {
    id: Date.now().toString() + Math.random().toString(),
    isWin,
    isCharge,
    isReach,
    nextWinInfo,
    finalReels,
    color,
    pseudoCount,
    hasPseudoAnim
  };
}

export function usePachinko() {
  const [gameState, setGameState] = useState<GameState>('NORMAL');
  const [subState, setSubState] = useState<SubState>('IDLE');
  const [reserveEvent, setReserveEvent] = useState<ReserveEvent | null>(null);
  
  // Game stats
  const [balls, setBalls] = useState(1000);
  const [reserveQueue, setReserveQueue] = useState<SpinData[]>([]);
  const reserve = reserveQueue.length; // 保留 (max 4)
  const [spins, setSpins] = useState(0); // 通常時の回転数
  const [rushSpins, setRushSpins] = useState(0); // RUSH中の回転数 (max 130)
  
  // Current session stats
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalPayout, setTotalPayout] = useState(0);
  const [money, setMoney] = useState(10000); // 1万円からスタート
  
  // Win info for presentation
  const [winInfo, setWinInfo] = useState<WinInfo | null>(null);
  
  // Current spin info
  const [spinInfo, setSpinInfo] = useState<SpinInfo | null>(null);

  // User presentation triggers (hooks for UI animations)
  const [presentationTrigger, setPresentationTrigger] = useState<number>(0);
  const [isReadyForNextSpin, setIsReadyForNextSpin] = useState(true);

  const [autoShoot, setAutoShoot] = useState(false);

  const toggleAutoShoot = useCallback(() => {
    setAutoShoot(prev => !prev);
  }, []);

  const [speedMode, setSpeedMode] = useState<0 | 1 | 2>(0);
  const savedSpeedModeRef = React.useRef<0 | 1 | 2 | null>(null);
  const [autoLend, setAutoLend] = useState(false);

  const toggleSpeed = useCallback(() => {
    setSpeedMode(prev => (prev + 1) % 3 as 0 | 1 | 2);
  }, []);

  const toggleAutoLend = useCallback(() => {
    setAutoLend(prev => !prev);
  }, []);

  // 台の釘状態（±5%のランダムなブレをページロード時に決定）
  const [nailState] = useState(() => {
    const variance = 0.95 + Math.random() * 0.1; // 0.95 to 1.05
    return variance;
  });

  // Shoot a ball into the start hole
  const shoot = useCallback(() => {
    // 演出中（WIN_PRESENTATION, PRE_WIN_CINEMATIC, CHARGE等）は打ち出し無効
    if (subState !== 'IDLE' && subState !== 'SPINNING') return;
    
    // 保留が4個（満タン）の場合は打ち出しを停止（保留止め）
    if (reserveQueue.length >= 4) return;

    let isEnter = false;
    let newSpin: SpinData | null = null;

    setBalls((prev) => {
      if (prev <= 0) return 0;
      
      let actualProb;
      if (gameState === 'RUSH') {
        actualProb = 1.0;
      } else {
        const baseProb = SPECS.BASE_SPINS_PER_1000YEN / 250;
        actualProb = baseProb * nailState;
      }

      if (Math.random() < actualProb) {
        isEnter = true;
        newSpin = generateSpinData(gameState);
        setReserveQueue((q) => {
          if (q.length >= 4) return q;
          return [...q, newSpin!];
        });
      }
      return prev - 1;
    });

    if (isEnter && newSpin) {
      if (newSpin.color !== 'white' && newSpin.color !== 'blinking') {
        setReserveEvent({ id: newSpin.id, color: newSpin.color });
        setTimeout(() => {
          setReserveEvent(prev => prev?.id === newSpin.id ? null : prev);
        }, 1500);
      }
    }
  }, [subState, nailState, gameState, reserveQueue.length]);

  // Auto shooting loop
  useEffect(() => {
    let interval: number;
    // 稼働条件：IDLEまたはSPINNINGの時のみ。
    if (autoShoot && (subState === 'IDLE' || subState === 'SPINNING')) {
      const shootInterval = speedMode === 2 ? 50 : speedMode === 1 ? 200 : 600;
      interval = window.setInterval(() => {
        if (balls <= 0) {
          if (autoLend && money >= 500) {
            setMoney(m => m - 500);
            setBalls(b => b + 125);
          }
        } else if (reserve < 4) {
          shoot();
        }
      }, shootInterval);
    }
    return () => clearInterval(interval);
  }, [autoShoot, balls, subState, shoot, speedMode, autoLend, money, reserve]);

  const spinTimerRef = React.useRef<number | null>(null);

  // Main game loop
  useEffect(() => {
    const processSpin = () => {
      if (subState !== 'IDLE' || reserveQueue.length === 0 || !isReadyForNextSpin) return;

      // Start spinning
      setSubState('SPINNING');
      const currentSpin = reserveQueue[0];
      setReserveQueue((prev) => prev.slice(1));
      setIsReadyForNextSpin(false);

      let nextRushSpins = rushSpins;
      if (gameState === 'NORMAL') {
        setSpins((prev) => prev + 1);
      } else {
        nextRushSpins += 1;
        setRushSpins(nextRushSpins);
      }

      // Roll RNG (Already done in generateSpinData!)
      const { isWin, isCharge, isReach, nextWinInfo, finalReels, pseudoCount, hasPseudoAnim } = currentSpin;
      
      setSpinInfo({ isWin, isReach, finalReels, pseudoCount, hasPseudoAnim });
      if (nextWinInfo) {
        setWinInfo(nextWinInfo);
      }
      
      // Simulate spin duration
      let spinDuration = isWin ? 4000 : isReach ? 3000 : 1000; 
      if (pseudoCount === 3) spinDuration += 12000;
      else if (pseudoCount === 2) spinDuration += 8000;
      else if (pseudoCount === 1) spinDuration += 4000;
      
      if (!hasPseudoAnim) {
        if (speedMode === 1) spinDuration = isWin ? 2000 : isReach ? 1500 : 500;
        if (speedMode === 2) spinDuration = isWin ? 500 : isReach ? 300 : 100;
      }
      if (isCharge) spinDuration = 500; // チャージは高速
      
      // 演出が来たときは倍速を解除して通常速度に戻す
      if (isWin || isCharge) {
        if (speedMode > 0) {
          savedSpeedModeRef.current = speedMode;
        }
        setSpeedMode(0);
      }
      
      if (spinTimerRef.current !== null) {
        clearTimeout(spinTimerRef.current);
      }
      
      spinTimerRef.current = window.setTimeout(() => {
        if (isWin) {
          if (gameState === 'NORMAL' && nextWinInfo?.isCinematic) {
            setSubState('PRE_WIN_CINEMATIC');
            setTimeout(() => {
              handleWin(gameState, nextWinInfo);
            }, 17500);
          } else {
            handleWin(gameState, nextWinInfo);
          }
        } else if (isCharge) {
          setSubState('CHARGE');
          setWinInfo(nextWinInfo);
          setTimeout(() => {
            setBalls((prev) => prev + (nextWinInfo?.payout || 0));
            setTotalPayout((prev) => prev + (nextWinInfo?.payout || 0));
            setSpins(0); // 小当り(チャージ)で回転数リセット
            setSubState('IDLE');
            setWinInfo(null);
            setIsReadyForNextSpin(true); // フリーズバグ修正
            if (savedSpeedModeRef.current !== null) {
              setSpeedMode(savedSpeedModeRef.current);
              savedSpeedModeRef.current = null;
            }
          }, 3000);
        } else {
          handleLose(gameState, nextRushSpins);
        }
      }, spinDuration);
    };

    if (reserveQueue.length > 0 && subState === 'IDLE' && isReadyForNextSpin) {
      processSpin();
    }
  }, [subState, reserveQueue, gameState, isReadyForNextSpin, rushSpins, speedMode]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (spinTimerRef.current !== null) {
        clearTimeout(spinTimerRef.current);
      }
    };
  }, []);

  const handleWin = (currentState: GameState, winInfoArg?: WinInfo | null) => {
    setSubState('WIN_PRESENTATION');
    if (currentState === 'NORMAL') {
      setCurrentStreak(1);
      setTotalPayout(0); // 新しい初当たりでリセット
    } else {
      setCurrentStreak((prev) => prev + 1);
    }
    
    // 強制大当りなどのためにwinInfoArgがない場合は既存を使う
    if (winInfoArg) {
      setWinInfo(winInfoArg);
    }
    
    setPresentationTrigger(Date.now());
  };

  const handleLose = (currentState: GameState, currentRushSpins: number) => {
    if (currentState === 'RUSH') {
      if (currentRushSpins >= SPECS.RUSH_MAX_SPINS) {
        // RUSH終了
        setGameState('NORMAL');
        setRushSpins(0);
        setCurrentStreak(0);
      }
    }
    const stopDelay = speedMode === 2 ? 50 : 200; // Small delay after reels visually stop
    setTimeout(() => {
      setSubState('IDLE');
      setIsReadyForNextSpin(true);
    }, stopDelay);
  };

  // Called by UI when win presentation is over
  const completeWin = useCallback(() => {
    if (!winInfo) return;
    
    setBalls((prev) => prev + winInfo.payout);
    setTotalPayout((prev) => prev + winInfo.payout);
    setGameState(winInfo.nextState);
    
    if (winInfo.nextState === 'RUSH') {
      setRushSpins(0);
    }
    
    setWinInfo(null);
    setSubState('IDLE');
    setIsReadyForNextSpin(true);
    if (savedSpeedModeRef.current !== null) {
      setSpeedMode(savedSpeedModeRef.current);
      savedSpeedModeRef.current = null;
    }
  }, [winInfo]);

  // For testing/debugging
  const addBalls = (amount: number) => {
    if (amount === 125) {
      if (money < 500) return;
      setMoney(prev => prev - 500);
    }
    setBalls(prev => prev + amount);
  };

  const earnMoney = (amount: number) => {
    setMoney(prev => prev + amount);
  };

  const cashOut = useCallback(() => {
    if (balls <= 0) return;
    setMoney(prev => prev + Math.floor(balls * 3.57)); // 28玉交換 (約3.57円/玉)
    setBalls(0);
  }, [balls]);

  const forceWin = useCallback((type: 'CINEMATIC' | 'NORMAL' | 'CHARGE' = 'CINEMATIC') => {
    if (spinTimerRef.current !== null) {
      clearTimeout(spinTimerRef.current);
    }
    
    if (type === 'CINEMATIC') {
      const win: WinInfo = { type: 'RUSH_ENTRY', payout: SPECS.PAYOUT_1500, nextState: 'RUSH', isCinematic: true };
      setWinInfo(win);
      setSpinInfo({ isWin: true, isReach: true, finalReels: ['7', '7', '7'] });
      setSubState('PRE_WIN_CINEMATIC');
      setTimeout(() => {
        handleWin('NORMAL', win);
      }, 17500);
    } else if (type === 'CHARGE') {
      const win: WinInfo = { type: 'CHARGE', payout: SPECS.PAYOUT_CHARGE, nextState: 'NORMAL', isCharge: true };
      setWinInfo(win);
      setSubState('CHARGE');
      setTimeout(() => {
        setBalls((prev) => prev + win.payout);
        setTotalPayout((prev) => prev + win.payout);
        setSpins(0);
        setSubState('IDLE');
        setWinInfo(null);
        setIsReadyForNextSpin(true);
        if (savedSpeedModeRef.current !== null) {
          setSpeedMode(savedSpeedModeRef.current);
          savedSpeedModeRef.current = null;
        }
      }, 3000);
    } else {
      const win: WinInfo = { type: 'NORMAL_WIN', payout: SPECS.PAYOUT_1500, nextState: 'NORMAL', isCinematic: false };
      setWinInfo(win);
      setSpinInfo({ isWin: true, isReach: true, finalReels: ['3', '3', '3'] });
      setSubState('WIN_PRESENTATION');
      setPresentationTrigger(Date.now());
    }
  }, [gameState]);

  return {
    gameState,
    subState,
    balls,
    reserveQueue,
    reserveEvent,
    spins,
    rushSpins,
    currentStreak,
    totalPayout,
    winInfo,
    spinInfo,
    presentationTrigger,
    autoShoot,
    toggleAutoShoot,
    speedMode,
    toggleSpeed,
    shoot,
    completeWin,
    addBalls,
    forceWin,
    money,
    autoLend,
    toggleAutoLend,
    earnMoney,
    cashOut
  };
}
