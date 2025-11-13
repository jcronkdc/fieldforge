"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.capture = capture;
const node_fetch_1 = __importDefault(require("node-fetch"));
async function capture(event, posthogKey) {
    if (!posthogKey) {
        console.info(`[analytics] ${event.event}`, event.properties);
        return;
    }
    await (0, node_fetch_1.default)("https://app.posthog.com/capture/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${posthogKey}`,
        },
        body: JSON.stringify({
            api_key: posthogKey,
            event: event.event,
            properties: {
                distinct_id: event.properties.distinct_id ?? "hourglass-worker",
                ...event.properties,
            },
        }),
    });
}
