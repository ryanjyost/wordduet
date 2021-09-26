# WordDuet

**See who can come up with more words using just the letters provided!**

Play it now at 
[https://trusting-ride-a2dc4d.netlify.app/](https://trusting-ride-a2dc4d.netlify.app/)

[See the game rules below](#rules)

## Coding Challenge Details

The basic MVP/proof of concept took approx. 5 hours in total coding time.

That version can be found on the `mvp` branch. This was done ASAP, with little attention paid to code style, UX, performance, etc.

https://user-images.githubusercontent.com/20424498/134790275-2e4c8341-805a-4160-84f4-57d43b6e13c7.mov

After finishing the `mvp` version, I spent a couple more hours of fingers on keys improving the UX/UI, doing some code cleanup and making the site live on the internet. 

That version is on the `main` branch and can be accessed on the web at [https://trusting-ride-a2dc4d.netlify.app/](https://trusting-ride-a2dc4d.netlify.app/)

https://user-images.githubusercontent.com/20424498/134810227-d9e5fe31-571d-4dbd-996c-385cc8878529.mov

### Areas for improvement (non-security related)

- Componetize some, but not aggressively
- Memoize computed variables in render functions
- Isolate firebase interaction to inside the DBService layer / no firebase module imports outside of firebase.js
- Use legit routing system like React Router
- Use legit state management like Mobx, Redux, Context API, etc.
- Refine edge cases (no issues with reloading, handle ties/tiebreaker, etc.)
- Don't use inline styles, modularize or use styling library

### Security Vulnerabilities

- Firebase real-time database is in test mode, anyone can write or read data.
- Firebase credentials are easy to access in the public code/repo
- Validation on inputted data missing to avoid saving nefarious stuff/XSS
- Anyone can stumble upon the results of a completed game that they did not play
- DOS/DDOS attack, use Captcha or something to start/join the game
- 3rd party npm dependencies
- Grabbing gameKey from the url and using without verifying it

## Rules

1. At least two players are required to kick off a game.
2. Only the game creator can officially start the game.
3. Each game has nine randomly generated letters, with a minimum of
   two vowels and two consonants each time.
4. Games last 1 minute / 60 seconds.
5. You CANNOT submit words that...
   1. ...have been used already, by you or another player.
   2. ...use the same letter twice.
   3. ...use characters that are not in the list of 9 random characters provided.
6. Players get a point for each letter used in a submitted word. The more words provided and the longer those words
   are, the greater the points.

## Setup this project locally

1. Fork the project
2. `npm install`
3. `npm start`

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `yarn build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
