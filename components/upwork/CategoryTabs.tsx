"use client"

import Link from "next/link"
import { useState } from "react"
import { 
  Hammer, 
  Zap, 
  Droplets, 
  Wrench, 
  Car,
  Flame,
  TreeDeciduous,
  Home,
  HardHat,
  Paintbrush,
  ChevronRight
} from "lucide-react"

const categories = [
  { id: "building", slug: "carpenter", label: "Building & Construction", icon: Hammer },
  { id: "electrical", slug: "electrician", label: "Electrical", icon: Zap },
  { id: "plumbing", slug: "plumber", label: "Plumbing & Gas", icon: Droplets },
  { id: "mechanical", slug: "hvac", label: "Mechanical & Fitting", icon: Wrench },
  { id: "automotive", slug: "other", label: "Automotive", icon: Car },
  { id: "hvac", slug: "hvac", label: "HVAC & Refrigeration", icon: Flame },
  { id: "landscaping", slug: "labourer", label: "Landscaping & Civil", icon: TreeDeciduous },
  { id: "finishing", slug: "plasterer", label: "Finishing Trades", icon: Home },
  { id: "metal", slug: "other", label: "Metal & Welding", icon: HardHat },
  { id: "painting", slug: "painter", label: "Painting & Decorating", icon: Paintbrush },
]

export function CategoryTabs() {
  const [activeCategory, setActiveCategory] = useState("building")

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-(--upwork-navy) text-center mb-12">
          Find tradies for every type of work
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id
            
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                onClick={() => setActiveCategory(category.id)}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                  isActive
                    ? "border-(--upwork-green) bg-(--upwork-green)/5"
                    : "border-gray-200 hover:border-(--upwork-green)/50 bg-white"
                }`}
              >
                <div className={`p-3 rounded-lg ${
                  isActive
                    ? "bg-(--upwork-green) text-white"
                    : "bg-(--upwork-light-gray) text-(--upwork-gray)"
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-sm font-medium text-center ${
                  isActive ? "text-(--upwork-green)" : "text-(--upwork-navy)"
                }`}>
                  {category.label}
                </span>
              </Link>
            )
          })}
        </div>

        <div className="flex justify-center mt-8">
          <Link
            href="/categories"
            className="flex items-center gap-2 text-(--upwork-green) font-medium hover:underline"
          >
            View all trade categories
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
