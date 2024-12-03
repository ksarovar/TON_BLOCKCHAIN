import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer as PieResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface Transaction {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  amount: string;
  type: 'in' | 'out';
}

const TransactionsPage = () => {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (router.query.data) {
      const parsedData = JSON.parse(router.query.data as string);
      setTransactions(parsedData);
    }
  }, [router.query.data]);

  if (!transactions.length) {
    return <div>Loading...</div>;
  }

  // Prepare data for the LineChart (Transaction Volume)
  const data = transactions
    .sort((a, b) => a.timestamp - b.timestamp) // Sort by timestamp
    .map(tx => {
      const timestamp = new Date(tx.timestamp);
      const validTimestamp = !isNaN(timestamp.getTime());

      return validTimestamp
        ? {
            date: format(timestamp, 'MM/dd'),
            amount: parseFloat(tx.amount),
          }
        : null;
    })
    .filter(Boolean);

  // Prepare data for the PieChart (Transaction Types)
  const transactionTypes = transactions.reduce(
    (acc, tx) => {
      if (tx.type === 'in') {
        acc.in++;
      } else {
        acc.out++;
      }
      return acc;
    },
    { in: 0, out: 0 }
  );

  const pieData = [
    { name: 'Incoming', value: transactionTypes.in },
    { name: 'Outgoing', value: transactionTypes.out },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Transaction Volume Line Chart */}
      <h2 className="text-2xl font-bold mb-4">Transaction Volume</h2>
      <div className="h-[400px] mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#2563eb" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction Type Pie Chart */}
      <h2 className="text-2xl font-bold mb-4">Transaction Types</h2>
      <div className="h-[400px] mb-8">
        <PieResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8">
              <Cell fill="#82ca9d" />
              <Cell fill="#ff7f7f" />
            </Pie>
            <PieTooltip />
          </PieChart>
        </PieResponsiveContainer>
      </div>

      {/* You can add more charts here */}
    </div>
  );
};

export default TransactionsPage;
