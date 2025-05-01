"use server";
import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

function isValidEmail(email: string): boolean {
  if (!email) return false;

  // Normalize input
  const trimmed = email.trim().toLowerCase();

  // General email structure check
  const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicRegex.test(trimmed)) return false;

  // Whitelisted common domains and patterns
  const allowedDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "protonmail.com",
    "outlook.com",
    "icloud.com",
    "google.com",
    "github.com",
    "apple.com",
    "microsoft.com",
    "yahoo.co.jp",
    "yahoo.co.uk",
    "hotmail.co.uk",
    "outlook.co.jp",
    "outlook.co.uk",
    "icloud.com",
    "protonmail.ch",
    "protonmail.com",
    "protonmail.me",
    "protonmail.net",
    "protonmail.org",
    "protonmail.se",
    "proton.me",
    "protonmail.com.br",
    "protonmail.ru",
    "protonmail.de",
    "protonmail.fr",
    "protonmail.es",
    "protonmail.it",
    "protonmail.net",
    "protonmail.co.uk", 
  ];

  const domain = trimmed.split("@")[1];

  // Allow common providers, .edu domains, and valid company-like domains
  const isAllowed =
    allowedDomains.includes(domain) ||
    domain.endsWith(".edu") ||
    /^[a-z0-9-]+\.(com|org|net|io|dev|ai)$/.test(domain);

  return isAllowed;
}



function detectInjection(input: string): boolean {
  if (!input) return false;

  // Normalize input
  const normalizedInput = input.trim().toLowerCase();

  // SQL Injection patterns
  const sqlPattern = /('|--|;|\b(OR|AND|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|FROM|WHERE)\b)/i;

  // HTML/JS Injection patterns
  const htmlPattern = /<[^>]*>|javascript:|onerror=|onload=|alert\(|eval\(|document\.|window\./i;

  return sqlPattern.test(normalizedInput) || htmlPattern.test(normalizedInput);
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

  if (detectInjection(email) || detectInjection(password)) {
    return encodedRedirect(
      "error",
      "/sign-in",
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
      "/sign-in",
      "Unfortunately, we don't have that email registered in our system. Please check your spelling or contact us if you think this is an error.",
    )
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign-in error:", error.message);
    return encodedRedirect("error", "/sign-in", "Wrong credentials");
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

  if (detectInjection(email)) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Tsk tsk tsk! No injections here!",
    );
  }

  const { data: user, error : dbError } = await supabase
  .from("contributor")
  .select("*")
  .eq("emailaddress", email.toLowerCase().trim())
  .maybeSingle();

  if (dbError) {
    console.error("Database error:", dbError.message);
    return encodedRedirect("error", "/forgot-password", "Something went wrong. Please try again.");
  }

  if (!user) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Unfortunately, we don't have that email registered in our system. Please check your spelling or contact us if you think this is an error."
    );
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