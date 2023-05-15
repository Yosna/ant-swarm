import { colonies, resources, stats, conditions } from './index.js';
import * as game from './game.js';
import { getElement } from './util.js';
import { element } from './display.js';

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
        stats: eventListener('.stats-toggle', 'click', game.display.modals.statistics)
    },
    saveEvents: {
        save: eventListener('#save-button', 'click', game.util.save.game),
        del: eventListener('#delete-button', 'click', game.util.save.delete),
        import: eventListener('#import-button', 'click', game.util.save.import),
        export: eventListener('.export-button', 'click', e => {
            game.util.save.export(e.target.innerHTML);
        })
    },
    settingsEvents: {
        offline: eventListener('#offline-progress-button', 'click', () => {
            game.util.toggleSetting(conditions.offlineProgress, '#898989');
        }),
        autoRecruit: eventListener('#auto-recruit-button', 'click', () => {
            game.util.toggleSetting(conditions.autoRecruit, '#898989');
        }),
        autoSave: eventListener('#autosave-button', 'click', () => {
            game.util.toggleSetting(conditions.autoSave, '#898989');
        }),
        quantity: eventListener('#quantity-selection', 'change', e => {
            for (const { ant } of game.getAnts()) {
                game.calculate.ants.quantityCost(ant);
                e.target.blur();
            }
        }),
        rounding: eventListener('#rounding-button', 'click', () => {
            game.util.toggleSetting(conditions.rounding, '#009963');
        }),
        clearLog: eventListener('#clear-log-button', 'click', game.util.clearLog)
    },
    utilityEvents: {
        visibility: eventListener(null, 'visibilitychange', () => {
            conditions.activeWindow.status = !conditions.activeWindow.status;
            if (conditions.activeWindow.status) {
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
    },
    statMenuEvents: {
        ants: {
            garden: eventListener('#garden-ant-stats', 'click', game.display.statistics.ants.garden)
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

        Object.assign(colonies, saveData.colonies);
        Object.assign(resources, saveData.resources);
        Object.assign(stats, saveData.stats);
        Object.assign(conditions, saveData.conditions);
        game.calculate.offlineProgress();

        return true;
    } catch (error) {
        game.util.log('Invalid save data detected! Aborting...');
        console.log(error);
        return false;
    }
}

function newSave() {
    game.util.log('Creating new save data...');
    for (const [type, ants] of Object.values(colonies).entries()) {
        for (const [tier, ant] of Object.values(ants).entries()) {
            ant.unlocked = false;
            ant.recruited = new Decimal(0);
            ant.acquired = new Decimal(0);
            ant.production = new Decimal(0.1);
            ant.boost = new Decimal(0);
            ant.upgrades = new Decimal(0);
            ant.type = new Decimal(type);
            ant.tier = new Decimal(tier);
            ant.colony = Object.keys(colonies)[type];
            ant.cost = game.calculate.ants.baseCost(ant);
        }
    }
    game.util.save.game();
}

function deserialize(data) {
    const converted = {};
    for (const key in data) {
        if (typeof data[key] === 'object' && data[key] !== null) {
            converted[key] = deserialize(data[key]);
        } else {
            converted[key] = conversion(data[key]);
        }
    }
    return converted;
}

function conversion(data) {
    if (!isNaN(Number(data)) && typeof data !== 'boolean') {
        return new Decimal(data);
    }
    return data;
}

function setElements() {
    getElement('#creation-date').innerHTML = stats.creationDate;
    getElement('#forage-total').innerHTML = stats.forage.total;
    for (const { ant, lastAnt } of game.getAnts()) {
        if (ant.unlocked) {
            if (lastAnt) {
                const char = getElement(`#${lastAnt.id_abb}-se-char`);
                char.innerHTML = '\u251C\u2500';
            }
            element.update(`.${ant.id}-data`, 'style.visibility', 'visible');
            element.collapse(getElement(`#${ant.id}-stats`));
        }
    }
    setToggles();
    game.util.setTimers();
}

function setToggles() {
    conditions.autoSave.status = !conditions.autoSave.status;
    conditions.rounding.status = !conditions.rounding.status;
    conditions.offlineProgress.status = !conditions.offlineProgress.status;
    conditions.autoRecruit.status = !conditions.autoRecruit.status;
    game.util.toggleSetting(conditions.autoSave, '#898989');
    game.util.toggleSetting(conditions.rounding, '#009963');
    game.util.toggleSetting(conditions.offlineProgress, '#898989');
    game.util.toggleSetting(conditions.autoRecruit, '#898989');
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
        const selected = document.querySelectorAll(selector);
        for (const key of selected) {
            key.addEventListener(event, callback);
        }
    } else {
        document.addEventListener(event, callback);
    }
}

function hideIfNotActive(selector, target, exception) {
    const selected = $(selector);
    if (!$(target).is(selected) &&
        !selected.has(target).length &&
        target.className !== exception
    ) {
        selected.hide();
    }
}

export default {
    load,
    getSave,
    eventListener
};
