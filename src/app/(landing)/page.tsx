"use client";

import { useState } from "react";
import Products from "@/components/ui/Products";
import Hero from "@/components/Hero";

function LandingPage() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
      <main className="relative bg-[#F3F4F6] flex justify-center items-center flex-col  mx-auto sm:px-10 px-5 overflow-clip">
        <div className={"max-w-7xl w-full"}>
          <Hero/>
          <Products/>
        </div>
      </main>
  );
}

export default LandingPage;
