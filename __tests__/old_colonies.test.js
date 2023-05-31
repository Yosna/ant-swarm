/* eslint-disable import/first */
/* eslint-disable no-unused-vars */
import Decimal from 'decimal.js';
import { getElement } from '../game';

const resources = jest.requireActual('../__mocks__/index.js').resources;
const colonies = jest.requireActual('../__mocks__/colonies.js').colonies;
const Colony = jest.requireActual('../__mocks__/colonies.js').Colony;

describe('Colony tests', () => {
    beforeEach(() => {
        jest.mock('../__mocks__/index.js');
        jest.mock('../__mocks__/game.js');
        jest.mock('../__mocks__/colonies.js');
        jest.mock('../__mocks__/forage.js');
        jest.mock('../__mocks__/init.js');
        document.body.innerHTML = `
          <div>
            <input id="quantity-selection" value="1" />
          </div>
        `;
    });
    test('the quantity should be 1', () => {
        console.log(getElement('#quantity-selection'));
        const ant = colonies.garden.smallWorker;
        expect(ant.roundedQuantity.toNumber()).toBe(1);
    });
});
