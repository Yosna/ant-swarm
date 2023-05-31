import Ant from './classes/ant.js';
import logger from './utilities/logger.js';
import dom from './utilities/dom.js';
import time from './utilities/time.js';
import { stats, conditions } from './index.js';
import { forageProgression } from './forage.js';
import { iterateColonies, colonyProgression } from './colonies.js';

const gameStatElements = {
    creationDate: {
        selector: '#creation-date',
        property: 'innerHTML',
        value: stats.creationDate
    },
    timeSinceCreation: {
        selector: '#time-since-creation',
        property: 'innerHTML',
        get value() {
            return time.elapsedTime(stats.firstUpdate).format;
        }
    }
};

function offlineProgress() {
    const offlineTime = time.elapsedTime(stats.lastUpdate);
    const message = `Welcome back!\nYou were away for:\n${offlineTime.format}`;
    logger(message);

    if (conditions.offlineProgression === false) {
        logger('Offline progress disabled! Aborting progress...');
        return;
    }

    let cycles = offlineTime.value.dividedBy(stats.tickSpeed).floor();
    let multiplier = new Decimal(1);
    // Cap the number of cycles to reduce loading time
    if (cycles.greaterThan(1000)) {
        multiplier = cycles.dividedBy(1000);
        cycles = new Decimal(1000);
    }

    for (let i = 0; i < cycles; i++) {
        generateProducts(multiplier);
    }
}

function generateProducts(multiplier) {
    for (const iteration of iterateColonies()) {
        if (iteration instanceof Ant) {
            const ant = iteration;
            const tick = ant.production.tick;
            const production = tick.times(multiplier);
            ant.generate(production);
        }
    }
}

// create the cycle that runs the game
function gameProgression() {
    if (conditions.activeWindow.status) {
        dom.updateElements(gameStatElements);
        forageProgression();
        colonyProgression();
        time.timestamp();
    }
}

export {
    offlineProgress,
    gameProgression
};
