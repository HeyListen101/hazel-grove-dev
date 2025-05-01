// 'use client';

// import { useState } from 'react';
// import { useFormStatus } from 'react-dom';
// import { Input } from "@/components/ui/input";
// import { SubmitButton } from "@/components/submit-button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { ErrorDisplay } from "./error-display";
// import { signUpAction } from '@/app/server/auth-actions';
// import { useError } from '@/app/server/error-context';

// // Function to detect potential injection attempts
// function detectInjection(input: string): boolean {
//     if (!input) return false;
    
//     // Check for common script injection patterns
//     const scriptPattern = /<script|<\/script|javascript:|onerror=|onload=|eval\(|alert\(|document\.cookie|document\.write/i;
    
//     // Check for SQL injection patterns
//     const sqlPattern = /('|\s)*(OR|AND|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\s/i;
    
//     return scriptPattern.test(input) || sqlPattern.test(input);
//   }

// export function SignUpForm() {
//   const [formSubmitted, setFormSubmitted] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const { pending } = useFormStatus();
//   const { error: formErrors, setError, clearError } = useError();
  
//   const handleClientValidation = (e: React.FormEvent<HTMLFormElement>): boolean => {
//     // Get form data for client-side validation
//     const formData = new FormData(e.currentTarget);
//     const email = formData.get('email') as string;
//     const password = formData.get('password') as string;
//     const username = formData.get('username') as string;
//     const affiliation = formData.get('affiliation') as string;
    
//     // Check for injection attempts in any field
//     if (detectInjection(email) || detectInjection(username) || detectInjection(password)) {
//       setError('Tsk tsk! Caught you! Don\'t go breaking into our system like that! Input appropriate credentials this time please!');
//       setFormSubmitted(true);
//       return false;
//     }
    
//     // Validate form fields
//     if (!email || !password || !username || !affiliation) {
//       setError('Please fill in all required fields appropriately');
//       setFormSubmitted(true);
//       return false;
//     }
    
//     // Clear errors and allow form submission
//     clearError();
//     setIsSubmitting(true);
//     return true;
//   };
  
//   // Only show error if form has been submitted and there are errors
//   const showError = formSubmitted && formErrors;

//   return (
//     <>
//       {showError && <ErrorDisplay message={formErrors || ''} />}
      
//       <form 
//         action={async (formData) => {
//           // Run client-side validation first
//           if (!handleClientValidation({
//             currentTarget: document.querySelector('form') as HTMLFormElement,
//             preventDefault: () => {}
//           } as React.FormEvent<HTMLFormElement>)) {
//             return; // Stop if validation fails
//           }
          
//           // If validation passes, call the server action and handle response
//           const response = await signUpAction(formData);
          
//           if (response.type === 'error') {
//             setError(response.message);
//             setFormSubmitted(true);
//           } else if (response.type === 'success') {
//             clearError();
//             // Handle success - could redirect or show success message
//             if (response.redirectPath) {
//               window.location.href = response.redirectPath;
//             }
//           }
//         }} 
//         className="w-full flex flex-col space-y-4" 
//         noValidate
//       >
//         {/* Email Field */}
//         <Input 
//           type="email" 
//           name="email" 
//           placeholder="Email Address" 
//           className="input-field"
//         />
       
//         {/* Password Field */}
//         <Input 
//           type="password" 
//           name="password" 
//           placeholder="Password" 
//           className="input-field"
//         />

//         {/* Username Field */}
//         <Input 
//           type="text" 
//           name="username" 
//           placeholder="Username" 
//           className="input-field"
//         />
       
//         <Select name="affiliation">
//           <SelectTrigger className="w-full bg-[#696047] text-white placeholder:text-white/70 hover:bg-[#57503A] focus:ring-0 focus:outline-none border-none">
//             <SelectValue placeholder="Select Affiliation" className="placeholder:text-white/70" />
//           </SelectTrigger>
//           <SelectContent className="bg-[#696047] text-white border-none shadow-lg">
//             <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="visitor">Visitor</SelectItem>
//             <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="student">Student</SelectItem>
//             <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="staff">Staff</SelectItem>
//             <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="faculty">Faculty</SelectItem>
//             <SelectItem className="hover:bg-[#57503A] focus:bg-[#57503A]" value="owner">Owner</SelectItem>
//           </SelectContent>
//         </Select>
       
//         {/* Sign Button */}
//         <SubmitButton
//           type="submit"
//           disabled={isSubmitting || pending}
//           className="bg-[#696047] text-white py-2 rounded-md hover:bg-[#57503A] transition-colors"
//         >
//           {(isSubmitting || pending) ? "Signing Up..." : "Sign Up"}
//         </SubmitButton>
//       </form>
//     </>
//   );
// }