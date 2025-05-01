"use client";

import { useState } from 'react';
import { X } from "lucide-react";

export function ErrorDisplay({ message }: { message: string }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div 
      className="bg-red-100 border border-red-400 text-red-700 w-full px-4 py-2 rounded relative mb-4 text-sm cursor-pointer" 
      role="alert"
      onClick={() => setIsVisible(false)}
    >
      <div className="flex items-center gap-[5px]">
        <button
          className="flex-shrink-0 rounded-full hover:bg-red-200 transition-colors"
          aria-label="close"
        >
          <X className="h-4 w-4 text-red-500 -mt-[1px]" />
        </button>
        <div className="flex-grow">
          <span dangerouslySetInnerHTML={{ __html: message }} />
        </div>
      </div>
    </div>
  );
}