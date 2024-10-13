"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Network {
  id: string;
  chain_identifier: string;
  name: string;
}

interface Token {
  id: string;
  symbol: string;
  name: string;
  platforms: Record<string, string>;
}

export default function NetworkTokenSelector() {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchNetworks();
  }, []);

  useEffect(() => {
    if (selectedNetwork) {
      void fetchTokensByNetwork(selectedNetwork);
    }
  }, [selectedNetwork]);

  const fetchNetworks = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await fetch(
        "https://api.coingecko.com/api/v3/asset_platforms",
      );
      if (!response.ok) {
        throw new Error("Failed to fetch networks");
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: Network[] = await response.json();
      setNetworks(data.filter((network) => network.chain_identifier !== null));
    } catch (error) {
      console.error("Error fetching networks:", error);
      setError("Failed to load networks. Please try again later.");
    }
    setLoading(false);
  };

  const fetchTokensByNetwork = async (
    selectedNetwork: string,
  ): Promise<void> => {
    setLoading(true);
    try {
      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch the full list of tokens from CoinGecko
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/list?include_platform=true",
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch tokens: ${response.statusText}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: Token[] = await response.json();

      // Filter tokens by the selected network platform
      const filteredTokens = data.filter(
        (token: Token) =>
          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          token.platforms && token.platforms[selectedNetwork.toLowerCase()],
      );

      setTokens(filteredTokens.slice(0, 100)); // Limit to first 100 tokens for performance
    } catch (error) {
      console.error("Error fetching tokens:", error);
      setTokens([]);
    }
    setLoading(false);
  };

  const handleNetworkChange = (value: string) => {
    setSelectedNetwork(value);
    setSelectedToken("");
  };

  const handleTokenChange = (value: string) => {
    setSelectedToken(value);
  };

  return (
    <div className="bg-card mx-auto w-full max-w-md space-y-6 rounded-lg p-6 shadow-md">
      <div className="space-y-2">
        <Label htmlFor="network-select">Select Network</Label>
        {loading && !selectedNetwork ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select onValueChange={handleNetworkChange} value={selectedNetwork}>
            <SelectTrigger id="network-select">
              <SelectValue placeholder="Choose a network" />
            </SelectTrigger>
            <SelectContent>
              {networks.map((network) => (
                <SelectItem key={network.id} value={network.id}>
                  {network.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="token-select">Select Token</Label>
        {loading && selectedNetwork ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            onValueChange={handleTokenChange}
            value={selectedToken}
            disabled={!selectedNetwork}
          >
            <SelectTrigger id="token-select">
              <SelectValue placeholder="Choose a token" />
            </SelectTrigger>
            <SelectContent>
              {tokens.map((token) => (
                <SelectItem key={token.id} value={token.id}>
                  {token.symbol} - {token.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedNetwork && selectedToken && (
        <div className="bg-muted rounded-md p-4">
          <p className="font-semibold">Selected:</p>
          <p>Network: {networks.find((n) => n.id === selectedNetwork)?.name}</p>
          <p>
            Token: {tokens.find((t) => t.id === selectedToken)?.name} (
            {tokens.find((t) => t.id === selectedToken)?.symbol})
          </p>
        </div>
      )}
    </div>
  );
}
