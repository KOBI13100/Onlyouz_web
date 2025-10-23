export default function DevenirVendeurPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6 py-10 mt-16 en">
      <header className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Devenir vendeur</h1>
        <p className="mx-auto mt-3 max-w-3xl text-black/70 md:text-lg">
          Rejoignez OnlyYouzzz et transformez votre intimité en véritable signature. Une vitrine moderne, des outils simples, et le contrôle entre vos mains.
        </p>
      </header>

      {/* Chips points forts */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:gap-3">
        <Chip icon={<IconKey />} label="Vous gardez la main" />
        <Chip icon={<IconStar />} label="Mise en avant élégante" />
        <Chip icon={<IconBolt />} label="Mise en ligne rapide" />
      </div>

      {/* Bloc avantages moderne */}
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Card title="Vendez à votre rythme" icon={<IconClock />}>
          Fixez vos prix, stockez, et publiez quand vous le souhaitez.
        </Card>
        <Card title="Vitrine soignée" icon={<IconFrame />}>
          Pages vendeurs et produits au design premium, prêtes à convertir.
        </Card>
        <Card title="Messagerie intégrée" icon={<IconChat />}>
          Échangez simplement avec les acheteurs sans dévoiler votre identité.
        </Card>
      </section>

      {/* Appel à l'action */}
      <div className="mt-8 flex items-center justify-center">
        <a
          href="/inscription?role=vendeur"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff4747] px-6 py-3 text-sm font-medium text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-[#ff4747]/90 hover:shadow-md hover:scale-[1.04]"
        >
          Créer mon compte
          <IconArrow />
        </a>
      </div>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] border border-gray-300 bg-white/80 p-5 shadow-[inset_0_1px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-2 text-black/80">
        <span className="text-black/60">{icon}</span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="mt-2 text-sm text-black/70">{children}</p>
    </div>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-black/10 bg-white px-3 py-1.5 text-[12px] shadow-sm">
      <span className="text-black/70">{icon}</span>
      {label}
    </span>
  );
}

function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17l8-8" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

function IconKey() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="7" cy="12" r="3" />
      <path d="M10 12h10l-2 2 2 2" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 17l-5.5 3 1.5-6.2L3 9.5l6.3-.5L12 3l2.7 6 6.3.5-5 4.3 1.5 6.2z" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 3L4 14h6l-1 7 9-11h-6z" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconFrame() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 9h6v6H9z" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}


