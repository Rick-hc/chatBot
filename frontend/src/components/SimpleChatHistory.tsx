import React, { useEffect, useRef } from 'react';
import SimpleChatMessage from './SimpleChatMessage';

export interface ChatMessageData {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
  candidates?: any[];
}

interface SimpleChatHistoryProps {
  messages: ChatMessageData[];
  isLoading: boolean;
  onCandidateSelected?: (candidate: any) => void;
  onFeedback?: (messageId: string, helpful: boolean) => void;
}

const SimpleChatHistory: React.FC<SimpleChatHistoryProps> = ({ 
  messages, 
  isLoading, 
  onCandidateSelected,
  onFeedback
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-500 rounded-full flex items-center justify-center">
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
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            質問を入力して、社内のナレッジベースから最適な回答を見つけましょう。
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'プロジェクト管理について',
              '技術仕様の確認方法',
              '業務手順の詳細',
              'システムの使い方',
              'トラブルシューティング'
            ].map((example, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                {example}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto">
        {messages.map((msg) => (
          <SimpleChatMessage
            key={msg.id}
            message={msg.message}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
            candidates={msg.candidates}
            onCandidateSelected={onCandidateSelected}
            onFeedback={(helpful) => onFeedback?.(msg.id, helpful)}
          />
        ))}
        
        {/* Loading Message */}
        {isLoading && (
          <SimpleChatMessage
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

export default SimpleChatHistory;