import { resources } from './index.js';
import * as game from './game.js';

// Updates to run after the progression cycle
function update() {
    resourceElements();
    antElements();
}

function resourceElements() {
    document.getElementById('food-total').innerHTML = game.util.numbers(resources.food.total);
    document.getElementById('food-production').innerHTML = game.util.numbers(resources.food.production);
}

function antElements() {
    for (const ant of game.getAnts()) {
        ant.visible = unlockRequirement(ant) ? updateAnt(ant) : false;
        if (!ant.visible) {
            game.util.elementProperty(`.${ant.id}-data`, 'style.display', 'none');
        }
    }
}

function unlockRequirement(ant) {
    const requirement = (ant.acquired === 0) && (resources.food.total > (ant.cost / 4));
    const unlocked = (requirement && !ant.visible);
    return ant.visible ? true : unlocked;
}

function updateAnt(ant) {
    game.util.elementProperty(`.${ant.id}-data`, 'style.display', '');

    const totalProduction = game.calculate.totalProduction(ant);
    const c = game.calculate.costByQuantity(ant).calculation;

    const elements = {
        recruited: { selector: `#${ant.id}-recruited`, value: game.util.numbers(ant.recruited) },
        acquired: { selector: `#${ant.id}-acquired`, value: game.util.numbers(ant.acquired) },
        production: { selector: `#${ant.id}-production`, value: totalProduction },
        cost: { selector: `#${ant.id}-cost`, value: game.util.numbers(c.cost) },
        quantity: { selector: `#${ant.id}-quantity`, value: game.util.numbers(c.quantity) }
    };
    for (const [, element] of Object.values(elements).entries()) {
        game.util.elementProperty(element.selector, 'innerHTML', element.value);
    }

    return true;
}

function antUpgradeElement(ant, upgrade) {
    const upgradeContainer = document.getElementsByClassName('upgrade-button-container')[0];
    const buttonElement = document.createElement('button');
    buttonElement.type = 'button';
    buttonElement.className = 'upgrade-button';
    buttonElement.id = `${ant.id}-upgrade`;
    buttonElement.dataset.id = ant.id;
    buttonElement.dataset.string = `${ant.name}\nUpgrade ${(ant.upgrades + 1)}
        \nCost: ${game.util.numbers(upgrade.cost)}
        \nBoosts production by ${upgrade.percent}\nfor every ${ant.id_abb} recruited`;
    buttonElement.dataset.cost = upgrade.cost;
    buttonElement.dataset.boost = upgrade.boost;
    buttonElement.innerText = ant.id_abb;
    upgradeContainer.appendChild(buttonElement);

    game.init.eventListener(`#${buttonElement.id}`, 'click', () => {
        game.buyUpgrade(ant.id);
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

export default {
    update,
    antUpgradeElement,
    settings,
    importExportModal
};
