import { X, Clock, AlertCircle, Mail, Bell, MessageSquare, Star } from 'lucide-react'

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

  const getIcon = (type) => {
    const iconMap = {
      alert: AlertCircle,
      message: MessageSquare,
      email: Mail,
      notification: Bell,
      important: Star,
    }
    const IconComponent = iconMap[type] || Bell
    return <IconComponent className="w-6 h-6" />
  }

  const getPriorityColor = (priority) => {
    const colorMap = {
      high: 'bg-red-50 text-red-700 border-red-200',
      medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      low: 'bg-green-50 text-green-700 border-green-200',
    }
    return colorMap[priority] || 'bg-orange-50 text-orange-600 border-orange-200'
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border z-[70] animate-in fade-in zoom-in duration-300 scale-100">
        {/* Modal Header */}
        <div className="flex items-start gap-4 p-6 border-b border-border">
          <div className={`p-3 rounded-lg ${getPriorityColor(notification.priority)}`}>
            {getIcon(notification.type)}
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              {notification.title}
            </h2>
            <div className="flex items-center gap-3">
              <time 
                className="text-sm text-muted-foreground flex items-center gap-1.5"
                dateTime={notification.createdAt}
              >
                <Clock className="w-4 h-4" />
                {formatTimeAgo(notification.createdAt)}
              </time>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                {notification.priority || 'normal'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-colors"
            aria-label="Close notification details"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-base">
              {notification.content}
            </p>
          </div>
          {notification.metadata && (
            <div className="mt-6 p-4 rounded-lg bg-muted border border-border">
              <h3 className="text-sm font-medium text-foreground mb-2">Additional Information</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(notification.metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="text-foreground font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-accent/50">
          
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}

export default NotificationDetailModal