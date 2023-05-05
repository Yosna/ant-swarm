import { recruits, resources, stats, conditions, timers } from './index.js';
import util from './util.js';
import calculate from './calculate.js';
import display from './display.js';
import init from './init.js';

// Gather food by foraging
function forage() {
    resources.food.total += (stats.foraging.rate * stats.foraging.boost);
    document.getElementById('food-total').innerHTML = util.numbers(resources.food.total);
};

// Recruit an ant
function recruit(target) {
    for (let [type, ants] of Object.values(recruits).entries()) {
        for (let [tier, ant] of Object.values(ants).entries()) {
            const targetName = target.innerText.substring(0, ant.name.length);

            if (ant.name == targetName) {
                const q = calculate.costByQuantity(ant, tier);

                // Check if the food is sufficient; util.numbers() fixes floating point number precision
                if (util.numbers(resources.food.total) < q.cost) {
                    return;
                };
                resources.food.total -= q.cost;
                ant.recruited += q.quantity;
                ant.acquired += q.quantity;
                ant.cost = (1 * Math.pow(10, tier * 2)) * Math.pow(1.12, ant.recruited) * (tier + 1);
            };
        };
    };
};

function buyUpgrade(antToUpgrade) {
    for (let [type, ants] of Object.entries(recruits)) {
        for (let [tier, ant] of Object.entries(ants)) {

            // Determine which ant to upgrade
            if (ant.id == antToUpgrade) {
                const upgrade = document.getElementById(ant.id + '-upgrade');
                const upgradeCost = Number(upgrade.getAttribute('data-cost'));
                const upgradeBoost = Number(upgrade.getAttribute('data-boost'));

                if (resources.food.total < upgradeCost) {
                    return;
                };

                // Apply the upgrade
                resources.food.total -= upgradeCost;
                ant.boost += upgradeBoost;
                ant.upgrades++;

                upgrade.remove();
            };
        };
    };
};

// Create the cycle for continuous progression
function progression() {
    if (conditions.activeWindow) {
        calculate.upgrades();
        calculate.resourceProduction();
        display.update();
        util.timestamp();
    };
};

export { 
    init,
    util,
    calculate,
    display,
    forage,
    recruit,
    buyUpgrade,
    progression,
 };