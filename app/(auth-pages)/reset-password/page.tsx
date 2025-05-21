import { ResetPasswordFormComponent } from "@/components/auth/reset-password-form"; // Adjust path as needed
import backgroundImage from "@/components/assets/background-images/LandingPage.png"; // Adjust path as needed
import { Metadata } from 'next';
// The 'Message' type from your original props is likely: { error?: string; success?: string; clear_error?: string }
// However, the client component will handle 'error' directly from searchParams.

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your account.',
};

export default function ResetPasswordPage() {

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center overflow-hidden bg-white"
      style={{
        backgroundImage: `url(${backgroundImage.src})`,
      }}  
    >
      <ResetPasswordFormComponent />
    </div>
  );
}