import { Button } from "@/components/ui/button";
import { Mic, Zap, ArrowRight } from "lucide-react";

interface HeroProps {
  onStartDemo: () => void;
}

const Hero = ({ onStartDemo }: HeroProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/5" />
      
      {/* Animated glow orbs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-chart-2/20 rounded-full blur-3xl animate-pulse delay-700" />
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-8 shadow-sm">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">AI-Powered Content Engine</span>
        </div>
        
        {/* Main headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
          One Rant.
          <br />
          <span className="text-primary">A Week of Content.</span>
        </h1>
        
        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Record a 20-30 minute raw rant. Our AI explodes it into TikToks, Twitter threads, 
          LinkedIn posts, and newsletters—ready to schedule.
        </p>
        
        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">5</div>
            <div className="text-sm text-muted-foreground">TikTok Scripts</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">3</div>
            <div className="text-sm text-muted-foreground">Twitter Threads</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">2</div>
            <div className="text-sm text-muted-foreground">LinkedIn Posts</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">1</div>
            <div className="text-sm text-muted-foreground">Newsletter</div>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
            onClick={onStartDemo}
          >
            <Mic className="w-5 h-5 mr-2" />
            See the Magic
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
