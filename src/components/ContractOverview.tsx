import React, { useState, useEffect } from 'react';
import { ContractData } from '../types/contract';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';

// Register necessary chart.js components
ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

interface ContractOverviewProps {
  data: ContractData;
}

interface ToncoinMarketData {
  current_price: number;
  price_change_24h: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  ath: number;
  atl: number;
  circulating_supply: number;
}

export function ContractOverview({ data }: ContractOverviewProps) {
  const [showMarketData, setShowMarketData] = useState(false);
  const [marketData, setMarketData] = useState<ToncoinMarketData | null>(null);
  const [loading, setLoading] = useState(true); // Loading state for fetching data

  // Fetch Toncoin market data from API
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=the-open-network&order=market_cap_desc&per_page=1&page=1&sparkline=false&price_change_percentage=1h,24h'
        );
        const data = await response.json();
        
        // Check if we have data
        if (data && data[0]) {
          setMarketData(data[0]);
        } else {
          console.error("Market data is empty or invalid");
        }
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  // Placeholder data for charts (assuming you'll get real data from API)
  const priceData = {
    labels: ['12:00', '14:00', '16:00', '18:00', '20:00', '22:00'], // Sample times
    datasets: [
      {
        label: 'Price (USD)',
        data: [6.44, 6.30, 6.50, 6.10, 6.40, 6.44], // Sample price data
        borderColor: '#4f86f7',
        backgroundColor: 'rgba(79, 134, 247, 0.2)',
        fill: true,
      },
    ],
  };

  const marketCapData = {
    labels: ['12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    datasets: [
      {
        label: 'Market Cap (USD)',
        data: [16410730549, 16450000000, 16300000000, 16430000000, 16410000000, 16410730549],
        borderColor: '#ff4f5a',
        backgroundColor: 'rgba(255, 79, 90, 0.2)',
        fill: true,
      },
    ],
  };

  // Check if the market data is loaded and show appropriate message
  if (loading) {
    return <div>Loading market data...</div>;
  }

  if (!marketData) {
    return <div>Failed to load market data</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Contract Overview</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600">Address</p>
          <p className="font-mono">{data.address}</p>
        </div>
        <div>
          <p className="text-gray-600">Balance</p>
          <p className="font-semibold">{data.balance} TON</p>
        </div>
      </div>

      {/* Button to toggle market data */}
      <div className="mt-6">
        <button
          onClick={() => setShowMarketData(!showMarketData)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          {showMarketData ? 'Hide Market Data' : 'Show Market Data'}
        </button>
      </div>

      {/* Market Data Section */}
      {showMarketData && marketData && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Toncoin Market Data</h3>

          {/* Graph Section */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Price Chart */}
            <div className="flex justify-center">
              <div className="w-[400px] h-[300px]">
                <h4 className="font-semibold mb-2 text-center">Price Chart</h4>
                <Line data={priceData} height={300} width={400} />
              </div>
            </div>

            {/* Market Cap Chart */}
            <div className="flex justify-center">
              <div className="w-[400px] h-[300px]">
                <h4 className="font-semibold mb-2 text-center">Market Cap Chart</h4>
                <Line data={marketCapData} height={300} width={400} />
              </div>
            </div>
          </div>

          {/* Display other Toncoin data */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Current Price</p>
              <p className="font-semibold">${marketData.current_price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-600">24h Price Change</p>
              <p className="font-semibold">{marketData.price_change_percentage_24h.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-gray-600">Market Cap</p>
              <p className="font-semibold">${marketData.market_cap.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">24h Trading Volume</p>
              <p className="font-semibold">${marketData.total_volume.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">All-Time High</p>
              <p className="font-semibold">${marketData.ath}</p>
            </div>
            <div>
              <p className="text-gray-600">All-Time Low</p>
              <p className="font-semibold">${marketData.atl}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
