import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { supabase } from './lib/supabase';

type Page = 'login' | 'onboarding' | 'dashboard';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const handlePageChange = () => {
      const path = window.location.pathname.slice(1) || 'login';
      setCurrentPage((path as Page) || 'login');
    };

    window.addEventListener('pagechange', handlePageChange);
    return () => window.removeEventListener('pagechange', handlePageChange);
  }, []);

  useEffect(() => {
    if (!user || loading) {
      setCheckingProfile(false);
      return;
    }

    const checkProfile = async () => {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        setUserProfile(data);

        if (!data) {
          window.history.pushState({ page: 'onboarding' }, '', '/onboarding');
          setCurrentPage('onboarding');
        } else if (data.onboarding_complete) {
          window.history.pushState({ page: 'dashboard' }, '', '/dashboard');
          setCurrentPage('dashboard');
        } else {
          window.history.pushState({ page: 'onboarding' }, '', '/onboarding');
          setCurrentPage('onboarding');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfile();
  }, [user, loading]);

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="pulse-soft text-2xl gradient-text from-pink-300 to-blue-300">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (currentPage === 'onboarding' && userProfile && !userProfile.onboarding_complete) {
    return <OnboardingPage />;
  }

  if (currentPage === 'dashboard' || currentPage === 'onboarding') {
    return <DashboardPage />;
  }

  return <LoginPage />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
