import React from 'react';
import './PseudoRen.css';

export interface PseudoRenProps {
  phase: number;
  showFail: boolean;
}

export const PseudoRen: React.FC<PseudoRenProps> = ({ phase, showFail }) => {
  if (phase === 0) return null;

  const isScattered = phase === 1 || phase === 3 || phase === 5 || phase === 7;
  const isAssembled = phase === 2 || phase === 4 || phase === 6;

  return (
    <div className="pseudo-ren-container" style={{ position: 'absolute', zIndex: 50, width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }}>
      
      {/* Keizoku BG & Multiplier (Only in Assembled) */}
      {isAssembled && (
        <div className="combined-success">
          <div className="keizoku-bg">継続</div>
          <div className="multiplier-text">×{phase === 2 ? '1' : phase === 4 ? '2' : '3'}</div>
        </div>
      )}

      {/* Dynamic Characters: Animates between Scattered and Assembled */}
      {!showFail && (
        <div className={`dynamic-chars ${isScattered ? 'scattered' : 'assembled'}`}>
          <div className="vertical-box-bg" />
          <span className="char char1">間</span>
          <span className="char char2">違</span>
          <span className="char char3">っ</span>
          <span className="char char4">て</span>
          <span className="char char5">い</span>
          <span className="char char6">る</span>
        </div>
      )}

      {/* Evaporate (Fail) */}
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
    </div>
  );
};
