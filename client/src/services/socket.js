import { io } from 'socket.io-client';
import {jwtDecode} from 'jwt-decode';

class SocketService {
  constructor() {
    this.socket = null;
  }

  getUserTypeFromToken(token) {
    try {
      const decoded = jwtDecode(token);
      console.log("decoded",decoded)
      return decoded?.type || null; 
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
 
  connect(token) {
    if (this.socket) {
      console.warn('Socket already connected');
      return;
    }

    const type = this.getUserTypeFromToken(token);

    if (!type) {
      console.error('Could not determine user type from token');
      return;
    }

    this.socket = io('http://localhost:3000', {
      auth: { token, type }
    });

    this.socket.on('connect', () => {
      console.log('[SocketService] Connected to socket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('[SocketService] Connection error:', error);
    });

    this.socket.on('token-expired', () => {
      console.log('[SocketService] Token expired, redirecting to login...');
      window.location.href = '/login';
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  sendMessage(data) {
    if (this.isConnected()) {
      this.socket.emit('send-message', data);
    }
  }

  onReceiveMessage(callback) {
    if (this.isConnected()) {
      this.socket.on('receive-message', callback);
    }
  }

  sendTyping(receiverId) {
    this.socket?.emit('typing', { receiverId });
  }

  sendStopTyping(receiverId) {
    this.socket?.emit('stop-typing', { receiverId });
  }

  onTyping(callback) {
    this.socket?.on('typing', callback);
  }

  onStopTyping(callback) {
    this.socket?.on('stop-typing', callback);
  }

  onUserStatusUpdate(callback) {
    this.socket?.on('user-status-update', callback);
  }
}

export const socketService = new SocketService();
