"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function GenCodeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email"); // Fetch email from the query parameter
  const [assignedCode, setAssignedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (email) {
      fetch(`/api/gencode?email=${email}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.assignedCode) {
            setAssignedCode(data.assignedCode);
          } else {
            setError("No code found for this email.");
          }
        })
        .catch((err) => {
          setError("Error retrieving code.");
          console.error("Error:", err);
        })
        .finally(() => setLoading(false));
    } else {
      setError("No email provided in the URL.");
      setLoading(false);
    }
  }, [searchParams]);

  const boothNumber = 12;

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 px-6 md:px-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-700 mb-4">Your Contest Code</h1>
        <p className="text-lg text-gray-600 mb-4">
          You're one step away from winning exciting prizes! Follow these steps carefully:
        </p>

        <div className="text-left space-y-4">
          <div><strong className="text-blue-600">Step 1:</strong> Visit <span className="font-semibold text-blue-600">Booth #{boothNumber}</span>.</div>
          <div><strong className="text-blue-600">Step 2:</strong> Show this code to the booth staff.</div>
          <div><strong className="text-blue-600">Step 3:</strong> Enter your code to see if you've won a prize!</div>
          <div><strong className="text-blue-600">Step 4:</strong> If you win, collect your prize right there at the booth!</div>
        </div>
      </div>

      {loading ? (
        <p className="flex gap-4 mb-8">Loading...</p>
      ) : error ? (
        <p className="text-red-500 mt-4">{error}</p>
      ) : assignedCode ? (
        <div className="flex gap-4 mb-8">
          {String(assignedCode).split('').map((digit, index) => (
            <div
              key={index}
              className="w-16 h-16 flex items-center justify-center border-2 border-blue-600 rounded-md text-2xl font-bold text-blue-600"
            >
              {digit}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-red-500 mt-4">No code found. Please try again.</p>
      )}

      <div className="text-center">
        <Button className="bg-red-600 text-lg p-6" onClick={() => router.push("/")}>Close</Button>
        <p className="text-sm text-gray-500 mt-8">If you have any issues, please contact support.</p>
      </div>
    </div>
  );
}

export default function GenCodePage() {
  return (
    <Suspense fallback={<p className="text-center mt-10 text-gray-500">Loading...</p>}>
      <GenCodeContent />
    </Suspense>
  );
}
