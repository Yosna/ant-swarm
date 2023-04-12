let species = {
    garden: {
        smallWorker: {name: "Small Garden Worker", id: "small-garden-worker"},
        regularWorker: {name: "Regular Garden Worker", id: "regular-garden-worker"},
        largeWorker: {name: "Large Garden Worker", id: "large-garden-worker"},
        smallDrone: {name: "Small Garden Drone", id: "small-garden-drone"},
        regularDrone: {name: "Regular Garden Drone", id: "regular-garden-drone"},
        largeDrone: {name: "Large Garden Drone", id: "large-garden-drone"},
        queen: {name: "Garden Ant Queen", id: "garden-ant-queen"},
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

for (let [i, ants] of Object.values(species).entries()) {
    for (let [n, ant] of Object.values(ants).entries()) {
        ant.bought = 0;
        ant.owned = 0;
        ant.production = .1;
        ant.boost = 1;
    };
    for (let [n, ant] of Object.values(ants).entries()) {
        ant.cost = (1 * Math.pow(10, n * 2)) * Math.pow(1.12, ant.bought);
    };
};

function forage() {
    resources.food.total += (foragingRate * foragingBoost);
    document.getElementById("food-total").innerHTML = numberFormat(resources.food.total);
};

function recruit(type, tier) {
    for (let [i, ants] of Object.values(species).entries()) {
        if (i == type) {
            for (let [n, ant] of Object.values(ants).entries()) {
                if (n == tier) {
                    if (ant.cost > resources.food.total) {
                        return;
                    } else {
                        resources.food.total -= ant.cost;
                        resources.food.production += ant.production;
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

    for (let [i, ants] of Object.values(species).entries()) {
        for (let [n, ant] of Object.values(ants).entries()) {
            ant.cost = (1 * Math.pow(10, n * 2)) * Math.pow(1.12, ant.bought);
            document.getElementById(ant.id + "-bought").innerHTML = numberFormat(ant.bought);
            document.getElementById(ant.id + "-owned").innerHTML = numberFormat(ant.owned);
            document.getElementById(ant.id + "-cost").innerHTML = numberFormat(ant.cost);
            document.getElementById(ant.id + "-production").innerHTML = numberFormat(ant.production * ant.owned);
        };
    };
};

setInterval(function gameLoop() {
    for (let [i, ants] of Object.values(species).entries()) {
        for (let [n, ant] of Object.values(ants).entries()) {
            if (n == 0) {
                resources.food.total += ((ant.production * ant.owned) / 10);
            }
        };
    };
    updateDisplay();
}, 100);