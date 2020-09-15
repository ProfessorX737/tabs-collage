## Tabs Collage - a Google Chrome extension
Easily navigate, manage and search your chrome tabs through a live 
updated collage view of site screenshots for all your tabs.

### Inspiration
If you are like me you most likely have up to 100 or more tabs open in chrome especially if you are doing research or am a programmer learning how to code. These tabs may be in different windows and managing your tabs let alone finding them is always a nightmare. I came up with the idea to solve this problem when I heard CSESoc UNSW was hosting personal projects competition.

### Demo
See youtube video:

Download from the chrome extension store:


### Tech Stack
- React for front-end
- Redux for front-end state management
- Chrome extension API

### How to run as a Chrome Extension in developer mode
1. Install yarn and nodejs
2. Clone the project
3. Type 'yarn install' in the project directory
4. Type 'yarn build' in the project directory. This should create a build folder
5. Go to 'chrome://extensions/' and turn on 'Developer mode' at the top right
6. Click 'Load unpacked' and select the build folder that was created in step 4
7. Open the extension by selecting it in the dropdown after clicking the extension puzzle icon on the toolbar of your chrome window.

The extension will open in a new tab. If there are tabs that existed before the extension was installed there will be loading window.

### How to run in UI test mode
You can run in development mode where the tabs and images are hardcoded
1. Install yarn and nodejs
2. Clone the project and cd into it
3. Type 'yarn install'
4. Type 'yarn start'

### Troubleshooting:
- If there any sites that start with 'https://' or 'http://' and the image for that site is not found try refreshing the extension.
- If you are restoring your chrome session you may find that the extension may not be responsive until you click on the associated extension icon.