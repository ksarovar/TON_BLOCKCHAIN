export interface ContractData {
  address: string;
  balance: string;
  transactions: Transaction[];
  methods: ContractMethod[];
}

export interface Transaction {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  amount: string;
  type: 'in' | 'out' | 'method';
  methodName?: string;
}

export interface ContractMethod {
  name: string;
  callCount: number;
  lastCalled: number;
}