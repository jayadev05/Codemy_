  const initiateCall = async () => {

    if (!user._id || connectionRef.current) return; // Prevent multiple connections

    setIsCalling(true);
    setoutgoingCallInfo({
      callerData: {
        avatar: userType === "user" ? selectedChat?.tutorId?.profileImg : selectedChat?.userId?.profileImg,
        name: userType === "user" ? selectedChat?.tutorId?.fullName : selectedChat?.userId?.fullName,
      },
    });

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(mediaStream);

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = mediaStream;
      }

      createInitiatorPeer(mediaStream);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      setIsCalling(false);
    }
};

const createInitiatorPeer = (mediaStream) => {
    if (!mediaStream?.getTracks().length || connectionRef.current) {
        console.error("No media tracks available or connection exists");
        return;
    }

    const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: mediaStream,
        config: {
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:global.stun.twilio.com:3478" },
            ],
        },
    });

    // Set up signal handler before emitting any signals
    let signalAttempts = 0;
    peer.on("signal",  (signalData) => {
        if (signalData.type === "offer" && signalAttempts === 0) {
            signalAttempts++;
            try {
                 socketService.initializeCall({
                    recieverId: receiverId,
                    signalData,
                    from: socketService.socket.id,
                    callerName: user.fullName,
                    callerAvatar: user.profileImg,
                    callerUserId: user._id,
                });
            } catch (error) {
                console.error("Failed to initialize call:", error);
                handleEndCall();
            }
        }
    });

    connectionRef.current = peer;
    setupPeerEventListeners(peer);
};

const answerCall = async () => {
    if (!incomingCallInfo?.signalData || connectionRef.current) return;

    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

        setStream(mediaStream);
        setIncomingCallInfo((prev)=>({...prev,isSomeoneCalling:false}))

        if (myVideoRef.current) {
            myVideoRef.current.srcObject = mediaStream;
        }

        createAnswerPeer(mediaStream);
    } catch (error) {
        console.error("Error accessing media devices:", error);
        handleEndCall();
    }
};

const createAnswerPeer = (mediaStream) => {
    if (!mediaStream?.getTracks().length || connectionRef.current) {
        console.error("Invalid media stream or connection exists");
        return;
    }

    const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: mediaStream,
        config: {
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:global.stun.twilio.com:3478" },
            ],
        },
    });

    // Set up signal handler before processing the offer
    let answerSent = false;
    peer.on("signal",  (signalData) => {
        if (signalData.type === "answer" && !answerSent) {
            answerSent = true;
            try {
                 socketService.answerCall({
                    signalData,
                    to: incomingCallInfo.from,
                });
            } catch (error) {
                console.error("Failed to send answer:", error);
                handleEndCall();
            }
        }
    });

    connectionRef.current = peer;
    setupPeerEventListeners(peer);

    // Process the offer
    try {
        peer.signal(incomingCallInfo.signalData);
    } catch (error) {
        console.error("Error processing offer:", error);
        handleEndCall();
    }
};