import { Progress } from "@/components/ui/progress"

interface ProgressTrackerProps {
  weekProgress: number
  overallProgress: number
  currentWeek: number
}

export default function ProgressTracker({ weekProgress, overallProgress, currentWeek }: ProgressTrackerProps) {
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-blue-700">Week {currentWeek} Progress</h3>
          <span className="text-sm font-medium text-blue-700">{Math.round(weekProgress)}%</span>
        </div>
        <Progress value={weekProgress} className="h-2 bg-blue-100" indicatorClassName="bg-blue-500" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-blue-700">Overall Progress</h3>
          <span className="text-sm font-medium text-blue-700">{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2 bg-blue-100" indicatorClassName="bg-blue-600" />
      </div>
    </div>
  )
}
