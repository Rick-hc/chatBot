import React, { useState } from 'react';
import FeedbackComponent from './FeedbackComponent';

interface Answer {
  id: string;
  question: string;
  answer: string;
}

interface AnswerDisplayProps {
  answer: Answer;
  onBackToSearch: () => void;
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answer, onBackToSearch }) => {
  const [showFeedback, setShowFeedback] = useState(false);

  const handleFeedbackSubmitted = () => {
    setShowFeedback(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold text-gray-800">回答</h2>
          <button
            onClick={onBackToSearch}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            検索に戻る
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">質問:</h3>
            <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
              {answer.question}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">回答:</h3>
            <div className="text-gray-800 bg-blue-50 p-4 rounded-md border-l-4 border-blue-500">
              <div className="whitespace-pre-wrap">
                {answer.answer}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">この回答は役に立ちましたか？</span>
            <button
              onClick={() => setShowFeedback(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm"
            >
              フィードバックを送る
            </button>
          </div>
        </div>
      </div>

      {showFeedback && (
        <FeedbackComponent
          answerId={answer.id}
          onClose={() => setShowFeedback(false)}
          onSubmitted={handleFeedbackSubmitted}
        />
      )}
    </div>
  );
};

export default AnswerDisplay;