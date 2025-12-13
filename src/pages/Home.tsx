import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Navigation, Loader2, Train, Bike, Car, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import SettingsModal from '@/components/SettingsModal';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Priority = 'ontime' | 'budget' | 'convenience';
type TransportMode = 'bike' | 'car' | 'metro' | 'cab' | 'any';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  
  // Form state
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [preferredMode, setPreferredMode] = useState<TransportMode>('any');
  const [priority, setPriority] = useState<Priority>('ontime');
  const [extraNotes, setExtraNotes] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    } else if (!currentUser.onboardingComplete) {
      navigate('/onboarding');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !destination) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('decide-commute', {
        body: {
          source,
          destination,
          preferredMode,
          priority,
          extraNotes,
          persona: currentUser?.persona,
          email: {
            send: sendEmail,
            address: currentUser?.email || ''
          }
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast({
          title: "API Error",
          description: "Failed to get commute recommendations. Using offline mode.",
          variant: "destructive"
        });
      }

      // Navigate to results with API response data
      navigate('/results', {
        state: {
          source,
          destination,
          preferredMode,
          priority,
          extraNotes,
          persona: currentUser?.persona,
          apiResponse: data
        }
      });
    } catch (err) {
      console.error('Error calling decide-commute:', err);
      toast({
        title: "Connection Error",
        description: "Could not reach the server. Using offline mode.",
        variant: "destructive"
      });
      
      // Navigate with no API response (will use dummy data)
      navigate('/results', {
        state: {
          source,
          destination,
          preferredMode,
          priority,
          extraNotes,
          persona: currentUser?.persona
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getModeOptions = () => {
    const options: { value: TransportMode; icon: React.ReactNode; label: string; color: string }[] = [];
    const userAssets = currentUser?.persona?.commuteAssets || [];
    
    // Add user's owned assets first
    if (userAssets.includes('bike')) {
      options.push({ value: 'bike', icon: <span className="text-xl">🏍️</span>, label: 'Bike', color: 'bike' });
    }
    if (userAssets.includes('car')) {
      options.push({ value: 'car', icon: <span className="text-xl">🚗</span>, label: 'Car', color: 'primary' });
    }
    
    // Always show metro, cab and any options
    options.push(
      { value: 'metro', icon: <span className="text-xl">🚇</span>, label: 'Metro', color: 'metro' },
      { value: 'cab', icon: <span className="text-xl">🚕</span>, label: 'Cab/Auto', color: 'auto' },
      { value: 'any', icon: <Sparkles className="w-5 h-5" />, label: 'Any', color: 'accent' }
    );
    
    return options;
  };

  const priorityOptions = [
    { value: 'ontime' as Priority, icon: '⏰', label: 'On-time' },
    { value: 'budget' as Priority, icon: '💰', label: 'Budget' },
    { value: 'convenience' as Priority, icon: '🛋️', label: 'Convenience' },
  ];

  const isFormValid = source && destination && source !== destination;

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-lg shadow-primary/20">
              <Navigation className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-foreground">MoodRide</h1>
              <p className="text-xs text-muted-foreground">Hi, {currentUser.name}!</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location inputs */}
          <div className="space-y-4 animate-slide-up">
            <LocationAutocomplete
              value={source}
              onChange={setSource}
              label="From 📍"
              placeholder="Enter starting point"
              excludeLocation={destination}
            />
            <LocationAutocomplete
              value={destination}
              onChange={setDestination}
              label="To 📍"
              placeholder="Enter destination"
              excludeLocation={source}
            />
          </div>

          {/* Preferred Mode */}
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <label className="block text-sm font-medium text-foreground">
              Preferred mode today
            </label>
            <div className="flex flex-wrap gap-2">
              {getModeOptions().map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPreferredMode(option.value)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-300",
                    preferredMode === option.value
                      ? `border-${option.color} bg-${option.color}/10 shadow-md`
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  {option.icon}
                  <span className="text-sm font-medium text-foreground">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Today's Priority */}
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <label className="block text-sm font-medium text-foreground">
              What matters most today?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300",
                    priority === option.value
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-sm font-medium text-foreground">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Extra Notes */}
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <label className="block text-sm font-medium text-foreground">
              Anything else? (optional)
            </label>
            <Textarea
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value.slice(0, 200))}
              placeholder="E.g., 'It might rain', 'I have a meeting at 10 AM', 'Feeling tired today'"
              className="min-h-[80px] resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {extraNotes.length}/200
            </p>
          </div>

          {/* Send Email Checkbox */}
          <div className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.22s' }}>
            <Checkbox
              id="send-email"
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(checked === true)}
            />
            <label
              htmlFor="send-email"
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              Send results to my email ({currentUser?.email})
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="hero"
            size="xl"
            className="w-full animate-slide-up"
            style={{ animationDelay: '0.25s' }}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Agent is analyzing...
              </>
            ) : (
              <>
                Find My Best Route
                <span className="text-lg">🚀</span>
              </>
            )}
          </Button>
        </form>
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
};

export default Home;
