
import { SignIn } from "@clerk/clerk-react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md">
        <SignIn 
          routing="path" 
          path="/login" 
          redirectUrl="/jobs"
          signUpUrl="/signup"
        />
      </div>
    </div>
  );
}
