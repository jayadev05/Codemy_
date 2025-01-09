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


export default function ComposeModal({ open, onOpenChange, onChatCreated ,recipients,user }) {


  
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('');


  // Create new chat with selected tutor
  const handleTutorSelect = async (tutorId) => {
    try {
      const response = await axiosInstance.post('/chat/chats', {
        tutorId,
        userId:user?._id
      })
      onChatCreated(response.data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  // Filter tutors based on search query
  const filteredTutors = recipients?.filter(recipient => 
    recipient.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (isOpen) fetchTutors()
      onOpenChange(isOpen)
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Input
            className="pl-9"
            placeholder="Search tutors..."
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
              {filteredTutors?.map((tutor) => (
                <Button
                  key={tutor._id}
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto hover:bg-gray-100"
                  onClick={() => handleTutorSelect(tutor._id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <img crossOrigin='anonymous' referrerPolicy='no-referrer' src={tutor.profileImg} alt={tutor.fullName} />
                      <AvatarFallback>{tutor.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <h3 className="font-medium">{tutor.fullName}</h3>
                      <p className="text-sm text-gray-500">{tutor.subject}</p>
                    </div>
                  </div>
                </Button>
              ))}
              {filteredTutors?.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No tutors found
                </p>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}