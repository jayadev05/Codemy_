import { Star } from 'lucide-react'
import { formatDistanceToNow } from "date-fns"

const StarRating = ({ rating }) => (
  <div className="flex gap-1">
    {[...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-200 text-gray-200"
        }`}
      />
    ))}
  </div>
)

const CourseReviews = ({ reviews }) => {

  
  if (reviews?.length === 0) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-2">Course Reviews</h2>
        <p className="text-gray-600">No reviews yet.</p>
      </div>
    )
  }

 

  return (
    <div className="space-y-6 py-8">
      <div>
        <h2 className="text-2xl font-bold">Course Reviews</h2>
        <p className="text-gray-600">
          {reviews?.length} reviews 
        </p>
      </div>

      <div className="grid gap-4">
        {reviews?.map((review) => (
          <div key={review._id} className="rounded-lg border p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <img
              crossOrigin='anonymous'
              referrerPolicy='no-referrer'
                src={review.userId?.profileImg}
                alt={`${review.userId?.fullName}'s profile`}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{review.userId?.fullName}</h3>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <StarRating rating={review.rating} />
              </div>
            </div>
            {review.feedback && (
              <div className="pl-16">
                <p className="text-gray-600">{review.feedback}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CourseReviews

