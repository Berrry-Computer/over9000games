# Privacy Policy - over9000games (RES-9000)

Effective: October 29, 2026

over9000games ("the app") is a Reddit Developer Platform app that runs retro games inside Reddit posts and generates new games with AI from text descriptions. This policy explains what the app stores and shares. It applies only to the app; Reddit's own [Privacy Policy](https://www.reddit.com/policies/privacy-policy) covers your use of Reddit.

## What the app stores

The app stores data in the storage Reddit provides to apps (Devvit Redis), scoped to the subreddit where the app is installed:

- **Leaderboard scores**: your Reddit username and your best score for each game post you play.
- **Game drafts**: games you create or edit, with their version history and your Reddit user ID. Drafts are deleted automatically 30 days after you last open or change them, or when you delete them.
- **Generation jobs**: the game description you type, the generated game code, the AI model used and your Reddit user ID. These records are kept to show results and recover interrupted generations.
- **Published games**: when you publish a game, its code, title, description, your username as the creator, and a screenshot of the game, which is uploaded to Reddit's media hosting.

The app does not collect your email address, location, contacts, payment information or browsing activity outside the app, and it does not use cookies or tracking.

## What the app shares

- **OpenAI**: to create or edit a game, the app sends your game description (and, when editing, the current game code) along with screenshots of the generated game to the OpenAI API. Your Reddit username and user ID are not sent. OpenAI processes this data under its [API data usage policies](https://openai.com/policies/api-data-usage-policies).
- **Reddit**: published games, their screenshots and comments made through the app are posted to Reddit by the app's account and are public like any other Reddit content.

The app does not sell your data or share it with anyone else.

## Your choices

- You can delete your drafts in the app at any time.
- To have your scores, jobs or published games removed, open an issue at https://github.com/Berrry-Computer/over9000games/issues (do not include personal details in the issue; we will follow up) or ask a moderator of the subreddit to remove the post.

## Children

The app is intended for Reddit users, who must meet Reddit's minimum age requirements.

## Changes

Updates to this policy are published in this file, with the change history visible on GitHub.

## Contact

Questions: https://github.com/Berrry-Computer/over9000games/issues
