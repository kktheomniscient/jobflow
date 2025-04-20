import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  ArrowLeft,
  DollarSign,
  Clock,
  Users,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface JobDetails {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  apply_link: string;
  tags: string[];
  pay: string;
  experience: string;
  created_at: string;
}

async function enhanceJobDescription(originalDesc: string) {
  try {
    const response = await api.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat:free",
        messages: [
          {
            role: "user",
            content: `This is a job description: "${originalDesc}". It's too short. Please enhance it by adding more details about potential responsibilities, requirements, and what a typical day might look like in this role. Keep the tone professional and the content realistic based on the original description. format it using html tags not markdown, dont keep anything to be filled later on, dont return in a code section, make the heading bold and add line breaks too`,
          },
        ],
        provider: {
          sort: "latency",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("API Error:", error);
    return originalDesc; // Fallback to original description if enhancement fails
  }
}

function JobDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back Button Skeleton */}
      <div className="flex items-center mb-6">
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Main Content Card */}
      <div className="bg-dark2 border border-dark3 rounded-lg p-6 mb-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-24" />
        </div>

        {/* Job Meta Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="h-5 w-5 mr-3" />
              <Skeleton className="h-5 w-40" />
            </div>
          ))}
        </div>

        {/* Description Section */}
        <div className="border-t border-dark3 pt-6 mb-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Skills Section */}
        <div className="border-t border-dark3 pt-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-7 w-20" />
            ))}
          </div>
        </div>
      </div>

      {/* Apply Section */}
      <div className="bg-dark2 border border-dark3 rounded-lg p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-4 w-full max-w-md mb-6" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enhancedDescription, setEnhancedDescription] = useState<string>("");
  const [emailContent, setEmailContent] = useState<string>("");
  const [generatingEmail, setGeneratingEmail] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/jobs/${id}/`);
        setJob(response.data);

        // Check if description is too short
        if (response.data.description.split(" ").length < 50) {
          const enhanced = await enhanceJobDescription(response.data.description);
          setEnhancedDescription(enhanced);
        } else {
          setEnhancedDescription(response.data.description);
        }

        setError(null);
      } catch (error) {
        console.error("Error fetching job details:", error);
        setError("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const generateEmail = async () => {
    if (!job) return;
    
    setGeneratingEmail(true);
    try {
      const response = await api.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-chat:free",
          messages: [
            {
              role: "user",
              content: `Generate a professional email to apply for this job as ${job.title} at ${job.company}. Use the job description and requirements to tailor the email. Format using HTML tags but dont reply in a code section. Here's the job description: ${job.description}`,
            },
          ],
          provider: {
            sort: "latency",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API}`,
            "Content-Type": "application/json",
          },
        }
      );

      setEmailContent(response.data.choices[0].message.content);
    } catch (error) {
      console.error("Error generating email:", error);
    } finally {
      setGeneratingEmail(false);
    }
  };

  if (loading) {
    return <JobDetailsSkeleton />;
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h1 className="text-2xl font-bold text-white mb-4">
          {error || "Job not found"}
        </h1>
        <Button asChild variant="outline">
          <Link to="/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button
          asChild
          variant="outline"
          className="mr-4 border-white/20 hover:bg-dark3"
        >
          <Link to="/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
      </div>

      <div className="bg-dark2 border border-dark3 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-white">{job.title}</h1>
          <Badge
            variant="outline"
            className="bg-dark3 text-accent1 border-accent1/20"
          >
            {job.experience}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-white/70">
            <Building2 className="h-5 w-5 mr-3 text-accent1" />
            <span className="font-medium">{job.company}</span>
          </div>
          <div className="flex items-center text-white/70">
            <MapPin className="h-5 w-5 mr-3 text-accent1" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center text-white/70">
            <DollarSign className="h-5 w-5 mr-3 text-accent1" />
            <span>{job.pay}</span>
          </div>
          <div className="flex items-center text-white/70">
            <Calendar className="h-5 w-5 mr-3 text-accent1" />
            <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="border-t border-dark3 pt-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Job Description</h2>
          <div
            className="text-white/70 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: enhancedDescription || job?.description || "",
            }}
          />
        </div>

        {job.tags && job.tags.length > 0 && (
          <div className="border-t border-dark3 pt-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Skills & Technologies
            </h2>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-dark3 text-accent1 border-accent1/20"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-dark2 border border-dark3 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Apply for this Position
        </h2>
        <p className="text-white/70 mb-6">
          Ready to apply? Click the button below to submit your application for
          this role.
        </p>
        <Button
          asChild
          className="w-full sm:w-auto bg-accent1 hover:bg-accent1/80 text-black font-semibold"
        >
          <a href={job.apply_link} target="_blank" rel="noopener noreferrer">
            Apply Now
          </a>
        </Button>
      </div>

      <div className="bg-dark2 border border-dark3 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Generate Application Email
        </h2>
        <p className="text-white/70 mb-6">
          Need help drafting an application email? Click the button below to
          generate a professional email tailored for this job.
        </p>
        <Button
          onClick={generateEmail}
          className="w-full sm:w-auto bg-accent1 hover:bg-accent1/80 text-black font-semibold flex items-center justify-center"
          disabled={generatingEmail}
        >
          {generatingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {generatingEmail ? "Generating..." : "Generate Email"}
        </Button>
        {emailContent && (
          <div className="mt-6 text-white/70 prose prose-invert max-w-none">
            <h3 className="text-lg font-bold text-white mb-4">Generated Email</h3>
            <div dangerouslySetInnerHTML={{ __html: emailContent }} />
          </div>
        )}
      </div>
    </div>
  );
}
