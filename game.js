import { recruits, resources, stats, conditions } from './index.js';
import util, { number } from './util.js';
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
    resources.food.total += (stats.foraging.rate * stats.foraging.boost);
    document.getElementById('food-total').innerHTML = number(resources.food.total);
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
                ant.cost = (
                    (1 * Math.pow(10, ant.tier * 2)) *
                    Math.pow(1.12, ant.recruited) *
                    (ant.tier + 1)
                );
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
