// fixes-web/app/blog/page.tsx
 
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Manrope } from 'next/font/google'
import { Header, Footer } from '@/components/upwork'
import { ArrowRight, Clock } from 'lucide-react'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['700'],
})

export const metadata: Metadata = {
  title: 'Blog | Fixes — News, Updates & Insights',
  description:
    'Stay up to date with the latest Fixes news, product updates, tradie tips, and industry insights from Australia\'s AI-powered tradie marketplace.',
}

const featuredPost = {
  title: 'How AI Is Transforming the Way Australians Hire Tradies',
  excerpt:
    'From instant quoting to smart job matching — discover how Fixes is using artificial intelligence to create a faster, fairer, and more transparent experience for homeowners and tradies alike.',
  category: 'Product',
  date: 'June 10, 2026',
  readTime: '6 min read',
  image: '/about-page-assets/community-impact.jpg',
}

const posts = [
  {
    title: 'Fixes Expands to New Zealand — Here\'s What It Means for Kiwi Tradies',
    excerpt: 'Auckland and Wellington are now live on the Fixes platform. Learn about our expansion plans and what NZ tradies can expect.',
    category: 'Announcement',
    date: 'May 28, 2026',
    readTime: '4 min read',
  },
  {
    title: '5 Things Every Homeowner Should Know Before Hiring a Tradie',
    excerpt: 'From checking licences to understanding quotes — our essential guide to finding the right tradie for your next project.',
    category: 'Tips',
    date: 'May 15, 2026',
    readTime: '5 min read',
  },
  {
    title: 'Meet the Fixers: How Sarah Built a $200K Plumbing Business on Fixes',
    excerpt: 'From solo operator to a team of four — Sarah shares her journey of growing her plumbing business using the Fixes platform.',
    category: 'Community',
    date: 'May 2, 2026',
    readTime: '7 min read',
  },
  {
    title: 'Introducing Instant Pay — Get Paid the Same Day',
    excerpt: 'No more waiting 30 days. Our new Instant Pay feature means fixers receive their earnings within hours of completing a job.',
    category: 'Product',
    date: 'April 20, 2026',
    readTime: '3 min read',
  },
  {
    title: 'Why Verified Licences Matter — And How Fixes Checks Every One',
    excerpt: 'Trust is everything. Here\'s how our verification process ensures every fixer on the platform is properly licensed and insured.',
    category: 'Safety',
    date: 'April 8, 2026',
    readTime: '5 min read',
  },
  {
    title: 'The Future of Trade Services in Australia: 2026 Industry Report',
    excerpt: 'Our annual deep-dive into the Australian trades industry — key trends, challenges, and where the market is heading.',
    category: 'Insights',
    date: 'March 25, 2026',
    readTime: '10 min read',
  },
]

const categoryColors: Record<string, string> = {
  Product: 'text-blue-600 bg-blue-50',
  Announcement: 'text-purple-600 bg-purple-50',
  Tips: 'text-amber-600 bg-amber-50',
  Community: 'text-green-600 bg-green-50',
  Safety: 'text-red-600 bg-red-50',
  Insights: 'text-cyan-600 bg-cyan-50',
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto">
          <p className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">
            Fixes Blog
          </p>
          <h1
            className={`${manrope.className} text-3xl sm:text-4xl lg:text-[3rem] font-bold leading-tight mb-4`}
          >
            News, updates &amp;<br />insights
          </h1>
          <p className="text-base text-white/60 leading-relaxed max-w-137.5">
            Stories from the Fixes team — product launches, tradie tips,
            community spotlights, and industry insights from across Australia &amp; New Zealand.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-6">
        <div className="max-w-275 mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-(--upwork-gray) mb-8">
            Featured
          </h2>
          <Link href="#" className="group block">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="rounded-xl overflow-hidden">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover rounded-xl group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColors[featuredPost.category]}`}>
                    {featuredPost.category}
                  </span>
                  <span className="text-xs text-(--upwork-gray)">{featuredPost.date}</span>
                  <span className="text-xs text-(--upwork-gray) flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {featuredPost.readTime}
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-extrabold text-(--upwork-navy) leading-tight mb-4 group-hover:text-(--upwork-green) transition-colors">
                  {featuredPost.title}
                </h3>
                <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed mb-5">
                  {featuredPost.excerpt}
                </p>
                <span className="text-sm font-bold text-(--upwork-navy) inline-flex items-center gap-1 group-hover:text-(--upwork-green) transition-colors">
                  Read article <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-6 bg-[#f6f6f6]">
        <div className="max-w-275 mx-auto">
          <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-10">
            Latest Posts
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.title}
                href="#"
                className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group block"
              >
                <div className="h-45 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-3xl font-extrabold text-gray-200">F</span>
                </div>
                <div className="px-5 py-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${categoryColors[post.category]}`}>
                      {post.category}
                    </span>
                    <span className="text-[10px] text-(--upwork-gray) flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-(--upwork-navy) leading-snug mb-2 group-hover:text-(--upwork-green) transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-(--upwork-gray) leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  <p className="text-[10px] text-(--upwork-gray) mt-3">{post.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-6">
        <div className="max-w-150 mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-4">
            Stay in the loop
          </h2>
          <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed mb-8">
            Get the latest Fixes news, product updates, and industry insights
            delivered straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="grow px-4 py-3 text-sm bg-[#f6f6f6] rounded-lg border border-gray-200 focus:outline-none focus:border-(--upwork-green) transition-colors"
            />
            <button
              className="px-6 py-3 font-bold text-sm text-(--upwork-navy) shrink-0 hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#A4FF43', borderRadius: '27px' }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
