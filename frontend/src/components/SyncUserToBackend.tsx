// frontend/src/components/SyncUserToBackend.tsx
import { useUser, useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import axios from "axios";

export default function SyncUserToBackend() {
  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (!user) return;

    const syncUser = async () => {
      try {
        // Get JWT token from Clerk
        const token = await getToken();
        
        await axios.post("http://localhost:8000/api/sync-user/", {
          email: user.emailAddresses[0].emailAddress,
          full_name: user.fullName,
          clerk_id: user.id,
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log("✅ User synced to backend.");
      } catch (err) {
        console.error("❌ Failed to sync user:", err);
      }
    };

    syncUser();
  }, [user, getToken]);

  return null;
}