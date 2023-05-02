import { recruits, resources, stats, conditions, timers } from './index.js';
import * as game from './game.js';

// Update the game UI
function update() {
    // Update resource information
    document.getElementById('food-total').innerHTML = game.util.numbers(resources.food.total);
    document.getElementById('food-production').innerHTML = game.util.numbers(resources.food.production);

    for (let [type, ants] of Object.values(recruits).entries()) {
        for (let [tier, ant] of Object.values(ants).entries()) {

            // Determine if the cost threshold has been met to display the next ant
            const displayCostThreshold = (ant.owned == 0) && (resources.food.total < (ant.cost / 4));
            let display = (displayCostThreshold && (ant.visible == false)) ? 'none' : '';
            
            // Update visibility of the ant's information
            document.getElementById(ant.id + '-button').style.display = display;
            document.getElementById(ant.id + '-data-1').style.display = display;
            document.getElementById(ant.id + '-data-2').style.display = display;

            // Update the ant's display if visible
            if (display == "") {
                const totalProduction = (1 + (ant.boost * ant.bought)) * ant.production * ant.owned;
                ant.visible = true;

                document.getElementById(ant.id + '-bought').innerHTML = game.util.numbers(ant.bought);
                document.getElementById(ant.id + '-owned').innerHTML = game.util.numbers(ant.owned);
                document.getElementById(ant.id + '-production').innerHTML = game.util.numbers(totalProduction) + ' ' + ant.prod_abb;
                document.getElementById(ant.id + '-cost').innerHTML = game.util.numbers(ant.cost);
            };
        };
    };
};

// Toggle the display for settings
function settings(display) {
    const defaultContainer = document.getElementById('main-container');
    const settingsContainer = document.getElementById('settings-container');
    const elementsToHide = document.getElementsByClassName('main-container');
    
    for (const container of elementsToHide) {
        container.style.display = 'none'
    };
    
    const container = display ? settingsContainer : defaultContainer;
    container.style.display = 'flex';
};

export default {
    update,
    settings,
};