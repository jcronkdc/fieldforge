"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserRouter = createUserRouter;
const express_1 = require("express");
const database_js_1 = require("../database.js");
const zod_1 = require("zod");
const auditLogger_js_1 = require("../middleware/auditLogger.js");
// Validation schemas
const profileSchema = zod_1.z.object({
    full_name: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    job_title: zod_1.z.string().optional(),
    employee_id: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    timezone: zod_1.z.string().optional(),
    language: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
    emergency_contact_name: zod_1.z.string().optional(),
    emergency_contact_phone: zod_1.z.string().optional(),
    emergency_contact_relationship: zod_1.z.string().optional(),
    hire_date: zod_1.z.string().optional(),
    supervisor_id: zod_1.z.string().uuid().optional(),
    theme: zod_1.z.enum(['light', 'dark', 'auto']).optional(),
    notifications_enabled: zod_1.z.boolean().optional(),
    email_notifications: zod_1.z.boolean().optional(),
    sms_notifications: zod_1.z.boolean().optional()
});
const certificationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    issuer: zod_1.z.string().min(1),
    issue_date: zod_1.z.string(),
    expiry_date: zod_1.z.string().optional(),
    certificate_number: zod_1.z.string().optional(),
    document_url: zod_1.z.string().optional()
});
const trainingSchema = zod_1.z.object({
    course_name: zod_1.z.string().min(1),
    provider: zod_1.z.string().min(1),
    completion_date: zod_1.z.string(),
    hours: zod_1.z.number().optional(),
    certificate_url: zod_1.z.string().optional(),
    next_renewal: zod_1.z.string().optional()
});
// Settings validation schema
const settingsSchema = zod_1.z.object({
    theme: zod_1.z.enum(['light', 'dark', 'auto']).optional(),
    language: zod_1.z.string().optional(),
    dateFormat: zod_1.z.string().optional(),
    timeFormat: zod_1.z.enum(['12h', '24h']).optional(),
    firstDayOfWeek: zod_1.z.number().min(0).max(6).optional(),
    notificationsEnabled: zod_1.z.boolean().optional(),
    notificationCategories: zod_1.z.object({
        safety: zod_1.z.object({ app: zod_1.z.boolean(), email: zod_1.z.boolean(), sms: zod_1.z.boolean(), push: zod_1.z.boolean() }),
        projects: zod_1.z.object({ app: zod_1.z.boolean(), email: zod_1.z.boolean(), sms: zod_1.z.boolean(), push: zod_1.z.boolean() }),
        equipment: zod_1.z.object({ app: zod_1.z.boolean(), email: zod_1.z.boolean(), sms: zod_1.z.boolean(), push: zod_1.z.boolean() }),
        weather: zod_1.z.object({ app: zod_1.z.boolean(), email: zod_1.z.boolean(), sms: zod_1.z.boolean(), push: zod_1.z.boolean() }),
        system: zod_1.z.object({ app: zod_1.z.boolean(), email: zod_1.z.boolean(), sms: zod_1.z.boolean(), push: zod_1.z.boolean() })
    }).optional(),
    quietHoursEnabled: zod_1.z.boolean().optional(),
    quietHoursStart: zod_1.z.string().optional(),
    quietHoursEnd: zod_1.z.string().optional(),
    autoSync: zod_1.z.boolean().optional(),
    syncInterval: zod_1.z.number().optional(),
    offlineMode: zod_1.z.boolean().optional(),
    cacheSize: zod_1.z.number().optional(),
    dataCompression: zod_1.z.boolean().optional(),
    reducedMotion: zod_1.z.boolean().optional(),
    lowDataMode: zod_1.z.boolean().optional(),
    biometricAuth: zod_1.z.boolean().optional(),
    sessionTimeout: zod_1.z.number().optional(),
    showProfilePhoto: zod_1.z.boolean().optional(),
    shareLocation: zod_1.z.boolean().optional(),
    analyticsEnabled: zod_1.z.boolean().optional(),
    highContrast: zod_1.z.boolean().optional(),
    largeText: zod_1.z.boolean().optional(),
    soundEffects: zod_1.z.boolean().optional(),
    hapticFeedback: zod_1.z.boolean().optional(),
    screenReaderOptimized: zod_1.z.boolean().optional(),
    debugMode: zod_1.z.boolean().optional(),
    showPerformanceStats: zod_1.z.boolean().optional(),
    enableBetaFeatures: zod_1.z.boolean().optional(),
    autoBackup: zod_1.z.boolean().optional(),
    backupFrequency: zod_1.z.enum(['daily', 'weekly', 'monthly']).optional(),
    storageUsed: zod_1.z.number().optional()
});
function createUserRouter() {
    const router = (0, express_1.Router)();
    // Get user profile
    router.get('/profile', async (req, res) => {
        try {
            const userId = req.user?.id;
            const result = await (0, database_js_1.query)(`SELECT up.*, u.email, u.last_sign_in_at as last_login,
         s.email as supervisor_email, s.raw_user_meta_data->>'full_name' as supervisor_name
         FROM user_profiles up
         LEFT JOIN auth.users u ON up.user_id = u.id
         LEFT JOIN auth.users s ON up.supervisor_id = s.id
         WHERE up.user_id = $1`, [userId]);
            if (result.rows.length === 0) {
                // Create default profile if none exists
                const createResult = await (0, database_js_1.query)(`INSERT INTO user_profiles (user_id, email, created_at, updated_at)
           VALUES ($1, $2, NOW(), NOW())
           RETURNING *`, [userId, req.user?.email]);
                res.json({ success: true, profile: createResult.rows[0] });
            }
            else {
                res.json({ success: true, profile: result.rows[0] });
            }
        }
        catch (error) {
            console.error('Error fetching user profile:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch profile' });
        }
    });
    // Update user profile
    router.put('/profile', async (req, res) => {
        try {
            const userId = req.user?.id;
            const validatedData = profileSchema.parse(req.body);
            // Build dynamic update query
            const updateFields = [];
            const values = [];
            let paramCount = 1;
            Object.entries(validatedData).forEach(([key, value]) => {
                if (value !== undefined) {
                    updateFields.push(`${key} = $${paramCount}`);
                    values.push(value);
                    paramCount++;
                }
            });
            if (updateFields.length === 0) {
                return res.status(400).json({ success: false, error: 'No fields to update' });
            }
            updateFields.push(`updated_at = NOW()`);
            values.push(userId);
            const result = await (0, database_js_1.query)(`UPDATE user_profiles 
         SET ${updateFields.join(', ')}
         WHERE user_id = $${paramCount}
         RETURNING *`, values);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Profile not found' });
            }
            auditLogger_js_1.auditLogger.log('user_profile_updated', userId, {
                updated_fields: Object.keys(validatedData)
            });
            res.json({ success: true, profile: result.rows[0] });
        }
        catch (error) {
            console.error('Error updating user profile:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid input',
                    details: error.format()
                });
            }
            res.status(500).json({ success: false, error: 'Failed to update profile' });
        }
    });
    // Upload avatar
    router.post('/avatar', async (req, res) => {
        try {
            const userId = req.user?.id;
            const { avatar } = req.body;
            if (!avatar || !avatar.startsWith('data:image')) {
                return res.status(400).json({ success: false, error: 'Invalid image data' });
            }
            // In production, upload to S3/Cloudinary and store URL
            // For now, store base64 (not recommended for production)
            const result = await (0, database_js_1.query)(`UPDATE user_profiles 
         SET avatar_url = $1, updated_at = NOW()
         WHERE user_id = $2
         RETURNING avatar_url`, [avatar, userId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Profile not found' });
            }
            auditLogger_js_1.auditLogger.log('user_avatar_updated', userId);
            res.json({ success: true, avatar_url: result.rows[0].avatar_url });
        }
        catch (error) {
            console.error('Error uploading avatar:', error);
            res.status(500).json({ success: false, error: 'Failed to upload avatar' });
        }
    });
    // Get user certifications
    router.get('/certifications', async (req, res) => {
        try {
            const userId = req.user?.id;
            const result = await (0, database_js_1.query)(`SELECT *,
         CASE
           WHEN expiry_date < NOW() THEN 'expired'
           WHEN expiry_date < NOW() + INTERVAL '30 days' THEN 'expiring_soon'
           ELSE 'active'
         END as status
         FROM user_certifications
         WHERE user_id = $1
         ORDER BY expiry_date DESC NULLS LAST, issue_date DESC`, [userId]);
            res.json({ success: true, certifications: result.rows });
        }
        catch (error) {
            console.error('Error fetching certifications:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch certifications' });
        }
    });
    // Add certification
    router.post('/certifications', async (req, res) => {
        try {
            const userId = req.user?.id;
            const validatedData = certificationSchema.parse(req.body);
            const result = await (0, database_js_1.query)(`INSERT INTO user_certifications (
          user_id, name, issuer, issue_date, expiry_date,
          certificate_number, document_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`, [
                userId,
                validatedData.name,
                validatedData.issuer,
                validatedData.issue_date,
                validatedData.expiry_date || null,
                validatedData.certificate_number || null,
                validatedData.document_url || null
            ]);
            auditLogger_js_1.auditLogger.log('certification_added', userId, {
                certification_id: result.rows[0].id,
                name: validatedData.name
            });
            res.status(201).json({ success: true, certification: result.rows[0] });
        }
        catch (error) {
            console.error('Error adding certification:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid input',
                    details: error.format()
                });
            }
            res.status(500).json({ success: false, error: 'Failed to add certification' });
        }
    });
    // Update certification
    router.put('/certifications/:id', async (req, res) => {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            const validatedData = certificationSchema.partial().parse(req.body);
            const result = await (0, database_js_1.query)(`UPDATE user_certifications
         SET name = COALESCE($1, name),
             issuer = COALESCE($2, issuer),
             issue_date = COALESCE($3, issue_date),
             expiry_date = COALESCE($4, expiry_date),
             certificate_number = COALESCE($5, certificate_number),
             updated_at = NOW()
         WHERE id = $6 AND user_id = $7
         RETURNING *`, [
                validatedData.name,
                validatedData.issuer,
                validatedData.issue_date,
                validatedData.expiry_date,
                validatedData.certificate_number,
                id,
                userId
            ]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Certification not found' });
            }
            res.json({ success: true, certification: result.rows[0] });
        }
        catch (error) {
            console.error('Error updating certification:', error);
            res.status(500).json({ success: false, error: 'Failed to update certification' });
        }
    });
    // Delete certification
    router.delete('/certifications/:id', async (req, res) => {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            const result = await (0, database_js_1.query)('DELETE FROM user_certifications WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Certification not found' });
            }
            res.json({ success: true, message: 'Certification deleted' });
        }
        catch (error) {
            console.error('Error deleting certification:', error);
            res.status(500).json({ success: false, error: 'Failed to delete certification' });
        }
    });
    // Get user trainings
    router.get('/trainings', async (req, res) => {
        try {
            const userId = req.user?.id;
            const result = await (0, database_js_1.query)(`SELECT * FROM user_trainings
         WHERE user_id = $1
         ORDER BY completion_date DESC`, [userId]);
            res.json({ success: true, trainings: result.rows });
        }
        catch (error) {
            console.error('Error fetching trainings:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch trainings' });
        }
    });
    // Add training
    router.post('/trainings', async (req, res) => {
        try {
            const userId = req.user?.id;
            const validatedData = trainingSchema.parse(req.body);
            const result = await (0, database_js_1.query)(`INSERT INTO user_trainings (
          user_id, course_name, provider, completion_date,
          hours, certificate_url, next_renewal
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`, [
                userId,
                validatedData.course_name,
                validatedData.provider,
                validatedData.completion_date,
                validatedData.hours || null,
                validatedData.certificate_url || null,
                validatedData.next_renewal || null
            ]);
            auditLogger_js_1.auditLogger.log('training_added', userId, {
                training_id: result.rows[0].id,
                course: validatedData.course_name
            });
            res.status(201).json({ success: true, training: result.rows[0] });
        }
        catch (error) {
            console.error('Error adding training:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid input',
                    details: error.format()
                });
            }
            res.status(500).json({ success: false, error: 'Failed to add training' });
        }
    });
    // Export user data (GDPR compliance)
    router.get('/export', async (req, res) => {
        try {
            const userId = req.user?.id;
            // Fetch all user data
            const profileResult = await (0, database_js_1.query)('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
            const certificationsResult = await (0, database_js_1.query)('SELECT * FROM user_certifications WHERE user_id = $1', [userId]);
            const trainingsResult = await (0, database_js_1.query)('SELECT * FROM user_trainings WHERE user_id = $1', [userId]);
            const userData = {
                profile: profileResult.rows[0] || {},
                certifications: certificationsResult.rows,
                trainings: trainingsResult.rows,
                exported_at: new Date().toISOString()
            };
            auditLogger_js_1.auditLogger.log('user_data_exported', userId);
            // Set headers for file download
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="fieldforge-data-${userId}.json"`);
            res.json(userData);
        }
        catch (error) {
            console.error('Error exporting user data:', error);
            res.status(500).json({ success: false, error: 'Failed to export user data' });
        }
    });
    // Delete user account (soft delete)
    router.delete('/account', async (req, res) => {
        try {
            const userId = req.user?.id;
            const { confirmation } = req.body;
            if (confirmation !== 'DELETE MY ACCOUNT') {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid confirmation'
                });
            }
            // Soft delete by marking profile as deleted
            await (0, database_js_1.query)(`UPDATE user_profiles 
         SET deleted_at = NOW(), updated_at = NOW()
         WHERE user_id = $1`, [userId]);
            // In production, also handle Supabase auth deletion
            // await supabase.auth.admin.deleteUser(userId);
            auditLogger_js_1.auditLogger.log('account_deleted', userId);
            res.json({ success: true, message: 'Account scheduled for deletion' });
        }
        catch (error) {
            console.error('Error deleting account:', error);
            res.status(500).json({ success: false, error: 'Failed to delete account' });
        }
    });
    // Get user settings
    router.get('/settings', async (req, res) => {
        try {
            const userId = req.user?.id;
            const result = await (0, database_js_1.query)('SELECT settings FROM user_settings WHERE user_id = $1', [userId]);
            if (result.rows.length === 0) {
                // Return default settings if none exist
                return res.json({
                    success: true,
                    settings: {
                        theme: 'dark',
                        language: 'en',
                        dateFormat: 'MM/DD/YYYY',
                        timeFormat: '12h',
                        firstDayOfWeek: 0,
                        notificationsEnabled: true,
                        notificationCategories: {
                            safety: { app: true, email: true, sms: true, push: true },
                            projects: { app: true, email: true, sms: false, push: true },
                            equipment: { app: true, email: false, sms: false, push: true },
                            weather: { app: true, email: false, sms: false, push: true },
                            system: { app: true, email: true, sms: false, push: false }
                        },
                        quietHoursEnabled: false,
                        quietHoursStart: '22:00',
                        quietHoursEnd: '07:00',
                        autoSync: true,
                        syncInterval: 15,
                        offlineMode: false,
                        cacheSize: 100,
                        dataCompression: false,
                        reducedMotion: false,
                        lowDataMode: false,
                        biometricAuth: false,
                        sessionTimeout: 30,
                        showProfilePhoto: true,
                        shareLocation: true,
                        analyticsEnabled: true,
                        highContrast: false,
                        largeText: false,
                        soundEffects: true,
                        hapticFeedback: true,
                        screenReaderOptimized: false,
                        debugMode: false,
                        showPerformanceStats: false,
                        enableBetaFeatures: false,
                        autoBackup: true,
                        backupFrequency: 'weekly',
                        storageUsed: 0
                    }
                });
            }
            res.json({ success: true, settings: result.rows[0].settings });
        }
        catch (error) {
            console.error('Error fetching settings:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch settings' });
        }
    });
    // Update user settings
    router.put('/settings', async (req, res) => {
        try {
            const userId = req.user?.id;
            const validatedData = settingsSchema.parse(req.body);
            // Upsert settings
            const result = await (0, database_js_1.query)(`INSERT INTO user_settings (user_id, settings, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id)
         DO UPDATE SET settings = $2, updated_at = NOW()
         RETURNING settings`, [userId, JSON.stringify(validatedData)]);
            auditLogger_js_1.auditLogger.log('user_settings_updated', userId);
            res.json({ success: true, settings: result.rows[0].settings });
        }
        catch (error) {
            console.error('Error updating settings:', error);
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid settings',
                    details: error.format()
                });
            }
            res.status(500).json({ success: false, error: 'Failed to update settings' });
        }
    });
    // Get cache statistics
    router.get('/cache-stats', async (req, res) => {
        try {
            const userId = req.user?.id;
            // In production, this would calculate actual cache usage
            // For now, return mock data
            const stats = {
                size: Math.floor(Math.random() * 50 * 1024 * 1024), // Random 0-50MB
                items: Math.floor(Math.random() * 1000),
                lastCleared: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            };
            res.json({ success: true, stats });
        }
        catch (error) {
            console.error('Error fetching cache stats:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch cache stats' });
        }
    });
    // Clear user cache
    router.delete('/cache', async (req, res) => {
        try {
            const userId = req.user?.id;
            // In production, this would clear actual cache
            // Log the cache clear action
            auditLogger_js_1.auditLogger.log('cache_cleared', userId);
            res.json({ success: true, message: 'Cache cleared successfully' });
        }
        catch (error) {
            console.error('Error clearing cache:', error);
            res.status(500).json({ success: false, error: 'Failed to clear cache' });
        }
    });
    return router;
}
