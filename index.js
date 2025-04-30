import Decimal from './classes/decimal.mjs';

const resources = {
    food: {
        name: 'food',
        abbreviation: 'F',
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
    firstUpdate: new Decimal(Date.now()),
    lastUpdate: new Decimal(Date.now()),
    tickSpeed: new Decimal(100),

    forage: {
        total: new Decimal(0)
    },
    gatherRate: {
        value: new Decimal(0.1),
        upgrades: new Decimal(0)
    }
};

const conditions = {
    activeWindow: {
        status: true
    },
    offlineProgression: {
        name: 'Offline Progression',
        id: 'offline-progression',
        status: true
    },
    autoSave: {
        name: 'Auto Save',
        id: 'auto-save',
        status: true
    },
    rounding: {
        name: 'Rounding',
        id: 'rounding',
        status: false
    },
    autoRecruit: {
        name: 'Auto Recruit',
        id: 'auto-recruit',
        status: false
    }
};

const timers = {
    progression: null,
    autoSave: null
};

export {
    resources,
    stats,
    conditions,
    timers
};
