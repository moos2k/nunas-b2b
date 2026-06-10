import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

// 루트(/) 접속 시 브라우저 언어를 감지해 /ko 또는 /en으로 리다이렉트
export default async function RootPage() {
  const acceptLanguage = (await headers()).get('accept-language') ?? ''
  // 한국어 브라우저면 ko, 그 외에는 en
  const isKorean = acceptLanguage.toLowerCase().includes('ko')
  redirect(isKorean ? '/ko' : '/en')
}
