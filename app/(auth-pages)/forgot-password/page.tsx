import { forgotPasswordAction } from "@/app/server/auth-actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import backgroundImage from "@/components/assets/background-images/LandingPage.png";
import Link from "next/link";
import { ErrorDisplay } from "@/components/error-display";
import { Message } from "@/components/form-message";

export default function ForgotPassword(props: {searchParams: Message}) {
  const searchParams = props.searchParams;
  const errorMessage = "error" in searchParams && !("clear_error" in searchParams)
  ? searchParams.error 
  : null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage.src})`,
        backgroundSize: "100% 100%",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-black">Forgot Password</h2>
        
        {errorMessage && <ErrorDisplay message={errorMessage} />}
        
        <form className="w-full flex flex-col">
          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            className="input-field mb-4"
            required
          />

          <SubmitButton
            pendingText="Sending Reset Link..."
            formAction={forgotPasswordAction}
          >
            Send Reset Link
          </SubmitButton>
           {/* Login Link */}
           <div className="mt-4 text-sm text-gray-600 text-center w-full">
            Suddenly remembered your password?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:underline">
              Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}