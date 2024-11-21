// app/routes/read.$translations.$book.$chapter.tsx
import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const API_BASE_URL = 'https://api.bible.berinaniesh.xyz';

export const loader: LoaderFunction = async ({ params }) => {
  const { translations, book, chapter } = params;
  const translationIds = translations?.split(',') || [];
  const versesPromises = translationIds.map(id => 
    axios.get(`${API_BASE_URL}/translations/${id}/books/${book}/chapters/${chapter}`)
  );
  const versesResponses = await Promise.all(versesPromises);
  const verses = versesResponses.map(response => response.data);

  return json({ verses, translations: translationIds, book, chapter });
};

export default function ReadChapter() {
  const { verses, translations, book, chapter } = useLoaderData<{ verses: any[], translations: string[], book: string, chapter: string }>();
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Load streak from localStorage
    const savedStreak = localStorage.getItem('streak');
    const lastReadDate = localStorage.getItem('lastReadDate');
    const today = new Date().toDateString();

    if (savedStreak && lastReadDate) {
      if (lastReadDate === today) {
        setStreak(parseInt(savedStreak));
      } else if (new Date(lastReadDate).getTime() + 86400000 >= new Date().getTime()) {
        // If last read was yesterday, increment streak
        setStreak(parseInt(savedStreak) + 1);
      } else {
        // Reset streak if more than a day has passed
        setStreak(1);
      }
    } else {
      setStreak(1);
    }
  }, []);

  const markAsCompleted = () => {
    setCompleted(true);
    // Save streak and last read date to localStorage
    localStorage.setItem('streak', streak.toString());
    localStorage.setItem('lastReadDate', new Date().toDateString());
    // Here you would also update the user's progress in your database
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">{book} - Chapter {chapter}</h1>
      
      <div className="grid gap-4">
        {verses[0].map((verse: any, index: number) => (
          <div key={verse.verse} className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Verse {verse.verse}</h3>
            {translations.map((translation, tIndex) => (
              <p key={translation} className={tIndex > 0 ? 'mt-2 pt-2 border-t' : ''}>
                <span className="font-medium">{translation}: </span>
                {verses[tIndex][index].text}
              </p>
            ))}
          </div>
        ))}
      </div>

      {!completed && (
        <button
          onClick={markAsCompleted}
          className="mt-4 bg-green-500 text-white p-4 rounded-lg shadow hover:bg-green-600 transition-colors flex items-center"
        >
          <CheckCircle className="w-6 h-6 mr-2" />
          Mark as Completed
        </button>
      )}

      {completed && (
        <div className="mt-4 bg-blue-500 text-white p-4 rounded-lg shadow">
          Chapter completed! Your streak is now {streak} days.
        </div>
      )}
    </div>
  );
}