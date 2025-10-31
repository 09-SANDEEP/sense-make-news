import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Search, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

type Verdict = "real" | "fake" | "unclear";

interface AnalysisResult {
  verdict: Verdict;
  confidence: number;
  explanation: string;
  keyIndicators: string[];
}

const Index = () => {
  const [newsText, setNewsText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeNews = async () => {
    if (!newsText.trim()) {
      toast({
        title: "Input Required",
        description: "Please paste some news content to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-news', {
        body: { text: newsText }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data as AnalysisResult);
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Unable to analyze the content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getVerdictColor = (verdict: Verdict) => {
    switch (verdict) {
      case "real":
        return "success";
      case "fake":
        return "destructive";
      case "unclear":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getVerdictIcon = (verdict: Verdict) => {
    switch (verdict) {
      case "real":
        return <CheckCircle2 className="h-6 w-6" />;
      case "fake":
        return <XCircle className="h-6 w-6" />;
      case "unclear":
        return <AlertCircle className="h-6 w-6" />;
      default:
        return null;
    }
  };

  const getVerdictText = (verdict: Verdict) => {
    switch (verdict) {
      case "real":
        return "Likely Real News";
      case "fake":
        return "Likely Fake News";
      case "unclear":
        return "Unclear / Needs Verification";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5 border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Fake News Detector
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced AI-powered analysis to help you identify misinformation and verify news authenticity
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Input Section */}
          <Card className="p-6 md:p-8 shadow-card">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Paste News Here</h2>
              </div>
              <Textarea
                placeholder="Paste the news article, headline, or social media post you want to verify..."
                value={newsText}
                onChange={(e) => setNewsText(e.target.value)}
                className="min-h-[200px] resize-none text-base"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{newsText.length} characters</span>
                <span>Minimum 50 characters recommended</span>
              </div>
              <Button
                onClick={analyzeNews}
                disabled={isAnalyzing}
                size="lg"
                className="w-full md:w-auto"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Analyze Content
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Results Section */}
          {result && (
            <Card className="p-6 md:p-8 shadow-elevated animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Analysis Results</h2>

                {/* Verdict */}
                <div className="flex items-center gap-4 p-6 bg-muted/50 rounded-lg">
                  <div className={`text-${getVerdictColor(result.verdict)}`}>
                    {getVerdictIcon(result.verdict)}
                  </div>
                  <div className="flex-1">
                    <Badge variant={getVerdictColor(result.verdict)} className="text-sm px-3 py-1">
                      {getVerdictText(result.verdict)}
                    </Badge>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Confidence Score</span>
                    <span className="text-2xl font-bold">{result.confidence}%</span>
                  </div>
                  <Progress value={result.confidence} className="h-3" />
                </div>

                {/* Explanation */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Explanation</h3>
                  <p className="text-muted-foreground leading-relaxed">{result.explanation}</p>
                </div>

                {/* Key Indicators */}
                {result.keyIndicators && result.keyIndicators.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Key Indicators</h3>
                    <ul className="space-y-2">
                      {result.keyIndicators.map((indicator, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-muted-foreground">{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            This tool uses AI analysis and should be used as one of many resources for verifying information.
            Always cross-reference with trusted news sources.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
