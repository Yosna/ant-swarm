import Decimal from '../classes/decimal.mjs';
import Ant from './classes/ant.js';
import number from './utilities/number.js';
import dom from './utilities/dom.js';
import { resources, stats } from './index.js';
import { iterateColonies } from './colonies.js';

const forageElements = {
    foodTotal: {
        selector: '#food-total',
        property: 'innerHTML',
        get value() {
            return number(resources.food.total);
        }
    },
    forageTotal: {
        selector: '#forage-total',
        property: 'innerHTML',
        get value() {
            return number(stats.forage.total);
        }
    },
    gatherRate: {
        selector: '#gather-rate',
        property: 'innerHTML',
        get value() {
            return number(stats.gatherRate.value);
        }
    },
    gatherRateUpgrade: {
        selector: '#gather-rate-upgrade',
        property: 'style.backgroundColor',
        get value() {
            const cost = upgrades.gatherRate.cost;
            const grey = '#455b55';
            const highlight = '#009940';
            const color = resources.food.total.gte(cost)
                ? highlight
                : grey;
            return color;
        }
    }
};

const upgrades = {
    gatherRate: {
        get multiplier() {
            return stats.gatherRate.obtained.plus(1);
        },
        get cost() {
            const cost = new Decimal(20)
                .times(this.multiplier)
                .times(Decimal.pow(100, this.multiplier))
                .div(100);
            return number(cost.floor());
        },
        get boost() {
            const boost = new Decimal(10)
                .times(this.multiplier.pow(1.6));
            return number(boost.floor());
        }
    }
};

function gather() {
    const rate = stats.gatherRate.value;
    const boost = new Decimal(upgrades.gatherRate.boost);
    const gathered = rate.times(boost).dividedBy(10);
    resources.food.total = resources.food.total.plus(gathered);
    stats.forage.total = stats.forage.total.plus(1);
}

function isGatherRateUpgradeUnlocked(ant) {
    const isRecruited = ant instanceof Ant
        ? ant.recruited.greaterThanOrEqualTo(25)
        : false;
    const isUnlocked = stats.gatherRate.obtained
        .lessThanOrEqualTo(ant.antTier);

    if (isRecruited && isUnlocked) return true;
}

function isGatherRateUpgradeHidden(ant) {
    let isHidden = true;
    if (ant instanceof Ant) {
        const selector = `#${ant.colony.toLowerCase()}-upgrade-container`;
        const container = dom.getElement(selector);
        const upgrades = container.querySelectorAll('*');
        const upgradeId = 'gather-rate-upgrade';

        for (let i = 0; i < upgrades.length; i++) {
            if (upgrades[i].id === upgradeId) {
                isHidden = false;
            }
        }
    }
    return isHidden;
}

function isGatherRateUpgradeAvailable(ant) {
    const isUnlocked = isGatherRateUpgradeUnlocked(ant);
    const isHidden = isGatherRateUpgradeHidden(ant);
    const isAvailable = isUnlocked && isHidden;
    return isAvailable;
}

function createGatherRateUpgradeElement(selector) {
    const container = dom.getElement(selector);
    const button = document.createElement('button');
    const cost = upgrades.gatherRate.cost;
    const boost = upgrades.gatherRate.boost;
    const upgrade = stats.gatherRate.obtained.plus(1);

    button.type = 'button';
    button.className = 'gather-rate-upgrade-button';
    button.id = 'gather-rate-upgrade';
    button.dataset.string = `Gather Rate
        Upgrade ${(upgrade)}
        \nCost: ${cost}
        \nMultiplies gather rate by ${boost}`;
    button.dataset.cost = cost;
    button.dataset.boost = boost;
    button.innerText = 'GR';

    container.appendChild(button);
}

function upgradeGatherRate(selector) {
    const upgrade = dom.getElement(`#${selector}`);
    console.log(upgrade);
    const cost = new Decimal(upgrade.dataset.cost);
    const boost = new Decimal(upgrade.dataset.boost);

    if (resources.food.total.greaterThanOrEqualTo(cost)) {
        resources.food.total = resources.food.total.minus(cost);
        stats.gatherRate.value = stats.gatherRate.value.times(boost);
        stats.gatherRate.obtained = stats.gatherRate.obtained.plus(1);

        upgrade.remove();
    }
}

function forageUpgradeHandler() {
    for (const ant of iterateColonies()) {
        if (ant instanceof Ant && isGatherRateUpgradeAvailable(ant)) {
            const container = `#${ant.colony.toLowerCase()}-upgrade-container`;
            const selector = 'forage-rate-upgrade';
            createGatherRateUpgradeElement(container);

            dom.eventListener(selector, 'click', () => {
                upgradeGatherRate(selector);
            });
        }
    }
}

function forageProgression() {
    dom.updateElements(forageElements);
    forageUpgradeHandler();
}

export {
    gather,
    forageProgression
};
