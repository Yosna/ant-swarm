import { recruits, resources, stats, conditions, timers } from './index.js';
import * as game from './game.js';

const scientificNotation = new Intl.NumberFormat('en-US', {
    notation: 'scientific',
    minimumSignificantDigits: 4,
    maximumSignificantDigits: 4,
    roundingMode: 'trunc'
});

function number(n) {
    switch (true) {
        case n < 100:
            return parseFloat(n.toFixed(2));
        case n < 1000:
            return parseFloat(n.toFixed(1));
        case n < 10000:
            return parseFloat(n.toFixed(1)).toLocaleString();
        default:
            return scientificNotation.format(n).toLowerCase();
    }
}

function log() {
    const entry = createLogEntry(...arguments);
    addLogEntry(entry);
}

function createLogEntry() {
    const d = new Date();
    const time = document.createElement('span');
    const text = document.createElement('span');
    time.classList.add('message-time');
    text.classList.add('message-text');
    time.textContent = `[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}]:`;
    text.textContent = `${Array.from(arguments).join(' ')}`;
    const layout = [time, text];
    const log = document.createElement('div');
    const entry = document.createElement('pre');
    log.append(...layout);
    entry.appendChild(log);
    return entry;
}

function addLogEntry(entry) {
    const log = document.querySelector('.message-log');
    log.insertBefore(entry, log.firstChild);
    if (log.childElementCount > 50) {
        log.removeChild(log.lastChild);
    }
}

function clearLogs() {
    document.querySelector('.message-log').innerHTML = '';
}

function timestamp() {
    stats.lastUpdate = Date.now();
}

function save() {
    const saveData = {
        recruits,
        resources,
        stats,
        conditions
    };

    const encodedData = btoa(JSON.stringify(saveData));
    localStorage.setItem('saveData', encodedData);

    log('Game saved!');
}

function toggleAutoSave() {
    conditions.autoSave = !conditions.autoSave;
    const autoSaveStatus = document.getElementById('autosave-status');
    autoSaveStatus.innerHTML = conditions.autoSave ? 'on' : 'off';

    log('Autosave:', conditions.autoSave ? 'enabled' : 'disabled');
}

function importSave() {
    const imported = document.getElementById('import-export-field');
    const importStatus = game.init.getSave(imported.value)
        ? log('Import success! Save data has been loaded')
        : log('Import failed! Please check the save string and try again');
    return importStatus;
}

function exportSave(method) {
    const exported = document.getElementById('import-export-field');
    const saveData = {
        recruits,
        resources,
        stats,
        conditions
    };
    const encodedData = btoa(JSON.stringify(saveData));
    exported.value = encodedData;
    const exportStatus = method.includes('File')
        ? exportToFile(exported)
        : exportToClipboard(exported);
    return exportStatus;
}

function exportToFile(exported) {
    const d = new Date();
    const exportDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const exportTime = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
    const exportFile = `AS_Save_${exportDate}_${exportTime}.txt`;
    const exportNew = new Blob([exported.value], { type: 'text/plain' });
    const exportAnchor = document.createElement('a');
    exportAnchor.href = URL.createObjectURL(exportNew);
    exportAnchor.download = exportFile;
    exportAnchor.target = '_blank';
    exportAnchor.click();
    return log('Success! Save data exported to file');
}

function exportToClipboard(exported) {
    exported.select();
    navigator.clipboard.writeText(exported.value);
    return log('Success! Save data copied to clipboard');
}

function deleteSave() {
    localStorage.clear();
    location.reload();
}

function toggleRounding() {
    conditions.rounding = !conditions.rounding;
    const roundingStatus = document.getElementById('rounding-status');
    roundingStatus.innerHTML = conditions.rounding ? 'on' : 'off';

    log('Rounding:', conditions.rounding ? 'enabled' : 'disabled');
}

function setTimers() {
    timers.progression = setInterval(game.progression, stats.tickSpeed);
    timers.autoSave = setInterval(function() {
        if (conditions.autoSave && conditions.activeWindow) save();
    }, 180000);
}

function resetTimers() {
    clearInterval(timers.progression);
    clearInterval(timers.autoSave);

    setTimers();
}

export default {
    number,
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
    resetTimers
};

export { number };
