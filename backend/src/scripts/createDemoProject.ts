#!/usr/bin/env ts-node
/**
 * FieldForge Demo Project Creator
 * ================================
 * Creates a complete, realistic construction project with:
 * - Project setup (Substation Construction)
 * - Team members with roles
 * - Safety incidents and inspections
 * - Equipment and materials
 * - QA/QC checkpoints
 * - Daily reports and time entries
 * - Collaboration rooms (Daily.co)
 * - Messaging groups (invite-only)
 * - Documents and submittals
 * - Weather tracking
 * 
 * This demonstrates the full mycelial network flow:
 * Project → Team → Collaboration → Real-time Communication
 * 
 * © 2025 FieldForge. All Rights Reserved.
 */

import { query } from '../database.js';
import { loadEnv } from '../worker/env.js';

const env = loadEnv();

interface DemoProjectResult {
  project: any;
  company: any;
  users: any[];
  safetyIncidents: any[];
  equipment: any[];
  inspections: any[];
  dailyReports: any[];
  documents: any[];
  collaborationRoom?: any;
  messagingGroup?: any;
}

/**
 * Create a complete demo project
 */
async function createDemoProject(): Promise<DemoProjectResult> {
  console.log('\n🏗️  Creating FieldForge Demo Project...\n');
  
  const result: DemoProjectResult = {
    project: null,
    company: null,
    users: [],
    safetyIncidents: [],
    equipment: [],
    inspections: [],
    dailyReports: [],
    documents: [],
  };

  try {
    // ========================================================================
    // STEP 1: Create Demo Company
    // ========================================================================
    console.log('📋 Step 1: Creating demo company...');
    
    const companyResult = await query(`
      INSERT INTO companies (
        name, industry, company_size, address, city, state, zip_code, 
        phone, email, website, settings
      ) VALUES (
        'PowerGrid Solutions LLC',
        'Electrical Transmission & Distribution',
        '51-200',
        '1234 Industrial Pkwy',
        'Houston',
        'TX',
        '77001',
        '(713) 555-0100',
        'info@powergridsolutions.com',
        'https://powergridsolutions.com',
        '{"certifications": ["ISO 9001", "OSHA VPP"], "insuranceExpires": "2026-12-31"}'::jsonb
      )
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING *
    `);
    result.company = companyResult.rows[0];
    console.log(`✅ Company created: ${result.company.name} (ID: ${result.company.id})`);

    // ========================================================================
    // STEP 2: Create Demo Users (Team Members)
    // ========================================================================
    console.log('\n👥 Step 2: Creating demo team members...');
    
    const users = [
      {
        name: 'Sarah Chen',
        email: 'sarah.chen@powergridsolutions.com',
        role: 'Project Manager',
        certifications: ['PMP', 'PE - Electrical'],
        phone: '(713) 555-0101'
      },
      {
        name: 'Marcus Rodriguez',
        email: 'marcus.rodriguez@powergridsolutions.com',
        role: 'Field Supervisor',
        certifications: ['OSHA 30', 'First Aid/CPR'],
        phone: '(713) 555-0102'
      },
      {
        name: 'Jennifer Walsh',
        email: 'jennifer.walsh@powergridsolutions.com',
        role: 'Safety Officer',
        certifications: ['CSP', 'CHST', 'OSHA 500'],
        phone: '(713) 555-0103'
      },
      {
        name: 'David Kim',
        email: 'david.kim@powergridsolutions.com',
        role: 'QA/QC Inspector',
        certifications: ['CQI', 'Level II NDT'],
        phone: '(713) 555-0104'
      },
      {
        name: 'Amanda Torres',
        email: 'amanda.torres@powergridsolutions.com',
        role: 'Equipment Coordinator',
        certifications: ['CDL Class A', 'Crane Operator'],
        phone: '(713) 555-0105'
      }
    ];

    for (const user of users) {
      const userResult = await query(`
        INSERT INTO user_profiles (
          id, email, full_name, role, company_id, phone, 
          certifications, is_active, settings
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, true,
          '{"notifications": {"email": true, "push": true}, "theme": "dark"}'::jsonb
        )
        ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
        RETURNING *
      `, [user.email, user.name, user.role, result.company.id, user.phone, user.certifications]);
      
      result.users.push(userResult.rows[0]);
      console.log(`✅ User created: ${user.name} - ${user.role}`);
    }

    // ========================================================================
    // STEP 3: Create Main Demo Project
    // ========================================================================
    console.log('\n🏗️  Step 3: Creating main construction project...');
    
    const projectResult = await query(`
      INSERT INTO projects (
        name, description, project_type, status, company_id,
        start_date, end_date, budget, location,
        project_manager_id, settings
      ) VALUES (
        'Cedar Creek 138kV Substation Construction',
        'Design, procurement, and construction of a new 138kV substation including two 138/12.47kV transformers (20/28/35 MVA), 138kV and 12.47kV switchgear, control building, SCADA system, and all associated protection and control equipment. Project includes site preparation, foundation work, equipment installation, testing, and commissioning.',
        'Substation Construction',
        'active',
        $1,
        '2024-11-01',
        '2025-08-31',
        2850000.00,
        '{"address": "15800 Cedar Creek Rd", "city": "Bastrop", "state": "TX", "zip": "78602", "coordinates": {"lat": 30.1106, "lng": -97.3157}}',
        $2,
        '{
          "projectCode": "SUB-CC-2024-001",
          "client": "Cedar Creek Electric Cooperative",
          "voltage": "138kV/12.47kV",
          "transformerCapacity": "20/28/35 MVA",
          "siteSizeAcres": 2.5,
          "constructionType": "Greenfield",
          "safetyGoal": "Zero Lost Time Incidents",
          "qualityStandards": ["IEEE C57.12.00", "IEEE C37.2", "NESC 2023"]
        }'::jsonb
      )
      RETURNING *
    `, [result.company.id, result.users[0].id]); // Sarah Chen as PM
    
    result.project = projectResult.rows[0];
    console.log(`✅ Project created: ${result.project.name}`);
    console.log(`   Budget: $${result.project.budget.toLocaleString()}`);
    console.log(`   Timeline: ${result.project.start_date} to ${result.project.end_date}`);

    // ========================================================================
    // STEP 4: Assign Team to Project
    // ========================================================================
    console.log('\n👥 Step 4: Assigning team members to project...');
    
    const assignments = [
      { user: result.users[0], role: 'Project Manager', permissions: ['admin', 'edit', 'view'] },
      { user: result.users[1], role: 'Field Supervisor', permissions: ['edit', 'view'] },
      { user: result.users[2], role: 'Safety Officer', permissions: ['edit', 'view'] },
      { user: result.users[3], role: 'QA/QC Inspector', permissions: ['edit', 'view'] },
      { user: result.users[4], role: 'Equipment Coordinator', permissions: ['view'] }
    ];

    for (const assignment of assignments) {
      await query(`
        INSERT INTO project_assignments (
          project_id, user_id, role, permissions
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (project_id, user_id) DO UPDATE SET role = EXCLUDED.role
      `, [result.project.id, assignment.user.id, assignment.role, assignment.permissions]);
      
      console.log(`✅ Assigned: ${assignment.user.full_name} as ${assignment.role}`);
    }

    // ========================================================================
    // STEP 5: Create Safety Incidents & Observations
    // ========================================================================
    console.log('\n🦺 Step 5: Creating safety records...');
    
    const safetyData = [
      {
        type: 'near_miss',
        severity: 'medium',
        description: 'Worker nearly struck by swinging crane load during transformer placement. Load was not properly secured and shifted unexpectedly due to wind.',
        location: 'Transformer Pad Area',
        corrective: 'Implemented mandatory spotter for all crane operations. Added wind speed monitoring (operations suspended above 20 mph). Retrained all riggers on proper load securing techniques.',
        reported_by: result.users[2].id // Safety Officer
      },
      {
        type: 'observation',
        severity: 'low',
        description: 'Positive safety observation: Crew conducting excellent pre-shift safety huddle with site-specific hazard review and JSA walkthrough.',
        location: 'Main Construction Staging Area',
        corrective: 'Recognized crew for exemplary safety practices. Shared best practice in company safety newsletter.',
        reported_by: result.users[1].id // Field Supervisor
      }
    ];

    for (const incident of safetyData) {
      const incidentResult = await query(`
        INSERT INTO incidents (
          project_id, company_id, incident_type, severity, description,
          location, reported_by, corrective_actions, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'closed')
        RETURNING *
      `, [
        result.project.id,
        result.company.id,
        incident.type,
        incident.severity,
        incident.description,
        incident.location,
        incident.reported_by,
        incident.corrective
      ]);
      
      result.safetyIncidents.push(incidentResult.rows[0]);
      console.log(`✅ Safety ${incident.type}: ${incident.description.substring(0, 60)}...`);
    }

    // ========================================================================
    // STEP 6: Create Equipment Records
    // ========================================================================
    console.log('\n🚜 Step 6: Adding equipment inventory...');
    
    const equipmentData = [
      {
        type: 'Crane',
        manufacturer: 'Liebherr',
        model: 'LTM 1130-5.1',
        capacity: '130 ton',
        location: 'On-site',
        status: 'operational'
      },
      {
        type: 'Excavator',
        manufacturer: 'Caterpillar',
        model: '336 GC',
        capacity: '36 ton',
        location: 'On-site',
        status: 'operational'
      },
      {
        type: 'Transformer Testing Equipment',
        manufacturer: 'Doble',
        model: 'M7100',
        capacity: 'Power Factor/Tan Delta',
        location: 'Test Lab Trailer',
        status: 'operational'
      },
      {
        type: 'Man Lift',
        manufacturer: 'Genie',
        model: 'Z-60/37 FE',
        capacity: '60ft reach',
        location: 'On-site',
        status: 'maintenance'
      }
    ];

    for (const equip of equipmentData) {
      const equipResult = await query(`
        INSERT INTO equipment (
          project_id, equipment_type, manufacturer, model, 
          serial_number, location, status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        result.project.id,
        equip.type,
        equip.manufacturer,
        equip.model,
        `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        equip.location,
        equip.status,
        `Capacity: ${equip.capacity}`
      ]);
      
      result.equipment.push(equipResult.rows[0]);
      console.log(`✅ Equipment: ${equip.manufacturer} ${equip.model} (${equip.type})`);
    }

    // ========================================================================
    // STEP 7: Create QA/QC Inspections
    // ========================================================================
    console.log('\n✔️  Step 7: Creating QA/QC inspection records...');
    
    const inspections = [
      {
        title: 'Transformer Foundation Inspection',
        type: 'Foundation',
        status: 'passed',
        notes: 'Concrete compressive strength: 4,850 PSI (spec: 4,000 PSI min). Anchor bolts positioned within ±1/8" tolerance. Foundation elevation verified with laser level. No voids or honeycomb detected.',
        inspector: result.users[3].id
      },
      {
        title: 'Grounding System Continuity Test',
        type: 'Electrical',
        status: 'passed',
        notes: 'Ground grid resistance measured at 0.8 ohms (spec: <1.0 ohm). All ground connections torqued to 50 ft-lbs and verified. Thermographic scan shows no hot spots.',
        inspector: result.users[3].id
      },
      {
        title: 'Control Cable Installation QC',
        type: 'Electrical',
        status: 'pending',
        notes: 'Cables pulled and tagged. Awaiting megger testing and final terminations. Scheduled for completion by end of week.',
        inspector: result.users[3].id
      }
    ];

    for (const inspection of inspections) {
      const inspectionResult = await query(`
        INSERT INTO safety_observations (
          project_id, observer_id, observation_type, severity,
          description, location, status, corrective_actions
        ) VALUES ($1, $2, 'inspection', 'low', $3, $4, $5, $6)
        RETURNING *
      `, [
        result.project.id,
        inspection.inspector,
        `${inspection.title} - ${inspection.notes}`,
        inspection.type,
        inspection.status,
        'QA/QC Documentation completed per IEEE standards'
      ]);
      
      result.inspections.push(inspectionResult.rows[0]);
      console.log(`✅ Inspection: ${inspection.title} - ${inspection.status.toUpperCase()}`);
    }

    // ========================================================================
    // STEP 8: Create Daily Reports
    // ========================================================================
    console.log('\n📊 Step 8: Creating daily field reports...');
    
    const dailyReportResult = await query(`
      INSERT INTO daily_reports (
        project_id, company_id, report_date, submitted_by,
        weather_conditions, temperature_high, temperature_low,
        work_performed, equipment_used, materials_received,
        crew_count, hours_worked, safety_incidents,
        delays, notes
      ) VALUES (
        $1, $2, CURRENT_DATE - INTERVAL '1 day', $3,
        'Partly cloudy with light winds',
        78, 62,
        'Completed transformer pad grounding grid installation. Installed 12.47kV switchgear foundation anchor bolts. Continued control building electrical rough-in. Conducted safety inspection of crane rigging.',
        '["Liebherr LTM 1130 Crane", "CAT 336 Excavator", "Genie Z-60 Man Lift", "Welding Equipment"]',
        '["4/0 AWG Ground Cable - 500ft", "3/4" Anchor Bolts (24 each)", "Control Cable Tray - 40ft sections"]',
        12,
        96.0,
        0,
        'None - weather favorable',
        'Project on schedule. Transformer delivery confirmed for next Tuesday. Client walkthrough scheduled for Friday.'
      )
      RETURNING *
    `, [result.project.id, result.company.id, result.users[1].id]); // Field Supervisor
    
    result.dailyReports.push(dailyReportResult.rows[0]);
    console.log(`✅ Daily Report created for ${dailyReportResult.rows[0].report_date.toISOString().split('T')[0]}`);

    // ========================================================================
    // STEP 9: Create Documents
    // ========================================================================
    console.log('\n📄 Step 9: Creating project documents...');
    
    const documents = [
      {
        name: 'Cedar Creek Substation - Single Line Diagram',
        type: 'drawing',
        category: 'Electrical',
        file_path: '/documents/cedar-creek-sld.pdf',
        version: 'Rev 3'
      },
      {
        name: 'Transformer Factory Acceptance Test Report',
        type: 'submittal',
        category: 'Quality',
        file_path: '/documents/transformer-fat-report.pdf',
        version: 'Final'
      },
      {
        name: 'Site Safety Plan',
        type: 'safety',
        category: 'Safety',
        file_path: '/documents/site-safety-plan.pdf',
        version: 'Rev 2'
      },
      {
        name: 'Construction Schedule (3-Week Lookahead)',
        type: 'schedule',
        category: 'Planning',
        file_path: '/documents/schedule-3week-lookahead.xlsx',
        version: 'Week 12'
      }
    ];

    for (const doc of documents) {
      const docResult = await query(`
        INSERT INTO documents (
          project_id, name, document_type, category,
          file_path, uploaded_by, version, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved')
        RETURNING *
      `, [
        result.project.id,
        doc.name,
        doc.type,
        doc.category,
        doc.file_path,
        result.users[0].id, // PM uploads
        doc.version
      ]);
      
      result.documents.push(docResult.rows[0]);
      console.log(`✅ Document: ${doc.name} (${doc.version})`);
    }

    // ========================================================================
    // STEP 10: Create Collaboration Room (Daily.co)
    // ========================================================================
    console.log('\n🎥 Step 10: Setting up video collaboration room...');
    
    if (env.DAILY_API_KEY) {
      try {
        // Create Daily.co room via API
        const dailyResponse = await fetch('https://api.daily.co/v1/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.DAILY_API_KEY}`
          },
          body: JSON.stringify({
            name: `fieldforge-${result.project.id}-main`,
            privacy: 'private',
            properties: {
              enable_chat: true,
              enable_screenshare: true,
              enable_recording: 'cloud',
              enable_knocking: true,
              max_participants: 20
            }
          })
        });

        if (dailyResponse.ok) {
          const dailyRoom = await dailyResponse.json();
          
          const roomResult = await query(`
            INSERT INTO collaboration_rooms (
              project_id, room_name, daily_room_id, daily_room_url,
              created_by, privacy, settings
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
          `, [
            result.project.id,
            'Cedar Creek Team Coordination',
            dailyRoom.id,
            dailyRoom.url,
            result.users[0].id,
            'private',
            JSON.stringify({
              enableCursorControl: true,
              enableScreenShare: true,
              enableRecording: true,
              maxParticipants: 20
            })
          ]);
          
          result.collaborationRoom = roomResult.rows[0];
          console.log(`✅ Collaboration room created: ${dailyRoom.url}`);
          console.log(`   Features: Video, Screen Share, Cursor Control, Recording`);
        } else {
          console.log(`⚠️  Daily.co API returned ${dailyResponse.status} - Room creation skipped`);
        }
      } catch (error) {
        console.log(`⚠️  Could not create Daily.co room: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      console.log('⚠️  DAILY_API_KEY not configured - Collaboration room skipped');
      console.log('   Add DAILY_API_KEY to environment to enable video collaboration');
    }

    // ========================================================================
    // STEP 11: Create Messaging Group (Invite-Only)
    // ========================================================================
    console.log('\n💬 Step 11: Creating invite-only messaging group...');
    
    const conversationResult = await query(`
      INSERT INTO conversations (
        type, name, description, created_by, settings
      ) VALUES (
        'group',
        'Cedar Creek Core Team',
        'Private coordination channel for Cedar Creek substation project leadership',
        $1,
        '{"inviteOnly": true, "allowGuestInvites": false, "requireApproval": true}'::jsonb
      )
      RETURNING *
    `, [result.users[0].id]);
    
    result.messagingGroup = conversationResult.rows[0];

    // Add team members to group
    for (const user of result.users) {
      const role = user.id === result.users[0].id ? 'admin' : 'member';
      await query(`
        INSERT INTO conversation_participants (
          conversation_id, user_id, role
        ) VALUES ($1, $2, $3)
      `, [result.messagingGroup.id, user.id, role]);
    }
    
    console.log(`✅ Messaging group created: ${result.messagingGroup.name}`);
    console.log(`   Members: ${result.users.length} (invite-only access)`);

    // ========================================================================
    // STEP 12: Send Welcome Messages
    // ========================================================================
    console.log('\n📨 Step 12: Sending welcome messages...');
    
    await query(`
      INSERT INTO messages (
        conversation_id, sender_id, content, message_type
      ) VALUES ($1, $2, $3, 'text')
    `, [
      result.messagingGroup.id,
      result.users[0].id,
      'Welcome to the Cedar Creek Core Team channel! 🏗️\n\nThis is our private coordination space for project leadership. Use this for:\n- Daily coordination and quick decisions\n- Safety alerts and updates\n- Schedule changes\n- Quality issues\n- Client communication prep\n\nFor site-wide announcements, use the Emergency Alert system.\n\nLet\'s build something great! 💪'
    ]);
    
    console.log('✅ Welcome message sent to team');

    return result;

  } catch (error) {
    console.error('\n❌ Error creating demo project:', error);
    throw error;
  }
}

/**
 * Print summary of created demo project
 */
function printSummary(result: DemoProjectResult) {
  console.log('\n' + '='.repeat(80));
  console.log('🎉 DEMO PROJECT CREATED SUCCESSFULLY!');
  console.log('='.repeat(80) + '\n');
  
  console.log('📊 Summary:\n');
  console.log(`🏢 Company: ${result.company.name}`);
  console.log(`   Industry: ${result.company.industry}`);
  console.log(`   Location: ${result.company.city}, ${result.company.state}\n`);
  
  console.log(`🏗️  Project: ${result.project.name}`);
  console.log(`   ID: ${result.project.id}`);
  console.log(`   Type: ${result.project.project_type}`);
  console.log(`   Status: ${result.project.status}`);
  console.log(`   Budget: $${result.project.budget.toLocaleString()}`);
  console.log(`   Timeline: ${result.project.start_date} to ${result.project.end_date}\n`);
  
  console.log(`👥 Team: ${result.users.length} members`);
  result.users.forEach(user => {
    console.log(`   - ${user.full_name} (${user.role})`);
  });
  console.log('');
  
  console.log(`🦺 Safety Records: ${result.safetyIncidents.length}`);
  console.log(`🚜 Equipment: ${result.equipment.length} items`);
  console.log(`✔️  QA/QC Inspections: ${result.inspections.length}`);
  console.log(`📊 Daily Reports: ${result.dailyReports.length}`);
  console.log(`📄 Documents: ${result.documents.length}`);
  
  if (result.collaborationRoom) {
    console.log(`🎥 Video Room: ${result.collaborationRoom.room_name}`);
    console.log(`   URL: ${result.collaborationRoom.daily_room_url}`);
  }
  
  if (result.messagingGroup) {
    console.log(`💬 Messaging Group: ${result.messagingGroup.name} (invite-only)`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Demo project is ready for testing!');
  console.log('='.repeat(80) + '\n');
  
  console.log('🚀 Next Steps:\n');
  console.log('1. Login to FieldForge: https://fieldforge.vercel.app/login');
  console.log('2. Use any of these demo accounts:');
  result.users.forEach(user => {
    console.log(`   - ${user.email}`);
  });
  console.log('3. Navigate to Projects and find "Cedar Creek 138kV Substation"');
  console.log('4. Test collaboration features:');
  console.log('   - Join the video room for team coordination');
  console.log('   - Use cursor control during collaborative drawing reviews');
  console.log('   - Send messages in the invite-only team channel');
  console.log('   - Create safety incidents and inspections');
  console.log('   - Generate daily field reports');
  console.log('5. Try the AI assistant for project summaries and navigation\n');
}

/**
 * Main execution
 */
async function main() {
  try {
    const result = await createDemoProject();
    printSummary(result);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to create demo project:', error);
    process.exit(1);
  }
}

// Run if executed directly
const isMainModule = process.argv[1] && process.argv[1].includes('createDemoProject');
if (isMainModule) {
  main();
}

export { createDemoProject };

