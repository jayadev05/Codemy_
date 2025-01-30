'use client'

import React, { useEffect, useState } from 'react'
import { X, Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSelector } from 'react-redux'
import { selectUser } from '@/store/slices/userSlice'
import { selectTutor } from '@/store/slices/tutorSlice'

const VideoCallInterface = ({
  stream,
  myVideoRef,
  peerVideoRef,
  isCallAccepted,
  isCalling,
  incomingCallInfo,
  outgoingCallInfo,
  onAnswer,
  onReject,
  onEndCall,
  isCallActive,
  onToggleAudio,
  onToggleVideo,
  isAudioEnabled,
  isVideoEnabled,
  peer
}) => {
  const user=useSelector(selectUser);
  const tutor=useSelector(selectTutor);

  

  const currentUser = user || tutor;
  
  useEffect(() => {
    if (myVideoRef.current && stream) {
      myVideoRef.current.srcObject = stream;
    }
  }, [stream, myVideoRef ,isCallAccepted, isCallActive]);



  return (
    <>
      {/* Incoming Call Dialog */}
      <Dialog open={incomingCallInfo?.isSomeoneCalling || isCalling}>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-gray-900 to-gray-800 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{isCalling?"Outgoing Call" : "Incoming Call"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse blur-xl opacity-50" />
              <img
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                src={isCalling ? outgoingCallInfo?.callerData?.avatar :   incomingCallInfo?.callerData?.avatar }
                alt="caller"
                className="relative w-24 h-24 rounded-full border-4 border-white/10"
              />
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">
                { isCalling? outgoingCallInfo?.callerData?.name : incomingCallInfo?.callerData?.name}
              </p>
              <p className="text-sm text-gray-400 animate-pulse">
              {isCalling?"Outgoing Video Call..." : "Incoming Video Call..."}
              </p>
            </div>
            <div className="flex space-x-4">
              {!isCalling ? ( <>
                <Button
                onClick={onAnswer}
                className="bg-green-500 hover:bg-green-600 text-white rounded-full px-8 transition-transform hover:scale-105"
              >
                Answer
              </Button> 
             <Button
             onClick={onReject}
             variant="destructive"
             className="rounded-full px-8 transition-transform hover:scale-105"
           >
             Decline
           </Button>
              </> ) : <Button
             onClick={onEndCall}
             variant="destructive"
             className="rounded-full px-8 transition-transform hover:scale-105"
           >
             End Call
           </Button> }
              
             
              
              
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Call Interface */}
      {isCallActive && (
        <div className="fixed inset-0 p-5 bg-gradient-to-br from-gray-900 to-black z-50 flex items-center justify-center backdrop-blur-sm">
          <Card className="w-full h-full max-w-7xl bg-gray-900/50 backdrop-blur-md border-gray-800">
            <CardContent className="p-8">
              <div className="relative h-[86vh] rounded-xl overflow-hidden">
                {/* Main Video (Peer) */}
                <div className="relative w-full h-full">
                  <video
                    ref={peerVideoRef}
                    className="w-full h-full object-cover rounded-xl"
                    autoPlay
                    playsInline
                  />
                </div>

{/* Picture-in-Picture (Self) */}

<div className="absolute top-4 right-4 w-64 h-48 transition-all duration-300 hover:scale-105 group">
  <div className="relative w-full h-full rounded-lg overflow-hidden ring-2 ring-white/20 shadow-xl bg-gray-900">
    {/* We keep the video element mounted but hide it when disabled */}
    <video
      ref={myVideoRef}
      className={`w-full h-full object-cover ${!isVideoEnabled && 'hidden'}`}
      autoPlay
      playsInline
      muted
    />
    
    {/* Show profile image when video is disabled */}
    {!isVideoEnabled && (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
        <img 
        crossOrigin='anonymous'
        referrerPolicy='no-referrer'
          src={currentUser.profileImg} 
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover ring-4 ring-white/10"
        />
      </div>
    )}
    
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    
    {/* Camera off indicator */}
    {!isVideoEnabled && (
      <div className="absolute top-2 right-2 bg-black/40 px-2 py-1 rounded-full text-xs text-white/80 flex items-center gap-1">
        <VideoOff className="w-3 h-3" />
        <span>Camera Off</span>
      </div>
    )}
    
    {/* User label */}
    <div className="absolute bottom-2 left-2 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
      You
    </div>
  </div>
</div>

                {/* Call Controls */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-6">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-14 h-14 rounded-full transition-all duration-200 ${
                            isAudioEnabled
                              ? 'bg-white/10 hover:bg-white/20'
                              : 'bg-red-500/20 hover:bg-red-500/30 text-red-500'
                          }`}
                          onClick={onToggleAudio}
                        >
                          {isAudioEnabled ? (
                            <Mic className="h-6 w-6" />
                          ) : (
                            <MicOff className="h-6 w-6" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isAudioEnabled ? 'Mute' : 'Unmute'}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="w-14 h-14 rounded-full transition-transform hover:scale-110"
                          onClick={onEndCall}
                        >
                          <PhoneOff className="h-6 w-6" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>End call</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-14 h-14 rounded-full transition-all duration-200 ${
                            isVideoEnabled
                              ? 'bg-white/10 hover:bg-white/20'
                              : 'bg-red-500/20 hover:bg-red-500/30 text-red-500'
                          }`}
                          onClick={onToggleVideo}
                        >
                          {isVideoEnabled ? (
                            <Video className="h-6 w-6" />
                          ) : (
                            <VideoOff className="h-6 w-6" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isVideoEnabled ? 'Stop video' : 'Start video'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 left-4 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-transform hover:scale-105"
                  onClick={onEndCall}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

export default VideoCallInterface