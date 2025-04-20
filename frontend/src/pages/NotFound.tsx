import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark1">
      <div className="text-center p-8 rounded-lg bg-dark2 border border-dark3 max-w-md">
        <FileQuestion className="mx-auto h-16 w-16 text-accent1 mb-6" />
        <h1 className="text-5xl font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-white/70 mb-6">
          Oops! We couldn't find the page you're looking for.
        </p>
        <Button asChild className="bg-accent1 hover:bg-accent1/80 text-black font-semibold">
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
