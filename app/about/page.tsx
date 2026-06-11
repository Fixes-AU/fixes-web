// fixes-web/app/about/page.tsx

import { redirect } from 'next/navigation'

export default function AboutRedirect() {
  redirect('/about-us')
}
