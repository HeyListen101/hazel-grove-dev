import { signOutAction } from "@/app/server/auth-actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let contributorName = null;

  if (user) {
    const { data: contributor, error } = await supabase
      .from("contributor")
      .select("name")
      .eq("contributorid", user.id)
      .single();

    if (error) {
      console.log("Error fetching contributor:", error);
    } else {
      contributorName = contributor?.name;
    }
  }

  return user ? (
    <div className="flex items-center gap-4 text-black">
      Hey, {contributorName || "Guest"}!
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
