import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, Address, Transaction as TonTransaction, StateInit, TupleItem, TupleReader } from "@ton/ton";

// Singleton pattern for the TON client
let client: TonClient;

// Initialize the TON client
export async function initTonClient(): Promise<TonClient> {
  if (!client) {
    const endpoint = await getHttpEndpoint();
    client = new TonClient({ endpoint });
  }
  return client;
}

// Fetch contract methods
function extractMethodsFromCode(code: Buffer): string[] {
  const methods: string[] = [];

  // Extract the first 4 bytes of each method selector
  for (let i = 0; i < code.length; i += 4) {
    const methodSelector = code.slice(i, i + 4).toString('hex');
    methods.push(methodSelector);
  }

  return methods;
}

// Function to fetch and return raw method selectors from the contract
export async function getContractMethods(address: string): Promise<string[]> {
  const tonClient = await initTonClient();
  const contractAddress = Address.parse(address);

  let methods: string[] = [];

  try {
    const contractState = await tonClient.getContractState(contractAddress);
    console.log('Contract State:', contractState);

    const contractCode = contractState.code;
    if (contractCode) {
      methods = extractMethodsFromCode(contractCode);
    } else {
      console.error('No contract code found.');
    }
  } catch (error) {
    console.error('Error fetching contract state:', error);
  }

  // Return raw method selectors
  return methods;
}

// Types for transaction data
interface TransactionData {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  amount: string;
  type: 'in' | 'out';
}

// Types for contract data
interface ContractData {
  address: string;
  balance: string;
  transactions: TransactionData[];
  code: Buffer | null; // Contract code (optional)
  data: Buffer | null; // Contract data (optional)
}

// Fetch contract data including balance and transactions
export async function getContractData(address: string): Promise<ContractData> {

  const tonClient = await initTonClient();
  const contractAddress = Address.parse(address);
  const methods = await getContractMethods(address);  // Get the contract methods
  console.log("Contract Methods:", methods); // Print methods to the console

  let balance: string = '0';
  try {
    const balanceCurrency = await tonClient.getBalance(contractAddress);
    balance = convertNanoTONToTON(balanceCurrency).toString();
  } catch (error) {
    console.error("Error fetching balance:", error);
    balance = '0'; // Default to '0' in case of error
  }

  let transactions: TonTransaction[] = [];
  try {
    transactions = await tonClient.getTransactions(contractAddress, { limit: 100 });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    transactions = [];
  }

  const transactionData: TransactionData[] = transactions.map((tx) => {
    const hash = tx.hash() ? convertHashToHex(tx.hash()) : 'N/A';
    const timestamp = tx.now || 0;
    const from = getSender(tx);
    const to = getReceiver(tx);
    const amount = getAmount(tx);
    const type = tx.inMessage ? 'in' : 'out';
    return { hash, timestamp, from, to, amount, type };
  });

  let contractCode: Buffer | null = null;
  let contractData: Buffer | null = null;
  try {
    const contractState = await tonClient.getContractState(contractAddress);
    contractCode = contractState.code;
    contractData = contractState.data;
  } catch (error) {
    console.error("Error fetching contract state:", error);
    contractCode = null;
    contractData = null;
  }

  return {
    address,
    balance,
    transactions: transactionData,
    code: contractCode,
    data: contractData,
  };
}

// Helper functions (same as in your previous code)
function getSender(tx: TonTransaction): string {
  if (tx.inMessage && tx.inMessage.info) {
    const info = tx.inMessage.info;
    if (Array.isArray(info)) {
      return info[0]?.src ? info[0].src.toString() : 'N/A';
    } else {
      return info?.src ? info.src.toString() : 'N/A';
    }
  }
  return 'N/A';
}

function getReceiver(tx: TonTransaction): string {
  if (tx.inMessage && tx.inMessage.info) {
    const info = tx.inMessage.info;
    if (Array.isArray(info)) {
      return info[0]?.dest ? info[0].dest.toString() : 'N/A';
    } else {
      return info?.dest ? info.dest.toString() : 'N/A';
    }
  }
  return 'N/A';
}

function getAmount(tx: TonTransaction): string {
  if (tx.inMessage && tx.inMessage.info) {
    const info = tx.inMessage.info;
    const coins = info?.value?.coins;
    return coins ? convertNanoTONToTON(coins).toString() : '0';
  }
  return '0';
}

function convertHashToHex(hash: Uint8Array): string {
  return Buffer.from(hash).toString('hex');
}

function convertNanoTONToTON(nanoTON: bigint): string {
  const oneTON = 1000000000;
  const amountInTON = Number(nanoTON) / oneTON;
  return amountInTON.toFixed(2); // Return the result rounded to two decimal places
}
