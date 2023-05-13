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
function antBaseCost(ant) {
    return (
        new Decimal(1)
            .times(new Decimal(10).pow(ant.tier.times(2)))
            .times(ant.tier.plus(1))
            .times(ant.type.plus(1))
    );
}

function antNextCost(ant, multiplier) {
    return ant.cost.times(new Decimal(1.12).pow(multiplier));
}

function costByQuantity(ant) {
    const method = document.getElementById('quantity-selection').value;
    const amount = rounded(
        ant, (method === 'max')
            ? new Decimal(0)
            : new Decimal(method)
    );
    const { quantity, cost } = (method === 'max')
        ? maximumQuantity(ant, amount)
        : selectedQuantity(ant, amount);
    return { quantity, cost };
}

function rounded(ant, quantity) {
    const remainder = ant.recruited.mod(quantity);
    const difference = quantity.minus(remainder);
    return (!conditions.rounding)
        ? quantity // return if rounding is disabled
        : quantity.eq(0)
            ? quantity // return if the quantity is 0
            : ant.recruited.mod(quantity).eq(0)
                ? quantity // return if the quantity is already rounded
                : difference; // return the rounded quantity
}

function maximumQuantity(ant, quantity) {
    let foodRemaining = resources.food.total;
    let cost = new Decimal(0);
    let nextCost = ant.cost;
    while (foodRemaining.greaterThanOrEqualTo(nextCost)) {
        nextCost = antNextCost(ant, ant.recruited.plus(quantity));
        if (foodRemaining.greaterThanOrEqualTo(nextCost)) {
            foodRemaining = foodRemaining.minus(nextCost);
            cost = cost.plus(nextCost);
            quantity = quantity.plus(1);
        }
    }
    cost = (cost.eq(0))
        ? antNextCost(ant, ant.recruited)
        : cost;
    return { quantity, cost };
}

function selectedQuantity(ant, quantity) {
    let cost = new Decimal(0);
    for (let i = 0; i < quantity; i++) {
        const nextCost = antNextCost(ant, ant.recruited.plus(i));
        cost = cost.plus(nextCost);
    }
    return { quantity, cost };
}

function resourceProduction(multiplier) {
    let foodPerSecond = new Decimal(0);

    for (const { ant, colony } of game.getAnts()) {
        const productionBoost = new Decimal(1).plus(ant.recruited.times(ant.boost));
        const productionPerTick = ant.production
            .times(ant.acquired)
            .times(productionBoost)
            .times(stats.tickSpeed.div(1000));
        const lastAnt = Object.values(recruits)[ant.type][Object.keys(colony)[ant.tier.minus(1)]];

        try {
            lastAnt.acquired = lastAnt.acquired.plus(productionPerTick * multiplier);
        } catch {
            resources.food.total = resources.food.total.plus(
                productionPerTick.times(multiplier)
            );
            foodPerSecond = foodPerSecond.plus(
                ant.production.times(ant.acquired).times(productionBoost)
            );
        }
    }
    resources.food.production = foodPerSecond;
}

function totalProduction(ant) {
    const production = new Decimal(1)
        .plus(ant.boost.times(ant.recruited))
        .times(ant.production)
        .times(ant.acquired);
    return number(production) + ' ' + ant.prod_abb;
}

function upgrades() {
    antUpgrades();
}

function antUpgrades() {
    for (const { ant } of game.getAnts()) {
        if (antUpgradeUnlocked(ant) && antUpgradeHidden(ant)) {
            const upgrade = getAntUpgradeBoost(ant);
            upgrade.cost = getAntUpgradeCost(ant);
            game.display.antUpgradeElement(ant, upgrade);
        }
    }
}

function antUpgradeUnlocked(ant) {
    const breakpoint = [10, 25, 50, 100, 200, 300, 400, 500, 750, 1000];
    const unlocked = (
        (ant.upgrades.lessThan(10)) &&
        (ant.recruited.greaterThanOrEqualTo(breakpoint[ant.upgrades]))
    );
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
    const antCostAtBreakpoint = antNextCost(ant, (breakpoint[ant.upgrades]));
    const upgradeCost = antCostAtBreakpoint.times(12)
        .times(new Decimal(1.2).pow(ant.upgrades));

    return upgradeCost.lessThan(10000)
        ? number(upgradeCost.floor())
        : number(upgradeCost);
}

function getAntUpgradeBoost(ant) {
    const boost = new Decimal(0.001).times((ant.upgrades.plus(1)));
    const percent = boost.times(100).toFixed(1) + '%';
    return { boost, percent };
}

export default {
    offlineProgress,
    antBaseCost,
    antNextCost,
    costByQuantity,
    resourceProduction,
    totalProduction,
    upgrades
};
