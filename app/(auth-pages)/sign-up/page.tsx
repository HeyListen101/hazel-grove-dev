import { signUpAction } from "@/app/server/auth-actions";
import { Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import backgroundImage from "@/components/assets/background-images/LandingPage.png";
import { ErrorDisplay } from "@/components/error-display";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  
  // Check if there's an error message in the URL params
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
        <h2 className="text-xl font-bold mb-4 text-black">Sign Up</h2>
        
        {/* Display error message if present */}
        {errorMessage && <ErrorDisplay message={errorMessage} />}
        
        {/* Sign Up Form */}
        <form action={signUpAction} className="w-full flex flex-col space-y-4">
         
          {/* Email Field */}
          <Input type="email" name="email" placeholder="Email Address" required className="input-field"/>
         
          {/* Password Field */}
          <Input type="password" name="password" placeholder="Password" required className="input-field"/>

          {/* Username Field */}
          <Input type="username" name="username" placeholder="Username" required className="input-field"/>
         
          <Select name="affiliation">
              <SelectTrigger className="w-full bg-[#696047] text-white placeholder:text-white/70 hover:bg-[#57503A] focus:ring-0 focus:outline-none border-none">
              <SelectValue placeholder="Select Affiliation" className="placeholder:text-white/70" />
            </SelectTrigger>
            <SelectContent className="bg-[#696047] text-white border-none shadow-lg">
              <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="visitor">Visitor</SelectItem>
              <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="student">Student</SelectItem>
              <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="staff">Staff</SelectItem>
              <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="faculty">Faculty</SelectItem>
              <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="owner">Owner</SelectItem>
            </SelectContent>
          </Select>
         
          {/* Sign Button */}
          <SubmitButton pendingText="Signing Up..." formAction={signUpAction}>
            Sign Up
          </SubmitButton>
        </form>
        
        {/* Login Link */}
        <div className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}