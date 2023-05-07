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
    quantitySelection.addEventListener('change', () => {
        for (let [type, ants] of Object.values(recruits).entries()) {
            for (let [tier, ant] of Object.values(ants).entries()) {
                game.calculate.costByQuantity(ant, tier);
                quantitySelection.blur()
            };
        };
    });

    const roundingButtons = document.getElementById('rounding-button');
    roundingButtons.addEventListener('click', game.util.toggleRounding)

    const clearLogButton = document.getElementById('clear-log-button');
    clearLogButton.addEventListener('click', game.util.clearLogs);

    const saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', game.util.save);

    const importExportButtons = document.getElementsByClassName('import-export-toggle');
    const importExportButton = Array.from(importExportButtons);
    importExportButton.forEach(button => {
        button.addEventListener('click', () => {
            game.display.importExportModal();
        })
    });

    const deleteButton = document.getElementById('delete-button');
    deleteButton.addEventListener('click', game.util.deleteSave);

    const autoSaveButton = document.getElementById('autosave-button');
    autoSaveButton.addEventListener('click', game.util.toggleAutoSave);

    const importButton = document.getElementById('import-button');
    importButton.addEventListener('click', game.util.importSave);

    const exportButtons = document.getElementsByClassName('export-button');
    const exportButton = Array.from(exportButtons);
    exportButton.forEach(button => {
        button.addEventListener('click', e => {
            game.util.exportSave(e.target.innerHTML);
        });
    });

    const settingsMenuButtons = document.getElementsByClassName('settings-toggle');
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
    });

    // Upgrade Container event listener to change the default axial scroll direction
    const upgradeContainer = document.getElementsByClassName('upgrade-button-container')[0];
    upgradeContainer.addEventListener('wheel', function(e) {

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

    conditions.autoSave = !conditions.autoSave;
    conditions.rounding = !conditions.rounding;
    game.util.toggleAutoSave();
    game.util.toggleRounding();

    game.util.setTimers();
};

function getSave(encodedData) {
    game.util.log('Loading save data...');

    try {
        const saveData = JSON.parse(atob(encodedData));
        Object.assign(recruits, saveData.recruits);
        Object.assign(resources, saveData.resources);
        Object.assign(stats, saveData.stats);
        Object.assign(conditions, saveData.conditions);

        game.calculate.offlineProgress();
        return true;
    } catch (error) {
        game.util.log('Invalid save data detected! Aborting...');
        return false;
    };
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

function antUpgradeEventListener(ant) {
    const upgradeButton = document.getElementById(ant.id + '-upgrade');
    upgradeButton.addEventListener('click', () => {
        game.buyUpgrade(ant.id);
    });
};

export default {
    load,
    getSave,
    newSave,
    antUpgradeEventListener,
};