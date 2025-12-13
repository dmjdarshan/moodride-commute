import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Bike, Car, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useApp, Persona } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const TOTAL_STEPS = 7;

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updatePersona, completeOnboarding } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [gmapsSuccess, setGmapsSuccess] = useState(false);
  
  // Form state
  const [commuteAssets, setCommuteAssets] = useState<('bike' | 'car')[]>([]);
  const [likesDrivingCar, setLikesDrivingCar] = useState<number>(2);
  const [likesRidingBike, setLikesRidingBike] = useState<number>(2);
  const [preferredMode, setPreferredMode] = useState<'bike' | 'car'>('bike');
  const [budgetVsConvenience, setBudgetVsConvenience] = useState([50]);
  const [ontimePreference, setOntimePreference] = useState([5]);
  const [gmapsConnected, setGmapsConnected] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    } else if (currentUser.onboardingComplete) {
      navigate('/home');
    }
  }, [currentUser, navigate]);

  const toggleAsset = (asset: 'bike' | 'car') => {
    setCommuteAssets(prev => 
      prev.includes(asset) 
        ? prev.filter(a => a !== asset)
        : [...prev, asset]
    );
  };

  const handleNext = () => {
    // Skip car/bike preference steps if not owned, skip preferred mode if only 1 asset
    let nextStep = currentStep + 1;
    if (currentStep === 1) {
      if (!commuteAssets.includes('car')) {
        nextStep = commuteAssets.includes('bike') ? 3 : 5;
      }
    } else if (currentStep === 2 && !commuteAssets.includes('bike')) {
      nextStep = commuteAssets.length > 1 ? 4 : 5;
    } else if (currentStep === 3) {
      // After bike preference, go to preferred mode only if >1 asset
      nextStep = commuteAssets.length > 1 ? 4 : 5;
    }
    setCurrentStep(Math.min(nextStep, TOTAL_STEPS));
  };

  const handleBack = () => {
    let prevStep = currentStep - 1;
    if (currentStep === 5) {
      // Going back from budget step
      if (commuteAssets.length > 1) {
        prevStep = 4; // Go to preferred mode
      } else if (commuteAssets.includes('bike')) {
        prevStep = 3;
      } else if (commuteAssets.includes('car')) {
        prevStep = 2;
      } else {
        prevStep = 1;
      }
    } else if (currentStep === 4) {
      if (commuteAssets.includes('bike')) {
        prevStep = 3;
      } else {
        prevStep = 2;
      }
    } else if (currentStep === 3 && !commuteAssets.includes('car')) {
      prevStep = 1;
    }
    setCurrentStep(Math.max(prevStep, 1));
  };

  const handleConnectGmaps = () => {
    setGmapsSuccess(true);
    setTimeout(() => {
      setGmapsConnected(true);
    }, 1000);
  };

  const handleComplete = () => {
    // If only one asset, set that as preferred mode automatically
    const finalPreferredMode = commuteAssets.length === 1 ? commuteAssets[0] : preferredMode;
    
    const persona: Persona = {
      commuteAssets,
      likesDrivingCar: likesDrivingCar >= 2,
      likesRidingBike: likesRidingBike >= 2,
      preferredMode: finalPreferredMode,
      budgetVsConvenience: budgetVsConvenience[0],
      ontimePreference: ontimePreference[0],
      gmapsConnected
    };
    updatePersona(persona);
    completeOnboarding();
    navigate('/home');
  };

  const canProceed = () => {
    if (currentStep === 1) return commuteAssets.length > 0;
    if (currentStep === 4) return commuteAssets.length > 0;
    return true;
  };

  const getActualSteps = () => {
    let steps = [1, 5, 6, 7];
    if (commuteAssets.includes('car')) steps.splice(1, 0, 2);
    if (commuteAssets.includes('bike')) steps.splice(commuteAssets.includes('car') ? 2 : 1, 0, 3);
    if (commuteAssets.length > 1) steps.splice(commuteAssets.length, 0, 4);
    return steps;
  };

  const preferenceOptions = [
    { value: 0, emoji: '🚫', label: 'Avoid if possible' },
    { value: 1, emoji: '😐', label: "Not really" },
    { value: 2, emoji: '👍', label: "It's okay" },
    { value: 3, emoji: '😍', label: 'Love it' },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                What do you own?
              </h2>
              <p className="text-muted-foreground">Select all that apply</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => toggleAsset('bike')}
                className={cn(
                  "p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3",
                  commuteAssets.includes('bike')
                    ? "border-bike bg-bike/10 shadow-lg shadow-bike/20"
                    : "border-border bg-card hover:border-bike/50"
                )}
              >
                <span className="text-5xl">🏍️</span>
                <span className="font-semibold text-foreground">Bike</span>
                {commuteAssets.includes('bike') && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-bike flex items-center justify-center">
                    <Check className="w-4 h-4 text-accent-foreground" />
                  </div>
                )}
              </button>
              <button
                onClick={() => toggleAsset('car')}
                className={cn(
                  "p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 relative",
                  commuteAssets.includes('car')
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <span className="text-5xl">🚗</span>
                <span className="font-semibold text-foreground">Car</span>
                {commuteAssets.includes('car') && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Do you enjoy driving your car?
              </h2>
            </div>
            <div className="space-y-3">
              {preferenceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setLikesDrivingCar(option.value)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4",
                    likesDrivingCar === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="font-medium text-foreground">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Do you enjoy riding your bike?
              </h2>
            </div>
            <div className="space-y-3">
              {preferenceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setLikesRidingBike(option.value)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4",
                    likesRidingBike === option.value
                      ? "border-bike bg-bike/10"
                      : "border-border bg-card hover:border-bike/50"
                  )}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="font-medium text-foreground">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                If you had to pick one?
              </h2>
              <p className="text-muted-foreground">Which would you prefer?</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {commuteAssets.map((asset) => (
                <button
                  key={asset}
                  onClick={() => setPreferredMode(asset)}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3",
                    preferredMode === asset
                      ? asset === 'bike' 
                        ? "border-bike bg-bike/10 shadow-lg shadow-bike/20"
                        : "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <span className="text-5xl">{asset === 'bike' ? '🏍️' : '🚗'}</span>
                  <span className="font-semibold text-foreground capitalize">{asset}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8 animate-slide-up">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Budget vs Convenience
              </h2>
              <p className="text-muted-foreground">How do you balance them?</p>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>💰 Save every rupee</span>
                <span>🛋️ Convenience matters</span>
              </div>
              <Slider
                value={budgetVsConvenience}
                onValueChange={setBudgetVsConvenience}
                max={100}
                step={1}
                className="py-4"
              />
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                  <span className="text-2xl">
                    {budgetVsConvenience[0] < 33 ? '💰' : budgetVsConvenience[0] < 66 ? '⚖️' : '🛋️'}
                  </span>
                  <span className="font-semibold text-foreground">
                    {budgetVsConvenience[0] < 33 ? 'Budget-focused' : budgetVsConvenience[0] < 66 ? 'Balanced' : 'Convenience-focused'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8 animate-slide-up">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                On-Time Importance
              </h2>
              <p className="text-muted-foreground">How important is reaching on time?</p>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>⏰ Flexible</span>
                <span>⏱️ Always on time</span>
              </div>
              <Slider
                value={ontimePreference}
                onValueChange={setOntimePreference}
                min={1}
                max={10}
                step={1}
                className="py-4"
              />
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                  <span className="text-3xl font-display font-bold text-primary">
                    {ontimePreference[0]}
                  </span>
                  <span className="font-medium text-foreground">/ 10</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Connect to Google Maps
              </h2>
              <p className="text-muted-foreground">For better route suggestions</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              {!gmapsSuccess ? (
                <>
                  <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-primary" />
                  </div>
                  <Button onClick={handleConnectGmaps} variant="hero" size="lg">
                    Connect Google Maps
                  </Button>
                  <button
                    onClick={() => setCurrentStep(TOTAL_STEPS + 1)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip for now
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 animate-scale-in">
                  <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center">
                    <Check className="w-12 h-12 text-success" />
                  </div>
                  <p className="font-semibold text-success">Connected successfully!</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6 animate-scale-in text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-display font-bold text-foreground">
              You're all set!
            </h2>
            <p className="text-muted-foreground">
              Your personalized commute experience awaits
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-4 bg-muted rounded-xl">
                <span className="text-2xl mb-2 block">
                  {commuteAssets.map(a => a === 'bike' ? '🏍️' : '🚗').join(' ')}
                </span>
                <span className="text-sm text-muted-foreground">Your rides</span>
              </div>
              <div className="p-4 bg-muted rounded-xl">
                <span className="text-2xl mb-2 block">
                  {budgetVsConvenience[0] < 33 ? '💰' : budgetVsConvenience[0] < 66 ? '⚖️' : '🛋️'}
                </span>
                <span className="text-sm text-muted-foreground">Priority</span>
              </div>
            </div>
            <Button onClick={handleComplete} variant="hero" size="xl" className="w-full mt-4">
              Start Commuting
            </Button>
          </div>
        );
    }
  };

  const progress = (currentStep / (TOTAL_STEPS + 1)) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      {/* Progress bar */}
      <div className="w-full max-w-md mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Step {Math.min(currentStep, TOTAL_STEPS)} of {TOTAL_STEPS}</span>
          <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full gradient-hero transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          {renderStep()}
        </div>
      </div>

      {/* Navigation */}
      {currentStep <= TOTAL_STEPS && (
        <div className="w-full max-w-md mx-auto flex gap-4 mt-8">
          {currentStep > 1 && (
            <Button variant="outline" size="lg" onClick={handleBack} className="flex-1">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
          )}
          <Button 
            variant="hero" 
            size="lg" 
            onClick={currentStep === 7 && gmapsConnected ? () => setCurrentStep(8) : handleNext}
            disabled={!canProceed()}
            className="flex-1"
          >
            {currentStep === 7 ? 'Continue' : 'Next'}
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
