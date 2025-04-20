
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, MapPin, Calendar, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"

export interface JobCardProps {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  postedDate: string
}

export function JobCard({
  id,
  title,
  company,
  location,
  type,
  salary,
  postedDate,
}: JobCardProps) {
  return (
    <Card className="border border-dark3 bg-dark2 overflow-hidden hover:border-accent1/50 transition-colors">
      <Link to={`/jobs/${id}`} className="block h-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold text-white truncate">{title}</CardTitle>
            <Badge variant="outline" className="bg-dark3 text-accent1 border-accent1/20 whitespace-nowrap ml-4">
              {type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 py-2">
          <div className="flex items-center text-white/70">
            <Building2 className="h-4 w-4 mr-2 text-accent1" />
            <span className="font-medium truncate">{company}</span>
          </div>
          <div className="flex items-center text-white/70">
            <MapPin className="h-4 w-4 mr-2 text-accent1" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center text-white/70">
            <Briefcase className="h-4 w-4 mr-2 text-accent1" />
            <span>{salary}</span>
          </div>
          <div className="flex items-center text-white/70">
            <Calendar className="h-4 w-4 mr-2 text-accent1" />
            <span>Posted {postedDate}</span>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button className="w-full bg-accent1 hover:bg-accent1/80 text-black font-semibold">
            Apply Now
          </Button>
        </CardFooter>
      </Link>
    </Card>
  )
}
