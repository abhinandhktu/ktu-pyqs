import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound } from 'next/navigation';

async function getNoteContent(slug: string) {
  const notesDirectory = path.join(process.cwd(), 'public', 'notes');
  const filePath = path.join(notesDirectory, `${slug}.md`);

  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    return {
      title: data.title || slug.replace(/-/g, ' '),
      content,
    };
  } catch (error) {
    return null;
  }
}

export default async function NotePage({ params }: { params: { slug: string } }) {
  const note = await getNoteContent(params.slug);

  if (!note) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-3xl flex-grow p-4 md:p-8">
      <article className="prose lg:prose-xl mx-auto bg-white p-8 rounded-xl border-2 border-black neo-brutal-shadow">
        <h1 className="font-headline">{note.title}</h1>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
      </article>
    </div>
  );
}

// Generate static paths for all notes at build time
export async function generateStaticParams() {
  const notesDirectory = path.join(process.cwd(), 'public', 'notes');
  try {
    const filenames = fs.readdirSync(notesDirectory);
    return filenames
      .filter((filename) => filename.endsWith('.md'))
      .map((filename) => ({
        slug: filename.replace('.md', ''),
      }));
  } catch (error) {
    console.error('Could not read notes directory for static generation:', error);
    return [];
  }
}
