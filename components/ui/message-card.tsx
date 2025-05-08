"use client";

import { useEffect, useState } from "react";
import { getSupabaseAuth } from "@/utils/supabase/auth-singleton";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Cache for storing user data to avoid repeated queries
const userCache = new Map();

type MessageProps = {
  sentBy: string;
  context: string;
  dateCreated: string;
};

export default function MessageComponent({ sentBy, context }: MessageProps) {
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [displayName, setDisplayName] = useState(sentBy.substring(0, 2).toUpperCase());
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if the message was sent by the current user
    const checkCurrentUser = async () => {
      const supabaseAuth = getSupabaseAuth();
      const currentUser = await supabaseAuth.getUser();
      
      // Check if this message was sent by the current user
      if (currentUser && currentUser?.id === sentBy) {
        setIsCurrentUser(true);
        setDisplayName("You");
        
        // Get avatar URL for current user if available
        if (currentUser?.user_metadata?.avatar_url || currentUser?.user_metadata?.picture) {
          setAvatarUrl(currentUser?.user_metadata?.avatar_url || currentUser?.user_metadata?.picture);
        }
        return;
      } else {
        setIsCurrentUser(false);
      }
      
      // Check if we already have this user's data in cache
      if (userCache.has(sentBy)) {
        const cachedUser = userCache.get(sentBy);
        setDisplayName(cachedUser.displayName);
        setAvatarUrl(cachedUser.avatarUrl);
        return;
      }
      
      // Default to first two characters of ID
      setDisplayName(sentBy.substring(0, 2).toUpperCase());
      
      // Fetch the other user's data
      const supabase = createClient();
      
      // First try to get the contributor name
      const { data: contributor } = await supabase
        .from("contributor")
        .select("*")
        .eq("contributorid", sentBy)
        .single();
      
      let finalDisplayName = sentBy.substring(0, 2).toUpperCase();
      
      if (contributor?.name) {
        const parts = contributor.name.split(' ');
        if (parts.length === 1) {
          finalDisplayName = parts[0].charAt(0).toUpperCase();
        } else {
          finalDisplayName = (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
        }
        setDisplayName(finalDisplayName);
      }
      
      const { data: userData } = await supabase
        .rpc('get_user_avatar', { user_id: sentBy });
      
      let finalAvatarUrl = null;
      
      if (userData && userData.avatar_url) {
        finalAvatarUrl = userData.avatar_url;
        setAvatarUrl(finalAvatarUrl);
      } else {
        // If no avatar URL is found, try to get the email address
        const { data: emailData } = await supabase
          .rpc('get_user_email', { user_id: sentBy });
        
        if (emailData && emailData.email) {
          // Update display name to first letter of email if we have it
          finalDisplayName = emailData.email.charAt(0).toUpperCase();
          setDisplayName(finalDisplayName);
        }
      }
      
      // Cache this user's data for future messages
      userCache.set(sentBy, {
        displayName: finalDisplayName,
        avatarUrl: finalAvatarUrl
      });
    };
    
    checkCurrentUser();
  }, [sentBy]);
  
  return (
    <div className={`flex items-start gap-2 mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar - only show for others, not current user */}
      {!isCurrentUser && (
        <div
          className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
          style={{ minWidth: '2rem', minHeight: '2rem' }}
        >
          {avatarUrl ? (
            <Avatar className="h-full w-full">
              <AvatarImage 
                src={avatarUrl} 
                alt={displayName} 
                className="object-cover"
              />
              <AvatarFallback className="bg-[#13783e] text-white text-xs font-bold">
                {displayName}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="bg-[#13783e] h-full w-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {displayName}
              </span>
            </div>
          )}
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