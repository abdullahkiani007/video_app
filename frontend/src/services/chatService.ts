import { apiClient } from './api';

export default {
  // Conversations
  getConversations() {
    try {
      return apiClient.get('chat/conversations/');
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  getConversation(id:string) {
    if (!id) {
      throw new Error('Conversation ID is required');
    }
    try {
      return apiClient.get(`chat/conversations/${id}/`);
    } catch (error) {
      console.error(`Error fetching conversation ${id}:`, error);
      throw error;
    }
  },

  createConversation(data: any) {
    if (!data) {
      throw new Error('Conversation data is required');
    }
    try {
      return apiClient.post('chat/conversations/', data);
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Messages
  getMessages() {
    try {
      return apiClient.get(`chat/messages/`);
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  sendMessage(data: any) {
    if (!data || !data.content) {
      throw new Error('Message content is required');
    }
    try {
      return apiClient.post('chat/messages/', data);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};