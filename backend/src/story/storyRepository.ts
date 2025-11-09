import { Pool } from "pg";
import { loadEnv } from "../worker/env.js";
import type { StoryTimelineNode } from "./sampleTimeline.js";

const env = loadEnv();
const pool = new Pool({ connectionString: env.DATABASE_URL });

export interface StoryChapter {
  id: number;
  branchId: string;
  orderIndex: number;
  title: string;
  status: "draft" | "ready";
}

export interface StoryNode {
  id: number;
  branchId: string;
  orderIndex: number;
  content: string;
}

export interface StoryComment {
  id: number;
  branchId: string;
  nodeId: number;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface WorldLoreEntry {
  id: number;
  worldId: string;
  loreType: string;
  name: string;
  summary: string;
}

export async function getTimeline(worldId: string): Promise<StoryTimelineNode[]> {
  const result = await pool.query(
    `
      select id, parent_branch_id, title, coalesce(author_id, '@unknown') as author_id, status, to_char(created_at, 'YYYY-MM-DD') as created
      from public.story_branches
      where world_id = $1
      order by created_at asc
    `,
    [worldId]
  );

  if (result.rowCount === 0) {
    return [];
  }

  return result.rows.map((row: any) => ({
    id: row.id,
    parentId: row.parent_branch_id ?? undefined,
    title: row.title,
    author: row.author_id,
    createdAt: row.created,
    status: row.status === "canon" ? "canon" : row.status === "fan" ? "fan" : "draft",
  }));
}

export async function getChapters(branchId: string): Promise<StoryChapter[]> {
  const result = await pool.query(
    `
      select id, branch_id, order_index, title, status
      from public.story_chapters
      where branch_id = $1
      order by order_index asc
    `,
    [branchId]
  );

  return result.rows.map((row: any) => ({
    id: row.id,
    branchId: row.branch_id,
    orderIndex: row.order_index,
    title: row.title,
    status: row.status === "ready" ? "ready" : "draft",
  }));
}

export async function addChapter(branchId: string, title: string): Promise<StoryChapter> {
  const { rows } = await pool.query(
    `
      insert into public.story_chapters (branch_id, order_index, title)
      values ($1, (select coalesce(max(order_index), -1) + 1 from public.story_chapters where branch_id = $1), $2)
      returning id, branch_id, order_index, title, status
    `,
    [branchId, title]
  );

  const row = rows[0] as any;
  return {
    id: row.id,
    branchId: row.branch_id,
    orderIndex: row.order_index,
    title: row.title,
    status: row.status === "ready" ? "ready" : "draft",
  };
}

export async function updateChapter(id: number, data: Partial<Pick<StoryChapter, "title" | "status">>): Promise<void> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.title !== undefined) {
    fields.push(`title = $${fields.length + 1}`);
    values.push(data.title);
  }
  if (data.status !== undefined) {
    fields.push(`status = $${fields.length + 1}`);
    values.push(data.status);
  }

  if (fields.length === 0) return;

  values.push(id);

  await pool.query(
    `update public.story_chapters set ${fields.join(", ")} where id = $${fields.length + 1}`,
    values
  );
}

export async function removeChapter(id: number): Promise<void> {
  await pool.query(`delete from public.story_chapters where id = $1`, [id]);
}

export async function getStoryNodes(branchId: string): Promise<StoryNode[]> {
  const { rows } = await pool.query(
    `select id, branch_id, order_index, content from public.story_nodes where branch_id = $1 order by order_index asc`,
    [branchId]
  );
  return rows.map((row: any) => ({
    id: row.id,
    branchId: row.branch_id,
    orderIndex: row.order_index,
    content: row.content,
  }));
}

export async function saveStoryNodes(
  branchId: string,
  nodes: Array<{ id?: number; orderIndex: number; content: string }>
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const keptIds: number[] = [];

    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      const orderIndex = Number.isFinite(node.orderIndex) ? node.orderIndex : index;
      const content = node.content ?? "";

      if (node.id && node.id > 0) {
        await client.query(
          `update public.story_nodes
           set order_index = $1, content = $2
           where id = $3 and branch_id = $4`,
          [orderIndex, content, node.id, branchId]
        );
        keptIds.push(node.id);
      } else {
        const { rows } = await client.query(
          `insert into public.story_nodes (branch_id, order_index, content)
           values ($1, $2, $3)
           returning id`,
          [branchId, orderIndex, content]
        );
        keptIds.push(rows[0].id);
      }
    }

    if (keptIds.length > 0) {
      await client.query(
        `delete from public.story_nodes
         where branch_id = $1
           and not (id = any($2::bigint[]))`,
        [branchId, keptIds]
      );
    } else {
      await client.query(`delete from public.story_nodes where branch_id = $1`, [branchId]);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getStoryComments(branchId: string): Promise<StoryComment[]> {
  const { rows } = await pool.query(
    `select id, branch_id, node_id, coalesce(author_id, '@reader') as author_id, body, to_char(created_at, 'YYYY-MM-DD HH24:MI') as created
     from public.story_comments
     where branch_id = $1
     order by created_at asc`,
    [branchId]
  );
  return rows.map((row: any) => ({
    id: row.id,
    branchId: row.branch_id,
    nodeId: row.node_id,
    authorId: row.author_id,
    body: row.body,
    createdAt: row.created,
  }));
}

export async function addStoryComment(
  branchId: string,
  nodeId: number,
  body: string,
  authorId?: string
): Promise<StoryComment> {
  const { rows } = await pool.query(
    `insert into public.story_comments (branch_id, node_id, author_id, body)
     values ($1, $2, $3, $4)
     returning id, branch_id, node_id, coalesce(author_id, '@reader') as author_id, body, to_char(created_at, 'YYYY-MM-DD HH24:MI') as created`,
    [branchId, nodeId, authorId ?? "@reader", body]
  );
  const row = rows[0] as any;
  return {
    id: row.id,
    branchId: row.branch_id,
    nodeId: row.node_id,
    authorId: row.author_id,
    body: row.body,
    createdAt: row.created,
  };
}

export async function deleteStoryComment(id: number): Promise<void> {
  await pool.query(`delete from public.story_comments where id = $1`, [id]);
}

export async function getWorldLore(worldId: string): Promise<WorldLoreEntry[]> {
  const { rows } = await pool.query(
    `select id, world_id, lore_type, name, summary from public.world_lore where world_id = $1 order by name asc`,
    [worldId]
  );
  return rows.map((row: any) => ({
    id: row.id,
    worldId: row.world_id,
    loreType: row.lore_type,
    name: row.name,
    summary: row.summary,
  }));
}

