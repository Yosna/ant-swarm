import { resources } from './index.js';
import * as game from './game.js';
import { number } from './util.js';

const modals = {
    settings: function() {
        const modal = document.getElementById('settings-modal');
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
    },
    stats: function() {
        const modal = document.getElementById('stats-modal');
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
    },
    importExport: function() {
        document.getElementById('import-export-field').value = '';
        const modal = document.getElementById('import-export-modal');
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
    }
};

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
        if (ant.unlocked) {
            antUpgrades(ant);
        }
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
        },
        button: {
            selector: `#${ant.id}-button`
        }
    };

    for (const [, element] of Object.entries(elements)) {
        if (element.value === undefined) {
            if (resources.food.total >= cost) {
                updateElement(element.selector, 'style.backgroundColor', '#2c8172');
            } else {
                updateElement(element.selector, 'style.backgroundColor', '#455b55');
            }
        } else {
            updateElement(element.selector, 'innerHTML', element.value);
        }
    }
    return true;
}

function antUpgrades(ant) {
    const upgrade = document.getElementById(`${ant.id}-upgrade`);
    if (upgrade) {
        const cost = Number(upgrade.getAttribute('data-cost'));
        if (resources.food.total >= cost) {
            updateElement(`#${ant.id}-upgrade`, 'style.backgroundColor', '#009963');
        } else {
            updateElement(`#${ant.id}-upgrade`, 'style.backgroundColor', '#455b55');
        }
    }
}

function antUpgradeElement(ant, upgrade) {
    const container = document.getElementsByClassName('upgrade-button-container')[ant.type];
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'ant-upgrade-button';
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

/*
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
*/

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
    modals,
    update,
    antUpgradeElement,
    updateElement
};

export { updateElement };
