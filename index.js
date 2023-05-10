import * as game from './game.js';

const recruits = {
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
        total: 0,
        production: 0
    }
};

const stats = {
    foraging: {
        rate: 0.1,
        boost: 1
    },
    tickSpeed: 100,
    lastUpdate: Date.now()
};

const conditions = {
    activeWindow: true,
    autoSave: true,
    rounding: false
};

const timers = {
    progression: null,
    autoSave: null
};

export { recruits, resources, stats, conditions, timers };

window.onload = game.init.load();
