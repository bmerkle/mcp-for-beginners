Here's a sample demonstrating MCP App

## Install 

1. Navigate to the *my-app* folder
1. Run `npm install`, this should install frontend and backend dependencies

Verify the backend compiles by running:

```sh
npx tsc --noEmit
```

There should be no output if everything is fine.

## Run backend

> `npm start` runs two processes with the `concurrently` package: Vite rebuilds the app UI (`mcp-app.html`) on changes, and `tsx` runs the server (`main.ts`). `concurrently` and `cross-env` are cross-platform, so this also works on Windows:

```json
"start": "concurrently \"cross-env NODE_ENV=development INPUT=mcp-app.html vite build --watch\" \"tsx watch main.ts\""
```

This app has two parts, a backend part and a host part.

Start the backend by calling:

```sh
npm start
```

This should start the backend on `http://localhost:3001/mcp`. It exposes the tools `get-time`, `get-faq`, `play-rps`, `get-app-info`, `simple-click` and `ping`; all but `ping` have a UI resource (`ui://...`) that a host renders.

> Note, if you're in a Codespace, you may need to set port visibility to public. Check you can reach endpoint in the browser through https://<name of Codespace>.app.github.dev/mcp

## Choice -1 Test the app in Visual Studio Code

To test the solution in Visual Studio Code, do the following:

- Add a server entry to `mcp.json` like so:

    ```json
    {
        "servers": {
            "my-mcp-server-7178eca7": {
                "url": "http://localhost:3001/mcp",
                "type": "http"
            }
        },
        "inputs": []
    }
    ```

1. Click the "start" button in *mcp.json*
1. Make sure a chat window is open and type `get-faq`, you should see a result like so:

    ![Visual Studio Code MCP Apps](../../assets/vscode-ui.png)

## Choice -2- Test the app with a host

This lesson includes a copy of the basic host from <https://github.com/modelcontextprotocol/ext-apps> in [*ext-apps/examples/basic-host*](../../ext-apps/examples/basic-host/). It installs and builds on its own, so you don't need to clone the upstream repo. That repo contains more hosts if you want to try others.

Keep the backend from the previous step running, then in a separate terminal:

1. Navigate to *03-GettingStarted/15-mcp-apps/ext-apps/examples/basic-host*.

1. Install dependencies:

    ```sh
    npm install
    ```

1. Build and start the host:

    ```sh
    npm start
    ```

    This serves the host on `http://localhost:8080` (and its sandbox on port 8081). Open it in your browser; it connects to the backend at `http://localhost:3001/mcp` and you should see the app running like so:

    ![App running](../../assets/mcp-app.png)

> **Codespace:** forward ports 8080 and 8081, and point the host at your forwarded backend URL with the `SERVERS` environment variable, for example `SERVERS='["https://<codespace-name>-3001.app.github.dev/mcp"]' npm start`.

## Test out the app

Try the app in the following way:

- Select "Call Tool" button and you should see the results like so:

    ![Tool result](../../assets/tool-result.png)

Great, it's all working.
