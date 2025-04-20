
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react"
import { Outlet } from "react-router-dom"

export function ProtectedRoute() {
  return (
    <>
      {/* Temporarily allow access to protected routes by commenting out the authentication check */}
      {/* <Outlet /> */}
      
      {/* Original authentication code (commented out for now) */}
      
      <SignedIn>
        <Outlet />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
     
    </>
  )
}
