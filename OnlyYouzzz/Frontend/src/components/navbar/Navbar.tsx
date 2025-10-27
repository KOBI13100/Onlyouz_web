"use client";
import React from "react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import Search from "./Search";
// import ModelSelect from "./ModelSelect"; // remplacé par ModelsButton
import MessagesButton from "./MessagesButton";
import AuthButton from "./AuthButton";
// Models removed
import SignUpButton from "./SignUpButton";
import { useAuth } from "@/providers/AuthProvider";
import LanguageSwitcher from "./LanguageSwitcher";

type NavbarProps = {
  onSearch?: (query: string) => void;
  onModelChange?: (model: string) => void;
  onMessagesClick?: () => void;
  onAuthClick?: () => void;
};

const Navbar: React.FC<NavbarProps> = ({
  onSearch,
  onModelChange,
  onMessagesClick,
  onAuthClick,
}) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [showSearch, setShowSearch] = React.useState(false);
  const [isHidden, setIsHidden] = React.useState(false);
  const lastYRef = React.useRef(0);

  // Comportement: cacher à la descente, réafficher à la montée (smooth)
  React.useEffect(() => {
    setShowSearch(false); // désactive l'effet d'agrandissement avec la barre de recherche
    lastYRef.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastYRef.current;
      const goingDown = dy > 4;
      const goingUp = dy < -4;
      if (y < 10) {
        setIsHidden(false);
      } else if (goingDown) {
        setIsHidden(true);
      } else if (goingUp) {
        setIsHidden(false);
      }
      lastYRef.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [registerOpen, setRegisterOpen] = React.useState(false);

  return (
    <>
    <header className={`fixed top-0 z-50 w-full bg-transparent transition-transform duration-300 will-change-transform ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <nav className={`${showSearch ? 'w-[min(92vw,1100px)]' : 'w-fit'} mx-auto flex flex-col items-stretch ${showSearch ? 'gap-1' : 'gap-0'} rounded-full bg-white/80 backdrop-blur-lg border border-black/10 shadow-[inset_0_2px_12px_rgba(0,0,0,0.08)] ${showSearch ? 'px-6 md:px-7 py-[1.4rem]' : 'px-4 md:px-5 py-[0.8rem]'} text-black transition-all duration-300`}>
          {/* Top row - proportions identiques à la navbar compacte */}
          <div className={`flex items-center ${showSearch ? 'gap-5' : 'gap-4'}`}>
            <div className="shrink-0">
              <Logo />
            </div>

            <div className={`hidden md:flex flex-1 items-center justify-center ${showSearch ? 'gap-1' : 'gap-1'}`}>
              <a href="/products" className="rounded-full px-3 py-1.5 text-[14px] font-medium text-black/80 hover:bg-black/5 hover:text-black">Catalogue</a>
              <a href="/vendors" className="rounded-full px-3 py-1.5 text-[14px] font-medium text-black/80 hover:bg-black/5 hover:text-black">Vendeurs</a>
            </div>

            {/* Barre de recherche compacte au centre (entre "Vendeurs" et l'avatar) */}
            <div className="hidden md:flex flex-1 justify-center px-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget as HTMLFormElement;
                  const input = form.querySelector('input[name="q"]') as HTMLInputElement | null;
                  const q = (input?.value || '').trim();
                  const params = new URLSearchParams();
                  if (q) params.set('q', q);
                  window.location.assign(`/vendors?${params.toString()}`);
                }}
                className="relative w-full max-w-[420px]"
              >
                <input name="q" placeholder="Rechercher…" className="w-full rounded-full border border-white/60 bg-white/50 backdrop-blur-lg px-4 py-2 pr-10 text-sm placeholder-black/40 shadow-[inset_0_1px_8px_rgba(0,0,0,0.06)] outline-none" />
                <button type="submit" aria-label="Rechercher" className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/3 text-black/70 ring-1 ring-gray-100 shadow-none hover:bg-black/10">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4-4" />
                  </svg>
                </button>
              </form>
            </div>

            <div className={`flex items-center ${showSearch ? 'gap-2.5 ml-6 md:ml-8' : 'gap-2 ml-6 md:ml-8'}` }>
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => location.assign('/mon-espace')}
                    className="h-8 w-8 overflow-hidden rounded-full border border-gray-300 bg-white/10 backdrop-blur-md hover:bg-white/20"
                    title={user.name || 'Mon espace'}
                  >
                    <span className="sr-only">Mon espace</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user.avatarUrl || '/vercel.svg'} alt="avatar" className="h-full w-full object-cover" />
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:scale-[1.04] bg-black hover:bg-black/90`}
                  >
                    Déconnexion
                  </button>
                  <LanguageSwitcher variant="compact" />
                </>
              ) : (
                <>
                  <button onClick={() => setLoginOpen(true)} className="text-[14px] font-medium text-black hover:text-black/80">Connexion</button>
                  <SignUpButton onClick={() => setRegisterOpen(true)} />
                  <LanguageSwitcher variant="compact" />
                </>
              )}
            </div>
          </div>
          {/* Animated secondary row for search only when header est hors écran */}
            <div className={`px-1 overflow-hidden transition-all duration-300 ${showSearch ? 'max-h-36 opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-95'}`} aria-hidden={!showSearch}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget as HTMLFormElement;
                  const input = form.querySelector('input[name="q"]') as HTMLInputElement | null;
                  const q = (input?.value || '').trim();
                  const params = new URLSearchParams();
                  if (q) params.set('q', q);
                  window.location.assign(`/vendors?${params.toString()}`);
                }}
                className="relative mx-auto w-full"
              >
              <input name="q" placeholder="Rechercher un vendeur…" className="w-full rounded-full border border-gray-300 bg-white/90 px-5 py-2.5 pr-12 text-sm placeholder-black/40 shadow-[inset_0_1px_8px_rgba(0,0,0,0.06)] outline-none" />
              <button type="submit" aria-label="Rechercher" className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/80 text-white shadow-sm hover:bg-black/90">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4-4" />
                  </svg>
                </button>
              </form>
            </div>
        </nav>
      </div>
    </header>
    <LoginModal
      open={loginOpen}
      onClose={() => setLoginOpen(false)}
      onSwitchToRegister={() => {
        setLoginOpen(false);
        setRegisterOpen(true);
      }}
    />
    <RegisterModal
      open={registerOpen}
      onClose={() => setRegisterOpen(false)}
      onSwitchToLogin={() => {
        setRegisterOpen(false);
        setLoginOpen(true);
      }}
    />
    </>
  );
};

export default Navbar;


