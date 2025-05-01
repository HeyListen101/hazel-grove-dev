import { forgotPasswordAction } from "@/app/server/auth-actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ErrorDisplay } from "@/components/error-display";
import { Message } from "@/components/form-message";

export default async function ForgotPassword(props: {searchParams: Promise<Message>}) {
  const searchParams = await props.searchParams;
  const errorMessage = "error" in searchParams && !("clear_error" in searchParams)
  ? searchParams.error 
  : null;

  return (
    <div
      className={`inset-0 flex items-center justify-center bg-cover bg-center overflow-hidden w-full h-full bg-white sm:bg-[url(@/components/assets/background-images/LandingPage.png)]`}
    >
      <div className="bg-white p-8 rounded-[20px] sm:shadow-lg w-96 flex flex-col items-center">
        <h2 className="text-lg font-bold mb-7 text-black">Forgot Password</h2>
        
        {errorMessage && <ErrorDisplay message={errorMessage} />}
        
        <form className="w-full flex flex-col" autoComplete="off">
          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            className="input-field mb-4 text-sm text-[#111111]"
            required
          />

          <SubmitButton
            pendingText="Sending Reset Link..."
            formAction={forgotPasswordAction}
            className="font-semibold hover:bg-[#57503A]"
          >
            Send Reset Link
          </SubmitButton>
           {/* Login Link */}
           <div className="mt-4 text-sm text-gray-600 text-center w-full">
            Suddenly remembered your password?<br />
            <Link href="/sign-in" className="text-[#6B5C3D] font-semibold underline">
              Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}