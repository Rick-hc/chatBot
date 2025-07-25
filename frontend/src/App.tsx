import React, { useState } from 'react';
import './App.css';
import SimpleChatHistory, { ChatMessageData } from './components/SimpleChatHistory';
import SimpleChatInput from './components/SimpleChatInput';
import ThemeToggle from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import FAQ from './components/FAQ';
import { ThemeProvider } from './hooks/useTheme';
import axios from 'axios';

interface Candidate {
  id: string;
  question: string;
  answer: string;
  similarity: number;
}

function AppContent() {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFAQ, setShowFAQ] = useState(true);

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessageData = {
      id: Date.now().toString(),
      message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/search', {
        question: message
      });

      if (response.data && response.data.candidates) {
        const searchMessage: ChatMessageData = {
          id: (Date.now() + 1).toString(),
          message: `${response.data.candidates.length}件の関連回答を見つけました。最適な回答を選択してください。`,
          isUser: false,
          timestamp: new Date(),
          candidates: response.data.candidates
        };
        setMessages(prev => [...prev, searchMessage]);
      } else {
        const noResultMessage: ChatMessageData = {
          id: (Date.now() + 1).toString(),
          message: '申し訳ございませんが、関連する回答が見つかりませんでした。別の表現で質問していただけますか？',
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, noResultMessage]);
      }
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage: ChatMessageData = {
        id: (Date.now() + 1).toString(),
        message: 'エラーが発生しました。しばらく時間をおいて再試行してください。',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCandidateSelected = (candidate: Candidate) => {
    const answerMessage: ChatMessageData = {
      id: Date.now().toString(),
      message: candidate.answer,
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, answerMessage]);
  };

  const handleFeedback = (messageId: string, helpful: boolean) => {
    console.log(`Feedback for message ${messageId}: ${helpful ? 'helpful' : 'not helpful'}`);
    // ここでフィードバックをサーバーに送信する処理を追加
  };

  const handleFAQQuestionSelect = (question: string) => {
    setShowFAQ(false);
    handleSendMessage(question);
  };

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900 transition-colors">
      {/* Sidebar with FAQ */}
      {showFAQ && messages.length === 0 && (
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              よくある質問から選択
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              質問をクリックして会話を始めましょう
            </p>
          </div>
          <div className="flex-1 overflow-hidden p-4">
            <FAQ onQuestionSelect={handleFAQQuestionSelect} />
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                社内ナレッジチャットボット
              </h1>
              {messages.length > 0 && (
                <button
                  onClick={() => setShowFAQ(!showFAQ)}
                  className="ml-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showFAQ ? 'FAQを隠す' : 'FAQを表示'}
                </button>
              )}
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Welcome Message for New Users */}
        {messages.length === 0 && !showFAQ && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                社内ナレッジチャットボットへようこそ
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                技術的な質問や疑問について、適切な回答を見つけるお手伝いをします。
              </p>
              <button
                onClick={() => setShowFAQ(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                よくある質問を見る
              </button>
            </div>
          </div>
        )}

        {/* Chat History */}
        {messages.length > 0 && (
          <SimpleChatHistory 
            messages={messages}
            isLoading={isLoading}
            onCandidateSelected={handleCandidateSelected}
            onFeedback={handleFeedback}
          />
        )}

        {/* Chat Input */}
        <SimpleChatInput 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;