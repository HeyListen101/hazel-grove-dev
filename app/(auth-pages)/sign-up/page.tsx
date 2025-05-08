import { signUpAction } from "@/app/server/auth-actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ErrorDisplay } from "@/components/error-display";
import backgroundImage from "@/components/assets/background-images/LandingPage.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function SignUp(props: { searchParams: Promise<Record<string, string>> }) {
  const params = await props.searchParams;
  const errorMessage = params?.error && !params?.clear_error ? params.error : null;

  return (
    <div
      className="inset-0 flex items-center justify-center bg-cover bg-center overflow-hidden w-full h-full bg-white"
      style={{
        backgroundImage: `url(${backgroundImage.src})`,
      }}
    >
      <div className="bg-white p-8 rounded-[20px] sm:shadow-lg w-96 flex flex-col items-center">
        <h2 className="text-lg font-bold mb-3 text-black">Sign Up</h2>
        {/* Display error message if present */}
        {errorMessage && <ErrorDisplay message={errorMessage} />}

        {/* Sign Up Form */}
        <form action={signUpAction} className="w-full flex flex-col space-y-4" autoComplete="off">
          {/* Email Field */}
          <Input type="email" name="email" placeholder="Email Address" className="input-field text-sm text-[#111111]"/>         
          {/* Password Field */}
          <Input type="password" name="password" placeholder="Password" className="input-field text-sm text-[#111111]"/>
          {/* Username Field */}
          <Input type="username" name="username" placeholder="Username" className="input-field text-sm text-[#111111]"/>
          <Select name="affiliation">
              <SelectTrigger className="w-full bg-[#F5F5F5] text-[#111111] placeholder:text-white/70 focus:ring-0 focus:outline-none border-none">
              <SelectValue placeholder="Select Affiliation" className="placeholder:text-white/70" />
            </SelectTrigger>
            <SelectContent className="bg-[#F5F5F5] text-[#111111] border-none shadow-lg">
              <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="visitor">Visitor</SelectItem>
              <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="student">Student</SelectItem>
              <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="staff">Staff</SelectItem>
              <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="faculty">Faculty</SelectItem>
              <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="owner">Owner</SelectItem>
            </SelectContent>
          </Select>
          {/* Sign Button */}
          <SubmitButton pendingText="Signing Up..." formAction={signUpAction} className="hover:bg-[#57503A]">
            Sign Up
          </SubmitButton>
        </form>
        
        {/* Login Link */}
        <div className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[#6B5C3D] font-semibold underline">
            Log In
          </Link>
        </div>
        
      </div>
    </div>
  );
}