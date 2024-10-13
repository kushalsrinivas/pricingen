"use client";
import React, { useEffect, useState } from "react";
import { Check, Wallet, QrCode, CheckIcon, CreditCard } from "lucide-react";
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
import { useRouter } from "next/navigation";

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
  const recipientAddress = "0x1234567890123456789012345678901234567890";

  const [selectedPlan, setSelectedPlan] = useState<plansType | undefined>(
    plans[0],
  );
  const { toast } = useToast();
  const [ethPrice, setEthPrice] = useState<number | undefined>();
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
      router.push("/new-url"); // Replace with the actual URL you want to redirect to
    }
  }, [paymentSuccessful, timeLeft, router]);

  const handlePaymentSuccess = () => {
    setPaymentSuccessful(true);
  };

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const provider = new ethers.BrowserProvider(window.ethereum);

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
    if (!selectedPlan || !ethPrice) return "";
    const amountInEth = selectedPlan.price / ethPrice;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return `ethereum:${recipientAddress}?value=${ethers.parseEther(
      amountInEth.toFixed(18),
    )}`;
  };

  return (
    <>
      <div className="container mx-auto max-w-4xl p-4">
        <h1 className="mb-8 text-center text-4xl font-bold">
          Choose Your Plan
        </h1>
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
                onValueChange={(value: string) =>
                  setSelectedPlan(plans[+value])
                }
                value={plans
                  .findIndex((plan) => plan === selectedPlan)
                  .toString()}
                defaultValue="2"
                className="space-y-4"
              >
                {plans.map((plan, index) => (
                  <div
                    key={plan.name}
                    className={`flex items-center space-x-2 rounded-lg p-4 transition-colors ${selectedPlan?.name === plan.name ? "bg-primary/10" : "hover:bg-muted"}`}
                  >
                    <RadioGroupItem
                      value={index.toString()}
                      id={`plan-${index}`}
                    />
                    <Label
                      htmlFor={`plan-${index}`}
                      className="flex flex-grow cursor-pointer flex-col"
                    >
                      <span className="text-lg font-semibold">{plan.name}</span>
                      <span className="text-2xl font-bold">
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
                <ul className="space-y-2">
                  {selectedPlan?.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="h-5 w-5 text-green-500" />
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
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg">{selectedPlan?.name}</span>
                  <span className="text-2xl font-bold">
                    ${selectedPlan?.price}
                  </span>
                </div>

                <div className="text-muted-foreground text-sm">chosen plan</div>
              </div>
              <div>
                <div className="font-semibold">
                  Current ETH price: ${ethPrice?.toFixed(2) ?? "Loading..."}
                </div>
                <div className="text-lg">
                  Amount to pay:
                  <span className="font-bold">
                    {selectedPlan
                      ? (selectedPlan.price / (ethPrice ?? 1)).toFixed(6)
                      : "0"}
                    ETH
                  </span>
                </div>
              </div>
              {!paymentSuccessful ? (
                <div>
                  {showQR ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="bg-muted flex h-48 w-48 items-center justify-center">
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
