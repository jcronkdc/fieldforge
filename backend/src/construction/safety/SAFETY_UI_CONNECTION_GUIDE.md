# 🔌 SAFETY UI CONNECTION GUIDE - COMPLETE E2E PATHWAY

## Builder: Connect SafetyHub.tsx to Real Backend

### Current State (BROKEN):
```typescript
// SafetyHub.tsx - Line ~420
const handleIncidentSubmit = async (data: any) => {
  // TODO: This needs to actually save!
  console.log('Would save incident:', data);
  // NO API CALL - DATA GOES NOWHERE!
};
```

### REPLACE WITH (WORKING E2E):
```typescript
import { toast } from 'react-hot-toast';

const handleIncidentSubmit = async (data: any) => {
  try {
    // 1. ACTUAL API CALL
    const response = await fetch('/api/safety/incidents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}` // Real auth
      },
      body: JSON.stringify({
        type: data.incident_type,
        severity: data.severity,
        location_description: data.location_description,
        description: data.description,
        project_id: selectedProject?.id,
        immediate_actions: data.immediate_actions,
        witnesses: data.witnesses || []
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save incident');
    }

    // 2. GET REAL SAVED DATA
    const savedIncident = await response.json();
    
    // 3. UPDATE UI WITH REAL DATA
    setRecentIncidents(prev => [savedIncident, ...prev]);
    
    // 4. UPDATE METRICS (Real calculation)
    await fetchSafetyData(); // This now calls /api/safety/metrics
    
    // 5. USER FEEDBACK
    toast.success('Incident reported successfully');
    
    // 6. MOBILE RESPONSIVE
    if (window.innerWidth < 768) {
      setShowReportForm(false);
    }
    
    // 7. RESET FORM
    setFormData(initialFormState);
    
  } catch (error) {
    console.error('Safety incident error:', error);
    toast.error('Failed to report incident. Please try again.');
  }
};
```

### Update fetchSafetyData() to Use Real Metrics:
```typescript
const fetchSafetyData = async () => {
  try {
    setLoading(true);
    
    // 1. FETCH REAL METRICS
    const [metricsRes, incidentsRes] = await Promise.all([
      fetch('/api/safety/metrics', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      }),
      fetch('/api/safety/incidents?limit=10', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      })
    ]);
    
    const metrics = await metricsRes.json();
    const { incidents } = await incidentsRes.json();
    
    // 2. SET REAL DATA (not hardcoded!)
    setMetrics({
      daysWithoutIncident: metrics.daysWithoutIncident, // REAL
      totalIncidents: metrics.totalIncidents,           // REAL
      openInvestigations: metrics.openInvestigations,   // REAL
      safetyScore: metrics.safetyScore,                // REAL CALCULATION
      weeklyBriefings: metrics.weeklyBriefings,        // REAL
      activePermits: metrics.activePermits              // REAL
    });
    
    setRecentIncidents(incidents);
    
  } catch (error) {
    console.error('Failed to fetch safety data:', error);
    toast.error('Unable to load safety data');
  } finally {
    setLoading(false);
  }
};
```

### Safety Briefing Form Connection:
```typescript
const handleBriefingSubmit = async (briefingData: any) => {
  try {
    const response = await fetch('/api/safety/briefings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        project_id: selectedProject?.id,
        topics: briefingData.topics,
        hazards_identified: briefingData.hazards,
        safety_reminders: briefingData.reminders,
        attendees: attendees.map(a => ({
          user_id: a.id,
          signature: a.signature // Base64 signature data
        }))
      })
    });
    
    const saved = await response.json();
    toast.success(`Briefing saved with ${attendees.length} signatures`);
    
    // Navigate to briefing list or clear form
    setShowBriefingForm(false);
    await fetchSafetyData(); // Refresh metrics
    
  } catch (error) {
    toast.error('Failed to save briefing');
  }
};
```

### Mobile Signature Capture:
```typescript
import SignaturePad from 'react-signature-canvas';

const SignatureCapture = ({ onSave }) => {
  const sigPadRef = useRef<SignaturePad>(null);
  const isMobile = window.innerWidth < 768;
  
  const handleSave = () => {
    if (sigPadRef.current) {
      const signatureData = sigPadRef.current.toDataURL();
      onSave(signatureData);
    }
  };
  
  return (
    <div className={isMobile ? 'w-full' : 'w-96'}>
      <SignaturePad
        ref={sigPadRef}
        canvasProps={{
          width: isMobile ? window.innerWidth - 40 : 400,
          height: 200,
          className: 'border border-gray-600 rounded-lg bg-gray-800'
        }}
      />
      <button 
        onClick={handleSave}
        className="mt-2 px-4 py-2 bg-amber-500 text-black rounded-lg min-h-[44px]"
      >
        Save Signature
      </button>
    </div>
  );
};
```

## E2E Testing Checklist:

- [ ] Incident form submits to `/api/safety/incidents`
- [ ] Saved incident appears in list immediately
- [ ] Metrics update after incident (days without incident = 0)
- [ ] Briefing saves with multiple signatures
- [ ] Work permits create and display
- [ ] Mobile signature pad works on phone
- [ ] Offline mode queues submissions
- [ ] 100 concurrent incidents don't crash

## Success Metrics:
- ZERO console.log-only operations
- ZERO Math.random() values
- ZERO "Coming Soon" messages
- 100% data persistence
- 100% mobile responsive
