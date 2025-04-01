"use client";

type MessageProps = {
  sentBy: string;
  context: string;
  dateCreated: string;
};

export default function MessageComponent({ sentBy, context, dateCreated }: MessageProps) {
  // Determine if current user based on sentBy value
  // This is a simplistic approach - you might want to compare with the actual user ID
  const isCurrentUser = sentBy === "User";
  
  // Format the name for display and avatar
  const displayName = isCurrentUser ? "You" : sentBy.substring(0, 2).toUpperCase();
  
  return (
    <div className="flex items-start gap-2">
      {/* Avatar - only show for others, not current user */}
      {!isCurrentUser && (
        <div 
          className="w-8 h-8 rounded-full overflow-hidden bg-green-500 flex items-center justify-center flex-shrink-0"
          style={{ minWidth: '2rem', minHeight: '2rem' }} // Ensure minimum dimensions
        >
          <span className="text-white text-xs font-bold">
            {displayName}
          </span>
        </div>
      )}
      
      {/* Message content */}
      <div className={`flex flex-col ${isCurrentUser ? 'items-end ml-auto' : 'items-start'}`}>
        <div 
          className={`px-3 py-2 rounded-2xl max-w-xs ${
            isCurrentUser ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'
          }`}
        >
          <p className="text-sm">{context}</p>
        </div>
      </div>
    </div>
  );
}