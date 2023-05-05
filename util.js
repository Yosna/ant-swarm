import { recruits, resources, stats, conditions, timers } from './index.js';
import * as game from './game.js';

const scientificNotation = new Intl.NumberFormat("en-US", {
    notation: "scientific",
    minimumSignificantDigits: 4,
    maximumSignificantDigits: 4,
    roundingMode: "trunc",
});

// Number format handling
function numbers(n) {
    // Check the value of the number and return the appropriate format
    switch (true) {
        case n < 100: 
            return parseFloat(n.toFixed(2));
        case n < 1000: 
            return parseFloat(n.toFixed(1));
        case n < 10000: 
            return parseFloat(n.toFixed(1)).toLocaleString();
        default: 
            return scientificNotation.format(n).toLowerCase();
    };
};

// Log messages to the game's window
function log() {
    const date = new Date();
    const message = `
        [${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]:
        ${Array.from(arguments).join(' ')}
    `;

    const messageLog = document.querySelector('.message-log');
    const element = document.createElement('span');

    // Append the new text element to the log container
    element.textContent = message;
    messageLog.insertBefore(element, messageLog.firstChild);

    // Limit the number of messages
    if (messageLog.childElementCount > 25) {
        messageLog.removeChild(messageLog.lastChild);
    };
};

function clearLogs() {
    document.querySelector('.message-log').innerHTML = '';
};

function timestamp() {
    stats.lastUpdate = Date.now();
};

function save() {
    const saveData = {
        recruits: recruits,
        resources: resources,
        stats: stats,
        conditions: conditions,
    };

    const encodedData = btoa(JSON.stringify(saveData));
    localStorage.setItem('saveData', encodedData);

    log('Game saved!');
};

function toggleAutoSave() {
    conditions.autoSave = !conditions.autoSave;
    let autoSaveStatus = document.getElementById('autosave-status');
    autoSaveStatus.innerHTML = conditions.autoSave ? 'on' : 'off';

    log('Autosave:', conditions.autoSave ? 'enabled' : 'disabled');
};

function importSave() {
    // placeholder
};

function exportSave() {
    // placeholder
};

function deleteSave() {
    localStorage.clear();
};

function toggleRounding() {
    conditions.rounding = !conditions.rounding;
    const roundingStatus = document.getElementById('rounding-status');
    roundingStatus.innerHTML = conditions.rounding ? 'on' : 'off';
    
    log('Rounding:', conditions.rounding ? 'enabled' : 'disabled');
}

// Create the timers for the game cycle and auto saving
function setTimers() {
    timers.progression = setInterval(game.progression, stats.tickSpeed);
    timers.autoSave = setInterval(function() {
        if (conditions.autoSave && conditions.activeWindow) save();
    }, 180000);
};

function resetTimers() {
    clearInterval(gameCycle);
    clearInterval(saveGame);

    setTimers();
};

export default {
    numbers,
    log,
    clearLogs,
    timestamp,
    save,
    toggleAutoSave,
    importSave,
    exportSave,
    deleteSave,
    toggleRounding,
    setTimers,
    resetTimers,
};