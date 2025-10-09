// components/ui/PageModal.tsx

'use client';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react'; // Using lucide-react for the icon

export function PageModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    // This is the key part:
    // - `absolute` positioning to overlay on top of the {children}
    // - `inset-0` to cover the entire parent container
    // - `bg-white` (or your app's background color) to hide the content underneath
    // - `overflow-y-auto` to allow this modal to scroll independently
    <div className="absolute inset-0 bg-white z-10 overflow-y-auto custom-scrollbar">
      {/* Optional: Add a close button for better UX */}
      <div className="container max-w-5xl mx-auto h-fit pt-6">
        <button
          onClick={() => router.back()}
          className="fixed top-20 right-8 h-8 w-8 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 z-20"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}