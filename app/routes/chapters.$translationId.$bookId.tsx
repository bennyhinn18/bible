import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, useNavigate, useSearchParams, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Sun, Moon, Search, Globe, Volume2, ChevronLeft, ChevronRight, Home, BookAIcon, Calendar, SearchCodeIcon, Settings } from "lucide-react";

interface Chapter {
  id: string;
  number: number;
}

interface Verse {
  verse_number: number;
  verse: string;
}
const translations = [
  { id: "KJV", name: "King James Version" },
  { id: "TOVBSI", name: "The Orthodox Study Bible" },
  { id: "MLSVP", name: "Modern Language Study Version" },
  { id: "ASV", name: "American Standard Version" },
  { id: "WEB", name: "World English Bible" },
  { id: "WEBU", name: "World English Bible (Updated)" },
];


export const loader: LoaderFunction = async ({ params }) => {
  const { translationId, bookId } = params;
  try {
    const chapterCountResponse = await fetch(`https://api.bible.berinaniesh.xyz/chaptercount/${bookId}`);
    if (!chapterCountResponse.ok) {
      throw new Error(`HTTP error! status: ${chapterCountResponse.status}`);
    }
    const chapterCountData = await chapterCountResponse.json();
    const chapters: Chapter[] = Array.from({ length: chapterCountData.count }, (_, i) => ({
      id: `${bookId}-${i + 1}`,
      number: i + 1,
    }));
    return json({ chapters, translationId, bookId, bookName: bookId });
  } catch (error) {
    console.error("Error fetching chapter count:", error);
    return json({ chapters: [], translationId, bookId, bookName: "", error: "Failed to load chapters" });
  }
};

export default function Chapters() {
  const { chapters, translationId, bookId, bookName, error } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedChapter, setSelectedChapter] = useState<string | null>(searchParams.get("chapter") || "1");
  const [verses, setVerses] = useState<Verse[]>([]);
  const [versesError, setVersesError] = useState<string | null>(null);
  const [showChapterList, setShowChapterList] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showTranslationList, setShowTranslationList] = useState(false);

  useEffect(() => {
    if (selectedChapter) {
      fetch(`https://api.bible.berinaniesh.xyz/verses?translation=${translationId}&book=${bookId}&chapter=${selectedChapter}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => setVerses(data))
        .catch(error => {
          console.error("Error fetching verses:", error);
          setVersesError("Failed to load verses");
        });
    }
  }, [selectedChapter, translationId, bookId]);

  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapter(chapterId);
    setSearchParams({ chapter: chapterId });
    setShowChapterList(false);
    const progress = JSON.parse(localStorage.getItem('readProgress') || '{}');
    progress[`${translationId}-${bookId}-${chapterId}`] = true;
    localStorage.setItem('readProgress', JSON.stringify(progress));
    updateStreak();
  };

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastRead = localStorage.getItem('lastReadDate');
    const currentStreak = parseInt(localStorage.getItem('streak') || '0');

    if (lastRead === today) {
      // Already read today, do nothing
    } else if (lastRead === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
      // Read yesterday, increment streak
      localStorage.setItem('streak', (currentStreak + 1).toString());
    } else {
      // Streak broken, reset to 1
      localStorage.setItem('streak', '1');
    }

    localStorage.setItem('lastReadDate', today);
  };

  const goToNextChapter = () => {
    const currentIndex = chapters.findIndex(chapter => chapter.number.toString() === selectedChapter);
    if (currentIndex < chapters.length - 1) {
      handleChapterSelect((currentIndex + 2).toString());
    }
  };

  const goToPreviousChapter = () => {
    const currentIndex = chapters.findIndex(chapter => chapter.number.toString() === selectedChapter);
    if (currentIndex > 0) {
      handleChapterSelect(currentIndex.toString());
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleTranslationSelect = (translationId: string) => {
    setShowTranslationList(false);
    navigate(`/chapters/${translationId}/${bookId}?chapter=${selectedChapter}`);
  };

  return (
    <div className={`container mx-auto p-4 min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="flex justify-between items-center mb-4">
        <button className="p-2"><Volume2/></button>
        <div className="flex items-center space-x-2">
          <button onClick={goToPreviousChapter} className="text-2xl font-bold"><ChevronLeft/></button>
          <button onClick={() => setShowChapterList(!showChapterList)} className="text-lg font-bold">
            {bookName} {selectedChapter}
          </button>
          <button onClick={goToNextChapter} className="text-2xl font-bold"><ChevronRight/></button>
        </div>
        <div className="flex space-x-2">
          <button onClick={toggleTheme} className="p-2">
            {isDarkMode ? <Sun /> : <Moon />}
          </button>
          <button className="p-2"><Search/></button>
        <button onClick={() => setShowTranslationList(!showTranslationList)} className="p-2"><Globe/></button>
        {showTranslationList && (
          <div className={`fixed inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} bg-opacity-50 flex items-center justify-center z-50`}>
            <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-4 rounded-lg max-h-96 overflow-y-auto`}>
              <h2 className="text-xl font-bold mb-2">Select Translation</h2>
              <div className="grid grid-cols-2 gap-2">
                {translations.map((translation) => (
                  <button
                    key={translation.id}
                    onClick={() => handleTranslationSelect(translation.id)}
                    className={`p-2 rounded hover:bg-opacity-70 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {translation.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {showChapterList && (
        <div className={`fixed inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} bg-opacity-50 flex items-center justify-center z-50`}>
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-4 rounded-lg max-h-96 overflow-y-auto`}>
            <h2 className="text-xl font-bold mb-2">Select Chapter</h2>
            <div className="grid grid-cols-5 gap-2">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => handleChapterSelect(chapter.number.toString())}
                  className={`p-2 rounded hover:bg-opacity-70 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {chapter.number}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <Card className={`${isDarkMode ? 'bg-black' : 'bg-white'} border-none`}>
        <CardContent>
          {versesError ? (
            <p className="text-red-500">{versesError}</p>
          ) : (
            <div className="space-y-4">
              {verses.map((verse) => (
                <div key={verse.verse_number} className="flex space-x-4">
                  <span className={`font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{verse.verse_number}</span>
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{verse.verse}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <div className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'} flex justify-around p-2`}>
        <Button variant="ghost"><Home /></Button>
        <Button variant="ghost"><BookAIcon /></Button>
        <Button variant="ghost"><Calendar/></Button>
        <Button variant="ghost"><Search/></Button>
        <Button variant="ghost"><Settings/></Button>
      </div>
    </div>
  );
}

