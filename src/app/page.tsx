"use client";
import React, { useEffect, useState } from "react";
import { Check, Wallet, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

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

const plans: plansType[] = [
  {
    name: "Basic",
    price: 10,
    features: ["feature 1", "feature 1", "feature 1"],
  },
  {
    name: "Pro",
    price: 20,
    features: ["feature 1", "feature 1", "feature 1"],
  },
  {
    name: "Enterprise",
    price: 50,
    features: ["feature 1", "feature 1", "feature 1"],
  },
];

export default function Component() {
  const [selectedPlan, setSelectedPlan] = useState<plansType | undefined>(
    plans[0],
  );
  const { toast } = useToast();
  const [ethPrice, setEthPrice] = useState<number | undefined>();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Replace with your actual wallet address
  const recipientAddress = "0x1234567890123456789012345678901234567890";

  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data: CryptoPriceResponse = await response.json();

        // Now the `ethereum` object and its properties are typed properly
        setEthPrice(data.ethereum.usd);
      } catch (error) {
        console.error("Failed to fetch ETH price:", error);
        toast({
          title: "Error",
          description: "Failed to fetch ETH price. Please try again later.",
          variant: "destructive",
        });
      }
    };
    void fetchEthPrice();
  }, []);

  const handleCryptoPayment = async () => {
    if (!selectedPlan || !ethPrice) return;

    setPaymentLoading(true);
    try {
      if (typeof window.ethereum !== "undefined") {
        // Request account access
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Create a new Web3Provider
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const provider = new ethers.BrowserProvider(window.ethereum);

        // Get the signer
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const signer = await provider.getSigner();

        const amountInEth = selectedPlan.price / ethPrice;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const amountInWei = ethers.parseEther(amountInEth.toFixed(18));

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const tx = await signer.sendTransaction({
          to: recipientAddress,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value: amountInWei,
        });

        await tx.wait();

        toast({
          title: "Payment Successful",
          description: `You have successfully paid ${amountInEth.toFixed(6)} ETH for the ${selectedPlan.name} plan.`,
        });
      } else {
        throw new Error("MetaMask is not installed");
      }
    } catch (error) {
      console.error("Payment failed:", error);
      toast({
        title: "Payment Failed",
        description:
          "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const getQRCodeValue = () => {
    if (!selectedPlan || !ethPrice) return "";
    const amountInEth = selectedPlan.price / ethPrice;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return `ethereum:${recipientAddress}?value=${ethers.parseEther(
      amountInEth.toFixed(18),
    )}`;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-8 text-center text-3xl font-bold">Choose Your Plan</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Select a Plan</CardTitle>
            <CardDescription>
              Choose the plan that works best for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              onValueChange={(value: string) => setSelectedPlan(plans[+value])}
              value={plans
                .findIndex((plan) => plan === selectedPlan)
                .toString()}
            >
              {plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className="flex items-center space-x-2 space-y-2"
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`plan-${index}`}
                  />
                  <Label htmlFor={`plan-${index}`} className="flex flex-col">
                    <span className="text-lg font-semibold">{plan.name}</span>
                    <span className="text-muted-foreground text-sm">
                      ${plan.price}/month
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <div className="w-full">
              <h3 className="mb-2 font-semibold">Features:</h3>
              <ul>
                {selectedPlan?.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardFooter>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Proceed to Payment</CardTitle>
            <CardDescription>Pay with cryptocurrency (ETH)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Current ETH price: ${ethPrice?.toFixed(2) ?? "Loading..."}
            </p>
            <p className="mb-4">
              Amount to pay:
              {selectedPlan
                ? (selectedPlan.price / (ethPrice ?? 1)).toFixed(6)
                : "0"}{" "}
              ETH
            </p>

            <Card>
              <CardHeader>
                <div className="flex w-full flex-row justify-between">
                  <CardTitle>{selectedPlan?.name}</CardTitle>

                  <CardTitle>${selectedPlan?.price}</CardTitle>
                </div>
                <CardDescription>chosen plan</CardDescription>
              </CardHeader>
            </Card>
            <div className="my-5">
              <div className="flex space-x-2">
                <Button
                  className="w-full"
                  onClick={handleCryptoPayment}
                  disabled={paymentLoading}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {paymentLoading ? "Processing..." : `Pay with MetaMask`}
                </Button>
                <Button
                  className="w-full"
                  onClick={() => setShowQR(!showQR)}
                  variant="outline"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  {showQR ? "Hide QR Code" : "Show QR Code"}
                </Button>
              </div>
              {showQR && (
                <div className="mt-4 flex justify-center">
                  <div className="flex flex-col items-center">
                    <p>Or scan this QR code to pay</p>
                    <QRCodeSVG value={getQRCodeValue()} size={200} />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
