let antSpecies = {
    garden: {
        smallWorker: {name: "Small Garden Worker", id: "small-garden-worker", idabb: "SGW", product: "food", abb: "F/s"},
        regularWorker: {name: "Regular Garden Worker", id: "regular-garden-worker", idabb: "RGW", product: "small garden workers", abb: "SGW/s"},
        largeWorker: {name: "Large Garden Worker", id: "large-garden-worker", idabb: "LGW", product: "regular garden workers", abb: "RGW/s"},
        smallDrone: {name: "Small Garden Drone", id: "small-garden-drone", idabb: "SGD", product: "large garden workers", abb: "LGW/s"},
        regularDrone: {name: "Regular Garden Drone", id: "regular-garden-drone", idabb: "RGD", product: "small garden drones", abb: "SGD/s"},
        largeDrone: {name: "Large Garden Drone", id: "large-garden-drone", idabb: "LGD", product: "regular garden drones", abb: "RGD/s"},
        queen: {name: "Garden Ant Queen", id: "garden-ant-queen", idabb: "GQ", product: "large garden drones", abb: "LGD/s"},
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

const game = (() => {

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

    // Hide locked content
    for (let upgradeSlot = 1; upgradeSlot < 9; upgradeSlot++) {
        document.getElementById("upgrade-button-" + upgradeSlot).style.display = "none";
    };

    // Recruit an ant
    function recruit(antType, antTier) {
        for (let [type, ants] of Object.values(antSpecies).entries()) {
            if (antType == type) {
                for (let [tier, ant] of Object.values(ants).entries()) {
                    if (antTier == tier) {
                        if (ant.cost > resources.food.total) {
                            return; // Not enough food to buy the ant
                        } else {
                            resources.food.total -= ant.cost;
                            ant.bought++;
                            ant.owned++;

                            // Determine if any upgrade prerequisites have been met
                            if (ant.bought >= (ant.upgrades * 1)) {
                                for (let upgradeSlot = 1; upgradeSlot < 9; upgradeSlot++) {
                                    const upgradeButton = document.getElementById("upgrade-button-" + upgradeSlot);
                                    
                                    if (upgradeButton.classList.contains(ant.id + "-upgrade-" + ant.upgrades)) {
                                        break; // Exit the loop and do nothing if the upgrade is already displayed
                                    }
                                    if (upgradeButton.style.display == "none") {
                                        upgradeButton.setAttribute("class", ant.id + "-upgrade-" + ant.upgrades);
                                        upgradeButton.innerHTML = ant.idabb + ant.upgrades;
                                        upgradeButton.style.display = "";
                                        break;
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };

    function forage() {
        resources.food.total += (foragingRate * foragingBoost);
        document.getElementById("food-total").innerHTML = utility.numberFormat(resources.food.total);
    };

    return {
        recruit,
        forage,
    }
})();

const utility = (() => {

    // Number handling
    const scientificNotation = new Intl.NumberFormat("en-US", {
        notation: "scientific",
        minimumSignificantDigits: 4,
        maximumSignificantDigits: 4,
        roundingMode: "trunc",
    });

    function numberFormat(n) {
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

    // Update the game UI
    function display() {
        // Update resource information
        document.getElementById("food-total").innerHTML = numberFormat(resources.food.total);
        document.getElementById("food-production").innerHTML = numberFormat(resources.food.production);
    
        for (let [type, ants] of Object.values(antSpecies).entries()) {
            for (let [tier, ant] of Object.values(ants).entries()) {
    
                // Determine if the cost threshold has been met to display the next ant
                const displayCostThreshold = (ant.owned == 0) && (resources.food.total < (ant.cost / 4));
                let display = displayCostThreshold ? "none" : "";
                
                // Update visibility of the ant
                document.getElementById(ant.id + "-button").style.display = display;
                document.getElementById(ant.id + "-data-1").style.display = display;
                document.getElementById(ant.id + "-data-2").style.display = display;

                if (display == "") { // Update the ant information if visible
                    document.getElementById(ant.id + "-bought").innerHTML = numberFormat(ant.bought);
                    document.getElementById(ant.id + "-owned").innerHTML = numberFormat(ant.owned);
                    document.getElementById(ant.id + "-production").innerHTML = numberFormat(ant.production * ant.owned) + ' ' + ant.abb;
                    document.getElementById(ant.id + "-cost").innerHTML = numberFormat(ant.cost);
                }
            };
        };
    };
    
    // Timer to keep the game updated
    setInterval(function gameLoop() {
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
                // Calculate the current cost of the ant in the tier
                ant.cost = (1 * Math.pow(10, tier * 2)) * Math.pow(1.12, ant.bought) * (tier + 1);
            };
        };
    
        resources.food.production = totalFoodProduction;
    
        display();
    }, 100);

    return {
        numberFormat,
        display,
    }
})();
