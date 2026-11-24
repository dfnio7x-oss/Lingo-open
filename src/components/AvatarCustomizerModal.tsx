import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Image as ImageIcon, Link2, Upload, X } from 'lucide-react';
import { AVATAR_OPTIONS } from './avatarOptions';
import { soundEngine } from '../lib/sound';

interface AvatarCustomizerModalProps {
  currentAvatarId: string;
  currentCustomUrl?: string;
  soundEnabled: boolean;
  onSelectPreset: (avatarId: string) => void;
  onSelectCustomUrl: (url: string) => void;
  onClose: () => void;
}

type PickerTab = 'menu' | 'gallery' | 'url';

export function AvatarCustomizerModal({
  currentAvatarId,
  currentCustomUrl,
  soundEnabled,
  onSelectPreset,
  onSelectCustomUrl,
  onClose,
}: AvatarCustomizerModalProps) {
  const [tab, setTab] = useState<PickerTab>('menu');
  const [urlInput, setUrlInput] = useState(currentCustomUrl || '');
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUrlError('يرجى اختيار ملف صورة صالح (PNG أو JPG أو WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        soundEngine.playCorrect(soundEnabled, 1);
        onSelectCustomUrl(dataUrl);
        onClose();
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUrlError('يرجى إدخال رابط الصورة.');
      return;
    }
    if (!/^https?:\/\/.+/i.test(trimmed) && !trimmed.startsWith('data:image/')) {
      setUrlError('يجب أن يبدأ الرابط بـ https:// أو http://');
      return;
    }
    soundEngine.playCorrect(soundEnabled, 1);
    onSelectCustomUrl(trimmed);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="تخصيص الصورة الشخصية"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* الرأس */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-lg text-[var(--text-primary)]">
              تخصيص الصورة الشخصية
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {tab === 'menu'
                ? 'اختر الطريقة المناسبة لتعيين صورتك'
                : tab === 'gallery'
                ? 'اختر من معرض الصور الجاهزة'
                : 'ألصق رابط صورة مباشرة'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(soundEnabled);
              onClose();
            }}
            aria-label="إغلاق"
            className="w-10 h-10 rounded-2xl bg-[var(--bg-surface-muted)] hover:bg-[var(--border-subtle)] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {tab === 'menu' && (
            <div className="space-y-3">
              {/* خيار 1: رفع ملف */}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(soundEnabled);
                  fileInputRef.current?.click();
                }}
                className="w-full rounded-2xl p-4 bg-[var(--bg-surface-muted)] hover:bg-[#58CC02]/12 border-2 border-transparent hover:border-[#58CC02] flex items-center gap-4 text-right transition-all cursor-pointer"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#58CC02]/15 text-[#58CC02] flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-sm text-[var(--text-primary)]">
                    رفع ملف من الجهاز
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    اختر صورة مباشرة من جهازك
                  </div>
                </div>
              </button>

              {/* خيار 2: اختيار من المعرض */}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(soundEnabled);
                  setTab('gallery');
                }}
                className="w-full rounded-2xl p-4 bg-[var(--bg-surface-muted)] hover:bg-[#1CB0F6]/12 border-2 border-transparent hover:border-[#1CB0F6] flex items-center gap-4 text-right transition-all cursor-pointer"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#1CB0F6]/15 text-[#1CB0F6] flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-sm text-[var(--text-primary)]">
                    الاختيار من المعرض
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    تصفح الأيقونات والشخصيات المصممة
                  </div>
                </div>
              </button>

              {/* خيار 3: رابط صورة */}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(soundEnabled);
                  setUrlError(null);
                  setTab('url');
                }}
                className="w-full rounded-2xl p-4 bg-[var(--bg-surface-muted)] hover:bg-[#FF9600]/12 border-2 border-transparent hover:border-[#FF9600] flex items-center gap-4 text-right transition-all cursor-pointer"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#FF9600]/15 text-[#FF9600] flex items-center justify-center shrink-0">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-sm text-[var(--text-primary)]">
                    صورة عبر رابط URL
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    استخدم صورة من رابط إنترنت مباشر
                  </div>
                </div>
              </button>
            </div>
          )}

          {tab === 'gallery' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {AVATAR_OPTIONS.map((av) => {
                  const selected = !currentCustomUrl && currentAvatarId === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playCorrect(soundEnabled, 1);
                        onSelectPreset(av.id);
                        onClose();
                      }}
                      className={`relative rounded-2xl p-3 flex flex-col items-center gap-1.5 border-2 transition-all cursor-pointer ${
                        selected
                          ? 'border-[#58CC02] bg-[#58CC02]/10'
                          : 'border-[var(--border-subtle)] hover:border-[#1CB0F6]'
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden ${av.bg}`}
                      >
                        {av.image ? (
                          <img
                            src={av.image}
                            alt={av.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl">{av.emoji}</span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[var(--text-primary)] truncate w-full text-center">
                        {av.label}
                      </span>
                      {selected && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#58CC02] text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setTab('menu')}
                className="btn-3d-neutral w-full py-2.5 rounded-2xl text-xs font-extrabold cursor-pointer"
              >
                العودة للخيارات
              </button>
            </div>
          )}

          {tab === 'url' && (
            <form onSubmit={handleApplyUrl} className="space-y-4">
              <div>
                <label
                  htmlFor="avatar-url-input"
                  className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
                >
                  رابط الصورة
                </label>
                <input
                  id="avatar-url-input"
                  dir="ltr"
                  type="url"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setUrlError(null);
                  }}
                  placeholder="https://example.com/my-avatar.png"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] text-left focus:outline-none focus:ring-2 focus:ring-[#1CB0F6]"
                />
              </div>

              {urlInput.trim() && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-surface-muted)]">
                  <img
                    src={urlInput.trim()}
                    alt="معاينة الرابط"
                    referrerPolicy="no-referrer"
                    onError={() => setUrlError('تعذّر تحميل الصورة من هذا الرابط.')}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-200"
                  />
                  <span className="text-xs text-[var(--text-secondary)]">معاينة مباشرة</span>
                </div>
              )}

              {urlError && (
                <p className="text-xs font-bold text-[#FF4B4B]">{urlError}</p>
              )}

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setTab('menu')}
                  className="btn-3d-neutral flex-1 py-2.5 rounded-2xl text-xs font-extrabold cursor-pointer"
                >
                  رجوع
                </button>
                <button
                  type="submit"
                  className="btn-3d-green flex-1 py-2.5 rounded-2xl text-xs font-extrabold cursor-pointer"
                >
                  اعتماد الصورة
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
