# Attendance
[![Build Status](https://travis-ci.org/illinois/attendance.svg?branch=master)](https://travis-ci.org/illinois/attendance)

Card swipe-based attendance app for CS 225 lab sections.

## Setup instructions

```bash
npm install
cp config.js.sample config.js
# Set up config.js
npm run build
npm run start
```

When hosted on a server within the Illinois campus network, the email configuration in [illinois-config.js](illinois-config.js) can be used to send confirmation emails through [Technology Services' outbound relays](https://answers.uillinois.edu/illinois/page.php?id=47888).

## Running in dev mode

You can have the app automatically recompile its assets in "watch" mode as you edit files.

```bash
npm run dev
```

## Testing

```bash
npm run test
```

## Linting

```bash
npm run lint
```
