"use strict";
import tulind from "tulind";

export default class Indicator {
    #name;
    #symbol;
    #interval;
    #options;
    #callback;
    #klines = {};

    constructor(name, symbol, interval, options, callback) {
        this.#name = name.toLowerCase();
        this.#symbol = symbol.toLowerCase();
        this.#interval = interval;
        this.#options = options;

        if (callback instanceof Function) this.#callback = callback;
    }

    calculate = () => new Promise((resolve, reject) => tulind.indicators[this.#name]
        .indicator(this.#parameters.inputs, this.#parameters.options)
        .then(result => resolve(result))
        .catch(error => reject(error))
    );

    /**
     * @param {Array[]} klines
     */
    set klines(klines) {
        klines.forEach(kline => {
            const [
                openTime,
                open,
                high,
                low,
                close,
                volume,
                _, // Close Time (Not Used)
                quoteAssetVolume,
                numberOfTrades,
                takerBuyBaseAssetVolume,
                takerBuyQuoteAssetVolume
            ] = kline;

            this.#klines[openTime] = {
                open: open,
                high: high,
                low: low,
                close: close,
                volume: volume,
                quoteAssetVolume: quoteAssetVolume,
                numberOfTrades: numberOfTrades,
                takerBuyBaseAssetVolume: takerBuyBaseAssetVolume,
                takerBuyQuoteAssetVolume: takerBuyQuoteAssetVolume
            };
        });
    }

    addKline(kline) {
        const {
            t: klineStartTime,
            o: open,
            c: close,
            h: high,
            l: low,
            v: baseAssetVolume,
            n: numberOfTrades,
            x: isClosed,
            q: quoteAssetVolume,
            V: takerBuyBaseAssetVolume,
            Q: takerBuyQuoteAssetVolume
        } = kline;

        this.#klines[klineStartTime] = {
            open: open,
            high: high,
            low: low,
            close: close,
            volume: baseAssetVolume,
            quoteAssetVolume: quoteAssetVolume,
            numberOfTrades: numberOfTrades,
            takerBuyBaseAssetVolume: takerBuyBaseAssetVolume,
            takerBuyQuoteAssetVolume: takerBuyQuoteAssetVolume
        }

        if (this.#callback) this.calculate().then(result => this.#callback(result));
    }

    stop() {
        this.#callback = undefined;
    }

    get #parameters() {
        if (this.#name === "adosc") {
            return {
                inputs: this.values("HLCV"),
                options: [this.#options.shortPeriod, this.#options.longPeriod]
            };
        }

        else if (this.#name === "apo" || this.#name === "ppo") {
            return {
                inputs: [this.values(this.#options.source)],
                options: [this.#options.shortPeriod, this.#options.longPeriod]
            };
        }

        else if (this.#name === "bbands") {
            return {
                inputs: [this.values(this.#options.source)],
                options: [this.#options.period, this.#options.stdDev]
            };
        }

        else if (this.#name === "vidya") {
            return {
                inputs: [this.values(this.#options.source)],
                options: [this.#options.shortPeriod, this.#options.longPeriod, this.#options.alpha]
            };
        }

        else if (this.#name === "macd") {
            return {
                inputs: [this.values(this.#options.source)],
                options: [this.#options.shortPeriod, this.#options.longPeriod, this.#options.signalPeriod]
            };
        }

        else if (this.#name === "kvo") {
            return {
                inputs: this.values("HLCV"),
                options: [this.#options.shortPeriod, this.#options.longPeriod]
            };
        }

        else if (this.#name === "mfi") {
            return {
                inputs: this.values("HLCV"),
                options: [this.#options.period]
            };
        }

        else if (this.#name === "nvi" || this.#name === "obv" || this.#name === "pvi") {
            return {
                inputs: [this.values("close"), this.#volume],
                options: []
            };
        }

        else if (this.#name === "vwma") {
            return {
                inputs: [this.values("close"), this.#volume],
                options: [this.#options.period]
            };
        }

        else if (this.#name === "psar") {
            return {
                inputs: this.values("HL"),
                options: [this.#options.accelerationFactorStep, this.#options.accelerationFactorMaximum]
            };
        }

        else if (this.#name === "qstick") {
            return {
                inputs: [this.values('open'), this.values('close')],
                options: [this.#options.period]
            };
        }

        else if (this.#name === "stoch") {
            return {
                inputs: this.values("HLC"),
                options: [this.#options.kPeriod, this.#options.kSlowingPeriod, this.#options.dPeriod]
            };
        }

        else if (this.#name === "ultosc") {
            return {
                inputs: this.values("HLC"),
                options: [this.#options.shortPeriod, this.#options.mediumPeriod, this.#options.longPeriod]
            };
        }

        else if (this.#name === "vosc") {
            return {
                inputs: [this.#volume],
                options: [this.#options.shortPeriod, this.#options.longPeriod]
            };
        }
        /////////////////////////////// High Low Start ///////////////////////////////
        //HL
        else if (this.#name === "ao" || this.#name === "medprice") {
            return {
                inputs: this.values("HL"),
                options: []
            };
        }

        //HL Period
        else if (["aroon", "aroonosc", "mass", "cvi", "dm", "fisher"].includes(this.#name)) {
            return {
                inputs: this.values("HL"),
                options: [this.#options.period]
            };
        }

        //HL Volume
        else if (this.#name === "emv" || this.#name === "marketfi") {
            return {
                inputs: this.values("HLV"),
                options: []
            };
        }
        /////////////////////////////// High Low End ///////////////////////////////

        /////////////////////////////// High Low Close Start ///////////////////////////////
        //HLC
        else if (["tr", "typprice", "wad", "wcprice"].includes(this.#name)) {
            return {
                inputs: this.values("HLC"),
                options: []
            };
        }

        //HLC Volume
        else if (this.#name === "ad") {
            return {
                inputs: this.values("HLCV"),
                options: []
            };
        }

        //HLC Period
        else if (["adx", "adxr", "atr", "cci", "di", "dx", "natr", "willr"].includes(this.#name)) {
            return {
                inputs: this.values("HLC"),
                options: [this.#options.period]
            };
        }
        /////////////////////////////// High Low Close End ///////////////////////////////

        /////////////////////////////// Open High Low Close Start ///////////////////////////////
        //OHLC
        else if (this.#name === "avgprice") {
            return {
                inputs: this.values("OHLC"),
                options: []
            };
        }
        /////////////////////////////// Open High Low Close End ///////////////////////////////

        /////////////////////////// Source Start ///////////////////////////////
        // Source
        else if ([
            "abs", "acos", "asin", "atan", "ceil", "cos", "cosh", "floor", "exp", "ln", "log10", "round", "sin",
            "sinh", "sqrt", "tan", "tanh", "todeg", "torad", "trunc"
        ].includes(this.#name)) {
            return {
                inputs: [this.values(this.#options.source)],
                options: []
            };
        }

        // Source Period
        else if (
            [
                "decay", "dema", "dpo", "cmo", "edecay", "ema", "fosc", "hma", "kama", "lag", "linreg",
                "linregintercept", "linregslope", "max", "md", "min", "mom", "msw", "roc", "rocr", "rsi", "sma",
                "stddev", "stderr", "stochrsi", "sum", "tema", "trima", "trix", "tsf", "var", "vhf", "volatility",
                "wilders", "wma", "zlema"
            ].includes(this.#name)
        ) {
            return {
                inputs: [this.values(this.#options.source)],
                options: [this.#options.period]
            };
        }

        //Source1 Source2
        else if (["add", "crossany", "crossover", "div", "mul", "sub"].includes(this.#name)) {
            return {
                inputs: [
                    this.values(this.#options["source1"]),
                    this.values(this.#options["source2"])
                ],
                options: []
            };
        }
        /////////////////////////// Source End ///////////////////////////////
    }

    get #volume() { return Object.keys(this.#klines).map(name => parseFloat(this.#klines[name].quoteAssetVolume)) }

    values(source) {
        if (
            source === 'open' ||
            source === "close" ||
            source === "low" ||
            source === "high"
        ) return Object.keys(this.#klines).map(name => parseFloat(this.#klines[name][source]))

        else if (source === "HLC") {
            return [
                Object.keys(this.#klines).map(name => parseFloat(this.#klines[name]["high"])),
                Object.keys(this.#klines).map(name => parseFloat(this.#klines[name]["low"])),
                Object.keys(this.#klines).map(name => parseFloat(this.#klines[name]["close"]))
            ]
        }

        else if (source === "HLCV") {
            return [
                Object.keys(this.#klines).map(name => parseFloat(this.#klines[name]["high"])),
                Object.keys(this.#klines).map(name => parseFloat(this.#klines[name]["low"])),
                Object.keys(this.#klines).map(name => parseFloat(this.#klines[name]["close"])),
                this.#volume
            ]
        }

        else if (source === "CV") {
            return [
                Object.keys(this.#klines).map(name => parseFloat(this.#klines[name]["close"])),
                this.#volume
            ]
        }

        else if (source === "HL") {
            return [
                Object.keys(this.#klines).map(name => parseFloat(this.#klines[name]["high"])),
                Object.keys(this.#klines).map(name => parseFloat(this.#klines[name]["low"]))
            ]
        }

        else if (source === "HLV") {
            return [
                Object.keys(this.#klines).map(name => parseFloat(this.#klines[name]["high"])),
                Object.keys(this.#klines).map(name => parseFloat(this.#klines[name]["low"])),
                this.#volume
            ]
        }

        else if (source === "OHLC") {
            return [
                Object.keys(this.#klines).map(name => parseFloat(this.#klines[name]["open"])),
                Object.keys(this.#klines).map(name => parseFloat(this.#klines[name]["high"])),
                Object.keys(this.#klines).map(name => parseFloat(this.#klines[name]["low"])),
                Object.keys(this.#klines).map(name => parseFloat(this.#klines[name]["close"]))
            ]
        }

        // else if (source === 'HL2') return this.#candle.HL2;
        // else if (source === 'YDK3') return this.#candle.YDK3;
        // else if (source === 'OCLH4') return this.#candle.OCLH4;
        // else if (source === 'HLCC4') return this.#candle.HLCC4;
    }

    get subscribeName() { return `${this.#symbol}@kline_${this.#interval}` };

    get hash() {
        return `${this.#symbol.toLowerCase()}_${this.#interval}_${this.#name}_${JSON.stringify(this.#options)}`
            .split('')
            .reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
    }
}