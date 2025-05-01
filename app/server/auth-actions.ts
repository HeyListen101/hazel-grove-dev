"use server";
import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

function isValidEmail(email: string) {
  // Regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex;
}

function detectInjection(input: string) {
  // Regular expression for SQL injection detection
  const sqlInjectionRegex = /(\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\b)|(--)/i;
  // Regular expression for HTML injection detection
  const htmlInjectionRegex = /<script>|<\/script>|<img|<\/img>/i;
  return sqlInjectionRegex.test(input) || htmlInjectionRegex.test(input);
}

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const username = formData.get("username")?.toString();
  const affiliation = formData.get("affiliation")?.toString();

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  // Validate that nothing is an injection
  if (detectInjection(email!) || detectInjection(password!) || detectInjection(username!) || detectInjection(affiliation!)) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Tsk tsk tsk! No injections here!",
    );
  }

  // Validate all required fields
  if (!email || !password || !username || !affiliation) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "All fields are required",
    );
  }

  // Validate email and password length
  if (!isValidEmail(email)) {
    return encodedRedirect("error", "/sign-up", "Invalid email address");
  }

  if (password.length < 8) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Password must be at least 8 characters long",
    )
  }

  // Check if email is already registered
  const { data: user } = await supabase
    .from("contributor")
    .select("*")
    .eq("emailaddress", email)
    .single();
  if (user) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email is already registered",    
    )
  }

  // If there are no errors proceed to sign up
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        name: username,
        affiliation: affiliation || 'visitor',
      },
    },
  });

  // Handle unexpected errors
  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-in",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const customSignInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  if (!email || !password) {
    return encodedRedirect("error", "/sign-in", "Email and password are required");
  }

  if (!isValidEmail(email)) {
    return encodedRedirect("error", "/sign-in", "Invalid email address");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign-in error:", error.message);
    return encodedRedirect("error", "/sign-in", "Wrong password");
  }

  return redirect("/protected");
};

export const googleSignInAction = async function () {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`, // Redirect to the appropriate callback URL
    },
  });

  if (error) {
    console.error("Google Sign-In Error:", error.message);
    return encodedRedirect("error", "/sign-in", error.message);
  }

  console.log("Auth Data:", data);

  if (data?.url) {
    redirect(data.url); // Redirect user to Google's OAuth screen
  }
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  if (!isValidEmail(email)) {
    return encodedRedirect("error", "/forgot-password", "Invalid email address");
  }

  if (detectInjection(email)) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Tsk tsk tsk! No injections here!",
    );
  }

  // Check if email isn't already registered
  const { data: user } = await supabase
   .from("contributor")
   .select("*")
   .eq("emailaddress", email)
   .single();
  if (!user) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Unfortunately, we don't have that email registered in our system. Please check your spelling or contact us if you think this is an error.",
    )
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Email doesn't exist",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  await supabase.auth.signOut();

  return encodedRedirect(
    "success",
    "/sign-in",
    "Check your email for a link to reset your password",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Password and password confirmation are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/sign-in", "Your password has been updated!");
};

export const signOutAction = async () => {
  const redirectResponse = redirect("/sign-in");
  const supabase = await createClient();
  supabase.auth.signOut();
  return redirectResponse;
};
