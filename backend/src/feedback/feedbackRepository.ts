/**
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 * PROPRIETARY AND CONFIDENTIAL - DO NOT DISTRIBUTE
 * 
 * This source code is the exclusive property of Cronk Companies, LLC.
 * Unauthorized copying, modification, or distribution of this file,
 * via any medium, is strictly prohibited.
 */

import { Pool } from "pg";
import { loadEnv } from "../worker/env.js";

const env = loadEnv();
const pool = new Pool({ connectionString: env.DATABASE_URL });

async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

export interface UserFeedback {
  id?: string;
  user_id?: string;
  username?: string;
  feedback_type: 'suggestion' | 'bug' | 'idea' | 'complaint' | 'praise' | 'other';
  subject?: string;
  content: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  status?: 'new' | 'reviewed' | 'in_progress' | 'resolved' | 'wont_fix';
  page_context?: string;
  user_agent?: string;
  created_at?: string;
}

export async function submitFeedback(data: {
  userId?: string;
  username?: string;
  feedbackType: string;
  subject?: string;
  content: string;
  pageContext?: string;
  userAgent?: string;
}): Promise<UserFeedback> {
  const result = await query(
    `INSERT INTO user_feedback (
      user_id, username, feedback_type, subject, content,
      page_context, user_agent, priority
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      data.userId,
      data.username,
      data.feedbackType,
      data.subject,
      data.content,
      data.pageContext,
      data.userAgent,
      // Auto-set priority based on type
      data.feedbackType === 'bug' ? 'high' : 'normal'
    ]
  );
  
  return result.rows[0];
}

export async function getUserFeedback(userId: string): Promise<UserFeedback[]> {
  const result = await query(
    `SELECT * FROM user_feedback 
     WHERE user_id = $1 
     ORDER BY created_at DESC`,
    [userId]
  );
  
  return result.rows;
}

export async function getAllFeedback(
  status?: string,
  type?: string,
  limit = 100
): Promise<UserFeedback[]> {
  let sql = `SELECT f.*, u.username as user_username
             FROM user_feedback f
             LEFT JOIN user_profiles u ON f.user_id = u.user_id
             WHERE 1=1`;
  
  const params: any[] = [];
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
  
  const result = await query(sql, params);
  return result.rows;
}

export async function exportFeedbackToText(
  startDate?: Date,
  endDate?: Date
): Promise<string> {
  const result = await query(
    `SELECT export_feedback_to_text($1, $2) as feedback_text`,
    [startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate || new Date()]
  );
  
  return result.rows[0].feedback_text;
}
