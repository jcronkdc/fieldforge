-- RFI, Submittal and Document Management Tables for FieldForge T&D/Substation Platform
-- Migration: 006_rfi_submittal_document_tables.sql

-- Request for Information (RFI)
CREATE TABLE rfis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    rfi_number TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT CHECK (category IN (
        'design', 'specification', 'material', 'construction_method',
        'schedule', 'safety', 'testing', 'commissioning', 'other'
    )),
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status TEXT DEFAULT 'open' CHECK (status IN (
        'draft', 'open', 'in_review', 'responded', 'closed', 'void'
    )),
    -- Question details
    question TEXT NOT NULL,
    background TEXT,
    suggested_solution TEXT,
    spec_section TEXT,
    drawing_references TEXT[],
    -- Submitted info
    submitted_by UUID REFERENCES auth.users(id),
    submitted_date TIMESTAMPTZ,
    submitted_to UUID REFERENCES auth.users(id),
    company_from UUID REFERENCES companies(id),
    company_to UUID REFERENCES companies(id),
    -- Response info
    response TEXT,
    response_by UUID REFERENCES auth.users(id),
    response_date TIMESTAMPTZ,
    response_reviewed_by UUID REFERENCES auth.users(id),
    -- Impact assessment
    cost_impact DECIMAL(10, 2),
    schedule_impact_days INTEGER,
    change_order_required BOOLEAN DEFAULT false,
    change_order_number TEXT,
    -- Tracking
    required_response_date DATE,
    days_outstanding INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN status IN ('open', 'in_review') AND submitted_date IS NOT NULL 
            THEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - submitted_date))::INTEGER
            ELSE NULL
        END
    ) STORED,
    ball_in_court TEXT, -- Current responsibility
    -- Attachments
    question_attachments JSONB[],
    response_attachments JSONB[],
    -- Workflow
    workflow_history JSONB[], -- Array of status changes with timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, rfi_number)
);

-- Submittals
CREATE TABLE submittals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    submittal_number TEXT NOT NULL,
    revision TEXT DEFAULT 'A',
    title TEXT NOT NULL,
    spec_section TEXT NOT NULL,
    spec_paragraph TEXT,
    submittal_type TEXT CHECK (submittal_type IN (
        'product_data', 'shop_drawing', 'sample', 'test_report',
        'certificate', 'manual', 'warranty', 'closeout'
    )),
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'submitted', 'in_review', 'approved', 
        'approved_as_noted', 'revise_resubmit', 'rejected', 'for_information'
    )),
    -- Submission details
    submitted_by UUID REFERENCES auth.users(id),
    submitted_date TIMESTAMPTZ,
    contractor_id UUID REFERENCES companies(id),
    supplier TEXT,
    manufacturer TEXT,
    product_model TEXT,
    -- Review details
    reviewer_id UUID REFERENCES auth.users(id),
    review_date TIMESTAMPTZ,
    reviewer_comments TEXT,
    approval_stamps JSONB[], -- Digital approval stamps
    -- Schedule
    required_onsite_date DATE,
    lead_time_days INTEGER,
    required_approval_date DATE,
    actual_approval_date DATE,
    days_in_review INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN status = 'in_review' AND submitted_date IS NOT NULL 
            THEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - submitted_date))::INTEGER
            ELSE NULL
        END
    ) STORED,
    -- Resubmittal tracking
    is_resubmittal BOOLEAN DEFAULT false,
    previous_submittal_id UUID REFERENCES submittals(id),
    resubmittal_count INTEGER DEFAULT 0,
    -- Distribution
    distribution_list JSONB[], -- Array of {user_id, company, sent_date}
    -- Attachments
    attachments JSONB[],
    marked_up_drawings JSONB[],
    -- Workflow
    workflow_history JSONB[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, submittal_number, revision)
);

-- Document registry
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    document_number TEXT NOT NULL,
    revision TEXT DEFAULT '0',
    title TEXT NOT NULL,
    document_type TEXT CHECK (document_type IN (
        'drawing', 'specification', 'report', 'procedure', 'manual',
        'permit', 'certificate', 'correspondence', 'photo', 'other'
    )),
    discipline TEXT CHECK (discipline IN (
        'electrical', 'civil', 'structural', 'mechanical',
        'protection_control', 'scada', 'environmental', 'general'
    )),
    format TEXT, -- 'PDF', 'DWG', 'XLSX', etc.
    file_size_mb DECIMAL(10, 2),
    -- Status and workflow
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft', 'for_review', 'for_approval', 'approved', 
        'for_construction', 'as_built', 'superseded', 'void'
    )),
    issue_purpose TEXT, -- 'For Information', 'For Review', 'For Construction'
    issued_date DATE,
    issued_by UUID REFERENCES auth.users(id),
    -- Review and approval
    reviewed_by UUID REFERENCES auth.users(id),
    review_date DATE,
    review_comments TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approval_date DATE,
    -- File management
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    native_file_url TEXT, -- Original editable file
    checksum TEXT, -- File integrity check
    -- Metadata
    author TEXT,
    originator_company UUID REFERENCES companies(id),
    keywords TEXT[],
    description TEXT,
    sheet_size TEXT, -- 'A1', 'D', '11x17', etc.
    scale TEXT,
    -- Relationships
    supersedes_id UUID REFERENCES documents(id),
    related_documents UUID[],
    rfi_references TEXT[],
    submittal_references TEXT[],
    -- Distribution
    distribution_list JSONB[],
    download_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ,
    last_accessed_by UUID REFERENCES auth.users(id),
    -- Search
    search_content TEXT, -- Extracted text for search
    ocr_processed BOOLEAN DEFAULT false,
    -- Retention
    retention_period_years INTEGER,
    destruction_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, document_number, revision)
);

-- Drawing sets/packages
CREATE TABLE drawing_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    set_name TEXT NOT NULL,
    set_type TEXT CHECK (set_type IN (
        'ifc', 'bid', 'permit', 'construction', 'as_built', 'record'
    )),
    issue_date DATE NOT NULL,
    issued_by UUID REFERENCES auth.users(id),
    description TEXT,
    drawings JSONB[], -- Array of document IDs with sheet order
    transmittal_number TEXT,
    recipient_companies UUID[],
    download_url TEXT, -- Combined PDF
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Document transmittals
CREATE TABLE transmittals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    transmittal_number TEXT NOT NULL,
    transmittal_date DATE NOT NULL,
    from_company UUID REFERENCES companies(id),
    to_company UUID REFERENCES companies(id),
    attention TEXT,
    subject TEXT NOT NULL,
    purpose TEXT CHECK (purpose IN (
        'for_information', 'for_review', 'for_approval', 
        'for_construction', 'for_record'
    )),
    response_required BOOLEAN DEFAULT false,
    response_due_date DATE,
    -- Documents included
    documents JSONB[], -- Array of {document_id, copies, format}
    -- Delivery method
    delivery_method TEXT CHECK (delivery_method IN (
        'email', 'upload', 'hard_copy', 'usb', 'ftp'
    )),
    delivery_tracking TEXT,
    -- Acknowledgment
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_date TIMESTAMPTZ,
    -- Comments
    transmittal_notes TEXT,
    response_notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, transmittal_number)
);

-- Document comments/markups
CREATE TABLE document_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    comment_number INTEGER NOT NULL,
    page_number INTEGER,
    x_coordinate DECIMAL(10, 2),
    y_coordinate DECIMAL(10, 2),
    comment_text TEXT NOT NULL,
    comment_type TEXT CHECK (comment_type IN (
        'question', 'clarification', 'correction', 'suggestion', 'approval'
    )),
    severity TEXT CHECK (severity IN ('minor', 'major', 'critical')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    resolution TEXT,
    replies JSONB[], -- Thread of replies
    attachments JSONB[],
    UNIQUE(document_id, comment_number)
);

-- Meeting minutes
CREATE TABLE meeting_minutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    meeting_number TEXT NOT NULL,
    meeting_type TEXT CHECK (meeting_type IN (
        'kickoff', 'progress', 'safety', 'coordination',
        'design_review', 'pre_construction', 'closeout'
    )),
    meeting_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location TEXT,
    chairperson UUID REFERENCES auth.users(id),
    -- Attendees
    attendees JSONB[], -- Array of {name, company, email, present}
    distribution_list JSONB[],
    -- Agenda and discussion
    agenda_items JSONB[],
    discussion_notes TEXT,
    decisions_made JSONB[],
    -- Action items
    action_items JSONB[], -- Array of {item, responsible, due_date, status}
    -- Safety topics
    safety_topics TEXT[],
    safety_concerns JSONB[],
    -- Schedule and cost
    schedule_discussion TEXT,
    cost_discussion TEXT,
    change_orders_discussed JSONB[],
    -- Next meeting
    next_meeting_date DATE,
    next_meeting_location TEXT,
    -- Attachments
    attachments JSONB[],
    -- Approval
    prepared_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approval_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, meeting_number)
);

-- Create indexes
CREATE INDEX idx_rfis_project_status ON rfis(project_id, status);
CREATE INDEX idx_rfis_number ON rfis(rfi_number);
CREATE INDEX idx_rfis_submitted_date ON rfis(submitted_date);
CREATE INDEX idx_submittals_project_status ON submittals(project_id, status);
CREATE INDEX idx_submittals_number ON submittals(submittal_number);
CREATE INDEX idx_submittals_spec ON submittals(spec_section);
CREATE INDEX idx_documents_project_type ON documents(project_id, document_type);
CREATE INDEX idx_documents_number ON documents(document_number);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_search ON documents USING gin(to_tsvector('english', search_content));
CREATE INDEX idx_drawing_sets_project ON drawing_sets(project_id);
CREATE INDEX idx_transmittals_project ON transmittals(project_id);
CREATE INDEX idx_document_comments_document ON document_comments(document_id);
CREATE INDEX idx_meeting_minutes_project_date ON meeting_minutes(project_id, meeting_date);

-- Enable RLS
ALTER TABLE rfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE submittals ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawing_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transmittals ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_minutes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY rfis_project_access ON rfis FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY submittals_project_access ON submittals FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY documents_project_access ON documents FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY drawing_sets_project_access ON drawing_sets FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY transmittals_project_access ON transmittals FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

CREATE POLICY document_comments_access ON document_comments FOR ALL TO authenticated
    USING (
        document_id IN (
            SELECT id FROM documents 
            WHERE project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid())
        )
    );

CREATE POLICY meeting_minutes_project_access ON meeting_minutes FOR ALL TO authenticated
    USING (project_id IN (SELECT project_id FROM project_team WHERE user_id = auth.uid()));

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
