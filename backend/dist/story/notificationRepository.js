"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logStoryNotification = logStoryNotification;
exports.fetchStoryNotifications = fetchStoryNotifications;
const env_js_1 = require("../worker/env.js");
const database_js_1 = require("../database.js");
const env = (0, env_js_1.loadEnv)();
async function logStoryNotification(eventType, payload) {
    try {
        await (0, database_js_1.query)(`insert into public.story_notifications (event_type, payload) values ($1, $2)`, [eventType, payload]);
    }
    catch (error) {
        console.error("[notifications] failed to log", error);
    }
}
async function fetchStoryNotifications(limit = 20) {
    const result = await (0, database_js_1.query)(`select id, event_type, payload, to_char(created_at, 'YYYY-MM-DD HH24:MI') as created
     from public.story_notifications
     order by created_at desc
     limit $1`, [limit]);
    return result.rows.map((row) => ({
        id: row.id,
        eventType: row.event_type,
        payload: row.payload,
        createdAt: row.created,
    }));
}
