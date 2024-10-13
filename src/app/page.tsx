"use client";

import { useState } from "react";
import { Check, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";
interface plansType {
  name: string;
  price: number;
  features: string[];
}

const plans: plansType[] = [
  {
    name: "Basic",
    price: 10,
    features: ["1 user", "10GB storage", "Email support"],
  },
  {
    name: "Pro",
    price: 20,
    features: ["5 users", "50GB storage", "Priority email support"],
  },
  {
    name: "Enterprise",
    price: 50,
    features: ["Unlimited users", "500GB storage", "24/7 phone support"],
  },
];

export default function Component() {
  const [selectedPlan, setSelectedPlan] = useState<plansType | undefined>(
    plans[0],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedPlan) {
      console.log("No plan selected");
      return;
    }

    try {
      // Create a charge in Coinbase Commerce
      const response = await axios.post(
        "https://api.commerce.coinbase.com/charges",
        {
          name: `${selectedPlan.name} Plan`,
          description: `Subscription for ${selectedPlan.name} plan`,
          local_price: {
            amount: selectedPlan.price.toString(),
            currency: "USD", // Change this if using a different fiat currency
          },
          pricing_type: "fixed_price",
          redirect_url: "https://yourapp.com/payment-success", // Redirect URL after successful payment
          cancel_url: "https://yourapp.com/payment-cancel", // Redirect URL after cancellation
        },
        {
          headers: {
            "X-CC-Api-Key": "YOUR_COINBASE_COMMERCE_API_KEY", // Replace with your Coinbase API key
          },
        },
      );

      const { hosted_url } = response.data.data; // Get the payment URL
      window.location.href = hosted_url; // Redirect the user to the crypto payment page
    } catch (error) {
      console.error("Payment failed:", error);
    }
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
              onValueChange={(value: string) => setSelectedPlan(plans[+value])} // Using unary + to convert string to number
              value={plans
                .findIndex((plan) => plan === selectedPlan)
                .toString()} // Ensuring the selected value stays in sync
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

        {/* <Card className="w-full">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              Enter your payment information to complete your purchase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Name on Card</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="number">Card Number</Label>
                  <Input id="number" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit">
              <CreditCard className="mr-2 h-4 w-4" /> Pay ${selectedPlan?.price}
            </Button>
          </CardFooter>
        </Card> */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Proceed to Payment</CardTitle>
            <CardDescription>Pay with cryptocurrency</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleSubmit}>
              Pay with Crypto ${selectedPlan?.price}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
