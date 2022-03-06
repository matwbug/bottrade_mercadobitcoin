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
const apiSms = new smsSender()

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
    let rsi = await client.getIndicator("rsi", "binance", `${process.env.COIN}/${process.env.CURRENCY}`, process.env.Time_indicator)
    let response = await infoApi.ticker(); 
   console.log(`====== Informações sobre moeda ${coin} ======
                RSI => ${parseFloat(rsi.value).toFixed(2)} 
                PRICE => ${parseFloat(response.ticker.sell).toFixed(2)} ${currency}
============================================`)
    
    //if(rsi.value <= 60 && rsi.value >= 50) return true //forte tendencia de alta
    if(rsi.value <= 0 && rsi.value <= 20) return true //forte tendencia de baixa
    return false
}

setInterval(async () => {
    try{
        //let response = await infoApi.ticker(); 
        //console.log(`Preço atual: ${response.ticker.sell}\nMaior preço ${response.ticker.high}`);
        if(precoBom()) return;
            let qty = await getQuantity('BRL', response.ticker.sell, true)
            if(!qty){ return apiSms.call(`${coin} tá num preço muito bom! poe saldo aí pra comprar caralho!`)
                //fazer pra verificar se o preço realmente for muito vender tudo que tem pra comprar nesse preço
            }
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

const express = require('express')
const app = express().listen(3000)

app.get('/', function(req,res){
    console.log('estou rodando!')
})



