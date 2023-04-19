let antSpecies = {
    garden: {
        smallWorker: {name: 'Small Garden Worker', id: 'small-garden-worker', id_abb: 'SGW', product: 'food', prod_abb: 'F/s'},
        regularWorker: {name: 'Regular Garden Worker', id: 'regular-garden-worker', id_abb: 'RGW', product: 'small garden workers', prod_abb: 'SGW/s'},
        largeWorker: {name: 'Large Garden Worker', id: 'large-garden-worker', id_abb: 'LGW', product: 'regular garden workers', prod_abb: 'RGW/s'},
        smallDrone: {name: 'Small Garden Drone', id: 'small-garden-drone', id_abb: 'SGD', product: 'large garden workers', prod_abb: 'LGW/s'},
        regularDrone: {name: 'Regular Garden Drone', id: 'regular-garden-drone', id_abb: 'RGD', product: 'small garden drones', prod_abb: 'SGD/s'},
        largeDrone: {name: 'Large Garden Drone', id: 'large-garden-drone', id_abb: 'LGD', product: 'regular garden drones', prod_abb: 'RGD/s'},
        queen: {name: 'Garden Ant Queen', id: 'garden-ant-queen', id_abb: 'GQ', product: 'large garden drones', prod_abb: 'LGD/s'},        
    },
};

let resources = {
    food: {
        total: 0,
        production: 0,
    },
};

let foragingRate = 1;
let foragingBoost = 1;

const init = (() => {
    
    function load() {
        // Set the values for all ants
        for (let [type, ants] of Object.values(antSpecies).entries()) {
            for (let [tier, ant] of Object.values(ants).entries()) {
                ant.bought = 0;
                ant.owned = 0;
                ant.production = .1;
                ant.boost = 1;
                ant.upgrades = 1;
            };
            for (let [tier, ant] of Object.values(ants).entries()) {
                ant.cost = (1 * Math.pow(10, tier * 2)) * Math.pow(1.12, ant.bought);
            };
        };

        util.timer();
    };

    return {
        load,
    };
})();

const game = (() => {

    // Gather food by foraging
    function forage() {
        resources.food.total += (foragingRate * foragingBoost);
        document.getElementById('food-total').innerHTML = util.numbers(resources.food.total);
    };

    // Recruit an ant
    function recruit(antType, antTier) {
        for (let [type, ants] of Object.values(antSpecies).entries()) {
            if (antType == type) {
                for (let [tier, ant] of Object.values(ants).entries()) {
                    if (antTier == tier) {

                        // Check if the food is sufficient
                        if (ant.cost > resources.food.total) return;

                        resources.food.total -= ant.cost;
                        ant.bought++;
                        ant.owned++;
                    };
                };
            };
        };
    };

    const calculate = (() => {

        function upgrades() {
            for (let [type, ants] of Object.values(antSpecies).entries()) {
                for (let [tier, ant] of Object.values(ants).entries()) {

                    // Determine if any upgrade prerequisites have been met
                    if (ant.bought >= (ant.upgrades * 1)) {
                        const upgradeContainer = document.getElementsByClassName('upgrade-button-container')[0];
                        const upgradesUnlocked = upgradeContainer.querySelectorAll('*');
    
                        // Check if the upgrade is already unlocked
                        for (let i = 0; i < (upgradesUnlocked.length); i++) {
                            if (upgradesUnlocked[i].id == ant.id_abb) return; 
                        };
                        
                        // Create a new upgrade button once the prerequisites have been met
                        const buttonElement = ('<button type="button" class="upgrade-button" id="' + ant.id_abb + '" onclick=game.upgrade()">' + ant.id_abb + '</button>');

                        upgradeContainer.innerHTML += buttonElement; // Display the element
                    };
                };
            };
        };

        function resourceProduction() {
            let totalFoodProduction = 0;
        
            for (let [type, ants] of Object.values(antSpecies).entries()) {
                for (let [tier, ant] of Object.values(ants).entries()) {
                    if (tier == 0) { 
                        // Add food if the ant is the lowest tier
                        resources.food.total += (ant.production * ant.owned) / 10;
                        totalFoodProduction += ant.production * ant.owned;
                    } else { 
                        // Add ants to the tier below
                        Object.values(antSpecies)[type][Object.keys(ants)[tier - 1]].owned += ((ant.production * ant.owned) / 10);
                    };
                    // Calculate the cost of the ant for the current tier
                    ant.cost = (1 * Math.pow(10, tier * 2)) * Math.pow(1.12, ant.bought) * (tier + 1);
                };
            };
        
            resources.food.production = totalFoodProduction;
        };

        return {
            upgrades,
            resourceProduction,
        }
    })();

    const display = (() => {

        // Update the game UI
        function update() {
            // Update resource information
            document.getElementById('food-total').innerHTML = util.numbers(resources.food.total);
            document.getElementById('food-production').innerHTML = util.numbers(resources.food.production);
        
            for (let [type, ants] of Object.values(antSpecies).entries()) {
                for (let [tier, ant] of Object.values(ants).entries()) {

                    // Determine if the cost threshold has been met to display the next ant
                    const displayCostThreshold = (ant.owned == 0) && (resources.food.total < (ant.cost / 4));
                    let display = displayCostThreshold ? 'none' : '';
                    
                    // Update visibility of the ant's information
                    document.getElementById(ant.id + '-button').style.display = display;
                    document.getElementById(ant.id + '-data-1').style.display = display;
                    document.getElementById(ant.id + '-data-2').style.display = display;
    
                    // Update the ant's display if visible
                    if (display == "") {
                        document.getElementById(ant.id + '-bought').innerHTML = util.numbers(ant.bought);
                        document.getElementById(ant.id + '-owned').innerHTML = util.numbers(ant.owned);
                        document.getElementById(ant.id + '-production').innerHTML = util.numbers(ant.production * ant.owned) + ' ' + ant.prod_abb;
                        document.getElementById(ant.id + '-cost').innerHTML = util.numbers(ant.cost);
                    }
                };
            };
        };

        return {
            update,
        }
    })();

    return {
        forage,
        recruit,
        calculate,
        display,
    };
})();

const util = (() => {

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
                return scientificNotation.format(n);
        }
    };
    
    // Create a timer to keep the game running
    function timer() {
        setInterval(function gameCycle() {

            game.calculate.upgrades();

            game.calculate.resourceProduction();

            game.display.update();

        }, 100);
    };

    return {
        numbers,
        timer,
    };
})();

window.onload = init.load();
