import { useCallback } from 'react';

type Page = 'login' | 'onboarding' | 'dashboard';

export const useNavigate = () => {
  return useCallback((page: Page) => {
    window.history.pushState({ page }, '', `/${page}`);
    window.dispatchEvent(new Event('pagechange'));
  }, []);
};
