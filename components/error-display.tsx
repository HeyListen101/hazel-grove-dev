"use client";

import { useState } from 'react';
import { X } from "lucide-react";

export function ErrorDisplay({ message }: { message: string }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div 
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" 
      role="alert"
    >
      <div className="flex items-start">
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 mr-2 -ml-2 mt-0.5 p-1 rounded-full hover:bg-red-200 transition-colors"
          aria-label="close"
        >
          <X className="h-4 w-4 text-red-500 -mt-0.5" />
        </button>
        <div className="flex-grow text-justify">
          <span dangerouslySetInnerHTML={{ __html: message }} />
        </div>
      </div>
    </div>
  );
}