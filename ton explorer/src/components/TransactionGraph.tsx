import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Transaction } from '../types/contract';
import { format } from 'date-fns';

interface TransactionGraphProps {
  transactions: Transaction[];
}

export function TransactionGraph({ transactions }: TransactionGraphProps) {
  // Track the selected transaction type to display the graph (incoming or outgoing)
  const [selectedType, setSelectedType] = useState<'all' | 'in' | 'out'>('all');

  // Process transaction data
  const data = transactions
    .sort((a, b) => a.timestamp - b.timestamp) // Sort transactions by timestamp numerically
    .map(tx => {
      const timestamp = tx.timestamp ? new Date(tx.timestamp) : new Date(); // Parse the timestamp as a Date object
      const validTimestamp = !isNaN(timestamp.getTime()); // Validate if it's a valid date

      return validTimestamp
        ? {
            date: format(timestamp, 'MM/dd'), // Format the date as MM/dd
            amount: parseFloat(tx.amount), // Convert amount to a float
            type: tx.type, // Transaction type (in or out)
          }
        : null; // Skip invalid transactions
    })
    .filter(Boolean); // Remove invalid transactions from the data

  // Separate transactions into "in" and "out"
  const inTransactions = data.filter(tx => tx.type === 'in');
  const outTransactions = data.filter(tx => tx.type === 'out');

  // Calculate total amounts for "in" and "out" transactions
  const totalIn = inTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalOut = outTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Data for Pie Chart
  const pieChartData = [
    { name: 'Incoming', value: totalIn },
    { name: 'Outgoing', value: totalOut },
  ];

  // Colors for Pie chart segments
  const COLORS = ['#22c55e', '#f97316'];

  // Conditionally set data to display based on selectedType
  let displayedData = data;
  if (selectedType === 'in') {
    displayedData = inTransactions;
  } else if (selectedType === 'out') {
    displayedData = outTransactions;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Transaction Volume</h2>

      {/* Transaction Type Selection */}
      <div className="flex mb-6">
        <button
          className={`px-4 py-2 rounded-md mr-2 ${selectedType === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setSelectedType('all')}
        >
          All Transactions
        </button>
        <button
          className={`px-4 py-2 rounded-md mr-2 ${selectedType === 'in' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setSelectedType('in')}
        >
          Incoming
        </button>
        <button
          className={`px-4 py-2 rounded-md ${selectedType === 'out' ? 'bg-red-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setSelectedType('out')}
        >
          Outgoing
        </button>
      </div>

      {/* Line Chart for Total Transaction Volume (based on selectedType) */}
      <div className="h-[400px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke={selectedType === 'in' ? "#22c55e" : selectedType === 'out' ? "#f97316" : "#2563eb"} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart for Incoming vs Outgoing Transactions */}
      {selectedType === 'all' && (
        <div className="h-[400px] mb-6">
          <h2 className="text-2xl font-bold mb-4">Transaction Type Distribution</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                outerRadius="80%"
                innerRadius="60%"
                label
                labelLine={false}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
