import { recruits, resources, stats, conditions, timers } from './index.js';
import * as game from './game.js';

function load() {
    // Create event listeners for button functionality
    const forageButton = document.getElementById('forage-button');
    forageButton.addEventListener('click', game.forage);

    const recruitButtons = document.getElementsByClassName('recruit-button');
    const recruitButton = Array.from(recruitButtons);
    recruitButton.forEach(button => {
        button.addEventListener('click', e => {
            game.recruit(e.target)
        });
    });

    const quantitySelection = document.getElementById('quantity-selection');
    quantitySelection.addEventListener('change', e => {
        for (let [type, ants] of Object.values(recruits).entries()) {
            for (let [tier, ant] of Object.values(ants).entries()) {
                game.calculate.costByQuantity(ant, tier);
            };
        };
    });

    const clearLogButton = document.getElementById('clear-log-button');
    clearLogButton.addEventListener('click', game.util.clearLogs);

    const saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', game.util.save);

    const autoSaveButton = document.getElementById('autosave-button');
    autoSaveButton.addEventListener('click', game.util.autoSave);

    const importButton = document.getElementById('import-button');
    importButton.addEventListener('click', game.util.importSave);

    const exportButton = document.getElementById('export-button');
    exportButton.addEventListener('click', game.util.exportSave);

    const deleteButton = document.getElementById('delete-button');
    deleteButton.addEventListener('click', game.util.deleteSave);

    const settingsMenuButtons = document.getElementsByClassName('settings-menu');
    const settingsMenuButton = Array.from(settingsMenuButtons);
    settingsMenuButton.forEach(button => {
        button.addEventListener('click', e => {
            const display = e.target.innerText === 'Settings' ? true : false;
            game.display.settings(display);
        });
    });

    // Active window detection
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            conditions.activeWindow = true;
            game.calculate.offlineProgress();
        } else if (document.visibilityState === 'hidden') {
            conditions.activeWindow = false;
        };
        game.util.log(document.visibilityState);
    });

    // Upgrade Container event listener to change the default axial scroll direction
    const upgradeContainer = document.getElementsByClassName('upgrade-button-container')[0];
    upgradeContainer.addEventListener('wheel', function(event) {

        // Determine which axis is being scrolled
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {

            // Prevent attempted scrolling on the y-axis
            e.preventDefault();

            // Redirect the y-axis scroll distance to the x-axis
            upgradeContainer.scrollLeft += e.deltaY;
        };
    });
    
    const saveFound = localStorage.getItem('saveData');
    saveFound ? game.init.getSave(saveFound) : game.init.newSave();

    game.util.setTimers();
};

function getSave(encodedData) {
    game.util.log('Loading save data...');

    const saveData = JSON.parse(atob(encodedData));
    Object.assign(recruits, saveData.recruits);
    Object.assign(resources, saveData.resources);
    Object.assign(stats, saveData.stats);
    Object.assign(conditions, saveData.conditions);

    game.calculate.offlineProgress();
};

function newSave() {
    game.util.log('Creating new save data...');

    for (let [type, ants] of Object.values(recruits).entries()) {
        for (let [tier, ant] of Object.values(ants).entries()) {
            ant.recruited = 0;
            ant.acquired = 0;
            ant.production = .1;
            ant.boost = 0;
            ant.upgrades = 0;
            ant.cost = (1 * Math.pow(10, tier * 2)) * (tier + 1);
            ant.visible = false;
        };
    };

    game.util.save();
};

export default {
    load,
    getSave,
    newSave,
}