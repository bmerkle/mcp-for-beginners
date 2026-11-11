import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

const port = 8000;

const app = express();
app.use(express.json());

// Toy credential for the lesson, not production authentication.
function isValid(authorization: string | undefined): boolean {
    return authorization === "Bearer secret123";
}

// Middleware: every request must carry a valid Authorization header
app.use((req, res, next) => {
    // Do not log request headers: Authorization may contain a credential.
    console.log('Request received:', req.method, req.url);
    const authorization = req.headers.authorization;
    if (!isValid(authorization)) {
        res.status(401).send('Unauthorized');
        return;
    }

    next();
});

// Map to store transports by session ID (a Map, so names like "__proto__"
// or "toString" are never mistaken for a session)
const transports = new Map<string, StreamableHTTPServerTransport>();

// Handle POST requests for client-to-server communication
app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  const existing = sessionId ? transports.get(sessionId) : undefined;
  if (existing) {
    // Reuse existing transport
    transport = existing;
  } else if (!sessionId && isInitializeRequest(req.body)) {
    // New initialization request
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        transports.set(sessionId, transport);
      }
    });

    // Clean up transport when closed
    transport.onclose = () => {
      if (transport.sessionId) {
        transports.delete(transport.sessionId);
      }
    };

    const server = new McpServer({
      name: "example-server",
      version: "1.0.0"
    });

    server.tool(
      "get-current-time",
      "Get the current server time in UTC",
      async () => ({
        content: [{ type: "text", text: new Date().toISOString() }]
      })
    );

    await server.connect(transport);
  } else {
    res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Bad Request: No valid session ID provided',
      },
      id: null,
    });
    return;
  }

  // Handle the request
  await transport.handleRequest(req, res, req.body);
});

// Reusable handler for GET and DELETE requests
const handleSessionRequest = async (req: express.Request, res: express.Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  const transport = sessionId ? transports.get(sessionId) : undefined;
  if (!transport) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  await transport.handleRequest(req, res);
};

// Handle GET requests for server-to-client notifications via SSE
app.get('/mcp', handleSessionRequest);

// Handle DELETE requests for session termination
app.delete('/mcp', handleSessionRequest);

app.listen(port, () => {
    console.log(`MCP server listening on http://localhost:${port}/mcp`);
});
