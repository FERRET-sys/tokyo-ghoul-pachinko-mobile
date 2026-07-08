import React from 'react';
import './App.css';
import { usePachinko } from './hooks/usePachinko';
import { Reels } from './components/Reels';
import { ControlPanel } from './components/ControlPanel';
import { WinPresentation } from './components/WinPresentation';
import { Yakumono } from './components/Yakumono';
import { RushCinematic } from './components/RushCinematic';
import { PseudoRen } from './components/PseudoRen';
import { SPECS } from './constants/pachinkoSpecs';

function App() {
  const {
    gameState,
    subState,
    isReadyForNextSpin,
    balls,
    reserveQueue,
    reserveEvent,
    spins,
    rushSpins,
    currentStreak,
    totalPayout,
    winInfo,
    spinInfo,
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
  } = usePachinko();

  const [showTestMenu, setShowTestMenu] = React.useState(false);
  const [isUICollapsed, setIsUICollapsed] = React.useState(false);

  return (
    <div className={`layout-wrapper ${isUICollapsed ? 'ui-collapsed' : ''}`}>
      <div className="machine-container">
        <img src="/frame.png" className="machine-frame-overlay" alt="frame" />
        
        <div className="screen-area">
          <div className="screen-bg"></div>
          
          <div className="screen-content">
            <Reels 
              subState={subState} 
              spinInfo={spinInfo} 
              speedMode={spinInfo?.hasPseudoAnim ? 0 : speedMode} 
              gameState={gameState} 
            />
          </div>

          <RushCinematic isActive={subState === 'PRE_WIN_CINEMATIC'} />
          <WinPresentation winInfo={winInfo} completeWin={completeWin} isActive={subState === 'WIN_PRESENTATION'} />
          <Yakumono isWin={subState === 'WIN_PRESENTATION'} skipDelay={winInfo?.isCinematic} />
        </div>

        {/* 保留入賞先読みカットイン */}
        {reserveEvent && (
          <div className="reserve-presentation-overlay">
            <div className={`reserve-presentation-orb color-${reserveEvent.color}`}>
              <div className="reserve-orb-inner">
                <span className="reserve-orb-text">東京喰種</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 喰種チャージの表示 */}
      {subState === 'CHARGE' && (
        <div className="charge-presentation">
          <div className="charge-text">喰種チャージ<br/>300 獲得</div>
        </div>
      )}


      {/* スマホ向け：ステータスバー */}
      <div className="mobile-status-bar">
        <div className="hud-title">🎰台状況</div>
        <div className={`hud-state ${gameState === 'RUSH' ? 'rush' : ''}`}>
          {gameState === 'NORMAL' ? '通常' : `RUSH (${SPECS.RUSH_MAX_SPINS - rushSpins})`}
        </div>
        <div className="hud-reserve">
          保留
          <div className="reserve-container">
            {[...Array(4)].map((_, i) => {
              const item = reserveQueue[i];
              const colorClass = item ? `color-${item.color}` : '';
              return (
                <div key={item ? item.id : i} className={`reserve-dot ${item ? 'active' : ''} ${colorClass}`}>
                  {item && <span className="dot-text">東京喰種</span>}
                </div>
              );
            })}
          </div>
        </div>
        <button 
          className="mobile-dev-toggle"
          onClick={() => setShowTestMenu(prev => !prev)}
        >
          ⚙️
        </button>
      </div>

      {showTestMenu && (
        <div className="mobile-test-menu">
          <div style={{ fontSize: '10px', color: '#fff', marginBottom: '5px' }}>
            DBG: sub={subState} | q={reserveQueue.length} | rdy={isReadyForNextSpin ? '1' : '0'}
          </div>
          <button className="test-btn red" onClick={() => forceWin('CINEMATIC')}>全回転</button>
          <button className="test-btn blue" onClick={() => forceWin('NORMAL')}>通常</button>
          <button className="test-btn purple" onClick={() => forceWin('CHARGE')}>チャージ</button>
        </div>
      )}
      
      <ControlPanel
        money={money}
        balls={balls}
        spins={spins}
        rushSpins={rushSpins}
        gameState={gameState}
        currentStreak={currentStreak}
        totalPayout={totalPayout}
        addBalls={addBalls}
        speedMode={speedMode}
        toggleSpeed={toggleSpeed}
        autoShoot={autoShoot}
        toggleAutoShoot={toggleAutoShoot}
        shoot={shoot}
        autoLend={autoLend}
        toggleAutoLend={toggleAutoLend}
        earnMoney={earnMoney}
        cashOut={cashOut}
        isCollapsed={isUICollapsed}
        toggleCollapse={() => setIsUICollapsed(!isUICollapsed)}
      />
    </div>
  );
}

export default App;
