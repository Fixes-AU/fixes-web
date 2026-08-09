// fixes-web/app/blog/page.tsx
// Redirect to WordPress blog at blog.fixesau.com

import { redirect } from 'next/navigation'

export default function BlogPage() {
  redirect('https://blog.fixesau.com')
}
