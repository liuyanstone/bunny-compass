# Bunny Compass / 萌兔指南针
A rotating rabbit maze game with 120 solvable mazes, English and Simplified Chinese.

Play at https://liuyanstone.github.io/bunny-compass/ — no account or sign-in required.

Select English / 中文 in the header. Your language preference and maze completion are saved in your browser.

Use arrow keys, WASD, or the onscreen controls to guide Clover to the carrot exit. The maze and bunny rotate by 90 degrees at random intervals. The onscreen arrow pad stays fixed in a normal keyboard layout. Keys retain their original maze directions: Up follows the rotating coral compass arrow. For example, when that arrow points right, pressing Up moves Clover right on the screen.

Three difficulties, each with 40 seeded mazes across five shapes. Every maze is generated as a spanning tree and validated for reachability.

For development, serve this folder using `python3 -m http.server 8767`. Run `node check.mjs` to verify all 120 maze solutions.
