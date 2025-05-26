// app/sign-up/page.tsx
import { SignUpFormComponent } from "@/components/auth/sign-up-form";
import backgroundImage from "@/components/assets/background-images/LandingPage.png";
import { Metadata } from 'next';
import { Suspense } from "react";

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a new account.',
};

export default function SignUpPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center overflow-hidden bg-white"
      style={{
        backgroundImage: `url(${backgroundImage.src})`,
      }}
    >
      <Suspense fallback={
        <div className="bg-white p-8 rounded-[20px] sm:shadow-lg w-96 flex flex-col items-center">
          <p className="text-gray-500">Loading form...</p>
        </div>
      }>
        <SignUpFormComponent />
      </Suspense>
    </div>
  );
}