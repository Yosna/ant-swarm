import { recruits, resources, stats, conditions } from './index.js';
import * as game from './game.js';

function load() {
    gameEventListeners();
    menuEventListeners();
    saveEventListeners();
    settingsEventListeners();
    utilityEventListeners();

    const saveFound = localStorage.getItem('saveData');
    saveFound ? game.init.getSave(saveFound) : game.init.newSave();

    conditions.autoSave = !conditions.autoSave;
    conditions.rounding = !conditions.rounding;
    game.util.toggleAutoSave();
    game.util.toggleRounding();
    game.util.setTimers();
}

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
    }
}

function newSave() {
    game.util.log('Creating new save data...');

    for (const [type, ants] of Object.values(recruits).entries()) {
        for (const [tier, ant] of Object.values(ants).entries()) {
            ant.unlocked = false;
            ant.recruited = 0;
            ant.acquired = 0;
            ant.production = 0.1;
            ant.boost = 0;
            ant.upgrades = 0;
            ant.type = type;
            ant.tier = tier;
            ant.cost = (1 * Math.pow(10, tier * 2)) * (tier + 1);
        }
    }
    game.util.save();
}

function eventListener(selector, event, callback) {
    if (selector) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
            element.addEventListener(event, callback);
        }
    } else {
        document.addEventListener(event, callback);
    }
}

function gameEventListeners() {
    eventListener('#forage-button', 'click', game.forage);
    eventListener('.recruit-button', 'click', e => {
        game.recruit(e.target);
    });
}

function menuEventListeners() {
    eventListener('.import-export-toggle', 'click', game.display.importExportModal);
    eventListener('.settings-toggle', 'click', e => {
        const display = e.target.innerText === 'Settings';
        game.display.settings(display);
    });
}

function saveEventListeners() {
    eventListener('#save-button', 'click', game.util.save);
    eventListener('#delete-button', 'click', game.util.deleteSave);
    eventListener('#import-button', 'click', game.util.importSave);
    eventListener('.export-button', 'click', e => {
        game.util.exportSave(e.target.innerHTML);
    });
}

function settingsEventListeners() {
    eventListener('#autosave-button', 'click', game.util.toggleAutoSave);
    eventListener('#quantity-selection', 'change', e => {
        for (const ant of game.getAnts()) {
            game.calculate.costByQuantity(ant);
            e.target.blur();
        }
    });
    eventListener('#rounding-button', 'click', game.util.toggleRounding);
    eventListener('#clear-log-button', 'click', game.util.clearLogs);
}

function utilityEventListeners() {
    eventListener(null, 'visibilitychange', () => {
        conditions.activeWindow = !conditions.activeWindow;
        if (conditions.activeWindow) {
            game.calculate.offlineProgress();
        }
    });
    eventListener('.upgrade-container', 'wheel', e => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.target.scrollLeft += e.deltaY;
        }
    });
}

export default {
    load,
    getSave,
    newSave,
    eventListener
};
