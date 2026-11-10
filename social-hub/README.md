# Social Hub

A responsive Expo social-community starter with a warm, mobile-first feed.

## Features

- Browse the home feed, stories, and topic-based discovery.
- Search posts, follow suggested creators, and filter to followed accounts.
- Create posts, appreciate and save posts, and add comments.
- Edit your profile and exchange messages in sample conversations.
- Keep posts, profile edits, follows, likes, saves, and comments in browser local storage on web.

The app currently uses sample content and does not include authentication, a remote API, or cloud-synced data. On iOS and Android, changes are held in memory for the current app session. Connect a backend and add secure account flows before using it as a production social network.

## Run locally

```sh
npm install
npm run web
```

For iOS or Android, start Expo with `npm run ios` or `npm run android`.

## Deploy the web app

```sh
npm run build:web
```

Upload the generated `dist/` directory to a static web host. The app is configured as a single-page web export.

## Build native apps

Use an Expo account and EAS Build to create signed iOS or Android binaries. Before submitting to an app store, replace the example `ios.bundleIdentifier` and `android.package` values in `app.json` with identifiers you control.
