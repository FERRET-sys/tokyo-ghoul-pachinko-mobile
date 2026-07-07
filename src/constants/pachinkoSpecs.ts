export const SPECS = {
  NORMAL_PROBABILITY: 399.0, // 1/399荒波仕様
  CHARGE_PROBABILITY: 399.0, // 大当たりと同じ確率
  RUSH_PROBABILITY: 94.3,    // 130回転で約75%継続になる確率

  PAYOUT_CHARGE: 300, // 喰種チャージ
  PAYOUT_1500: 1500,  // 通常時の大当たり、またはRUSH初当たり
  PAYOUT_3000: 3000,  // RUSH中大当たり（97%）
  PAYOUT_6000: 6000,  // RUSH中大当たり（3%）
  
  RUSH_MAX_SPINS: 130, // RUSHの規定回転数
  
  // ボーダー（1000円あたりの回転数ベース）
  BASE_SPINS_PER_1000YEN: 18.1,
  
  // 特図1振り分け
  DIST_NORMAL_RUSH_10R: 0.50, // 50%
  DIST_NORMAL_RUSH_2R: 0.51,  // 1% (50% ~ 51%)
  // 残り 49% は 10R 通常
  
  // 特図2振り分け
  DIST_RUSH_x4: 0.03, // 3%
  // 残り 97% は x2 (3000発)
};
