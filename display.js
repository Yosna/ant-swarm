import { resources } from './index.js';
import * as game from './game.js';
import { number, getElement } from './util.js';

const element = {
    update: function(selector, property, value) {
        const selected = document.querySelectorAll(selector);
        for (const key of selected) {
            const p = property.split('.');
            let obj = key;
            for (let i = 0; i < p.length - 1; i++) {
                obj = obj[p[i]];
            }
            obj[p[p.length - 1]] = value;
        }
    },
    hide: (target) => target.classList.toggle('hidden'),
    collapse: (target) => target.classList.toggle('collapse'),
    arrow: function(target) {
        target.innerHTML === '▲'
            ? target.innerHTML = '▼'
            : target.innerHTML = '▲';
    }
};

const modals = {
    settings: function() {
        const modal = document.getElementById('settings-modal');
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
    },
    statistics: function() {
        const modal = document.getElementById('stats-modal');
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
    },
    importExport: function() {
        document.getElementById('import-export-field').value = '';
        const modal = document.getElementById('import-export-modal');
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
    }
};

const statistics = {
    update: function(id, value) {
        (getElement(id).innerHTML = value);
    },
    ants: {
        garden: function() {
            element.collapse(getElement('#garden-ant-subentries'));
            element.arrow(getElement('#garden-ant-arrow'));
        }
    }
};

const upgradeElement = {
    forage: {
        yield: function() {
            //
        }
    },
    ants: function(ant, upgrade) {
        const container = document.getElementsByClassName('upgrade-button-container')[ant.type];
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'ant-upgrade-button';
        button.id = `${ant.id}-upgrade`;
        button.dataset.id = ant.id;
        button.dataset.string = `${ant.name}\nUpgrade ${(ant.upgrades.plus(1))}
            \nCost: ${upgrade.cost}
            \nBoosts production by ${upgrade.percent}\nfor every ${ant.id_abb} recruited`;
        button.dataset.cost = upgrade.cost;
        button.dataset.boost = upgrade.boost;
        button.innerText = ant.id_abb;

        container.appendChild(button);

        game.init.eventListener(`#${button.id}`, 'click', () => {
            game.antUpgrades.buy(ant.id);
        });
    }
};

// Updates to run after the progression cycle
function update() {
    resourceElements();
    antElements();
}

function resourceElements() {
    element.update('#food-total', 'innerHTML', number(resources.food.total));
    element.update('#food-production', 'innerHTML', number(resources.food.production));
}

function antElements() {
    for (const { ant, lastAnt } of game.getAnts()) {
        ant.unlocked = game.calculate.ants.requirement(ant, lastAnt)
            ? updateAnt(ant)
            : false;
    }
}

function updateAnt(ant) {
    const production = game.calculate.ants.production(ant);
    const { quantity, cost } = game.calculate.ants.quantityCost(ant);

    const elements = {
        recruited: {
            selector: `#${ant.id}-recruited`, value: number(ant.recruited)
        },
        acquired: {
            selector: `#${ant.id}-acquired`, value: number(ant.acquired)
        },
        production: {
            selector: `#${ant.id}-production`, value: production.total
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

    for (const [, antElement] of Object.entries(elements)) {
        if (antElement.value === undefined) { // Update the button element's color
            if (resources.food.total.greaterThanOrEqualTo(cost)) {
                element.update(antElement.selector, 'style.backgroundColor', '#2c8172');
            } else {
                element.update(antElement.selector, 'style.backgroundColor', '#455b55');
            }
        } else {
            element.update(antElement.selector, 'innerHTML', antElement.value);
        }
    }
    antUpgrades(ant);
    return true;
}

function antUpgrades(ant) {
    const upgrade = document.getElementById(`${ant.id}-upgrade`);
    if (upgrade) {
        const cost = new Decimal((upgrade.getAttribute('data-cost')).replace(/,/g, ''));
        if (resources.food.total.greaterThanOrEqualTo(cost)) {
            element.update(`#${ant.id}-upgrade`, 'style.backgroundColor', '#009963');
        } else {
            element.update(`#${ant.id}-upgrade`, 'style.backgroundColor', '#455b55');
        }
    }
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

export default {
    update,
    element,
    modals,
    statistics,
    upgradeElement
};

export { element };
