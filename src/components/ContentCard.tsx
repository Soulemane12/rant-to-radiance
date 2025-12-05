import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Check, Clock, Hash, ExternalLink } from "lucide-react";
import { ContentPiece } from "@/data/mockContent";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  content: ContentPiece;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const platformConfig = {
  tiktok: {
    label: "TikTok",
    bgClass: "bg-[hsl(349,100%,60%)]/10",
    textClass: "text-[hsl(349,100%,60%)]",
    borderClass: "border-[hsl(349,100%,60%)]/30",
    icon: "📱"
  },
  twitter: {
    label: "Twitter/X",
    bgClass: "bg-[hsl(203,89%,53%)]/10",
    textClass: "text-[hsl(203,89%,53%)]",
    borderClass: "border-[hsl(203,89%,53%)]/30",
    icon: "🐦"
  },
  linkedin: {
    label: "LinkedIn",
    bgClass: "bg-[hsl(201,100%,35%)]/10",
    textClass: "text-[hsl(201,100%,35%)]",
    borderClass: "border-[hsl(201,100%,35%)]/30",
    icon: "💼"
  },
  newsletter: {
    label: "Newsletter",
    bgClass: "bg-[hsl(142,71%,45%)]/10",
    textClass: "text-[hsl(142,71%,45%)]",
    borderClass: "border-[hsl(142,71%,45%)]/30",
    icon: "📧"
  }
};

const formatTemplate = (template?: string) => {
  if (!template) return '';
  return template
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const ContentCard = ({ content, isExpanded, onToggle }: ContentCardProps) => {
  const [copied, setCopied] = useState(false);
  const [showFullScript, setShowFullScript] = useState(false);
  const config = platformConfig[content.type];
  const templateLabel = formatTemplate(content.template);

  const heroTweet = (() => {
    if (content.type !== "twitter") return "";
    // Use the full generated thread (including newlines) to prefill the intent URL.
    return content.content.trim();
  })();

  const postToX = (text: string) => {
    const base = "https://twitter.com/intent/tweet";
    const url = `${base}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openLinkedIn = () => {
    if (content.type !== "linkedin") return;
    const share =
      content.shareUrl ||
      import.meta.env.VITE_LINKEDIN_SHARE_URL ||
      "";
    const targetUrl = share
      ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(share)}`
      : "https://www.linkedin.com/feed/";
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const getCopyText = () => {
    if (content.type === "linkedin" && content.title) {
      return `${content.title}\n\n${content.content}`;
    }
    return content.content;
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(content.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-lg border",
        config.borderClass,
        isExpanded && "ring-2 ring-primary"
      )}
      onClick={onToggle}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <Badge variant="secondary" className={cn("mb-2", config.bgClass, config.textClass)}>
                {config.label}
              </Badge>
              <h3 className="font-semibold text-foreground line-clamp-1">{content.title}</h3>
              {templateLabel && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wide opacity-80">
                  {templateLabel} Template
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {content.type === "twitter" && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  postToX(heroTweet || content.content);
                }}
              >
                <ExternalLink className="w-3 h-3" />
                Post to X
              </Button>
            )}
            {content.type === "linkedin" && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1"
                onClick={async (e) => {
                  e.stopPropagation();
                  const text = getCopyText();
                  await navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  openLinkedIn();
                }}
              >
                <ExternalLink className="w-3 h-3" />
                Share on LinkedIn
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                const text = getCopyText();
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? (
                <Check className="w-4 h-4 text-[hsl(142,71%,45%)]" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {content.hook && (
          <p className="text-sm font-medium text-primary mb-3 italic">
            "{content.hook}"
          </p>
        )}
        
        <div className={cn(
          "text-sm text-muted-foreground whitespace-pre-wrap transition-all duration-300",
          !isExpanded && "line-clamp-3"
        )}>
          {content.content}
        </div>
        
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Day {content.day} • {content.time}</span>
          </div>
          
          {content.tags && content.tags.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Hash className="w-3 h-3" />
              <span>{content.tags.slice(0, 2).join(", ")}</span>
            </div>
          )}
        </div>
        
        {!isExpanded && (
          <p className="text-xs text-primary mt-2">Click to expand →</p>
        )}

        {content.type === "tiktok" && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={(e) => {
              e.stopPropagation();
              setShowFullScript(true);
            }}
          >
            View Full Script
          </Button>
        )}
      </CardContent>
    </Card>
    {content.type === "tiktok" && (
      <Dialog open={showFullScript} onOpenChange={setShowFullScript}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{content.title}</DialogTitle>
            <DialogDescription>
              Generated TikTok script with beats + shot notes.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-muted p-4 max-h-[60vh] overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap text-muted-foreground">
              {content.content}
            </pre>
          </div>
          <div className="flex justify-between gap-2 flex-wrap">
            <Badge variant="secondary">{content.tags?.slice(0, 3).join(" • ") || 'TikTok Script'}</Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                const text = getCopyText();
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              Copy Script
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
};

export default ContentCard;
