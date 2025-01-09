import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'
import axiosInstance from "@/config/axiosConfig"

export default function ComposeModalUser({ open, onOpenChange, onChatCreated, recipients, tutor }) {
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Create new chat with selected user
  const handleUserSelect = async (userId) => {
    try {
      const response = await axiosInstance.post('/chat/chats', {
        userId,
        tutorId: tutor._id,
      })
      onChatCreated(response.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  // Filter users based on search query
  const filteredUsers = recipients?.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={(isOpen) => onOpenChange(isOpen)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Input
            className="pl-9"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading recipients...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers?.map((user) => (
                <Button
                  key={user._id}
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto hover:bg-gray-100"
                  onClick={() => handleUserSelect(user._id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <img crossOrigin='anonymous' referrerPolicy='no-referrer' src={user.profileImg} alt={user.fullName} />
                      <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <h3 className="font-medium">{user.fullName}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </Button>
              ))}
              {filteredUsers?.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No users found
                </p>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
