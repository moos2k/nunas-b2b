'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const NAVY = '#0F172A'
const GOLD = '#C5A059'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function ShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  )
}

function PlusSquareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  )
}

export default function InstallPrompt() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] === 'ko' ? 'ko' : 'en'

  const [platform, setPlatform] = useState<'android' | 'ios' | null>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(true)
  const [showIosGuide, setShowIosGuide] = useState(false)

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    if (isStandalone) return
    if (localStorage.getItem('pwa-install-dismissed') === '1') return

    const ua = window.navigator.userAgent
    if (/iphone|ipad|ipod/i.test(ua)) {
      setPlatform('ios')
      setDismissed(false)
      return
    }
    if (/android/i.test(ua)) {
      setPlatform('android')
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
        setDismissed(false)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const dismiss = () => {
    setDismissed(true)
    setShowIosGuide(false)
    localStorage.setItem('pwa-install-dismissed', '1')
  }

  const handleInstallClick = async () => {
    if (platform === 'ios') {
      setShowIosGuide(true)
      return
    }
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      dismiss()
    }
  }

  if (dismissed || !platform) return null

  const t = {
    title: locale === 'ko' ? '앱처럼 간편하게 쓰기' : 'Use it like an app',
    body:
      locale === 'ko'
        ? '홈 화면에 추가하면 아이콘 하나로 바로 접속할 수 있어요.'
        : 'Add to your home screen for one-tap access.',
    install: locale === 'ko' ? '설치하기' : 'Install',
    later: locale === 'ko' ? '나중에' : 'Not now',
    guideTitle: locale === 'ko' ? '홈 화면에 추가하는 방법' : 'How to add to Home Screen',
    step1: locale === 'ko' ? '화면 아래(또는 위)의 공유 버튼을 누르세요' : 'Tap the Share button',
    step2: locale === 'ko' ? '"홈 화면에 추가"를 선택하세요' : 'Select "Add to Home Screen"',
    step3: locale === 'ko' ? '오른쪽 위 "추가"를 누르면 완료!' : 'Tap "Add" in the top right — done!',
    gotIt: locale === 'ko' ? '확인' : 'Got it',
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-pwa-banner">
        <div
          className="rounded-xl p-4 shadow-2xl flex items-start gap-3"
          style={{ background: NAVY, border: `1px solid ${GOLD}66` }}
        >
          <div
            className="w-11 h-11 rounded-full overflow-hidden shrink-0 animate-pwa-badge"
            style={{ background: '#F8F9FA' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-64.png" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{t.title}</p>
            <p className="text-xs mt-0.5" style={{ color: '#B8C1D1' }}>{t.body}</p>
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={handleInstallClick}
                className="text-xs font-bold uppercase tracking-wide px-5 py-2.5 rounded-lg"
                style={{ background: GOLD, color: NAVY }}
              >
                {t.install}
              </button>
              <button
                onClick={dismiss}
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: '#B8C1D1' }}
              >
                {t.later}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showIosGuide && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-semibold mb-5" style={{ color: NAVY }}>{t.guideTitle}</p>
            <ol className="space-y-4 text-sm text-[#45464d]">
              <li className="flex items-center gap-3"><ShareIcon />{t.step1}</li>
              <li className="flex items-center gap-3"><PlusSquareIcon />{t.step2}</li>
              <li className="flex items-center gap-3"><CheckIcon />{t.step3}</li>
            </ol>
            <button
              onClick={dismiss}
              className="mt-6 w-full text-xs font-semibold uppercase tracking-wide py-3 rounded text-white"
              style={{ background: NAVY }}
            >
              {t.gotIt}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
