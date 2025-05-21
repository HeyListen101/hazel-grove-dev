// app/sign-up/page.tsx

import { SignUpFormComponent } from "@/components/auth/sign-up-form"; // Adjust path as needed
import backgroundImage from "@/components/assets/background-images/LandingPage.png"; // Adjust path as needed
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a new account.',
};

// This page remains a Server Component.
// It doesn't need to handle props.searchParams directly anymore,
// as SignUpFormComponent will use the useSearchParams hook.
export default function SignUpPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center overflow-hidden bg-white"
      style={{
        backgroundImage: `url(${backgroundImage.src})`,
      }}  
    >
      <SignUpFormComponent />
    </div>
  );
}