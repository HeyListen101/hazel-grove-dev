import { SuccessDialog } from "@/components/success-dialog";
import { SignInFormComponent } from "@/components/auth/sign-in-form";
import backgroundImage from "@/components/assets/background-images/LandingPage.png";
import { Metadata } from 'next';
import { Suspense } from "react";

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account.',
};

export default async function Home(props: { searchParams: Promise<Record<string, string>> }) {

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center overflow-hidden bg-white"
      style={{
        backgroundImage: `url(${backgroundImage.src})`,
      }}
    >
      {/* Main form, correctly centered */}
      <Suspense fallback={
        <div className="bg-white p-8 rounded-[20px] sm:shadow-lg w-96 flex flex-col items-center">
          <p className="text-gray-500">Loading form...</p>
        </div>
      }>
        <SignInFormComponent />
      </Suspense>
      <Suspense fallback={null}>
        <SuccessDialog />
      </Suspense>
    </div>
  );
}