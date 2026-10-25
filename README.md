# Bunny Compass / 萌兔指南针
Four rotating rabbit mazes each day, scored for complexity and speed. English and Simplified Chinese. No sign-in required.

Play: https://liuyanstone.github.io/bunny-compass/

## Daily challenge
Each local calendar day has four fixed, solvable mazes in order: one easy, one medium, and two hard. Their complexity scores increase across the four. Date-based generation makes the daily set stable when reopening the game and produces a new set for the next day.

Use arrow keys, WASD, or the fixed onscreen arrow pad. The maze, rabbit, and coral compass arrow rotate by 90 degrees at random intervals. Up always follows the coral arrow; the buttons stay in physical keyboard layout.

Each maze scores only once. Completing it unlocks the next one, and all four scores add to that day's total. After all four, the scorecard remains available until the next day's fresh challenge. Previous days' scores stay in local history.

## Scoring
- Complexity base = difficulty tier × 100 + shortest-path steps × 5 + junctions along that shortest path × 10.
- Tiers are easy 1, medium 2, and hard 3.
- Speed bonus = floor(complexity base × 60 / (60 + active completion seconds)).
- Maze score = complexity base + speed bonus.
- Daily total = the sum of that day's four maze scores.

More complex mazes earn a higher base. Faster completion earns a larger bonus; every finish retains the full base with no time limit. The chosen daily sequence has strictly increasing complexity bases. The in-game scorecard breaks down complexity, time, speed bonus, and total for each maze.

Pauses do not count toward active completion time. Restarting preserves time already spent. Position, elapsed time, moves, turns, and board orientation are checkpointed during play. Reloading resumes unfinished play paused; it does not reset the speed timer. Completed scores are immutable and cannot be awarded twice. The local calendar day is checked during play and on returning to the tab.

## Sound, language, and readability
Gentle step sounds, quiet wall bumps, and a success melody use local Web Audio. Sound settings and language choice are remembered. Larger text, higher contrast, and larger controls support comfortable reading in English and Chinese.

Daily scores, history, and checkpoints are stored on this browser/device. There are no accounts or cross-device syncing.

## Development
Buildless HTML, CSS, SVG, and ES modules. Serve with `python3 -m http.server 8775`.

- `node check-daily.mjs`: 360 daily mazes across 90 dates; solvability; progressive complexity; speed scoring; sums; exactly four scores; duplicate prevention; checkpoint restore; fractional timing consistency; local-day rollover; historical totals.
- `node check.mjs`: the original maze generator's reachability and movement checks.
- `node check-audio.mjs`: audio activation, gentle envelopes, mute, persistence, and distinct outcome cues.

Browser checks cover all four completions, exact scorecard summation, saved completion, restart/reload timing, and Chinese translation. Versioned module and stylesheet URLs keep updates coherent for returning browsers.
