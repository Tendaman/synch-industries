import React, { useState } from 'react';
import MagicButton from "./ui/MagicButton";
import { FaGift } from "react-icons/fa";
import { TextGenerateEffect } from './ui/TextGenerateEffect';
import RegisterPopup from '@/app/(landing)/components/register_popup';

const Hero = () => {
    
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    return (
        <div className="pb-20 pt-15 " id={'home'}>

            <div className="flex justify-center relative z-10 ">
                <div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center">

                    {/* Logos & Stall Location */}
                    {/* Synch Industries Logo (Bigger & On Top) */}
                    <a href="https://synchindustries.com" target="_blank" rel="noopener noreferrer">
                        <img src="/logo1.svg" alt="Synch Industries Logo" className="h-24 w-auto mb-4"/>
                    </a>

                    <div className="flex items-center border-2 border-black pr-1 py-2 rounded-lg">
                        {/* Second Logo (Left-Aligned with No Left Padding) */}
                        <a href="https://africaenergyindaba.com/" target="_blank" rel="noopener noreferrer"
                           className="px-0 mx-0">
                            <img src="/logo2.svg" alt="Africa Energy Indaba Logo" className="h-12 w-auto"/>
                        </a>

                        {/* Stall Location (Right-Aligned) */}
                        <div className="text-black text-sm md:text-lg font-semibold text-left pl-4">
                            Hall 3, Booth #45
                        </div>
                    </div>

                    {/* Hero Heading with Animated Text Effect */}
                    <TextGenerateEffect
                        className="text-center text-[40px] md:text-5xl lg:text-6xl text-black mt-6"
                        words="Win Big with Synch Industries!"
                    />

                    {/* Subtitle encouraging users to register */}
                    <p className="text-center md:tracking-wider mb-7 text-sm md:text-lg lg:text-2xl text-blue-100">
                        Register now for a chance to win exclusive prizes!
                    </p>

                    {/* Giveaway Registration Button */}
                    <MagicButton
                        title="Enter the Giveaway"
                        icon={<FaGift/>} 
                        position="right"
                        handleClick={() => setIsPopupOpen(true)}
                    />
                    <RegisterPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
                </div>
            </div>
        </div>
    );
};

export default Hero;