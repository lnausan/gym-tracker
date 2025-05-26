import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { ArrowUpRight, TrendingUp } from "lucide-react"

interface ProgressTrackerProps {
  weekProgress: number
  overallProgress: number
  currentWeek: number
}

export default function ProgressTracker({ weekProgress, overallProgress, currentWeek }: ProgressTrackerProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-blue-600">Weekly Progress</h3>
            <p className="text-2xl font-bold text-blue-700">{Math.round(weekProgress)}%</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-full">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <Progress 
          value={weekProgress} 
          className="h-2 bg-blue-100" 
          indicatorClassName="bg-gradient-to-r from-blue-500 to-blue-600" 
        />
      </Card>

      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-indigo-600">Overall Progress</h3>
            <p className="text-2xl font-bold text-indigo-700">{Math.round(overallProgress)}%</p>
          </div>
          <div className="p-2 bg-indigo-100 rounded-full">
            <ArrowUpRight className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
        <Progress 
          value={overallProgress} 
          className="h-2 bg-indigo-100" 
          indicatorClassName="bg-gradient-to-r from-indigo-500 to-indigo-600" 
        />
      </Card>
    </div>
  )
}
