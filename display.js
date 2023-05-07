import { recruits, resources, stats, conditions, timers } from './index.js';
import * as game from './game.js';

// Updates to run after the progression cycle
function update() {
    // Update resource information
    document.getElementById('food-total').innerHTML = game.util.numbers(resources.food.total);
    document.getElementById('food-production').innerHTML = game.util.numbers(resources.food.production);

    for (let [type, ants] of Object.values(recruits).entries()) {
        for (let [tier, ant] of Object.values(ants).entries()) {
            // Determine if the cost threshold has been met to display the next ant
            const displayCostThreshold = (ant.acquired == 0) && (resources.food.total < (ant.cost / 4));
            let display = (displayCostThreshold && (ant.visible === false)) ? 'none' : '';
            ant.visible = (display == '') ? true : false;
            
            // Update visibility of the ant's information
            const antContainers = document.getElementsByClassName(ant.id + '-data');
            for (const antData of antContainers) {
                antData.style.display = display;
            };

            // Update the ant's data if visible
            if (ant.visible) {
                const totalProduction = (1 + (ant.boost * ant.recruited)) * ant.production * ant.acquired;
                const q = game.calculate.costByQuantity(ant, tier);

                document.getElementById(ant.id + '-recruited').innerHTML = game.util.numbers(ant.recruited);
                document.getElementById(ant.id + '-acquired').innerHTML = game.util.numbers(ant.acquired);
                document.getElementById(ant.id + '-production').innerHTML = game.util.numbers(totalProduction) + ' ' + ant.prod_abb;
                document.getElementById(ant.id + '-cost').innerHTML = game.util.numbers(q.cost);
                document.getElementById(ant.id + '-quantity').innerHTML = game.util.numbers(q.quantity);
            };
        };
    };
};

function antUpgradeElement(ant, upgrade) {
    const upgradeContainer = document.getElementsByClassName('upgrade-button-container')[0];
    const buttonElement = document.createElement('button');
    buttonElement.type = 'button';
    buttonElement.className = 'upgrade-button';
    buttonElement.id = `${ant.id}-upgrade`;
    buttonElement.dataset.id = ant.id;
    buttonElement.dataset.string = `${ant.name} Upgrade ${(ant.upgrades + 1)}
        \nCost: ${game.util.numbers(upgrade.cost)}
        \nBoosts production by ${upgrade.percent} for every ${ant.id_abb} recruited`;
    buttonElement.dataset.cost = upgrade.cost;
    buttonElement.dataset.boost = upgrade.boost;
    buttonElement.innerText = ant.id_abb;
    upgradeContainer.appendChild(buttonElement);

    game.init.antUpgradeEventListener(ant);
};

function settings(display) {
    const defaultContainer = document.getElementById('main-container');
    const settingsContainer = document.getElementById('settings-container');
    const elementsToHide = document.getElementsByClassName('main-container');
    
    for (const container of elementsToHide) {
        container.style.display = 'none'
    };
    
    const container = display ? settingsContainer : defaultContainer;
    container.style.display = 'flex';
};

function importExportModal() {
    document.getElementById('import-export-field').value = '';
    const modal = document.getElementById('import-export-modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
};

export default {
    update,
    antUpgradeElement,
    settings,
    importExportModal,
};