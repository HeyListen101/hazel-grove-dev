import { redirect } from "next/navigation";
import AuthBar from "@/components/header-auth";
import { SearchBar } from "@/components/search-bar";
import ChatBox from "@/components/chat-component";
import MapComponent from "@/components/map-component";
import { createClient } from "@/utils/supabase/server";
import { MapSearchProvider } from "@/components/map-search-context";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data } = await supabase.from("chatmessage").select();

  return (
    <MapSearchProvider>
      
      <header className="fixed top-0 left-0 right-0 header-auth flex gap-5 sm:justify-between items-center p-[10px] h-16 z-[20]">
          <div className="flex-1 max-w-md">
            <SearchBar/>
          </div>
          <AuthBar/>
      </header>

      <MapComponent />

      <div className="fixed bottom-5 left-5 flex items-center space-x-2 z-5">
        <ChatBox messages={data ?? []} />
      </div>
    
    </MapSearchProvider>
  );
}