import React from 'react';
import './RushCinematic.css';

interface RushCinematicProps {
  isActive: boolean;
}

export const RushCinematic: React.FC<RushCinematicProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="rush-cinematic-container">
      {/* 0.0s - 4.0s */}
      <div className="cine-text flow-text step1">叔母を見殺しにしても?</div>
      
      {/* 4.0s - 5.5s */}
      <div className="cine-text shout-text step2" style={{ textAlign: 'center' }}>
        <span className="red-text">見殺しに</span><br/>しても
      </div>
      
      {/* 5.5s - 9.5s */}
      <div className="cine-text flow-text step3">誰かを傷つけても?</div>
      
      {/* 9.5s - 11.0s */}
      <div className="cine-text shout-text step4" style={{ textAlign: 'center' }}>
        <span className="red-text" style={{ fontSize: '1.4em' }}>傷</span>つけても
      </div>
      
      {/* 11.0s - 15.0s */}
      <div className="cine-text flow-text step5">
        <span className="red-text">命</span>を<span className="red-text">奪</span>っても
      </div>
      
      {/* 15.0s - 17.5s */}
      <div className="cine-text shout-text-max step6">
        <span className="red-text">奪っても</span>
      </div>
    </div>
  );
};
