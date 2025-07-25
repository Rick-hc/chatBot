import React from 'react';

interface Candidate {
  id: string;
  question: string;
  answer: string;
  similarity: number;
}

interface CandidateListProps {
  candidates: Candidate[];
  onCandidateSelected: (candidate: Candidate) => void;
}

const CandidateList: React.FC<CandidateListProps> = ({ candidates, onCandidateSelected }) => {
  const formatSimilarity = (similarity: number): string => {
    return `${(similarity * 100).toFixed(1)}%`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        検索結果 ({candidates.length}件)
      </h2>
      
      <div className="space-y-4">
        {candidates.map((candidate, index) => (
          <div
            key={candidate.id}
            className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onCandidateSelected(candidate)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-blue-600">
                #{index + 1}
              </span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                類似度: {formatSimilarity(candidate.similarity)}
              </span>
            </div>
            
            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">質問:</h3>
                <p className="text-gray-800 text-sm leading-relaxed">
                  {candidate.question}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">回答プレビュー:</h3>
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                  {candidate.answer.length > 150 
                    ? `${candidate.answer.substring(0, 150)}...` 
                    : candidate.answer
                  }
                </p>
              </div>
            </div>
            
            <div className="mt-3 pt-2 border-t border-gray-100">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                詳細を見る
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {candidates.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.785-6.172-2.109M15.172 7.828A7.962 7.962 0 0112 7c-2.34 0-4.467.785-6.172 2.109M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">検索結果が見つかりませんでした</p>
            <p className="text-sm mt-1">別のキーワードで検索してみてください</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateList;