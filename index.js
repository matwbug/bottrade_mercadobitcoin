require('dotenv-safe').config()
const { MercadoBitcoin, MercadoBitcoinTrade, smsSender} = require('./api')
const profit = process.env.PROFIT
const currency = process.env.CURRENCY
const coin = process.env.COIN


const taapi = require("taapi");
const client = taapi.client(process.env.TAAPI_KEY);

const infoApi = new MercadoBitcoin({  currency : coin});
const tradeApi = new MercadoBitcoinTrade({
    currency: coin,
    key: process.env.KEY,
    secret: process.env.CHAVEAPI
})
const apiSms = new smsSender({
    sid: 'AC4e162068c2c01c6c924adceda9f3805a',
    token: '4ffd2bfd4227b2f63d8bbf1ca393762d'
})

async function accountInfo(){
    const data = await tradeApi.getAccountInfo();
    return data;
}
async function getQuantity(coin, price, isBuy){
    price = parseFloat(price);
    coin = isBuy ? 'brl' : coin.toLowerCase();
    let data = await accountInfo()    
    const balance = parseFloat(data.balance[coin].available).toFixed(8);

    if(isBuy && balance < 10) return false;
    
    let qty = 0;
    if(isBuy) qty = parseFloat((balance / price).toFixed(8));
    return qty - 0.00001
}

async function precoBom(){
    let rsi = await client.getIndicator("rsi", "binance", `${process.env.COIN}/${process.env.CURRENCY}`, '1h')
    console.log(`RSI => ${rsi.value}`)
    //if(rsi.value <= 60 && rsi.value >= 50) return true //forte tendencia de alta
    if(rsi.value <= 0 && rsi.value <= 20) return true //forte tendencia de baixa
    return false
}

setInterval(async () => {
    try{
        let response = await infoApi.ticker(); 
        //console.log(`Preço atual: ${response.ticker.sell}\nMaior preço ${response.ticker.high}`);
        if(precoBom()) return;
            let qty = await getQuantity('BRL', response.ticker.sell, true)
            if(!qty) apiSms.call(`${coin} tá num preço muito bom! poe saldo aí pra comprar caralho!`)
            let buyOrder = await tradeApi.placeBuyOrder(qty, response.ticker.sell)
            console.log(`Sua ordem foi enviada!`, buyOrder)
            if(buyOrder.status == 4){
                apiSms.call(`Compra feita de ${qty}${process.env.coin} no valor de ${response.ticker.sell}`)
                let priceSell = parseFloat(buyOrder.limit_price * profit).toFixed(8);
                let sellOrder = await tradeApi.placeSellOrder(buyOrder.quantity - buyOrder.fee, priceSell)
                console.log('Ordem de venda inserida com sucesso!',sellOrder)
                apiSms.call(`Ordem de venda enviada com sucesso de ${qty}${process.env.coin} Preço de venda inserido ${priceSell}`)
            }
    }catch(err){
        console.error(err)
    }
},process.env.EXEC_INTERVAL)

