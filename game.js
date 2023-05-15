import { colonies, resources, stats, conditions } from './index.js';
import util, { number, getElement } from './util.js';
import calculate from './calculate.js';
import display from './display.js';
import init from './init.js';

const antUpgrades = {
    unlocked: function(ant) {
        const breakpoint = [10, 25, 50, 100, 200, 300, 400, 500, 750, 1000];
        const unlocked = (
            (ant.upgrades.lessThan(10)) &&
            (ant.recruited.greaterThanOrEqualTo(breakpoint[ant.upgrades]))
        );
        return unlocked;
    },
    hidden: function(ant) {
        const upgradeContainer = document.getElementsByClassName('upgrade-button-container')[0];
        const upgradesUnlocked = upgradeContainer.querySelectorAll('*');
        for (let i = 0; i < (upgradesUnlocked.length); i++) {
            if (upgradesUnlocked[i].id === (ant.id + '-upgrade')) {
                return false;
            }
        }

        return true;
    },
    buy: function(antToUpgrade) {
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
};

function * getAnts() {
    for (const [, colony] of Object.values(colonies).entries()) {
        let lastAnt;
        for (const [, ant] of Object.values(colony).entries()) {
            yield { ant, lastAnt };
            lastAnt = ant;
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
            const { quantity, cost } = calculate.ants.quantityCost(ant);
            if (resources.food.total.greaterThanOrEqualTo(cost)) {
                resources.food.total = resources.food.total.minus(cost);
                ant.recruited = ant.recruited.plus(quantity);
                ant.acquired = ant.acquired.plus(quantity);
            }
        }
    }
}

function handleUnlockedContent() {
    handleUnlockedUpgrades();
}

function handleUnlockedUpgrades() {
    for (const { ant } of getAnts()) {
        if (antUpgrades.unlocked(ant) && antUpgrades.hidden(ant)) {
            const upgrade = calculate.ants.upgradeBoost(ant);
            upgrade.cost = calculate.ants.upgradeCost(ant);
            display.antUpgradeElement(ant, upgrade);
        }
    }
}

// Create the cycle for continuous progression
function progression() {
    if (conditions.activeWindow.status) {
        handleUnlockedContent();
        calculate.resourceProduction(1);
        calculate.statistics();
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
    progression,
    antUpgrades
};
