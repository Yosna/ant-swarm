import { colonies, resources, stats, conditions, timers } from './index.js';
import * as game from './game.js';
import { element } from './display.js';

const save = {
    game: function() {
        const saveData = {
            colonies,
            resources,
            stats,
            conditions
        };
        const encodedData = btoa(JSON.stringify(saveData));
        localStorage.setItem('saveData', encodedData);

        log('Game saved!');
    },
    import: function() {
        const imported = document.getElementById('import-export-field');
        const importStatus = game.init.getSave(imported.value)
            ? log('Import success! Save data has been loaded')
            : log('Import failed! Please check the save string and try again');
        return importStatus;
    },
    export: function(method) {
        const exported = document.getElementById('import-export-field');
        const saveData = {
            colonies,
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
    },
    delete: function() {
        localStorage.clear();
        location.reload();
    }
};

const DecimalRoundDown = Decimal.clone({ rounding: Decimal.ROUND_DOWN });
function number(n) {
    switch (true) {
        case n.lessThan(100):
            return parseFloat(n.toFixed(2));
        case n.lessThan(1000):
            return parseFloat(n.toFixed(1));
        case n.lessThan(10000):
            return parseFloat(n.toFixed(1)).toLocaleString();
        default:
            return DecimalRoundDown(n).toExponential(3);
    }
}

function getElement(selector) {
    return document.querySelector(selector);
}

function getElements(selector) {
    return document.querySelectorAll(selector);
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

function clearLog() {
    document.querySelector('.message-log').innerHTML = '';
}

function timestamp() {
    stats.lastUpdate = Date.now();
    const playtime = getElement('#time-since-creation');
    playtime.innerHTML = game.calculate.elapsedTime(stats.firstUpdate).format;
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

function toggleSetting(condition, color) {
    condition.status = !condition.status;

    // Update the button text to reflect the status
    const setting = getElement(`#${condition.id}`);
    const status = condition.status ? 'on' : 'off';
    setting.innerHTML = `${setting.getAttribute('data-name')} (${status})`;

    // Update the button color to reflect the status
    color = condition.status ? color : '';
    element.update(`#${setting.id}`, 'style.backgroundColor', color);
    log(`${condition.name}:`, condition.status ? 'enabled' : 'disabled');
}

function setTimers() {
    timers.progression = setInterval(game.progression, stats.tickSpeed);
    timers.autoSave = setInterval(function() {
        if (conditions.autoSave.status && conditions.activeWindow.status) {
            save.game();
        }
    }, 180000);
}

function resetTimers() {
    clearInterval(timers.progression);
    clearInterval(timers.autoSave);

    setTimers();
}

export default {
    number,
    getElement,
    getElements,
    log,
    clearLog,
    timestamp,
    toggleSetting,
    setTimers,
    resetTimers,
    save
};

export {
    number,
    getElement
};
