'use client';

// Placeholder analytics hook for future integration with Plausible or other analytics
export function useAnalytics() {
  const trackEvent = (eventName: string, props?: Record<string, any>) => {
    // TODO: Integrate with Plausible or other analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventName, props);
    }

    // Example Plausible integration (uncomment when ready):
    // if (typeof window !== 'undefined' && window.plausible) {
    //   window.plausible(eventName, { props });
    // }
  };

  return { trackEvent };
}

// Utility hook for page view tracking
export function usePageView(pageName: string) {
  const { trackEvent } = useAnalytics();

  if (typeof window !== 'undefined') {
    trackEvent('pageview', { page: pageName });
  }
}
