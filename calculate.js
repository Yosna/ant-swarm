import { recruits, resources, stats, conditions, timers } from './index.js';
import * as game from './game.js';

function offlineProgress() {
    const elapsedTime = (Date.now() - stats.lastUpdate);
    const cycles = Math.floor(elapsedTime / stats.tickSpeed);

    game.util.log('You were away for', (elapsedTime / 1000), 'seconds');

    // Run the number of progression cycles missed since last update
    for (let i = 0; i < cycles; i++) {
        game.progression();
    };
};

function costByQuantity(ant, tier) {
    let quantity = document.getElementById('quantity-selection').value;
    quantity = roundedQuantity(ant, (quantity === 'max') ? 0 : Number(quantity));
    let cost = 0;
    let foodRemaining = Number(game.util.numbers(resources.food.total));
    
    if (quantity > 0) { // Calculate the cost of the quantity selected
        for (let i = 0; i < quantity; i++) {
            const nextCost = (1 * Math.pow(10, tier * 2)) * Math.pow(1.12, ant.recruited + i) * (tier + 1);
            cost += nextCost;
        };
    } else { // Calculate the cost of the maximum quantity
        while (resources.food.total > cost) { // Continue until cost exceeds total food
            const nextCost = (1 * Math.pow(10, tier * 2)) * Math.pow(1.12, ant.recruited + quantity) * (tier + 1);
            if (foodRemaining >= nextCost) {
                foodRemaining -= nextCost;
                cost += nextCost;
                quantity++;
            } else {
                break;
            };
        };
    };

    // Set the minimum quantity and cost if no ants can be recruited
    cost = (cost === 0) ? ant.cost : Number(cost);
    return { quantity, cost };
};

function roundedQuantity(ant, quantity) {
    const remainder = ant.recruited % quantity;
    const difference = quantity - remainder;
    return (conditions.rounding === false) ? quantity // Return if rounding is disabled
        : (quantity === 0) ? quantity                 // Return if the quantity is 0
        : (ant.recruited % quantity === 0) ? quantity // Return if the quantity is already rounded
        : difference;                                 // Return the difference if the quantity is not rounded
}

function resourceProduction() {
    let foodPerSecond = 0;

    for (let [type, ants] of Object.values(recruits).entries()) {
        for (let [tier, ant] of Object.values(ants).entries()) {
            const productionBoost = 1 + (ant.boost * ant.recruited);
            const productionPerTick = ant.production * ant.acquired * productionBoost * (stats.tickSpeed / 1000);
            const lastAnt = Object.values(recruits)[type][Object.keys(ants)[tier - 1]];

            try { 
                lastAnt.acquired += productionPerTick;
            } catch { 
                resources.food.total += productionPerTick;
                foodPerSecond += ant.production * ant.acquired * productionBoost;
            };
        };
    };

    resources.food.production = foodPerSecond;
};

function upgrades() {
    antUpgrades();
};

function antUpgrades() {
    for (let [type, ants] of Object.values(recruits).entries()) {
        for (let [tier, ant] of Object.values(ants).entries()) {
            if (antUpgradeUnlocked(ant) && antUpgradeHidden(ant)) {
                const upgrade = getAntUpgradeBoost(ant);
                upgrade.cost = getAntUpgradeCost(ant, tier);
                game.display.antUpgradeElement(ant, upgrade)
            };
        };
    };
};

function antUpgradeUnlocked(ant) {
    const breakpoint = [10, 25, 50, 100, 200, 300, 400, 500, 750, 1000];
    const unlocked = (ant.upgrades < 10) && (ant.recruited >= breakpoint[ant.upgrades]);
    return unlocked;
};

function antUpgradeHidden(ant) {
    const upgradeContainer = document.getElementsByClassName('upgrade-button-container')[0];
    const upgradesUnlocked = upgradeContainer.querySelectorAll('*');
    for (let i = 0; i < (upgradesUnlocked.length); i++) {
        if (upgradesUnlocked[i].id === (ant.id + '-upgrade')) {
            return false;
        };
    };
    return true;
};

function getAntUpgradeCost(ant, tier) {
    const breakpoint = [10, 25, 50, 100, 200, 300, 400, 500, 750, 1000];
    const antCostAtBreakpoint = (1 * Math.pow(10, tier * 2)) * Math.pow(1.12, breakpoint[ant.upgrades]) * (tier + 1);
    let upgradeCost = (antCostAtBreakpoint * 12) * Math.pow(1.2, ant.upgrades);
    return upgradeCost < 10000 ? Math.floor(upgradeCost) : upgradeCost;
};

function getAntUpgradeBoost(ant) {
    const boost = 0.001 * (ant.upgrades + 1);
    const percent = (boost * 100).toFixed(1) + '%';
    return { boost, percent }
};

export default {
    offlineProgress,
    costByQuantity,
    resourceProduction,
    upgrades,
};