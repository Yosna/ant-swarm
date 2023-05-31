jest.mock('../__mocks__/index.js');
jest.mock('../__mocks__/game.js');
jest.mock('../__mocks__/colonies.js');
jest.mock('../__mocks__/forage.js');
jest.mock('../__mocks__/init.js');

const resources = jest.requireActual('../__mocks__/index.js').resources;
const gather = jest.fn().mockImplementation(() => {
    resources.food.total = resources.food.total.plus(0.1);
});

beforeEach(() => {
    jest.resetModules();
});

test('resources.food.total should increment by 0.1', () => {
    gather();
    expect(resources.food.total.toNumber()).toBe(0.1);
});
