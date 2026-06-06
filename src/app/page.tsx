import { redirect } from 'next/navigation'

// 루트 접속 시 next-intl이 locale 감지 후 /en 또는 /ko로 리다이렉트
export default function RootPage() {
  redirect('/en')
}
