import React, { useState } from 'react';
import MagicButton from "./ui/MagicButton";
import { FaGift } from "react-icons/fa";
import { TextGenerateEffect } from './ui/TextGenerateEffect';
import RegisterPopup from '@/app/(landing)/components/register_popup';

const Hero = () => {
    
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    return (
        <div className="pb-20 pt-36 " id={'home'}>

            <div className="flex justify-center relative z-10 ">
                <div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center">

                    {/* Logos & Stall Location */}
                    <div className="flex items-center gap-6 mt-5 h-[50px] w-full">
                        {/* First Logo - Links to Synch Industries */}
                        <span className="flex-1 flex justify-end">
                            <a href="https://synchindustries.com" target="_blank" rel="noopener noreferrer">
                                <img src="/logo1.svg" alt="Logo 1" className="h-20 w-auto"/>
                            </a>
                        </span>

                        {/* Stall Location Display */}
                        <div className="flex-1 flex justify-center">
                            <div
                                className="px-4 py-2 border-2 border-black text-black text-sm md:text-lg font-semibold text-center">
                                Hall 3, Booth #45
                            </div>
                        </div>

                        {/* Second Logo - Links to Africa Energy Indaba */}
                        <span className="flex-1 flex justify-start">
                            <a href="https://africaenergyindaba.com/" target="_blank" rel="noopener noreferrer">
                                 <img src="/logo2.svg" alt="Logo 2" className="h-16 w-auto"/>
                            </a>
                        </span>
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