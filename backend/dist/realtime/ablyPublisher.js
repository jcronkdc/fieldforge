"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishSessionEvent = publishSessionEvent;
exports.publishTurnEvent = publishTurnEvent;
exports.createTokenRequest = createTokenRequest;
const ably_1 = __importDefault(require("ably"));
const env_js_1 = require("../worker/env.js");
const env = (0, env_js_1.loadEnv)();
let restClient = null;
function getRestClient() {
    if (!env.ABLY_API_KEY) {
        return null;
    }
    if (!restClient) {
        restClient = new ably_1.default.Rest({ key: env.ABLY_API_KEY });
    }
    return restClient;
}
function getChannelName(sessionId) {
    return `angrylips:session:${sessionId}`;
}
async function publishSessionEvent(sessionId, eventType, payload) {
    const client = getRestClient();
    if (!client) {
        return;
    }
    try {
        await client.channels.get(getChannelName(sessionId)).publish(eventType, {
            sessionId,
            ...payload,
        });
    }
    catch (error) {
        console.warn("[ably] failed to publish session event", { eventType, sessionId, error });
    }
}
async function publishTurnEvent(sessionId, turnId, eventType, payload) {
    const client = getRestClient();
    if (!client) {
        return;
    }
    try {
        await client.channels.get(getChannelName(sessionId)).publish(eventType, {
            sessionId,
            turnId,
            ...payload,
        });
    }
    catch (error) {
        console.warn("[ably] failed to publish turn event", { eventType, sessionId, turnId, error });
    }
}
async function createTokenRequest(clientId) {
    const client = getRestClient();
    if (!client) {
        throw new Error("Ably is not configured");
    }
    const tokenParams = {};
    if (clientId) {
        tokenParams.clientId = clientId;
    }
    return new Promise((resolve, reject) => {
        client.auth.createTokenRequest(tokenParams, (err, tokenRequest) => {
            if (err || !tokenRequest) {
                reject(err ?? new Error("Ably token request failed"));
                return;
            }
            resolve(tokenRequest);
        });
    });
}
