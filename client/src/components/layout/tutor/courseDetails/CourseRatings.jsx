import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star } from 'lucide-react'

export function CourseRatingOverview({ ratings }) {
  // Calculate rating statistics
  const totalRatings = ratings.length
  const averageRating = (
    ratings.reduce((sum, rating) => sum + rating, 0) / totalRatings
  ).toFixed(1)
  
  const ratingCounts = ratings.reduce((counts, rating) => {
    counts[rating] = (counts[rating] || 0) + 1
    return counts
  }, {})

  // Calculate percentages for each rating
  const ratingPercentages = Object.fromEntries(
    [5, 4, 3, 2, 1].map((rating) => [
      rating,
      ((ratingCounts[rating] || 0) / totalRatings) * 100,
    ])
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Rating Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 md:flex-row">
        <Card className="w-full md:w-48 bg-orange-50 border-none">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold mb-2">{averageRating}</div>
            <div className="flex justify-center text-yellow-500 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(averageRating) ? "fill-current" : "fill-none"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              Based on {totalRatings} reviews
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 space-y-4">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-4">
              <div className="flex w-20 items-center gap-2">
                <span className="text-sm font-medium">{rating}</span>
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              </div>
              <Progress
                value={ratingPercentages[rating]}
                className="h-2"
              />
              <div className="w-20 text-sm text-muted-foreground">
                {ratingPercentages[rating].toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

