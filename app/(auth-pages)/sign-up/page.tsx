import { signUpAction } from "@/app/server/auth-actions";
import { FormMessage, Message } from "@/components/form-message";
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

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }
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
        {/* Sign In Form */}
        <form action={signUpAction} className="w-full flex flex-col space-y-4">
         
          {/* Email Field */}
          <Input type="email" name="email" placeholder="Email Address" required/>
         
          {/* Password Field */}
          <Input type="password" name="password" placeholder="Password" required/>

          {/* Username Field */}
          <Input type="username" name="username" placeholder="Username" required/>
         
          <Select name="affiliation">
            <SelectTrigger className="w-full bg-[#696047] text-white hover:bg-[#57503A] focus:ring-0 focus:outline-none border-none">
              <SelectValue placeholder="Select Affiliation" />
            </SelectTrigger>
            <SelectContent className="bg-[#696047] text-white border-none shadow-lg">
              <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="visitor">Visitor</SelectItem>
              <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="student">Student</SelectItem>
              <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="staff">Staff</SelectItem>
              <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="faculty">Faculty</SelectItem>
              <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="owner">Owner</SelectItem>
            </SelectContent>
          </Select>
         
          {/* Continue Button */}
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