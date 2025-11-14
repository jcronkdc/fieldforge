import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../database.js';
import { auditLogger } from '../middleware/auditLogger.js';

// Message validation schema
const messageSchema = z.object({
  content: z.string(),
  context: z.object({
    projectId: z.string().optional(),
    userId: z.string(),
    category: z.enum(['safety', 'schedule', 'equipment', 'compliance', 'general']).optional(),
    previousMessages: z.array(z.object({
      type: z.enum(['user', 'ai']),
      content: z.string(),
      timestamp: z.string()
    })).optional()
  }).optional()
});

// Insight validation schema
const insightSchema = z.object({
  type: z.enum(['warning', 'suggestion', 'prediction', 'success']),
  title: z.string(),
  description: z.string(),
  impact: z.enum(['high', 'medium', 'low']),
  category: z.string(),
  projectId: z.string(),
  metadata: z.any().optional()
});

export function createAIRouter(): Router {
  const router = Router();

  // Process message
  router.post('/chat', async (req: Request, res: Response) => {
    try {
      const data = messageSchema.parse(req.body);
      
      // Log conversation
      await query(`
        INSERT INTO ai_conversations (
          user_id, project_id, message_type, content, category, created_at
        ) VALUES ($1, $2, 'user', $3, $4, NOW())
      `, [
        data.context?.userId,
        data.context?.projectId,
        data.content,
        data.context?.category || 'general'
      ]);

      // Simulate AI processing (in production, this would call actual AI service)
      const aiResponse = await generateAIResponse(data.content, data.context);

      // Log AI response
      await query(`
        INSERT INTO ai_conversations (
          user_id, project_id, message_type, content, category, metadata, created_at
        ) VALUES ($1, $2, 'ai', $3, $4, $5, NOW())
      `, [
        data.context?.userId,
        data.context?.projectId,
        aiResponse.content,
        aiResponse.category,
        JSON.stringify(aiResponse.metadata)
      ]);

      res.json(aiResponse);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid data', details: error.format() });
      } else {
        console.error('AI chat error:', error);
        res.status(500).json({ error: 'Failed to process message' });
      }
    }
  });

  // Get AI insights for project
  router.get('/insights/:projectId', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      
      // Generate insights based on project data
      const insights = await generateProjectInsights(projectId);
      
      // Store insights
      for (const insight of insights) {
        await query(`
          INSERT INTO ai_insights (
            project_id, type, title, description, impact, category, metadata, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `, [
          projectId,
          insight.type,
          insight.title,
          insight.description,
          insight.impact,
          insight.category,
          JSON.stringify(insight.metadata)
        ]);
      }

      res.json(insights);
    } catch (error) {
      console.error('Insights generation error:', error);
      res.status(500).json({ error: 'Failed to generate insights' });
    }
  });

  // Get conversation history
  router.get('/conversations/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { projectId } = req.query;
      
      let queryStr = `
        SELECT * FROM ai_conversations
        WHERE user_id = $1
      `;
      const params: any[] = [userId];
      
      if (projectId) {
        queryStr += ' AND project_id = $2';
        params.push(projectId);
      }
      
      queryStr += ' ORDER BY created_at DESC LIMIT 50';
      
      const result = await query(queryStr, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Conversation history error:', error);
      res.status(500).json({ error: 'Failed to fetch conversation history' });
    }
  });

  // Train AI on project patterns
  router.post('/train', async (req: Request, res: Response) => {
    try {
      const { projectId, category, patterns } = req.body;
      
      await query(`
        INSERT INTO ai_training_data (
          project_id, category, patterns, created_at
        ) VALUES ($1, $2, $3, NOW())
      `, [projectId, category, JSON.stringify(patterns)]);

      res.json({ message: 'Training data recorded successfully' });
    } catch (error) {
      console.error('Training error:', error);
      res.status(500).json({ error: 'Failed to record training data' });
    }
  });

  // Get AI recommendations
  router.get('/recommendations/:projectId/:category', async (req: Request, res: Response) => {
    try {
      const { projectId, category } = req.params;
      
      const recommendations = await generateRecommendations(projectId, category);
      res.json(recommendations);
    } catch (error) {
      console.error('Recommendations error:', error);
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  });

  // Generate reports
  router.post('/reports/generate', async (req: Request, res: Response) => {
    try {
      const { projectId, reportType, parameters } = req.body;
      
      const report = await generateReport(projectId, reportType, parameters);
      
      await query(`
        INSERT INTO ai_reports (
          project_id, report_type, content, parameters, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `, [projectId, reportType, JSON.stringify(report), JSON.stringify(parameters)]);

      res.json(report);
    } catch (error) {
      console.error('Report generation error:', error);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  });

  return router;
}

// AI Response Generation (placeholder - would connect to actual AI service)
async function generateAIResponse(content: string, context: any): Promise<any> {
  const lowerContent = content.toLowerCase();
  
  // Simulate intelligent response based on content
  if (lowerContent.includes('safety') || lowerContent.includes('hazard')) {
    return {
      content: 'I\'ve analyzed the safety conditions. Based on current data, I recommend reviewing the fall protection protocols in Zone C and ensuring all workers have completed their safety briefings.',
      category: 'safety',
      metadata: {
        actionable: true,
        priority: 'high',
        suggestedActions: ['safety_review', 'briefing_schedule']
      }
    };
  }
  
  if (lowerContent.includes('schedule') || lowerContent.includes('delay')) {
    return {
      content: 'The current schedule shows potential delays in steel assembly. I suggest reallocating resources from completed foundation work to accelerate this critical path activity.',
      category: 'schedule',
      metadata: {
        actionable: true,
        priority: 'medium',
        suggestedActions: ['resource_reallocation', 'schedule_update']
      }
    };
  }
  
  // Default response
  return {
    content: 'I understand your query. Let me analyze the relevant data and provide insights based on your project\'s current status.',
    category: 'general',
    metadata: {}
  };
}

// Generate Project Insights
async function generateProjectInsights(projectId: string): Promise<any[]> {
  const insights = [];
  
  // Safety insights
  const safetyResult = await query(`
    SELECT COUNT(*) as incident_count 
    FROM incidents 
    WHERE project_id = $1 AND created_at > NOW() - INTERVAL '7 days'
  `, [projectId]);
  
  if (safetyResult.rows[0].incident_count > 0) {
    insights.push({
      type: 'warning',
      title: 'Recent Safety Incidents',
      description: `${safetyResult.rows[0].incident_count} incidents reported in the last 7 days. Review safety protocols.`,
      impact: 'high',
      category: 'safety',
      metadata: { incident_count: safetyResult.rows[0].incident_count }
    });
  }
  
  // Equipment insights
  const equipmentResult = await query(`
    SELECT COUNT(*) as due_count 
    FROM equipment e
    JOIN equipment_maintenance em ON e.id = em.equipment_id
    WHERE e.project_id = $1 AND em.next_service_date < NOW() + INTERVAL '7 days'
  `, [projectId]);
  
  if (equipmentResult.rows[0].due_count > 0) {
    insights.push({
      type: 'suggestion',
      title: 'Equipment Maintenance Due',
      description: `${equipmentResult.rows[0].due_count} pieces of equipment need maintenance within 7 days.`,
      impact: 'medium',
      category: 'equipment',
      metadata: { equipment_count: equipmentResult.rows[0].due_count }
    });
  }
  
  // Schedule insights
  insights.push({
    type: 'prediction',
    title: 'Weather Impact Forecast',
    description: 'Clear weather expected for next 5 days. Optimal conditions for concrete work.',
    impact: 'medium',
    category: 'schedule',
    metadata: { weather_window: 5 }
  });
  
  return insights;
}

// Generate Recommendations
async function generateRecommendations(projectId: string, category: string): Promise<any> {
  const recommendations = [];
  
  if (category === 'safety') {
    recommendations.push({
      title: 'Implement Morning Stretch Program',
      description: 'Reduce soft tissue injuries by 30% with daily stretching.',
      impact: 'high',
      effort: 'low'
    });
  }
  
  if (category === 'productivity') {
    recommendations.push({
      title: 'Optimize Crew Rotation',
      description: 'Adjust shift patterns to maximize productivity during peak hours.',
      impact: 'medium',
      effort: 'medium'
    });
  }
  
  return recommendations;
}

// Generate Reports
async function generateReport(projectId: string, reportType: string, parameters: any): Promise<any> {
  // Simulate report generation
  return {
    title: `${reportType} Report`,
    projectId,
    generatedAt: new Date().toISOString(),
    summary: 'Report generated successfully with AI insights.',
    sections: [
      {
        title: 'Executive Summary',
        content: 'Project is progressing on schedule with minor safety concerns addressed.'
      },
      {
        title: 'Key Metrics',
        content: 'Safety incidents: -20%, Productivity: +15%, Budget variance: -2%'
      },
      {
        title: 'Recommendations',
        content: 'Continue focus on safety training and equipment maintenance.'
      }
    ],
    parameters
  };
}
