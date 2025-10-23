import { Hero, LatestAuctions, TopVendors } from "@/components/home";
import Link from "next/link";
import SellerCTA from "@/components/home/SellerCTA";
import Steps from "@/components/home/Steps";
import SiteFooter from "@/components/home/SiteFooter";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-white space-y-8">
      {/* Full-screen background container (overflow hidden) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden h-screen w-screen -mt-32 select-none">
        {/* Blur wrapper for shapes */}
        <div className="">
          {/* Decorative background SVG top-left */}
          <div className="absolute -left-[500px] top-[20px] w-[700px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 857 857" fill="none">
              <path d="M834.5 428.5C834.5 652.728 652.728 834.5 428.5 834.5C204.272 834.5 22.5 652.728 22.5 428.5C22.5 204.272 204.272 22.5 428.5 22.5C652.728 22.5 834.5 204.272 834.5 428.5Z" stroke="#F5CFC2" strokeOpacity="0.35" strokeWidth="45" strokeLinecap="round" style={{ strokeDashoffset: 0, strokeDasharray: 'none' }}></path>
            </svg>
          </div>
          {/* Decorative background SVG left (secondary) */}
          <div className="absolute -left-[320px] top-[420px] w-[720px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 857 857" fill="none">
              <path d="M834.5 428.5C834.5 652.728 652.728 834.5 428.5 834.5C204.272 834.5 22.5 652.728 22.5 428.5C22.5 204.272 204.272 22.5 428.5 22.5C652.728 22.5 834.5 204.272 834.5 428.5Z" stroke="#F5CFC2" strokeOpacity="0.35" strokeWidth="45" strokeLinecap="round" style={{ strokeDashoffset: 0, strokeDasharray: 'none' }}></path>
            </svg>
          </div>
          {/* Decorative background SVG top-right */}
          <div className="absolute -right-[400px] -top-[100px] w-[900px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 1069 657" fill="none">
              <path d="M1036.99 82.7344C1042.19 114.356 1045.22 144.773 1045.45 174.953C1046.01 247.895 1037.43 375.3 1020.66 434.703C1007.96 479.683 986.077 516.266 955.72 531.857C943.162 538.306 929.288 542.824 913.484 532.293C905.471 528.403 888.29 507.097 880.702 496.931C847.07 450.563 827.392 385.076 823.597 325.941C820.944 284.616 825.922 234.305 844.818 213.054C855.158 201.425 862.848 224.235 868.982 241.653C886.485 291.359 892.005 338.469 895.837 387.856C898.107 436.474 900.006 539.44 889.435 562.355C872.984 611.911 835.77 639.978 794.294 630.695C770.991 625.479 750.361 607.371 729.891 579.908C699.786 539.521 673.525 492.285 641.932 454.707C592.228 395.586 508.5 292.5 427.976 277.32C378.302 270.249 266.258 274.096 215.477 346.053C185.957 376.053 147.191 433.873 157.001 508.982C161.51 543.506 182.535 562.673 201.626 568.347C234.748 578.191 267.042 563.252 293.476 548.593C330.138 528.26 365.176 499.13 390.292 455.322C409.87 421.174 423.021 376.768 418.287 320.527C418.287 270.148 384.01 191.642 366.872 158.686C316.622 75.9091 251 52.2866 193.281 37.6926C168.596 31.451 144.225 28.1794 120.196 26.4796C3.14702 18.1994 116.829 33.026 24 36.4438" stroke="#F5CFC2" strokeOpacity="0.35" strokeWidth="47" strokeLinecap="round" style={{ strokeDashoffset: 0, strokeDasharray: 'none' }}></path>
            </svg>
          </div>
        </div>
      {/* Edge white gradients removed to avoid fade at left/right edges over content */}
      </div>
      <Hero />
      <TopVendors />
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mt-4 flex items-center justify-center">
          <Link
            href="/vendors"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium bg-white/10 backdrop-blur-lg border border-gray-300 text-black shadow-[inset_0_2px_12px_rgba(0,0,0,0.08)] transition-all hover:bg-[#E8B199] hover:border-[#E8B199] hover:text-white hover:scale-[1.02] md:w-auto"
          >
            tout découvrir
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M7 17L17 7"/>
              <path d="M8 7h9v9"/>
            </svg>
          </Link>
        </div>
      </div>
      {/* Séparation inspirée du footer (compacte, marges symétriques) */}
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="my-6 h-px bg-black/10" />
      </div>
      <LatestAuctions />
      <SellerCTA />
      <SiteFooter />
    </div>
  );
}
