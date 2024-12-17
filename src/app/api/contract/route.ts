import { NextResponse } from 'next/server';
import { getContractData } from '@/lib/ton';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required' },
      { status: 400 }
    );
  }

  try {
    const rawData = await getContractData(address);

    // Format the raw data
    const formattedData = {
      address: rawData.address || 'N/A', // Ensure address is always a string, even if missing
      balance: rawData.balance || '0', // Default balance is '0' if missing
      transactions: rawData.transactions?.map((tx: any) => ({
        hash: tx.hash || 'No hash', // Ensure hash is not null or undefined
        timestamp: tx.timestamp ? new Date(tx.timestamp * 1000).toISOString() : 'N/A', // Convert timestamp to ISO string
        from: tx.from || 'N/A', // Default to 'N/A' if 'from' is missing
        to: tx.to || 'N/A', // Default to 'N/A' if 'to' is missing
        amount: tx.amount || '0', // Default to '0' if 'amount' is missing
        type: tx.type 
      })) || [] // Ensure an empty array if transactions are missing
    };

    return NextResponse.json(formattedData); // Return the formatted data

  } catch (error) {
    console.error('Error fetching contract data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract data' },
      { status: 500 }
    );
  }
}
