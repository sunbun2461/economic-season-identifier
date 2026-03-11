import { useSeason } from '../context/SeasonContext';
import { ALL_PHASES, type Season, type Phase } from '../types';

export default function SeasonKeyBar() {
  const { season, phase, setOverride } = useSeason();

  return (
    <div id="season-key-bar" className="overflow-x-auto sticky top-14 z-40">
      <div className="flex min-w-max px-2">
        {ALL_PHASES.map(p => {
          const isActive = p.season === season && p.phase === phase;
          return (
            <div
              key={`${p.season}-${p.phase}`}
              className={`phase-pill${isActive ? ' active' : ''}`}
              data-season={p.season}
              data-phase={p.phase}
              onClick={() => setOverride(p.season as Season, p.phase as Phase)}
            >
              <span>{p.emoji} {p.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
