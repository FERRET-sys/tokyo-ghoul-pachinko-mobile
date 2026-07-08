import { useEffect, useCallback, useRef, useReducer } from 'react';
import { SPECS } from '../constants/pachinkoSpecs';

export type GameState = 'NORMAL' | 'RUSH';
export type SubState = 'IDLE' | 'SPINNING' | 'PRE_WIN_CINEMATIC' | 'WIN_PRESENTATION' | 'PAYOUT' | 'CHARGE';
export type ReserveColor = 'white' | 'blinking' | 'blue' | 'green' | 'kaneki-unbroken' | 'purple' | 'red' | 'gold' | 'kaneki-broken' | 'rainbow';

export interface PayoutState {
  totalRounds: number;
  currentRound: number;
  ballsThisRound: number;
  earnedBalls: number;
  isRoundActive: boolean;
}

export interface SpinInfo {
  isWin: boolean;
  isCharge: boolean;
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
          finalReels[2] = ((parseInt(finalReels[2]) % 9) + 1).toString();
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
      if (finalReels[0] === finalReels[2] || (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2])) {
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
      else if (randPseudo < 0.85) pseudoCount = 1;
    } else if (isReach) {
      if (randPseudo < 0.2) pseudoCount = 3;
      else if (randPseudo < 0.5) pseudoCount = 2;
      else if (randPseudo < 0.75) pseudoCount = 1;
    } else if (!isCharge) {
      if (randPseudo < 0.005) pseudoCount = 2;
      else if (randPseudo < 0.02) pseudoCount = 1;
    }
  }

  const hasPseudoAnim = gameState === 'NORMAL' && (pseudoCount >= 1 || (pseudoCount === 0 && Math.random() < 0.03));

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

// -------------------------------------------------------------
// 1. STATE MACHINE (useReducer)
// -------------------------------------------------------------

export interface PachinkoState {
  gameState: GameState;
  subState: SubState;
  balls: number;
  money: number;
  reserveQueue: SpinData[];
  reserveEvent: ReserveEvent | null;
  spins: number;
  rushSpins: number;
  currentStreak: number;
  totalPayout: number;
  winInfo: WinInfo | null;
  spinInfo: SpinInfo | null;
  payoutState: PayoutState | null;
  presentationTrigger: number;
  autoShoot: boolean;
  speedMode: 0 | 1 | 2;
  savedSpeedMode: 0 | 1 | 2 | null;
  autoLend: boolean;
  isReadyForNextSpin: boolean;
  nailState: number;
}

export type PachinkoAction =
  | { type: 'TOGGLE_AUTO_SHOOT' }
  | { type: 'TOGGLE_SPEED' }
  | { type: 'TOGGLE_AUTO_LEND' }
  | { type: 'SHOOT_BALL'; newSpin: SpinData | null; isEnter: boolean }
  | { type: 'ADD_BALLS'; amount: number }
  | { type: 'EARN_MONEY'; amount: number }
  | { type: 'CASH_OUT' }
  | { type: 'LEND_MONEY' }
  | { type: 'CLEAR_RESERVE_EVENT'; id: string }
  | { type: 'START_SPIN' }
  | { type: 'SPIN_END_LOSE' }
  | { type: 'SPIN_END_CHARGE' }
  | { type: 'SPIN_END_WIN_CINEMATIC' }
  | { type: 'SPIN_END_WIN_NORMAL' }
  | { type: 'START_PAYOUT' }
  | { type: 'PAYOUT_ROUND_START' }
  | { type: 'PAYOUT_TICK' }
  | { type: 'PAYOUT_ROUND_END' }
  | { type: 'CHARGE_COMPLETE' }
  | { type: 'CINEMATIC_COMPLETE' }
  | { type: 'COMPLETE_WIN' }
  | { type: 'READY_FOR_NEXT_SPIN' }
  | { type: 'FORCE_WIN'; winType: 'CINEMATIC' | 'NORMAL' | 'CHARGE' };

const initialState: PachinkoState = {
  gameState: 'NORMAL',
  subState: 'IDLE',
  balls: 1000,
  money: 10000,
  reserveQueue: [],
  reserveEvent: null,
  spins: 0,
  rushSpins: 0,
  currentStreak: 0,
  totalPayout: 0,
  winInfo: null,
  spinInfo: null,
  payoutState: null,
  presentationTrigger: 0,
  autoShoot: false,
  speedMode: 0,
  savedSpeedMode: null,
  autoLend: false,
  isReadyForNextSpin: true,
  nailState: 0.95 + Math.random() * 0.1,
};

function pachinkoReducer(state: PachinkoState, action: PachinkoAction): PachinkoState {
  switch (action.type) {
    case 'TOGGLE_AUTO_SHOOT':
      return { ...state, autoShoot: !state.autoShoot };
    case 'TOGGLE_SPEED':
      return { ...state, speedMode: ((state.speedMode + 1) % 3) as 0 | 1 | 2 };
    case 'TOGGLE_AUTO_LEND':
      return { ...state, autoLend: !state.autoLend };
    
    case 'LEND_MONEY':
      if (state.money >= 500) {
        return { ...state, money: state.money - 500, balls: state.balls + 125 };
      }
      return state;
      
    case 'ADD_BALLS':
      if (action.amount === 125 && state.money >= 500) {
        return { ...state, money: state.money - 500, balls: state.balls + 125 };
      }
      if (action.amount !== 125) {
        return { ...state, balls: state.balls + action.amount };
      }
      return state;
      
    case 'EARN_MONEY':
      return { ...state, money: state.money + action.amount };
      
    case 'CASH_OUT':
      if (state.balls <= 0) return state;
      return { ...state, money: state.money + Math.floor(state.balls * 3.57), balls: 0 };
    
    case 'SHOOT_BALL':
      if (state.balls <= 0) return state;
      if (state.subState !== 'IDLE' && state.subState !== 'SPINNING' && state.subState !== 'PAYOUT' && state.subState !== 'WIN_PRESENTATION' && state.subState !== 'PRE_WIN_CINEMATIC') return state;
      if (state.reserveQueue.length >= 4) return state;

      let newQueue = state.reserveQueue;
      if (action.isEnter && action.newSpin) {
        newQueue = [...state.reserveQueue, action.newSpin];
      }
      return {
        ...state,
        balls: state.balls - 1,
        reserveQueue: newQueue,
        reserveEvent: action.isEnter && action.newSpin && action.newSpin.color !== 'white' && action.newSpin.color !== 'blinking'
          ? { id: action.newSpin.id, color: action.newSpin.color }
          : state.reserveEvent
      };

    case 'CLEAR_RESERVE_EVENT':
      return {
        ...state,
        reserveEvent: state.reserveEvent?.id === action.id ? null : state.reserveEvent
      };

    case 'START_SPIN':
      if (state.subState !== 'IDLE' || state.reserveQueue.length === 0 || !state.isReadyForNextSpin) return state;
      
      const currentSpin = state.reserveQueue[0];
      const nextQueue = state.reserveQueue.slice(1);
      
      const nextRushSpins = state.gameState === 'RUSH' ? state.rushSpins + 1 : state.rushSpins;
      const nextSpins = state.gameState === 'NORMAL' ? state.spins + 1 : state.spins;

      const shouldSaveSpeed = (currentSpin.isWin || currentSpin.isCharge) && state.speedMode > 0;

      return {
        ...state,
        subState: 'SPINNING',
        isReadyForNextSpin: false,
        reserveQueue: nextQueue,
        spins: nextSpins,
        rushSpins: nextRushSpins,
        spinInfo: {
          isWin: currentSpin.isWin,
          isCharge: currentSpin.isCharge,
          isReach: currentSpin.isReach,
          finalReels: currentSpin.finalReels,
          pseudoCount: currentSpin.pseudoCount,
          hasPseudoAnim: currentSpin.hasPseudoAnim
        },
        winInfo: currentSpin.nextWinInfo || state.winInfo,
        savedSpeedMode: shouldSaveSpeed ? state.speedMode : state.savedSpeedMode,
        speedMode: shouldSaveSpeed ? 0 : state.speedMode,
      };

    case 'SPIN_END_LOSE':
      if (state.gameState === 'RUSH' && state.rushSpins >= SPECS.RUSH_MAX_SPINS) {
        return {
          ...state,
          gameState: 'NORMAL',
          rushSpins: 0,
          currentStreak: 0,
          subState: 'IDLE'
        };
      }
      return {
        ...state,
        subState: 'IDLE'
      };

    case 'READY_FOR_NEXT_SPIN':
      return {
        ...state,
        isReadyForNextSpin: true
      };

    case 'SPIN_END_CHARGE':
      return { ...state, subState: 'CHARGE' };

    case 'CHARGE_COMPLETE':
      return {
        ...state,
        balls: state.balls + (state.winInfo?.payout || 0),
        totalPayout: state.totalPayout + (state.winInfo?.payout || 0),
        spins: 0,
        subState: 'IDLE',
        winInfo: null,
        isReadyForNextSpin: true,
        speedMode: state.savedSpeedMode !== null ? state.savedSpeedMode : state.speedMode,
        savedSpeedMode: null
      };

    case 'SPIN_END_WIN_CINEMATIC':
      return { ...state, subState: 'PRE_WIN_CINEMATIC' };

    case 'CINEMATIC_COMPLETE':
      return {
        ...state,
        subState: 'WIN_PRESENTATION',
        currentStreak: state.gameState === 'NORMAL' ? 1 : state.currentStreak + 1,
        totalPayout: state.gameState === 'NORMAL' ? 0 : state.totalPayout,
        presentationTrigger: Date.now()
      };

    case 'SPIN_END_WIN_NORMAL':
      return {
        ...state,
        subState: 'WIN_PRESENTATION',
        currentStreak: state.gameState === 'NORMAL' ? 1 : state.currentStreak + 1,
        totalPayout: state.gameState === 'NORMAL' ? 0 : state.totalPayout,
        presentationTrigger: Date.now()
      };

    case 'START_PAYOUT':
      if (!state.winInfo) return state;
      const totalRounds = Math.ceil(state.winInfo.payout / 150);
      return {
        ...state,
        subState: 'PAYOUT',
        payoutState: {
          totalRounds,
          currentRound: 1,
          ballsThisRound: 0,
          earnedBalls: 0,
          isRoundActive: false
        }
      };

    case 'PAYOUT_ROUND_START':
      if (!state.payoutState) return state;
      return {
        ...state,
        payoutState: { ...state.payoutState, isRoundActive: true, ballsThisRound: 0 }
      };

    case 'PAYOUT_TICK':
      if (!state.payoutState) return state;
      return {
        ...state,
        balls: state.balls + 15,
        totalPayout: state.totalPayout + 15,
        payoutState: {
          ...state.payoutState,
          ballsThisRound: state.payoutState.ballsThisRound + 1,
          earnedBalls: state.payoutState.earnedBalls + 15
        }
      };

    case 'PAYOUT_ROUND_END':
      if (!state.payoutState || !state.winInfo) return state;
      if (state.payoutState.currentRound >= state.payoutState.totalRounds) {
        // 全ラウンド終了 -> COMPLETE_WINと同じ処理
        return {
          ...state,
          gameState: state.winInfo.nextState,
          rushSpins: state.winInfo.nextState === 'RUSH' ? 0 : state.rushSpins,
          winInfo: null,
          subState: 'IDLE',
          isReadyForNextSpin: true,
          payoutState: null,
          speedMode: state.savedSpeedMode !== null ? state.savedSpeedMode : state.speedMode,
          savedSpeedMode: null
        };
      } else {
        // 次のラウンドへ
        return {
          ...state,
          payoutState: {
            ...state.payoutState,
            isRoundActive: false,
            currentRound: state.payoutState.currentRound + 1
          }
        };
      }

    case 'COMPLETE_WIN':
      if (!state.winInfo) return state;
      return {
        ...state,
        balls: state.balls + state.winInfo.payout,
        totalPayout: state.totalPayout + state.winInfo.payout,
        gameState: state.winInfo.nextState,
        rushSpins: state.winInfo.nextState === 'RUSH' ? 0 : state.rushSpins,
        winInfo: null,
        subState: 'IDLE',
        isReadyForNextSpin: true,
        speedMode: state.savedSpeedMode !== null ? state.savedSpeedMode : state.speedMode,
        savedSpeedMode: null
      };

    case 'FORCE_WIN':
      if (action.winType === 'CINEMATIC') {
        const win: WinInfo = { type: 'RUSH_ENTRY', payout: SPECS.PAYOUT_1500, nextState: 'RUSH', isCinematic: true };
        return {
          ...state,
          winInfo: win,
          spinInfo: { isWin: true, isCharge: false, isReach: true, finalReels: ['7', '7', '7'], pseudoCount: 0, hasPseudoAnim: false },
          subState: 'PRE_WIN_CINEMATIC'
        };
      } else if (action.winType === 'CHARGE') {
        const win: WinInfo = { type: 'CHARGE', payout: SPECS.PAYOUT_CHARGE, nextState: 'NORMAL', isCharge: true };
        return {
          ...state,
          winInfo: win,
          spinInfo: { isWin: false, isCharge: true, isReach: false, finalReels: ['3', '3', '3'], pseudoCount: 0, hasPseudoAnim: false },
          subState: 'CHARGE'
        };
      } else {
        const win: WinInfo = { type: 'NORMAL_WIN', payout: SPECS.PAYOUT_1500, nextState: 'NORMAL', isCinematic: false };
        return {
          ...state,
          winInfo: win,
          spinInfo: { isWin: true, isCharge: false, isReach: true, finalReels: ['3', '3', '3'], pseudoCount: 0, hasPseudoAnim: false },
          subState: 'WIN_PRESENTATION',
          currentStreak: state.gameState === 'NORMAL' ? 1 : state.currentStreak + 1,
          totalPayout: state.gameState === 'NORMAL' ? 0 : state.totalPayout,
          presentationTrigger: Date.now()
        };
      }

    default:
      return state;
  }
}

// -------------------------------------------------------------
// 2. HOOK IMPLEMENTATION
// -------------------------------------------------------------

export function usePachinko() {
  const [state, dispatch] = useReducer(pachinkoReducer, initialState);
  const spinTimerRef = useRef<number | null>(null);

  // Expose dispatchers safely
  const toggleAutoShoot = useCallback(() => dispatch({ type: 'TOGGLE_AUTO_SHOOT' }), []);
  const toggleSpeed = useCallback(() => dispatch({ type: 'TOGGLE_SPEED' }), []);
  const toggleAutoLend = useCallback(() => dispatch({ type: 'TOGGLE_AUTO_LEND' }), []);
  const addBalls = useCallback((amount: number) => dispatch({ type: 'ADD_BALLS', amount }), []);
  const earnMoney = useCallback((amount: number) => dispatch({ type: 'EARN_MONEY', amount }), []);
  const cashOut = useCallback(() => dispatch({ type: 'CASH_OUT' }), []);
  const completeWin = useCallback(() => dispatch({ type: 'COMPLETE_WIN' }), []);
  const cinematicComplete = useCallback(() => dispatch({ type: 'CINEMATIC_COMPLETE' }), []);
  const startPayout = useCallback(() => dispatch({ type: 'START_PAYOUT' }), []);
  const forceWin = useCallback((type: 'CINEMATIC' | 'NORMAL' | 'CHARGE' = 'CINEMATIC') => {
    if (spinTimerRef.current !== null) clearTimeout(spinTimerRef.current);
    dispatch({ type: 'FORCE_WIN', winType: type });
  }, []);

  const shoot = useCallback(() => {
    if (state.subState !== 'IDLE' && state.subState !== 'SPINNING' && state.subState !== 'PAYOUT' && state.subState !== 'WIN_PRESENTATION' && state.subState !== 'PRE_WIN_CINEMATIC') return;
    if (state.reserveQueue.length >= 4) return;
    
    let isEnter = false;
    let newSpin: SpinData | null = null;
    
    let actualProb;
    if (state.gameState === 'RUSH') {
      actualProb = 1.0;
    } else {
      const baseProb = SPECS.BASE_SPINS_PER_1000YEN / 250;
      actualProb = baseProb * state.nailState;
    }

    if (Math.random() < actualProb) {
      isEnter = true;
      newSpin = generateSpinData(state.gameState);
    }
    
    dispatch({ type: 'SHOOT_BALL', newSpin, isEnter });
    
    if (isEnter && newSpin && newSpin.color !== 'white' && newSpin.color !== 'blinking') {
      const id = newSpin.id;
      setTimeout(() => {
        dispatch({ type: 'CLEAR_RESERVE_EVENT', id });
      }, 1500);
    }
  }, [state.subState, state.reserveQueue.length, state.gameState, state.nailState]);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const shootRef = useRef(shoot);
  useEffect(() => {
    shootRef.current = shoot;
  }, [shoot]);

  // Auto shooting loop
  useEffect(() => {
    let interval: number;
    const allowedStates = ['IDLE', 'SPINNING', 'PAYOUT', 'WIN_PRESENTATION', 'PRE_WIN_CINEMATIC'];
    if (state.autoShoot && allowedStates.includes(state.subState)) {
      const isPseudoAnimPlaying = state.spinInfo?.hasPseudoAnim && state.subState === 'SPINNING';
      const effectiveSpeedMode = isPseudoAnimPlaying ? 0 : state.speedMode;
      const shootInterval = effectiveSpeedMode === 2 ? 50 : effectiveSpeedMode === 1 ? 200 : 600;
      
      interval = window.setInterval(() => {
        const currentState = stateRef.current;
        if (currentState.balls <= 0) {
          if (currentState.autoLend && currentState.money >= 500) {
            dispatch({ type: 'LEND_MONEY' });
          }
        } else if (currentState.reserveQueue.length < 4) {
          shootRef.current();
        }
      }, shootInterval);
    }
    return () => window.clearInterval(interval);
  }, [state.autoShoot, state.subState, state.speedMode, state.spinInfo?.hasPseudoAnim]);

  // Main game loop trigger
  useEffect(() => {
    if (state.subState === 'IDLE' && state.reserveQueue.length > 0 && state.isReadyForNextSpin) {
      dispatch({ type: 'START_SPIN' });
    }
  }, [state.subState, state.reserveQueue.length, state.isReadyForNextSpin]);

  // Handle SPINNING logic and timers
  useEffect(() => {
    if (state.subState === 'SPINNING' && state.spinInfo) {
      const { isWin, isCharge, isReach, pseudoCount, hasPseudoAnim } = state.spinInfo;
      
      let spinDuration = isWin ? 5000 : isReach ? 4500 : 2000; 
      if (hasPseudoAnim) {
        spinDuration += pseudoCount * 2400;
      }
      
      if (!hasPseudoAnim) {
        if (state.speedMode === 1) spinDuration = isWin ? 2500 : isReach ? 2000 : 1200;
        if (state.speedMode === 2) spinDuration = isWin ? 500 : isReach ? 400 : 300;
      }
      if (isCharge) spinDuration = 500;
      
      if (spinTimerRef.current !== null) clearTimeout(spinTimerRef.current);
      
      spinTimerRef.current = window.setTimeout(() => {
        if (isWin) {
          if (state.gameState === 'NORMAL' && state.winInfo?.isCinematic) {
            dispatch({ type: 'SPIN_END_WIN_CINEMATIC' });
            setTimeout(() => {
              dispatch({ type: 'CINEMATIC_COMPLETE' });
            }, 17500);
          } else {
            dispatch({ type: 'SPIN_END_WIN_NORMAL' });
          }
        } else if (isCharge) {
          dispatch({ type: 'SPIN_END_CHARGE' });
          setTimeout(() => {
            dispatch({ type: 'CHARGE_COMPLETE' });
          }, 3000);
        } else {
          dispatch({ type: 'SPIN_END_LOSE' });
          const stopDelay = state.speedMode === 2 ? 50 : 200;
          setTimeout(() => {
            dispatch({ type: 'READY_FOR_NEXT_SPIN' });
          }, stopDelay);
        }
      }, spinDuration);
      
      return () => {
        if (spinTimerRef.current !== null) clearTimeout(spinTimerRef.current);
      };
    }
  }, [state.subState]); // Run when state becomes SPINNING

  // Handle PAYOUT logic and timers
  useEffect(() => {
    if (state.subState === 'PAYOUT' && state.payoutState) {
      if (!state.payoutState.isRoundActive) {
        // ラウンド間のインターバル
        const timer = setTimeout(() => dispatch({ type: 'PAYOUT_ROUND_START' }), 1000);
        return () => clearTimeout(timer);
      } else {
        if (state.payoutState.ballsThisRound < 10) {
          // アタッカーに玉が入賞する処理 (1ラウンド10カウント)
          const timer = setTimeout(() => dispatch({ type: 'PAYOUT_TICK' }), 150);
          return () => clearTimeout(timer);
        } else {
          // ラウンド終了
          const timer = setTimeout(() => dispatch({ type: 'PAYOUT_ROUND_END' }), 500);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [state.subState, state.payoutState]);

  // Handle timeouts for cinematic and charge presentations
  useEffect(() => {
    let t: number;
    if (state.subState === 'PRE_WIN_CINEMATIC') {
      t = window.setTimeout(() => dispatch({ type: 'CINEMATIC_COMPLETE' }), 17500);
    } else if (state.subState === 'CHARGE') {
      t = window.setTimeout(() => dispatch({ type: 'CHARGE_COMPLETE' }), 3000);
    }
    return () => window.clearTimeout(t);
  }, [state.subState]);

  return {
    ...state,
    toggleAutoShoot,
    toggleSpeed,
    toggleAutoLend,
    shoot,
    completeWin,
    cinematicComplete,
    startPayout,
    addBalls,
    forceWin,
    earnMoney,
    cashOut
  };
}
