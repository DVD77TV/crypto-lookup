/*************************************************
  WEBSOCKET PER BTC, ETH, SHIB DA BINANCE
**************************************************/
const binanceStreamURL = 'wss://stream.binance.com:9443/stream?streams=' +
                         'btcusdt@ticker/ethusdt@ticker/shibusdt@ticker';

// Mappa simboli usati da Binance WS => ID elementi
const binanceSymbols = {
  'BTCUSDT': { priceEl: 'btc-price', changeEl: 'btc-change' },
  'ETHUSDT': { priceEl: 'eth-price', changeEl: 'eth-change' },
  'SHIBUSDT': { priceEl: 'shib-price', changeEl: 'shib-change' }
};

const binanceWS = new WebSocket(binanceStreamURL);

binanceWS.onopen = () => {
  console.log('WebSocket Binance aperto con successo');
};

binanceWS.onmessage = (event) => {
  try {
    const msg = JSON.parse(event.data);
    // "data" contiene le info di un singolo stream (ticker 24h)
    const ticker = msg.data;
    if (!ticker || !ticker.s) return;

    const symbol = ticker.s; // es: "BTCUSDT"
    if (!binanceSymbols[symbol]) return;

    const { priceEl, changeEl } = binanceSymbols[symbol];
    const priceDOM = document.getElementById(priceEl);
    const changeDOM = document.getElementById(changeEl);

    const currentPrice = parseFloat(ticker.c);   // prezzo attuale
    const priceChangePercent = parseFloat(ticker.P); // variazione % 24h

    // Aggiorno il DOM
    const formattedPrice = currentPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
    // Attenzione: .innerHTML permette di interpretare l’HTML
    priceDOM.innerHTML = formattedPrice + ' <span class="txtUSD">USD</span>';


    let sign = priceChangePercent > 0 ? '+' : '';
    changeDOM.textContent = sign + priceChangePercent.toFixed(2) + '%';

    const color = priceChangePercent >= 0 ? '#3AE374' : '#FF4E4E';
    priceDOM.style.color = color;
    changeDOM.style.color = color;

  } catch (err) {
    console.error('Errore parsing WS Binance:', err);
  }
};

binanceWS.onerror = (err) => {
  console.error('WebSocket Binance error:', err);
};

binanceWS.onclose = () => {
  console.warn('WebSocket Binance chiuso. Puoi implementare la riconnessione se necessario.');
};

/*************************************************
  POLLING PER BONE DA COINGECKO
**************************************************/
async function fetchBonePrice() {
  try {
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bone-shibaswap&vs_currencies=usd&include_24hr_change=true';
    const resp = await fetch(url);
    const data = await resp.json();

    if (data['bone-shibaswap']) {
      const price = data['bone-shibaswap'].usd;
      const change = data['bone-shibaswap'].usd_24h_change;

      const priceDOM = document.getElementById('bone-price');
      const changeDOM = document.getElementById('bone-change');

      // Usa 'price' anziché 'currentPrice'
      const formattedPrice = price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      });
      priceDOM.innerHTML = formattedPrice + ' <span class="txtUSD">USD</span>';

      const sign = change >= 0 ? '+' : '';
      const color = change >= 0 ? '#3AE374' : '#FF4E4E';
      changeDOM.textContent = sign + change.toFixed(2) + '%';

      priceDOM.style.color = color;
      changeDOM.style.color = color;
    }
  } catch (error) {
    console.error('Errore fetch prezzo BONE:', error);
  }
}
