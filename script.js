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
  WEBSOCKET PER BONE DA MEXC
**************************************************/
const wsMEXC = new WebSocket('wss://wbs.mexc.com/raw');

wsMEXC.onopen = () => {
  console.log('MEXC WebSocket aperto');
  // Sottoscrizione al ticker di BONE/USDT
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
    // Cerchiamo i dati nel campo `data`, che dovrebbe essere un array di array
    if (msg && msg.cmd === 'spot/ticker' && Array.isArray(msg.data) && msg.data.length > 0) {
      // Tipicamente msg.data[0] contiene l’array con info su BONE
      const tickerData = msg.data[0];
      // Secondo la doc MEXC (spot/ticker):
      // tickerData = [
      //   symbol, lastPrice, open, high, low, volume, amount,
      //   ask1, ask1Qty, bid1, bid1Qty, time, changeRate, changePrice
      // ]
      // Verifica l’esatto ordine/collocazione nel JSON reale!
      const lastPrice   = parseFloat(tickerData[1]);   // tickerData[1] = lastPrice
      const changeRate  = parseFloat(tickerData[12]) * 100; // tickerData[12] = changeRate in decimale (es. 0.02 => 2%)

      // Aggiorniamo i due elementi HTML
      const priceDOM  = document.getElementById('bone-price');
      const changeDOM = document.getElementById('bone-change');

      // Stampiamo il prezzo con il suffisso “USD” in uno span stilizzabile
      priceDOM.innerHTML = lastPrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      }) + ' <span class="txtUSD">USD</span>';

      // Gestiamo il segno (+ / -) per la variazione
      const sign = changeRate >= 0 ? '+' : '';
      changeDOM.textContent = sign + changeRate.toFixed(2) + '%';

      // Cambiamo colore in base al segno
      const color = (changeRate >= 0) ? '#3AE374' : '#FF4E4E';
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
  // Se vuoi riconnetterti automaticamente in caso di chiusura inaspettata:
  // setTimeout(() => { /* ricrea wsMEXC */ }, 5000);
};

// Aggiorno BONE a intervalli regolari (es. ogni 5 secondi)
fetchBonePrice();
setInterval(fetchBonePrice, 5000);
