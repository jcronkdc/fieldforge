import { AuthForm } from "../auth/AuthForm";
import { Button } from "../ui/Button";
import { Pill } from "../ui/Pill";

const featureHighlights = [
  {
    title: "Story Engine",
    description: "Branch timelines, track canon, and replay professor critiques with audit trails.",
    icon: "🧠",
  },
  {
    title: "Character Engine",
    description: "Version characters, map relationships, and surface coherence alerts instantly.",
    icon: "🎭",
  },
  {
    title: "Angry Lips",
    description: "Collaborative mad lib battles with persona-aligned AI assists and live timers.",
    icon: "🔥",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0b152c] to-[#010910] text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-aurora/20 text-aurora">✨</span>
          <span>MythaTron</span>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" size="sm" variant="ghost" onClick={() => window.scrollTo({ top: document.body.scrollHeight })}>
            Explore features
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              const form = document.getElementById("mythatron-auth-card");
              if (form) {
                form.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            Sign in
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-16 pt-6">
        <section className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div className="space-y-8">
            <Pill variant="aurora" className="text-sm normal-case text-aurora">
              Collaborative Story Lab
            </Pill>
            <h1 className="text-3xl font-semibold leading-tight text-slate-50 sm:text-4xl lg:text-5xl">
              Build immersive worlds, evolve characters, and keep every story branch in sync.
            </h1>
            <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
              MythaTron unifies story timelines, character engines, and the Angry Lips party mode into one aurora-lit dashboard. Invite
              collaborators, control the hourglass, and let AI co-hosts keep the narrative sharp.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {featureHighlights.map((feature) => (
                <div key={feature.title} className="rounded-3xl border border-slate-800 bg-black/30 p-5 shadow-lg shadow-aurora/10">
                  <div className="flex items-center gap-3 text-sm font-semibold text-white">
                    <span className="text-lg">{feature.icon}</span>
                    {feature.title}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="mythatron-auth-card" className="w-full">
            <AuthForm
              variant="card"
              titleSignIn="Welcome back"
              titleSignUp="Create your MythaTron account"
              subtitle="Sign in with email and password to access your dashboards."
            />
            <p className="mt-3 text-center text-[0.65rem] uppercase tracking-wide text-slate-500">
              Verified creators only · Secure Supabase auth
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800/80 bg-black/25 p-10 shadow-inner shadow-aurora/5">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Unified dashboards</h2>
              <p className="text-sm text-slate-400">
                Story activity, character dossiers, and Angry Lips sessions surface together so teams stay aligned.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Persona-aware AI</h2>
              <p className="text-sm text-slate-400">
                Pick narrators, professors, or character masks to keep tone consistent across swaps and remixes.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Shared universe lore</h2>
              <p className="text-sm text-slate-400">
                Pull world lore, timelines, and audit trails on demand to maintain continuity while you experiment.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900/80 bg-black/30 px-6 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} MythaTron Labs</span>
          <div className="flex flex-wrap items-center gap-3">
            <span>Support: support@mythatron.com</span>
            <span>·</span>
            <span>Beta cohort access by invite only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


