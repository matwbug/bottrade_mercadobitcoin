const axios = require('axios');
const qs = require('querystring');
const crypto = require('crypto')


const ENDPOINT_API = "https://www.mercadobitcoin.net/api/";
const ENDPOINT_TRADE_API = "https://www.mercadobitcoin.net/tapi/v3/";
const ENDPOINT_TRADE_PATH = "/tapi/v3/";

const Sms_accountSid = process.env.Sms_accountSid;
const Sms_authToken = process.env.Sms_authToken;

const apiSms = require('twilio')(Sms_accountSid, Sms_authToken)


class MercadoBitcoinTrade{
    constructor(config){
        this.config = {
            KEY: config.key,
            SECRET: config.secret,
            CURRENCY: config.currency
        }
    }

    getAccountInfo(){
        return this.call('get_account_info',{})
    }

    placeBuyOrder(qty, limit_price){
        return this.call('place_buy_order', {
            coin_pair: `${process.env.currency}${this.config.CURRENCY}`,
            quantity: `${qty}`.substr(0,10),
            limit_price : `${limit_price}`
        })
    }

    placeSellOrder(qty, limit_price){
        return this.call('place_sell_order',{
            coin_pair: `${process.env.currency}${this.config.CURRENCY}`,
            quantity: `${qty}`.substr(0,10),
            limit_price: `${limit_price}`
        })
    }

    async call(method, params){
        try{
            const now = new Date().getTime();
            let queryStr = qs.stringify({ tapi_method: method, tapi_nonce: now})
            //console.log(queryStr)
            if(params) queryStr += `&${qs.stringify(params)}`;
            const signature = crypto.createHmac('sha512', this.config.SECRET)
                .update(`${ENDPOINT_TRADE_PATH}?${queryStr}`)
                .digest('hex');
            const config = {
                headers: {
                    'TAPI-ID': this.config.KEY,
                    'TAPI-MAC': signature
                }
            }
            const response = await axios.post(ENDPOINT_TRADE_API, queryStr, config);
            if(response.data.error_message) throw new Error(response.data.error_message)
            return response.data.response_data;
        }
        catch(err){
            console.error(err)
            return false
        }
        
    }
}

class MercadoBitcoin{
    constructor(config){
        this.config = {
            CURRENCY: config.currency
        }
    }

    ticker(){
        return this.call('ticker')
    }

    async call(method){
        const config = {
            headers: {
                'Accept': 'application/json'
            }
        }
        try{
            const response = await axios.get(ENDPOINT_API + this.config.CURRENCY + '/' + method)
            return response.data;
        }
        catch(error){
            console.log(error)
            return false;
        }
    }
}

class smsSender{
    constructor(cfg){
        this.config = {
            SID : cfg.sid,
            TOKEN: cfg.token
        }
    }
    async call(msg){
        try{
            let result = apiSms.messages.create({
                body: msg,
                from: process.env.Sms_fromNumber,
                to: process.env.Sms_toNumber
            })
            return result.sid;
        }catch(err){
            return err;
        }
    }
}

module.exports = {
    MercadoBitcoin,
    MercadoBitcoinTrade,
    smsSender
}