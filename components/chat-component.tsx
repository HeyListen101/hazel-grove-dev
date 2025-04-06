"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import MessageComponent from "@/components/ui/message-card";
import { Button } from "@/components/ui/button";
import { Send, Smile, X } from "lucide-react";

// chatmessage table structure since supabase needs docker automatically create the table for you
type ChatMessage = {
  chatmessageid: string;  
  sentby: string;         
  content: string; 
  longitude: number;      
  latitude: number;       
  datecreated: string;    
  isarchived: boolean;    
};

export default function ChatComponent({ messages }: { messages: ChatMessage[] }) {
  const supabase = createClient();
  const [showChat, setShowChat] = useState(false);
  const [chats, setChats] = useState<ChatMessage[]>(messages || []);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const channel = supabase
      .channel("realtime messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chatmessage" }, (payload) => {
        const newMessage = payload.new as ChatMessage;
        setChats((prevChats) => [...prevChats, newMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    // Create a temporary ID for optimistic UI update
    const tempId = crypto.randomUUID();
    
    // Add message to local state immediately (optimistic update)
    const newMessage: ChatMessage = {
      chatmessageid: tempId,
      sentby: "User", // TODO: Replace with actual user data
      content: message,
      longitude: 0,
      latitude: 0,
      datecreated: new Date().toISOString(),
      isarchived: false
    };
    
    setChats((prevChats) => [...prevChats, newMessage]);
    setMessage("");
    
    // Send to database
    try {
      await supabase.from("chatmessage").insert([{ 
        sentby: "User", 
        content: message,
        longitude: 0,
        latitude: 0
      }]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // For debugging: add this to check what data you have
  console.log("Current chats:", chats);

  return (
    <div className="fixed bottom-5 left-3 flex items-center space-x-2 z-10">
      <Button variant="chat" onClick={() => setShowChat(!showChat)}>
        {showChat ? "Close Chat" : "Community Chat"}
      </Button>

      {showChat && (
        <div className="absolute bottom-12 left-0 w-80 bg-white shadow-lg rounded-md flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between w-full p-3 border-b">
            <p className="font-bold text-black">Community Chat</p>
            <button className="text-gray-600" onClick={() => setShowChat(false)}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="p-3 space-y-4 max-h-96 overflow-y-auto bg-gray-50 flex flex-col">
            {chats && chats.length > 0 ? (
              chats.map((chat, index) => (
                <MessageComponent
                  key={chat.chatmessageid || `chat-${index}`}
                  sentBy={chat.sentby}
                  context={chat.content}  // Map content to context
                  dateCreated={chat.datecreated}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center">No messages yet!</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="flex items-center p-3 bg-white border-t">
            <button className="p-2 text-gray-500">
              <span className="font-medium text-gray-500">Aa</span>
            </button>
            <button className="p-2 text-gray-500">
              <Smile size={20} />
            </button>
            <input
              type="text"
              className="flex-grow p-2 text-sm rounded-full border focus:outline-none focus:ring-1 focus:ring-blue-500 mx-2"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button 
              onClick={sendMessage} 
              className="p-2 text-blue-500"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}