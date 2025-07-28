import React, { useState } from 'react';
import axios from 'axios';

interface FeedbackComponentProps {
  answerId: string;
  onClose: () => void;
  onSubmitted: () => void;
}

const FeedbackComponent: React.FC<FeedbackComponentProps> = ({ 
  answerId, 
  onClose, 
  onSubmitted 
}) => {
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);

  const handleHelpfulClick = async (helpful: boolean) => {
    setIsHelpful(helpful);
    setError(null);
    
    if (helpful) {
      // If helpful, submit feedback immediately and close
      await submitFeedback(helpful, '');
      onSubmitted();
    } else {
      // If not helpful, show comment form
      setShowCommentForm(true);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitFeedback(false, comment.trim());
    onSubmitted();
  };

  const submitFeedback = async (helpful: boolean, commentText: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post('http://localhost:8000/api/feedback', {
        message_id: answerId,
        helpful,
        comment: commentText
      });
    } catch (err) {
      console.error('Feedback submission error:', err);
      setError('フィードバックの送信中にエラーが発生しました');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">フィードバック</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!showCommentForm ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-4">
                この回答で解決しましたか？
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleHelpfulClick(true)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  はい
                </button>
                <button
                  onClick={() => handleHelpfulClick(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  いいえ
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-gray-700 mb-4">
                申し訳ございません。<br/>
                現在のQA集にご要望の回答が見つかりませんでした。<br/>
                フィードバックのため、下記フォームにご質問内容を入力してください。
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="ご質問内容を入力してください..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
                disabled={isSubmitting}
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    送信中...
                  </div>
                ) : (
                  '送信'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackComponent;