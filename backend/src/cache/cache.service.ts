import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  generateKey(...args: any[]): string {
    return args.join(':');
  }

  // Méthodes spécifiques pour notre application de chat
  getUserKey(userId: string): string {
    return `user:${userId}`;
  }

  getConversationKey(conversationId: string): string {
    return `conversation:${conversationId}`;
  }

  getRecentMessagesKey(conversationId: string): string {
    return `messages:${conversationId}:recent`;
  }

  // Cache des utilisateurs
  async cacheUser(userId: string, userData: any): Promise<void> {
    const key = this.getUserKey(userId);
    await this.set(key, userData, 3600); // Cache pour 1 heure
  }

  async getCachedUser(userId: string): Promise<any> {
    const key = this.getUserKey(userId);
    return await this.get(key);
  }

  // Cache des conversations
  async cacheConversation(conversationId: string, conversationData: any): Promise<void> {
    const key = this.getConversationKey(conversationId);
    await this.set(key, conversationData, 1800); // Cache pour 30 minutes
  }

  async getCachedConversation(conversationId: string): Promise<any> {
    const key = this.getConversationKey(conversationId);
    return await this.get(key);
  }

  // Cache des messages récents
  async cacheRecentMessages(conversationId: string, messages: any[]): Promise<void> {
    const key = this.getRecentMessagesKey(conversationId);
    await this.set(key, messages, 300); // Cache pour 5 minutes
  }

  async getCachedRecentMessages(conversationId: string): Promise<any[]> {
    const key = this.getRecentMessagesKey(conversationId);
    return await this.get(key) || [];
  }
} 