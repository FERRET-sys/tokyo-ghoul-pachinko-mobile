// simulator.mjs
const NORMAL_PROBABILITY = 319.6;
const CHARGE_PROBABILITY = 350; // Approximated
const RUSH_PROBABILITY = 97.0; // 1/97
const RUSH_MAX_SPINS = 130;
const RUSH_ENTRY_RATE = 0.5;

const PAYOUT_1500 = 1500;
const PAYOUT_CHARGE = 300;

let balls = 175000; // 100k yen * 7 days = 700k yen = 175k balls
let totalSpins = 0;
let totalRushEntered = 0;
let maxStreak = 0;
let totalPayout = 0;

let gameState = 'NORMAL';
let rushSpins = 0;
let currentStreak = 0;

let currentBalls = balls;
let reserves = 0;

for (let shot = 0; shot < 175000; shot++) {
    currentBalls--;
    
    // Simulate hole entry (base prob = 15 spins per 250 balls = 0.06)
    if (Math.random() < 0.06) {
        if (reserves < 4) {
            reserves++;
        }
    }

    // Process one reserve instantly
    if (reserves > 0) {
        reserves--;
        totalSpins++;

        if (gameState === 'NORMAL') {
            if (Math.random() < 1 / NORMAL_PROBABILITY) {
                // Hit
                currentBalls += PAYOUT_1500;
                totalPayout += PAYOUT_1500;
                currentStreak = 1;

                if (Math.random() < RUSH_ENTRY_RATE) {
                    gameState = 'RUSH';
                    totalRushEntered++;
                    rushSpins = 0;
                } else {
                    gameState = 'NORMAL';
                }
            } else if (Math.random() < 1 / CHARGE_PROBABILITY) {
                // Charge
                currentBalls += PAYOUT_CHARGE;
                totalPayout += PAYOUT_CHARGE;
            }
        } else if (gameState === 'RUSH') {
            rushSpins++;
            if (Math.random() < 1 / RUSH_PROBABILITY) {
                // Hit in RUSH
                currentBalls += PAYOUT_1500;
                totalPayout += PAYOUT_1500;
                currentStreak++;
                if (currentStreak > maxStreak) maxStreak = currentStreak;
                rushSpins = 0; // Reset rush spins
            } else if (rushSpins >= RUSH_MAX_SPINS) {
                // Fall down
                gameState = 'NORMAL';
                rushSpins = 0;
                currentStreak = 0;
            }
        }
    }
}

console.log('--- Simulation Results (1 Week, 700k JPY) ---');
console.log(`Total Balls Shot: 175,000`);
console.log(`Total Spins: ${totalSpins}`);
console.log(`Total Rush Entered: ${totalRushEntered}`);
console.log(`Max Streak: ${maxStreak}`);
console.log(`Total Payout (Gross): ${totalPayout}`);
console.log(`Final Net Balls: ${currentBalls - 175000}`);
