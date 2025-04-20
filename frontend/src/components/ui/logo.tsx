
import { BriefcaseBusiness } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <BriefcaseBusiness className="h-6 w-6 text-accent1" />
      <span className="text-xl font-bold text-white">JobFlow</span>
    </div>
  )
}
