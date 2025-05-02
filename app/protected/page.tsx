import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { MapSearchProvider } from "../../components/map-search-context";
import AuthButton from "@/components/header-auth";
import VisitaLogo from "@/components/visita-logo";
import ChatBox from "@/components/chat-component";
import MapComponent from "@/components/map-component";
import SearchBar from "@/components/search-bar";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data } = await supabase.from("chatmessage").select();

  return (
    <MapSearchProvider>
      
      <div className="flex flex-col w-screen h-screen overflow-hidden">
        {/* Header */}
        <div className="header-auth flex justify-between items-center shadow-md p-[32] h-16 backdrop-blur-sm z-20">
          <VisitaLogo />
          <div className="flex-1 max-w-md mx-4">
            <SearchBar />
          </div>
          <AuthButton />
        </div>

        {/* Map Container */}
        <div className="map-container flex-1 relative overflow-hidden">
          <MapComponent/>
        </div>

        {/* Community Chat */}
        <div className="fixed bottom-5 left-5 flex items-center space-x-2 z-30">
          <ChatBox messages={data ?? []} />
        </div>
      </div>

    </MapSearchProvider>
  );
}