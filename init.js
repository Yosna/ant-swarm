import save from './utilities/save.js';
import logger from './utilities/logger.js';
import dom from './utilities/dom.js';
import { stats, conditions, timers } from './index.js';
import { colonies, getAntByName } from './colonies.js';
import { gather } from './forage.js';
import { offlineProgress, gameProgression } from './game.js';

const events = {
    onGather: () => {
        gather();
    },
    onRecruit: (event) => {
        getAntByName(event.target.dataset.name).recruit();
    },
    onSaveGame: () => {
        save.game();
    },
    onSaveReset: () => {
        save.reset();
    },
    onSaveImported: () => {
        save.imported();
    },
    onSaveExported: (event) => {
        save.exported(event.target.innerHTML);
    },
    onAutoSave: () => {
        dom.toggleSetting(conditions.autoSave);
    },
    onRounding: () => {
        dom.toggleSetting(conditions.rounding);
    },
    onOfflineProgression: () => {
        dom.toggleSetting(conditions.offlineProgression);
    },
    onAutoRecruit: () => {
        dom.toggleSetting(conditions.autoRecruit);
    },
    onClearLog: () => {
        dom.getElement('.message-log').innerHTML = '';
    },
    onNewQuantity: (event) => {
        event.target.blur();
    },
    toggleModal: (event) => {
        if (event.target.dataset.modal === 'import-export-modal') {
            document.dom.getElementById('import-export-field').value = '';
        }
        dom.toggleModal(event.target);
    },
    hideInactiveWindow: (event) => {
        const modals = ['settings', 'stats', 'import-export'];
        for (const modal in modals) {
            const selector = `#${modals[modal]}-modal`;
            const exception = `${modals[modal]}-toggle`;
            if (!event.target.matches(selector) &&
                !dom.getElement(selector).contains(event.target) &&
                !event.target.classList.contains(exception)
            ) {
                dom.getElement(selector).classList.add('collapse');
            }
        }
    },
    toggleGardenColony: (event) => {
        console.log(event.target.id.length);
        colonies.garden.toggleStatSubentries(event.target);
    },
    detectVisibility: () => {
        conditions.activeWindow.status = !conditions.activeWindow.status;

        // This is only for development; it corrects the condition
        // whenever the window is reloaded while inactive.
        if (document.visibilityState === 'visible' && !conditions.activeWindow.status) {
            conditions.activeWindow.status = true;
        }

        if (conditions.activeWindow.status) {
            // calculate.offlineProgress();
        }
    },
    horizontalScroll: (event) => {
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            event.preventDefault();
            // Target the parent element if the cursor
            // is hovering over a button element
            const target = event.target.tagName === 'DIV'
                ? event.target
                : event.target.parentElement;
            target.scrollLeft += event.deltaY;
        }
    }
};

const eventListeners = getEventListeners({
    gather: dom.eventListener('#forage-button', 'click', events.onGather),
    recruit: dom.eventListener('.recruit-button', 'click', events.onRecruit),
    save: dom.eventListener('#save-button', 'click', events.onSaveGame),
    resetSave: dom.eventListener('#delete-button', 'click', events.onSaveReset),
    importSave: dom.eventListener('#import-button', 'click', events.onSaveImported),
    exportSave: dom.eventListener('.export-button', 'click', events.onSaveExported),
    autoSave: dom.eventListener('#auto-save-button', 'click', events.onAutoSave),
    rounding: dom.eventListener('#rounding-button', 'click', events.onRounding),
    offlineProgression: dom.eventListener('#offline-progression-button', 'click', events.onOfflineProgression),
    autoRecruit: dom.eventListener('#auto-recruit-button', 'click', events.onAutoRecruit),
    clearLog: dom.eventListener('#clear-log-button', 'click', events.onClearLog),
    newQuantity: dom.eventListener('#quantity-selection', 'change', events.onNewQuantity),
    importExportModal: dom.eventListener('.import-export-toggle', 'click', events.toggleModal),
    settingsModal: dom.eventListener('.settings-toggle', 'click', events.toggleModal),
    statsModal: dom.eventListener('.stats-toggle', 'click', events.toggleModal),
    activeModal: dom.eventListener(null, 'click', events.hideInactiveWindow),
    gardenColonyStats: dom.eventListener('#garden-colony-stats', 'click', events.toggleGardenColony),
    visibility: dom.eventListener(null, 'visibilitychange', events.detectVisibility),
    overflow: dom.eventListener('.upgrade-button-container', 'wheel', events.horizontalScroll)
});

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
    for (const eventListener of eventListeners) {
        eventListener();
    }
}

function setToggles() {
    for (const iteration in conditions) {
        const condition = conditions[iteration];
        if (condition.id) {
            condition.status = !condition.status;
            dom.toggleSetting(condition);
        }
    }
}

function setTimers() {
    timers.progression = setInterval(gameProgression, stats.tickSpeed);
    timers.autoSave = setInterval(function() {
        if (conditions.autoSave.status && conditions.activeWindow.status) {
            save.game();
        }
    }, 180000);
}

function load() {
    const existingSave = localStorage.getItem('save');
    const status = existingSave ? save.load(existingSave) : save.create();
    logger(status);

    if (existingSave) {
        setToggles();
        offlineProgress();
    }
    setEventListeners();
    setTimers();
}

window.onload = load();
