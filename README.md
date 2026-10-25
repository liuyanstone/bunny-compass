# Bunny Compass / 萌兔指南针
A rotating rabbit maze game with 120 solvable mazes, English and Simplified Chinese.

Play at https://liuyanstone.github.io/bunny-compass/ — no account or sign-in required.

Select English / 中文 in the header. Your language preference and maze completion are saved in your browser.

Use arrow keys, WASD, or the onscreen controls to guide Clover to the carrot exit. The maze, bunny, and controls rotate together by 90 degrees at random intervals. Up follows the coral compass arrow.

Three difficulties, each with 40 seeded mazes across five shapes. Every maze is generated as a spanning tree and validated for reachability.

For development, serve this folder using `python3 -m http.server 8767`. Run `node check.mjs` to verify all 120 maze solutions.
