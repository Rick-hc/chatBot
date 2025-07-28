import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FAQProps {
  onQuestionSelect: (question: string) => void;
}

const FAQ: React.FC<FAQProps> = ({ onQuestionSelect }) => {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('すべて');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCategories();
    fetchFAQItems();
  }, []);

  useEffect(() => {
    fetchFAQItems(selectedCategory);
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/faq/categories');
      setCategories(response.data.categories || ['すべて']);
    } catch (err) {
      console.error('Categories fetch error:', err);
      setCategories(['すべて']);
    }
  };

  const fetchFAQItems = async (category?: string) => {
    try {
      setLoading(true);
      const url = category && category !== 'すべて' 
        ? `http://localhost:8000/api/faq?category=${encodeURIComponent(category)}`
        : 'http://localhost:8000/api/faq';
      
      const response = await axios.get(url);
      setFaqItems(response.data.items || []);
      setError(null);
    } catch (err) {
      console.error('FAQ fetch error:', err);
      setError('FAQの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleQuestionClick = (question: string, itemId: string) => {
    // First expand the item to show the answer
    toggleExpanded(itemId);
    // Also trigger the question selection for chat
    onQuestionSelect(question);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Category Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <div className="flex flex-wrap gap-1 p-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="flex-1 overflow-y-auto">
        {faqItems.length === 0 ? (
          <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
            該当するFAQが見つかりません
          </div>
        ) : (
          <div className="space-y-2">
            {faqItems.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                {/* Question Header */}
                <button
                  onClick={() => handleQuestionClick(item.question, item.id)}
                  className="w-full p-3 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 pr-2">
                    {item.question}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      expandedItems.has(item.id) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Answer Content (Accordion) */}
                {expandedItems.has(item.id) && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {item.answer}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      カテゴリ: {item.category}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAQ Stats */}
      <div className="mt-4 p-2 text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-700">
        {selectedCategory === 'すべて' 
          ? `全 ${faqItems.length} 件のFAQ`
          : `${selectedCategory}: ${faqItems.length} 件`
        }
      </div>
    </div>
  );
};

export default FAQ;