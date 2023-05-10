import { resources } from './index.js';
import * as game from './game.js';
import { number } from './util.js';

// Updates to run after the progression cycle
function update() {
    resourceElements();
    antElements();
}

function resourceElements() {
    updateElement('#food-total', 'innerHTML', number(resources.food.total));
    updateElement('#food-production', 'innerHTML', number(resources.food.production));
}

function antElements() {
    for (const { ant } of game.getAnts()) {
        ant.unlocked = unlockRequirement(ant) ? updateAnt(ant) : false;
    }
}

function unlockRequirement(ant) {
    const conditions =
        (resources.food.total > (ant.cost / 4)) +
        (ant.acquired === 0) +
        !ant.unlocked;
    if (conditions === 3) {
        updateElement(`.${ant.id}-data`, 'style.visibility', 'visible');
    }
    return ant.unlocked ? true : conditions === 3;
}

function updateAnt(ant) {
    const totalProduction = game.calculate.totalProduction(ant);
    const { quantity, cost } = game.calculate.costByQuantity(ant);

    const elements = {
        recruited: {
            selector: `#${ant.id}-recruited`, value: number(ant.recruited)
        },
        acquired: {
            selector: `#${ant.id}-acquired`, value: number(ant.acquired)
        },
        production: {
            selector: `#${ant.id}-production`, value: totalProduction
        },
        cost: {
            selector: `#${ant.id}-cost`, value: number(cost)
        },
        quantity: {
            selector: `#${ant.id}-quantity`, value: number(quantity)
        }
    };

    for (const [, element] of Object.values(elements).entries()) {
        updateElement(element.selector, 'innerHTML', element.value);
    }

    return true;
}

function antUpgradeElement(ant, upgrade) {
    const container = document.getElementsByClassName('upgrade-button-container')[0];
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'upgrade-button';
    button.id = `${ant.id}-upgrade`;
    button.dataset.id = ant.id;
    button.dataset.string = `${ant.name}\nUpgrade ${(ant.upgrades + 1)}
        \nCost: ${number(upgrade.cost)}
        \nBoosts production by ${upgrade.percent}\nfor every ${ant.id_abb} recruited`;
    button.dataset.cost = upgrade.cost;
    button.dataset.boost = upgrade.boost;
    button.innerText = ant.id_abb;

    container.appendChild(button);

    game.init.eventListener(`#${button.id}`, 'click', () => {
        game.buyAntUpgrade(ant.id);
    });
}

function settings(display) {
    const defaultContainer = document.getElementById('main-container');
    const settingsContainer = document.getElementById('settings-container');
    const elementsToHide = document.getElementsByClassName('main-container');

    for (const container of elementsToHide) {
        container.style.display = 'none';
    }

    const container = display ? settingsContainer : defaultContainer;
    container.style.display = 'flex';
}

function importExportModal() {
    document.getElementById('import-export-field').value = '';
    const modal = document.getElementById('import-export-modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function updateElement(selector, property, value) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
        const p = property.split('.');
        let obj = element;
        for (let i = 0; i < p.length - 1; i++) {
            obj = obj[p[i]];
        }
        obj[p[p.length - 1]] = value;
    }
}

export default {
    update,
    antUpgradeElement,
    settings,
    importExportModal,
    updateElement
};

export { updateElement };
