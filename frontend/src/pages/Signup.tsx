
import { SignUp } from "@clerk/clerk-react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Signup() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      {/* <div className="w-full max-w-md mb-8">
        <Link to="/" className="flex items-center text-white/70 hover:text-white mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-white/70 mt-2">Join JobFlow to find your dream job</p> 
        </div>
      </div> */}
      <div className="w-full max-w-md">
        <SignUp 
          routing="path" 
          path="/signup" 
          redirectUrl="/jobs"
          signInUrl="/login"
        />
      </div>
    </div>
  );
}
