import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';


class SocketService {
  constructor() {
    this.socket = null;
    this.eventHandlers = new Map();
  }

  getUserTypeFromToken(token) {
    try {
      const decoded = jwtDecode(token);
      return decoded?.type || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  connect(token, refreshToken) {
    if (this.socket?.connected) {
      console.warn('Socket already connected');
      return;
    }

    const type = this.getUserTypeFromToken(token);

    if (!type) {
      console.error('Could not determine user type from token');
      return;
    }

    this.socket = io('http://localhost:3000', {
      auth: { token, refreshToken, type },
      timeout: 45000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.setupDefaultListeners();
  }

  setupDefaultListeners() {
    this.socket.on('connect', () => {
      console.log('[SocketService] Connected to socket server',this.socket.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[SocketService] Connection error:', error);
    });

    this.socket.on('token-expired', () => {
      console.log('[SocketService] Token expired, redirecting to login...');
      window.location.href = '/login';
    });

    this.socket.on('new-access-token', ({ token }) => {
      console.log('[SocketService] Received new access token');
      this.token = token;
    });
  }

  clearAllListeners() {
    if (this.socket) {
      this.eventHandlers.forEach((callbacks, event) => {
        callbacks.forEach((callback) => {
          this.socket.off(event, callback);
        });
      });
      this.eventHandlers.clear();
    }
  }

  onConnect(callback) {
    if (this.socket) {
      this.socket.on('connect', callback);
    }
  }

  onError(callback) {
    if (this.socket) {
      this.socket.on('connect_error', callback);
    }
  }
  
  disconnect() {
    if (this.socket) {
      this.clearAllListeners()
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  // Enhanced event handling methods
  on(event, callback) {
    if (this.socket) {
      if (!this.eventHandlers.has(event)) {
        this.eventHandlers.set(event, new Set());
      }
      this.eventHandlers.get(event).add(callback);
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(callback);
        this.socket.off(event, callback);
      }
    }
  }

  sendMessage(data) {
    if (this.isConnected()) {
      const messageData = {
        chatId: data.chatId,
        _id: data._id,
        sender: data.sender,
        receiver: data.receiver,
        content: data.content,
        contentType: data.contentType,
        timestamps: data.timestamps
      };


      this.socket.emit('send-message', messageData);

      console.log('[SocketService] Sending message:', messageData);

    } else {
      console.warn('[SocketService] Cannot send message: Socket not connected');
    }
  }




  markMessagesRead(data) {
    if (this.isConnected()) {
      this.socket.emit('message-read', data);
      console.log('[SocketService] Marking messages as read:', data);
    }
  }


joinRoom(roomId) {
  if (this.isConnected()) {
    this.socket.emit('join', roomId); // Send just the room ID directly
    console.log('[SocketService] Attempting to join room:', roomId);
  }
  else {
    console.log('Cannot join room - socket not connected');
  }
}

  sendTyping(data) {
    if (this.isConnected()) {
      this.socket.emit('typing', {
        chatId: data.chatId,
        senderId: data.senderId,
        receiverId: data.receiverId
      });
      console.log('[SocketService] Sending typing event');
    }
  }

  sendStopTyping(data) {
    if (this.isConnected()) {
      this.socket.emit('stop-typing', {
        chatId: data.chatId,
        senderId: data.senderId,
        receiverId: data.receiverId
      });
      console.log('[SocketService] Sending stop typing event');
    }
  }

  initializeCall(data) {
    if (!this.isConnected()) {
      return;
    }
  
    this.socket.emit("initiate-call", {
      recieverId: data.recieverId,
      signalData: data.signalData,
      from: data.from,
      callerName: data.callerName,
      callerAvatar: data.callerAvatar,
      callerUserId: data.callerUserId
    });
  
    // Set up handlers for the call initiation response
    this.socket.once("call-failed", (error) => {
      console.error("[SocketService] Call failed:", error);
      // Handle call failure in your UI
    });
  }
  
  acknowledgeCall(from) {
    if (!this.isConnected()) {
      return Promise.reject(new Error('Socket not connected'));
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('acknowledge-call', { from }, (response) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }
  
  

answerCall(data) {
    
        if (!this.isConnected()) {
           
            return;
        }

       
        this.socket.emit("answer-call", {
            signalData: data.signalData,
            to: data.to
        });

        console.log('[SocketService] Sending  call answer event ');
   
}

  rejectCall(data){
    if (this.isConnected()) {
      this.socket.emit('call-rejected', {
        to: data.to
      });
      console.log('[SocketService] Sending  call rejected event to',data.to);
    }
  }

  endCall(data){
    if (this.isConnected()) {
      this.socket.emit('call-ended', {
        to: data.receiverId
      });
      console.log('[SocketService] Sending  call ended event to',data.receiverId);
    }
  }


}

export const socketService = new SocketService();