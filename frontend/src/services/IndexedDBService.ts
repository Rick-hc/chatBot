// 🚀 ULTIMATE IndexedDB Service - 完璧なオフラインデータ管理
class IndexedDBService {
  private dbName = 'ChatbotPWA';
  private version = 1;
  private db: IDBDatabase | null = null;

  // データベースの完璧な初期化
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('❌ IndexedDB initialization failed');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
        console.log('🔄 IndexedDB schema upgraded');
      };
    });
  }

  // 完璧なストア作成
  private createStores(db: IDBDatabase): void {
    // 質問ストア
    if (!db.objectStoreNames.contains('questions')) {
      const questionsStore = db.createObjectStore('questions', { 
        keyPath: 'id', 
        autoIncrement: true 
      });
      questionsStore.createIndex('timestamp', 'timestamp', { unique: false });
      questionsStore.createIndex('userId', 'userId', { unique: false });
      questionsStore.createIndex('synced', 'synced', { unique: false });
    }

    // 回答ストア
    if (!db.objectStoreNames.contains('answers')) {
      const answersStore = db.createObjectStore('answers', { 
        keyPath: 'id', 
        autoIncrement: true 
      });
      answersStore.createIndex('questionId', 'questionId', { unique: false });
      answersStore.createIndex('timestamp', 'timestamp', { unique: false });
      answersStore.createIndex('cached', 'cached', { unique: false });
    }

    // チャット履歴ストア
    if (!db.objectStoreNames.contains('chatHistory')) {
      const historyStore = db.createObjectStore('chatHistory', { 
        keyPath: 'id', 
        autoIncrement: true 
      });
      historyStore.createIndex('sessionId', 'sessionId', { unique: false });
      historyStore.createIndex('timestamp', 'timestamp', { unique: false });
      historyStore.createIndex('type', 'type', { unique: false });
    }

    // 設定ストア
    if (!db.objectStoreNames.contains('settings')) {
      const settingsStore = db.createObjectStore('settings', { 
        keyPath: 'key' 
      });
    }

    // 同期待ちアクションストア
    if (!db.objectStoreNames.contains('pendingActions')) {
      const actionsStore = db.createObjectStore('pendingActions', { 
        keyPath: 'id', 
        autoIncrement: true 
      });
      actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
      actionsStore.createIndex('priority', 'priority', { unique: false });
    }

    // キャッシュストア
    if (!db.objectStoreNames.contains('cache')) {
      const cacheStore = db.createObjectStore('cache', { 
        keyPath: 'key' 
      });
      cacheStore.createIndex('expiry', 'expiry', { unique: false });
    }

    // ファイルストア
    if (!db.objectStoreNames.contains('files')) {
      const filesStore = db.createObjectStore('files', { 
        keyPath: 'id', 
        autoIncrement: true 
      });
      filesStore.createIndex('filename', 'filename', { unique: false });
      filesStore.createIndex('type', 'type', { unique: false });
    }
  }

  // 🔄 完璧なトランザクション実行
  private async executeTransaction<T>(
    storeNames: string | string[],
    mode: IDBTransactionMode,
    operation: (stores: IDBObjectStore | IDBObjectStore[]) => Promise<T>
  ): Promise<T> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeNames, mode);
      
      transaction.onerror = () => {
        console.error('❌ Transaction failed:', transaction.error);
        reject(transaction.error);
      };

      const stores = Array.isArray(storeNames) 
        ? storeNames.map(name => transaction.objectStore(name))
        : transaction.objectStore(storeNames);

      operation(stores as any).then(resolve).catch(reject);
    });
  }

  // 💬 質問の完璧な保存
  async saveQuestion(question: {
    text: string;
    userId?: string;
    sessionId: string;
    synced: boolean;
    timestamp: number;
  }): Promise<number> {
    return this.executeTransaction('questions', 'readwrite', async (store) => {
      return new Promise<number>((resolve, reject) => {
        const request = (store as IDBObjectStore).add(question);
        request.onsuccess = () => resolve(request.result as number);
        request.onerror = () => reject(request.error);
      });
    });
  }

  // 📝 回答の完璧な保存
  async saveAnswer(answer: {
    questionId: number;
    text: string;
    confidence: number;
    sources: string[];
    cached: boolean;
    timestamp: number;
  }): Promise<number> {
    return this.executeTransaction('answers', 'readwrite', async (store) => {
      return new Promise<number>((resolve, reject) => {
        const request = (store as IDBObjectStore).add(answer);
        request.onsuccess = () => resolve(request.result as number);
        request.onerror = () => reject(request.error);
      });
    });
  }

  // 💭 チャット履歴の完璧な保存
  async saveChatMessage(message: {
    sessionId: string;
    type: 'question' | 'answer';
    content: string;
    metadata?: any;
    timestamp: number;
  }): Promise<number> {
    return this.executeTransaction('chatHistory', 'readwrite', async (store) => {
      return new Promise<number>((resolve, reject) => {
        const request = (store as IDBObjectStore).add(message);
        request.onsuccess = () => resolve(request.result as number);
        request.onerror = () => reject(request.error);
      });
    });
  }

  // 🔍 質問の完璧な検索
  async getQuestions(filters?: {
    userId?: string;
    synced?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    return this.executeTransaction('questions', 'readonly', async (store) => {
      return new Promise<any[]>((resolve, reject) => {
        const results: any[] = [];
        let request: IDBRequest;

        if (filters?.userId) {
          const index = (store as IDBObjectStore).index('userId');
          request = index.openCursor(IDBKeyRange.only(filters.userId));
        } else if (filters?.synced !== undefined) {
          const index = (store as IDBObjectStore).index('synced');
          request = index.openCursor(IDBKeyRange.only(filters.synced));
        } else {
          request = (store as IDBObjectStore).openCursor();
        }

        let count = 0;
        const offset = filters?.offset || 0;
        const limit = filters?.limit || Infinity;

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor && count < limit) {
            if (count >= offset) {
              results.push(cursor.value);
            }
            count++;
            cursor.continue();
          } else {
            resolve(results);
          }
        };

        request.onerror = () => reject(request.error);
      });
    });
  }

  // 📚 チャット履歴の完璧な取得
  async getChatHistory(sessionId: string, limit: number = 50): Promise<any[]> {
    return this.executeTransaction('chatHistory', 'readonly', async (store) => {
      return new Promise<any[]>((resolve, reject) => {
        const results: any[] = [];
        const index = (store as IDBObjectStore).index('sessionId');
        const request = index.openCursor(IDBKeyRange.only(sessionId), 'prev');

        let count = 0;
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor && count < limit) {
            results.push(cursor.value);
            count++;
            cursor.continue();
          } else {
            resolve(results.reverse());
          }
        };

        request.onerror = () => reject(request.error);
      });
    });
  }

  // ⚙️ 設定の完璧な管理
  async saveSetting(key: string, value: any): Promise<void> {
    return this.executeTransaction('settings', 'readwrite', async (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = (store as IDBObjectStore).put({ key, value, timestamp: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getSetting(key: string): Promise<any> {
    return this.executeTransaction('settings', 'readonly', async (store) => {
      return new Promise<any>((resolve, reject) => {
        const request = (store as IDBObjectStore).get(key);
        request.onsuccess = () => resolve(request.result?.value);
        request.onerror = () => reject(request.error);
      });
    });
  }

  // 🔄 同期待ちアクションの完璧な管理
  async addPendingAction(action: {
    type: string;
    endpoint: string;
    method: string;
    data: any;
    priority: number;
    retries: number;
    timestamp: number;
  }): Promise<number> {
    return this.executeTransaction('pendingActions', 'readwrite', async (store) => {
      return new Promise<number>((resolve, reject) => {
        const request = (store as IDBObjectStore).add(action);
        request.onsuccess = () => resolve(request.result as number);
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getPendingActions(limit: number = 10): Promise<any[]> {
    return this.executeTransaction('pendingActions', 'readonly', async (store) => {
      return new Promise<any[]>((resolve, reject) => {
        const results: any[] = [];
        const index = (store as IDBObjectStore).index('priority');
        const request = index.openCursor(null, 'prev');

        let count = 0;
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor && count < limit) {
            results.push(cursor.value);
            count++;
            cursor.continue();
          } else {
            resolve(results);
          }
        };

        request.onerror = () => reject(request.error);
      });
    });
  }

  async removePendingAction(id: number): Promise<void> {
    return this.executeTransaction('pendingActions', 'readwrite', async (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = (store as IDBObjectStore).delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  // 💾 キャッシュの完璧な管理
  async setCache(key: string, data: any, ttl: number = 3600000): Promise<void> {
    const expiry = Date.now() + ttl;
    return this.executeTransaction('cache', 'readwrite', async (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = (store as IDBObjectStore).put({ key, data, expiry, timestamp: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getCache(key: string): Promise<any> {
    return this.executeTransaction('cache', 'readonly', async (store) => {
      return new Promise<any>((resolve, reject) => {
        const request = (store as IDBObjectStore).get(key);
        request.onsuccess = () => {
          const result = request.result;
          if (result && result.expiry > Date.now()) {
            resolve(result.data);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  // 🗑️ 期限切れキャッシュの完璧なクリーンアップ
  async cleanupExpiredCache(): Promise<number> {
    return this.executeTransaction('cache', 'readwrite', async (store) => {
      return new Promise<number>((resolve, reject) => {
        const now = Date.now();
        let deletedCount = 0;
        const index = (store as IDBObjectStore).index('expiry');
        const request = index.openCursor(IDBKeyRange.upperBound(now));

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            deletedCount++;
            cursor.continue();
          } else {
            console.log(`🗑️ Cleaned up ${deletedCount} expired cache entries`);
            resolve(deletedCount);
          }
        };

        request.onerror = () => reject(request.error);
      });
    });
  }

  // 📊 データベース統計の完璧な取得
  async getStats(): Promise<{
    questions: number;
    answers: number;
    chatHistory: number;
    pendingActions: number;
    cacheEntries: number;
  }> {
    const stats = {
      questions: 0,
      answers: 0,
      chatHistory: 0,
      pendingActions: 0,
      cacheEntries: 0
    };

    if (!this.db) return stats;

    const storeNames = ['questions', 'answers', 'chatHistory', 'pendingActions', 'cache'];
    
    for (const storeName of storeNames) {
      try {
        const count = await this.executeTransaction(storeName, 'readonly', async (store) => {
          return new Promise<number>((resolve, reject) => {
            const request = (store as IDBObjectStore).count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        });
        
        stats[storeName as keyof typeof stats] = count;
      } catch (error) {
        console.error(`❌ Failed to get count for ${storeName}:`, error);
      }
    }

    return stats;
  }

  // 🧹 データベースの完璧なクリーンアップ
  async cleanup(): Promise<void> {
    await this.cleanupExpiredCache();
    
    // 古いチャット履歴の削除（30日以上前）
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    await this.executeTransaction('chatHistory', 'readwrite', async (store) => {
      return new Promise<void>((resolve, reject) => {
        const index = (store as IDBObjectStore).index('timestamp');
        const request = index.openCursor(IDBKeyRange.upperBound(thirtyDaysAgo));

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };

        request.onerror = () => reject(request.error);
      });
    });

    console.log('🧹 Database cleanup completed');
  }

  // 🔄 データベースの完璧なリセット
  async reset(): Promise<void> {
    if (this.db) {
      this.db.close();
    }

    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(this.dbName);
      
      deleteRequest.onsuccess = () => {
        console.log('🔄 Database reset successfully');
        this.db = null;
        resolve();
      };
      
      deleteRequest.onerror = () => {
        console.error('❌ Database reset failed');
        reject(deleteRequest.error);
      };
    });
  }
}

// シングルトンインスタンス
export const indexedDBService = new IndexedDBService();

// 初期化
indexedDBService.init().catch(console.error);

export default IndexedDBService;