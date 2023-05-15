import { colonies, resources, stats, upgrades, conditions } from './index.js';
import util, { number, getElement } from './util.js';
import calculate from './calculate.js';
import display from './display.js';
import init from './init.js';

const forageUpgrades = {
    unlocked: function() {
        let available = new Decimal(0);
        for (const { ant } of getAnts()) {
            if (ant.recruited.greaterThan(25) && available.lessThan(7)) {
                available = available.plus(1);
            }
        }
        upgrades.forage.yield.unlocked = available;
        return (upgrades.forage.yield.unlocked.minus(available));
    },
    hidden: function() {
        const upgradeContainer = document.getElementsByClassName('upgrade-button-container')[0];
        const upgradesUnlocked = upgradeContainer.querySelectorAll('*');
        for (let i = 0; i < (upgradesUnlocked.length); i++) {
            if (upgradesUnlocked[i].id === ('forage-yield-upgrade')) {
                return false;
            }
        }
        return true;
    }
};

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
    resources.food.total = resources.food.total.plus(stats.forage.yield.times(stats.forage.boost));
    stats.forage.total = stats.forage.total.plus(1);
    getElement('#food-total').innerHTML = number(resources.food.total);
    getElement('#forage-total').innerHTML = number(stats.forage.total);
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

function unlockedContentHandler() {
    unlockedUpgradesHandler();
}

function unlockedUpgradesHandler() {
    forageUpgradeHandler();
    recruitmentUpgradeHandler();
}

function forageUpgradeHandler() {
    if (forageUpgrades.unlocked().greaterThan(0) && forageUpgrades.hidden()) {
        const upgrade = calculate.forage.upgradeCost();
        display.upgradeElement.forage(upgrade);
    }
}

function recruitmentUpgradeHandler() {
    for (const { ant } of getAnts()) {
        if (antUpgrades.unlocked(ant) && antUpgrades.hidden(ant)) {
            const upgrade = calculate.ants.upgradeBoost(ant);
            upgrade.cost = calculate.ants.upgradeCost(ant);
            display.upgradeElement.ants(ant, upgrade);
        }
    }
}

// Create the cycle for continuous progression
function progression() {
    if (conditions.activeWindow.status) {
        unlockedContentHandler();
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
    forageUpgrades,
    antUpgrades
};
