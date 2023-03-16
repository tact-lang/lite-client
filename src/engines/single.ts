import { randomBytes } from "tweetnacl";
import { TLFunction, TLReadBuffer, TLWriteBuffer } from "ton-tl";
import { ADNLClient, ADNLClientTCP, ADNLClientWS } from "adnl";
import { Codecs, Functions } from "../schema";
import { LiteEngine } from "./engine";
import EventEmitter from "events";

type QueryReference = {
    f: TLFunction<any, any>;
    packet: Buffer,
    resolver: (res: any) => void;
    reject: (res: any) => void;
    timeout: number;
};

const defaultArgs = { timeout: 5000 }

export class LiteSingleEngine extends EventEmitter implements LiteEngine {
    readonly host: string
    readonly publicKey: Buffer;
    #currentClient: ADNLClient | null = null;
    #ready = false;
    #closed = true;
    #queries: Map<string, QueryReference> = new Map();
    #clientType: 'tcp' | 'ws'
    #reconnectTimeout: number

    constructor(args: { host: string, publicKey: string, client?: 'tcp' | 'ws', reconnectTimeout?: number }) {
        super()

        this.host = args.host;
        this.publicKey = Buffer.from(args.publicKey, 'base64');
        this.#clientType = args.client || 'tcp'
        this.#reconnectTimeout = args.reconnectTimeout || 10000
        this.connect();
    }

    isClosed() {
        return this.#closed
    }

    isReady() {
        return this.#ready
    }

    async query<REQ, RES>(f: TLFunction<REQ, RES>, req: REQ, queryArgs?: { timeout?: number, awaitSeqno?: number }): Promise<RES> {
        if (this.#closed) {
            throw new Error('Engine is closed');
        }

        const args = { ...defaultArgs, ...queryArgs }

        let id = Buffer.from(randomBytes(32));

        // Request
        let writer = new TLWriteBuffer();
        if (args.awaitSeqno !== undefined) {
            Functions.liteServer_waitMasterchainSeqno.encodeRequest({ kind: 'liteServer.waitMasterchainSeqno', seqno: args.awaitSeqno, timeoutMs: args.timeout }, writer);
        }
        f.encodeRequest(req, writer);
        let body = writer.build();

        // Lite server query
        let lsQuery = new TLWriteBuffer();
        Functions.liteServer_query.encodeRequest({ kind: 'liteServer.query', data: body }, lsQuery);
        let lsbody = lsQuery.build();

        // ADNL body
        let adnlWriter = new TLWriteBuffer();
        Codecs.adnl_Message.encode({ kind: 'adnl.message.query', queryId: id, query: lsbody }, adnlWriter);
        const packet = adnlWriter.build();

        return new Promise<RES>((resolve, reject) => {

            // Send
            if (this.#ready) {
                this.#currentClient!.write(packet);
            }

            // Register query
            this.#queries.set(id.toString('hex'), { resolver: resolve, reject, f, packet, timeout: args.timeout });

            // Query timeout
            setTimeout(() => {
                let ex = this.#queries.get(id.toString('hex'));
                if (ex) {
                    this.#queries.delete(id.toString('hex'));
                    ex.reject(new Error('Timeout'));
                }
            }, args.timeout);
        });
    }

    close() {
        this.#closed = true;
        if (this.#currentClient) {
            let c = this.#currentClient!;
            this.#ready = false;
            this.#currentClient = null;
            c.end();
        }
    }

    private connect() {
        // Configure new client
        const client = this.#clientType === 'ws' ? new ADNLClientWS(
            this.host,
            this.publicKey
        ) : new ADNLClientTCP(
            this.host,
            this.publicKey
        );
        client.connect()
        client.on('connect', () => {
            if (this.#currentClient === client) {
                this.onConencted();
                this.emit('connect')
            }
        })
        client.on('close', () => {
            if (this.#currentClient === client) {
                this.onClosed();
                this.emit('close')
            }
        });
        client.on('data', (data) => {
            if (this.#currentClient === client) {
                this.onData(data);
            }
        });
        client.on('ready', async () => {
            if (this.#currentClient === client) {
                this.onReady();
                this.emit('ready')
            }
        });
        client.on('error', (err) => {
            this.close()
            this.emit('error')

            setTimeout(() => {
                this.#closed = false
                this.connect();
            }, 30000)
        })

        // Persist client
        this.#currentClient = client;
    }

    private onConencted = () => {
        this.#closed = false
    }

    private onReady = () => {
        this.#ready = true;

        // Write all pendings
        for (let q of this.#queries) {
            this.#currentClient!.write(q[1].packet);
        }
    }

    private onData = (data: Buffer) => {
        let answer = Codecs.adnl_Message.decode(new TLReadBuffer(data));
        if (answer.kind === 'adnl.message.answer') {
            let id = answer.queryId.toString('hex')
            let q = this.#queries.get(id);
            if (q) {
                this.#queries.delete(id);

                // Decode response
                if (answer.answer.readInt32LE(0) === -1146494648) {
                    q.reject(new Error(Codecs.liteServer_Error.decode(new TLReadBuffer(answer.answer)).message));
                } else {
                    try {
                        let decoded = q.f.decodeResponse(new TLReadBuffer(answer.answer));

                        // Resolve
                        q.resolver(decoded);
                    } catch (e) {
                        // Reject
                        q.reject(e);
                    }
                }
            }
        }
    }

    private onClosed = () => {
        this.#currentClient = null;
        this.#ready = false;
        setTimeout(() => {
            if (!this.#closed) {
                this.connect();
            }
        }, this.#reconnectTimeout);
    }
}