import { recruits, resources, stats, conditions, timers } from './index.js';
import * as game from './game.js';

function offlineProgress() {
    game.util.log('Calculating offline time...');

    const elapsedTime = (Date.now() - stats.lastUpdate);
    const cycles = Math.floor(elapsedTime / stats.tickSpeed);

    game.util.log('You were away for', (elapsedTime / 1000), 'seconds');
    game.util.log('Progressing', cycles, 'cycles');

    for (let i = 0; i < cycles; i++) {
        game.progression();
    };
    
    game.util.save();
};

function upgrades() {
    for (let [type, ants] of Object.values(recruits).entries()) {
        for (let [tier, ant] of Object.values(ants).entries()) {
            let displayed = false;

            // Determine the number of ants bought that unlock each upgrade
            const breakpoint = [10, 25, 50, 100, 200, 300, 400, 500, 750, 1000];

            // Determine if any upgrade breakpoints have been hit
            if ((ant.upgrades < 10) && (ant.bought >= breakpoint[ant.upgrades])) {
                const upgradeContainer = document.getElementsByClassName('upgrade-button-container')[0];
                const upgradesUnlocked = upgradeContainer.querySelectorAll('*');

                // Check if the upgrade is already unlocked
                for (let i = 0; i < (upgradesUnlocked.length); i++) {
                    if (upgradesUnlocked[i].id == (ant.id + '-upgrade')) {
                        displayed = true;
                    };
                };
                
                // Create and display a new upgrade element once the prerequisites have been met
                if (displayed == false) {
                    
                    // Calculate the cost for the next upgrade
                    const antCostAtBreakpoint = (1 * Math.pow(10, tier * 2)) * Math.pow(1.12, breakpoint[ant.upgrades]) * (tier + 1);
                    let upgradeCost = (antCostAtBreakpoint * 12) * Math.pow(1.2, ant.upgrades);
                    if (upgradeCost < 10000) upgradeCost = Math.floor(upgradeCost);

                    // Calculate the production boost of the upgrade
                    const productionBoost = 0.001 * (ant.upgrades + 1);
                    const productionPercent = (productionBoost * 100).toFixed(1) + '%';

                    const buttonElement = `
                        <button
                            type="button" 
                            class="upgrade-button"
                            id="${ant.id}-upgrade"
                            onclick="game.buyUpgrade('${ant.id}')"
                            data-string=
                                "${ant.name}
                                Upgrade ${(ant.upgrades + 1)}\n
                                Cost: ${game.util.numbers(upgradeCost)}\n
                                Boosts production by ${productionPercent} 
                                for every ${ant.id_abb} recruited"
                            data-cost="${upgradeCost}"
                            data-boost="${productionBoost}"
                        >
                            ${ant.id_abb}
                        </button>
                    `;
            
                    upgradeContainer.innerHTML += buttonElement;
                };
            };
        };
    };
};

function resourceProduction() {
    let foodPerSecond = 0;

    for (let [type, ants] of Object.values(recruits).entries()) {
        for (let [tier, ant] of Object.values(ants).entries()) {
            const productionBoost = 1 + (ant.boost * ant.bought);
            const productionPerTick = ant.production * ant.owned * productionBoost * (stats.tickSpeed / 1000);
            const lastAnt = Object.values(recruits)[type][Object.keys(ants)[tier - 1]];

            try { 
                lastAnt.owned += productionPerTick;
            } catch { 
                resources.food.total += productionPerTick;
                foodPerSecond += ant.production * ant.owned * productionBoost;
            };

            // Calculate the cost of the next ant
            ant.cost = (1 * Math.pow(10, tier * 2)) * Math.pow(1.12, ant.bought) * (tier + 1);
        };
    };

    resources.food.production = foodPerSecond;
};

export default {
    offlineProgress,
    upgrades,
    resourceProduction,
};