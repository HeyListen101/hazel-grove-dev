'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function SuccessDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Check if there's a success message in the URL
    const successMessage = searchParams.get('success');
    if (successMessage) {
      setMessage(successMessage);
      setIsOpen(true);
      
      // Remove the success parameter from the URL without refreshing the page
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      router.replace(url.toString(), { scroll: false });
    }
  }, [searchParams, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
          <p className="text-justify text-gray-600">{message}</p>
          <button
            onClick={() => setIsOpen(false)}
            className="mt-6 px-4 py-2 bg-[#696047] text-white rounded hover:bg-[#57503A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#696047]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}