import { signOutAction } from "@/app/server/auth-actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Settings, LogOut } from "lucide-react";

export default async function AuthButton() {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let contributorName = null;
  let avatarUrl = null;

  if (user) {
    // Get contributor name
    const { data: contributor, error } = await supabase
      .from("contributor")
      .select("name")
      .eq("contributorid", user?.id)
      .single();

    if (error) {
      console.log("Error fetching contributor:", error);
    } else {
      console.log(user?.user_metadata?.avatar_url);
      contributorName = contributor?.name;
    }

    // Get avatar URL from user metadata
    avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  }

  const getInitials = (name: string) => {
    if (!name) return "U";
    
    const parts = name.split(' ');
    if (parts.length === 1) {
      // For single name, return first letter
      return parts[0].charAt(0).toUpperCase();
    } else {
      // For multiple names, return first letter of first and last name
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
  };

  return user ? (
    <div className="flex items-center gap-2 bg-white rounded-[75px] shadow-sm pl-[20px]">
      <span className="hidden sm:inline text-[#222] text-[0.8rem] font-bold">Hey, {contributorName || "you're not supposed to be here"}!</span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative p-0 h-9 w-9 rounded-full overflow-hidden">
            <Avatar className="h-full w-full text-white">
              <AvatarImage 
                src={avatarUrl || ""} 
                alt={contributorName || "User"} 
                className="object-cover"
              />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {getInitials(contributorName || "")}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-md rounded-md p-1 w-48">
          <DropdownMenuItem asChild className="rounded-sm px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">
            <Link href="/forgot-password" className="flex items-center gap-2 text-gray-700">
              <Settings size={16} />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="h-px bg-gray-200 my-1" />
          <form action={signOutAction} className="w-full">
            <DropdownMenuItem asChild className="rounded-sm px-3 py-2 text-sm hover:bg-red-50 cursor-pointer">
              <div className="flex items-center gap-2 text-red-600 w-full">
                <LogOut size={16} />
                <button type="submit" className="text-sm font-normal">Sign out</button>
              </div>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
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