"use strict";
/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * PROPRIETARY AND CONFIDENTIAL - DO NOT DISTRIBUTE
 *
 * This source code is the exclusive property of Cronk Companies, LLC.
 * Unauthorized copying, modification, or distribution of this file,
 * via any medium, is strictly prohibited.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitFeedback = submitFeedback;
exports.getUserFeedback = getUserFeedback;
exports.getAllFeedback = getAllFeedback;
exports.exportFeedbackToText = exportFeedbackToText;
const env_js_1 = require("../worker/env.js");
const database_js_1 = require("../database.js");
const env = (0, env_js_1.loadEnv)();
async function submitFeedback(data) {
    const result = await (0, database_js_1.query)(`INSERT INTO user_feedback (
      user_id, username, feedback_type, subject, content,
      page_context, user_agent, priority
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`, [
        data.userId,
        data.username,
        data.feedbackType,
        data.subject,
        data.content,
        data.pageContext,
        data.userAgent,
        // Auto-set priority based on type
        data.feedbackType === 'bug' ? 'high' : 'normal'
    ]);
    return result.rows[0];
}
async function getUserFeedback(userId) {
    const result = await (0, database_js_1.query)(`SELECT * FROM user_feedback 
     WHERE user_id = $1 
     ORDER BY created_at DESC`, [userId]);
    return result.rows;
}
async function getAllFeedback(status, type, limit = 100) {
    let sql = `SELECT f.*, u.username as user_username
             FROM user_feedback f
             LEFT JOIN user_profiles u ON f.user_id = u.user_id
             WHERE 1=1`;
    const params = [];
    let paramIndex = 1;
    if (status) {
        sql += ` AND f.status = $${paramIndex++}`;
        params.push(status);
    }
    if (type) {
        sql += ` AND f.feedback_type = $${paramIndex++}`;
        params.push(type);
    }
    sql += ` ORDER BY f.created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);
    const result = await (0, database_js_1.query)(sql, params);
    return result.rows;
}
async function exportFeedbackToText(startDate, endDate) {
    const result = await (0, database_js_1.query)(`SELECT export_feedback_to_text($1, $2) as feedback_text`, [startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate || new Date()]);
    return result.rows[0].feedback_text;
}
