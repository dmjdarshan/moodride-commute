import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.onboardingComplete) {
        navigate('/home');
      } else {
        navigate('/onboarding');
      }
    }
  }, [currentUser, navigate]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!validateEmail(loginEmail)) {
      newErrors.loginEmail = 'Please enter a valid email';
    }
    if (loginPassword.length < 6) {
      newErrors.loginPassword = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const success = login(loginEmail, loginPassword);
    if (success) {
      toast({ title: 'Welcome back!', description: 'Logged in successfully' });
    } else {
      setErrors({ loginEmail: 'Invalid email or password' });
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!signupName.trim()) {
      newErrors.signupName = 'Name is required';
    }
    if (!validateEmail(signupEmail)) {
      newErrors.signupEmail = 'Please enter a valid email';
    }
    if (signupPassword.length < 6) {
      newErrors.signupPassword = 'Password must be at least 6 characters';
    }
    if (signupPassword !== signupConfirmPassword) {
      newErrors.signupConfirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const success = signup(signupName, signupEmail, signupPassword);
    if (success) {
      toast({ title: 'Account created!', description: 'Let\'s personalize your experience' });
      navigate('/onboarding');
    } else {
      setErrors({ signupEmail: 'Email already exists' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and branding */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-hero shadow-glow mb-4">
            <Navigation className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            MoodRide
          </h1>
          <p className="text-muted-foreground text-lg">
            Your daily commute, decided for you.
          </p>
        </div>

        {/* Auth card */}
        <div className="glass-card rounded-2xl p-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          {/* Tabs */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'login'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === 'signup'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={errors.loginEmail ? 'border-destructive' : ''}
                />
                {errors.loginEmail && (
                  <p className="text-destructive text-sm mt-1">{errors.loginEmail}</p>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={errors.loginPassword ? 'border-destructive pr-12' : 'pr-12'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.loginPassword && (
                  <p className="text-destructive text-sm mt-1">{errors.loginPassword}</p>
                )}
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full">
                Login
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Demo: test@moodride.com / test123
              </p>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4 animate-fade-in">
              <div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className={errors.signupName ? 'border-destructive' : ''}
                />
                {errors.signupName && (
                  <p className="text-destructive text-sm mt-1">{errors.signupName}</p>
                )}
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className={errors.signupEmail ? 'border-destructive' : ''}
                />
                {errors.signupEmail && (
                  <p className="text-destructive text-sm mt-1">{errors.signupEmail}</p>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className={errors.signupPassword ? 'border-destructive pr-12' : 'pr-12'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.signupPassword && (
                  <p className="text-destructive text-sm mt-1">{errors.signupPassword}</p>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  className={errors.signupConfirmPassword ? 'border-destructive pr-12' : 'pr-12'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.signupConfirmPassword && (
                  <p className="text-destructive text-sm mt-1">{errors.signupConfirmPassword}</p>
                )}
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full">
                Sign Up
              </Button>
            </form>
          )}
        </div>

        {/* Features hint */}
        <div className="mt-8 flex justify-center gap-6 text-muted-foreground animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-metro/10 flex items-center justify-center">
              <span className="text-lg">🚇</span>
            </div>
            <span>Metro</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-bike/10 flex items-center justify-center">
              <span className="text-lg">🏍️</span>
            </div>
            <span>Bike</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-auto/10 flex items-center justify-center">
              <span className="text-lg">🚕</span>
            </div>
            <span>Auto</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
