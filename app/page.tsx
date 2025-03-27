import { customSignInAction, googleSignInAction } from "./server/actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import AuthButton from "@/components/header-auth";

export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full bg-[#57503A] text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Visita</h1>
        <AuthButton />
      </header>
      
      {/* Hero Section */}
      <div
        className="flex flex-col items-center justify-center flex-grow bg-cover bg-center text-white p-8 text-center"
        style={{
          backgroundImage:
            "url('https://www.eduopinions.com/wp-content/uploads/2017/09/Visayas-State-University-VSU-campus.jpg')",
          backgroundSize: "cover",
        }}
      >
        <h2 className="text-4xl font-bold mb-4">Welcome to Visita</h2>
        <p className="text-lg mb-6">Connecting visitors and students with ease.</p>
        
        {/* Sign In Form */}
        <div className="bg-white p-6 rounded-xl shadow-lg w-96 flex flex-col items-center text-black">
          <h3 className="text-xl font-bold mb-4">Sign In</h3>
          <form action={customSignInAction} className="w-full flex flex-col space-y-3">
            <Input type="email" name="email" placeholder="Email Address" required />
            <Input type="password" name="password" placeholder="Password" required />
            <div className="flex justify-between text-sm">
              <Link href="/sign-up" className="text-[#696047] hover:text-[#57503A]">
                Sign-up or Register
              </Link>
              <Link href="/forgot-password" className="text-[#696047] hover:text-[#57503A]">
                Forgot Password?
              </Link>
            </div>
            <SubmitButton pendingText="Signing In..." formAction={customSignInAction}>
              Continue
            </SubmitButton>
          </form>
          
          {/* OR Divider */}
          <div className="flex items-center w-full my-3">
            <hr className="flex-grow border-t border-[#d2d2d2] mx-2" />
            <span className="text-[#696047] font-medium text-m">or</span>
            <hr className="flex-grow border-t border-[#d2d2d2] mx-2" />
          </div>
          
          {/* Google Sign-In */}
          <form action={googleSignInAction} className="w-full">
            <SubmitButton className="gsi-material-button w-full">
              <div className="gsi-material-button-content-wrapper flex items-center justify-center">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-6 h-6 mr-2"
                >
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>Continue with Google</span>
              </div>
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
