import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';

export interface ChatMessageData {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
  candidates?: any[];
}

interface ChatHistoryProps {
  messages: ChatMessageData[];
  isLoading: boolean;
  onCandidateSelected?: (candidate: any) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  messages, 
  isLoading, 
  onCandidateSelected 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            社内ナレッジチャットボット
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            質問を入力して、社内のナレッジベースから最適な回答を見つけましょう。
            どんなことでもお気軽にお聞きください。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
              プロジェクト管理
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full">
              技術仕様
            </span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-full">
              業務手順
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
    >
      <div className="max-w-4xl mx-auto">
        {messages.map((msg) => (
          <div key={msg.id}>
            <ChatMessage
              message={msg.message}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
            />
            
            {/* Candidate Selection UI */}
            {msg.candidates && msg.candidates.length > 0 && (
              <div className="mb-6 ml-11">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      関連する回答候補 ({msg.candidates.length}件)
                    </h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {msg.candidates.map((candidate, index) => (
                      <button
                        key={candidate.id}
                        onClick={() => onCandidateSelected?.(candidate)}
                        className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            #{index + 1}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                            類似度: {(candidate.similarity * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 mb-2 font-medium">
                          {candidate.question}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {candidate.answer.length > 100 
                            ? `${candidate.answer.substring(0, 100)}...` 
                            : candidate.answer
                          }
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Loading Message */}
        {isLoading && (
          <ChatMessage
            message=""
            isUser={false}
            timestamp={new Date()}
            isLoading={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatHistory;