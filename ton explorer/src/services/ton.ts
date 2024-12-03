import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, Address, Transaction } from "@ton/ton";

let client: TonClient;

export async function initTonClient() {
  const endpoint = await getHttpEndpoint();
  client = new TonClient({ endpoint });
  return client;
}

// Define types for response data
interface TransactionData {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  amount: string;
  type: 'in' | 'out';
}

interface ContractData {
  address: string;
  balance: string;
  transactions: TransactionData[];
}

export async function getContractData(address: string): Promise<ContractData> {
  if (!client) {
    await initTonClient();
  }

  const contractAddress = Address.parse(address);

  // Fetch the balance, handle potential errors
  let balance: any;
  try {
    balance = await client.getBalance(contractAddress);
  } catch (error) {
    console.error("Error fetching balance:", error);
    balance = null; // In case of an error, set balance to null
  }

  // Fetch the transactions, handle potential errors
  let transactions: Transaction[] = [];
  try {
    transactions = await client.getTransactions(contractAddress, { limit: 100 });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    transactions = []; // Set an empty array in case of an error
  }

  return {
    address,
    balance: balance ? balance.toString() : '0', // Safely handle balance
    transactions: transactions.map(tx => ({
      hash: tx.hash ? tx.hash.toString() : 'N/A', // Ensure tx.hash exists
      timestamp: tx.time,
      from: tx.inMessage?.source ? tx.inMessage.source.toString() : 'N/A', // Ensure source exists
      to: tx.inMessage?.destination ? tx.inMessage.destination.toString() : 'N/A', // Ensure destination exists
      amount: tx.inMessage?.value ? tx.inMessage.value.toString() : '0', // Ensure value exists
      type: tx.inMessage ? 'in' : 'out' // Check if inMessage exists to decide type
    }))
  };
}
