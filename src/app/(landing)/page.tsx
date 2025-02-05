"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import RegisterPopup from "./components/register_popup";

function LandingPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <main>
        <Features />
        <div className="flex flex-col items-center">
          <Button onClick={() => setIsPopupOpen(true)}>Register Now</Button>
        </div>
        <RegisterPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
      </main>
    </div>
  );
}

export default LandingPage;

const Features = () => {
  return (
    <div className="mx-4 mb-14 mt-6 flex flex-1 flex-col items-center text-center sm:mb-12 md:mb-32 md:mt-20">
      <h1 className="max-w-5xl text-2xl font-bold sm:text-4xl md:text-6xl">
        Register now to stand a chance to win amazing prizes with{" "}
        <span className="bg-gradient-to-r from-red-400 to-purple-600 bg-clip-text text-transparent">
          Synch Industries
        </span>
      </h1>
    </div>
  );
};
