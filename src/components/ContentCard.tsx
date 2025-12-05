import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Clock, Hash, ExternalLink, Mail, Send } from "lucide-react";
import { ContentPiece } from "@/data/mockContent";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [isSending, setIsSending] = useState(false);
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
    // LinkedIn doesn't support pre-filling post text via URL
    // Open the feed where users can paste the copied content
    window.open("https://www.linkedin.com/feed/", "_blank", "noopener,noreferrer");
  };

  const getCopyText = () => {
    if (content.type === "linkedin" && content.title) {
      return `${content.title}\n\n${content.content}`;
    }
    return content.content;
  };

  const sendNewsletter = async () => {
    if (!emailTo.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTo.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSending(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/send-newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailTo.trim(),
          subject: content.title || 'Newsletter from One-Take Studio',
          body: content.content,
          fromName: 'One-Take Studio',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send email');
      }

      toast.success("Newsletter sent successfully!", {
        description: `Email sent to ${emailTo}`,
      });
      setShowEmailDialog(false);
      setEmailTo("");
    } catch (error: any) {
      console.error('Send newsletter error:', error);
      toast.error(error.message || 'Failed to send newsletter');
    } finally {
      setIsSending(false);
    }
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

                  try {
                    await navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 3000);

                    // Show prominent toast notification
                    toast.success("Copied to clipboard!", {
                      description: "Opening LinkedIn... Click 'Start a post' and paste (Cmd+V or Ctrl+V)",
                      duration: 5000,
                    });

                    // Small delay to ensure copy completes and user sees the toast
                    setTimeout(() => {
                      openLinkedIn();
                    }, 800);
                  } catch (err) {
                    toast.error("Failed to copy to clipboard");
                  }
                }}
              >
                <ExternalLink className="w-3 h-3" />
                {copied ? "✓ Copied! Opening LinkedIn..." : "Share on LinkedIn"}
              </Button>
            )}
            {content.type === "newsletter" && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEmailDialog(true);
                }}
              >
                <Mail className="w-3 h-3" />
                Send Email
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={async (e) => {
                e.stopPropagation();
                const text = getCopyText();
                try {
                  await navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  toast.success("Copied to clipboard!");
                } catch (err) {
                  toast.error("Failed to copy to clipboard");
                }
              }}
              title="Copy to clipboard"
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
                try {
                  await navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  toast.success("TikTok script copied to clipboard!");
                } catch (err) {
                  toast.error("Failed to copy script");
                }
              }}
            >
              {copied ? "✓ Copied!" : "Copy Script"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )}

    {content.type === "newsletter" && (
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Send Newsletter
            </DialogTitle>
            <DialogDescription>
              Send this newsletter content via email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="recipient@example.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    sendNewsletter();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <p className="text-sm text-muted-foreground">
                {content.title || 'Newsletter from One-Take Studio'}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="rounded-md bg-muted p-3 max-h-[200px] overflow-y-auto">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">
                  {content.content}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowEmailDialog(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={sendNewsletter}
              disabled={isSending || !emailTo.trim()}
            >
              {isSending ? (
                <>
                  <Send className="w-4 h-4 mr-2 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
};

export default ContentCard;
