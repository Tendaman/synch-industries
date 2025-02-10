//src\app\admin\GenCodepage\page.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DatePickerComponent from "@/components/ui/datepicker"; // Correct import

import axios from "axios";
import { useRouter } from "next/navigation";

export default function GenCodePage() {
  const [numOfCodes, setNumOfCodes] = useState(0);
  const [numOfWinners, setNumOfWinners] = useState(0);
  const [expirationDate, setExpirationDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Use onChangeAction in the parent component
  const handleDateChangeAction = (date: string | null) => {
    setExpirationDate(date);
  };

  const handleGenerateCodes = async () => {
    setIsLoading(true);
    try {
      // Send request to backend API to generate codes
      const response = await axios.post("/api/admin/generateCodes", {
        numOfCodes,
        numOfWinners,
        expirationDate,
      });

      if (response.status === 200) {
        alert("Codes generated successfully!");
        router.push("/admin/GenCodepage");
      } else {
        alert("Failed to generate codes.");
      }
    } catch (error) {
      console.error("Error generating codes:", error);
      alert("Error generating codes.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-8">Generate Codes</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Number of Codes</label>
          <Input
            type="number"
            value={numOfCodes}
            onChange={(e) => setNumOfCodes(Number(e.target.value))}
            min={1}
            className="mt-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Number of Winning Codes</label>
          <Input
            type="number"
            value={numOfWinners}
            onChange={(e) => setNumOfWinners(Number(e.target.value))}
            min={1}
            max={numOfCodes}
            className="mt-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Expiration Date and Time</label>
          <DatePickerComponent
            selected={expirationDate}
            onChangeAction={handleDateChangeAction} // Updated here
           />
        </div>

        <div className="mt-6">
          <Button onClick={handleGenerateCodes} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Codes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
