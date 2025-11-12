"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeline = getTimeline;
exports.getChapters = getChapters;
exports.addChapter = addChapter;
exports.updateChapter = updateChapter;
exports.removeChapter = removeChapter;
exports.getStoryNodes = getStoryNodes;
exports.saveStoryNodes = saveStoryNodes;
exports.getStoryComments = getStoryComments;
exports.addStoryComment = addStoryComment;
exports.deleteStoryComment = deleteStoryComment;
exports.getWorldLore = getWorldLore;
const env_js_1 = require("../worker/env.js");
const database_js_1 = require("../database.js");
const database_js_2 = __importDefault(require("../database.js"));
const env = (0, env_js_1.loadEnv)();
async function getTimeline(worldId) {
    const result = await (0, database_js_1.query)(`
      select id, parent_branch_id, title, coalesce(author_id, '@unknown') as author_id, status, to_char(created_at, 'YYYY-MM-DD') as created
      from public.story_branches
      where world_id = $1
      order by created_at asc
    `, [worldId]);
    if (result.rowCount === 0) {
        return [];
    }
    return result.rows.map((row) => ({
        id: row.id,
        parentId: row.parent_branch_id ?? undefined,
        title: row.title,
        author: row.author_id,
        createdAt: row.created,
        status: row.status === "canon" ? "canon" : row.status === "fan" ? "fan" : "draft",
    }));
}
async function getChapters(branchId) {
    const result = await (0, database_js_1.query)(`
      select id, branch_id, order_index, title, status
      from public.story_chapters
      where branch_id = $1
      order by order_index asc
    `, [branchId]);
    return result.rows.map((row) => ({
        id: row.id,
        branchId: row.branch_id,
        orderIndex: row.order_index,
        title: row.title,
        status: row.status === "ready" ? "ready" : "draft",
    }));
}
async function addChapter(branchId, title) {
    const result = await (0, database_js_1.query)(`
      insert into public.story_chapters (branch_id, order_index, title)
      values ($1, (select coalesce(max(order_index), -1) + 1 from public.story_chapters where branch_id = $1), $2)
      returning id, branch_id, order_index, title, status
    `, [branchId, title]);
    const row = result.rows[0];
    return {
        id: row.id,
        branchId: row.branch_id,
        orderIndex: row.order_index,
        title: row.title,
        status: row.status === "ready" ? "ready" : "draft",
    };
}
async function updateChapter(id, data) {
    const fields = [];
    const values = [];
    if (data.title !== undefined) {
        fields.push(`title = $${fields.length + 1}`);
        values.push(data.title);
    }
    if (data.status !== undefined) {
        fields.push(`status = $${fields.length + 1}`);
        values.push(data.status);
    }
    if (fields.length === 0)
        return;
    values.push(id);
    await (0, database_js_1.query)(`update public.story_chapters set ${fields.join(", ")} where id = $${fields.length + 1}`, values);
}
async function removeChapter(id) {
    await (0, database_js_1.query)(`delete from public.story_chapters where id = $1`, [id]);
}
async function getStoryNodes(branchId) {
    const result = await (0, database_js_1.query)(`select id, branch_id, order_index, content from public.story_nodes where branch_id = $1 order by order_index asc`, [branchId]);
    return result.rows.map((row) => ({
        id: row.id,
        branchId: row.branch_id,
        orderIndex: row.order_index,
        content: row.content,
    }));
}
async function saveStoryNodes(branchId, nodes) {
    const client = await database_js_2.default.connect();
    try {
        await client.query("BEGIN");
        const keptIds = [];
        for (let index = 0; index < nodes.length; index += 1) {
            const node = nodes[index];
            const orderIndex = Number.isFinite(node.orderIndex) ? node.orderIndex : index;
            const content = node.content ?? "";
            if (node.id && node.id > 0) {
                await client.query(`update public.story_nodes
           set order_index = $1, content = $2
           where id = $3 and branch_id = $4`, [orderIndex, content, node.id, branchId]);
                keptIds.push(node.id);
            }
            else {
                const { rows } = await client.query(`insert into public.story_nodes (branch_id, order_index, content)
           values ($1, $2, $3)
           returning id`, [branchId, orderIndex, content]);
                keptIds.push(rows[0].id);
            }
        }
        if (keptIds.length > 0) {
            await client.query(`delete from public.story_nodes
         where branch_id = $1
           and not (id = any($2::bigint[]))`, [branchId, keptIds]);
        }
        else {
            await client.query(`delete from public.story_nodes where branch_id = $1`, [branchId]);
        }
        await client.query("COMMIT");
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
async function getStoryComments(branchId) {
    const result = await (0, database_js_1.query)(`select id, branch_id, node_id, coalesce(author_id, '@reader') as author_id, body, to_char(created_at, 'YYYY-MM-DD HH24:MI') as created
     from public.story_comments
     where branch_id = $1
     order by created_at asc`, [branchId]);
    return result.rows.map((row) => ({
        id: row.id,
        branchId: row.branch_id,
        nodeId: row.node_id,
        authorId: row.author_id,
        body: row.body,
        createdAt: row.created,
    }));
}
async function addStoryComment(branchId, nodeId, body, authorId) {
    const result = await (0, database_js_1.query)(`insert into public.story_comments (branch_id, node_id, author_id, body)
     values ($1, $2, $3, $4)
     returning id, branch_id, node_id, coalesce(author_id, '@reader') as author_id, body, to_char(created_at, 'YYYY-MM-DD HH24:MI') as created`, [branchId, nodeId, authorId ?? "@reader", body]);
    const row = result.rows[0];
    return {
        id: row.id,
        branchId: row.branch_id,
        nodeId: row.node_id,
        authorId: row.author_id,
        body: row.body,
        createdAt: row.created,
    };
}
async function deleteStoryComment(id) {
    await (0, database_js_1.query)(`delete from public.story_comments where id = $1`, [id]);
}
async function getWorldLore(worldId) {
    const result = await (0, database_js_1.query)(`select id, world_id, lore_type, name, summary from public.world_lore where world_id = $1 order by name asc`, [worldId]);
    return result.rows.map((row) => ({
        id: row.id,
        worldId: row.world_id,
        loreType: row.lore_type,
        name: row.name,
        summary: row.summary,
    }));
}
