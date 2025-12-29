import React from 'react';

export default function V4Layout({ leftPanel, children, rightPanel }) {
    return (
        <div className="flex min-h-screen bg-[#F3F4F6] font-[Inter]">
            {/* Left Sidebar - Fixed */}
            <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-[240px] z-30">
                {leftPanel}
            </div>

            {/* Spacer for Left Sidebar */}
            <div className="hidden lg:block w-[240px] shrink-0" />

            {/* Center Feed - Scrolls */}
            <main className="flex-1 min-w-0 flex justify-center">
                <div className="w-full max-w-[800px] border-x border-stone-200/50 bg-white min-h-screen shadow-sm">
                    {children}
                </div>
            </main>

            {/* Spacer for Right Sidebar */}
            <div className="hidden xl:block w-[300px] shrink-0" />

            {/* Right Sidebar - Fixed */}
            <div className="hidden xl:block fixed right-0 top-0 bottom-0 w-[300px] z-30">
                {rightPanel}
            </div>
        </div>
    );
}
