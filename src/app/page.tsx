
"use client";

import { useState, useEffect, useRef } from 'react';
import { preparePdfUrls } from '@/ai/flows/prepare-pdf-urls';
import { QuestionPaper, findPapersBySubject, checkServerStatus } from '@/lib/mock-data';
import { dataUriToUint8Array, mergePdfs } from '@/lib/pdf-utils';
import { useToast } from "@/hooks/use-toast";
import { useHistory } from '@/hooks/use-history';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Search, Download, Ghost, Loader2, AlertCircle, CheckSquare, Github, Linkedin, Instagram, Heart, X } from 'lucide-react';
import { HalloweenTheme } from '@/components/ui/halloween-theme';

const pdfCache = new Map<string, string>();

async function fetchPdfAsDataUriClient(url: string, signal?: AbortSignal): Promise<string> {
    if (pdfCache.has(url)) {
        return pdfCache.get(url)!;
    }
    const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`, { signal });
    if (!response.ok) {
        throw new Error(`Failed to fetch PDF from ${url}: ${response.statusText}`);
    }
    const blob = await response.blob();
    const dataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
    pdfCache.set(url, dataUri);
    return dataUri;
}


export default function Home() {
  const [subjectCode, setSubjectCode] = useState('');
  const [searchResults, setSearchResults] = useState<QuestionPaper[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [serverStatus, setServerStatus] = useState<'checking' | 'up' | 'down'>('checking');
  const abortControllerRef = useRef<AbortController | null>(null);
  const { addHistoryItem } = useHistory();


  useEffect(() => {
    const fetchServerStatus = async () => {
        const isUp = await checkServerStatus();
        setServerStatus(isUp ? 'up' : 'down');
    };
    fetchServerStatus();
  }, []);


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectCode) return;
    
    setIsSearching(true);
    setError(null);
    setGeneratedPdfUrl(null);
    setSelectedPapers(new Set());
    setSearchResults([]);

    try {
      const results = await findPapersBySubject(subjectCode);
      if (results.length === 0) {
        setError(`No question papers found for subject code "${subjectCode}". Check the code and try again.`);
      } else {
        setSearchResults(results);
      }
    } catch (err) {
      setError("Failed to fetch question papers. The source might be down or the subject code is incorrect.");
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSelectionChange = (paperId: string, isSelected: boolean) => {
    const newSelection = new Set(selectedPapers);
    if (isSelected) {
      newSelection.add(paperId);
    } else {
      newSelection.delete(paperId);
    }
    setSelectedPapers(newSelection);
    setGeneratedPdfUrl(null);
  };

  const handleSelectAll = () => {
    if (selectedPapers.size === searchResults.length) {
      // Deselect all
      setSelectedPapers(new Set());
    } else {
      // Select all
      const allPaperIds = new Set(searchResults.map(p => p.id));
      setSelectedPapers(allPaperIds);
    }
    setGeneratedPdfUrl(null);
  };

  const handleGeneratePdf = async () => {
    if (selectedPapers.size === 0) {
      setError("Please select at least one paper to generate a PDF.");
      return;
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setIsGenerating(true);
    setError(null);
    setGeneratedPdfUrl(null);
    setProgress({ current: 0, total: selectedPapers.size });

    try {
      const papersToMerge = searchResults.filter(p => selectedPapers.has(p.id));
      const paperUrls = papersToMerge.map(p => p.pdfUrl);
      
      const { pdfUrls } = await preparePdfUrls({ pdfUrls: paperUrls });

      const pdfDataUris: string[] = [];
      for (let i = 0; i < pdfUrls.length; i++) {
        if (signal.aborted) {
          throw new DOMException('Aborted by user', 'AbortError');
        }
        setProgress({ current: i + 1, total: pdfUrls.length });
        const dataUri = await fetchPdfAsDataUriClient(pdfUrls[i], signal);
        pdfDataUris.push(dataUri);
      }
      
      const mergedPdfUri = await mergePdfs(pdfDataUris);
      
      const blob = new Blob([dataUriToUint8Array(mergedPdfUri)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setGeneratedPdfUrl(url);

      addHistoryItem({
          id: Date.now().toString(),
          subjectCode: subjectCode.toUpperCase(),
          timestamp: new Date().toISOString(),
          paperUrls: pdfUrls,
          count: pdfUrls.length,
      });

      toast({
        title: "PDF Generated Successfully!",
        description: "Your merged PDF is ready for download.",
      });

    } catch (e: any) {
      if (e.name === 'AbortError') {
        toast({
          variant: "default",
          title: "Cancelled",
          description: "PDF generation was cancelled.",
        });
      } else {
        setError("Failed to generate PDF. Please try again.");
        console.error(e);
        toast({
          variant: "destructive",
          title: "Error Generating PDF",
          description: "An unexpected error occurred while creating your PDF.",
        });
      }
    } finally {
      setIsGenerating(false);
      setProgress({ current: 0, total: 0 });
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleDownload = () => {
    if (!generatedPdfUrl) return;
    const a = document.createElement('a');
    a.href = generatedPdfUrl;
    a.download = `${subjectCode.toUpperCase()}_PYQs_merged.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const allSelected = searchResults.length > 0 && selectedPapers.size === searchResults.length;

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-start bg-background font-body text-foreground overflow-hidden">
      <HalloweenTheme />
      <div className="container mx-auto max-w-3xl flex-grow p-4 md:p-8 z-10">
        <header className="flex flex-col items-center justify-center text-center py-8 md:py-12">
        <div className="flex items-center justify-center">
             <img
              src="/shrlogo.png"
              alt="Logo"
              width="100"
              height="40"
              className="mb-2"
            />
          </div>
          <p className="mt-2 text-md md:text-lg text-neutral-700 font-medium">Your one-stop solution for KTU question papers.</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-neutral-600">
                <span className="relative flex h-3 w-3">
                    {serverStatus === 'up' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${serverStatus === 'up' ? 'bg-green-500' : serverStatus === 'down' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                </span>
                <span>
                    {serverStatus === 'up' ? 'Server is Online' : serverStatus === 'down' ? 'Server is Offline' : 'Checking Server Status...'}
                </span>
            </div>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6 border-2 border-black neo-brutal-shadow">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="w-full rounded-xl border-2 border-black neo-brutal-shadow bg-white">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
              <Search className="h-5 w-5 md:h-6 md:w-6" />
              Find Question Papers
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-neutral-700">Enter a subject code to begin (e.g., CS301, MA201).</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="Enter Subject Code"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                className="text-base md:text-lg h-12 rounded-lg border-2 border-black focus:ring-primary/80 transition-all neo-brutal-shadow-sm"
                aria-label="Subject Code"
                disabled={serverStatus !== 'up'}
              />
              <Button type="submit" disabled={isSearching || !subjectCode || serverStatus !== 'up'} className="h-12 w-full sm:w-auto rounded-lg text-base md:text-lg bg-primary text-black border-2 border-black neo-brutal-shadow hover:bg-primary/90 active:translate-y-px active:neo-brutal-shadow-sm transition-all font-bold">
                {isSearching ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2" />}
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {(isSearching || searchResults.length > 0) && (
          <Card className="mt-8 rounded-xl border-2 border-black neo-brutal-shadow bg-white">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <Ghost className="h-5 w-5 md:h-6 md:w-6" />
                Search Results
              </CardTitle>
              <CardDescription className="text-sm md:text-base text-neutral-700">Select the papers you want to combine and download.</CardDescription>
            </CardHeader>
            <CardContent>
              {isSearching ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-2">
                      <Skeleton className="h-6 w-6 rounded-sm bg-neutral-300" />
                      <Skeleton className="h-6 flex-1 bg-neutral-300" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((paper) => (
                    <div key={paper.id} className="flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-green-100/50 border border-transparent hover:border-black/10">
                      <Checkbox
                        id={paper.id}
                        checked={selectedPapers.has(paper.id)}
                        onCheckedChange={(checked) => handleSelectionChange(paper.id, !!checked)}
                        aria-labelledby={`label-${paper.id}`}
                        className="h-5 w-5 rounded border-2 border-black"
                      />
                      <Label htmlFor={paper.id} id={`label-${paper.id}`} className="text-sm md:text-base font-normal cursor-pointer flex-grow">
                        {paper.subjectCode} - {paper.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 bg-neutral-100 p-4 rounded-b-xl border-t-2 border-black">
              {!isSearching && searchResults.length > 0 && (
                <Button onClick={handleSelectAll} variant="secondary" className="w-full sm:w-auto rounded-lg border-2 border-black neo-brutal-shadow-sm active:translate-y-px active:neo-brutal-shadow-none transition-all font-semibold">
                  <CheckSquare className="mr-2" />
                  {allSelected ? 'Deselect All' : 'Select All'}
                </Button>
              )}
              <div className="w-full sm:w-auto flex flex-col gap-2">
                <Button onClick={handleGeneratePdf} disabled={isGenerating || selectedPapers.size === 0} className="w-full sm:w-auto rounded-lg bg-primary text-black border-2 border-black neo-brutal-shadow hover:bg-primary/90 active:translate-y-px active:neo-brutal-shadow-sm transition-all font-bold">
                    {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Ghost className="mr-2" />}
                    {isGenerating ? `Fetching ${progress.current} of ${progress.total}...` : `Generate PDF (${selectedPapers.size})`}
                </Button>
                {isGenerating && (
                    <div className="flex items-center gap-2">
                        <Progress value={(progress.current / progress.total) * 100} className="w-full h-2 rounded-full bg-green-200 border border-black" />
                        <Button onClick={handleCancel} variant="destructive" size="sm" className="rounded-lg border-2 border-black neo-brutal-shadow-sm active:translate-y-px active:neo-brutal-shadow-none transition-all">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
              </div>
              {generatedPdfUrl && (
                <Button onClick={handleDownload} variant="outline" className="w-full sm:w-auto rounded-lg border-2 border-black neo-brutal-shadow-sm active:translate-y-px active:neo-brutal-shadow-none transition-all font-semibold">
                  <Download className="mr-2" />
                  Download Merged PDF
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </div>

      <footer className="w-full py-8 mt-12 z-10">
        <div className="container mx-auto max-w-3xl flex flex-col items-center gap-4 px-4 text-center">
            <div className="flex items-center gap-6">
                <a href="https://github.com/Sree14hari" target="_blank" rel="noopener noreferrer" className="text-black hover:text-primary transition-colors">
                    <Github className="h-7 w-7" />
                </a>
                <a href="https://www.linkedin.com/in/sree14hari" target="_blank" rel="noopener noreferrer" className="text-black hover:text-primary transition-colors">
                    <Linkedin className="h-7 w-7" />
                </a>
                <a href="https://www.instagram.com/s_ree.har_i" target="_blank" rel="noopener noreferrer" className="text-black hover:text-primary transition-colors">
                    <Instagram className="h-7 w-7" />
                </a>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
              <a href="upi://pay?pa=sreehari14shr@oksbi&pn=SREEHARI&aid=uGICAgMCOgPK9OA" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="rounded-lg border-2 border-black neo-brutal-shadow-sm active:translate-y-px active:neo-brutal-shadow-none font-semibold w-full sm:w-auto">
                  <Heart className="mr-2 h-4 w-4"/>
                  Donate
                </Button>
              </a>
            </div>
            <p className="text-sm text-neutral-600 mt-6">
              Built with ❤️ by Sreehari R
            </p>
        </div>
      </footer>
    </div>
  );
}
    

    




    

    

    

    