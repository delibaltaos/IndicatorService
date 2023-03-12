import IndicatorService from "./indicatorService.js";

let Main;

export default Main = new (class Main {
    #service;
    constructor() {
        this.#service = new IndicatorService("binance", "futures");
        const date = new Date();
        const endTime = date.setMinutes(date.getMinutes() - 1);
        
        this.#service.getKlines("BTCUSDT", "1m", endTime).then(result => {
            console.log(result);
        }).catch(error => {
            console.error(error);
        })
    }
})();