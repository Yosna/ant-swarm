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
        logger(save.game());
    },
    onSaveReset: () => {
        save.reset();
    },
    onSaveImported: () => {
        logger(save.imported());
    },
    onSaveExported: (event) => {
        logger(save.exported(event.target.innerHTML));
    },
    onAutoSave: () => {
        logger(dom.toggleSetting(conditions.autoSave));
    },
    onRounding: () => {
        logger(dom.toggleSetting(conditions.rounding));
    },
    onOfflineProgression: () => {
        logger(dom.toggleSetting(conditions.offlineProgression));
    },
    onAutoRecruit: () => {
        logger(dom.toggleSetting(conditions.autoRecruit));
    },
    onClearLog: () => {
        dom.getElement('.message-log').innerHTML = '';
    },
    onNewQuantity: (event) => {
        event.target.blur();
    },
    toggleModal: (event) => {
        if (event.target.dataset.modal === 'import-export-modal') {
            dom.getElement('#import-export-field').value = '';
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
            offlineProgress();
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

const eventListeners = [
    () => dom.eventListener('#forage-button', 'click', events.onGather),
    () => dom.eventListener('.recruit-button', 'click', events.onRecruit),
    () => dom.eventListener('#save-button', 'click', events.onSaveGame),
    () => dom.eventListener('#delete-button', 'click', events.onSaveReset),
    () => dom.eventListener('#import-button', 'click', events.onSaveImported),
    () => dom.eventListener('.export-button', 'click', events.onSaveExported),
    () => dom.eventListener('#auto-save-button', 'click', events.onAutoSave),
    () => dom.eventListener('#rounding-button', 'click', events.onRounding),
    () => dom.eventListener('#offline-progression-button', 'click', events.onOfflineProgression),
    () => dom.eventListener('#auto-recruit-button', 'click', events.onAutoRecruit),
    () => dom.eventListener('#clear-log-button', 'click', events.onClearLog),
    () => dom.eventListener('#quantity-selection', 'change', events.onNewQuantity),
    () => dom.eventListener('.import-export-toggle', 'click', events.toggleModal),
    () => dom.eventListener('.settings-toggle', 'click', events.toggleModal),
    () => dom.eventListener('.stats-toggle', 'click', events.toggleModal),
    () => dom.eventListener(null, 'click', events.hideInactiveWindow),
    () => dom.eventListener('#garden-colony-stats', 'click', events.toggleGardenColony),
    () => dom.eventListener(null, 'visibilitychange', events.detectVisibility),
    () => dom.eventListener('.upgrade-button-container', 'wheel', events.horizontalScroll)
];
const initEventListeners = () => eventListeners.forEach((listener) => listener());

const setToggles = () => {
    for (const iteration in conditions) {
        const condition = conditions[iteration];
        if (condition.id) {
            condition.status = !condition.status;
            dom.toggleSetting(condition);
        }
    }
};

const setTimers = () => {
    timers.progression = setInterval(gameProgression, stats.tickSpeed);
    timers.autoSave = setInterval(() => save.now() ? save.game() : null, 180000);
};

const load = () => {
    const existingSave = localStorage.getItem('save');
    const status = existingSave ? save.load(existingSave) : save.create();
    logger(status);

    if (existingSave) {
        setToggles();
        offlineProgress();
    }
    initEventListeners();
    setTimers();
};

window.onload = load();
