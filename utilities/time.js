import Decimal from '../classes/decimal.mjs';
import { stats } from '../index.js';

const time = {
    get timestamp() {
        const units = [
            `${(new Date()).getHours()}`,
            `${(new Date()).getMinutes()}`,
            `${(new Date()).getSeconds()}`
        ];
        return `[${units.join(':')}]:`;
    },

    get units() {
        return [
            { name: 'days', suffix: 'd', divisor: 86400000, empty: '' },
            { name: 'hours', suffix: 'h', divisor: 3600000, empty: '' },
            { name: 'minutes', suffix: 'm', divisor: 60000, empty: '' },
            { name: 'seconds', suffix: 's', divisor: 1000, empty: '0s' }
        ];
    },

    update: () => (stats.lastUpdate = Date.now()),

    elapsed: function(elapse) {
        const milliseconds = new Decimal(Date.now() - elapse);
        const units = this.mapUnits(milliseconds).join(' ');

        return { milliseconds, units };
    },

    mapUnits: function(remainder) {
        return this.units.map(unit => {
            const difference = remainder.dividedBy(unit.divisor).floor();
            remainder = remainder.minus(difference.times(unit.divisor));
            return difference.greaterThan(0)
                ? `${difference}${unit.suffix}`
                : `${unit.empty}`;
        });
    }
};

export default time;
