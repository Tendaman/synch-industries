//src\app\codepage\gen-code\page.tsx

"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GenCodePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email"); // Fetch email from the query parameter
  const [assignedCode, setAssignedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (email) {
      // Fetch assigned code from your backend
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
  }, [email]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Your Assigned Code</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500 mt-4">{error}</p>
      ) : assignedCode ? (
        <p className="text-4xl font-semibold mt-4 bg-gray-200 px-6 py-2 rounded-lg">
          {assignedCode}
        </p>
      ) : (
        <p className="text-red-500 mt-4">No code found. Please try again.</p>
      )}

      <div className="mt-8">
        <Button onClick={() => router.push("/")}>Close</Button>
      </div>
    </div>
  );
}