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
  isVideoEnabled,
  peer
}) => {
  const [peerVideoEnabled, setPeerVideoEnabled] = useState(true);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [isInitiator, setIsInitiator] = useState(false);

  useEffect(() => {
    console.log("Current stream in interface:", stream);
    console.log("myVideoRef current:", myVideoRef.current);
    console.log("peerVideoRef current:", peerVideoRef.current);
    if(stream) {
      console.log("Video tracks:", stream.getVideoTracks());
      console.log("Audio tracks:", stream.getAudioTracks());
    }
  }, [stream]);
  
  // Determine if this peer is the initiator when the component mounts
  useEffect(() => {
    if (peer) {
      setIsInitiator(peer.initiator);
    }
  }, [peer]);

  // Handle local video stream setup
  useEffect(() => {
    if (stream && myVideoRef.current) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        // Set initial video enabled state based on track
        setLocalVideoEnabled(videoTrack.enabled);
      }
      
      // Set local stream to video element
      myVideoRef.current.srcObject = stream;
      myVideoRef.current.play().catch(console.error);
    }
  }, [stream]);

  // Handle peer video stream
  useEffect(() => {
    if (!peer) return;

    const handlePeerStream = (remoteStream) => {
      console.log('Received peer stream');
      if (peerVideoRef.current) {
        peerVideoRef.current.srcObject = remoteStream;
        
        // Ensure video plays when metadata is loaded
        peerVideoRef.current.onloadedmetadata = () => {
          peerVideoRef.current.play().catch(error => 
            console.error('Error playing peer video:', error)
          );
        };
      }
    };

    const handlePeerData = (data) => {
      try {
        const parsedData = JSON.parse(data.toString());
        console.log('Received peer data:', parsedData);
        if (parsedData.type === 'videoState') {
          console.log('Setting peer video state to:', parsedData.enabled);
          setPeerVideoEnabled(parsedData.enabled);
        }
      } catch (error) {
        console.error('Error parsing peer data:', error);
      }
    };

    peer.on('stream', handlePeerStream);
    peer.on('data', handlePeerData);

    // Send initial video state
    if (peer.connected) {
      sendVideoPeerState(localVideoEnabled);
    }

    return () => {
      peer.off('stream', handlePeerStream);
      peer.off('data', handlePeerData);
    };
  }, [peer]);

  // Send video state to peer
  const sendVideoPeerState = (enabled) => {
    if (peer && peer.connected) {
      console.log('Sending video state:', enabled);
      try {
        const data = JSON.stringify({
          type: 'videoState',
          enabled: enabled
        });
        peer.send(data);
      } catch (error) {
        console.error('Error sending video state:', error);
      }
    }
  };

  // Handle local video toggle
  const handleVideoToggle = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const newState = !localVideoEnabled;
        videoTrack.enabled = newState;
        setLocalVideoEnabled(newState);
        sendVideoPeerState(newState);
      }
    }
  };

  // Monitor peer connection state
  useEffect(() => {
    if (!peer) return;

    const handleConnect = () => {
      console.log('Peer connected');
      sendVideoPeerState(localVideoEnabled);
    };

    peer.on('connect', handleConnect);

    return () => {
      peer.off('connect', handleConnect);
    };
  }, [peer, localVideoEnabled]);

  return (
    <>
      {/* Incoming Call Dialog */}
      <Dialog open={incomingCallInfo?.isSomeoneCalling}>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-gray-900 to-gray-800 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Incoming Call</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse blur-xl opacity-50" />
              <img
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                src={incomingCallInfo?.callerData?.avatar || '/placeholder.svg'}
                alt="caller"
                className="relative w-24 h-24 rounded-full border-4 border-white/10"
              />
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">
                {incomingCallInfo?.callerData?.name}
              </p>
              <p className="text-sm text-gray-400 animate-pulse">
                Incoming video call...
              </p>
            </div>
            <div className="flex space-x-4">
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
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Call Interface */}
      {isCallActive && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-black z-50 flex items-center justify-center backdrop-blur-sm">
          <Card className="w-full max-w-5xl bg-gray-900/50 backdrop-blur-md border-gray-800">
            <CardContent className="p-8">
              <div className="relative h-[70vh] rounded-xl overflow-hidden">
                {/* Main Video (Peer) */}
                <div className="relative w-full h-full">
                  <video
                    ref={peerVideoRef}
                    className="w-full h-full object-cover rounded-xl"
                    autoPlay
                    playsInline
                  />
                  {!peerVideoEnabled && (
                    <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center">
                      <VideoOff className="w-16 h-16 text-white/60" />
                    </div>
                  )}
                </div>

                {/* Picture-in-Picture (Self) */}
                <div className="absolute top-4 right-4 w-64 h-48 transition-transform hover:scale-105">
                  <div className="relative w-full h-full">
                    <video
                      ref={myVideoRef}
                      className="w-full h-full object-cover rounded-lg shadow-lg border border-white/10"
                      autoPlay
                      playsInline
                      muted
                    />
                    {!localVideoEnabled && (
                      <div className="absolute inset-0 bg-gray-900/90 rounded-lg flex items-center justify-center">
                        <VideoOff className="w-8 h-8 text-white/60" />
                      </div>
                    )}
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
                            localVideoEnabled
                              ? 'bg-white/10 hover:bg-white/20'
                              : 'bg-red-500/20 hover:bg-red-500/30 text-red-500'
                          }`}
                          onClick={handleVideoToggle}
                        >
                          {localVideoEnabled ? (
                            <Video className="h-6 w-6" />
                          ) : (
                            <VideoOff className="h-6 w-6" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{localVideoEnabled ? 'Stop video' : 'Start video'}</p>
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