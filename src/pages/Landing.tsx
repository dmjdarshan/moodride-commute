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
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-primary/20 to-metro/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-accent/20 to-bike/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-auto/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and branding */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 gradient-hero rounded-3xl blur-xl opacity-50 animate-pulse" />
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl gradient-hero shadow-glow">
              <Navigation className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-3">
            MoodRide
          </h1>
          <p className="text-muted-foreground text-lg font-medium tracking-wide">
            Your daily commute, decided for you.
          </p>
          
          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <span className="px-3 py-1.5 text-xs font-semibold bg-metro/10 text-metro rounded-full border border-metro/20">
              🚇 Metro
            </span>
            <span className="px-3 py-1.5 text-xs font-semibold bg-bike/10 text-bike rounded-full border border-bike/20">
              🏍️ Bike
            </span>
            <span className="px-3 py-1.5 text-xs font-semibold bg-auto/10 text-auto rounded-full border border-auto/20">
              🚕 Auto
            </span>
            <span className="px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary rounded-full border border-primary/20">
              🚗 Car
            </span>
          </div>
        </div>

        {/* Auth card */}
        <div className="relative animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 gradient-hero rounded-3xl blur-sm opacity-20" />
          <div className="relative glass-card rounded-3xl p-8 border border-primary/10">
            {/* Tabs */}
            <div className="flex bg-muted/50 rounded-2xl p-1.5 mb-8">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'login'
                    ? 'bg-card text-foreground shadow-lg shadow-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'signup'
                    ? 'bg-card text-foreground shadow-lg shadow-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={`h-14 text-base ${errors.loginEmail ? 'border-destructive' : ''}`}
                  />
                  {errors.loginEmail && (
                    <p className="text-destructive text-sm mt-1.5">{errors.loginEmail}</p>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={`h-14 text-base ${errors.loginPassword ? 'border-destructive pr-14' : 'pr-14'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  {errors.loginPassword && (
                    <p className="text-destructive text-sm mt-1.5">{errors.loginPassword}</p>
                  )}
                </div>
                <Button type="submit" variant="hero" size="xl" className="w-full">
                  Login
                </Button>
                <div className="pt-2 text-center">
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-xl py-2 px-4 inline-block">
                    Demo: <span className="font-mono text-foreground">test@moodride.com</span> / <span className="font-mono text-foreground">test123</span>
                  </p>
                </div>
              </form>
            )}

            {/* Signup Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-5 animate-fade-in">
                <div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className={`h-14 text-base ${errors.signupName ? 'border-destructive' : ''}`}
                  />
                  {errors.signupName && (
                    <p className="text-destructive text-sm mt-1.5">{errors.signupName}</p>
                  )}
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className={`h-14 text-base ${errors.signupEmail ? 'border-destructive' : ''}`}
                  />
                  {errors.signupEmail && (
                    <p className="text-destructive text-sm mt-1.5">{errors.signupEmail}</p>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className={`h-14 text-base ${errors.signupPassword ? 'border-destructive pr-14' : 'pr-14'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  {errors.signupPassword && (
                    <p className="text-destructive text-sm mt-1.5">{errors.signupPassword}</p>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className={`h-14 text-base ${errors.signupConfirmPassword ? 'border-destructive pr-14' : 'pr-14'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  {errors.signupConfirmPassword && (
                    <p className="text-destructive text-sm mt-1.5">{errors.signupConfirmPassword}</p>
                  )}
                </div>
                <Button type="submit" variant="hero" size="xl" className="w-full">
                  Create Account
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-center text-sm text-muted-foreground mt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          Smart commute decisions for Bangalore traffic
        </p>
      </div>
    </div>
  );
};

export default Landing;
