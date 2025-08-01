import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  placeholder = "メッセージを入力..." 
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      adjustTextareaHeight();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // 約5行分
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const canSend = message.trim().length > 0 && !isLoading;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className={`
            relative border rounded-2xl transition-all duration-200 
            ${isFocused 
              ? 'border-blue-500 dark:border-blue-400 shadow-lg ring-2 ring-blue-500/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${isLoading ? 'opacity-50' : ''}
            bg-gray-50 dark:bg-gray-700
          `}>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={isLoading}
              className="
                w-full px-4 py-3 pr-12 
                bg-transparent 
                text-gray-900 dark:text-gray-100 
                placeholder-gray-500 dark:placeholder-gray-400
                border-none outline-none resize-none
                max-h-30 min-h-[50px]
                scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
              "
              rows={1}
            />
            
            {/* Send Button */}
            <button
              type="submit"
              disabled={!canSend}
              className={`
                absolute right-2 bottom-2 
                w-8 h-8 rounded-full 
                flex items-center justify-center 
                transition-all duration-200 transform
                ${canSend 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                  />
                </svg>
              )}
            </button>
          </div>
          
          {/* Helper Text */}
          <div className="flex justify-between items-center mt-2 px-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Shift + Enter で改行
            </span>
            <span className={`text-xs transition-colors ${
              message.length > 500 
                ? 'text-red-500' 
                : message.length > 400 
                  ? 'text-yellow-500' 
                  : 'text-gray-400 dark:text-gray-500'
            }`}>
              {message.length}/1000
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;