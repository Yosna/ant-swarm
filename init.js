import { recruits, resources, stats, conditions } from './index.js';
import * as game from './game.js';
import { getElement } from './util.js';
import { updateElement } from './display.js';

const eventListeners = getEventListeners({
    gameEvents: {
        forage: eventListener('#forage-button', 'click', game.forage),
        recruit: eventListener('.recruit-button', 'click', e => {
            game.recruit(e.target);
        })
    },
    menuEvents: {
        importExport: eventListener('.import-export-toggle', 'click', game.display.modals.importExport),
        settings: eventListener('.settings-toggle', 'click', game.display.modals.settings),
        stats: eventListener('.stats-toggle', 'click', game.display.modals.stats)
    },
    saveEvents: {
        save: eventListener('#save-button', 'click', game.util.save),
        del: eventListener('#delete-button', 'click', game.util.deleteSave),
        import: eventListener('#import-button', 'click', game.util.importSave),
        export: eventListener('.export-button', 'click', e => {
            game.util.exportSave(e.target.innerHTML);
        })
    },
    settingsEvents: {
        autoSave: eventListener('#autosave-button', 'click', game.util.toggleAutoSave),
        quantity: eventListener('#quantity-selection', 'change', e => {
            for (const { ant } of game.getAnts()) {
                game.calculate.costByQuantity(ant);
                e.target.blur();
            }
        }),
        rounding: eventListener('#rounding-button', 'click', game.util.toggleRounding),
        clearLog: eventListener('#clear-log-button', 'click', game.util.clearLogs)
    },
    utilityEvents: {
        visibility: eventListener(null, 'visibilitychange', () => {
            conditions.activeWindow = !conditions.activeWindow;
            if (conditions.activeWindow) {
                game.calculate.offlineProgress();
            }
        }),
        scroll: eventListener('.upgrade-button-container', 'wheel', e => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                const target = e.target.tagName === 'DIV'
                    ? e.target
                    : e.target.parentElement;
                target.scrollLeft += e.deltaY;
            }
        }),
        modals: {
            settings: eventListener(null, 'click', e => {
                hideIfNotActive('#settings-modal', e.target, 'settings-toggle');
            }),
            stats: eventListener(null, 'click', e => {
                hideIfNotActive('#stats-modal', e.target, 'stats-toggle');
            }),
            importExport: eventListener(null, 'click', e => {
                hideIfNotActive('#import-export-modal', e.target, 'import-export-toggle');
            })
        }
    }
});

function load() {
    const saveFound = localStorage.getItem('saveData');
    saveFound ? getSave(saveFound) : newSave();
    setElements();
    setEventListeners();
}

function getSave(encodedData) {
    game.util.log('Loading save data...');
    try {
        const saveData = deserialize(JSON.parse(atob(encodedData)));

        Object.assign(recruits, saveData.recruits);
        Object.assign(resources, saveData.resources);
        Object.assign(stats, saveData.stats);
        Object.assign(conditions, saveData.conditions);

        setElements();
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
            ant.recruited = new Decimal(0);
            ant.acquired = new Decimal(0);
            ant.production = new Decimal(0.1);
            ant.boost = new Decimal(0);
            ant.upgrades = new Decimal(0);
            ant.type = new Decimal(type);
            ant.tier = new Decimal(tier);
            ant.cost = game.calculate.antBaseCost(ant);
        }
    }
    game.util.save();
}

function deserialize(data) {
    const converted = {};
    for (const key in data) {
        if (typeof data[key] === 'object' && data[key] !== null) {
            converted[key] = deserialize(data[key]);
        } else {
            converted[key] = convertData(data[key], key);
        }
    }
    return converted;
}

function convertData(data, key) {
    if (!isNaN(Number(data)) && typeof data !== 'boolean') {
        return new Decimal(data);
    }
    return data;
}

function setElements() {
    getElement('#creation-date').innerHTML = stats.creationDate;
    getElement('#forage-total').innerHTML = stats.foraging.total;
    for (const { ant } of game.getAnts()) {
        if (ant.unlocked) {
            updateElement(`.${ant.id}-data`, 'style.visibility', 'visible');
        }
    }
    conditions.autoSave = !conditions.autoSave;
    conditions.rounding = !conditions.rounding;
    game.util.toggleAutoSave();
    game.util.toggleRounding();
    game.util.setTimers();
}

function * getEventListeners() {
    for (const event in eventListeners) {
        if (typeof eventListeners[event] === 'function') {
            yield eventListeners[event];
        } else {
            yield * getEventListeners(eventListeners[event]);
        }
    }
}

function setEventListeners() {
    for (const eventListener of getEventListeners()) {
        eventListener();
    }
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

function hideIfNotActive(selector, target, exception) {
    const element = $(selector);
    if (!$(target).is(element) &&
        !element.has(target).length &&
        target.className !== exception
    ) {
        element.hide();
    }
}

export default {
    load,
    getSave,
    eventListener
};
