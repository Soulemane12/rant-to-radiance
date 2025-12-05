import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileAudio, ArrowLeft, Mic, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ContentCalendar from './ContentCalendar';

interface SpicyMoment {
  timestamp: string;
  quote: string;
  reason?: string;
}

export interface TikTokScript {
  id: string;
  type: 'tiktok';
  title: string;
  hook: string;
  content: string;
  day: number;
  time: string;
  tags: string[];
}

export interface TwitterThread {
  id: string;
  type: 'twitter';
  title: string;
  template?: string;
  content: string;
  day: number;
  time: string;
  tags: string[];
}

export interface LinkedInPost {
  id: string;
  type: 'linkedin';
  title: string;
  content: string;
  shareUrl?: string;
  day: number;
  time: string;
  tags: string[];
}

export interface Newsletter {
  id: string;
  type: 'newsletter';
  title: string;
  content: string;
  day: number;
  time: string;
  tags: string[];
}

export interface AnalysisResult {
  title: string;
  duration: string;
  topics: string[];
  spicyMoments: SpicyMoment[];
  generatedContent?: {
    tiktok: TikTokScript[];
    twitter: TwitterThread[];
    linkedin: LinkedInPost[];
    newsletter: Newsletter[];
  };
}

interface AudioAnalyzerProps {
  onShowDemo?: () => void;
  onAnalysisComplete?: (analysis: AnalysisResult) => void;
  initialAnalysis?: AnalysisResult | null;
  onBack?: () => void;
}

export function AudioAnalyzer({
  onShowDemo,
  onAnalysisComplete,
  initialAnalysis,
  onBack,
}: AudioAnalyzerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(initialAnalysis || null);

  useEffect(() => {
    if (initialAnalysis) {
      setAnalysis(initialAnalysis);
    }
  }, [initialAnalysis]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysis(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    // Trigger the animation
    if (onShowDemo) {
      onShowDemo();
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('chunkDuration', '30');
    formData.append('usePauseBasedChunking', 'false');

    try {
      const response = await fetch('http://localhost:3001/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const result = await response.json();
      console.log('Server response:', result);

      if (result.success) {
        if (result.data?.analysis) {
          console.log('Analysis data:', result.data.analysis);
          console.log('Generated content:', result.data.generatedContent);

          // Combine analysis with generated content
          const fullAnalysis = {
            ...result.data.analysis,
            generatedContent: result.data.generatedContent,
          };

          setAnalysis(fullAnalysis);

          // Pass analysis back to parent
          if (onAnalysisComplete) {
            onAnalysisComplete(fullAnalysis);
          }

          toast.success('Analysis completed!');
        } else {
          console.warn('No analysis returned (Groq may have failed)');
          toast.warning('Transcription completed but AI analysis failed. Please try again.');
        }
      } else {
        console.error('Invalid response structure:', result);
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to analyze audio');
    } finally {
      setIsUploading(false);
    }
  };

  // Results view
  if (analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        {onBack && (
          <div className="container mx-auto max-w-7xl px-4 pt-8">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Button>
          </div>
        )}

        <ContentCalendar analysis={analysis} />

        <div className="container mx-auto max-w-7xl px-4 pb-12">
          <Button
            onClick={() => {
              setFile(null);
              setAnalysis(null);
              if (onBack) {
                onBack();
              }
            }}
            variant="outline"
            className="w-full max-w-md mx-auto block"
          >
            Analyze Another File
          </Button>
        </div>
      </div>
    );
  }

  // Upload view - full screen with gradient background
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background gradient matching Hero */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/5" />

      {/* Animated glow orbs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-chart-2/20 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="relative z-10 container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-6 shadow-sm">
            <Mic className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">AI-Powered Analysis</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Upload Your Rant
          </h1>
          <p className="text-lg text-muted-foreground">
            Drop your audio and let AI find the spicy moments
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-card/90 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileAudio className="w-5 h-5" />
              Select Audio File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Zone */}
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-12 text-center hover:border-primary/50 transition-all hover:bg-primary/5">
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-4"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <span className="text-lg font-medium text-foreground block mb-1">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </span>
                  {file ? (
                    <span className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      MP3, WAV, MP4 up to 100MB
                    </span>
                  )}
                </div>
              </label>
            </div>

            {/* Analyze Button */}
            {file && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full text-lg py-6"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze & Find Spicy Moments
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Your audio will be transcribed and analyzed for the most engaging moments
        </p>
      </div>
    </div>
  );
}
