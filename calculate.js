import { resources, stats, conditions } from './index.js';
import * as game from './game.js';
import { element } from './display.js';
import { number, getElement } from './util.js';

const ants = {
    baseCost: function(ant) {
        return (
            new Decimal(1)
                .times(new Decimal(10).pow(ant.tier.times(2)))
                .times(ant.tier.plus(1))
                .times(ant.type.plus(1))
        );
    },
    nextCost: function(ant, multiplier) {
        return ant.cost.times(new Decimal(1.12).pow(multiplier));
    },
    quantityCost: function(ant) {
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
    },
    production: function(ant) {
        const boost = new Decimal(1).plus(ant.recruited.times(ant.boost));
        const tick = ant.production
            .times(ant.acquired)
            .times(boost)
            .times(stats.tickSpeed.div(1000));
        const production = new Decimal(1)
            .plus(ant.boost.times(ant.recruited))
            .times(ant.production)
            .times(ant.acquired);
        const total = number(production) + ' ' + ant.prod_abb;
        return { boost, tick, total };
    },
    requirement: function(ant, lastAnt) {
        const conditions =
            (resources.food.total.greaterThan(ant.cost.div(4))) +
            (ant.acquired.eq(0)) +
            !ant.unlocked;
        if (conditions === 3) {
            if (lastAnt) {
                const char = getElement(`#${lastAnt.id_abb}-se-char`);
                char.innerHTML = '\u251C\u2500';
            }
            element.update(`.${ant.id}-data`, 'style.visibility', 'visible');
            element.collapse(getElement(`#${ant.id}-stats`));
        }
        return ant.unlocked ? true : conditions === 3;
    },
    upgradeCost: function(ant) {
        const breakpoint = [10, 25, 50, 100, 200, 300, 400, 500, 750, 1000];
        const antCostAtBreakpoint = ants.nextCost(ant, (breakpoint[ant.upgrades]));
        const upgradeCost = antCostAtBreakpoint.times(12)
            .times(new Decimal(1.2).pow(ant.upgrades));

        return upgradeCost.lessThan(10000)
            ? number(upgradeCost.floor())
            : number(upgradeCost);
    },
    upgradeBoost: function(ant) {
        const boost = new Decimal(0.001).times((ant.upgrades.plus(1)));
        const percent = boost.times(100).toFixed(1) + '%';
        return { boost, percent };
    },
    stats: (colony) => { // CONSIDER MOVING THIS FUNCTION ELSEWHERE
        let acquiredTotal = new Decimal(0);
        for (const { ant } of game.getAnts()) {
            if (ant.colony === colony) {
                acquiredTotal = acquiredTotal.plus(ant.acquired);
            }
        }
        for (const key in stats.ants) {
            if (key === colony) {
                game.display.statistics.update(`#${colony}-ant-total`, number(acquiredTotal.floor()));
            }
        }
    }
};

function offlineProgress() {
    const time = elapsedTime(stats.lastUpdate);
    const timeFormatString = `Welcome back!\nYou were away for:\n${time.format}`;
    game.util.log(timeFormatString);

    let cycles = Math.floor(time.value / stats.tickSpeed);
    let offlineMultiplier = 1;

    // Cap the number of cycles to reduce loading time
    if (cycles > 1000) {
        offlineMultiplier = cycles / 1000;
        cycles = 1000;
    }
    if (conditions.offlineProgress === false) {
        game.util.log('Offline progress disabled! Aborting progress...');
        return;
    }
    for (let i = 0; i < cycles; i++) {
        resourceProduction(offlineMultiplier);
    }
}

function elapsedTime(elapse) {
    const value = Date.now() - elapse;
    const time = {
        days: {
            value: Math.floor(value / 86400000),
            suffix: 'd'
        },
        hours: {
            value: Math.floor((value % 86400000) / 3600000),
            suffix: 'h'
        },
        minutes: {
            value: Math.floor(((value % 86400000) % 3600000) / 60000),
            suffix: 'm'
        },
        seconds: {
            value: Math.floor((((value % 86400000) % 3600000) % 60000) / 1000),
            suffix: 's'
        }
    };
    const units = [];
    for (const [, unit] of Object.entries(time)) {
        if (unit.value > 0) {
            units.push(`${unit.value}${unit.suffix}`);
        }
    }

    return { value, format: units.join(' ') };
}

function rounded(ant, quantity) {
    const remainder = ant.recruited.mod(quantity);
    const difference = quantity.minus(remainder);
    return (!conditions.rounding.status)
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
        nextCost = ants.nextCost(ant, ant.recruited.plus(quantity));
        if (foodRemaining.greaterThanOrEqualTo(nextCost)) {
            foodRemaining = foodRemaining.minus(nextCost);
            cost = cost.plus(nextCost);
            quantity = quantity.plus(1);
        }
    }
    cost = (cost.eq(0))
        ? ants.nextCost(ant, ant.recruited)
        : cost;
    return { quantity, cost };
}

function selectedQuantity(ant, quantity) {
    let cost = new Decimal(0);
    for (let i = 0; i < quantity; i++) {
        const nextCost = ants.nextCost(ant, ant.recruited.plus(i));
        cost = cost.plus(nextCost);
    }
    return { quantity, cost };
}

function resourceProduction(multiplier) {
    let foodPerSecond = new Decimal(0);

    for (const { ant, lastAnt } of game.getAnts()) {
        const production = ants.production(ant);
        try { // Add production to the previous tier in the colony
            lastAnt.acquired = lastAnt.acquired.plus(production.tick * multiplier);
        } catch { // Add production to the base resource when no previous tier
            resources.food.total = resources.food.total.plus(
                production.tick.times(multiplier)
            );
            foodPerSecond = foodPerSecond.plus(
                ant.production.times(ant.acquired).times(production.boost)
            );
        } finally {
            autoRecruitment(ant);
        }
    }
    resources.food.production = foodPerSecond;
}

function statistics() {
    for (const { ant } of game.getAnts()) {
        game.display.statistics.update(`#${ant.id}-stat`, number(ant.acquired.floor()));
        ants.stats(ant.colony);
    }
}

function autoRecruitment(ant) {
    if (conditions.autoRecruit.status === false) {
        return;
    }
    if (resources.food.total.greaterThanOrEqualTo(ants.nextCost(ant, ant.recruited).times(10))) {
        document.getElementById(`${ant.id}-button`).click();
    }
}

export default {
    offlineProgress,
    elapsedTime,
    resourceProduction,
    statistics,
    ants
};
