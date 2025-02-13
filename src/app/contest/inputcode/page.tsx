//src\app\contest\inputcode\page.tsx

"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

function InputCodeContent() {
    const searchParams = useSearchParams();
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<"won" | "lost" | "error" | null>(null);

    const handleOtpChange = (value: string) => {
        setOtp(value.trim());
        setMessage(null);
    };

    const handleSubmit = async () => {
        if (otp.length < 4) {
            setMessage("⚠️ Please enter a valid 4-digit code.");
            setMessageType("error");
            return;
        }

        try {
            const response = await fetch("/api/contest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "⚠️ Something went wrong. Please try again.");
                setMessageType("error");
                return;
            }

            setMessage(data.message);
            setMessageType(data.status); // 'won' or 'lost'
        } catch (error) {
            console.error("Error submitting OTP:", error);
            setMessage("⚠️ Something went wrong. Please try again.");
            setMessageType("error");
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-6">
            <div className="flex justify-center items-center gap-x-10 mt-5 h-[50px] w-full max-w-screen-lg pb-20">
                <a href="https://synchindustries.com" target="_blank" rel="noopener noreferrer">
                    <img src="/logo1.svg" alt="Logo 1" className="h-20 w-auto"/>
                </a>
                <a href="https://africaenergyindaba.com/" target="_blank" rel="noopener noreferrer">
                    <img src="/logo2.svg" alt="Logo 2" className="h-16 w-auto"/>
                </a>
            </div>

            {message && (
                <div
                    className={`p-6 rounded-lg shadow-lg text-center max-w-md mb-6 ${
                        messageType === "won"
                            ? "bg-green-100 text-green-700"
                            : messageType === "lost"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                    <h1 className="text-2xl font-bold">{message}</h1>
                    {messageType === "won" && <img src="/placehold.jpg" alt="Winner" className="w-40 h-40 mx-auto my-5"/>}
                    {messageType === "lost" && <img src="/logo2.svg" alt="Loser" className="w-40 h-40 mx-auto my-5"/>}
                </div>
            )}

            <h1 className="text-3xl sm:text-lg font-bold text-gray-700 mb-6 text-center">
                Enter Your Contest Code
            </h1>

            <InputOTP maxLength={4} value={otp} onChange={handleOtpChange}>
                <InputOTPGroup>
                    {[0, 1, 2, 3].map((index) => (
                        <InputOTPSlot key={index} index={index} />
                    ))}
                </InputOTPGroup>
            </InputOTP>

            <button
                onClick={handleSubmit}
                disabled={otp.length < 4}
                className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold text-lg rounded-md
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Submit
            </button>
        </div>
    );
}

export default function Inputcode() {
    return (
        <Suspense fallback={<p className="text-center mt-10 text-gray-500">Loading...</p>}>
            <InputCodeContent />
        </Suspense>
    );
}
