"use client";
import React, { useEffect, useState } from "react";
import { Check, Wallet, QrCode, CheckIcon, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  CardDescription,

  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { useRouter, useSearchParams } from "next/navigation";

interface plansType {
  name: string;
  price: number;
  features: string[];
}
interface CryptoPriceResponse {
  ethereum: {
    usd: number;
  };
}
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

const plans: plansType[] = [
  {
    name: "Basic",
    price: 10,
    features: ["feature 1", "feature 1", "feature 1"],
  },
  {
    name: "Pro",
    price: 20,
    features: ["feature 2", "feature 2", "feature 2"],
  },
  {
    name: "Enterprise",
    price: 50,
    features: ["feature 3", "feature 3", "feature 3"],
  },
];

export default function Component() {
  //replace this
  // const recipientAddress = "0x1234567890123456789012345678901234567890";
  const searchParams = useSearchParams();
  const redirecturl = searchParams.get("redirecturl");
  const recipientAddress = searchParams.get("recipientAddress");
  const PlanPrice = searchParams.get("PlanPrice");
  const PlanName = searchParams.get("PlanName");
  const allowedNetworksCSV = searchParams.get("networks");
  const allowedNetworks = allowedNetworksCSV
    ? allowedNetworksCSV.split(",")
    : [];
  const { toast } = useToast();

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(10);

  const router = useRouter();

  useEffect(() => {
    if (paymentSuccessful && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      router.push(redirecturl!); // Replace with the actual URL you want to redirect to
    }
  }, [paymentSuccessful, timeLeft, router]);

  const handlePaymentSuccess = () => {
    setPaymentSuccessful(true);
  };

  const [networks, setNetworks] = useState<Network[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenPrice, setTokenPrice] = useState<number | undefined>();
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
      setNetworks(
        data.filter(
          (network) =>
            network.chain_identifier !== null &&
            allowedNetworks.includes(network.name),
        ),
      );
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
  const handleCryptoPayment = async () => {
    if (!selectedToken) return;

    setPaymentLoading(true);
    try {
      if (typeof window.ethereum !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const provider = new ethers.BrowserProvider(window.ethereum);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const signer = await provider.getSigner();

        const amountInToken = Number(PlanPrice) / tokenPrice!;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        const amountInWei = ethers.parseEther(amountInToken.toFixed(18));

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const tx = await signer.sendTransaction({
          to: recipientAddress,
          value: amountInWei,
        });

        await tx.wait();

        toast({
          title: "Payment Successful",
          description: `You have successfully paid ${amountInToken.toFixed(6)} ETH for the ${PlanName} plan.`,
        });
        handlePaymentSuccess();
      } else {
        throw new Error("MetaMask is not installed");
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Payment Failed",
        description: "some shit went down",
        variant: "destructive",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const getQRCodeValue = () => {
    if (!tokenPrice) return "";
    const amountInEth = Number(PlanPrice) / tokenPrice;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return `${selectedToken}:${recipientAddress}?value=${ethers.parseEther(
      amountInEth.toFixed(18),
    )}`;
  };

  useEffect(() => {
    const fetchTokenPrice = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${selectedToken}&vs_currencies=usd`,
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data: CryptoPriceResponse = await response.json();

        // Now the `ethereum` object and its properties are typed properly
        setTokenPrice(data.ethereum.usd);
      } catch (error) {
        console.error("Failed to fetch ETH price:", error);
        toast({
          title: "Error",
          description: "Failed to fetch ETH price. Please try again later.",
          variant: "destructive",
        });
      }
    };
    void fetchTokenPrice();
  }, []);
  return (
    <>
      <div className="container mx-auto max-w-lg p-4">
        <h1 className="mb-8 text-center text-4xl font-bold">
          Choose Your Plan
        </h1>
        <div className="">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Proceed to Payment</CardTitle>
              <CardDescription>Pay with cryptocurrency (ETH)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{PlanName}</span>
                  <span className="text-2xl font-bold">${PlanPrice}</span>
                </div>

                <div className="text-sm text-muted-foreground">chosen plan</div>
              </div>
              <div className="mx-auto w-full max-w-md space-y-6 rounded-lg bg-card p-6 shadow-md">
                <div className="space-y-2">
                  <Label htmlFor="network-select">Select Network</Label>
                  {loading && !selectedNetwork ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      onValueChange={handleNetworkChange}
                      value={selectedNetwork}
                    >
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
                  <div className="rounded-md bg-muted p-4">
                    <p className="font-semibold">Selected:</p>
                    <p>
                      Network:{" "}
                      {networks.find((n) => n.id === selectedNetwork)?.name}
                    </p>
                    <p>
                      Token: {tokens.find((t) => t.id === selectedToken)?.name}{" "}
                      ({tokens.find((t) => t.id === selectedToken)?.symbol})
                    </p>
                    <p>Price : {tokenPrice}</p>
                  </div>
                )}
              </div>
              {!paymentSuccessful ? (
                <div>
                  {showQR ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex h-48 w-48 items-center justify-center bg-muted">
                        <QRCodeSVG value={getQRCodeValue()} size={200} />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowQR(false)}
                      >
                        Hide QR Code
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={handleCryptoPayment}
                        disabled={paymentLoading}
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        {paymentLoading ? "Processing..." : `Pay with MetaMask`}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowQR(true)}
                      >
                        <QrCode className="mr-2 h-5 w-5" /> Show QR Code
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="my-5 flex w-full items-center justify-center">
                  <CheckIcon className="size-11 text-green-500"></CheckIcon>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {!paymentSuccessful ? (
          <div></div>
        ) : (
          <div className="m-5 text-center text-3xl font-bold text-green-500">
            <h2>Payment Successful!</h2>
            <p>Redirecting in {timeLeft} seconds...</p>
          </div>
        )}
      </div>
    </>
  );
}
