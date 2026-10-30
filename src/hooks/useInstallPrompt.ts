import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from '@/stores/useToastStore';

type InstallChoice = { outcome: 'accepted' | 'dismissed'; platform: string };

/** Chrome/Edge/Android fire this instead of exposing a declarative API. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

const DISMISS_KEY = 'nour:install-dismissed-at';
const DISMISS_MS = 30 * 24 * 60 * 60 * 1000;

export type InstallMode = 'prompt' | 'ios' | null;

function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone;
  return window.matchMedia('(display-mode: standalone)').matches || iosStandalone === true;
}

function isIos(): boolean {
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return true;
  // iPadOS 13+ advertises a desktop user agent but keeps touch support.
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

function readDismissed(): boolean {
  try {
    const at = Number(window.localStorage.getItem(DISMISS_KEY) ?? 0);
    return at > 0 && Date.now() - at < DISMISS_MS;
  } catch {
    return false;
  }
}

/**
 * Exposes the browser's install prompt, or share-sheet guidance on iOS where no
 * prompt exists. Dismissal is remembered for 30 days.
 */
export function useInstallPrompt() {
  const [mode, setMode] = useState<InstallMode>(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [dismissed, setDismissed] = useState(readDismissed);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    if (isIos()) setMode((current) => current ?? 'ios');

    const onPrompt = (event: Event) => {
      event.preventDefault();
      promptRef.current = event as BeforeInstallPromptEvent;
      setMode('prompt');
    };

    const onInstalled = () => {
      promptRef.current = null;
      setMode(null);
      setInstalled(true);
    };

    const media = window.matchMedia('(display-mode: standalone)');
    const onDisplayMode = () => {
      if (isStandalone()) onInstalled();
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    media.addEventListener('change', onDisplayMode);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      media.removeEventListener('change', onDisplayMode);
    };
  }, []);

  const install = useCallback(async () => {
    const event = promptRef.current;
    if (!event) return;

    await event.prompt();
    const choice = await event.userChoice;
    promptRef.current = null;

    if (choice.outcome === 'accepted') {
      setMode(null);
      toast.success('تم تثبيت التطبيق على جهازك.');
    }
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* Private mode: the banner simply returns next session. */
    }
  }, []);

  return {
    mode: dismissed || installed ? null : mode,
    install,
    dismiss,
  };
}
