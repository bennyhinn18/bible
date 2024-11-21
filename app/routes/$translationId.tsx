import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";

interface Book {
  id: string;
  name: string;
}

export const loader: LoaderFunction = async ({ params }) => {
  const { translationId } = params;
  try {
    const response = await fetch(`https://api.bible.berinaniesh.xyz/${translationId}/books`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const books: Book[] = await response.json();
    return json({ books, translationId });
  } catch (error) {
    console.error("Error fetching books:", error);
    return json({ books: [], translationId, error: "Failed to load books" });
  }
};

export default function Books() {
  const { books, translationId, error } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Books of the Bible</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {books.map((book) => (
          <Link key={book.id} to={`/chapters/${translationId}/${book.book}`}>
            <Card>
              <CardHeader>
                <CardTitle>{book.book_name}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

