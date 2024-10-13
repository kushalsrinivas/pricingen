interface EthereumRequestArguments {
    method: string;
    params?: unknown[] | object;
  }
  
  interface EthereumProvider {
    isMetaMask?: boolean;
    request: (args: EthereumRequestArguments) => Promise<unknown>; // `any` here is intentional because the return type depends on the request method.
  }
  
  interface Window {
    ethereum?: EthereumProvider;
  }
  