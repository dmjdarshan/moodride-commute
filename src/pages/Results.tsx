import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ExternalLink, Trophy, MapPin, Clock, IndianRupee, Smile, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RouteOption {
  mode: string;
  time: string;
  cost: string;
  stressLevel: string;
  reasoning: string;
}

interface ApiOutputItem {
  mode: string;
  time: string;
  cost: string;
  reasoning: string;
  stress: number;
  mvp: boolean;
}

interface ApiResponse {
  mvpOption: RouteOption;
  alternatives: RouteOption[];
}

const DUMMY_RESPONSE: ApiResponse = {
  mvpOption: {
    mode: "Metro + Rapido",
    time: "45 mins",
    cost: "₹85",
    stressLevel: "Low",
    reasoning: "Metro is most predictable during morning rush. Purple line to Whitefield, then Rapido for last mile."
  },
  alternatives: [
    {
      mode: "Bike",
      time: "35-60 mins",
      cost: "₹30",
      stressLevel: "Medium",
      reasoning: "Could be faster, but ORR traffic is unpredictable before 10 AM."
    },
    {
      mode: "Ola Cab",
      time: "55 mins",
      cost: "₹420",
      stressLevel: "Low",
      reasoning: "Most comfortable, but traffic makes it slower than metro."
    }
  ]
};

const Results: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedAlternative, setSelectedAlternative] = useState<number | null>(null);

  const { source, destination, apiResponse } = location.state || {};

  useEffect(() => {
    if (!source || !destination) {
      navigate('/home');
      return;
    }

    // Convert stress number (0-10) to stress level string
    const getStressLevelFromNumber = (stress: number): string => {
      if (stress <= 3) return 'Low';
      if (stress <= 6) return 'Medium';
      return 'High';
    };

    // Parse the new API format: { output: [{ mode, time, cost, reasoning, stress, mvp }] }
    const parseApiResponse = (response: any): ApiResponse => {
      if (response.output && Array.isArray(response.output)) {
        const items: ApiOutputItem[] = response.output;
        const mvpItem = items.find(item => item.mvp === true) || items[0];
        const alternativeItems = items.filter(item => item !== mvpItem);

        return {
          mvpOption: {
            mode: mvpItem.mode,
            time: mvpItem.time,
            cost: mvpItem.cost,
            reasoning: mvpItem.reasoning,
            stressLevel: getStressLevelFromNumber(mvpItem.stress)
          },
          alternatives: alternativeItems.map(item => ({
            mode: item.mode,
            time: item.time,
            cost: item.cost,
            reasoning: item.reasoning,
            stressLevel: getStressLevelFromNumber(item.stress)
          }))
        };
      }
      
      // Fallback to old format or dummy
      return {
        mvpOption: response.mvpOption || DUMMY_RESPONSE.mvpOption,
        alternatives: response.alternatives || DUMMY_RESPONSE.alternatives
      };
    };

    // Use API response if available, otherwise use dummy data
    if (apiResponse) {
      if (apiResponse.fallback || apiResponse.error) {
        setIsOffline(true);
      }
      const responseData = parseApiResponse(apiResponse);
      setData(responseData);
    } else {
      setIsOffline(true);
      setData(DUMMY_RESPONSE);
    }
  }, [source, destination, apiResponse, navigate]);

  const getStressIndicator = (level: string) => {
    const levels = {
      'Low': { circles: 2, color: 'bg-success' },
      'Medium': { circles: 3, color: 'bg-secondary' },
      'High': { circles: 4, color: 'bg-destructive' }
    };
    const config = levels[level as keyof typeof levels] || levels['Medium'];
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all",
              i <= config.circles ? config.color : "bg-muted"
            )}
          />
        ))}
      </div>
    );
  };

  const getModeEmoji = (mode: string) => {
    const modeStr = mode.toLowerCase();
    if (modeStr.includes('metro')) return '🚇';
    if (modeStr.includes('bike')) return '🏍️';
    if (modeStr.includes('car')) return '🚗';
    if (modeStr.includes('cab') || modeStr.includes('ola') || modeStr.includes('uber')) return '🚕';
    if (modeStr.includes('auto')) return '🛺';
    if (modeStr.includes('rapido')) return '🏍️';
    return '🚀';
  };

  const openGoogleMaps = () => {
    // Format: replace spaces with + and append Bengaluru, Karnataka for proper location
    const formatLocation = (loc: string) => {
      const fullLocation = `${loc}, Bengaluru, Karnataka`;
      return fullLocation.replace(/\s+/g, '+');
    };
    const url = `https://www.google.com/maps/dir/${formatLocation(source)}/${formatLocation(destination)}`;
    window.open(url, '_blank');
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto gradient-hero rounded-full animate-pulse-slow" />
          <p className="text-muted-foreground">Finding your best route...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center h-16 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="mr-3"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="truncate">{source}</span>
              <span className="text-muted-foreground">→</span>
              <span className="truncate">{destination}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Offline notice */}
      {isOffline && (
        <div className="bg-secondary/20 border-b border-secondary/30 px-4 py-2 text-center animate-slide-up">
          <div className="flex items-center justify-center gap-2 text-sm text-secondary-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>Using offline mode - API unavailable</span>
          </div>
        </div>
      )}

      <main className="container px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* MVP Option - Hero Card */}
        <div className="relative animate-scale-in">
          <div className="absolute -inset-0.5 gradient-hero rounded-2xl blur opacity-30" />
          <div className="relative bg-card rounded-2xl p-6 border border-primary/20 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                Best for you today
              </div>
            </div>
            
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl">{getModeEmoji(data.mvpOption.mode)}</div>
              <div className="flex-1">
                <h2 className="text-xl font-display font-bold text-foreground mb-1">
                  {data.mvpOption.mode}
                </h2>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {data.mvpOption.time}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <IndianRupee className="w-4 h-4" />
                    {data.mvpOption.cost.replace('₹', '')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Smile className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Stress:</span>
              {getStressIndicator(data.mvpOption.stressLevel)}
              <span className="text-sm text-muted-foreground">{data.mvpOption.stressLevel}</span>
            </div>

            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              {data.mvpOption.reasoning}
            </p>

            <Button 
              variant="hero" 
              size="lg" 
              className="w-full"
              onClick={() => openGoogleMaps()}
            >
              Open in Google Maps
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Alternatives */}
        <div className="space-y-4">
          <h3 className="text-lg font-display font-semibold text-foreground">
            Other options
          </h3>
          
          {data.alternatives.map((alt, index) => (
            <div
              key={index}
              className={cn(
                "bg-card rounded-xl p-5 border transition-all duration-300 animate-slide-up",
                selectedAlternative === index 
                  ? "border-accent shadow-lg shadow-accent/10" 
                  : "border-border hover:border-accent/50"
              )}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="text-3xl">{getModeEmoji(alt.mode)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{alt.mode}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                      Alternative
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {alt.time}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {alt.cost.replace('₹', '')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-muted-foreground">Stress:</span>
                {getStressIndicator(alt.stressLevel)}
              </div>

              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {alt.reasoning}
              </p>

              <Button 
                variant="outline" 
                size="default"
                className="w-full"
                onClick={() => {
                  setSelectedAlternative(index);
                  openGoogleMaps();
                }}
              >
                Choose this
              </Button>
            </div>
          ))}
        </div>

        {/* Plan another */}
        <Button
          variant="glass"
          size="xl"
          className="w-full animate-slide-up"
          style={{ animationDelay: '0.4s' }}
          onClick={() => navigate('/home')}
        >
          Plan Another Commute
        </Button>
      </main>
    </div>
  );
};

export default Results;
