import React from 'react';
import type { GameState } from '../hooks/usePachinko';

interface ControlPanelProps {
  money: number;
  balls: number;
  spins: number;
  rushSpins: number;
  gameState: GameState;
  currentStreak: number;
  totalPayout: number;
  addBalls: (amount: number) => void;
  speedMode: 0 | 1 | 2;
  toggleSpeed: () => void;
  autoShoot: boolean;
  toggleAutoShoot: () => void;
  shoot: () => void;
  autoLend: boolean;
  toggleAutoLend: () => void;
  earnMoney: (amount: number) => void;
  cashOut: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const BAITO_QUOTES = [
  "この世のすべての不利益は当人の能力不足",
  "すべてを護ろうとするのは、すべてを捨てるのと同じことだ",
  "一方を捨ててでも、一方を守らなくちゃならない時がある。それができないのは、ただの甘えだ",
  "僕を喰おうとしたんだ。僕に喰われても、仕方ないよね？",
  "僕の邪魔をする奴は……全員摘み取る",
  "半殺しって、どんなふうだか知ってる？……人間の骨は全部で206本あるんだけど、その半分、折るね",
  "なぜ私が救ってやらなきゃならないんだ？",
  "僕はまた、何も……残せなかった……",
  "なんで僕が……喰種なんかのために死ななきゃいけないんだよ……！",
  "あんたは……一人で勝手に傷ついて……残された方の気持ちなんて、考えたこともないくせに！",
  "奪う行為は等しく悪だ。我々は産まれ落ちたその瞬間から命を奪い続けている",
  "僕は、僕自身を不幸だなんて思っていない。ただ……もし仮に、僕を主役に一つ作品を書くとすれば……それはきっと、“悲劇”だ",
  "傷つけるより、傷つけられる人に。優しい人はそれだけでいいの",
  "…君は本当に、救いようのない馬鹿だな"
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  money,
  balls,
  spins,
  rushSpins,
  gameState,
  currentStreak,
  totalPayout,
  addBalls,
  speedMode,
  toggleSpeed,
  autoShoot,
  toggleAutoShoot,
  shoot,
  autoLend,
  toggleAutoLend,
  earnMoney,
  cashOut,
  isCollapsed,
  toggleCollapse
}) => {
  const [toast, setToast] = React.useState<string | null>(null);

  const speedLabel = speedMode === 2 ? '超倍速' : speedMode === 1 ? '倍速' : '通常速度';
  const speedColor = speedMode === 2 ? '#ff0000' : speedMode === 1 ? '#ffa500' : '#888';

  const handleBaito = () => {
    const q = BAITO_QUOTES[Math.floor(Math.random() * BAITO_QUOTES.length)];
    setToast(q);
    earnMoney(5000);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className={`control-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="collapse-toggle" onClick={toggleCollapse}>
        {isCollapsed ? '▲ MENU ▲' : '▼ CLOSE ▼'}
      </div>
      <div className="data-counter">
        <div className="data-item">
          <span className="data-label">所持金</span>
          <span className="data-value highlight">¥{money.toLocaleString()}</span>
        </div>
        <div className="data-item">
          <span className="data-label">回転数</span>
          <span className="data-value">{gameState === 'NORMAL' ? spins : rushSpins}</span>
        </div>
        <div className="data-item">
          <span className="data-label">連チャン</span>
          <span className="data-value highlight">{currentStreak}</span>
        </div>
        <div className="data-item">
          <span className="data-label">持玉</span>
          <span className="data-value">{balls}</span>
        </div>
        <div className="data-item">
          <span className="data-label">累計獲得</span>
          <span className="data-value highlight">{totalPayout}</span>
        </div>
      </div>

      <div className="actions">
        <button 
          className="btn btn-secondary" 
          onClick={() => addBalls(125)}
          disabled={money < 500}
        >
          玉貸 (500円)
        </button>

        <button 
          className="btn btn-accent" 
          onClick={cashOut}
          disabled={balls <= 0}
          style={{ background: '#ffd700', color: '#000', borderColor: '#daa520', boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
        >
          換金する
        </button>

        <div className="toggle-switch-container">
          <span className="toggle-label">自動玉貸</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={autoLend} onChange={toggleAutoLend} />
            <span className="slider round"></span>
          </label>
        </div>

        <button 
          className="btn btn-accent" 
          onClick={handleBaito}
        >
          バイトする
        </button>
      </div>
      <div className="actions" style={{ marginTop: '10px' }}>
        <button 
          className={`btn ${speedMode > 0 ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={toggleSpeed}
          style={speedMode > 0 ? { borderColor: speedColor, background: speedColor, color: '#000' } : {}}
        >
          {speedLabel}
        </button>
        <button 
          className={`btn ${autoShoot ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={toggleAutoShoot}
          disabled={balls <= 0 && !autoShoot}
        >
          自動: {autoShoot ? 'ON' : 'OFF'}
        </button>
        <button 
          className="btn btn-primary" 
          onClick={shoot}
          disabled={balls <= 0 || autoShoot}
        >
          1発
        </button>
      </div>

      {toast && (
        <div className="toast-message">
          {toast}
        </div>
      )}
    </div>
  );
};
