import Decimal from './decimal.mjs';
import number from '../utilities/number.js';
import dom from '../utilities/dom.js';
import { stats, conditions } from '../index.js';

class Ant {
    constructor(name, colony, resource, _product, colonyTier, antTier) {
        this.name = name;
        this.abbreviation = name.match(/[A-Z]/g).join('');
        this.id = name.replaceAll(' ', '-').toLowerCase();
        this.colony = colony;
        this.resource = resource;
        this._product = _product;
        this.baseProduction = new Decimal(0.1);
        this.recruited = new Decimal(0);
        this.acquired = new Decimal(0);
        this.boost = new Decimal(0);
        this.level = new Decimal(0);
        this.colonyTier = new Decimal(colonyTier);
        this.antTier = new Decimal(antTier);
        this.validation = 'Ant';
    }

    static fromObject(save) {
        const ant = new Ant(
            save.name,
            save.colony,
            {}, // resource and _product are references and
            {}, // require assignment after initialization
            save.colonyTier,
            save.antTier
        );
        ant.baseProduction = new Decimal(save.baseProduction);
        ant.recruited = new Decimal(save.recruited);
        ant.acquired = new Decimal(save.acquired);
        ant.boost = new Decimal(save.boost);
        ant.level = new Decimal(save.level);
        return ant;
    }

    get product() {
        return this._product;
    }

    get production() {
        const boost = new Decimal(1).plus(this.recruited.times(this.boost));
        const tick = this.baseProduction
            .times(this.acquired)
            .times(boost)
            .times(stats.tickSpeed.div(1000));
        const total = new Decimal(1)
            .plus(this.boost.times(this.recruited))
            .times(this.acquired)
            .times(this.baseProduction);
        const format = number(total) + ' ' + this.product.abbreviation;
        return { boost, tick, total, format };
    }

    get baseCost() {
        const cost = new Decimal(1)
            .times(new Decimal(100).pow(this.antTier))
            .times(new Decimal(1e4).pow(this.colonyTier))
            .times(this.antTier.plus(1));
        return cost;
    }

    get costByQuantity() {
        const method = dom.getElement('#quantity-selection').value;
        return method === 'max' ? this.maximumCost : this.selectedCost;
    }

    get maximumCost() {
        let quantity = new Decimal(0);
        let cost = new Decimal(0);
        let nextCost = this.baseCost;
        let resourceRemaining = this.resource.total;

        while (resourceRemaining.greaterThanOrEqualTo(nextCost)) {
            nextCost = this.nextCost(this.recruited.plus(quantity));
            if (resourceRemaining.greaterThanOrEqualTo(nextCost)) {
                resourceRemaining = resourceRemaining.minus(nextCost);
                cost = cost.plus(nextCost);
                quantity = quantity.plus(1);
            }
        }
        cost = (Number(cost) === 0) ? this.nextCost(this.recruited) : cost;

        return { quantity, cost };
    }

    get selectedCost() {
        const selectedQuantity = new Decimal(dom.getElement('#quantity-selection').value);
        const quantity = conditions.rounding.status
            ? this.roundedQuantity
            : selectedQuantity;
        let cost = new Decimal(0);

        for (let i = 0; i < quantity; i++) {
            const nextCost = this.nextCost(this.recruited.plus(i));
            cost = cost.plus(nextCost);
        }

        return { quantity, cost };
    }

    get roundedQuantity() {
        const quantity = new Decimal(dom.getElement('#quantity-selection').value);
        const remainder = this.recruited.mod(quantity);
        const difference = quantity.minus(remainder);
        return (quantity.eq(0))
            ? quantity // return if the quantity is 0
            : this.recruited.mod(quantity).eq(0)
                ? quantity // return if quantity is already rounded
                : difference; // return the difference to round the quantity
    }

    get elements() {
        const { cost, quantity } = this.costByQuantity;
        const { recruitColor, upgradeColor } = this.elementColors;

        const elements = {
            recruited: {
                selector: `#${this.id}-recruited`,
                property: 'innerHTML',
                value: number(this.recruited)
            },
            acquired: {
                selector: `#${this.id}-acquired`,
                property: 'innerHTML',
                value: number(this.acquired)
            },
            production: {
                selector: `#${this.id}-production`,
                property: 'innerHTML',
                value: this.production.format
            },
            cost: {
                selector: `#${this.id}-cost`,
                property: 'innerHTML',
                value: number(cost)
            },
            quantity: {
                selector: `#${this.id}-quantity`,
                property: 'innerHTML',
                value: number(quantity)
            },
            stats: {
                selector: `#${this.id}-stat`,
                property: 'innerHTML',
                value: number(this.acquired.floor())
            },
            button: {
                selector: `#${this.id}-button`,
                property: 'style.backgroundColor',
                value: recruitColor
            },
            upgrade: {
                selector: `#${this.id}-upgrade`,
                property: 'style.backgroundColor',
                value: upgradeColor
            }
        };
        return elements;
    }

    get isUnlocked() {
        const antRow = dom.getElement(`#${this.id}-row`);
        const antStats = dom.getElement(`#${this.id}-stats`);

        const isWithinRange = this.resource.total.greaterThan(this.baseCost.div(10));
        const isAvailable = this.acquired.greaterThan(0);
        const isUnlocked = isWithinRange || isAvailable;
        const isHidden = antRow.classList.contains('hidden');

        if (isUnlocked && isHidden) {
            antRow.classList.remove('hidden');
            antStats.classList.remove('collapse');
            this.editSpecialCharacters();
        }
        return isUnlocked;
    }

    get isUpgradeUnlocked() {
        const milestones = [10, 25, 50, 100, 200, 300, 400, 500, 750, 1000];
        const isAvailable = this.level.lessThan(10) &&
            this.recruited.greaterThanOrEqualTo(milestones[this.level]);
        const isUnlocked = isAvailable && this.isUpgradeHidden;
        return isUnlocked;
    }

    get isUpgradeHidden() {
        const selector = `#${this.colony.toLowerCase()}-upgrade-container`;
        const container = dom.getElement(selector);
        const upgradeId = `${this.id}-upgrade`;
        const unlocked = container.querySelectorAll('*');
        for (let i = 0; i < unlocked.length; i++) {
            if (upgradeId === unlocked[i].id) {
                return false;
            }
        }
        return true;
    }

    get upgradeValues() {
        const milestones = [10, 25, 50, 100, 200, 300, 400, 500, 750, 1000];
        const antCostAtMilestone = this.nextCost(milestones[this.level]);
        const cost = antCostAtMilestone.times(12)
            .times(new Decimal(1.2).pow(this.level)).floor();
        const boost = new Decimal(0.001).times((this.level.plus(1)));
        const percent = boost.times(100).toFixed(1);
        return { cost, boost, percent };
    }

    get elementColors() {
        const upgrade = dom.getElement(`#${this.id}-upgrade`);
        const recruitColor = dom.getColor(
            this.resource.total, this.costByQuantity.cost, '#2c8172'
        );
        const upgradeColor = dom.getColor(
            this.resource.total, upgrade?.dataset.cost ?? 0, '#009963'
        );
        return { recruitColor, upgradeColor };
    }

    nextCost(recruited) {
        return this.baseCost.times(new Decimal(1.12).pow(recruited));
    }

    editSpecialCharacters() {
        // Box drawing characters in the stats modal
        if (this.product instanceof Ant) {
            const character = `#${this.product.abbreviation}-se-char`;
            dom.getElement(character).innerHTML = '\u251C\u2500';
        }
    }

    recruit() {
        const { quantity, cost } = this.costByQuantity;

        if (this.resource.total.greaterThanOrEqualTo(cost)) {
            this.resource.total = this.resource.total.minus(cost);
            this.recruited = this.recruited.plus(quantity);
            this.acquired = this.acquired.plus(quantity);
        }
    }

    generate(amount) {
        if (this.product instanceof Ant) {
            this._product.acquired = this._product.acquired.plus(amount);
        } else {
            this._product.total = this._product.total.plus(amount);
        }
    }

    upgradeHandler() {
        if (this.isUpgradeUnlocked) {
            const selector = `#${this.id}-upgrade`;
            this.createUpgradeElement();

            dom.eventListener(selector, 'click', () => {
                this.upgradeProduction(selector);
            });
        }
    }

    createUpgradeElement() {
        const selector = `#${this.colony.toLowerCase()}-upgrade-container`;
        const container = dom.getElement(selector);
        const upgrade = document.createElement('button');
        const { cost, boost, percent } = this.upgradeValues;

        upgrade.type = 'button';
        upgrade.className = 'ant-upgrade-button';
        upgrade.id = `${this.id}-upgrade`;
        upgrade.dataset.id = this.id;
        upgrade.dataset.string = `${this.name}\nUpgrade ${this.level.plus(1)}
        \nCost: ${number(cost)}
        \nBoosts production by ${percent}%
        for every ${this.abbreviation} recruited.`;
        upgrade.dataset.cost = cost;
        upgrade.dataset.boost = boost;
        upgrade.innerText = this.abbreviation;

        container.appendChild(upgrade);
    }

    upgradeProduction(upgradeId) {
        const upgrade = dom.getElement(upgradeId);
        const cost = new Decimal(upgrade.dataset.cost);
        const boost = new Decimal(upgrade.dataset.boost);

        if (this.resource.total.greaterThanOrEqualTo(cost)) {
            this.resource.total = this.resource.total.minus(cost);
            this.boost = this.boost.plus(boost);
            this.level = this.level.plus(1);
            upgrade.remove();
        }
    }

    progression() {
        if (this.isUnlocked) {
            this.generate(this.production.tick);
            this.upgradeHandler();
            dom.updateElements(this.elements);
        }
    }
}

export default Ant;
