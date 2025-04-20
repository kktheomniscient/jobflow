import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, User } from "lucide-react"
import { useUser } from "@clerk/clerk-react"
import api from "@/lib/axios"
import { Skeleton } from "@/components/ui/skeleton"

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-full bg-accent1/10">
          <User className="h-8 w-8 text-accent1" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Candidate Profile</h1>
          <p className="text-white/70">Update your profile information to improve job matching</p>
        </div>
      </div>
      
      <Card className="border-dark3 bg-dark2">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            How recruiters will see you on the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name and Email Fields */}
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            
            {/* LinkedIn and Resume Fields */}
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))}
          </div>
          
          {/* Bio Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-3 w-32" />
          </div>
          
          {/* Skills Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-48" />
          </div>
          
          {/* Submit Button */}
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  )
}

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  linkedinUrl: z.string().url({ message: "Please enter a valid LinkedIn URL." }).optional().or(z.literal("")),
  resumeUrl: z.string().url({ message: "Please enter a valid resume URL." }).optional().or(z.literal("")),
  bio: z.string().max(500, { message: "Bio must not exceed 500 characters." }).optional(),
  skills: z.string().optional()
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const defaultValues: Partial<ProfileFormValues> = {
  name: "",
  email: "",
  linkedinUrl: "",
  resumeUrl: "",
  bio: "",
  skills: ""
}

export default function Profile() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useUser()
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange"
  })
  
  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;

    try {
      setIsSubmitting(true);
      // Remove /users from the path
      await api.post("/api/profile/update/", {
        ...data,
        clerk_id: user.id
      });
      
      toast({
        title: "Profile updated",
        description: "Your candidate profile has been successfully updated."
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // Remove /users from the path since it's not in the Django URLs
        const response = await api.get(`/api/profile/${user.id}/`);
        
        form.reset({
          name: response.data.full_name || user.fullName || "",
          email: response.data.email || user.emailAddresses[0].emailAddress || "",
          linkedinUrl: response.data.linkedin_url || "",
          resumeUrl: response.data.resume_url || "",
          bio: response.data.bio || "",
          skills: response.data.skills || ""
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Fallback to Clerk data
        form.reset({
          name: user.fullName || "",
          email: user.emailAddresses[0].emailAddress || "",
          linkedinUrl: "",
          resumeUrl: "",
          bio: "",
          skills: ""
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user, form]);
  
  return (
    <>
      {isLoading ? (
        <ProfileSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-accent1/10">
              <User className="h-8 w-8 text-accent1" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Candidate Profile</h1>
              <p className="text-white/70">Update your profile information to improve job matching</p>
            </div>
          </div>
          
          <Card className="border-dark3 bg-dark2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                How recruiters will see you on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your full name" 
                              {...field} 
                              className="bg-dark3 border-dark4"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your email address" 
                              type="email" 
                              {...field} 
                              className="bg-dark3 border-dark4"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="linkedinUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://linkedin.com/in/yourprofile" 
                              {...field} 
                              className="bg-dark3 border-dark4"
                            />
                          </FormControl>
                          <FormDescription>
                            Link to your LinkedIn profile
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="resumeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resume URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/your-resume.pdf" 
                              {...field} 
                              className="bg-dark3 border-dark4"
                            />
                          </FormControl>
                          <FormDescription>
                            Link to your online resume
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of your professional background..." 
                            {...field} 
                            className="h-32 bg-dark3 border-dark4"
                          />
                        </FormControl>
                        <FormDescription>
                          Max 500 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="JavaScript, React, Node.js, UI/UX..." 
                            {...field} 
                            className="bg-dark3 border-dark4"
                          />
                        </FormControl>
                        <FormDescription>
                          Comma-separated list of your key skills
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-accent1 hover:bg-accent1/80 text-black font-semibold"
                  >
                    {isSubmitting ? "Saving..." : "Save Profile"}
                    {!isSubmitting && <Save className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
