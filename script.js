/*************************************************
  1. WEBSOCKET PER BTC, ETH, SHIB DA BINANCE
**************************************************/
const binanceStreamURL =
  "wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/ethusdt@ticker/shibusdt@ticker";

const binanceSymbols = {
  BTCUSDT: { priceEl: "btc-price", changeEl: "btc-change" },
  ETHUSDT: { priceEl: "eth-price", changeEl: "eth-change" },
  SHIBUSDT: { priceEl: "shib-price", changeEl: "shib-change" },
};

const binanceWS = new WebSocket(binanceStreamURL);

binanceWS.onopen = () => {
  console.log("Binance WebSocket aperto.");
};

binanceWS.onmessage = (event) => {
  try {
    const msg = JSON.parse(event.data);
    // "data" contiene le info di un singolo stream 24h ticker
    const ticker = msg.data;
    if (!ticker || !ticker.s) return;

    const symbol = ticker.s;
    if (!binanceSymbols[symbol]) return;

    const { priceEl, changeEl } = binanceSymbols[symbol];
    const priceDOM = document.getElementById(priceEl);
    const changeDOM = document.getElementById(changeEl);

    const currentPrice = parseFloat(ticker.c);
    const priceChangePercent = parseFloat(ticker.P);

    // Inseriamo prezzo con HTML (così lo stile "USD" può essere differenziato)
    priceDOM.innerHTML =
      currentPrice.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      }) + ' <span class="txtUSD">USD</span>';

    const sign = priceChangePercent >= 0 ? "+" : "";
    changeDOM.textContent = sign + priceChangePercent.toFixed(2) + "%";

    const color = priceChangePercent >= 0 ? "#3AE374" : "#FF4E4E";
    priceDOM.style.color = color;
    changeDOM.style.color = color;
  } catch (err) {
    console.error("Binance WebSocket parse error:", err);
  }
};

binanceWS.onerror = (error) => {
  console.error("Binance WebSocket error:", error);
};

binanceWS.onclose = () => {
  console.warn("Binance WebSocket chiuso.");
  // Se vuoi, aggiungi un meccanismo di riconnessione
};

/*************************************************
  2. WEBSOCKET PER BONE/USDT DA MEXC
**************************************************/
const wsMEXC = new WebSocket("wss://wbs.mexc.com/ws");

wsMEXC.onopen = () => {
  console.log("MEXC WebSocket aperto.");
  // Sottoscrizione al ticker di BONE_USDT
  const subMessage = {
    op: "sub",
    cmd: "spot/ticker",
    args: ["BONE_USDT"],
  };
  wsMEXC.send(JSON.stringify(subMessage));
};

wsMEXC.onmessage = (event) => {
  try {
    const msg = JSON.parse(event.data);
    // Ci aspettiamo che msg.cmd === 'spot/ticker' e msg.data sia un array di array
    if (msg && msg.cmd === "spot/ticker" && Array.isArray(msg.data) && msg.data.length > 0) {
      const tickerData = msg.data[0];
      // In base alla documentazione MEXC, tickerData ha l'ordine:
      // [ symbol, lastPrice, open, high, low, volume, amount, ask1, ask1Qty, bid1, bid1Qty, time, changeRate, changePrice ]
      const lastPrice = parseFloat(tickerData[1]);
      // changeRate è in decimale, es. 0.02 => 2%
      const changeRate = parseFloat(tickerData[12]) * 100;

      const priceDOM = document.getElementById("bone-price");
      const changeDOM = document.getElementById("bone-change");

      // Inseriamo prezzo con suffisso "USD" stilizzato
      priceDOM.innerHTML =
        lastPrice.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 8,
        }) + ' <span class="txtUSD">USD</span>';

      const sign = changeRate >= 0 ? "+" : "";
      changeDOM.textContent = sign + changeRate.toFixed(2) + "%";

      const color = changeRate >= 0 ? "#3AE374" : "#FF4E4E";
      priceDOM.style.color = color;
      changeDOM.style.color = color;
    }
  } catch (err) {
    console.error("MEXC WebSocket parse error:", err);
  }
};

wsMEXC.onerror = (error) => {
  console.error("MEXC WebSocket error:", error);
};

wsMEXC.onclose = () => {
  console.warn("MEXC WebSocket chiuso.");
  // Se vuoi, aggiungi un meccanismo di riconnessione
};
