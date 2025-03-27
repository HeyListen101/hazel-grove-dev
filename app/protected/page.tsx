import { createClient } from "@/utils/supabase/server";
import backgroundImage from "@/components/assets/background-images/MapPage.png";
import AuthButton from "@/components/header-auth";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div>
      {/* Header */}
            <header className="w-full bg-[#57503A] text-white p-4 flex justify-between items-center shadow-md">
              <h1 className="text-2xl font-bold">Visita</h1>
              <AuthButton />
            </header>
    </div>
  );
}
