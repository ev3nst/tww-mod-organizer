# TWW Mod Organizer

#### _Mod manager tool for Total War: Warhammer 2 & 3_

This is a simple mod manager with features only i needed and tailored towards what i imagined.
Therefore please do not expect so much flexibility.

It's been made with steam in mind so a lot of background code relies on steam. I have not tested with any other type of installation.

## Features

-   Mod profiles
-   Re-ordering mods with a simple drag and drop
-   Viewing mod conflicts
-   Steam integration (check updates, unsubcsribe, viewing mod pages via browser etc.)
-   Save game managing, multiple deletion, starting with selected game from startup
-   Installing manual mods within app with profile in mind. This ensures you do not have to extract mod files into to the game installation and possibly over complicating folder structure for further management
-   Nexus Mods integration - downloading directly with deep links

## To-Do

-   Nexus: endorsing, checking for updates

There are some technical details i need to share;

Conflict details of mods is a memory consuming process therefore it is not live data in the app. When installed a new mod or deleted if you want to get update to the conflict showing in app you simply need to click "Refresh" and the application will process this in the background.

## For Developers

Install packages

```sh
yarn
```

Start the electron app

```sh
yarn start
```

## License

MIT
