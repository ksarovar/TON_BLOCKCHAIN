import React, { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { ContractOverview } from './components/ContractOverview';
import { TransactionList } from './components/TransactionList';
import { TransactionGraph } from './components/TransactionGraph';
import { getContractData } from './services/ton';
import { ContractData } from './types/contract';
import { Loader2 } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractData, setContractData] = useState<ContractData | null>(null);

  const handleSearch = async (address: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContractData(address);
      setContractData(data);
    } catch (err) {
      setError('Failed to fetch contract data. Please check the address and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">TON Contract Explorer</h1>
        
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
    </div>
  );
}

export default App;