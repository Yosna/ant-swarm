import { recruits, resources, stats, conditions } from './index.js';
import * as game from './game.js';
import { number } from './util.js';

function offlineProgress() {
    const elapsedTime = (Date.now() - stats.lastUpdate);
    const elapsedDays = Math.floor(elapsedTime / 86400000);
    const elapsedHours = Math.floor((elapsedTime % 86400000) / 3600000);
    const elapsedMinutes = Math.floor(((elapsedTime % 86400000) % 3600000) / 60000);
    const elapsedSeconds = Math.floor((((elapsedTime % 86400000) % 3600000) % 60000) / 1000);
    const elapsedTimeFormat = `${elapsedDays}d ${elapsedHours}h ${elapsedMinutes}m ${elapsedSeconds}s`;
    const elapsedTimeMessage = `Welcome back!\nYou were away for:\n${elapsedTimeFormat}`;
    game.util.log(elapsedTimeMessage);

    let cycles = Math.floor(elapsedTime / stats.tickSpeed);
    let offlineMultiplier = 1;

    // Cap the number of cycles to reduce loading time
    if (cycles > 1000) {
        offlineMultiplier = cycles / 1000;
        cycles = 1000;
    }

    for (let i = 0; i < cycles; i++) {
        resourceProduction(offlineMultiplier);
    }
}

function costByQuantity(ant) {
    let quantity = document.getElementById('quantity-selection').value;
    let calculation = quantity;

    quantity = rounded(ant, (quantity === 'max') ? 0 : Number(quantity));
    calculation = (calculation === 'max')
        ? maximumQuantity(ant, quantity)
        : selectedQuantity(ant, quantity);

    return { calculation };
}

function rounded(ant, quantity) {
    const remainder = ant.recruited % quantity;
    const difference = quantity - remainder;
    return (!conditions.rounding)
        ? quantity // return if rounding is disabled
        : (quantity === 0)
            ? quantity // return if the quantity is 0
            : (ant.recruited % quantity === 0)
                ? quantity // return if the quantity is already rounded
                : difference; // return the rounded quantity
}
function maximumQuantity(ant, quantity) {
    let foodRemaining = Number(number(resources.food.total));
    let cost = ant.cost;
    while (resources.food.total > cost) {
        const nextCost = (1 * Math.pow(10, ant.tier * 2)) * Math.pow(1.12, ant.recruited + quantity) * (ant.tier + 1);
        if (foodRemaining >= nextCost) {
            foodRemaining -= nextCost;
            cost += nextCost;
            quantity++;
        }
    }
    cost = (cost === 0) ? ant.cost : cost;
    return { quantity, cost };
}

function selectedQuantity(ant, quantity) {
    let cost = 0;
    for (let i = 0; i < quantity; i++) {
        const nextCost = (1 * Math.pow(10, ant.tier * 2)) * Math.pow(1.12, ant.recruited + i) * (ant.tier + 1);
        cost += nextCost;
    }
    return { quantity, cost };
}

function resourceProduction(multiplier) {
    let foodPerSecond = 0;

    for (const [type, ants] of Object.values(recruits).entries()) {
        for (const [tier, ant] of Object.values(ants).entries()) {
            const productionBoost = 1 + (ant.boost * ant.recruited);
            const productionPerTick = ant.production * ant.acquired * productionBoost * (stats.tickSpeed / 1000);
            const lastAnt = Object.values(recruits)[type][Object.keys(ants)[tier - 1]];

            try {
                lastAnt.acquired += productionPerTick * multiplier;
            } catch {
                resources.food.total += productionPerTick * multiplier;
                foodPerSecond += ant.production * ant.acquired * productionBoost;
            }
        }
    }
    resources.food.production = foodPerSecond;
}

function totalProduction(ant) {
    const production = (1 + (ant.boost * ant.recruited)) * ant.production * ant.acquired;
    return number(production) + ' ' + ant.prod_abb;
}

function upgrades() {
    antUpgrades();
}

function antUpgrades() {
    for (const ant of game.getAnts()) {
        if (antUpgradeUnlocked(ant) && antUpgradeHidden(ant)) {
            const upgrade = getAntUpgradeBoost(ant);
            upgrade.cost = getAntUpgradeCost(ant);
            game.display.antUpgradeElement(ant, upgrade);
        }
    }
}

function antUpgradeUnlocked(ant) {
    const breakpoint = [10, 25, 50, 100, 200, 300, 400, 500, 750, 1000];
    const unlocked = (ant.upgrades < 10) && (ant.recruited >= breakpoint[ant.upgrades]);
    return unlocked;
}

function antUpgradeHidden(ant) {
    const upgradeContainer = document.getElementsByClassName('upgrade-button-container')[0];
    const upgradesUnlocked = upgradeContainer.querySelectorAll('*');
    for (let i = 0; i < (upgradesUnlocked.length); i++) {
        if (upgradesUnlocked[i].id === (ant.id + '-upgrade')) {
            return false;
        }
    }
    return true;
}

function getAntUpgradeCost(ant) {
    const breakpoint = [10, 25, 50, 100, 200, 300, 400, 500, 750, 1000];
    const antCostAtBreakpoint = (1 * Math.pow(10, ant.tier * 2)) * Math.pow(1.12, breakpoint[ant.upgrades]) * (ant.tier + 1);
    const upgradeCost = (antCostAtBreakpoint * 12) * Math.pow(1.2, ant.upgrades);
    return upgradeCost < 10000 ? Math.floor(upgradeCost) : upgradeCost;
}

function getAntUpgradeBoost(ant) {
    const boost = 0.001 * (ant.upgrades + 1);
    const percent = (boost * 100).toFixed(1) + '%';
    return { boost, percent };
}

export default {
    offlineProgress,
    costByQuantity,
    resourceProduction,
    totalProduction,
    upgrades
};
