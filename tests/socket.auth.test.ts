import { AddressInfo } from "net";
import { createServer, Server as HttpServer } from "http";
import { io as createClient, Socket as ClientSocket } from "socket.io-client";
import { prisma } from "../src/lib/prisma";
import { initSocket, AppSocketServer } from "../src/socket";

function connectWithAuth(
  port: number,
  auth: Record<string, unknown>
): Promise<ClientSocket> {
  return new Promise((resolve, reject) => {
    const socket = createClient(`http://localhost:${port}`, {
      auth,
      reconnection: false,
      timeout: 3000,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      resolve(socket);
    });

    socket.on("connect_error", (error: Error) => {
      socket.close();
      reject(error);
    });
  });
}

describe("Socket.io JWT handshake", () => {
  let httpServer: HttpServer;
  let io: AppSocketServer;
  let port: number;

  beforeAll(async () => {
    httpServer = createServer();
    io = initSocket(httpServer);

    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const address = httpServer.address() as AddressInfo;
        port = address.port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      io.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    await prisma.$disconnect();
  });

  it("rejects connection when JWT is missing from handshake auth", async () => {
    await expect(connectWithAuth(port, {})).rejects.toThrow(
      "Authentication required"
    );
  });

  it("rejects connection when JWT is empty", async () => {
    await expect(connectWithAuth(port, { token: "" })).rejects.toThrow(
      "Authentication required"
    );
  });

  it("rejects connection when JWT is invalid", async () => {
    await expect(
      connectWithAuth(port, { token: "not-a-valid-jwt" })
    ).rejects.toThrow("Authentication failed");
  });

  it("rejects room join attempt without a valid JWT at handshake", async () => {
    const socket = createClient(`http://localhost:${port}`, {
      auth: { token: "invalid-token" },
      reconnection: false,
      timeout: 3000,
      transports: ["websocket"],
    });

    const result = await new Promise<{ connected: boolean; error?: string }>(
      (resolve) => {
        socket.on("connect", () => {
          socket.emit("room:join", {
            roomId: "00000000-0000-4000-8000-000000000001",
          });
          resolve({ connected: true });
        });

        socket.on("connect_error", (error: Error) => {
          resolve({ connected: false, error: error.message });
        });
      }
    );

    expect(result.connected).toBe(false);
    expect(result.error).toBe("Authentication failed");
    socket.close();
  });
});
