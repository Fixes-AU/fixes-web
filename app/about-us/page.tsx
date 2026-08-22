import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { Footer, Header } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'About Fixes AU | Trusted Home Services Across Australia',
  description:
    'Meet the people behind Fixes AU and learn how we help homeowners find trusted professionals while helping tradies grow their businesses.',
}

const trustFeatures = [
  { title: 'Verified Professionals', description: 'AI agents can independently perform tasks', Icon: VerifiedIcon },
  {
    title: 'Transparent Reviews',
    description: 'AI-powered chatbots that instantly respond to customer queries',
    Icon: ReviewStarIcon,
  },
  {
    title: 'Secure Payments',
    description: 'AI analyzes historical and real-time data to predict trends',
    Icon: SecurePaymentIcon,
  },
]

const businessBenefits = [
  'Receive quality job opportunities',
  'Grow your customer base',
  'Manage your work from one platform',
  'Build trust through verified reviews',
]

const stats = [
  { value: '2.1+ million', label: 'people using Fixer', Icon: CommunityIcon },
  { value: '$382+ million', label: 'worth of jobs created', Icon: JobsIcon },
  { value: '4+ million', label: 'User Reviews', Icon: ReviewsIcon },
]

type FigmaIconProps = {
  className?: string
}

function FigmaIcon({ className, viewBox, path, evenOdd = false }: FigmaIconProps & { viewBox: string; path: string; evenOdd?: boolean }) {
  return (
    <svg aria-hidden="true" className={className} viewBox={viewBox} fill="none" focusable="false">
      <path
        d={path}
        fill="currentColor"
        fillRule={evenOdd ? 'evenodd' : undefined}
        clipRule={evenOdd ? 'evenodd' : undefined}
      />
    </svg>
  )
}

function CeoSignatureIcon({ className }: FigmaIconProps) {
  return (
    <FigmaIcon
      className={className}
      viewBox="109.5 2342 24 24"
      path="M119.75 2362.48C121.53 2361.78 121.14 2359.85 120.24 2358.63C119.35 2357.38 118.12 2356.52 116.88 2355.69C115.995 2355.14 115.205 2354.44 114.54 2353.63C114.26 2353.3 113.69 2352.69 114.27 2352.57C114.86 2352.45 115.88 2353.03 116.4 2353.25C117.31 2353.63 118.21 2354.07 119.05 2354.59L120.06 2352.89C118.5 2351.86 116.5 2350.95 114.64 2350.68C113.58 2350.52 112.46 2350.74 112.1 2351.89C111.78 2352.88 112.29 2353.88 112.87 2354.66C114.24 2356.49 116.37 2357.37 117.96 2358.95C118.3 2359.28 118.71 2359.67 118.91 2360.13C119.12 2360.57 119.07 2360.6 118.6 2360.6C117.36 2360.6 115.81 2359.63 114.8 2358.99L113.79 2360.69C115.32 2361.63 117.88 2363.1 119.75 2362.48ZM130.84 2346.88C131.06 2346.66 131.06 2346.3 130.84 2346.09L129.54 2344.79C129.435 2344.69 129.296 2344.64 129.15 2344.64C129.004 2344.64 128.864 2344.69 128.76 2344.79L127.74 2345.81L129.82 2347.89M121 2352.55V2354.63H123.08L129.23 2348.48L127.15 2346.4L121 2352.55Z"
    />
  )
}

function VerifiedIcon({ className }: FigmaIconProps) {
  return (
    <FigmaIcon
      className={className}
      viewBox="794 2797.5 30 30"
      path="M804.75 2825.64L802.375 2821.64L797.875 2820.64L798.312 2816.01L795.25 2812.51L798.312 2809.01L797.875 2804.39L802.375 2803.39L804.75 2799.39L809 2801.2L813.25 2799.39L815.625 2803.39L820.125 2804.39L819.688 2809.01L822.75 2812.51L819.688 2816.01L820.125 2820.64L815.625 2821.64L813.25 2825.64L809 2823.82L804.75 2825.64ZM805.812 2822.45L809 2821.07L812.25 2822.45L814 2819.45L817.438 2818.64L817.125 2815.14L819.438 2812.51L817.125 2809.82L817.438 2806.32L814 2805.57L812.188 2802.57L809 2803.95L805.75 2802.57L804 2805.57L800.562 2806.32L800.875 2809.82L798.562 2812.51L800.875 2815.14L800.562 2818.7L804 2819.45L805.812 2822.45ZM807.688 2816.95L814.75 2809.89L813 2808.07L807.688 2813.39L805 2810.76L803.25 2812.51L807.688 2816.95Z"
    />
  )
}

function ReviewStarIcon({ className }: FigmaIconProps) {
  return (
    <FigmaIcon
      className={className}
      viewBox="794.5 2893.925 30 30"
      path="M805.562 2915.58L809.5 2913.2L813.438 2915.61L812.406 2911.11L815.875 2908.11L811.312 2907.7L809.5 2903.45L807.688 2907.67L803.125 2908.08L806.594 2911.11L805.562 2915.58ZM801.781 2920.8L803.812 2912.02L797 2906.11L806 2905.33L809.5 2897.05L813 2905.33L822 2906.11L815.188 2912.02L817.219 2920.8L809.5 2916.14L801.781 2920.8Z"
    />
  )
}

function SecurePaymentIcon({ className }: FigmaIconProps) {
  return (
    <FigmaIcon
      className={className}
      viewBox="794 2990.58 30 30"
      path="M802.75 3009.33H805.25C805.25 3010.68 806.963 3011.83 809 3011.83C811.038 3011.83 812.75 3010.68 812.75 3009.33C812.75 3007.96 811.45 3007.46 808.7 3006.8C806.05 3006.13 802.75 3005.31 802.75 3001.83C802.75 2999.6 804.588 2997.7 807.125 2997.06V2994.33H810.875V2997.06C813.413 2997.7 815.25 2999.6 815.25 3001.83H812.75C812.75 3000.48 811.038 2999.33 809 2999.33C806.963 2999.33 805.25 3000.48 805.25 3001.83C805.25 3003.21 806.55 3003.71 809.3 3004.37C811.95 3005.03 815.25 3005.86 815.25 3009.33C815.25 3011.57 813.413 3013.47 810.875 3014.11V3016.83H807.125V3014.11C804.588 3013.47 802.75 3011.57 802.75 3009.33Z"
    />
  )
}

function CommunityIcon({ className }: FigmaIconProps) {
  return (
    <FigmaIcon
      className={className}
      viewBox="220.668 3263 33.32 25.11"
      evenOdd
      path="M222.214 3279.48C221.184 3280.09 220.668 3280.91 220.668 3281.92V3284.11H226.916V3281.85C226.916 3281.25 226.996 3280.69 227.159 3280.15C227.321 3279.62 227.564 3279.12 227.888 3278.66C227.624 3278.61 227.357 3278.59 227.089 3278.57C226.812 3278.56 226.523 3278.56 226.222 3278.56C224.579 3278.56 223.242 3278.86 222.214 3279.48ZM231.307 3278.21C229.767 3279.14 228.998 3280.35 228.998 3281.85V3284.11H245.658V3281.85C245.658 3280.35 244.895 3279.14 243.367 3278.21C241.84 3277.28 239.827 3276.82 237.328 3276.82C234.853 3276.82 232.845 3277.28 231.307 3278.21ZM247.514 3280.15C247.666 3280.69 247.741 3281.25 247.741 3281.85V3284.11H253.988V3281.92C253.988 3280.91 253.478 3280.09 252.461 3279.48C251.443 3278.86 250.101 3278.56 248.435 3278.56C248.157 3278.56 247.885 3278.56 247.62 3278.57C247.353 3278.59 247.092 3278.62 246.838 3278.66C247.139 3279.12 247.364 3279.62 247.514 3280.15ZM233.788 3280.12C234.829 3279.77 236.009 3279.6 237.328 3279.6C238.671 3279.6 239.855 3279.77 240.885 3280.12C241.915 3280.47 242.534 3280.87 242.743 3281.33H231.949C232.133 3280.87 232.747 3280.47 233.788 3280.12ZM224.261 3276.35C224.804 3276.9 225.458 3277.17 226.222 3277.17C227.009 3277.17 227.668 3276.9 228.2 3276.35C228.732 3275.81 228.998 3275.16 228.998 3274.39C228.998 3273.61 228.732 3272.95 228.2 3272.41C227.668 3271.88 227.009 3271.62 226.222 3271.62C225.458 3271.62 224.806 3271.88 224.261 3272.41C223.996 3272.67 223.786 3272.98 223.645 3273.32C223.505 3273.66 223.436 3274.02 223.445 3274.39C223.445 3275.16 223.717 3275.81 224.261 3276.35ZM246.473 3276.35C247.017 3276.9 247.671 3277.17 248.435 3277.17C249.222 3277.17 249.881 3276.9 250.413 3276.35C250.945 3275.81 251.211 3275.16 251.211 3274.39C251.211 3273.61 250.945 3272.95 250.413 3272.41C249.881 3271.88 249.222 3271.62 248.435 3271.62C248.071 3271.61 247.71 3271.68 247.373 3271.82C247.036 3271.95 246.73 3272.16 246.473 3272.41C246.208 3272.67 245.998 3272.98 245.858 3273.32C245.718 3273.66 245.65 3274.02 245.658 3274.39C245.658 3275.16 245.93 3275.81 246.473 3276.35ZM234.378 3274.57C234.761 3274.96 235.22 3275.27 235.727 3275.48C236.235 3275.69 236.78 3275.79 237.328 3275.78C238.508 3275.78 239.497 3275.38 240.295 3274.57C241.093 3273.76 241.493 3272.77 241.493 3271.62C241.493 3270.44 241.093 3269.45 240.295 3268.65C239.497 3267.85 238.508 3267.45 237.328 3267.45C236.172 3267.45 235.187 3267.85 234.378 3268.65C233.569 3269.45 233.163 3270.44 233.163 3271.62C233.163 3272.77 233.569 3273.76 234.378 3274.57ZM236.34 3270.63C236.469 3270.5 236.623 3270.39 236.793 3270.32C236.963 3270.26 237.145 3270.22 237.328 3270.23C237.512 3270.22 237.694 3270.26 237.864 3270.32C238.035 3270.39 238.189 3270.5 238.318 3270.63C238.448 3270.76 238.551 3270.91 238.62 3271.08C238.688 3271.25 238.721 3271.43 238.717 3271.62C238.721 3271.8 238.688 3271.98 238.619 3272.15C238.551 3272.32 238.448 3272.48 238.318 3272.6C238.189 3272.74 238.035 3272.84 237.865 3272.91C237.694 3272.98 237.512 3273.01 237.328 3273C237.145 3273.01 236.963 3272.98 236.793 3272.91C236.622 3272.84 236.468 3272.74 236.34 3272.6C236.209 3272.48 236.106 3272.32 236.037 3272.15C235.968 3271.98 235.935 3271.8 235.94 3271.62C235.94 3271.22 236.073 3270.89 236.34 3270.63Z"
    />
  )
}

function JobsIcon({ className }: FigmaIconProps) {
  return (
    <FigmaIcon
      className={className}
      viewBox="593.2 3262.94 27.04 25.68"
      path="M616.182 3268.35H612.127V3267C612.127 3265.92 611.7 3264.89 610.939 3264.13C610.179 3263.37 609.147 3262.94 608.072 3262.94H605.368C604.293 3262.94 603.262 3263.37 602.501 3264.13C601.741 3264.89 601.313 3265.92 601.313 3267V3268.35H597.258C596.183 3268.35 595.152 3268.77 594.391 3269.53C593.631 3270.3 593.203 3271.33 593.203 3272.4V3284.57C593.203 3285.64 593.631 3286.67 594.391 3287.43C595.152 3288.19 596.183 3288.62 597.258 3288.62H616.182C617.257 3288.62 618.289 3288.19 619.049 3287.43C619.81 3286.67 620.237 3285.64 620.237 3284.57V3272.4C620.237 3271.33 619.81 3270.3 619.049 3269.53C618.289 3268.77 617.257 3268.35 616.182 3268.35ZM604.017 3267C604.017 3266.64 604.159 3266.29 604.413 3266.04C604.666 3265.79 605.01 3265.64 605.368 3265.64H608.072C608.43 3265.64 608.774 3265.79 609.028 3266.04C609.281 3266.29 609.424 3266.64 609.424 3267V3268.35H604.017V3267ZM617.534 3284.57C617.534 3284.93 617.391 3285.27 617.138 3285.52C616.884 3285.78 616.54 3285.92 616.182 3285.92H597.258C596.9 3285.92 596.556 3285.78 596.303 3285.52C596.049 3285.27 595.907 3284.93 595.907 3284.57V3277.74H599.962V3279.16C599.962 3279.52 600.104 3279.86 600.358 3280.12C600.611 3280.37 600.955 3280.51 601.313 3280.51C601.672 3280.51 602.016 3280.37 602.269 3280.12C602.523 3279.86 602.665 3279.52 602.665 3279.16V3277.74H610.775V3279.16C610.775 3279.52 610.918 3279.86 611.171 3280.12C611.425 3280.37 611.768 3280.51 612.127 3280.51C612.485 3280.51 612.829 3280.37 613.083 3280.12C613.336 3279.86 613.479 3279.52 613.479 3279.16V3277.74H617.534V3284.57ZM617.534 3275.11H595.907V3272.4C595.907 3272.04 596.049 3271.7 596.303 3271.45C596.556 3271.19 596.9 3271.05 597.258 3271.05H616.182C616.54 3271.05 616.884 3271.19 617.138 3271.45C617.391 3271.7 617.534 3272.04 617.534 3272.4V3275.11Z"
    />
  )
}

function ReviewsIcon({ className }: FigmaIconProps) {
  return (
    <FigmaIcon
      className={className}
      viewBox="1017.03 3263.62 27.04 25.68"
      evenOdd
      path="M1030.55 3281.09L1026.29 3283.65L1027.41 3278.82L1023.66 3275.54L1028.59 3275.11L1030.55 3270.54L1032.51 3275.14L1037.45 3275.58L1033.69 3278.82L1034.81 3283.69L1030.55 3281.09ZM1024.4 3279.8L1022.21 3289.3L1030.55 3284.26L1038.9 3289.3L1036.7 3279.8L1044.07 3273.42L1034.34 3272.57L1030.55 3263.62L1026.77 3272.57L1017.03 3273.42L1024.4 3279.8Z"
    />
  )
}

function PrimaryLink({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/i-want-to-work"
      className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-[#086B61] px-5 text-[14px] font-medium leading-6 text-white transition-colors hover:bg-[#07584f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#086B61] lg:text-[16px]"
    >
      {children}
    </Link>
  )
}

export default function AboutUsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white font-manrope text-[#031C19]">
      <Header campaign />

      <div className="flex flex-col items-center gap-[30px] pt-[10.36px] lg:gap-[60px] lg:pt-[60px]">
        <section className="relative h-[554px] w-full overflow-hidden lg:h-[726px]">
          <Image
            src="/about-page-assets/about-hero-mobile.png"
            alt="A Fixes electrician repairing an outdoor wall light"
            fill
            priority
            sizes="(min-width: 1024px) 0px, 100vw"
            className="object-cover object-bottom lg:hidden"
          />
          <Image
            src="/about-page-assets/about-hero-desktop.png"
            alt="A Fixes electrician repairing an outdoor wall light"
            fill
            priority
            sizes="(min-width: 1024px) 100vw, 0px"
            className="hidden object-cover object-center lg:block min-[1440px]:object-[center_-32.75px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent lg:bg-[linear-gradient(270deg,transparent_34.2%,rgba(0,0,0,0.45)_100%)]" />

          <div className="absolute bottom-[23px] left-5 right-5 flex max-w-[609px] flex-col gap-5 text-white lg:bottom-[100px] lg:left-[max(40px,calc((100%-1280px)/2))] lg:right-auto">
            <h1 className="text-[40px] font-semibold leading-[52px] tracking-[-0.02em] lg:text-[64px] lg:leading-[80px]">
              <span className="lg:hidden">About Fixes AU.</span>
              <span className="hidden lg:inline">About Fixes AU</span>
            </h1>
            <p className="max-w-[545px] text-[12px] font-medium leading-4 tracking-[-0.04em] lg:text-[18px] lg:leading-[23px]">
              Fixes AU was founded with one simple mission: to make finding trusted home service professionals faster,
              easier, and more reliable for homeowners and tradies across Australia.
            </p>
          </div>
        </section>

        <section className="min-h-[675px] w-[calc(100%-40px)] max-w-[350px] rounded-3xl bg-[linear-gradient(0deg,rgba(255,255,255,0.8),rgba(255,255,255,0.8)),linear-gradient(90deg,#DFF69B_0%,#74C4BB_67.31%,#74C4BB_100%)] px-5 py-[30px] lg:h-[570px] lg:min-h-0 lg:w-[calc(100%-80px)] lg:max-w-[1280px] lg:px-[55px] lg:py-[56px]">
          <div className="flex h-full flex-col gap-[30px] lg:flex-row lg:items-center lg:justify-between lg:gap-[46px]">
            <div className="flex flex-col gap-[30px] lg:w-[609px] lg:gap-5">
              <h2 className="text-[32px] font-semibold leading-[44px] tracking-[-0.02em] lg:w-[494px] lg:text-[48px] lg:leading-[66px]">
                The People Behind
                <br />
                Fixes AU
              </h2>
              <p className="text-[14px] font-medium leading-[19px] tracking-[-0.04em] text-[#616161] lg:max-w-[545px] lg:text-[18px] lg:leading-[23px]">
                Fixes AU was founded with a shared vision: to create a trusted marketplace where homeowners can
                confidently hire skilled professionals and tradies can grow their businesses. By combining technology
                with industry expertise, we’re building a platform that makes every connection more transparent,
                every project more efficient, and every experience more rewarding.
              </p>
            </div>
            <div className="relative aspect-[310/315] w-full shrink-0 overflow-hidden rounded-3xl lg:h-[459px] lg:w-[541px] lg:aspect-auto">
              <Image
                src="/about-page-assets/about-founders.png"
                alt="The two founders of Fixes AU"
                fill
                sizes="(min-width: 1024px) 541px, calc(100vw - 80px)"
                className="object-cover object-center"
              />
            </div>
          </div>
        </section>

        <section className="flex min-h-[624.98px] w-[calc(100%-40px)] max-w-[350px] flex-col gap-[30px] lg:h-[395px] lg:min-h-0 lg:w-[calc(100%-80px)] lg:max-w-[1280px] lg:flex-row lg:gap-10">
          <div className="order-2 relative aspect-[7/5] w-full shrink-0 overflow-hidden rounded-[29px] lg:order-1 lg:h-[395px] lg:w-[620px] lg:aspect-auto">
            <Image
              src="/about-page-assets/about-story-team.png"
              alt="Four Fixes professionals representing electrical, plumbing, carpentry and cleaning services"
              fill
              sizes="(min-width: 1024px) 620px, calc(100vw - 40px)"
              className="object-cover object-center"
            />
          </div>
          <div className="order-1 flex flex-1 flex-col lg:order-2 lg:px-[30px] lg:pr-[9.75px]">
            <p className="text-[12px] font-medium uppercase leading-[25px] text-[#086B61] lg:text-[12.68px]">Our Story</p>
            <h2 className="mt-[5px] text-[32px] font-semibold leading-[44px] tracking-[-0.02em] lg:text-[40px] lg:leading-[59px]">
              Built on Trust. Driven by
              <br className="hidden lg:block" /> Purpose.
            </h2>
            <p className="mt-[19px] text-[14px] font-normal leading-[19px] text-[#676767] lg:mt-[19.5px] lg:text-[16.585px] lg:leading-[25px]">
              Finding the right professional shouldn’t feel uncertain. At Fixes AU, we’re creating a trusted
              marketplace where homeowners can confidently connect with verified local experts for every repair,
              renovation, and maintenance project. By combining technology with transparency, we make it easier to hire
              skilled professionals while helping tradies grow their businesses. Every connection we create is built on
              quality, reliability, and a shared commitment to getting the job done right.
            </p>
          </div>
        </section>

        <section id="ceo-letter" className="relative h-[522px] w-full overflow-hidden lg:h-[457px]">
          <Image
            src="/about-page-assets/about-ceo-backdrop-mobile.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 0px, 100vw"
            className="object-cover object-center lg:hidden"
          />
          <Image
            src="/about-page-assets/about-ceo-backdrop-desktop.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 100vw, 0px"
            className="hidden object-cover object-center lg:block"
          />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0)_34.2%,rgba(0,0,0,0.45)_100%)] lg:bg-[linear-gradient(270deg,transparent_34.2%,rgba(0,0,0,0.45)_100%)]" />
          <div className="absolute inset-0 bg-black/[0.02] backdrop-blur-[5px] lg:hidden" />
          <Image
            src="/about-page-assets/about-ceo-cutout.png"
            alt="The CEO of Fixes AU"
            width={1400}
            height={1123}
            sizes="(min-width: 1024px) 538px, 420px"
            className="absolute bottom-auto left-[calc(50%_-_112px)] top-[179px] z-10 h-[343.49px] w-[420px] object-fill lg:bottom-0 lg:left-auto lg:right-[83px] lg:top-auto lg:h-[440px] lg:w-[538px] lg:object-contain lg:object-bottom"
          />
          <div className="absolute left-5 top-[30px] z-20 w-[calc(100%-40px)] max-w-[350px] text-white lg:left-[max(70px,calc((100%-1280px)/2+30px))] lg:top-[46px] lg:w-[580px] lg:max-w-none">
            <h2 className="text-[32px] font-bold leading-[44px] tracking-[-0.02em] lg:text-[40px] lg:leading-[59px]">
              A Letter From Our CEO
            </h2>
            <p className="mt-[30px] text-[14px] font-medium leading-[19px] lg:mt-[24px] lg:text-[16.585px] lg:leading-[25px]">
              &quot;When we created Fixes AU, our goal wasn’t simply to build another marketplace. We wanted to remove
              the uncertainty from hiring home service professionals. Every homeowner deserves access to trusted
              experts, and every professional deserves the opportunity to grow their business. Everything we build is
              guided by trust, quality, and a commitment to delivering exceptional experiences.&quot;
            </p>
            <div className="mt-[30px] flex items-center gap-3 lg:mt-6">
              <CeoSignatureIcon className="size-6 text-[#086B61]" />
              <span className="text-[16px] leading-6 lg:text-[16.585px]">CEO, Fixes AU</span>
            </div>
            <a
              href="#ceo-letter"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#A4FF2F] px-5 text-[14px] font-medium leading-6 text-[#086B61] transition-colors hover:bg-[#95ef24] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A4FF2F] lg:text-[16px]"
            >
              Read Full Letter
            </a>
          </div>
        </section>

        <section className="flex min-h-[949px] w-[calc(100%-40px)] max-w-[350px] flex-col gap-[30px] lg:h-[584.12px] lg:min-h-0 lg:w-[calc(100%-80px)] lg:max-w-[1280px] lg:flex-row lg:gap-10">
          <div className="contents lg:block lg:w-[620px] lg:shrink-0">
            <div className="order-3 relative aspect-[350/306] w-full overflow-hidden rounded-[29px] lg:order-none lg:h-[540px] lg:w-[620px] lg:aspect-auto">
              <Image
                src="/about-page-assets/about-trust-job.png"
                alt="A highly rated Fixes professional with completed-job and released-payment confirmations"
                fill
                sizes="(min-width: 1024px) 620px, calc(100vw - 40px)"
                className="object-cover object-center"
              />
            </div>
          </div>
          <div className="contents lg:flex lg:flex-1 lg:flex-col lg:gap-[30px] lg:pl-[30px]">
            <h2 className="order-1 text-[32px] font-semibold leading-[44px] tracking-[-0.02em] lg:order-none lg:text-[40px] lg:leading-[55px]">
              Trust Is Built Into Every
              <br />
              Job.
            </h2>
            <p className="order-2 text-[14px] font-normal leading-[19px] text-[#676767] lg:order-none lg:max-w-[524px] lg:text-[16.585px] lg:leading-[25px]">
              Your peace of mind comes first. Every feature on Fixes AU is designed to help you hire with confidence—from
              verified professionals to secure payments and transparent reviews.
            </p>
            <div className="order-4 flex flex-col gap-[18px] lg:order-none lg:max-w-[524px]">
              {trustFeatures.map(({ title, description, Icon }) => (
                <div key={title} className="flex h-[93px] w-full gap-1 lg:h-[78.54px]">
                  <div className="flex w-[79px] shrink-0 items-center justify-center rounded-[8.7px] border border-[#E7EFF6] lg:w-[78.54px]">
                    <Icon className="size-[30px] text-[#086B61]" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center rounded-[8.7px] border border-[#E7EFF6] px-[30px] lg:px-[34px]">
                    <h3 className="text-[16px] font-medium leading-6 lg:text-[16.09px]">{title}</h3>
                    <p className="mt-1 text-[12px] leading-[15px] text-[#777] lg:text-[11.66px]">{description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="order-5 lg:order-none">
              <PrimaryLink>Become a Fixer</PrimaryLink>
            </div>
          </div>
        </section>

        <section className="relative h-[547px] w-[calc(100%-30px)] max-w-[360px] overflow-hidden rounded-3xl bg-[#031C19] text-white lg:h-[282.32px] lg:w-[calc(100%-80px)] lg:max-w-[1280px]">
          <div
            aria-hidden="true"
            className="absolute inset-[10px_9px] opacity-10 lg:hidden"
            style={{ backgroundImage: "url('/about-page-assets/about-stats-pattern.png')", backgroundRepeat: 'repeat', backgroundSize: '160px 143px' }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-[10px] hidden opacity-10 lg:block"
            style={{ backgroundImage: "url('/about-page-assets/about-stats-pattern.png')", backgroundRepeat: 'repeat', backgroundSize: '206px 184px' }}
          />
          <div className="relative z-10 mx-auto flex h-full w-[207px] flex-col justify-center gap-20 lg:w-auto lg:flex-row lg:items-center lg:justify-center lg:gap-[138px]">
            {stats.map(({ value, label, Icon }) => (
              <div key={value} className="flex min-w-[226px] flex-col items-start">
                <Icon className="size-8" />
                <p className="text-[32px] font-semibold leading-[44px] tracking-[-0.02em] lg:text-[44.426px] lg:leading-[61px]">{value}</p>
                <p className="text-[16px] font-normal leading-7 text-white/85 lg:text-[19.436px]">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="min-h-[976.32px] w-full bg-[#F6F6F6] px-5 py-[30px] lg:h-[662.8px] lg:min-h-0 lg:rounded-[30px] lg:px-0 lg:py-[60px]">
          <div className="mx-auto flex w-full max-w-[350px] flex-col gap-[30px] lg:h-[542.8px] lg:max-w-[1280px] lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="contents lg:flex lg:w-[628px] lg:flex-col">
              <div className="order-1">
                <h2 className="text-[32px] font-semibold leading-[44px] tracking-[-0.02em] lg:text-[40px] lg:leading-[59px]">
                  Build Your Business
                  <br />
                  with Fixes AU.
                </h2>
                <p className="mt-[30px] text-[14px] font-normal leading-[19px] text-[#676767] lg:mt-[24px] lg:max-w-[618px] lg:text-[16.585px] lg:leading-[25px]">
                  Join thousands of skilled professionals using Fixes AU to connect with new customers, manage jobs
                  efficiently, and grow their businesses with confidence.
                </p>
              </div>
              <div className="order-3 lg:mt-[26px]">
                <ul>
                  {businessBenefits.map((benefit) => (
                    <li key={benefit} className="flex min-h-[50px] items-center gap-[10px] border-b border-[#DCDCDC] py-[12px] lg:min-h-[54px]">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#086B61] text-white">
                        <Check aria-hidden="true" className="size-3" strokeWidth={3} />
                      </span>
                      <span className="text-[14px] leading-5 text-[#33413F] lg:text-[16.585px]">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-[24px]">
                  <PrimaryLink>Become a Fixer</PrimaryLink>
                </div>
              </div>
            </div>
            <div className="order-2 relative aspect-[350/406] w-full shrink-0 overflow-hidden rounded-[30px] lg:order-none lg:h-[542.8px] lg:w-[500px] lg:aspect-auto">
              <Image
                src="/about-page-assets/about-build-business.png"
                alt="A Fixes plumber completing a repair"
                fill
                sizes="(min-width: 1024px) 500px, calc(100vw - 40px)"
                className="object-cover object-center"
              />
            </div>
          </div>
        </section>

        <section className="flex min-h-[464.1px] w-[calc(100%-40px)] max-w-[350px] flex-col gap-[30px] lg:h-[445px] lg:min-h-0 lg:w-[calc(100%-80px)] lg:max-w-[1280px] lg:flex-row lg:items-center lg:gap-[53px]">
          <div className="order-2 relative aspect-[350/266] w-full shrink-0 overflow-hidden rounded-[27.7px] lg:order-1 lg:h-[445px] lg:w-[672px] lg:aspect-auto">
            <Image
              src="/about-page-assets/about-australia-map.png"
              alt="Map showing Fixes AU service locations across Australia"
              fill
              sizes="(min-width: 1024px) 672px, calc(100vw - 40px)"
              className="object-cover object-center"
            />
          </div>
          <div className="order-1 flex flex-col lg:order-2 lg:w-[555px]">
            <h2 className="text-[32px] font-semibold leading-[44px] tracking-[-0.02em] lg:text-[55.45px] lg:leading-[76px]">
              Proudly Serving
              <br />
              Across Australia
            </h2>
            <p className="mt-[30px] text-[14px] font-medium leading-[19px] text-[#616161] lg:mt-[24px] lg:text-[20.79px] lg:leading-[27px]">
              From major cities to regional towns, Fixes AU is helping homeowners connect with trusted professionals
              wherever they need them.
            </p>
          </div>
        </section>
      </div>

      <div className="mt-[30px] lg:mt-[60px]">
        <Footer campaign />
      </div>
    </main>
  )
}
