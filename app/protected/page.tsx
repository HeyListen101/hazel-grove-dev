import { redirect } from "next/navigation";
import AuthBar from "@/components/header-auth";
import { SearchBar } from "@/components/search-bar";
import ChatBox from "@/components/chat-component";
import MapComponent from "@/components/map-component";
import { createClient } from "@/utils/supabase/server";
import StoreComponent from "@/components/store-component"; // Your Client Component
import { MapSearchProvider } from "@/components/map-search-context";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: chatMessages } = await supabase.from("chatmessage").select();

  return (
    <MapSearchProvider>
      <div className="flex flex-col h-screen"> {/* Full screen height */}
        <header className="shrink-0 fixed top-0 left-0 right-0 header-auth flex gap-5 sm:justify-between items-center p-[10px] h-16 z-[100] bg-white shadow">
          <div className="flex-1 max-w-md">
            <SearchBar />
          </div>
          <AuthComponent />
        </header>

        {/* Main content area, takes remaining height */}
        {/*
          - On mobile (default): flex-col. StoreComponent will be visually above MapComponent due to DOM order and its own styling.
          - On desktop (md and up): flex-row (though MapComponent might take full width visually), and StoreComponent will use absolute positioning.
          The 'md:relative' on main is key for StoreComponent's absolute positioning on desktop.
        */}
        <main className="flex-grow pt-16 flex flex-col md:relative overflow-hidden relative">

          {/* Store Component - Always rendered. Its own classes will handle visibility/layout. */}
          {/* On mobile, it will be a block. On desktop, it will be absolute. */}
          <div className="w-full md:contents relative p-8"> {/* On mobile, this div helps control its flow height. On desktop, 'md:contents' makes it not affect layout. */}
             <StoreComponent />
          </div>


          {/* Map Component Area - Will be visually below StoreComponent on mobile due to flex-col */}
          {/* On desktop, StoreComponent will overlay it. */}
          <div className="flex-auto relative w-full min-h-0 top-8 p-0"> {/* Ensures MapComponent can fill space */}
            <MapComponent />
          </div>

        </main>

        <div className="fixed bottom-5 right-5 flex items-center space-x-2 z-30">
          <ChatBox messages={chatMessages ?? []} />
        </div>
      </div>
    </MapSearchProvider>
  );
}