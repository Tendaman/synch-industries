import React from 'react'
import { imageItems } from '@/app/data';
import { InfiniteMovingCards } from './infinityMovingCards';


const Products = () => {
    return (
        <div className="pb-20" id="gallery">
            {/* Main Heading - Highlighting the Giveaway */}
            <h1 className="heading">
                Stand a chance to {''}
                <span className="text-black-100 pb-10">WIN</span>
            </h1>

            {/* Subheading - Encourages Participation */}
            <h2 className="subheading">
                30 Lucky Winners Every Day
            </h2>
            <h2 className="subheading">
                Will You Be One?
            </h2>

            {/* Image Gallery Section with Infinite Scrolling Effect */}
            <div className="flex flex-col items-center justify-center p-4 gap-x-24 gap-y-8 mt-10">
                <InfiniteMovingCards
                    items={imageItems}  // Array of images showcasing products/prizes
                    direction="right"   // Scrolling direction
                    speed="fast"        // Speed of the animation
                />
            </div>
        </div>
    )
}

export default Products;