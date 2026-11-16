# Password Party

A party game for four people in the same room. Two teams, one secret word, one-word clues, and a shared scoreboard that keeps the round moving.

Play it here: [password-party.web.app](https://password-party.web.app)

This is a for-fun project. The app is the board. The chaos is you.

## How a round works

You need four players, split into Team A and Team B, two each.

1. Someone taps **Create Room** and shares the invite link. Everyone else joins and picks a team.
2. When both teams are full, start the game. A word appears, worth **5 points**. The words are slang, internet, and office junk: `Rizz`, `LeftOnRead`, `Monday`.
3. It is Team A's turn first. One player gives a **single-word clue** out loud. Their teammate tries to say the secret word. Then the turn passes to the other team.
4. **Guessed** — your team takes the points on the board, a new word shows up at 5 points, and the other team goes.
5. **Missed** — the word stays, but it is worth one point less, and the other team gets a try. If it hits 0, the word burns and a fresh one starts at 5.
6. First team to **100** wins. Rematch if nobody is ready to go home.

The word is on the screen, so treat one phone as the board and don't let the guesser peek. Clues happen out loud. The app only tracks the word, the points, and whose turn it is.

## House rules

The buttons do not police you. Agree on this before the first word:

- One word per clue. No spelling, no rhymes that are the word, no "it sounds like".
- Don't say the secret word, or a piece of it.
- The clue-giver taps **Guessed** or **Missed**. Arguing about it is part of the game.

## Run it yourself

```bash
npm install
npm run dev
```

Rooms sync through Firebase, so everyone in a room sees the same word and score. `npm test` runs the game-logic tests.
