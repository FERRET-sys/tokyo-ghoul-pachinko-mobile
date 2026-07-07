import React, { useEffect, useState } from 'react';
import './Yakumono.css';

interface YakumonoProps {
  isWin: boolean;
  skipDelay?: boolean;
}

export const Yakumono: React.FC<YakumonoProps> = ({ isWin, skipDelay }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isWin) {
      if (skipDelay) {
        setShow(true);
      } else {
        // 少しだけ待ってから落下（リール停止直後にガシャーンと落とす）
        const timer = setTimeout(() => {
          setShow(true);
        }, 300);
        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
    }
  }, [isWin, skipDelay]);

  if (!show) return null;

  return (
    <div className={`yakumono-container ${skipDelay ? 'skip-delay' : ''}`}>
      <div className="yakumono-drop">
        <img src="/hand.png" className="yakumono-part hand" alt="hand" onError={(e) => e.currentTarget.style.display = 'none'} />
        <img src="/body.png" className="yakumono-part body" alt="body" onError={(e) => e.currentTarget.style.display = 'none'} />
      </div>
    </div>
  );
};
