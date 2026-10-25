# Bunny Compass / 萌兔指南针
A rotating rabbit maze game with 120 solvable mazes, English and Simplified Chinese.

Play at https://liuyanstone.github.io/bunny-compass/ — no account or sign-in required.

Select English / 中文 in the header. Your language preference and maze completion are saved in your browser.

Use arrow keys, WASD, or the onscreen controls to guide Clover to the carrot exit. The maze and bunny rotate by 90 degrees at random intervals. The onscreen arrow pad stays fixed in a normal keyboard layout. Keys retain their original maze directions: Up follows the rotating coral compass arrow. For example, when that arrow points right, pressing Up moves Clover right on the screen.

Three difficulties, each with 40 seeded mazes across five shapes. Every maze is generated as a spanning tree and validated for reachability.

For development, serve this folder using `python3 -m http.server 8767`. Run `node check.mjs` to verify all 120 maze solutions.

## Sound and readability
Gentle step sounds and a short success melody are synthesized locally with Web Audio. Use the Sound on / Sound off button; the setting is saved in this browser. Wall collisions have a quiet low bump. This maze game has no losing state. Audio begins after a player interaction.

Instructions use 18px text, controls use 16–18px text or larger, secondary labels use 14px or larger, and buttons have larger touch targets. English and Chinese layouts are supported.

Run `node check-audio.mjs` to verify cue scheduling, mute behavior, saved preferences, and distinct outcome melodies.
