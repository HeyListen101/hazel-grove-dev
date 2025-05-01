import { resetPasswordAction } from "@/app/server/auth-actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import backgroundImage from "@/components/assets/background-images/LandingPage.png";

export default function ResetPassword() {
  return (
    <div
      className="inset-0 flex items-center justify-center bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage.src})`,
        backgroundSize: "100% 100%",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-black">Reset Password</h2>

        <form className="w-full flex flex-col" autoComplete="off">
          <Input
            type="password"
            name="password"
            placeholder="New Password"
            className="input-field mb-3"
            required
          />

          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            className="input-field mb-6"
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