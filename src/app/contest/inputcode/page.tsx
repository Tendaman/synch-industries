//src\app\contest\inputcode\page.tsx

"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { motion } from "framer-motion";

import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

function InputCodeContent() {
    const searchParams = useSearchParams();
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<"won" | "lost" | "error" | null>(null);
    const { width, height } = useWindowSize(); // Get window size for confetti

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
            setLoading(true);
            const response = await fetch("/api/contest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: otp }),
            });

            const data = await response.json();
            setLoading(false);

            if (!response.ok) {
                setMessage(data.message || "⚠️ Something went wrong. Please try again.");
                setMessageType("error");
                return;
            }

            setMessage(data.message);
            setMessageType(data.status); // 'won' or 'lost'
        } catch (error) {
            setLoading(false);
            console.error("Error submitting OTP:", error);
            setMessage("⚠️ Something went wrong. Please try again.");
            setMessageType("error");
        }
    };

    const handleReset = () => {
        setOtp("");
        setMessage(null);
        setMessageType(null);
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-gray-200 pb-6">
            {messageType === "won" && <Confetti width={width} height={height} />}
            <div className="flex justify-center items-center gap-x-10 mt-5 w-full max-w-screen-lg pb-10">
                <a href="https://synchindustries.com" target="_blank" rel="noopener noreferrer">
                    <img src="/logo1.svg" alt="Logo 1" className="h-[200px] w-auto opacity-90 hover:opacity-100 transition-opacity"/>
                </a>
                <a href="https://africaenergyindaba.com/" target="_blank" rel="noopener noreferrer">
                    <img src="/logo2.svg" alt="Logo 2" className="h-[150px] w-auto opacity-90 hover:opacity-100 transition-opacity"/>
                </a>
            </div>

            {/* Conditional Rendering: If messageType is set, show only the result message */}
            {messageType ? (
                <><div
                    className={`p-6 rounded-lg shadow-lg text-center max-w-md ${messageType === "won"
                            ? "bg-green-100 text-green-700"
                            : messageType === "lost"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"}`}
                >
                    <h1 className="text-2xl font-bold">{message}</h1>
                    {messageType === "won"}
                    {messageType === "lost"}


                </div>
                <button
                    onClick={handleReset}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
                >
                        Try Again
                </button></>
            ) : (
                // Show OTP Input only when no result is displayed
                <motion.div
                    className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-screen-lg h-[500px] flex flex-col justify-between"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Heading */}
                    <h1 className="text-4xl font-bold text-gray-700 text-center">
                        Enter your code here to see if you won one of our fantastic prizes
                    </h1>
                
                    <div className="flex justify-center mt-6">
                        <InputOTP maxLength={4} value={otp} onChange={handleOtpChange}>
                            <InputOTPGroup>
                                {[0, 1, 2, 3].map((index) => (
                                    <InputOTPSlot key={index} index={index} className="text-3xl border-gray-400 p-4" />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleSubmit}
                            disabled={otp.length < 4 || loading}
                            className={`mt-6 w-full px-6 py-2 text-white font-semibold text-lg rounded-md
                                transition-all duration-200 
                                ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
                            `}
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </motion.div>
            )}
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
