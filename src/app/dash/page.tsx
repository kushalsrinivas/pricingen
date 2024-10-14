"use client";

import { useState } from "react";

import { PlusCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConnectButton from "@/components/modals/LoginForm";

type PaymentGateway = {
  id: string;
  name: string;
  type: string;
  address: string;
  merchantId: string;
};

export default function PaymentGatewayDashboard() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [newGateway, setNewGateway] = useState<Omit<PaymentGateway, "id">>({
    name: "",
    type: "",
    address: "",
    merchantId: "",
  });
  const [expandedGateway, setExpandedGateway] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGateway({ ...newGateway, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setNewGateway({ ...newGateway, type: value });
  };

  const handleAddGateway = () => {
    if (
      newGateway.name &&
      newGateway.type &&
      newGateway.address &&
      newGateway.merchantId
    ) {
      setGateways([...gateways, { ...newGateway, id: Date.now().toString() }]);
      setNewGateway({ name: "", type: "", address: "", merchantId: "" });
    } else {
      alert("Please fill in all fields");
    }
  };

  const handleDeleteGateway = (id: string) => {
    setGateways(gateways.filter((gateway) => gateway.id !== id));
    if (expandedGateway === id) {
      setExpandedGateway(null);
    }
  };

  const toggleGatewayExpansion = (id: string) => {
    setExpandedGateway(expandedGateway === id ? null : id);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="absolute right-0 top-0 m-5 cursor-pointer">
        <ConnectButton></ConnectButton>
      </div>
      <h1 className="mb-4 text-2xl font-bold">Payment Gateway Dashboard</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Payment Gateway</CardTitle>
          <CardDescription>
            Enter the details for a new payment gateway
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Gateway Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newGateway.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="type">Gateway Type</Label>
                <Select
                  onValueChange={handleSelectChange}
                  value={newGateway.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">address</Label>
                <Input
                  id="address"
                  name="address"
                  value={newGateway.address}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="merchantId">Merchant ID</Label>
                <Input
                  id="merchantId"
                  name="merchantId"
                  value={newGateway.merchantId}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddGateway}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Gateway
          </Button>
        </CardFooter>
      </Card>

      <h2 className="mb-4 text-xl font-semibold">Your Payment Gateways</h2>
      {gateways.length === 0 ? (
        <p className="text-muted-foreground">No payment gateways added yet.</p>
      ) : (
        <div className="grid gap-4">
          {gateways.map((gateway) => (
            <Card key={gateway.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{gateway.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleGatewayExpansion(gateway.id)}
                  >
                    {expandedGateway === gateway.id ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </Button>
                </CardTitle>
                <CardDescription>{gateway.type}</CardDescription>
              </CardHeader>
              {expandedGateway === gateway.id && (
                <CardContent>
                  <div className="grid gap-2">
                    <div>
                      <span className="font-semibold">address:</span>{" "}
                      {gateway.address}
                    </div>
                    <div>
                      <span className="font-semibold">Merchant ID:</span>{" "}
                      {gateway.merchantId}
                    </div>
                  </div>
                </CardContent>
              )}
              <CardFooter>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteGateway(gateway.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
