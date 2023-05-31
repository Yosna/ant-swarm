import { stats } from '../index.js';

function timestamp() {
    stats.lastUpdate = Date.now();
}

function elapsedTime(elapse) {
    const milliseconds = new Decimal(Date.now() - elapse);
    let remainder = milliseconds;

    const units = [
        { name: 'days', suffix: 'd', divisor: 86400000 },
        { name: 'hours', suffix: 'h', divisor: 3600000 },
        { name: 'minutes', suffix: 'm', divisor: 60000 },
        { name: 'seconds', suffix: 's', divisor: 1000 }
    ];

    const time = units.map(unit => {
        const value = remainder.dividedBy(unit.divisor).floor();
        const format = value.greaterThan(0) ? `${value}${unit.suffix}` : '';
        remainder = remainder.minus(value.times(unit.divisor));
        return format;
    });

    return { value: milliseconds, format: time.join(' ') };
}

export default {
    timestamp,
    elapsedTime
};
