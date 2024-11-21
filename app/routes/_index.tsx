import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";

interface Translation {
  id: string;
  language: string;
  version: string;
}

export const loader: LoaderFunction = async () => {
  try {
    const response = await fetch("https://api.bible.berinaniesh.xyz/translations");
    const translations: Translation[] = await response.json();
    return json({ translations });
  } catch (error) {
    console.error("Error fetching translations:", error);
    return json({ translations: [], error: "Failed to load translations" });
  }
};

export default function Index() {
  const { translations, error } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Personal Bible App</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span>Streak: 0 days</span>
            <span>0% completed</span>
          </div>
          <Progress value={0} className="w-full" />
        </CardContent>
      </Card>
      <h2 className="text-2xl font-semibold mb-4">Bible Translations</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {translations.map((translation) => (
          <Card key={translation.id}>
            <CardHeader>
              <CardTitle>{translation.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Language: {translation.language}</p>
              <Link to={`${translation.name}`}>
                <Button className="mt-2">Read</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <Link to="/progress">
        <Button className="mt-6">View Reading Progress</Button>
      </Link>
    </div>
  );
}

