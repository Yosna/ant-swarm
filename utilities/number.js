import Decimal from '../classes/decimal.mjs';

const DecimalRoundDown = Decimal.clone({ rounding: Decimal.ROUND_DOWN });

const number = (raw) => {
    switch (true) {
        case raw.lessThan(100):
            return parseFloat(raw.toFixed(2));
        case raw.lessThan(1000):
            return parseFloat(raw.toFixed(1));
        case raw.lessThan(10000):
            return parseFloat(raw.toFixed(1)).toLocaleString();
        default:
            return DecimalRoundDown(raw).toExponential(3);
    }
};

export default number;
