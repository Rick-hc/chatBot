import React, { useState } from 'react';
import axios from 'axios';

interface Candidate {
  id: string;
  question: string;
  answer: string;
  similarity: number;
}

interface EmbedFormProps {
  onCandidatesReceived: (candidates: Candidate[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const EmbedForm: React.FC<EmbedFormProps> = ({ 
  onCandidatesReceived, 
  isLoading, 
  setIsLoading 
}) => {
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setError('質問を入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8000/api/search', {
        question: question.trim()
      });

      if (response.data && response.data.candidates) {
        onCandidatesReceived(response.data.candidates);
      } else {
        setError('検索結果が見つかりませんでした');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('検索中にエラーが発生しました。しばらく時間をおいて再試行してください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
            質問を入力してください
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例：プロジェクトの進捗管理はどのように行いますか？"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              検索中...
            </div>
          ) : (
            '検索'
          )}
        </button>
      </form>
    </div>
  );
};

export default EmbedForm;