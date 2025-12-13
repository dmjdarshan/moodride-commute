import React, { useState, useEffect } from 'react';
import { X, LogOut, Check, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useApp, Persona } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentUser, logout, updatePersona } = useApp();
  
  const [commuteAssets, setCommuteAssets] = useState<('bike' | 'car')[]>([]);
  const [likesDrivingCar, setLikesDrivingCar] = useState(2);
  const [likesRidingBike, setLikesRidingBike] = useState(2);
  const [preferredMode, setPreferredMode] = useState<'bike' | 'car'>('bike');
  const [budgetVsConvenience, setBudgetVsConvenience] = useState([50]);
  const [ontimePreference, setOntimePreference] = useState([5]);

  useEffect(() => {
    if (currentUser?.persona) {
      setCommuteAssets(currentUser.persona.commuteAssets);
      setLikesDrivingCar(currentUser.persona.likesDrivingCar ? 2 : 1);
      setLikesRidingBike(currentUser.persona.likesRidingBike ? 2 : 1);
      setPreferredMode(currentUser.persona.preferredMode);
      setBudgetVsConvenience([currentUser.persona.budgetVsConvenience]);
      setOntimePreference([currentUser.persona.ontimePreference]);
    }
  }, [currentUser]);

  const toggleAsset = (asset: 'bike' | 'car') => {
    setCommuteAssets(prev => {
      const newAssets = prev.includes(asset)
        ? prev.filter(a => a !== asset)
        : [...prev, asset];
      return newAssets.length > 0 ? newAssets : prev;
    });
  };

  const handleSave = () => {
    if (!currentUser?.persona) return;
    
    const updatedPersona: Persona = {
      ...currentUser.persona,
      commuteAssets,
      likesDrivingCar: likesDrivingCar >= 2,
      likesRidingBike: likesRidingBike >= 2,
      preferredMode: commuteAssets.includes(preferredMode) ? preferredMode : commuteAssets[0],
      budgetVsConvenience: budgetVsConvenience[0],
      ontimePreference: ontimePreference[0]
    };
    
    updatePersona(updatedPersona);
    toast({ title: 'Settings saved', description: 'Your preferences have been updated' });
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center">
        <div className="bg-card rounded-t-3xl md:rounded-2xl w-full md:max-w-md max-h-[85vh] overflow-hidden animate-slide-up shadow-xl">
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-foreground">Settings</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6 space-y-6">
            {/* User info */}
            <div className="text-center pb-4 border-b border-border">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full gradient-hero flex items-center justify-center text-2xl text-primary-foreground font-bold">
                {currentUser?.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-foreground">{currentUser?.name}</h3>
              <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
            </div>

            {/* Commute Assets */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">What do you own?</label>
              <div className="grid grid-cols-2 gap-3">
                {(['bike', 'car'] as const).map((asset) => (
                  <button
                    key={asset}
                    onClick={() => toggleAsset(asset)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3",
                      commuteAssets.includes(asset)
                        ? asset === 'bike' 
                          ? "border-bike bg-bike/10"
                          : "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/30"
                    )}
                  >
                    <span className="text-2xl">{asset === 'bike' ? '🏍️' : '🚗'}</span>
                    <span className="font-medium text-foreground capitalize">{asset}</span>
                    {commuteAssets.includes(asset) && (
                      <Check className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget vs Convenience */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">Budget vs Convenience</label>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>💰 Budget</span>
                <span>🛋️ Convenience</span>
              </div>
              <Slider
                value={budgetVsConvenience}
                onValueChange={setBudgetVsConvenience}
                max={100}
                step={1}
              />
            </div>

            {/* On-Time Preference */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">On-time importance: {ontimePreference[0]}/10</label>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>⏰ Flexible</span>
                <span>⏱️ Always on time</span>
              </div>
              <Slider
                value={ontimePreference}
                onValueChange={setOntimePreference}
                min={1}
                max={10}
                step={1}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-card border-t border-border p-4 space-y-3">
            <Button variant="hero" size="lg" className="w-full" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" size="lg" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
