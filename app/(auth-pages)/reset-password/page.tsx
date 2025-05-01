import { resetPasswordAction } from "@/app/server/auth-actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import backgroundImage from "@/components/assets/background-images/LandingPage.png";
import { Message } from "@/components/form-message";
import { ErrorDisplay } from "@/components/error-display";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  const errorMessage = "error" in searchParams && !("clear_error" in searchParams)
  ? searchParams.error 
  : null;
  
  return (
    <div
      className={`inset-0 flex items-center justify-center bg-cover bg-center overflow-hidden w-full h-full bg-white sm:bg-[url(@/components/assets/background-images/LandingPage.png)]`}
    >
      <div className="bg-white p-8 rounded-[20px] sm:shadow-lg w-96 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-7 text-black">Reset Password</h2>
        {errorMessage && <ErrorDisplay message={errorMessage} />}
        <form className="w-full flex flex-col" autoComplete="off">
          <Input
            type="password"
            name="password"
            placeholder="New Password"
            className="input-field mb-3 text-[#111111] text-sm"
            required
          />

          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            className="input-field mb-6 text-[#111111] text-sm"
            required
          />

          <SubmitButton
            pendingText="Updating Password..."
            formAction={resetPasswordAction}
          >
            Reset Password
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}