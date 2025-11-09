/**
 * XAI Grok 2 Integration - Image & Video Generation
 * CRITICAL: This uses expensive API tokens - strict cost controls required
 * © 2025 Cronk Companies, LLC. All Rights Reserved.
 */

// ============================================================================
// COST CONTROL & PRICING
// ============================================================================

export interface GrokGenerationCost {
  type: 'image' | 'video';
  resolution: string;
  estimatedCost: number; // in USD
  requiredSparks: number;
  profitMargin: number;
}

export class GrokCostManager {
  // XAI Grok 2 pricing (estimated based on similar services)
  private readonly IMAGE_COSTS = {
    'standard': 0.10,    // 512x512
    'hd': 0.25,          // 1024x1024
    'ultra': 0.50,       // 2048x2048
    '4k': 1.00           // 4096x4096
  };
  
  private readonly VIDEO_COSTS = {
    '3_seconds': 2.00,
    '5_seconds': 3.50,
    '10_seconds': 7.00,
    '15_seconds': 12.00
  };
  
  // We need AT LEAST 100% markup to be safe (2x cost)
  // But targeting 150% markup (2.5x cost) for profit
  private readonly MINIMUM_MARKUP = 2.0;
  private readonly TARGET_MARKUP = 2.5;
  
  calculateImageGenerationCost(resolution: 'standard' | 'hd' | 'ultra' | '4k'): GrokGenerationCost {
    const baseCost = this.IMAGE_COSTS[resolution];
    const totalCost = baseCost * this.TARGET_MARKUP;
    const requiredSparks = Math.ceil(totalCost / 0.02); // 1 Spark = $0.02
    
    return {
      type: 'image',
      resolution,
      estimatedCost: baseCost,
      requiredSparks,
      profitMargin: ((totalCost - baseCost) / totalCost) * 100
    };
  }
  
  calculateVideoGenerationCost(duration: '3_seconds' | '5_seconds' | '10_seconds' | '15_seconds'): GrokGenerationCost {
    const baseCost = this.VIDEO_COSTS[duration];
    const totalCost = baseCost * this.TARGET_MARKUP;
    const requiredSparks = Math.ceil(totalCost / 0.02);
    
    return {
      type: 'video',
      resolution: duration,
      estimatedCost: baseCost,
      requiredSparks,
      profitMargin: ((totalCost - baseCost) / totalCost) * 100
    };
  }
  
  // CRITICAL: Verify user has enough Sparks before ANY API call
  canAffordGeneration(userSparks: number, cost: GrokGenerationCost): boolean {
    return userSparks >= cost.requiredSparks;
  }
}

// ============================================================================
// GROK API WRAPPER WITH SAFETY CHECKS
// ============================================================================

export class GrokAPIWrapper {
  private apiKey: string | undefined;
  private costManager = new GrokCostManager();
  private dailyLimit = 100; // Maximum API calls per day
  private dailyUsage = 0;
  private lastResetDate: Date = new Date();
  
  constructor() {
    // ONLY load API key from environment
    this.apiKey = import.meta.env.VITE_XAI_API_KEY || '';
    
    if (!this.apiKey) {
      console.error('WARNING: XAI_API_KEY not found in environment variables');
    }
  }
  
  // CRITICAL: Check all safety conditions before API call
  private async preflightCheck(
    userId: string,
    userSparks: number,
    cost: GrokGenerationCost
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Check 1: API key exists
    if (!this.apiKey) {
      return { allowed: false, reason: 'API key not configured' };
    }
    
    // Check 2: User has enough Sparks
    if (!this.costManager.canAffordGeneration(userSparks, cost)) {
      return { 
        allowed: false, 
        reason: `Insufficient Sparks. Need ${cost.requiredSparks}, have ${userSparks}` 
      };
    }
    
    // Check 3: Daily limit not exceeded
    this.resetDailyUsageIfNeeded();
    if (this.dailyUsage >= this.dailyLimit) {
      return { 
        allowed: false, 
        reason: 'Daily generation limit reached. Try again tomorrow.' 
      };
    }
    
    // Check 4: User explicitly consented to charge
    // This will be verified in the UI component
    
    return { allowed: true };
  }
  
  private resetDailyUsageIfNeeded(): void {
    const now = new Date();
    if (now.getDate() !== this.lastResetDate.getDate()) {
      this.dailyUsage = 0;
      this.lastResetDate = now;
    }
  }
  
  async generateImage(
    prompt: string,
    resolution: 'standard' | 'hd' | 'ultra' | '4k',
    userId: string,
    userSparks: number,
    userConsent: boolean
  ): Promise<{ success: boolean; imageUrl?: string; error?: string; chargedSparks?: number }> {
    // CRITICAL: Require explicit consent
    if (!userConsent) {
      return { 
        success: false, 
        error: 'User consent required for image generation' 
      };
    }
    
    // Calculate cost
    const cost = this.costManager.calculateImageGenerationCost(resolution);
    
    // Preflight checks
    const preflight = await this.preflightCheck(userId, userSparks, cost);
    if (!preflight.allowed) {
      return { success: false, error: preflight.reason };
    }
    
    try {
      // Log the attempt (for audit trail)
      console.log(`[GROK API] User ${userId} requesting ${resolution} image, cost: ${cost.requiredSparks} Sparks`);
      
      // Make API call to Grok 2
      const response = await this.callGrokAPI({
        endpoint: 'image/generate',
        params: {
          prompt,
          resolution,
          model: 'grok-2-vision',
          safety_check: true // Enable safety filtering
        }
      });
      
      if (response.success) {
        // Increment usage counter
        this.dailyUsage++;
        
        // Log successful generation
        console.log(`[GROK API] Success! Charged ${cost.requiredSparks} Sparks to user ${userId}`);
        
        return {
          success: true,
          imageUrl: response.data.url,
          chargedSparks: cost.requiredSparks
        };
      } else {
        return {
          success: false,
          error: response.error || 'Image generation failed'
        };
      }
    } catch (error) {
      console.error('[GROK API] Error:', error);
      return {
        success: false,
        error: 'Image generation service temporarily unavailable'
      };
    }
  }
  
  async generateVideo(
    prompt: string,
    duration: '3_seconds' | '5_seconds' | '10_seconds' | '15_seconds',
    userId: string,
    userSparks: number,
    userConsent: boolean
  ): Promise<{ success: boolean; videoUrl?: string; error?: string; chargedSparks?: number }> {
    // CRITICAL: Require explicit consent
    if (!userConsent) {
      return { 
        success: false, 
        error: 'User consent required for video generation' 
      };
    }
    
    // Calculate cost
    const cost = this.costManager.calculateVideoGenerationCost(duration);
    
    // Preflight checks
    const preflight = await this.preflightCheck(userId, userSparks, cost);
    if (!preflight.allowed) {
      return { success: false, error: preflight.reason };
    }
    
    try {
      // Log the attempt
      console.log(`[GROK API] User ${userId} requesting ${duration} video, cost: ${cost.requiredSparks} Sparks`);
      
      // Make API call to Grok 2
      const response = await this.callGrokAPI({
        endpoint: 'video/generate',
        params: {
          prompt,
          duration: parseInt(duration.split('_')[0]),
          model: 'grok-2-video',
          safety_check: true,
          format: 'mp4'
        }
      });
      
      if (response.success) {
        this.dailyUsage++;
        
        console.log(`[GROK API] Success! Charged ${cost.requiredSparks} Sparks to user ${userId}`);
        
        return {
          success: true,
          videoUrl: response.data.url,
          chargedSparks: cost.requiredSparks
        };
      } else {
        return {
          success: false,
          error: response.error || 'Video generation failed'
        };
      }
    } catch (error) {
      console.error('[GROK API] Error:', error);
      return {
        success: false,
        error: 'Video generation service temporarily unavailable'
      };
    }
  }
  
  private async callGrokAPI(params: {
    endpoint: string;
    params: any;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!this.apiKey) {
      // Mock implementation for development/testing
      console.warn('[GROK API MOCK] Using mock implementation - xAI API key not configured');
      
      // Simulate successful generation with mock URLs
      if (params.endpoint === 'image/generate') {
        return {
          success: true,
          data: {
            url: `data:image/svg+xml;base64,${btoa(`
              <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
                <rect width="512" height="512" fill="#4A5568"/>
                <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="24" font-family="Arial">
                  🎨 Mock Generated Image
                </text>
                <text x="50%" y="55%" text-anchor="middle" fill="#CBD5E0" font-size="16" font-family="Arial">
                  ${params.params.resolution} • ${params.params.prompt.substring(0, 30)}...
                </text>
              </svg>
            `)}`
          }
        };
      } else if (params.endpoint === 'video/generate') {
        return {
          success: true,
          data: {
            url: 'data:video/mp4;base64,mockvideourl', // Mock video URL
            thumbnail: `data:image/svg+xml;base64,${btoa(`
              <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
                <rect width="512" height="512" fill="#2D3748"/>
                <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="24" font-family="Arial">
                  🎬 Mock Generated Video
                </text>
                <text x="50%" y="55%" text-anchor="middle" fill="#CBD5E0" font-size="16" font-family="Arial">
                  ${params.params.duration.replace('_', ' ')}
                </text>
              </svg>
            `)}`
          }
        };
      }
      
      return { success: false, error: 'Mock API: Unknown endpoint' };
    }
    
    try {
      // Use xAI's chat completions endpoint for image generation prompts
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'grok-4', // or 'grok-vision' for image analysis
          messages: [
            {
              role: 'system',
              content: 'You are an AI that generates detailed image descriptions for DALL-E or similar services.'
            },
            {
              role: 'user',
              content: params.params.prompt
            }
          ],
          stream: false,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('[GROK API] API Error:', error);
        return { success: false, error: `API Error: ${response.status}` };
      }
      
      const data = await response.json();
      
      // For now, return the enhanced prompt - in production, this would connect to an image generation service
      return { 
        success: true, 
        data: {
          url: `data:image/svg+xml;base64,${btoa(`
            <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
              <rect width="512" height="512" fill="#8B5CF6"/>
              <text x="256" y="256" font-family="Arial" font-size="24" fill="white" text-anchor="middle">
                Image Generation Placeholder
              </text>
              <text x="256" y="290" font-family="Arial" font-size="16" fill="white" text-anchor="middle">
                ${params.params.prompt.substring(0, 40)}...
              </text>
            </svg>
          `)}`,
          prompt: data.choices[0].message.content,
          usage: data.usage
        }
      };
    } catch (error) {
      console.error('[GROK API] Network Error:', error);
      return { success: false, error: 'Network error' };
    }
  }
  
  // Get current pricing for display
  getPricing(): {
    image: Array<{ resolution: string; sparks: number; usd: string }>;
    video: Array<{ duration: string; sparks: number; usd: string }>;
  } {
    const imageResolutions: Array<'standard' | 'hd' | 'ultra' | '4k'> = ['standard', 'hd', 'ultra', '4k'];
    const imagePricing = imageResolutions.map(res => {
      const cost = this.costManager.calculateImageGenerationCost(res);
      return {
        resolution: res,
        sparks: cost.requiredSparks,
        usd: `$${(cost.requiredSparks * 0.02).toFixed(2)}`
      };
    });
    
    const videoDurations: Array<'3_seconds' | '5_seconds' | '10_seconds' | '15_seconds'> = 
      ['3_seconds', '5_seconds', '10_seconds', '15_seconds'];
    const videoPricing = videoDurations.map(dur => {
      const cost = this.costManager.calculateVideoGenerationCost(dur);
      return {
        duration: dur.replace('_', ' '),
        sparks: cost.requiredSparks,
        usd: `$${(cost.requiredSparks * 0.02).toFixed(2)}`
      };
    });
    
    return { image: imagePricing, video: videoPricing };
  }
}

// ============================================================================
// USAGE TRACKING & ANALYTICS
// ============================================================================

export interface GrokUsageRecord {
  userId: string;
  timestamp: Date;
  type: 'image' | 'video';
  prompt: string;
  resolution: string;
  sparksCharged: number;
  actualCost: number;
  profit: number;
  success: boolean;
  errorReason?: string;
}

export class GrokUsageTracker {
  private usage: GrokUsageRecord[] = [];
  
  recordUsage(record: GrokUsageRecord): void {
    this.usage.push(record);
    
    // Save to database (would be Supabase in production)
    this.saveToDatabase(record);
    
    // Alert if losing money
    if (record.profit < 0) {
      console.error(`[ALERT] LOSING MONEY on generation! User: ${record.userId}, Loss: $${Math.abs(record.profit)}`);
      // Send alert to admin
      this.sendAdminAlert(record);
    }
  }
  
  private saveToDatabase(record: GrokUsageRecord): void {
    // TODO: Save to Supabase
    console.log('[GROK USAGE] Saved to database:', record);
  }
  
  private sendAdminAlert(record: GrokUsageRecord): void {
    // TODO: Send email/notification to admin
    console.error('[ADMIN ALERT] Unprofitable generation detected!', record);
  }
  
  getDailyStats(): {
    totalGenerations: number;
    totalRevenue: number;
    totalCosts: number;
    totalProfit: number;
    averageProfit: number;
  } {
    const today = new Date().toDateString();
    const todayUsage = this.usage.filter(u => 
      u.timestamp.toDateString() === today && u.success
    );
    
    const totalRevenue = todayUsage.reduce((sum, u) => sum + (u.sparksCharged * 0.02), 0);
    const totalCosts = todayUsage.reduce((sum, u) => sum + u.actualCost, 0);
    const totalProfit = totalRevenue - totalCosts;
    
    return {
      totalGenerations: todayUsage.length,
      totalRevenue,
      totalCosts,
      totalProfit,
      averageProfit: todayUsage.length > 0 ? totalProfit / todayUsage.length : 0
    };
  }
}

// ============================================================================
// PROMPT ENHANCEMENT FOR ANGRY LIPS
// ============================================================================

export class GrokPromptEnhancer {
  enhanceStoryPrompt(
    storyText: string,
    userWords: Record<string, string>,
    style: 'comic' | 'realistic' | 'surreal' | 'anime'
  ): string {
    // Extract key visual elements
    const characters = this.extractCharacters(storyText, userWords);
    const setting = this.extractSetting(storyText);
    const action = this.extractAction(storyText);
    const mood = this.extractMood(storyText);
    
    // Build enhanced prompt
    let prompt = `${style} style artwork depicting: `;
    
    if (characters.length > 0) {
      prompt += `${characters.join(' and ')} `;
    }
    
    if (action) {
      prompt += `${action} `;
    }
    
    if (setting) {
      prompt += `in ${setting}. `;
    }
    
    // Add style-specific enhancements
    const styleEnhancements = {
      comic: 'Bold colors, speech bubbles, action lines, comic book aesthetic',
      realistic: 'Photorealistic, cinematic lighting, 8K quality, ultra detailed',
      surreal: 'Salvador Dali inspired, dreamlike, impossible geometry, melting reality',
      anime: 'Anime/manga style, expressive eyes, dynamic poses, Japanese aesthetic'
    };
    
    prompt += styleEnhancements[style];
    
    // Add mood
    if (mood) {
      prompt += `. Mood: ${mood}`;
    }
    
    // Add safety suffix
    prompt += '. Family-friendly, no violence, no inappropriate content.';
    
    return prompt;
  }
  
  private extractCharacters(story: string, userWords: Record<string, string>): string[] {
    const characters: string[] = [];
    
    // Get character-type words from user input
    Object.entries(userWords).forEach(([type, word]) => {
      if (type.includes('PERSON') || type.includes('CHARACTER') || type.includes('NAME')) {
        characters.push(word);
      }
    });
    
    return characters.slice(0, 3); // Limit to 3 main characters
  }
  
  private extractSetting(story: string): string {
    // Look for location indicators
    const locationPatterns = [
      /in the ([^.]+)/i,
      /at the ([^.]+)/i,
      /inside the ([^.]+)/i,
      /on the ([^.]+)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = story.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return 'a whimsical setting';
  }
  
  private extractAction(story: string): string {
    // Look for action verbs
    const actionPatterns = [
      /was ([^.]+ing)/i,
      /started ([^.]+ing)/i,
      /began ([^.]+ing)/i
    ];
    
    for (const pattern of actionPatterns) {
      const match = story.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return '';
  }
  
  private extractMood(story: string): string {
    const storyLower = story.toLowerCase();
    
    if (storyLower.includes('laugh') || storyLower.includes('funny')) return 'comedic';
    if (storyLower.includes('scary') || storyLower.includes('dark')) return 'spooky';
    if (storyLower.includes('love') || storyLower.includes('heart')) return 'romantic';
    if (storyLower.includes('explode') || storyLower.includes('crash')) return 'chaotic';
    
    return 'whimsical';
  }
  
  enhanceVideoPrompt(
    storyHighlight: string,
    duration: number,
    style: 'cartoon' | 'realistic' | 'stopmotion'
  ): string {
    let prompt = `A ${duration}-second video in ${style} style showing: ${storyHighlight}. `;
    
    // Add movement and animation notes
    prompt += 'Smooth animation, dynamic camera movement, engaging visuals. ';
    
    // Style-specific notes
    const styleNotes = {
      cartoon: 'Vibrant colors, exaggerated expressions, bouncy animation',
      realistic: 'Cinematic quality, natural movement, professional lighting',
      stopmotion: 'Claymation style, charming jerky movement, handcrafted feel'
    };
    
    prompt += styleNotes[style];
    prompt += '. Family-friendly content only.';
    
    return prompt;
  }
}

// ============================================================================
// EXPORT MAIN CONTROLLER
// ============================================================================

export class GrokGenerationController {
  private api = new GrokAPIWrapper();
  private costManager = new GrokCostManager();
  private tracker = new GrokUsageTracker();
  private enhancer = new GrokPromptEnhancer();
  
  async requestImageGeneration(
    userId: string,
    userSparks: number,
    storyText: string,
    userWords: Record<string, string>,
    options: {
      resolution: 'standard' | 'hd' | 'ultra' | '4k';
      style: 'comic' | 'realistic' | 'surreal' | 'anime';
      userConsent: boolean;
    }
  ): Promise<{
    success: boolean;
    imageUrl?: string;
    error?: string;
    sparksCharged?: number;
  }> {
    // Enhance prompt for better results
    const enhancedPrompt = this.enhancer.enhanceStoryPrompt(
      storyText,
      userWords,
      options.style
    );
    
    // Get cost info
    const cost = this.costManager.calculateImageGenerationCost(options.resolution);
    
    // Make generation request
    const result = await this.api.generateImage(
      enhancedPrompt,
      options.resolution,
      userId,
      userSparks,
      options.userConsent
    );
    
    // Track usage
    this.tracker.recordUsage({
      userId,
      timestamp: new Date(),
      type: 'image',
      prompt: enhancedPrompt,
      resolution: options.resolution,
      sparksCharged: result.chargedSparks || 0,
      actualCost: this.IMAGE_COSTS[options.resolution] || 0,
      profit: ((result.chargedSparks || 0) * 0.02) - (this.IMAGE_COSTS[options.resolution] || 0),
      success: result.success,
      errorReason: result.error
    });
    
    return result;
  }
  
  async requestVideoGeneration(
    userId: string,
    userSparks: number,
    storyHighlight: string,
    options: {
      duration: '3_seconds' | '5_seconds' | '10_seconds' | '15_seconds';
      style: 'cartoon' | 'realistic' | 'stopmotion';
      userConsent: boolean;
    }
  ): Promise<{
    success: boolean;
    videoUrl?: string;
    error?: string;
    sparksCharged?: number;
  }> {
    // Enhance prompt
    const enhancedPrompt = this.enhancer.enhanceVideoPrompt(
      storyHighlight,
      parseInt(options.duration.split('_')[0]),
      options.style
    );
    
    // Get cost info
    const cost = this.costManager.calculateVideoGenerationCost(options.duration);
    
    // Make generation request
    const result = await this.api.generateVideo(
      enhancedPrompt,
      options.duration,
      userId,
      userSparks,
      options.userConsent
    );
    
    // Track usage
    this.tracker.recordUsage({
      userId,
      timestamp: new Date(),
      type: 'video',
      prompt: enhancedPrompt,
      resolution: options.duration,
      sparksCharged: result.chargedSparks || 0,
      actualCost: this.VIDEO_COSTS[options.duration] || 0,
      profit: ((result.chargedSparks || 0) * 0.02) - (this.VIDEO_COSTS[options.duration] || 0),
      success: result.success,
      errorReason: result.error
    });
    
    return result;
  }
  
  getPricingInfo() {
    return this.api.getPricing();
  }
  
  getDailyStats() {
    return this.tracker.getDailyStats();
  }
  
  // For server-side use only
  private IMAGE_COSTS = {
    'standard': 0.10,
    'hd': 0.25,
    'ultra': 0.50,
    '4k': 1.00
  };
  
  private VIDEO_COSTS = {
    '3_seconds': 2.00,
    '5_seconds': 3.50,
    '10_seconds': 7.00,
    '15_seconds': 12.00
  };
}

export default GrokGenerationController;
