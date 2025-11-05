
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

async function getNotes() {
  const notesDirectory = path.join(process.cwd(), 'public', 'notes');
  let filenames: string[] = [];

  try {
    filenames = fs.readdirSync(notesDirectory);
  } catch (error) {
    console.error("Could not read notes directory:", error);
    return [];
  }
  
  const notes = filenames
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => {
      const filePath = path.join(notesDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      const preview = content.split(' ').slice(0, 30).join(' ') + '...';

      return {
        slug: filename.replace('.md', ''),
        title: data.title || filename.replace('.md', ''),
        preview: data.description || preview,
      };
    });

  return notes;
}

export default async function NotesPage() {
  const notes = await getNotes();

  return (
    <div className="container mx-auto max-w-3xl flex-grow p-4 md:p-8">
      <header className="flex flex-col items-center justify-center text-center py-8 md:py-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">Special Notes</h1>
        <p className="mt-4 text-lg text-neutral-600">A collection of handcrafted notes and guides.</p>
      </header>

      {notes.length === 0 ? (
         <Card className="w-full rounded-xl border-2 border-black neo-brutal-shadow bg-white text-center">
            <CardHeader>
                <CardTitle>No Notes Yet!</CardTitle>
            </CardHeader>
            <CardContent>
                <p>There are no special notes available right now. Check back later!</p>
            </CardContent>
         </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-1">
          {notes.map((note) => (
            <Link href={`/notes/${note.slug}`} key={note.slug} className="block group">
                <Card className="w-full rounded-xl border-2 border-black neo-brutal-shadow bg-white hover:bg-green-100/50 transition-all hover:-translate-y-1 active:translate-y-px">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{note.title}</span>
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{note.preview}</CardDescription>
                  </CardContent>
                </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
