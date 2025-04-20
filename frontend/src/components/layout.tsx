
import { Navbar } from "./navbar"
import { Outlet } from "react-router-dom"

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-dark1 text-white">
      <Navbar />
      <main className="flex-1 container px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="border-t border-dark3 py-4 bg-dark2">
        <div className="container text-center text-sm text-white/60">
          © {new Date().getFullYear()} JobFlow. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
