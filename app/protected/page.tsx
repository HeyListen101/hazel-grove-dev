import { createClient } from "@/utils/supabase/server";
import backgroundImage from "@/components/assets/background-images/MapPage.png";
import AuthButton from "@/components/header-auth";
import { redirect } from "next/navigation";
import VisitaLogo from "@/components/visita-logo";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="header-auth flex justify-between items-center">
        <VisitaLogo />
        <AuthButton />
      </div>

      <main
        className="flex-grow min-h-screen"
        style={{
          backgroundImage: `url(${backgroundImage.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Your main content goes here */}
        <div className="container mx-auto p-4">
          {/* Page content */}
        </div>
      </main>
    </div>
  );
}
