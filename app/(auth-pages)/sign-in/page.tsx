import { SuccessDialog } from "@/components/success-dialog"; // Keep if used for success messages
import { SignInFormComponent } from "@/components/auth/sign-in-form"; // Adjust path as needed
import backgroundImage from "@/components/assets/background-images/LandingPage.png"; // Adjust path as needed
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account.',
};

export default async function Home(props: { searchParams: Promise<Record<string, string>> }) {
  const params = await props.searchParams;
  const errorMessage = (params?.error && !params?.clear_error) ? params.error : null;
  // We can return this entire thing as a client side component so that we can clear the input fields with useState or useEffect whenever an error occurs.
  // So that we have an automatic cleaner for the form data. 
  // But this isn't as important as it is.
  // Just an optimization idea for the time being.
  // We can always add it later if we need it.
  // For now, we can just leave it as is.
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center overflow-hidden bg-white"
      style={{
        backgroundImage: `url(${backgroundImage.src})`,
      }}
    >
      <SignInFormComponent />
      {/* SuccessDialog might still read from searchParams or be triggered by other state */}
      <SuccessDialog />
    </div>
  );
}