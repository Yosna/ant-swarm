import { recruits, resources, stats, conditions } from './index.js';
import util, { number, getElement } from './util.js';
import calculate from './calculate.js';
import display from './display.js';
import init from './init.js';

function * getAnts() {
    for (const [, colony] of Object.values(recruits).entries()) {
        for (const [, ant] of Object.values(colony).entries()) {
            yield { ant, colony };
        }
    }
}

function forage() {
    resources.food.total = Decimal.add(resources.food.total, Decimal.mul(stats.foraging.rate, stats.foraging.boost));

    stats.foraging.total++;
    // This fixes floating point decimal precision errors
    if (resources.food.total.toString().length > 5 && resources.food.total < 10000) {
        resources.food.total = Number(resources.food.total.toFixed(1));
    }
    getElement('#food-total').innerHTML = (resources.food.total);
    getElement('#forage-total').innerHTML = (stats.foraging.total);
}

function recruit(target) {
    for (const { ant } of getAnts()) {
        const targetName = target.innerText.substring(0, ant.name.length);
        if (ant.name === targetName) {
            const { quantity, cost } = calculate.costByQuantity(ant);
            if (number(resources.food.total) >= cost) {
                resources.food.total -= cost;
                ant.recruited += quantity;
                ant.acquired += quantity;
            }
        }
    }
}

function buyAntUpgrade(antToUpgrade) {
    for (const { ant } of getAnts()) {
        if (ant.id === antToUpgrade) {
            const upgrade = document.getElementById(ant.id + '-upgrade');
            const upgradeCost = Number(upgrade.getAttribute('data-cost'));
            const upgradeBoost = Number(upgrade.getAttribute('data-boost'));

            if (resources.food.total >= upgradeCost) {
                resources.food.total -= upgradeCost;
                ant.boost += upgradeBoost;
                ant.upgrades++;

                upgrade.remove();
            }
        }
    }
}

// Create the cycle for continuous progression
function progression() {
    if (conditions.activeWindow) {
        calculate.upgrades();
        calculate.resourceProduction(1);
        display.update();
        util.timestamp();
    }
}

export {
    init,
    util,
    calculate,
    display,
    forage,
    getAnts,
    recruit,
    buyAntUpgrade,
    progression
};
