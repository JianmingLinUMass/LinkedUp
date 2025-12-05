'use client'

import { useState, useEffect } from 'react';

export default function GoToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({top:0, behavior: 'smooth'});
    };

    return (
        <div>
            {isVisible && (
                <button onClick={scrollToTop} className='fixed flex right-5 top-1/2 w-8 h-8 items-center justify-center bg-sky-300 hover:bg-sky-400 text-black font-bold rounded-full transition'>
                    ↑
                </button>
            )}
        </div>
    )
}