import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

interface Verse {
  verse_number: number;
  verse: string;
}

export const loader: LoaderFunction = async () => {
  const translation = "kjv"; // Replace with the desired translation
  const book = "Genesis";
  const chapter = 6;

  try {
    const response = await fetch(`https://api.bible.berinaniesh.xyz/verses?translation=${translation}&book=${book}&chapter=${chapter}`);
    const verses: Verse[] = await response.json();
    return json({ verses });
  } catch (error) {
    console.error("Error fetching verses:", error);
    return json({ verses: [], error: "Failed to load verses" });
  }
};

export default function Verses() {
  const { verses, error } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Genesis Chapter 6</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 gap-4">
        {verses.map((verse) => (
          <div key={verse.verse_number} className="card">
            <h2 className="text-xl font-semibold">Verse {verse.verse_number}</h2>
            <p>{verse.verse}</p>
          </div>
        ))}
      </div>
    </div>
  );
}