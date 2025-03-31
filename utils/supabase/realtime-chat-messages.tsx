"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// Define the ChatMessage type
type ChatMessage = {
  chatMessageID: string;
  sentBy: string;
  context: string;
  longitude: string;
  latitude: string;
  dateCreated: string;
  isArchived: boolean;
};

export default function RealtimeChatMessages({ message }: { message: ChatMessage[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Fetch authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/sign-in");
      } else {
        setUser(data.user);
      }
    };

    fetchUser();
  }, [supabase, router]);

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      console.log(`Viewport Size: ${window.innerWidth} x ${window.innerHeight}`);
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <pre className="text-black">lkndflknkflknfnd</pre>
      <p className="text-gray-500">Window: {windowSize.width} x {windowSize.height}</p>
    </div>
  );
}
