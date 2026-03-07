/**
 * Install App Button Component
 * 
 * Standalone button that triggers PWA installation
 * Can be placed anywhere in the app (navbar, dashboard, settings)
 * 
 * Features:
 * - Captures beforeinstallprompt event
 * - Shows only when app is installable
 * - Hides when app is already installed
 * - Provides visual feedback on install success
 */

import { useEffect, useState } from 'react';
import { Download, Check, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallAppButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function InstallAppButton({
  variant = 'default',
  size = 'default',
  showIcon = true,
  className,
  children,
}: InstallAppButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true);
      setIsInstallable(false);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('📱 PWA: beforeinstallprompt event fired');
      // Prevent default browser install prompt
      e.preventDefault();
      
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ PWA: App installed successfully');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      
      toast.success('App installed successfully!', {
        description: 'You can now access the app from your home screen.',
        duration: 5000,
      });
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.warn('PWA: No install prompt available');
      toast.error('Installation not available', {
        description: 'The app cannot be installed at this time.',
      });
      return;
    }

    try {
      setIsInstalling(true);

      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`PWA: User ${outcome} the install prompt`);

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        
        toast.success('Installing app...', {
          description: 'The app is being installed on your device.',
        });
      } else {
        toast.info('Installation cancelled', {
          description: 'You can install the app later from the menu.',
        });
      }

      // Clear the deferred prompt
      setDeferredPrompt(null);
    } catch (error) {
      console.error('PWA: Install failed:', error);
      toast.error('Installation failed', {
        description: 'Please try again or install from your browser menu.',
      });
    } finally {
      setIsInstalling(false);
    }
  };

  // Don't render if installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleInstallClick}
      disabled={isInstalling}
      className={cn('gap-2', className)}
      title="Install app on your device"
    >
      {showIcon && (
        isInstalling ? (
          <Download className="w-4 h-4 animate-bounce" />
        ) : (
          <Smartphone className="w-4 h-4" />
        )
      )}
      {children || (isInstalling ? 'Installing...' : 'Install App')}
    </Button>
  );
}

/**
 * Compact version for navbar/toolbar
 */
export function InstallAppButtonCompact() {
  return (
    <InstallAppButton
      variant="outline"
      size="sm"
      showIcon={true}
      className="hidden sm:flex"
    >
      Install
    </InstallAppButton>
  );
}

/**
 * Icon-only version for mobile
 */
export function InstallAppButtonIcon() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleClick = async () => {
    if (!deferredPrompt) return;
    
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install failed:', error);
    }
  };

  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      title="Install app"
      className="sm:hidden"
    >
      <Download className="w-5 h-5" />
    </Button>
  );
}

/**
 * Hook to check if app is installable
 * Useful for conditional rendering in other components
 */
export function useInstallable() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return { isInstallable, isInstalled };
}
