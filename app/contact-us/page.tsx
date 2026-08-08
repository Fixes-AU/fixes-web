import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Contact Fixes | Customer & Tradie Support',
  description:
    'Have a question or need help? Contact the Fixes team by email, phone, or live chat. We typically respond within 24 hours.',
}

type ContactOption = {
  title: string
  action: string
  href: string
  icon: ContactIconName
}

type ContactIconName = 'support' | 'handshake' | 'newspaper'

const contactOptions: ContactOption[] = [
  {
    title: 'Customer Support',
    action: 'Visit Help center',
    href: '/support',
    icon: 'support',
  },
  {
    title: 'Sales & Partnerships',
    action: 'Talk to Sales',
    href: 'mailto:contact@fixesau.com?subject=Sales%20and%20partnerships',
    icon: 'handshake',
  },
  {
    title: 'Media & Careers',
    action: 'Get in Touch',
    href: 'mailto:contact@fixesau.com?subject=Media%20and%20careers',
    icon: 'newspaper',
  },
]

export default function ContactUsPage() {
  return (
    <main className="min-h-screen bg-white font-manrope text-black">
      <Header />

      <div className="pt-16 lg:pt-[71px]">
        <section
          className="flex h-72 items-center justify-center px-[27px] lg:h-[301px] lg:px-20"
          style={{
            background:
              'linear-gradient(0deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), linear-gradient(90deg, #DFF69B 0%, #74C4BB 67.31%, #74C4BB 100%)',
          }}
        >
          <div className="mx-auto flex w-[336px] flex-col items-center text-center lg:w-[643px]">
            <p className="mb-3 text-xs font-medium uppercase leading-4 text-[#08544B] lg:mb-[17px] lg:text-[12.6829px] lg:leading-[17px]">
              Reach Out
            </p>
            <h1 className="text-[40px] font-semibold leading-[55px] lg:text-[64px] lg:leading-[87px]">
              Contact Us
            </h1>
            <p className="mt-[17px] max-w-[320px] text-sm font-medium leading-[19px] lg:mt-[19px] lg:max-w-[643px] lg:text-lg lg:leading-[23px]">
              We&apos;d love to hear from you. Whether you have a question about
              the platform, feedback, or a business inquiry.
            </p>
          </div>
        </section>

        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-[30px] px-5 py-[30px] lg:gap-[60px] lg:px-0 lg:py-[60px]">
          <section className="mx-auto flex w-full max-w-[350px] flex-col gap-[30px] lg:max-w-none lg:gap-[60px]">
            <h2 className="text-[32px] font-semibold leading-[44px] lg:text-[40px] lg:leading-[55px]">
              Reach Out Anytime
            </h2>
            <div className="grid gap-[33px] lg:grid-cols-[400px_400px_400px] lg:gap-10">
              {contactOptions.map((option) => (
                <ContactCard key={option.title} option={option} />
              ))}
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-[350px] flex-col gap-[30px] lg:max-w-none lg:gap-[60px]">
            <h2 className="text-[32px] font-semibold leading-[44px] lg:text-[40px] lg:leading-[55px]">
              Visit &amp; Contact Us
            </h2>
            <div className="grid gap-[33px] lg:grid-cols-[minmax(0,834px)_400px] lg:gap-[46px]">
              <div className="flex min-h-[426px] rounded-[29.9312px] bg-white px-5 py-[30px] shadow-[0_0_7.33945px_rgba(0,0,0,0.1)] lg:h-[278px] lg:min-h-0 lg:items-center lg:px-[33px] lg:py-0">
                <div className="flex flex-col gap-[30px] lg:flex-row lg:items-center">
                  <Image
                    src="/contact-page-assets/contact-map.png"
                    alt="Map showing the Fixes mailing address in Narre Warren North"
                    width={288}
                    height={192}
                    className="h-48 w-72 rounded-[18.3691px] object-cover"
                    priority
                  />
                  <div>
                    <h3 className="text-[32px] font-semibold leading-[44px] lg:text-[40px] lg:leading-[55px]">
                      Mailing Address
                    </h3>
                    <p className="mt-3 text-base leading-[22px] text-[#676767] lg:mt-[13px] lg:text-xl lg:leading-[27px]">
                      86-88 St Helens Crescent
                      <br />
                      Narre Warren North
                      <br />
                      VIC 3804, Australia
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex h-[127px] items-center gap-[18px] rounded-[29.9312px] bg-white px-[29px] shadow-[0_0_7.33945px_rgba(0,0,0,0.1)] lg:h-[278px] lg:flex-col lg:items-start lg:justify-center lg:gap-[60px] lg:px-[26px]">
                <IconBubble>
                  <FigmaPhoneIcon />
                </IconBubble>
                <div>
                  <h3 className="text-xl font-semibold leading-[27px] lg:text-[28px] lg:leading-[38px]">
                    Phone
                  </h3>
                  <Link
                    href="tel:1300303613"
                    className="mt-[6px] inline-block text-sm font-semibold leading-[18px] text-[#08544B] lg:mt-[9px] lg:text-[20.7714px]"
                  >
                    1300 303 613
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </main>
  )
}

function ContactCard({ option }: { option: ContactOption }) {
  return (
    <Link
      href={option.href}
      className="flex h-[127px] items-center gap-[18px] rounded-[29.9312px] bg-white px-[29px] shadow-[0_0_7.33945px_rgba(0,0,0,0.1)] transition hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(0,0,0,0.12)] lg:h-[278px] lg:w-[400px] lg:flex-col lg:items-start lg:gap-[44px] lg:px-[26px] lg:py-[26px]"
    >
      <div className="flex items-center gap-[18px] lg:flex-col lg:items-start">
        <IconBubble>
          <FigmaContactIcon name={option.icon} />
        </IconBubble>
        <div>
          <h3 className="text-xl font-semibold leading-[27px] lg:mt-[18px] lg:text-2xl lg:leading-[33px]">
            {option.title}
          </h3>
          <ContactAction action={option.action} className="mt-[11px] inline-flex lg:hidden" />
        </div>
      </div>
      <ContactAction action={option.action} className="hidden lg:inline-flex" />
    </Link>
  )
}

function ContactAction({ action, className = '' }: { action: string; className?: string }) {
  return (
    <span
      className={`items-center gap-[5px] text-base font-semibold leading-[18px] text-[#08544B] lg:text-[20.7714px] ${className}`}
    >
      {action}
      <FigmaArrowIcon />
    </span>
  )
}

function IconBubble({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-[72.96px] shrink-0 items-center justify-center rounded-full bg-[#F5F5F5] lg:size-[90px]">
      {children}
    </span>
  )
}

function FigmaContactIcon({ name }: { name: ContactIconName }) {
  if (name === 'support') {
    return (
      <svg
        aria-hidden="true"
        viewBox="126.442 669.508 49.06 49.06"
        className="size-[39.77px] lg:size-[49.06px]"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M136.738 689.947H138.194C139.685 689.947 141.114 690.539 142.169 691.594C143.223 692.648 143.815 694.078 143.815 695.568V698.634C143.815 700.037 143.291 701.389 142.346 702.425C141.4 703.461 140.102 704.106 138.705 704.233V705.789C138.705 707.199 139.85 708.344 141.26 708.344H146.121C146.438 707.447 147.025 706.67 147.802 706.121C148.579 705.572 149.507 705.277 150.458 705.278H151.48C152.7 705.278 153.87 705.762 154.732 706.625C155.595 707.487 156.079 708.657 156.079 709.877C156.079 711.096 155.595 712.266 154.732 713.129C153.87 713.991 152.7 714.476 151.48 714.476H150.458C149.507 714.476 148.579 714.181 147.802 713.632C147.025 713.083 146.438 712.307 146.121 711.41H141.26C139.769 711.41 138.339 710.818 137.285 709.763C136.231 708.709 135.639 707.279 135.639 705.789V704.256H133.595V691.48C133.595 686.737 135.479 682.188 138.833 678.833C142.187 675.479 146.737 673.595 151.48 673.595C156.224 673.595 160.773 675.479 164.127 678.833C167.481 682.188 169.366 686.737 169.366 691.48V704.256H164.766C163.276 704.256 161.846 703.663 160.792 702.609C159.738 701.555 159.145 700.125 159.145 698.634V695.568C159.145 694.078 159.738 692.648 160.792 691.594C161.846 690.539 163.276 689.947 164.766 689.947H166.222C165.843 686.302 164.126 682.926 161.403 680.472C158.681 678.018 155.145 676.661 151.48 676.661C147.815 676.661 144.28 678.018 141.557 680.472C138.834 682.926 137.118 686.302 136.738 689.947ZM138.194 693.013H136.661V701.19H138.194C139.604 701.19 140.749 700.045 140.749 698.634V695.568C140.749 694.158 139.604 693.013 138.194 693.013ZM164.766 693.013C163.356 693.013 162.211 694.158 162.211 695.568V698.634C162.211 700.045 163.356 701.19 164.766 701.19H166.299V693.013H164.766ZM148.925 709.877C148.925 709.47 149.087 709.08 149.374 708.793C149.662 708.505 150.052 708.344 150.458 708.344H151.48C151.887 708.344 152.277 708.505 152.564 708.793C152.852 709.08 153.013 709.47 153.013 709.877C153.013 710.283 152.852 710.673 152.564 710.961C152.277 711.248 151.887 711.41 151.48 711.41H150.458C150.052 711.41 149.662 711.248 149.374 710.961C149.087 710.673 148.925 710.283 148.925 709.877Z"
          fill="#0E8C7D"
        />
      </svg>
    )
  }

  if (name === 'handshake') {
    return (
      <svg
        aria-hidden="true"
        viewBox="566.427 669.507 49.06 49.06"
        className="size-[39.77px] lg:size-[49.06px]"
      >
        <path
          d="M590.36 710.269C590.627 710.269 590.901 710.209 591.182 710.089C591.463 709.969 591.69 709.823 591.863 709.65L607.798 693.712C608.312 693.199 608.708 692.674 608.988 692.139C609.266 691.6 609.405 691.01 609.405 690.368C609.405 689.718 609.266 689.087 608.988 688.476C608.708 687.862 608.312 687.304 607.798 686.799L600.133 679.134C599.627 678.621 599.107 678.244 598.573 678.004C598.04 677.764 597.449 677.644 596.799 677.644C596.157 677.644 595.561 677.764 595.01 678.004C594.46 678.244 593.941 678.62 593.455 679.132L591.673 680.915L595.454 684.706C595.86 685.106 596.163 685.559 596.364 686.068C596.563 686.576 596.662 687.092 596.662 687.615C596.662 688.679 596.314 689.56 595.618 690.256C594.921 690.952 594.042 691.3 592.979 691.298C592.454 691.298 591.942 691.219 591.444 691.059C590.945 690.9 590.496 690.62 590.097 690.221L586.186 686.325L577.36 695.149C577.154 695.357 577 695.592 576.896 695.855C576.793 696.118 576.741 696.383 576.741 696.652C576.741 697.134 576.895 697.531 577.205 697.843C577.513 698.157 577.908 698.314 578.39 698.314C578.657 698.314 578.931 698.254 579.212 698.134C579.493 698.012 579.72 697.865 579.893 697.692L586.37 691.215L587.817 692.662L581.35 699.141C581.143 699.347 580.988 699.582 580.884 699.845C580.782 700.109 580.731 700.375 580.731 700.642C580.731 701.098 580.892 701.487 581.213 701.809C581.535 702.131 581.924 702.292 582.38 702.293C582.647 702.293 582.921 702.233 583.202 702.111C583.483 701.99 583.71 701.844 583.883 701.672L590.832 694.734L592.28 696.18L585.34 703.129C585.159 703.302 585.01 703.529 584.895 703.81C584.777 704.091 584.719 704.365 584.719 704.632C584.719 705.087 584.88 705.475 585.203 705.797C585.525 706.121 585.914 706.283 586.37 706.283C586.637 706.283 586.903 706.232 587.167 706.128C587.432 706.024 587.666 705.869 587.871 705.662L594.82 698.722L596.268 700.17L589.318 707.119C589.112 707.326 588.957 707.575 588.854 707.865C588.75 708.156 588.698 708.421 588.698 708.661C588.698 709.143 588.868 709.532 589.207 709.828C589.547 710.123 589.931 710.271 590.36 710.271M590.348 712.315C589.297 712.315 588.398 711.931 587.65 711.162C586.902 710.393 586.573 709.443 586.665 708.313C585.506 708.327 584.542 707.981 583.772 707.277C583.002 706.571 582.637 705.587 582.675 704.325C581.413 704.339 580.418 703.978 579.69 703.242C578.963 702.506 578.632 701.537 578.697 700.335C577.56 700.349 576.609 700.029 575.843 699.374C575.079 698.723 574.697 697.816 574.697 696.652C574.697 696.127 574.798 695.603 575.001 695.078C575.204 694.552 575.504 694.09 575.901 693.692L586.186 683.419L591.464 688.696C591.637 688.878 591.851 689.027 592.106 689.144C592.361 689.261 592.648 689.319 592.966 689.318C593.404 689.318 593.79 689.165 594.125 688.86C594.461 688.555 594.629 688.157 594.63 687.666C594.63 687.347 594.572 687.061 594.455 686.808C594.337 686.553 594.189 686.339 594.009 686.166L586.977 679.134C586.47 678.621 585.944 678.244 585.397 678.004C584.851 677.764 584.253 677.644 583.603 677.644C582.961 677.644 582.378 677.764 581.853 678.004C581.33 678.244 580.811 678.621 580.297 679.134L574.075 685.369C573.637 685.805 573.282 686.326 573.012 686.932C572.743 687.537 572.6 688.162 572.583 688.807C572.57 689.269 572.609 689.712 572.702 690.137C572.794 690.563 572.944 690.963 573.151 691.339L571.602 692.889C571.259 692.341 570.99 691.71 570.797 690.996C570.603 690.282 570.514 689.553 570.529 688.809C570.545 687.879 570.731 686.99 571.087 686.141C571.443 685.292 571.952 684.535 572.616 683.87L578.799 677.687C579.512 676.981 580.266 676.457 581.062 676.113C581.858 675.771 582.718 675.6 583.644 675.6C584.569 675.6 585.422 675.772 586.203 676.115C586.985 676.457 587.729 676.981 588.435 677.687L590.213 679.467L591.996 677.687C592.708 676.981 593.456 676.457 594.238 676.113C595.02 675.771 595.874 675.6 596.799 675.6C597.724 675.6 598.585 675.772 599.381 676.115C600.175 676.457 600.925 676.981 601.629 677.687L609.245 685.301C609.95 686.006 610.493 686.797 610.876 687.674C611.259 688.552 611.45 689.453 611.449 690.379C611.449 691.305 611.258 692.159 610.876 692.94C610.495 693.721 609.951 694.465 609.245 695.172L593.308 711.095C592.884 711.52 592.422 711.829 591.922 712.023C591.423 712.217 590.899 712.313 590.348 712.313"
          fill="#0E8C7D"
        />
      </svg>
    )
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="1006.434 669.508 49.06 49.06"
      className="size-[39.77px] lg:size-[49.06px]"
    >
      <path
        d="M1014.87 676.406V706.683C1014.87 707.191 1014.67 707.679 1014.31 708.038C1013.95 708.397 1013.46 708.599 1012.96 708.599C1012.45 708.599 1011.96 708.397 1011.6 708.038C1011.24 707.679 1011.04 707.191 1011.04 706.683V684.071H1007.97V706.683C1007.98 708.004 1008.5 709.27 1009.43 710.204C1010.37 711.138 1011.64 711.664 1012.96 711.665H1048.98C1050.3 711.664 1051.57 711.138 1052.5 710.204C1053.44 709.27 1053.96 708.004 1053.96 706.683V676.406H1014.87ZM1050.9 706.683C1050.9 707.191 1050.7 707.678 1050.34 708.037C1049.98 708.397 1049.49 708.599 1048.98 708.599H1017.56C1017.81 707.992 1017.94 707.341 1017.94 706.683V679.472H1050.9V706.683Z"
        fill="#0E8C7D"
      />
      <path
        d="M1034.8 682.538H1021V697.868H1034.8V682.538ZM1031.74 694.802H1024.07V685.604H1031.74V694.802ZM1037.87 682.538H1047.83V685.604H1037.87V682.538ZM1037.87 688.67H1047.83V691.736H1037.87V688.67ZM1037.87 694.802H1047.83V697.868H1037.87V694.802Z"
        fill="#0E8C7D"
      />
    </svg>
  )
}

function FigmaPhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="1006.767 1148.503 49.06 49.06"
      className="size-[39.77px] lg:size-[49.06px]"
    >
      <path
        d="M1017.83 1164.56C1017.24 1160.71 1019.96 1157.24 1024.12 1155.97C1024.85 1155.75 1025.65 1155.81 1026.34 1156.15C1027.03 1156.49 1027.57 1157.08 1027.84 1157.8L1029.17 1161.36C1029.39 1161.93 1029.43 1162.56 1029.28 1163.15C1029.14 1163.75 1028.83 1164.28 1028.38 1164.7L1024.41 1168.33C1024.21 1168.51 1024.07 1168.74 1023.98 1168.99C1023.9 1169.24 1023.89 1169.51 1023.94 1169.77L1023.98 1169.93L1024.07 1170.33C1024.57 1172.27 1025.32 1174.13 1026.31 1175.86C1027.39 1177.71 1028.73 1179.39 1030.28 1180.85L1030.4 1180.96C1030.6 1181.14 1030.84 1181.26 1031.1 1181.32C1031.36 1181.37 1031.63 1181.36 1031.88 1181.28L1037.01 1179.66C1037.6 1179.48 1038.22 1179.47 1038.81 1179.65C1039.39 1179.82 1039.91 1180.17 1040.3 1180.64L1042.73 1183.59C1043.74 1184.81 1043.62 1186.62 1042.45 1187.7C1039.27 1190.66 1034.9 1191.27 1031.86 1188.83C1028.13 1185.82 1024.99 1182.15 1022.59 1178.01C1020.17 1173.87 1018.55 1169.3 1017.83 1164.56ZM1027.15 1169.97L1030.44 1166.96C1031.34 1166.13 1031.98 1165.05 1032.26 1163.87C1032.55 1162.68 1032.47 1161.43 1032.04 1160.29L1030.71 1156.73C1030.16 1155.28 1029.08 1154.09 1027.69 1153.4C1026.3 1152.72 1024.7 1152.59 1023.22 1153.04C1018.06 1154.62 1013.92 1159.25 1014.8 1165.03C1015.41 1169.06 1016.82 1174.19 1019.94 1179.55C1022.53 1184.02 1025.92 1187.98 1029.94 1191.22C1034.5 1194.88 1040.59 1193.63 1044.55 1189.95C1045.68 1188.89 1046.37 1187.45 1046.47 1185.9C1046.57 1184.36 1046.08 1182.84 1045.1 1181.64L1042.67 1178.69C1041.89 1177.75 1040.85 1177.06 1039.68 1176.71C1038.51 1176.37 1037.26 1176.38 1036.1 1176.74L1031.84 1178.08C1030.74 1176.95 1029.77 1175.69 1028.97 1174.33C1028.19 1172.96 1027.58 1171.5 1027.16 1169.98"
        fill="#0E8C7D"
      />
    </svg>
  )
}

function FigmaArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="271.39 850.066 25.96 25.96"
      className="size-[18px] lg:size-[25.96px]"
    >
      <path
        d="M275.717 863.048H292.896C292.895 862.618 292.725 862.206 292.421 861.902L286.265 855.746M286.265 870.351L292.421 864.195C292.724 863.891 292.895 863.478 292.894 863.048"
        stroke="#08544B"
        strokeWidth="1.62277"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
