"use client";

import { useEffect, useState } from "react";
import { getSupabaseAuth } from "@/utils/supabase/auth-singleton";

type MessageProps = {
  sentBy: string;
  context: string;
  dateCreated: string;
};

export default function MessageComponent({ sentBy, context }: MessageProps) {
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [displayName, setDisplayName] = useState(sentBy.substring(0, 2).toUpperCase());
  
  useEffect(() => {
    // Check if the message was sent by the current user
    const checkCurrentUser = async () => {
      const supabaseAuth = getSupabaseAuth();
      const user = await supabaseAuth.getUser();
      
      if (user && user.id === sentBy) {
        setIsCurrentUser(true);
        setDisplayName("You");
      } else {
        setIsCurrentUser(false);
        // Use the first two characters of the sender's ID as avatar text
        setDisplayName(sentBy.substring(0, 2).toUpperCase());
      }
    };
    
    checkCurrentUser();
  }, [sentBy]);
  
  return (
    <div className={`flex items-start gap-2 mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar - only show for others, not current user */}
      {!isCurrentUser && (
        <div 
          className="w-8 h-8 rounded-full overflow-hidden bg-[#13783e] flex items-center justify-center flex-shrink-0"
          style={{ minWidth: '2rem', minHeight: '2rem' }}
        >
          <span className="text-white text-xs font-bold">
            {displayName}
          </span>
        </div>
      )}
      
      {/* Message content */}
      <div className={`flex flex-col max-w-[80%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div 
          className={`px-4 py-2 rounded-3xl ${
            isCurrentUser ? 'bg-blue-500 text-white' : 'bg-white text-black'
          }`}
          style={{ wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: '100%' }}
        >
          <p className="text-sm" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{context}</p>
        </div>
      </div>
    </div>
  );
}