import React from 'react';
import V3Header from './V3Header';
import V3BottomNav from './V3BottomNav';

export default function V3Layout({ children, title }) {
    return (
        <div className="min-h-screen bg-[#FAFAF9] font-sans text-[#1C1917] selection:bg-[#0F766E] selection:text-white">
            <V3Header title={title} />

            <main className="pt-[88px] pb-32 px-6 max-w-[800px] mx-auto min-h-screen">
                {children}
            </main>

            <V3BottomNav />
        </div>
    );
}
