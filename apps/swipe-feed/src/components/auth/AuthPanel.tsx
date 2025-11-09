import { Pill } from "../ui/Pill";
import { AuthForm } from "./AuthForm";

export function AuthPanel() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] px-6 py-12 text-white">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-800/80 bg-black/40 shadow-2xl shadow-aurora/10 backdrop-blur">
        <div className="absolute inset-0 bg-gradient-to-br from-aurora/10 via-transparent to-purple-900/20 opacity-60" aria-hidden />
        <div className="relative grid gap-0 md:grid-cols-2">
          <div className="flex flex-col gap-6 border-b border-slate-800/60 p-8 md:border-b-0 md:border-r">
            <Pill variant="aurora" className="w-fit text-sm normal-case text-aurora">
              MythaTron Access
            </Pill>
            <div>
              <h1 className="text-3xl font-semibold">Enter the story lab</h1>
              <p className="mt-2 text-sm text-slate-300">
                Sign in or sign up with your email and password to unlock the dashboards, lore, and collaborative Angry Lips sessions.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-aurora" aria-hidden />
                <span>Create and manage branching stories with audit trails and timelines.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-aurora" aria-hidden />
                <span>Track characters, versions, and relationships from the character engine.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-aurora" aria-hidden />
                <span>Host Angry Lips rooms, invite friends, and sync turns in real time.</span>
              </li>
            </ul>
          </div>

          <AuthForm
            variant="panel"
            titleSignIn="Sign in to your account"
            titleSignUp="Create your account"
            subtitle="Use your email and password to access the MythaTron lab."
          />
        </div>
      </div>
    </div>
  );
}


