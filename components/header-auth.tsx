// src
import { signOutAction } from "@/app/server/auth-actions";
import Link from "next/link";
import { Button } from "./ui/button"; // Assuming this is your shadcn/ui Button
import { createClient } from "@/utils/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LogOut } from "lucide-react";

export default async function AuthComponent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let contributorName = null;
  let avatarUrl = null;

  if (user) {
    const { data: contributor } = await supabase
      .from("contributor")
      .select("name")
      .eq("contributorid", user.id) // Use user.id directly
      .single();

    // No need to log error here unless debugging, as it's handled by fallback
    if (contributor) {
      contributorName = contributor.name;
    }

    avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
  }

  const getInitials = (name: string | null) => { // Allow name to be null
    if (!name) return "U";
    
    const parts = name.split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    } else {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
  };

  return user ? (
    // Logged-in state: Avatar, Name, and Sign Out Button
    <div className="flex items-center gap-4"> {/* Main container for logged-in elements */}
      
      {/* User Greeting & Avatar */}
      <div className="flex items-center gap-2">
        <Avatar className="h-9 w-9"> {/* Standard avatar size */}
          <AvatarImage 
            src={avatarUrl || ""} 
            alt={contributorName || "User"} 
            className="object-cover"
          />
          <AvatarFallback className="bg-[#13783e] text-white font-medium"> {/* Ensure good contrast and readability */}
            {getInitials(contributorName)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline text-gray-700 text-sm font-medium">
          Hey, {contributorName || "you're not supposed to be here..."}!
        </span>
      </div>

      {/* Sign Out Form and Button */}
      <form action={signOutAction}>
        <Button 
          type="submit" 
          variant="ghost"
          size="sm" 
          className="text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md"
        >
          <LogOut size={16} />
        </Button>
      </form>

    </div>
  ) : (
    // Logged-out state: Sign In and Sign Up Buttons
    <div className="flex gap-2">
      <Button asChild size="default" variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="default" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}