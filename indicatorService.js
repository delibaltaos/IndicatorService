"use strict";
import Binance from 'node-binance-api';
import Indicator from "./indicator.js";

export default class IndicatorService {
    #provider;
    #type;
    #indicators = [];

    constructor(provider, type) {
        const providerName = provider.toLowerCase();

        if (providerName === "binance") this.#provider = new Binance().options({ family: 4, useServerTime: true });

        else if (providerName === "gate.io") { }

        if (type === "spot") this.#type = this.#provider["websockets"]["candleStick"];
        else if (type === "futures") {
            //
        }
    }

    indicator = async (
        symbol = "",
        interval = "",
        name = "",
        klines = {},
        options = {},
        callback
    ) => new Promise(async (resolve, reject) => {
        if (this.#isEmpty(symbol)) reject(new Error("Symbol is not defined"));
        if (this.#isEmpty(interval)) reject(new Error("Interval is not defined"));
        if (this.#isEmpty(name)) reject(new Error("Indicator name is not defined"));

        const indicator = new Indicator(name, interval, options, callback);

        if (this.#hasIndicator(indicator)) throw new Error("Indicator has already implemented");

        if (this.#objectIsEmpty(klines)) {
            await this.#provider["futuresCandles"](symbol, interval)
                .then(klines => indicator.klines = klines)
                .catch(error => console.error(error));
        } else {
            indicator.klines = klines;
        }

        if (callback === undefined) await indicator.calculate().then(result => resolve(result));

        if (callback instanceof Function) {
            this.#indicators.push(indicator);
            await this.#subscribe2KlinesIfNeeded(indicator);
            resolve(indicator.hash);
        }
    });

    stop = async hash => {
        const indicator = this.#getIndicator(hash);

        if (indicator === undefined) throw new Error(`Indicator ${hash} is not implemented`);

        try {
            indicator.stop();
            this.#removeIndicator(hash)
            await this.#reviseSubscriptions();
            return true;
        } catch (error) {
            throw error;
        }
    }

    #subscribe2KlinesIfNeeded = async indicator =>
        !this.#subscriptions.includes(indicator.subscribeName) ?
            this.#provider["futuresSubscribe"](
                indicator.subscribeName, kline => indicator.addKline(kline.k)
            ) : false;

    get #subscriptions() { return Object.keys(this.#provider["futuresSubscriptions"]() || []) }

    //TODO: This method will be change with symbol and interval
    getPrices = (hash, source = "close") => this.#getIndicator(hash).values(source);

    getPricesWithKlines = klines => {
        try {
            return klines.map(item => parseFloat(item[4]));
        } catch (error) {
            console.error(error);
            console.log(klines);
        }
    }

    getKlines = (symbol, interval, endTime) => new Promise((resolve, reject) => {
        this.#provider["futuresCandles"](symbol, interval, {
            endTime: endTime
        })
            .then(resolve)
            .catch(reject);
    })

    getPricesWith = async (symbol, interval) => new Promise(async (resolve, reject) => {
        await this.#provider["futuresCandles"](symbol, interval)
            .then(result =>
                resolve(result.map(item => parseFloat(item[4])))
            )
            .catch(error => reject(error));
    })

    #reviseSubscriptions = async () => {
        const unnecessarySubscribes = this.#subscriptions.filter(
            subscribeName => !this.#indicators.map(indicator => indicator.subscribeName).includes(subscribeName)
        );

        for (const subscribeName of unnecessarySubscribes) await this.#provider["futuresTerminate"](subscribeName);
    }

    #isEmpty = value => value == null || value.trim().length === 0;

    #hasIndicator = indicator => this.#getIndicator(indicator.hash) !== undefined;
    #getIndicator = hash => this.#indicators.filter(indicator => indicator.hash === hash)[0];
    #removeIndicator = hash => this.#indicators.splice((
        this.#indicators
            .map((indicator, i) => indicator.hash === hash ? i : -1)
            .filter(result => result !== -1)[0] || -1), 1
    );

    #objectIsEmpty = obj => obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype;
}