import { X, Clock } from 'lucide-react'

const NotificationDetailModal = ({ notification, isOpen, onClose }) => {
  if (!notification || !isOpen) return null

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-lg shadow-xl border border-gray-200 z-[70] animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-800">
              {notification.title}
            </h2>
            <time 
              className="text-sm text-gray-500 flex items-center gap-1"
              dateTime={notification.createdAt}
            >
              <Clock className="w-4 h-4" />
              {formatTimeAgo(notification.createdAt)}
            </time>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close notification details"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {notification.content}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}

export default NotificationDetailModal

