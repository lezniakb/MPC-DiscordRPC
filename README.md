# MPC-DiscordRPC
Discord Rich Presence for Media Player Classic (Home Cinema and Black Edition)

![Media Player Classic Home Cinema and Black Edition Rich Presence on Discord small profile](https://i.imgur.com/QAAJZgL.png)

## How does this work?
This program fetches playback data MPC-HC Web Interface, and displays it in your Discord profile through their wonderful [Rich Presence](https://discordapp.com/rich-presence) API.

Please note that this only works with [Discord desktop client](https://discordapp.com/download), not with the web app.

## How to install
1. Open your Media Player Classic, go to `View > Options > Player > Web Interface` and enable `Listen on port:` option. The default port is `13579`. If you wish to change it, please edit the `config.js` file after you download the project.

![Here's how to do it:](https://i.imgur.com/XI4VXh6.jpeg)

2. Install [`Node.JS`](https://nodejs.org/en/download/current/) (using latest version is recommended).

3. [Download this project as a .zip file](https://github.com/lezniakb/MPC-DiscordRPC.git). Extract it to an empty folder and open your terminal in project directory. Otherwise, if you have [Git](https://git-scm.com/) installed, run:

```sh
git clone https://github.com/lezniakb/MPC-DiscordRPC.git && cd MPC-DiscordRPC
```

4. Install dependencies using: 
```sh
npm i
``` 

5. Start the program using: 
```sh
npm start
``` 
or via

```sh
node index.js
```
(if you have Node.js in your PATH Environment variable)

> Note: Using `npm start` will start the program as a background process so you don't need to keep a terminal window open in order to keep the script running. Thus, you may close your terminal window after running this command.

It will now show in your Discord profile what you're watching/listening to on MPC.

## Troubleshooting
If discord stopped showing your playback info, just run:

```
npm stop
```
(in case you used `npm start` to run it)

## `config.js` options

#### `exports.port`
Default: `13579`

Port on which MPC Web Interface is running. See the [How to install](#how-to-install) section above to learn more.

#### `exports.ignoreBrackets`
Default: `true`

Whether to omit brackets `[]` and its content in filenames. Useful if you don't want to show on your profile those info tags that usually comes inside brackets in filenames, like `[1080p]`, `[Translator Group Name]`, etc. You can set it to `false` or remove this line to turn off this behavior.

#### `exports.ignoreFiletype`
Default: `false`

Whether to omit filetype. Useful if you don't want to show on your profile the type of the file that is currently open, for example `.mp4`, `.mkv`, `.flac`. You can set it to `true` to turn on this behavior.

#### `exports.replaceUnderscore`
Default: `true`

Whether to replace `_` with space. Useful if you have files like `Your_Favourite_Movie`. You can set it to `false` or remove this line to turn off this behavior.

#### `exports.replaceDots`
Default: `true`

Whether to replace dot (`.`) characters (except the file extension one) with spaces. This way, `Your.Favourite.Movie.mp4` will be displayed as `Your Favourite Movie.mp4`. You can set it to `false` or remove this line to turn off this behavior.

#### `exports.showRemainingTime`
Default: `false`

Whether to display the current file's remaining playback time while playing, instead of showing the elapsed time.
