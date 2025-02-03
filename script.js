/*************************************************
  WEBSOCKET BINANCE PER BTC, ETH, SHIB
**************************************************/
const binanceStreamURL =
  'wss://stream.binance.com:9443/stream?streams=' +
  'btcusdt@ticker/ethusdt@ticker/shibusdt@ticker';

// Mappa simboli usati da Binance => ID elementi HTML
const binanceSymbols = {
  BTCUSDT: { priceEl: 'btc-price', changeEl: 'btc-change' },
  ETHUSDT: { priceEl: 'eth-price', changeEl: 'eth-change' },
  SHIBUSDT: { priceEl: 'shib-price', changeEl: 'shib-change' }
};

const binanceWS = new WebSocket(binanceStreamURL);

binanceWS.onopen = () => {
  console.log('WebSocket Binance aperto');
};

binanceWS.onmessage = (event) => {
  try {
    const msg = JSON.parse(event.data);
    const ticker = msg.data; // i dati @ticker sono in msg.data
    if (!ticker || !ticker.s) return;

    const symbol = ticker.s; // "BTCUSDT", "ETHUSDT", "SHIBUSDT"
    if (!binanceSymbols[symbol]) return;

    const { priceEl, changeEl } = binanceSymbols[symbol];
    const priceDOM = document.getElementById(priceEl);
    const changeDOM = document.getElementById(changeEl);

    // Prezzo e variazione 24h
    const currentPrice = parseFloat(ticker.c);
    const priceChangePercent = parseFloat(ticker.P);

    // Impostiamo l’HTML
    priceDOM.innerHTML = currentPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }) + ' <span class="txtUSD">USD</span>';

    const sign = priceChangePercent >= 0 ? '+' : '';
    changeDOM.textContent = `${sign}${priceChangePercent.toFixed(2)}%`;

    // Colori
    const color = priceChangePercent >= 0 ? '#3AE374' : '#FF4E4E';
    priceDOM.style.color = color;
    changeDOM.style.color = color;
  } catch (err) {
    console.error('Errore parsing WS Binance:', err);
  }
};

binanceWS.onerror = (error) => {
  console.error('WebSocket Binance error:', error);
};

binanceWS.onclose = () => {
  console.warn('WebSocket Binance chiuso');
  // Se vuoi autori-connessione, implementala qui
};


/*************************************************
  WEBSOCKET MEXC PER BONE
  (ATTENZIONE: verifica la doc ufficiale MEXC)
**************************************************/
const wsMEXC = new WebSocket('wss://wbs.mexc.com/raw');

wsMEXC.onopen = () => {
  console.log('MEXC WebSocket aperto');
  // Sottoscrizione: cmd = 'spot/ticker', args = ['BONE_USDT'] (può variare)
  const subMessage = {
    op: 'sub',
    cmd: 'spot/ticker',
    args: ['BONE_USDT']
  };
  wsMEXC.send(JSON.stringify(subMessage));
};

wsMEXC.onmessage = (event) => {
  try {
    const msg = JSON.parse(event.data);
    // Cerchiamo i dati con cmd = 'spot/ticker'
    if (msg.cmd === 'spot/ticker' && Array.isArray(msg.data) && msg.data.length > 0) {
      // Esempio di array: [symbol, lastPrice, open, high, low, vol, amount, ask1, ask1Qty, bid1, bid1Qty, time, changeRate, changePrice]
      const tickerData = msg.data[0];
      if (!tickerData || tickerData.length < 14) return;

      // Indici da verificare nella doc MEXC
      const lastPrice  = parseFloat(tickerData[1]);     // tickerData[1] = lastPrice
      const changeRate = parseFloat(tickerData[12]) * 100; // tickerData[12] = changeRate (0.02 => 2%)

      // Aggiorno gli elementi BONE
      const priceDOM  = document.getElementById('bone-price');
      const changeDOM = document.getElementById('bone-change');

      priceDOM.innerHTML = lastPrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      }) + ' <span class="txtUSD">USD</span>';

      const sign = changeRate >= 0 ? '+' : '';
      changeDOM.textContent = `${sign}${changeRate.toFixed(2)}%`;

      const color = changeRate >= 0 ? '#3AE374' : '#FF4E4E';
      priceDOM.style.color  = color;
      changeDOM.style.color = color;
    }
  } catch (err) {
    console.error('MEXC WebSocket parse error:', err);
  }
};

wsMEXC.onerror = (error) => {
  console.error('MEXC WebSocket error:', error);
};

wsMEXC.onclose = () => {
  console.warn('MEXC WebSocket chiuso');
  // Se vuoi autori-connessione, implementala qui
};
