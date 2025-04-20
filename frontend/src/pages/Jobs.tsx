import { useState, useEffect } from "react"
import api from "@/lib/axios"
import { JobCard, JobCardProps } from "@/components/job-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Type for job from backend
interface Job {
  id: number
  title: string
  company: string
  location: string
  description: string
  apply_link: string
  tags: string[]
  pay: string
  experience: string
  created_at: string
}

// Type for pagination info
interface PaginationInfo {
  current_page: number
  total_pages: number
  total_jobs: number
  has_next: boolean
  has_previous: boolean
}

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/api/jobs/?page=${currentPage}&per_page=9`)
        setJobs(response.data.jobs)
        setPagination(response.data.pagination)
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [currentPage])

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="p-4 border border-dark4 rounded-lg space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </>
  )
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Job Listings</h1>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
        <Input
          type="text"
          placeholder="Search jobs by title, company, or location..."
          className="pl-10 bg-dark3 border-dark4 text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <LoadingSkeleton />
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              id={job.id.toString()}
              title={job.title}
              company={job.company}
              location={job.location}
              type={job.experience}
              salary={job.pay}
              postedDate={new Date(job.created_at).toLocaleDateString()}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <h3 className="text-xl text-white/70 mb-4">No jobs found matching your search criteria</h3>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm("")}
              className="border-white/20 hover:bg-dark3"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>

      {pagination && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={!pagination.has_previous}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </Button>
          <span className="py-2 px-4 text-white">
            Page {pagination.current_page} of {pagination.total_pages}
          </span>
          <Button
            variant="outline"
            disabled={!pagination.has_next}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
