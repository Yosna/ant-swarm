import Decimal from './classes/decimal.mjs';
import Ant from './classes/ant.js';
import number from './utilities/number.js';
import dom from './utilities/dom.js';
import { resources, stats } from './index.js';
import { iterateColonies } from './colonies.js';

const elements = {
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
            return dom.getColor(
                resources.food.total, upgrades.gatherRate.cost, '#009940'
            );
        }
    }
};

const upgrades = {
    gatherRate: {
        get multiplier() {
            return stats.gatherRate.upgrades.plus(1);
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

const gather = () => {
    const gatherRate = stats.gatherRate.value;
    const gatherBoost = new Decimal(upgrades.gatherRate.boost);
    const gatheredFood = gatherRate.times(gatherBoost).dividedBy(10);

    resources.food.total = resources.food.total.plus(gatheredFood);
    stats.forage.total = stats.forage.total.plus(1);
};

const isGatherRateUpgradeAvailable = (ant) => {
    const isRecruited = ant instanceof Ant
        ? ant.recruited.greaterThanOrEqualTo(25)
        : false;

    const isAvailable = stats.gatherRate.upgrades
        .lessThanOrEqualTo(ant.antTier);

    if (isRecruited && isAvailable) return true;
};

const isGatherRateUpgradeHidden = (ant) => {
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
};

const isGatherRateUpgradeUnlocked = (ant) => {
    const isAvailable = isGatherRateUpgradeAvailable(ant);
    const isHidden = isGatherRateUpgradeHidden(ant);
    const isUnlocked = isAvailable && isHidden;
    return isUnlocked;
};

const createGatherRateUpgradeElement = (selector) => {
    const container = dom.getElement(selector);
    const button = document.createElement('button');
    const cost = upgrades.gatherRate.cost;
    const boost = upgrades.gatherRate.boost;
    const upgrade = stats.gatherRate.upgrades.plus(1);

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
};

const upgradeGatherRate = (selector) => {
    const upgrade = dom.getElement(`#${selector}`);
    const cost = new Decimal(upgrade.dataset.cost);
    const boost = new Decimal(upgrade.dataset.boost);

    console.log(resources.food.total.greaterThanOrEqualTo(cost));

    if (resources.food.total.greaterThanOrEqualTo(cost)) {
        resources.food.total = resources.food.total.minus(cost);
        stats.gatherRate.value = stats.gatherRate.value.times(boost);
        stats.gatherRate.upgrades = stats.gatherRate.upgrades.plus(1);

        upgrade.remove();
    }
};

const forageUpgradeHandler = () => {
    for (const ant of iterateColonies()) {
        if (ant instanceof Ant && isGatherRateUpgradeUnlocked(ant)) {
            const container = `#${ant.colony.toLowerCase()}-upgrade-container`;
            const selector = 'gather-rate-upgrade';

            createGatherRateUpgradeElement(container);

            dom.eventListener(selector, 'click', () => {
                upgradeGatherRate(selector);
            });
        }
    }
};

const forageProgression = () => {
    dom.updateElements(elements);
    forageUpgradeHandler();
};

export {
    gather,
    forageProgression
};
