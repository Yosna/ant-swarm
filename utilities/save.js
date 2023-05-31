import Colony from '../classes/colony.js';
import { resources, stats, conditions } from '../index.js';
import { colonies } from '../colonies.js';
import logger from './logger.js';

function game() {
    const save = {
        resources,
        stats,
        conditions,
        colonies
    };
    const encoded = btoa(JSON.stringify(save));
    localStorage.setItem('save', encoded);

    logger('Game saved!');
}

function create() {
    logger('Creating new save data...');
    game();
    return 'Save data successfully created!';
}

function load(data) {
    logger('Loading save data...');
    try {
        const save = transformDataFormat(JSON.parse(atob(data)));

        Object.assign(resources, save.resources);
        Object.assign(stats, save.stats);
        Object.assign(conditions, save.conditions);
        Object.assign(colonies, save.colonies);

        colonies.updateReferences(resources);

        return 'Save: Success!\nLoaded existing save data.';
    } catch (error) {
        console.log(error);
        return 'Save: Invalid!\nUnable to detect valid save data. Aborting...';
    }
}

function imported() {
    const data = document.getElementById('import-export-field');
    const status = load(data.value).includes('Success')
        ? logger('Import: Success!\nSave data has been loaded')
        : logger('Import: Failed!\nPlease check the save data and try again.');
    return status;
}

function exported(method) {
    const data = document.getElementById('import-export-field');
    const save = {
        colonies,
        resources,
        stats,
        conditions
    };
    const encoded = btoa(JSON.stringify(save));
    data.value = encoded;
    const status = method.includes('File')
        ? exportToFile(data)
        : exportToClipboard(data);
    return status;
}

function exportToFile(data) {
    const d = new Date();
    const exportDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const exportTime = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
    const exportFile = `AS_Save_${exportDate}_${exportTime}.txt`;
    const exportNew = new Blob([data.value], { type: 'text/plain' });
    const exportAnchor = document.createElement('a');
    exportAnchor.href = URL.createObjectURL(exportNew);
    exportAnchor.download = exportFile;
    exportAnchor.target = '_blank';
    exportAnchor.click();
    return logger('Export: Success! Save data exported to file');
}

function exportToClipboard(data) {
    data.select();
    navigator.clipboard.writeText(data.value);
    return logger('Export: Success! Save data copied to clipboard');
}

function reset() {
    localStorage.clear();
    location.reload();
}

function transformDataFormat(save) {
    const transformed = {};
    for (const data in save) {
        if (typeof save[data] === 'object') {
            transformed[data] = deserialize(save[data]);
        } else {
            transformed[data] = determineDataType(save[data]);
        }
    }
    return transformed;
}

function deserialize(save) {
    const deserialized = {};
    for (const data in save) {
        if (save[data].validation === Colony.name) {
            deserialized[data] = Colony.fromObject(save[data]);
        } else if (typeof save[data] === 'object') {
            deserialized[data] = deserialize(save[data]);
        } else {
            deserialized[data] = determineDataType(save[data]);
        }
    }
    return deserialized;
}

function determineDataType(data) {
    // convert strings of valid numbers to a Decimal object
    if (typeof data === 'string' && !isNaN(Number(data))) {
        return new Decimal(data);
    }
    return data;
}

export default {
    game,
    create,
    load,
    imported,
    exported,
    reset
};
