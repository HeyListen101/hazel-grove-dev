import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";

import AuthButton from "@/components/header-auth";
import VisitaLogo from "@/components/visita-logo";
import backgroundImage from "@/components/assets/background-images/MapPage.png";
import ChatButton from "@/components/chat-component"

export default async function ProtectedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div
    // Temporary background image
      className="flex flex-col w-screen h-screen overflow-hidden relative"
      style={{
        backgroundImage: `url(${backgroundImage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Header */}
      <div className="header-auth flex justify-between items-center relative z-10">
        <VisitaLogo />
        <AuthButton />
      </div>

      <main className="flex-grow w-full h-full relative z-10">
        {/* #TODO: IMPLEMENT MAP AND STORE INFORMATION HERE */}
        <div className="map-container mx-auto p-4">
          {/* Map */}
        </div>
      </main>

       {/* Community Chat */}
      <div className="fixed bottom-5 left-[13] flex items-center space-x-2 z-10">
        <ChatButton/>
      </div>
    </div>
  );  
}