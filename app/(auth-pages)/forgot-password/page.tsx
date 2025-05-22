// src/app/forgot-password/page.tsx
import { ForgotPasswordFormComponent } from "@/components/auth/forgot-password-form";
import backgroundImage from "@/components/assets/background-images/LandingPage.png";
import { Metadata } from 'next';
import { Suspense } from "react";

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Request a password reset link for your account.',
};

export default function ForgotPasswordPage() {
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
          {/* You could add a spinner here if desired */}
        </div>
      }>
        <ForgotPasswordFormComponent />
      </Suspense>
    </div>
  );
}