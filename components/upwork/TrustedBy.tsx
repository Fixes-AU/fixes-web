type Badge = {
  eyebrow: string
  year?: string
  title: string[]
  subtitle: string
  background: string
}

function buildBadgeBackground(topBand: string, middleBand: string, bottomBand: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 124.75 143.73" preserveAspectRatio="none"><defs><clipPath id="shield"><path d="M.68.68h123.39v103.77L62.38 143.05.68 104.45V.68Z"/></clipPath></defs><g clip-path="url(#shield)"><rect width="124.75" height="143.73" fill="white"/><path d="M0 104.45 62.38 143.73 124.75 104.45Z" fill="${bottomBand}"/><path d="M0 96.35 62.38 135.65 124.75 96.35Z" fill="${middleBand}"/><path d="M0 88.62 62.38 127.59 124.75 88.62Z" fill="${topBand}"/><path d="M0 80.55 62.38 119.52 124.75 80.55Z" fill="white"/></g><path d="M.68.68h123.39v103.77L62.38 143.05.68 104.45V.68Z" fill="none" stroke="#111" stroke-width="1.36"/><path d="M.68 28.48h123.39" stroke="#111" stroke-width="1.36"/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

const badges: Badge[] = [
  { eyebrow: "BEST Proptech", year: "2026", title: ["Top 50"], subtitle: "INNOVATORS", background: buildBadgeBackground("#5746B2", "#FFC800", "#FF492C") },
  { eyebrow: "WINTER 2026", title: ["Leader"], subtitle: "HOME SERVICES", background: buildBadgeBackground("#FFFFFF", "#FFC800", "#FF492C") },
  { eyebrow: "WINTER 2026", title: ["Best", "ROI"], subtitle: "TRADIE PLATFORM", background: buildBadgeBackground("#FFFFFF", "#FFFFFF", "#5746B2") },
  { eyebrow: "WINTER 2026", title: ["Best", "Usability"], subtitle: "EASIEST APP", background: buildBadgeBackground("#FFFFFF", "#FFFFFF", "#FFC800") },
  { eyebrow: "WINTER 2026", title: ["Fastest", "Dispatch"], subtitle: "MID-MARKET", background: buildBadgeBackground("#FFFFFF", "#FFFFFF", "#288DFF") },
  { eyebrow: "WINTER 2026", title: ["Most", "Accurate"], subtitle: "AI QUOTES", background: buildBadgeBackground("#FFFFFF", "#FFFFFF", "#FFC800") },
  { eyebrow: "WINTER 2026", title: ["Best", "Agency"], subtitle: "MANAGEMENT", background: buildBadgeBackground("#FFFFFF", "#FFFFFF", "#FFC800") },
]

export function TrustedBy() {
  return (
    <section className="bg-white py-16 font-manrope lg:pb-[88px] lg:pt-[52px]">
      <div className="mx-auto w-[350px] max-w-[calc(100%-40px)] md:w-auto md:max-w-[720px] lg:w-[1280px] lg:max-w-[calc(100%-64px)]">
        <h2 className="text-center text-[30px] font-semibold leading-[1.2] tracking-[-0.04em] text-black lg:text-[40px]">
          Trusted by growing businesses
        </h2>
        <div className="mt-12 grid grid-cols-2 place-items-center gap-x-[18.6px] gap-y-[30px] md:grid-cols-4 md:gap-x-6 lg:grid-cols-7 lg:gap-x-[67.8px] lg:gap-y-0">
          {badges.map((badge, index) => (
            <TrustBadge key={`${badge.title.join("-")}-${index}`} badge={badge} className={index === badges.length - 1 ? "col-span-2 md:col-span-1" : ""} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustBadge({ badge, className = "" }: { badge: Badge; className?: string }) {
  const isTop50 = badge.title[0] === "Top 50"

  return (
    <div
      className={`${className} relative h-[190.92px] w-[165.7px] bg-[length:100%_100%] bg-no-repeat font-manrope lg:h-[143.73px] lg:w-[124.75px]`}
      style={{ backgroundImage: badge.background }}
    >
      <div className="absolute left-[7.53%] top-[5.19%] text-[13.5083px] font-bold leading-[16px] text-black lg:text-[10.1695px] lg:leading-[12px]">
        {badge.eyebrow}
      </div>
      <div className="absolute right-0 top-0 flex h-[19.81%] w-[22.83%] items-center justify-center bg-[#FF492C] text-[14px] font-bold leading-none text-white lg:text-[10.5px]">
        G&#178;
      </div>
      {badge.year && (
        <div className="absolute inset-x-0 top-[23.58%] text-center text-[14.4089px] font-bold leading-[17px] text-black lg:text-[10.8475px] lg:leading-[13px]">
          {badge.year}
        </div>
      )}
      <div className={`absolute inset-x-[5%] whitespace-pre-line text-center font-bold text-black ${isTop50 ? "top-[34.91%] text-[32.4199px] leading-[39px] lg:text-[24.4068px] lg:leading-[30px]" : badge.title.length > 1 ? "top-[29.25%] text-[23.4px] leading-[24px] lg:text-[17.6271px] lg:leading-[18px]" : "top-[36.79%] text-[23.4px] leading-[28px] lg:text-[17.6271px] lg:leading-[21px]"}`}>
        {badge.title.join("\n")}
      </div>
      <div className="absolute inset-x-[4%] top-[61.79%] text-center text-[11.7072px] font-bold uppercase leading-[14px] text-black lg:text-[8.81356px] lg:leading-[11px]">
        {badge.subtitle}
      </div>
    </div>
  )
}
