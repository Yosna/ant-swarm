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
    resources.food.total = resources.food.total.plus(stats.foraging.rate.times(stats.foraging.boost));
    stats.foraging.total = stats.foraging.total.plus(1);

    getElement('#food-total').innerHTML = number(resources.food.total);
    getElement('#forage-total').innerHTML = number(stats.foraging.total);
}

function recruit(target) {
    for (const { ant } of getAnts()) {
        const targetName = target.innerText.substring(0, ant.name.length);
        if (ant.name === targetName) {
            const { quantity, cost } = calculate.costByQuantity(ant);
            if (resources.food.total.greaterThanOrEqualTo(cost)) {
                resources.food.total = resources.food.total.minus(cost);
                ant.recruited = ant.recruited.plus(quantity);
                ant.acquired = ant.acquired.plus(quantity);
            }
        }
    }
}

function buyAntUpgrade(antToUpgrade) {
    for (const { ant } of getAnts()) {
        if (ant.id === antToUpgrade) {
            const upgrade = document.getElementById(ant.id + '-upgrade');
            const upgradeCost = new Decimal((upgrade.getAttribute('data-cost')).replace(/,/g, ''));
            const upgradeBoost = new Decimal(upgrade.getAttribute('data-boost'));

            if (resources.food.total.greaterThanOrEqualTo(upgradeCost)) {
                resources.food.total = resources.food.total.minus(upgradeCost);
                ant.boost = ant.boost.plus(upgradeBoost);
                ant.upgrades = ant.upgrades.plus(1);

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
