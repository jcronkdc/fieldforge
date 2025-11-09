import { FC, useMemo, useState } from "react";
import clsx from "clsx";
import { Button } from "./ui/Button";
import { StatBlock } from "./ui/StatBlock";
import { Pill } from "./ui/Pill";
import { Badge } from "./ui/Badge";

interface AngryLipsTileProps {
  onExplore: () => void;
  onPreview?: () => void;
}

const ANGRY_LIPS_DOC = "https://github.com/jcronkdc/greatest/blob/main/docs/angry-lips-spec.md";

interface AngryLipsOption {
  id: string;
  title: string;
  vibe: string;
  length: string;
  blanks: string;
  timer: string;
  persona: string;
  description: string;
  sample: string;
}

const MODE_OPTIONS: AngryLipsOption[] = [
  {
    id: "flash-heist",
    title: "Flash Heist",
    vibe: "Neon caper",
    length: "Quick run",
    blanks: "12 blanks",
    timer: "30s turns",
    persona: "Cipher Narrator",
    description: "Sprint through a high-stakes vault job where every fill is a countdown beat.",
    sample: `"Blast! We must sprint the vault before the timer flashes 12 times."`,
  },
  {
    id: "mythic-roast",
    title: "Mythic Roast",
    vibe: "Comedy roast",
    length: "Classic",
    blanks: "16 blanks",
    timer: "45s turns",
    persona: "Court Jester",
    description: "Epic banquet smack-talk with enchanted utensils and dramatic fanfare.",
    sample: `"Gadzooks! We already roasted across the floating banquet, so Nova double-checks the enchanted ladle."`,
  },
  {
    id: "neon-noir",
    title: "Neon Noir",
    vibe: "After-hours mystery",
    length: "Classic",
    blanks: "18 blanks",
    timer: "60s turns",
    persona: "Night Detective",
    description: "Moody cassette diaries and smoky alley clues with a glitchy twist.",
    sample: `"Hush! We must stalk the archive before the red light blinks 9 times."`,
  },
  {
    id: "cosmic-karaoke",
    title: "Cosmic Karaoke",
    vibe: "Space rave",
    length: "Epic",
    blanks: "22 blanks",
    timer: "75s turns",
    persona: "DJ Nebula",
    description: "Sing-off in zero gravity with chorus bots and celebrity drop-ins.",
    sample: `"Woohoo! We already belted across the asteroid stage, so Vega double-checks the holo-mic."`,
  },
  {
    id: "wildcall-riot",
    title: "Wildcall Riot",
    vibe: "Eco fantasy",
    length: "Classic",
    blanks: "18 blanks",
    timer: "50s turns",
    persona: "Grove Shaman",
    description: "Rally woodland allies with ritual howls and improvised root magic.",
    sample: `"Howl! We must rally the thicket before the moon pulses 8 times."`,
  },
  {
    id: "chrono-chaos",
    title: "Chrono Chaos",
    vibe: "Time heist",
    length: "Epic",
    blanks: "24 blanks",
    timer: "90s turns",
    persona: "Temporal Archivist",
    description: "Hop timelines mid-sentence while the hourglass rewinds and fast-forwards.",
    sample: `"Hold up! We already warped across the ticking atrium, so Atlas double-checks the paradox key."`,
  },
  {
    id: "royal-pantry",
    title: "Royal Pantry Panic",
    vibe: "Kitchen caper",
    length: "Quick run",
    blanks: "12 blanks",
    timer: "35s turns",
    persona: "Sous Sorcerer",
    description: "Sneak into the royal pantry to steal enchanted ingredients before dawn.",
    sample: `"Yikes! We must whisk the pantry before the alarm chimes 5 times."`,
  },
  {
    id: "cosmic-drift",
    title: "Cosmic Drift",
    vibe: "Chill synthwave",
    length: "Classic",
    blanks: "18 blanks",
    timer: "60s turns",
    persona: "Aurora Poet",
    description: "Meditative co-writing with aurora surfers and late-night transmissions.",
    sample: `"Wow! We must surf the drift before the beacon pulses 11 times."`,
  },
  {
    id: "spy-whisper",
    title: "Spy Whisper Network",
    vibe: "Espionage satire",
    length: "Classic",
    blanks: "18 blanks",
    timer: "45s turns",
    persona: "Mask Handler",
    description: "Dead drops, code phrases, and dramatic double-agent reveals.",
    sample: `"Psht! We must decode the safehouse before the lamp flickers 6 times."`,
  },
  {
    id: "ghost-broadcast",
    title: "Ghost Broadcast",
    vibe: "Haunted radio",
    length: "Epic",
    blanks: "24 blanks",
    timer: "80s turns",
    persona: "Spectral Anchor",
    description: "Possessed radio station where callers from beyond drop shocking clues.",
    sample: `"Mercy! We already haunted across the midnight studio, so Echo double-checks the spirit mic."`,
  },
];

export const AngryLipsTile: FC<AngryLipsTileProps> = ({ onExplore, onPreview }) => {
  const [activeOptionId, setActiveOptionId] = useState<string>(MODE_OPTIONS[0].id);
  const activeOption = useMemo(
    () => MODE_OPTIONS.find((option) => option.id === activeOptionId) ?? MODE_OPTIONS[0],
    [activeOptionId]
  );

  return (
    <article className="relative w-full overflow-hidden rounded-3xl border border-slate-800 bg-white/5 shadow-xl transition hover:border-aurora/40 hover:shadow-aurora/30">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-aurora/10 opacity-80" aria-hidden />
      <div className="absolute -left-16 top-1/3 h-52 w-52 -translate-y-1/2 rounded-full bg-aurora/10 blur-3xl" aria-hidden />
      <div className="relative flex min-h-[360px] flex-col gap-6 p-8">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
          <Pill variant="aurora" className="font-semibold normal-case text-sm text-aurora">
            Collab mode
          </Pill>
          <span className="text-slate-500">Swipe-enabled · Party Pack</span>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold text-white">Angry Lips Live</h2>
          <p className="text-lg leading-relaxed text-slate-200">
            It’s your turn to lip off. Toss in a ridiculous fill, keep the hourglass alive, and watch the reveal hit like canon.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-slate-400 sm:grid-cols-3">
          <StatBlock label="Branch style" value="Swipe-to-pass collab" />
          <StatBlock label="Turn control" value="Configurable hourglass" />
          <StatBlock label="AI co-host" value="Persona-aligned saves" />
        </div>

        <div className="space-y-4">
          <div className="text-[0.65rem] uppercase tracking-widest text-slate-500">Pick a mode</div>
          <div className="grid gap-2 md:grid-cols-2">
            {MODE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveOptionId(option.id)}
                className={clsx(
                  "rounded-2xl border border-slate-800/80 bg-black/40 px-4 py-3 text-left transition hover:border-aurora/40 hover:bg-aurora/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurora/60",
                  activeOption.id === option.id && "border-aurora/60 bg-aurora/10"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{option.title}</span>
                  <Pill variant="outline" className="text-[0.65rem] uppercase tracking-wide text-slate-300">
                    {option.vibe}
                  </Pill>
                </div>
                <p className="mt-1 text-xs text-slate-400">{option.description}</p>
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-black/30 p-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">{activeOption.title}</div>
                <p className="text-xs text-slate-400">{activeOption.description}</p>
              </div>
              <Badge label="Vibe" value={activeOption.vibe} highlight />
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
              <StatBlock label="Length" value={activeOption.length} />
              <StatBlock label="Blanks" value={activeOption.blanks} />
              <StatBlock label="Turn timer" value={activeOption.timer} />
              <StatBlock label="AI persona" value={activeOption.persona} />
            </div>
            <blockquote className="mt-4 rounded-2xl border border-aurora/30 bg-aurora/10 p-3 text-sm text-aurora-100 shadow-inner">
              <span className="block text-xs uppercase tracking-wide text-aurora/70">Sample reveal</span>
              <span className="mt-1 block text-sm font-medium text-white">{activeOption.sample}</span>
            </blockquote>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              if (onPreview) {
                onPreview();
              } else {
                onExplore();
                window.open(ANGRY_LIPS_DOC, "_blank", "noopener,noreferrer");
              }
            }}
          >
            {onPreview ? "Launch live turn" : "Dive into spec"}
            <span aria-hidden>→</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              onExplore();
              window.open(ANGRY_LIPS_DOC, "_blank", "noopener,noreferrer");
            }}
          >
            View playbook
          </Button>
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-slate-800/60 bg-black/20 px-6 py-4 text-xs text-slate-400">
        <span className="font-semibold text-slate-200">Swipe to swap • New blanks every round</span>
        <Badge label="On deck" value="Crew vs AI co-host" highlight />
      </footer>
    </article>
  );
};

