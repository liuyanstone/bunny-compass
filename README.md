# Bunny Compass / 萌兔指南针
Three starter mazes each day, followed by optional single extra mazes. Scores reward complexity and speed; the daily total keeps the best score for each difficulty. English and Simplified Chinese. No sign-in required.

Play: https://liuyanstone.github.io/bunny-compass/

## Daily challenge
Each local calendar day has three fixed, solvable mazes in order: one easy, one medium, and one hard. Their complexity scores increase across the three. Date-based generation makes the daily set stable when reopening the game and produces a new set for the next day.

Use arrow keys, WASD, or the fixed onscreen arrow pad. The maze, rabbit, and coral compass arrow turn at random intervals. Easy and Medium make quarter turns. Hard starts at 90°, 180°, or 270° and changes among those orientations, never upright. Hard animation interpolates between 90° and 270° without passing through 0°, and restart/reload also retain a non-upright orientation. Up always follows the coral arrow; the buttons stay in physical keyboard layout.

Complete the three starter mazes in order. Then choose Easy, Medium or Hard to generate one extra maze at a time. Finish the current extra maze before choosing another. Each completed maze is recorded once, and the daily total is the best Easy + best Medium + best Hard score across starter and extra mazes. A lower extra score never reduces the total. An unfinished extra maze resumes after reopening, including elapsed time, position, turns and orientation. Previous days' scores stay in local history. Earlier completed four-maze days retain all four historical scores. For the current day, the first three results and any checkpoint among those mazes are retained; a former fourth maze is no longer required or included in today's total.

## Scoring
- Complexity base = difficulty tier × 100 + shortest-path steps × 5 + junctions along that shortest path × 10.
- Tiers are easy 1, medium 2, and hard 3.
- Speed bonus = floor(complexity base × 60 / (60 + active completion seconds)).
- Maze score = complexity base + speed bonus.
- Daily total = highest Easy score + highest Medium score + highest Hard score for that local date. Replays are not added together.

More complex mazes earn a higher base. Faster completion earns a larger bonus; every finish retains the full base with no time limit. The chosen daily sequence has strictly increasing complexity bases. The in-game scorecard breaks down complexity, time, speed bonus, and total for each maze.

Pauses do not count toward active completion time. Restarting preserves time already spent. Position, elapsed time, moves, turns, and board orientation are checkpointed during play. Reloading resumes unfinished play paused; it does not reset the speed timer. Completed scores are immutable and cannot be awarded twice. The local calendar day is checked during play and on returning to the tab.

## Sound, language, and readability
Gentle step sounds, quiet wall bumps, and a success melody use local Web Audio. Sound settings and language choice are remembered. Larger text, higher contrast, and larger controls support comfortable reading in English and Chinese.

Daily scores, history, and checkpoints are stored on this browser/device. There are no accounts or cross-device syncing.

## Development
Buildless HTML, CSS, SVG, and ES modules. Serve with `python3 -m http.server 8775`.

- `node check-daily.mjs`: 270 daily mazes across 90 dates; solvability; progressive complexity; speed scoring; sums; three starter scores; unlimited extra mazes after those; best-per-level totals; duplicate prevention; checkpoint restore; fractional timing consistency; local-day rollover; historical totals.
- `node check.mjs`: the original maze generator's reachability and movement checks.
- `node check-audio.mjs`: audio activation, gentle envelopes, mute, persistence, and distinct outcome cues.

Browser checks cover starter completion, extra maze selection, lower-score preservation, saved best scores, extra maze pause/reload, hard orientation, restart behavior, and Chinese translation. Rotation tests cover 900 hard transitions and their interpolated frames, with no upright frames. Versioned module and stylesheet URLs keep updates coherent for returning browsers.
