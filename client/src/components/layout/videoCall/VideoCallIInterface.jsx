import React from 'react';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const VideoCallInterface = ({ 
  stream,
  myVideoRef,
  peerVideoRef,
  isCallAccepted,
  incomingCallInfo,
  onAnswer,
  onReject,
  onEndCall,
  isCallActive,
  onToggleAudio,
  onToggleVideo,
  isAudioEnabled,
  isVideoEnabled
}) => {



  return (
    <>
      {/* Incoming Call Dialog */}
      <Dialog open={incomingCallInfo?.isSomeoneCalling}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Incoming Call</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2">
              <img 
              crossOrigin='anonymous'
              referrerPolicy='no-referrer'
                src={incomingCallInfo?.callerData?.avatar || '/placeholder.svg'} 
                alt="caller" 
                className="w-16 h-16 rounded-full"
              />
              <div>
                <p className="font-medium">{incomingCallInfo?.callerData?.name}</p>
                <p className="text-sm text-gray-500">is calling you...</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button 
                onClick={onAnswer}
                className="bg-green-500 hover:bg-green-600"
              >
                Answer
              </Button>
              <Button 
                onClick={onReject}
                variant="destructive"
              >
                Decline
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Call Interface */}
      {isCallActive && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <Card className="w-full max-w-4xl bg-gray-900 text-white">
            <CardContent className="p-6">
              <div className="relative h-[600px]">
                {/* Main Video (Peer) */}
                <video
                  ref={peerVideoRef}
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay
                  playsInline
                />
                
                {/* Picture-in-Picture (Self) */}
                <div className="absolute top-4 right-4 w-48 h-36">
                  <video
                    ref={myVideoRef}
                    className="w-full h-full object-cover rounded-lg"
                    autoPlay
                    playsInline
                    muted
                  />
                </div>

                {/* Call Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/10 hover:bg-white/20"
                    onClick={onToggleAudio}
                  >
                    {isAudioEnabled ? 
                      <Mic className="h-6 w-6" /> : 
                      <MicOff className="h-6 w-6" />
                    }
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full"
                    onClick={onEndCall}
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/10 hover:bg-white/20"
                    onClick={onToggleVideo}
                  >
                    {isVideoEnabled ? 
                      <Video className="h-6 w-6" /> : 
                      <VideoOff className="h-6 w-6" />
                    }
                  </Button>
                </div>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 left-4 rounded-full bg-white/10 hover:bg-white/20"
                  onClick={onEndCall}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default VideoCallInterface;