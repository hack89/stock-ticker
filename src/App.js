import React from "react";
import Chart from "react-apexcharts";
const stonksUrl = "https://yahoo-finance-api.vercel.app/GME";

async function getStonks() {
  const response = await fetch(stonksUrl);
  return response.json();
}

const directionEmojis = {
  up: "🚀",
  down: "💩",
  "": "",
};
const round = (number) => {
  return number ? +number.toFixed(2) : null;
};

const chart = {
  options: {
    chart: {
      type: "candlestick",
      height: 350,
    },
    title: {
      text: "CandleStick Chart",
      align: "left",
    },
    xaxis: {
      type: "datetime",
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
  },
};
function App() {
  const [series, setSeries] = React.useState([
    {
      data: [],
    },
  ]);
  const [price, setPrice] = React.useState(-1);
  const [prevPrice, setPrevPrice] = React.useState(-1);
  const [priceTime, setPriceTime] = React.useState(null);
  React.useEffect(() => {
    let timeoutId;

    async function getLatestPrice() {
      try {
        const data = await getStonks();
        const gme = data.chart.result[0];
        setPrevPrice(price);
        setPrice(gme.meta.regularMarketPrice.toFixed(2));
        setPriceTime(new Date(gme.meta.regularMarketTime * 1000));
        const quote = gme.indicators.quote[0];
        const prices = gme.timestamp.map((timestamp, index) => ({
          x: new Date(timestamp * 1000),
          y: [
            quote.open[index],
            quote.high[index],
            quote.low[index],
            quote.close[index],
          ].map(round),
        }));
        setSeries([
          {
            data: prices,
          },
        ]);
      } catch (error) {
        console.log(error);
      }
      timeoutId = setTimeout(getLatestPrice, 2000);
    }

    getLatestPrice();
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const direction = React.useMemo(
    () => (prevPrice ? "up" : prevPrice > price ? "down" : ""),
    [price, prevPrice]
  );
  console.log(series);
  return (
    <>
      <div className={["price", direction].join(" ")}>
        ${price} {directionEmojis[direction]}
      </div>
      <div className="priceTime">
        {priceTime && priceTime.toLocaleTimeString()}
      </div>
      <Chart
        options={chart.options}
        series={series}
        type="candlestick"
        width="100%"
        height={320}
      />
    </>
  );
}

export default App;
