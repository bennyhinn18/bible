// app/routes/progress.tsx
import { useState, useEffect } from 'react';
import { CheckCircle, Book } from 'lucide-react';

export default function Progress() {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Load progress and streak from localStorage
    const savedProgress = localStorage.getItem('progress');
    const savedStreak = localStorage.getItem('streak');
    
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
    
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }
  }, []);

  const totalBooks = 66; // Assuming a standard Bible with 66 books
  const completedBooks = Object.values(progress).filter(chapters => chapters === 0).length;
  const overallProgress = (completedBooks / totalBooks) * 100;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Reading Progress</h1>
      
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">Overall Progress</h2>
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${overallProgress}%` }}></div>
          </div>
          <span>{overallProgress.toFixed(1)}%</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">Current Streak</h2>
        <div className="flex items-center">
          <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
          <span>{streak} days</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-2">Books Completed</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(progress).map(([book, chapters]) => (
            <div key={book} className={`p-2 rounded-lg flex items-center ${chapters === 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Book className={`w-5 h-5 mr-2 ${chapters === 0 ? 'text-green-500' : 'text-gray-500'}`} />
              <span>{book}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}