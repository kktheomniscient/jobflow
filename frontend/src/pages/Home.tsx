import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/clerk-react"
import { Briefcase, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center pt-16 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <Briefcase className="h-16 w-16 mb-6 text-accent1 mx-auto" />
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
          Find Your Dream Job with <span className="text-accent1">JobFlow</span>
        </h1>
        <p className="text-xl text-white/70 mb-8">
          Connect with top employers and opportunities tailored to your skills and preferences.
          Your next career move is just a click away.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Navigation buttons - visible to everyone temporarily */}
          <Button asChild size="lg" className="bg-accent1 hover:bg-accent1/80 text-black font-semibold">
            <Link to="/jobs">
              Browse Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="border-white/20 hover:bg-dark3">
            <Link to="/profile">
              Candidate Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          {/* Authentication buttons */}
          {/* <SignedOut>
            <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
              <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                <Link to="/signup">
                  Sign Up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="border-white/20 hover:bg-dark3">
                <Link to="/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </SignedOut> */}
        </div>
      </div>
    </div>
  )
}
