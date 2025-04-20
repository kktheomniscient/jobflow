
import { UserButton, SignedIn, SignedOut } from "@clerk/clerk-react"
import { Link, useLocation } from "react-router-dom"
import { Logo } from "./ui/logo"
import { BriefcaseIcon, UserIcon, LogIn, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const location = useLocation()
  
  const isActive = (path: string) => {
    return location.pathname === path
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-dark3 bg-dark2/80 backdrop-blur-sm">
      <nav className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          
          {/* Show navigation links to all users */}
          {/* <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/jobs" active={isActive('/jobs')}>
              <BriefcaseIcon className="h-4 w-4 mr-2" />
              Job Listings
            </NavLink>
            <NavLink to="/profile" active={isActive('/profile')}>
              <UserIcon className="h-4 w-4 mr-2" />
              Candidate Profile
            </NavLink>
          </div> */}
        </div>
        
        <div className="flex items-center gap-4">
          <SignedIn>
            <div className="flex items-center gap-3">
              <NavLink to="/jobs" active={isActive('/jobs')}>
                <BriefcaseIcon className="h-4 w-4 mr-2" />
                Job Listings
              </NavLink>
              <NavLink to="/profile" active={isActive('/profile')}>
                <UserIcon className="h-4 w-4 mr-2" />
                Candidate Profile
              </NavLink>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-3">
              <NavLink to="/jobs" active={isActive('/jobs')}>
                <BriefcaseIcon className="h-4 w-4 mr-2" />
                Job Listings
              </NavLink>
              <NavLink to="/profile" active={isActive('/profile')}>
                <UserIcon className="h-4 w-4 mr-2" />
                Candidate Profile
              </NavLink>
              <NavLink to="/signup" active={isActive('/signup')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </NavLink>
              <NavLink to="/login" active={isActive('/login')}>
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </NavLink>
            </div>
          </SignedOut>
        </div>
      </nav>
    </header>
  )
}

interface NavLinkProps {
  to: string
  active: boolean
  children: React.ReactNode
}

function NavLink({ to, active, children }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
        active 
          ? "bg-dark3 text-accent1" 
          : "text-white/70 hover:text-white hover:bg-dark3/50"
      )}
    >
      {children}
    </Link>
  )
}
