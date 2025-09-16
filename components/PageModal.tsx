'use client';
import { RemoveScroll } from 'react-remove-scroll'; // Import the component

export function PageModal({ children }: { children: React.ReactNode }) {

    return (
        // This is the key part:
        // - `absolute` positioning to overlay on top of the {children}
        // - `inset-0` to cover the entire parent container
        // - `bg-white` (or your app's background color) to hide the content underneath
        // - `overflow-y-auto` to allow this modal to scroll independently
        <RemoveScroll>
            <div className="absolute pt-14 text-white inset-0 bg-background z-10 overflow-y-auto custom-scrollbar">
                <div className='w-full px-4'>
                    {children}
                </div>
            </div>
        </RemoveScroll>
    );
}