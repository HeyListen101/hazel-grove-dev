"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const userCache = new Map<string, { displayName: string; avatarUrl: string | null; fullName: string | null }>();

type MessageProps = {
  sentBy: string;
  context: string;
  dateCreated: string; // Retained, though not directly used in JSX display
  viewingUserId?: string | null; // ID of the user currently viewing the chat
};

export default function MessageComponent({ sentBy, context, dateCreated, viewingUserId }: MessageProps) {
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [senderDisplayName, setSenderDisplayName] = useState(""); // For AvatarFallback of other users
  const [senderAvatarUrl, setSenderAvatarUrl] = useState<string | null>(null); // Avatar URL for other users
  const [senderFullNameHeader, setSenderFullNameHeader] = useState<string | null>(null); // Name above message for other users

  useEffect(() => {
    let isMounted = true;

    const loadMessageAuthorDetails = async () => {
      if (!isMounted) return;

      // Determine if the message is from the current viewing user
      if (viewingUserId && sentBy === viewingUserId) {
        setIsCurrentUser(true);
        return;
      }
      
      // If it's another user's message
      setIsCurrentUser(false);

      // Attempt to load from cache first for other users
      if (userCache.has(sentBy)) {
        const cached = userCache.get(sentBy)!;
        if (isMounted) {
          setSenderDisplayName(cached.displayName);
          setSenderAvatarUrl(cached.avatarUrl);
          setSenderFullNameHeader(cached.fullName);
        }
        return;
      }

      // If not in cache, fetch data for the other user:
      // Set initial fallback display name (initials) and clear previous data
      let fallbackDisplayName = sentBy.substring(0, 2).toUpperCase();
      if (isMounted) {
        setSenderDisplayName(fallbackDisplayName);
        setSenderAvatarUrl(null);
        setSenderFullNameHeader(null);
      }

      try {
        const supabaseDbClient = createClient();
        let fetchedFullName: string | null = null;
        let fetchedAvatarUrl: string | null = null;
        
        // 1. Fetch Full Name (for header and to derive a better fallback display name)
        const { data: contributor, error: contributorError } = await supabaseDbClient
          .from("contributor")
          .select("name")
          .eq("contributorid", sentBy)
          .single();

        if (!isMounted) return;

        if (contributorError && contributorError.code !== 'PGRST116') { // PGRST116 means 0 rows, not an error itself
          console.error(`Error fetching contributor name for ${sentBy}:`, contributorError.message);
        }

        if (contributor?.name) {
          fetchedFullName = contributor.name;
          const parts = contributor.name.split(' ');
          if (parts.length === 1 && parts[0]) {
            fallbackDisplayName = parts[0].charAt(0).toUpperCase();
          } else if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
            fallbackDisplayName = (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
          }
        }
        
        if(isMounted) {
            setSenderFullNameHeader(fetchedFullName);
            setSenderDisplayName(fallbackDisplayName); // Update with potentially better fallback
            userCache.set(sentBy, {
              displayName: fallbackDisplayName, // Store the derived fallback display name
              avatarUrl: fetchedAvatarUrl,
              fullName: fetchedFullName,      // Store the full name for header display
            });
        }
      } catch (error) {
        if (isMounted) {
            console.error(`Error in loadMessageAuthorDetails for user ${sentBy}:`, error);
        }
      }
    };

    loadMessageAuthorDetails();

    return () => {
      isMounted = false;
    };
  }, [sentBy, viewingUserId]); // Effect dependencies
  
  return (
    <div className={`flex items-start gap-2 mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && (
        <div
          className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
          style={{ minWidth: '2rem', minHeight: '2rem' }}
        >
          {senderAvatarUrl ? (
            <Avatar className="h-full w-full">
              <AvatarImage 
                src={senderAvatarUrl} 
                alt={senderDisplayName} 
                className="object-cover"
              />
              <AvatarFallback className="bg-[#13783e] text-white text-xs font-bold">
                {senderDisplayName}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="bg-[#13783e] h-full w-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {senderDisplayName}
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className={`flex flex-col max-w-[80%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {!isCurrentUser && senderFullNameHeader && (
          <span className="text-xs text-gray-600 mb-0.5 self-start px-1">
            {senderFullNameHeader}
          </span>
        )}
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