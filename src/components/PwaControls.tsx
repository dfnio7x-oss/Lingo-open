import { useEffect, useState } from 'react';
import { Download, Share, Smartphone, WifiOff } from 'lucide-react';
import { UiLanguage } from '../types/learning';
import { getUi } from '../lib/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    install,
  };
}

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return (
      <div className="rounded-2xl bg-[#58CC02]/10 border border-[#58CC02]/30 px-4 py-3 text-xs font-bold text-[#3f9400] dark:text-[#7CE826] flex items-center gap-2">
        <Smartphone className="w-4 h-4 shrink-0" />
        <span>مثبّت كتطبيق مستقل</span>
      </div>
    );
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className="btn-3d-green w-full py-3 px-4 rounded-2xl font-display font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        <Download className="w-4 h-4" />
        <span>تثبيت التطبيق على جهازك</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="btn-3d-blue w-full py-3 px-4 rounded-2xl font-display font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share className="w-4 h-4" />
          <span>التثبيت على iPhone / iPad</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-2xl space-y-3">
              <h3 className="font-display font-black text-lg text-[var(--text-primary)]">
                الإضافة إلى الشاشة الرئيسية
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                ١. اضغط على أيقونة <strong>مشاركة (Share)</strong> في شريط Safari.<br />
                ٢. مرّر للأسفل واختر <strong>إضافة إلى الشاشة الرئيسية</strong> لتشغيل التطبيق بملء الشاشة دون شريط المتصفح.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="btn-3d-neutral w-full py-2.5 rounded-2xl text-xs font-extrabold cursor-pointer"
              >
                فهمت
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="rounded-2xl bg-[var(--bg-surface-muted)] px-4 py-3 text-xs text-[var(--text-secondary)] leading-relaxed">
      استخدم خيار <strong>تثبيت التطبيق</strong> أو <strong>الإضافة إلى الشاشة الرئيسية</strong> من قائمة المتصفح لتشغيله دون شريط المتصفح.
    </div>
  );
}

export function OfflineIndicator({ uiLanguage = 'ar' }: { uiLanguage?: UiLanguage }) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-[#FF9600] px-4 py-2 text-xs font-extrabold text-white shadow-lg">
      <WifiOff className="w-3.5 h-3.5" />
      <span>{getUi(uiLanguage).offlineBanner}</span>
    </div>
  );
}
