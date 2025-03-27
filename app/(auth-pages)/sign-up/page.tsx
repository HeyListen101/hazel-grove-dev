import { signUpAction } from "@/app/server/actions";
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
        backgroundImage:
          "url('https://www.eduopinions.com/wp-content/uploads/2017/09/Visayas-State-University-VSU-campus.jpg')",
        backgroundSize: "100% 100%",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-black">Sign Up</h2>
        {/* Sign In Form */}
        <form action={signUpAction} className="w-full flex flex-col">
          {/* Username Field */}
          <Input type="text" name="username" placeholder="Username" className="mb-3" required/>
          
          {/* Email Field */}
          <Input type="email" name="email" placeholder="Email Address" className="mb-3" required/>
          
          {/* Password Field */}
          <Input type="password" name="password" placeholder="Password" className="mb-2" required/>
          
          {/* Affiliation Select */}
          <Select name="affiliation">
            <SelectTrigger className="w-full mb-5 bg-[#696047] text-white hover:bg-[#57503A] transition">
              <SelectValue placeholder="Select Affiliation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visitor">Visitor</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="faculty">Faculty</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Continue Button */}
          <SubmitButton pendingText="Signing Up..." formAction={signUpAction}>
            Sign Up
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}