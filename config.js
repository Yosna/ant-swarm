const MILESTONES = {
    ANT_UPGRADE: [10, 25, 50, 100, 200, 300, 400, 500, 750, 1000]
};

const COLORS = {
    DULL: '#455b55',
    ANT_RECRUIT: '#2c8172',
    ANT_UPGRADE: '#009963',
    FORAGE_UPGRADE: '#009940'
};

const GAME = {
    FOOD_TOTAL: '#food-total',
    CREATION_DATE: '#creation-date',
    TIME_SINCE_CREATION: '#time-since-creation'
};

const FORAGE = {
    FORAGE_TOTAL: '#forage-total',
    GATHER_RATE: '#gather-rate',
    GATHER_RATE_BUTTON: '#gather-rate-upgrade'
};

const ANTS = (id) => ({
    RECRUITED: `#${id}-recruited`,
    ACQUIRED: `#${id}-acquired`,
    PRODUCTION: `#${id}-production`,
    COST: `#${id}-cost`,
    QUANTITY: `#${id}-quantity`,
    STATS: `#${id}-stats`,
    RECRUIT_BUTTON: `#${id}-button`,
    UPGRADE_BUTTON: `#${id}-upgrade`
});

export default {
    MILESTONES,
    COLORS,
    GAME,
    FORAGE,
    ANTS
};
