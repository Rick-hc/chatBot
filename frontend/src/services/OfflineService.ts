// 🚀 ULTIMATE Offline Service - 完璧なオフライン機能管理
import { indexedDBService } from './IndexedDBService';

interface OfflineQuestion {
  id?: number;
  text: string;
  sessionId: string;
  timestamp: number;
  synced: boolean;
}

interface OfflineAnswer {
  id?: number;
  questionId: number;
  text: string;
  confidence: number;
  sources: string[];
  cached: boolean;
  timestamp: number;
}

interface SyncAction {
  id?: number;
  type: 'chat' | 'question' | 'feedback';
  endpoint: string;
  method: string;
  data: any;
  priority: number;
  retries: number;
  timestamp: number;
}

class OfflineService {
  private offlineQA: Array<{ question: string; answer: string; category: string }> = [];
  private currentSessionId: string = '';

  constructor() {
    this.initializeOfflineData();
    this.generateSessionId();
  }

  // 🎯 完璧なオフラインデータ初期化
  private initializeOfflineData(): void {
    this.offlineQA = [
      {
        question: "会社の営業時間は何時から何時までですか？",
        answer: "営業時間は平日9:00-18:00です。土日祝日は休業日となります。",
        category: "general"
      },
      {
        question: "有給休暇の申請方法を教えてください",
        answer: "有給休暇は人事システムから申請できます。申請は休暇予定日の2週間前までに行ってください。",
        category: "hr"
      },
      {
        question: "社内システムにログインできない場合の対処法は？",
        answer: "社内システムにログインできない場合は、パスワードリセットを行うか、IT部門（内線1234）にお問い合わせください。",
        category: "it"
      },
      {
        question: "会議室の予約方法を教えてください",
        answer: "会議室は社内予約システムから予約できます。予約は最大2週間先まで可能です。",
        category: "facility"
      },
      {
        question: "経費精算の締切日はいつですか？",
        answer: "経費精算の締切日は毎月末日です。翌月10日までに承認を完了してください。",
        category: "finance"
      },
      {
        question: "リモートワークの申請はどうすればいいですか？",
        answer: "リモートワークは人事システムの「勤務形態変更申請」から申請してください。前日までの申請が必要です。",
        category: "hr"
      },
      {
        question: "社内Wi-Fiのパスワードは何ですか？",
        answer: "社内Wi-Fi「CompanyNet」のパスワードは「Welcome2024!」です。セキュリティ上、外部の方には教えないでください。",
        category: "it"
      },
      {
        question: "健康診断の日程はいつですか？",
        answer: "今年度の健康診断は4月15日-30日の期間で実施予定です。詳細は人事部からの通知をご確認ください。",
        category: "hr"
      }
    ];
  }

  // 🆔 セッションID生成
  private generateSessionId(): void {
    this.currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 🔍 完璧なオフライン検索
  async searchOffline(query: string): Promise<OfflineAnswer[]> {
    console.log('🔍 Searching offline data for:', query);
    
    const queryLower = query.toLowerCase();
    const matches = this.offlineQA
      .map((qa, index) => {
        const questionLower = qa.question.toLowerCase();
        const answerLower = qa.answer.toLowerCase();
        
        let score = 0;
        
        // 完全一致ボーナス
        if (questionLower.includes(queryLower)) {
          score += 100;
        }
        
        // 部分一致スコア
        const queryWords = queryLower.split(/\s+/);
        queryWords.forEach(word => {
          if (word.length > 1) {
            if (questionLower.includes(word)) {
              score += 50;
            }
            if (answerLower.includes(word)) {
              score += 25;
            }
          }
        });
        
        // カテゴリ一致ボーナス
        if (queryLower.includes(qa.category)) {
          score += 30;
        }
        
        return {
          ...qa,
          score,
          index
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const results: OfflineAnswer[] = matches.map((match, resultIndex) => ({
      id: match.index,
      questionId: match.index,
      text: match.answer,
      confidence: Math.min(0.95, Math.max(0.3, match.score / 100)),
      sources: [`オフラインデータ - ${match.category}`],
      cached: true,
      timestamp: Date.now()
    }));

    console.log(`✅ Found ${results.length} offline matches`);
    return results;
  }

  // 💾 質問の保存（オフライン時）
  async saveQuestionOffline(questionText: string): Promise<number> {
    const question: OfflineQuestion = {
      text: questionText,
      sessionId: this.currentSessionId,
      timestamp: Date.now(),
      synced: false
    };

    try {
      const id = await indexedDBService.saveQuestion(question);
      
      // チャット履歴にも保存
      await indexedDBService.saveChatMessage({
        sessionId: this.currentSessionId,
        type: 'question',
        content: questionText,
        timestamp: Date.now()
      });

      console.log('✅ Question saved offline:', id);
      return id;
    } catch (error) {
      console.error('❌ Failed to save question offline:', error);
      throw error;
    }
  }

  // 📝 回答の保存（オフライン時）
  async saveAnswerOffline(questionId: number, answer: OfflineAnswer): Promise<number> {
    try {
      const id = await indexedDBService.saveAnswer(answer);
      
      // チャット履歴にも保存
      await indexedDBService.saveChatMessage({
        sessionId: this.currentSessionId,
        type: 'answer',
        content: answer.text,
        metadata: {
          confidence: answer.confidence,
          sources: answer.sources,
          cached: answer.cached
        },
        timestamp: Date.now()
      });

      console.log('✅ Answer saved offline:', id);
      return id;
    } catch (error) {
      console.error('❌ Failed to save answer offline:', error);
      throw error;
    }
  }

  // 🔄 同期アクションの追加
  async addSyncAction(action: Omit<SyncAction, 'id' | 'timestamp'>): Promise<void> {
    const syncAction: SyncAction = {
      ...action,
      timestamp: Date.now()
    };

    try {
      await indexedDBService.addPendingAction(syncAction);
      console.log('✅ Sync action added:', action.type);
    } catch (error) {
      console.error('❌ Failed to add sync action:', error);
      throw error;
    }
  }

  // 📚 チャット履歴の取得
  async getChatHistory(limit: number = 50): Promise<any[]> {
    try {
      return await indexedDBService.getChatHistory(this.currentSessionId, limit);
    } catch (error) {
      console.error('❌ Failed to get chat history:', error);
      return [];
    }
  }

  // 🔍 過去の質問検索
  async searchPreviousQuestions(query: string, limit: number = 10): Promise<any[]> {
    try {
      const allQuestions = await indexedDBService.getQuestions({ limit: 100 });
      const queryLower = query.toLowerCase();
      
      return allQuestions
        .filter(q => q.text.toLowerCase().includes(queryLower))
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Failed to search previous questions:', error);
      return [];
    }
  }

  // 📊 オフライン統計の取得
  async getOfflineStats(): Promise<{
    totalQuestions: number;
    totalAnswers: number;
    pendingSync: number;
    cacheSize: number;
    lastActivity: Date | null;
  }> {
    try {
      const stats = await indexedDBService.getStats();
      const pendingActions = await indexedDBService.getPendingActions();
      
      const lastActivity = stats.chatHistory > 0 
        ? new Date() // 実際の実装では最新のタイムスタンプを取得
        : null;

      return {
        totalQuestions: stats.questions,
        totalAnswers: stats.answers,
        pendingSync: pendingActions.length,
        cacheSize: stats.cacheEntries,
        lastActivity
      };
    } catch (error) {
      console.error('❌ Failed to get offline stats:', error);
      return {
        totalQuestions: 0,
        totalAnswers: 0,
        pendingSync: 0,
        cacheSize: 0,
        lastActivity: null
      };
    }
  }

  // 🧹 オフラインデータのクリーンアップ
  async cleanupOfflineData(): Promise<void> {
    try {
      await indexedDBService.cleanup();
      console.log('✅ Offline data cleanup completed');
    } catch (error) {
      console.error('❌ Failed to cleanup offline data:', error);
    }
  }

  // 🔄 データの完全リセット
  async resetOfflineData(): Promise<void> {
    try {
      await indexedDBService.reset();
      this.generateSessionId();
      console.log('✅ Offline data reset completed');
    } catch (error) {
      console.error('❌ Failed to reset offline data:', error);
    }
  }

  // 💾 設定の保存
  async saveSetting(key: string, value: any): Promise<void> {
    try {
      await indexedDBService.saveSetting(key, value);
      console.log('✅ Setting saved:', key);
    } catch (error) {
      console.error('❌ Failed to save setting:', error);
    }
  }

  // 📖 設定の取得
  async getSetting(key: string, defaultValue: any = null): Promise<any> {
    try {
      const value = await indexedDBService.getSetting(key);
      return value !== undefined ? value : defaultValue;
    } catch (error) {
      console.error('❌ Failed to get setting:', error);
      return defaultValue;
    }
  }

  // 🎯 現在のセッションIDを取得
  getCurrentSessionId(): string {
    return this.currentSessionId;
  }

  // 🔄 新しいセッションを開始
  startNewSession(): string {
    this.generateSessionId();
    console.log('🔄 Started new session:', this.currentSessionId);
    return this.currentSessionId;
  }

  // 🌐 オンライン状態での完全同期
  async performFullSync(): Promise<{
    success: boolean;
    syncedItems: number;
    errors: string[];
  }> {
    const result = {
      success: true,
      syncedItems: 0,
      errors: [] as string[]
    };

    try {
      const pendingActions = await indexedDBService.getPendingActions();
      
      for (const action of pendingActions) {
        try {
          const response = await fetch(action.endpoint, {
            method: action.method,
            headers: {
              'Content-Type': 'application/json',
              ...action.data.headers
            },
            body: action.data.body ? JSON.stringify(action.data.body) : undefined
          });

          if (response.ok) {
            await indexedDBService.removePendingAction(action.id!);
            result.syncedItems++;
            console.log('✅ Synced action:', action.type);
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          const errorMsg = `Failed to sync ${action.type}: ${error}`;
          result.errors.push(errorMsg);
          console.error('❌', errorMsg);
          
          // リトライ回数を増加
          action.retries = (action.retries || 0) + 1;
          if (action.retries >= 3) {
            await indexedDBService.removePendingAction(action.id!);
            console.log('🗑️ Removed action after max retries:', action.type);
          }
        }
      }

      result.success = result.errors.length === 0;
      console.log(`🔄 Sync completed: ${result.syncedItems} items synced, ${result.errors.length} errors`);
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error}`);
      console.error('❌ Full sync failed:', error);
    }

    return result;
  }
}

// シングルトンインスタンス
export const offlineService = new OfflineService();

export default OfflineService;