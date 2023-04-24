let antSpecies = {
    garden: {
        smallWorker: {name: 'Small Garden Worker', id: 'small-garden-worker', id_abb: 'SGW', product: 'food', prod_abb: 'F'},
        regularWorker: {name: 'Regular Garden Worker', id: 'regular-garden-worker', id_abb: 'RGW', product: 'small garden workers', prod_abb: 'SGW'},
        largeWorker: {name: 'Large Garden Worker', id: 'large-garden-worker', id_abb: 'LGW', product: 'regular garden workers', prod_abb: 'RGW'},
        smallDrone: {name: 'Small Garden Drone', id: 'small-garden-drone', id_abb: 'SGD', product: 'large garden workers', prod_abb: 'LGW'},
        regularDrone: {name: 'Regular Garden Drone', id: 'regular-garden-drone', id_abb: 'RGD', product: 'small garden drones', prod_abb: 'SGD'},
        largeDrone: {name: 'Large Garden Drone', id: 'large-garden-drone', id_abb: 'LGD', product: 'regular garden drones', prod_abb: 'RGD'},
        queen: {name: 'Garden Ant Queen', id: 'garden-ant-queen', id_abb: 'GQ', product: 'large garden drones', prod_abb: 'LGD'},        
    },
};

let resources = {
    food: {
        total: 1000000000000000,
        production: 0,
    },
};

let stats = {
    foraging: {
        rate: 0.1,
        boost: 1,
    },
    tickSpeed: 100,
};

const init = (() => {
    
    function load() {

        // Create event listeners for webpage functionality

        // Upgrade Container event listener to change the default axial scroll direction
        const upgradeContainer = document.getElementsByClassName('upgrade-button-container')[0];
        upgradeContainer.addEventListener('wheel', function(event) {

            // Determine which axis is being scrolled
            if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {

                // Prevent attempted scrolling on the y-axis
                event.preventDefault();

                // Redirect the y-axis scroll distance to the x-axis
                upgradeContainer.scrollLeft += event.deltaY;
            }
        });
        

        // Set the values for all ants
        for (let [type, ants] of Object.values(antSpecies).entries()) {
            for (let [tier, ant] of Object.values(ants).entries()) {
                ant.bought = 9;
                ant.owned = 9;
                ant.production = .1;
                ant.boost = 1;
                ant.upgrades = 0;
                ant.visible = false;
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
        resources.food.total += (stats.foraging.rate * stats.foraging.boost);
        document.getElementById('food-total').innerHTML = util.numbers(resources.food.total);
    };

    // Recruit an ant
    function recruit(antType, antTier) {
        for (let [type, ants] of Object.values(antSpecies).entries()) {
            if (antType == type) {
                for (let [tier, ant] of Object.values(ants).entries()) {
                    if (antTier == tier) {

                        // Check if the food is sufficient; util.numbers() fixes floating point number precision
                        if (util.numbers(resources.food.total) < ant.cost) return;

                        resources.food.total -= ant.cost;
                        ant.bought++;
                        ant.owned++;
                    };
                };
            };
        };
    };

    function buyUpgrade(upgrade) {
        for (let [type, ants] of Object.values(antSpecies).entries()) {
            for (let [tier, ant] of Object.values(ants).entries()) {

                // Determine which ant to upgrade
                if (ant.id == upgrade) {
                    
                }
            };
        };
    };

    const calculate = (() => {

        function upgrades() {
            for (let [type, ants] of Object.values(antSpecies).entries()) {
                for (let [tier, ant] of Object.values(ants).entries()) {
                    let displayed = false;

                    // Set the number of ants bought that unlock each upgrade
                    const breakpoint = [10, 25, 50, 100, 200, 300, 400, 500, 750, 1000];

                    // Determine if any upgrade breakpoints have been hit
                    if ((ant.upgrades < 10) && (ant.bought >= breakpoint[ant.upgrades])) {
                        const upgradeContainer = document.getElementsByClassName('upgrade-button-container')[0];
                        const upgradesUnlocked = upgradeContainer.querySelectorAll('*');
    
                        // Check if the upgrade is already unlocked
                        for (let i = 0; i < (upgradesUnlocked.length); i++) {
                            if (upgradesUnlocked[i].id == ant.id_abb) displayed = true; 
                        };
                        
                        // Create and display a new upgrade element once the prerequisites have been met
                        if (displayed == false) {
                            
                            // Calculate the cost for the next upgrade
                            const antCostAtBreakpoint = (1 * Math.pow(10, tier * 2)) * Math.pow(1.12, breakpoint[ant.upgrades]) * (tier + 1);
                            let upgradeCost = (antCostAtBreakpoint * 12) * Math.pow(1.2, ant.upgrades);
                            if (upgradeCost < 10000) upgradeCost = Math.floor(upgradeCost);

                            // Calculate the production boost of the upgrade
                            const productionBoost = 1 + (0.001 * (ant.upgrades + 1));
                            const productionPercent = ((productionBoost - 1) * 100).toFixed(1) + '%';

                            const buttonElement = `
                                <button
                                    type="button" 
                                    class="upgrade-button"
                                    id="${ant.id_abb}"
                                    onclick="game.buyUpgrade('${ant.id}')"
                                    data-string=
                                        "${ant.name}
                                        Upgrade ${(ant.upgrades + 1)}\n
                                        Cost: ${util.numbers(upgradeCost)}\n
                                        Boosts production by ${productionPercent} 
                                        for every ${ant.id_abb} recruited"
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
        
            for (let [type, ants] of Object.values(antSpecies).entries()) {
                for (let [tier, ant] of Object.values(ants).entries()) {

                    if (tier == 0) { 
                        // Add food if the ant is the lowest tier
                        resources.food.total += (ant.production * ant.owned) * (stats.tickSpeed / 1000);
                        foodPerSecond += ant.production * ant.owned;
                    } else { 
                        // Add ants to the previous tier
                        Object.values(antSpecies)[type][Object.keys(ants)[tier - 1]].owned += (ant.production * ant.owned) * (stats.tickSpeed / 1000);
                    };

                    // Calculate the cost of the ant for the current tier
                    ant.cost = (1 * Math.pow(10, tier * 2)) * Math.pow(1.12, ant.bought) * (tier + 1);
                };
            };
        
            resources.food.production = foodPerSecond;
        };

        return {
            upgrades,
            resourceProduction,
        };
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
                    let display = (displayCostThreshold && (ant.visible == false)) ? 'none' : '';
                    
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

                        ant.visible = true;
                    }
                };
            };
        };

        return {
            update,
        };
    })();

    return {
        forage,
        recruit,
        buyUpgrade,
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
                return scientificNotation.format(n).toLowerCase();
        };
    };
    
    // Create the cycle that updates the game
    function cycle() {
        game.calculate.upgrades();
        game.calculate.resourceProduction();
        game.display.update()
    };

    // Create the timer that loops the game cycle
    function timer() {
        setInterval(cycle, stats.tickSpeed);
    };

    return {
        numbers,
        cycle,
        timer,
    };
})();

window.onload = init.load();
