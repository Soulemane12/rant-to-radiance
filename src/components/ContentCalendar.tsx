import { useState } from "react";
import { generatedContent, contentStats, mockRant, ContentPiece } from "@/data/mockContent";
import ContentCard from "./ContentCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Clock, Sparkles, Calendar, Target } from "lucide-react";

interface SpicyMoment {
  timestamp: string;
  quote: string;
  reason?: string;
}

interface TikTokScript {
  id: string;
  type: 'tiktok';
  title: string;
  hook: string;
  content: string;
  day: number;
  time: string;
  tags: string[];
}

interface TwitterThread {
  id: string;
  type: 'twitter';
  title: string;
  template?: string;
  content: string;
  day: number;
  time: string;
  tags: string[];
}

interface LinkedInPost {
  id: string;
  type: 'linkedin';
  title: string;
  content: string;
  shareUrl?: string;
  day: number;
  time: string;
  tags: string[];
}

interface Newsletter {
  id: string;
  type: 'newsletter';
  title: string;
  content: string;
  day: number;
  time: string;
  tags: string[];
}

interface AnalysisResult {
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

interface ContentCalendarProps {
  analysis?: AnalysisResult;
}

const ContentCalendar = ({ analysis }: ContentCalendarProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Use provided analysis or fallback to mock data
  const displayRant = analysis || mockRant;

  // Use real generated content if available, otherwise use mock data
  const tiktokScripts = analysis?.generatedContent?.tiktok ||
    generatedContent.filter(c => c.type === 'tiktok');

  const twitterThreads = analysis?.generatedContent?.twitter ||
    generatedContent.filter(c => c.type === 'twitter');

  const linkedinPosts = analysis?.generatedContent?.linkedin ||
    generatedContent.filter(c => c.type === 'linkedin');

  const newsletters = analysis?.generatedContent?.newsletter ||
    generatedContent.filter(c => c.type === 'newsletter');

  // Combine all content
  const allContent = [
    ...tiktokScripts,
    ...twitterThreads,
    ...linkedinPosts,
    ...newsletters,
  ];

  const filterContent = (type: string): ContentPiece[] => {
    if (type === "all") return allContent as ContentPiece[];
    if (type === "tiktok") return tiktokScripts as ContentPiece[];
    if (type === "twitter") return twitterThreads as ContentPiece[];
    if (type === "linkedin") return linkedinPosts as ContentPiece[];
    if (type === "newsletter") return newsletters as ContentPiece[];
    return [];
  };

  const groupByDay = (content: ContentPiece[]) => {
    const days: { [key: number]: ContentPiece[] } = {};
    content.forEach(c => {
      if (!days[c.day]) days[c.day] = [];
      days[c.day].push(c);
    });
    return days;
  };

  // Calculate dynamic stats
  const tiktokCount = tiktokScripts.length;
  const twitterCount = twitterThreads.length;
  const linkedinCount = linkedinPosts.length;
  const newsletterCount = newsletters.length;
  const totalPieces = tiktokCount + twitterCount + linkedinCount + newsletterCount;

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-card/50">
      <div className="container mx-auto max-w-7xl">
        {/* Source Rant Card */}
        <Card className="mb-12 border-primary/30 bg-gradient-to-br from-primary/5 to-card">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm font-medium text-destructive">Source Recording</span>
            </div>
            <CardTitle className="text-2xl">{displayRant.title}</CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{displayRant.duration}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              {(analysis?.topics || mockRant.themes).map((theme, idx) => (
                <Badge key={idx} variant="secondary">
                  {theme}
                </Badge>
              ))}
            </div>

            {(analysis?.spicyMoments || mockRant.spicyMoments).length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Flame className="w-4 h-4 text-[hsl(349,100%,60%)]" />
                  <span>Spicy Moments Detected</span>
                </div>
                {(analysis?.spicyMoments || mockRant.spicyMoments).map((moment, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                    <Badge variant="outline" className="shrink-0">{moment.timestamp || moment.time}</Badge>
                    <p className="text-sm text-muted-foreground italic">"{moment.quote}"</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-foreground">{totalPieces}</div>
            <div className="text-sm text-muted-foreground">Total Pieces</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-[hsl(349,100%,60%)]">{tiktokCount}</div>
            <div className="text-sm text-muted-foreground">TikTok Scripts</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-[hsl(203,89%,53%)]">{twitterCount}</div>
            <div className="text-sm text-muted-foreground">Twitter Threads</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-[hsl(201,100%,35%)]">{linkedinCount}</div>
            <div className="text-sm text-muted-foreground">LinkedIn Posts</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-[hsl(142,71%,45%)]">{newsletterCount}</div>
            <div className="text-sm text-muted-foreground">Newsletter</div>
          </Card>
        </div>

        {/* Generation Stats */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8 p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Est. Reach:</span>
            <span className="font-semibold text-foreground">{contentStats.estimatedReach}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Generated in:</span>
            <span className="font-semibold text-foreground">{contentStats.timeToCreate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Content for:</span>
            <span className="font-semibold text-foreground">5 days</span>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-xl mx-auto mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="tiktok">TikTok</TabsTrigger>
            <TabsTrigger value="twitter">Twitter</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          </TabsList>

          {["all", "tiktok", "twitter", "linkedin", "newsletter"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              {Object.entries(groupByDay(filterContent(tab))).map(([day, content]) => (
                <div key={day} className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Day {day}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {content.map((piece) => (
                      <ContentCard
                        key={piece.id}
                        content={piece}
                        isExpanded={expandedId === piece.id}
                        onToggle={() => setExpandedId(expandedId === piece.id ? null : piece.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default ContentCalendar;
