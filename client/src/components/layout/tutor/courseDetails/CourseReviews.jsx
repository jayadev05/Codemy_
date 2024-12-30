import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from 'lucide-react'

function StarRating({ rating }) {
  return (
    <div className="flex text-yellow-500">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-current" : "fill-none"
          }`}
        />
      ))}
    </div>
  )
}

export function CourseReviews({ reviews }) {
  return (
    <div className="space-y-6">
      {reviews.map((review, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <img crossOrigin="anonymous" referrerPolicy="no-referrer" src={review.userId?.profileImg} />
                <AvatarFallback>{review.userId?.fullName}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{review.userId?.fullName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {review?.feedback || "No Feedback"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

