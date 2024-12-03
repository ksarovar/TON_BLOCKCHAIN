import React, { useState } from 'react';
import { Transaction } from '../types/contract';
import { formatDistanceToNow } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  // State for selected transaction (for modal)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 20;

  // Function to handle the click on a transaction row
  const handleTransactionClick = (tx: Transaction) => {
    setSelectedTransaction(tx);
  };

  // Function to copy transaction details to clipboard
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Error copying text: ', err);
    });
  };

  // Calculate the indices for the current page
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  // Total pages
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  // Pagination Controls
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left">Hash</th>
              <th className="px-4 py-2 text-left">Time</th>
              <th className="px-4 py-2 text-left">From</th>
              <th className="px-4 py-2 text-left">To</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Type</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.map((tx) => {
              const timestamp = tx.timestamp ? new Date(tx.timestamp) : new Date(); // Parse the ISO string
              const validTimestamp = !isNaN(timestamp.getTime()); // Validate the timestamp

              return (
                <tr
                  key={tx.hash}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleTransactionClick(tx)} // Trigger the click to open the modal
                >
                  <td className="px-4 py-2 font-mono text-sm">{tx.hash.slice(0, 8)}...</td>
                  <td className="px-4 py-2">
                    {validTimestamp ? formatDistanceToNow(timestamp, { addSuffix: true }) : 'Invalid timestamp'}
                  </td>
                  <td className="px-4 py-2 font-mono text-sm">{tx.from.slice(0, 8)}...</td>
                  <td className="px-4 py-2 font-mono text-sm">{tx.to.slice(0, 8)}...</td>
                  <td className="px-4 py-2">{tx.amount} TON</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${tx.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded-md"
        >
          Previous
        </button>

        <div className="text-lg font-medium">
          Page {currentPage} of {totalPages}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 rounded-md"
        >
          Next
        </button>
      </div>

      {/* Modal for displaying selected transaction details */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-8 w-1/2 max-w-5xl"> {/* Increased width and padding */}
            <h3 className="text-2xl font-bold mb-6">Transaction Details</h3> {/* Larger heading */}
            <div className="space-y-6">
              {/* Each transaction detail with individual copy button */}
              <div className="flex justify-between items-center">
                <p className="font-medium">Hash:</p>
                <div className="flex items-center">
                  <span className="text-sm font-mono">{selectedTransaction.hash}</span>
                  <button
                    className="ml-2 text-blue-500 text-xs"
                    onClick={() => handleCopyToClipboard(selectedTransaction.hash)}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="font-medium">Time:</p>
                <div className="flex items-center">
                  <span className="text-sm">{new Date(selectedTransaction.timestamp).toLocaleString()}</span>
                  <button
                    className="ml-2 text-blue-500 text-xs"
                    onClick={() => handleCopyToClipboard(new Date(selectedTransaction.timestamp).toLocaleString())}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="font-medium">From:</p>
                <div className="flex items-center">
                  <span className="text-sm">{selectedTransaction.from}</span>
                  <button
                    className="ml-2 text-blue-500 text-xs"
                    onClick={() => handleCopyToClipboard(selectedTransaction.from)}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="font-medium">To:</p>
                <div className="flex items-center">
                  <span className="text-sm">{selectedTransaction.to}</span>
                  <button
                    className="ml-2 text-blue-500 text-xs"
                    onClick={() => handleCopyToClipboard(selectedTransaction.to)}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="font-medium">Amount:</p>
                <div className="flex items-center">
                  <span className="text-sm">{selectedTransaction.amount} TON</span>
                  <button
                    className="ml-2 text-blue-500 text-xs"
                    onClick={() => handleCopyToClipboard(`${selectedTransaction.amount} TON`)}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="font-medium">Type:</p>
                <div className="flex items-center">
                  <span className="text-sm">{selectedTransaction.type.toUpperCase()}</span>
                  <button
                    className="ml-2 text-blue-500 text-xs"
                    onClick={() => handleCopyToClipboard(selectedTransaction.type.toUpperCase())}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
                onClick={() => setSelectedTransaction(null)} // Close the modal
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
