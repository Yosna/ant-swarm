import * as game from './game.js';

const version = 'v0.2.1';

const colonies = {
    garden: {
        smallWorker: { name: 'Small Garden Worker', id: 'small-garden-worker', id_abb: 'SGW', product: 'food', prod_abb: 'F' },
        regularWorker: { name: 'Regular Garden Worker', id: 'regular-garden-worker', id_abb: 'RGW', product: 'small garden workers', prod_abb: 'SGW' },
        largeWorker: { name: 'Large Garden Worker', id: 'large-garden-worker', id_abb: 'LGW', product: 'regular garden workers', prod_abb: 'RGW' },
        smallDrone: { name: 'Small Garden Drone', id: 'small-garden-drone', id_abb: 'SGD', product: 'large garden workers', prod_abb: 'LGW' },
        regularDrone: { name: 'Regular Garden Drone', id: 'regular-garden-drone', id_abb: 'RGD', product: 'small garden drones', prod_abb: 'SGD' },
        largeDrone: { name: 'Large Garden Drone', id: 'large-garden-drone', id_abb: 'LGD', product: 'regular garden drones', prod_abb: 'RGD' },
        queen: { name: 'Garden Ant Queen', id: 'garden-ant-queen', id_abb: 'GQ', product: 'large garden drones', prod_abb: 'LGD' }
    }
};

const resources = {
    food: {
        total: new Decimal(0),
        production: new Decimal(0)
    }
};

const stats = {
    creationDate: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    }),
    firstUpdate: Date.now(),
    lastUpdate: Date.now(),
    tickSpeed: new Decimal(100),
    forage: {
        yield: new Decimal(0.1),
        boost: new Decimal(1),
        total: new Decimal(0)
    },
    ants: {
        garden: new Decimal(0)
    }
};

const upgrades = {
    forage: {
        yield: {
            unlocked: new Decimal(0),
            obtained: new Decimal(0)
        }
    }
};

const conditions = {
    activeWindow: {
        status: true
    },
    offlineProgress: {
        name: 'Offline Progress',
        id: 'offline-progress-button',
        status: true
    },
    autoRecruit: {
        name: 'Auto Recruit',
        id: 'auto-recruit-button',
        status: false
    },
    autoSave: {
        name: 'Autosave',
        id: 'autosave-button',
        status: true
    },
    rounding: {
        name: 'Rounding',
        id: 'rounding-button',
        status: false
    }
};

const timers = {
    progression: null,
    autoSave: null
};

export { version, colonies, resources, stats, conditions, upgrades, timers };

window.onload = game.init.load();
