'use client';

import { useState } from 'react';
import { SearchBar } from './SearchBar';
import { ContractOverview } from './ContractOverview';
import { TransactionList } from './TransactionList';
import { TransactionGraph } from './TransactionGraph';
import { ContractData } from '@/types/contract';
import { Loader2 } from 'lucide-react';

export function ContractExplorer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractData, setContractData] = useState<ContractData | null>(null);

  const handleSearch = async (address: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/contract?address=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contract data');
      }
      const data = await response.json();
      setContractData(data);
    } catch (err) {
      setError('Failed to fetch contract data. Please check the address and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-center mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      {loading && (
        <div className="flex justify-center items-center">
          <Loader2 className="animate-spin" size={32} />
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {contractData && (
        <div className="space-y-8">
          <ContractOverview data={contractData} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TransactionGraph transactions={contractData.transactions} />
            <TransactionList transactions={contractData.transactions} />
          </div>
        </div>
      )}
    </div>
  );
}