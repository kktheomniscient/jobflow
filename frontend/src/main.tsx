
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from "@clerk/clerk-react"
import { BrowserRouter } from "react-router-dom"
import App from './App.tsx'
import './index.css'
import { dark } from "@clerk/themes";

// Replace with your Clerk publishable key
const PUBLISHABLE_KEY = "pk_test_b3V0Z29pbmctYWxwYWNhLTU2LmNsZXJrLmFjY291bnRzLmRldiQ"

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key. Add it before continuing.")
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} appearance={{baseTheme: dark}}>
      <App />
    </ClerkProvider>
  </BrowserRouter>
);
