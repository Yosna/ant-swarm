let antSpecies = {
    garden: {
        smallWorker: {name: "Small Garden Worker", id: "small-garden-worker", product: "food", abb: "F/s"},
        regularWorker: {name: "Regular Garden Worker", id: "regular-garden-worker", product: "small garden workers", abb: "SGW/s"},
        largeWorker: {name: "Large Garden Worker", id: "large-garden-worker", product: "regular garden workers", abb: "RGW/s"},
        smallDrone: {name: "Small Garden Drone", id: "small-garden-drone", product: "large garden workers", abb: "LGW/s"},
        regularDrone: {name: "Regular Garden Drone", id: "regular-garden-drone", product: "small garden drones", abb: "SGD/s"},
        largeDrone: {name: "Large Garden Drone", id: "large-garden-drone", product: "regular garden drones", abb: "RGD/s"},
        queen: {name: "Garden Ant Queen", id: "garden-ant-queen", product: "large garden drones", abb: "LGD/s"},
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

for (let [type, ants] of Object.values(antSpecies).entries()) {
    for (let [tier, ant] of Object.values(ants).entries()) {
        ant.bought = 0;
        ant.owned = 0;
        ant.boost = 1;
    };
    for (let [tier, ant] of Object.values(ants).entries()) {
        ant.cost = (1 * Math.pow(10, tier * 2)) * Math.pow(1.12, ant.bought);
        ant.production = Math.log(tier + 1) * 0.1;
    };
};

function forage() {
    resources.food.total += (foragingRate * foragingBoost);
    document.getElementById("food-total").innerHTML = numberFormat(resources.food.total);
};

function recruit(antType, antTier) {
    for (let [type, ants] of Object.values(antSpecies).entries()) {
        if (antType == type) {
            for (let [tier, ant] of Object.values(ants).entries()) {
                if (antTier == tier) {
                    if (ant.cost > resources.food.total) {
                        return;
                    } else {
                        resources.food.total -= ant.cost;
                        ant.bought++;
                        ant.owned++;
                    }
                };
            };
        };
    };
};

function numberFormat(n) {
    if (n < 100) {
        return parseFloat(n.toFixed(2));
    } else if (n < 1000) {
        return parseFloat(n.toFixed(1));
    } else if (n < 10000) {
        return parseFloat(n.toFixed(1)).toLocaleString();
    } else {
        const f = new Intl.NumberFormat("en-US", {
            notation: "scientific", 
            minimumSignificantDigits: 4, 
            maximumSignificantDigits: 4,
            roundingMode: "trunc",
        });
        return f.format(n);
    };
};

function updateDisplay() {
    document.getElementById("food-total").innerHTML = numberFormat(resources.food.total);
    document.getElementById("food-production").innerHTML = numberFormat(resources.food.production);

    for (let [type, ants] of Object.values(antSpecies).entries()) {
        for (let [tier, ant] of Object.values(ants).entries()) {

            const displayCostThreshold = (ant.owned == 0) && (resources.food.total < (ant.cost / 2));
            let display = displayCostThreshold ? "none" : "";
            document.getElementById(ant.id + "-button").style.display = display;
            document.getElementById(ant.id + "-data-1").style.display = display;
            document.getElementById(ant.id + "-data-2").style.display = display;

            document.getElementById(ant.id + "-bought").innerHTML = numberFormat(ant.bought);
            document.getElementById(ant.id + "-owned").innerHTML = numberFormat(ant.owned);
            document.getElementById(ant.id + "-production").innerHTML = numberFormat(ant.production * ant.owned) + ' ' + ant.abb;
            document.getElementById(ant.id + "-cost").innerHTML = numberFormat(ant.cost);
        };
    };
};

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
            ant.cost = (1 * Math.pow(10, tier * 2)) * Math.pow(1.12, ant.bought);
        };
    };

    resources.food.production = totalFoodProduction;

    updateDisplay();
}, 100);
