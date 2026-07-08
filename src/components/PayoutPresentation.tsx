import React from 'react';
import type { PayoutState } from '../hooks/usePachinko';
import './PayoutPresentation.css';

interface PayoutPresentationProps {
  payoutState: PayoutState | null;
  isActive: boolean;
}

export const PayoutPresentation: React.FC<PayoutPresentationProps> = ({ payoutState, isActive }) => {
  if (!isActive || !payoutState) return null;

  return (
    <div className="payout-presentation-container">
      <div className="payout-background-overlay"></div>
      
      {/* V-Attacker Graphic */}
      <div className={`attacker ${payoutState.isRoundActive ? 'open' : 'closed'}`}>
        <div className="attacker-text">
          {payoutState.isRoundActive ? '右を狙え！' : '待機中...'}
        </div>
        <div className="attacker-mouth">
          <div className="attacker-glow"></div>
        </div>
      </div>

      {/* Round Information */}
      <div className="payout-stats">
        <div className="round-info">
          ROUND {payoutState.currentRound} / {payoutState.totalRounds}
        </div>
        <div className="payout-balls-info">
          <div className="payout-label">TOTAL</div>
          <div className="payout-value">{payoutState.earnedBalls}</div>
        </div>
        <div className="payout-balls-info">
          <div className="payout-label">COUNT</div>
          <div className="payout-value">{payoutState.ballsThisRound} / 10</div>
        </div>
      </div>
      
      {/* Ball Entering Animation */}
      {payoutState.isRoundActive && payoutState.ballsThisRound > 0 && (
        <div key={`ball-${payoutState.ballsThisRound}`} className="ball-enter-anim">
          +15
        </div>
      )}
    </div>
  );
};
