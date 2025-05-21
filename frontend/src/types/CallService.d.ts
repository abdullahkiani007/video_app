declare module '@/services/CallService' {
  interface CallServiceConfig {
    userId: string | number;
    username: string;
    onRemoteStreamAdded: (userId: string, stream: MediaStream) => void;
    onRemoteStreamRemoved: (userId: string) => void;
    onMessageReceived: (message: any) => void;
    onUserJoined: (userId: string) => void;
    onUserLeft: (userId: string) => void;
    onUsersUpdated: (users: any[]) => void;
    onTypingStatusChanged: (userId: string, isTyping: boolean, conversationId: string) => void;
  }

  export default class CallService {
    constructor(config: CallServiceConfig);
    connectWebSocket(): void;
    disconnect(): void;
    joinCall(): Promise<MediaStream>;
    leaveCall(): void;
    sendMessage(text: string): void;
    sendTypingStatus(isTyping: boolean): void;
    connectToExistingUsers(userIds: string[]): void;
  }
}