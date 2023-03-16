import { LiteEngine } from "./engines/engine";
import { LiteRoundRobinEngine } from "./engines/roundRobin";
import { LiteSingleEngine } from "./engines/single";
import {
    Functions,
    liteServer_getAccountState,
    liteServer_getAccountStatePrunned,
    liteServer_getAllShardsInfo,
    liteServer_getBlock,
    liteServer_getBlockHeader,
    liteServer_getBlockProof,
    liteServer_getConfigAll,
    liteServer_getConfigParams,
    liteServer_getLibraries,
    liteServer_getMasterchainInfo,
    liteServer_getMasterchainInfoExt,
    liteServer_getOneTransaction,
    liteServer_getShardBlockProof,
    liteServer_getShardInfo,
    liteServer_getState,
    liteServer_getTime,
    liteServer_getTransactions,
    liteServer_getValidatorStats,
    liteServer_getVersion,
    liteServer_listBlockTransactions,
    liteServer_lookupBlock,
    liteServer_runSmcMethod,
    liteServer_sendMessage
} from "./schema";

type RequestParams = { timeout?: number };

export class LiteClient {

    static create(endpoints: { host: string, publicKey: string, client?: 'tcp' | 'ws', reconnectTimeout?: number }[]) {
        if (endpoints.length === 0) {
            throw new Error('At least one endpoint required');
        }
        if (endpoints.length === 1) {
            return new LiteClient(new LiteSingleEngine(endpoints[0]));
        }
        return new LiteClient(new LiteRoundRobinEngine(endpoints.map((e) => new LiteSingleEngine(e))));
    }

    readonly engine: LiteEngine;

    constructor(engine: LiteEngine) {
        this.engine = engine;
    }

    getMasterchainInfo = async (request: liteServer_getMasterchainInfo, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_getMasterchainInfo, request, args);
    }

    getMasterchainInfoExt = async (request: liteServer_getMasterchainInfoExt, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_getMasterchainInfoExt, request, args);
    }

    getTime = async (request: liteServer_getTime, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_getTime, request, args);
    }

    getVersion = async (request: liteServer_getVersion, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_getVersion, request, args);
    }

    getBlock = async (request: liteServer_getBlock, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_getBlock, request, args);
    }

    getState = async (request: liteServer_getState, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_getState, request, args);
    }

    getBlockHeader = async (request: liteServer_getBlockHeader, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_getBlockHeader, request, args);
    }

    sendMessage = async (request: liteServer_sendMessage, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_sendMessage, request, args);
    }

    getAccountState = async (request: liteServer_getAccountState, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_getAccountState, request, args);
    }

    getAccountStatePrunned = async (request: liteServer_getAccountStatePrunned, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_getAccountStatePrunned, request, args);
    }

    runSmcMethod = async (request: liteServer_runSmcMethod, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_runSmcMethod, request, args);
    }

    getShardInfo = async (request: liteServer_getShardInfo, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_getShardInfo, request, args);
    }

    getAllShardsInfo = async (request: liteServer_getAllShardsInfo, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_getAllShardsInfo, request, args);
    }

    getOneTransaction = async (request: liteServer_getOneTransaction, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_getOneTransaction, request, args);
    }

    getTransactions = async (request: liteServer_getTransactions, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_getTransactions, request, args);
    }

    lookupBlock = async (request: liteServer_lookupBlock, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_lookupBlock, request, args);
    };

    listBlockTransactions = async (request: liteServer_listBlockTransactions, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_listBlockTransactions, request, args);
    }

    getBlockProof = async (request: liteServer_getBlockProof, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_getBlockProof, request, args);
    }

    getConfigAll = async (request: liteServer_getConfigAll, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_getConfigAll, request, args);
    }

    getConfigParams = async (request: liteServer_getConfigParams, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_getConfigParams, request, args);
    }

    getValidatorStats = async (request: liteServer_getValidatorStats, args?: RequestParams) => {
        return this.engine.query(Functions.liteServer_getValidatorStats, request, args);
    }

    getLibraries = async (request: liteServer_getLibraries, args?: { timeout?: number, awaitSeqno?: number }) => {
        return this.engine.query(Functions.liteServer_getLibraries, request, args);
    }

    getShardBlockProof = async (request: liteServer_getShardBlockProof, args?: { timeout?: number, awaitSeqno?: number }) => {
        return this.engine.query(Functions.liteServer_getShardBlockProof, request, args);
    }
}