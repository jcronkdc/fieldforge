import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClipboardCheck, AlertTriangle, CheckCircle, XCircle, FileText, TestTube, Camera, Plus, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface InspectionForm {
  id: string;
  name: string;
  category: string;
  description?: string;
  status: string;
}

interface Inspection {
  id: string;
  form_name: string;
  project_name: string;
  type: string;
  status: 'in_progress' | 'completed';
  started_at: string;
  completed_at?: string;
  overall_status?: 'pass' | 'fail' | 'conditional';
  items_passed?: number;
  items_failed?: number;
  total_items?: number;
  has_critical_defects?: boolean;
}

interface ChecklistItem {
  id: string;
  item_name: string;
  category: string;
  status: 'pending' | 'checked';
  pass_fail?: 'pass' | 'fail' | 'na';
  notes?: string;
}

export const QAQCHub: React.FC = () => {
  const { session } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [forms, setForms] = useState<InspectionForm[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const isMobile = window.innerWidth < 768;

  // FETCH REAL INSPECTION FORMS
  const fetchForms = async () => {
    try {
      const response = await fetch('/api/qaqc/forms', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      
      const data = await response.json();
      setForms(data.forms);
    } catch (error) {
      console.error('Failed to fetch forms:', error);
    }
  };

  // FETCH INSPECTIONS LIST
  const fetchInspections = async () => {
    try {
      const response = await fetch('/api/qaqc/inspections?limit=20', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      
      const data = await response.json();
      setInspections(data.inspections);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch inspections:', error);
      toast.error('Failed to load inspections');
      setLoading(false);
    }
  };

  // FETCH INSPECTION DETAILS WITH CHECKLIST
  const fetchInspectionDetails = async (inspectionId: string) => {
    try {
      const response = await fetch(`/api/qaqc/inspections/${inspectionId}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      
      const data = await response.json();
      setSelectedInspection(data.inspection);
      setChecklist(data.checklist || []);
    } catch (error) {
      toast.error('Failed to load inspection details');
    }
  };

  // CREATE NEW INSPECTION
  const handleCreateInspection = async (formData: any) => {
    try {
      const response = await fetch('/api/qaqc/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          form_id: formData.form_id,
          project_id: formData.project_id,
          type: formData.type || 'routine',
          area: formData.area,
          equipment_id: formData.equipment_id
        })
      });

      if (!response.ok) throw new Error('Failed to create inspection');

      const newInspection = await response.json();
      toast.success('Inspection created successfully');
      
      // Navigate to inspection
      await fetchInspectionDetails(newInspection.id);
      setShowCreateForm(false);
      await fetchInspections(); // Refresh list
      
    } catch (error) {
      toast.error('Failed to create inspection');
    }
  };

  // UPDATE CHECKLIST ITEM
  const handleChecklistUpdate = async (itemId: string, status: string, passFail: string, notes?: string) => {
    try {
      const response = await fetch(`/api/qaqc/checklist/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          status: 'checked',
          pass_fail: passFail,
          notes
        })
      });

      if (!response.ok) throw new Error('Failed to update checklist');

      const updatedItem = await response.json();
      
      // Update local state
      setChecklist(prev => prev.map(item => 
        item.id === itemId ? { ...item, ...updatedItem } : item
      ));

      toast.success('Checklist updated');
      
    } catch (error) {
      toast.error('Failed to update checklist item');
    }
  };

  // CREATE DEFECT
  const handleCreateDefect = async (defectData: any) => {
    try {
      const response = await fetch('/api/qaqc/defects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          inspection_id: selectedInspection?.id,
          ...defectData
        })
      });

      if (!response.ok) throw new Error('Failed to create defect');

      toast.success('Defect reported');
      
      // Refresh inspection details
      if (selectedInspection) {
        await fetchInspectionDetails(selectedInspection.id);
      }
      
    } catch (error) {
      toast.error('Failed to report defect');
    }
  };

  // COMPLETE INSPECTION
  const handleCompleteInspection = async (signature: string) => {
    if (!selectedInspection) return;

    const passCount = checklist.filter(i => i.pass_fail === 'pass').length;
    const failCount = checklist.filter(i => i.pass_fail === 'fail').length;
    const overallStatus = failCount === 0 ? 'pass' : 'fail';

    try {
      const response = await fetch(`/api/qaqc/inspections/${selectedInspection.id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          signature,
          overall_status: overallStatus,
          recommendations: `${passCount} items passed, ${failCount} items failed`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success('Inspection completed');
      await fetchInspections();
      setSelectedInspection(null);
      
    } catch (error) {
      toast.error(error.message || 'Failed to complete inspection');
    }
  };

  useEffect(() => {
    if (session) {
      fetchForms();
      fetchInspections();
    }
  }, [session]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-500';
      case 'fail': return 'text-red-500';
      case 'conditional': return 'text-yellow-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5" />;
      case 'fail': return <XCircle className="w-5 h-5" />;
      case 'conditional': return <AlertTriangle className="w-5 h-5" />;
      default: return <ClipboardCheck className="w-5 h-5" />;
    }
  };

  return (
    <div className={isMobile ? 'p-4' : 'p-6'}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">QAQC Hub</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-amber-500 text-black rounded-lg flex items-center gap-2 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          {!isMobile && 'New Inspection'}
        </button>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active</p>
              <p className="text-2xl font-bold text-white">
                {inspections.filter(i => i.status === 'in_progress').length}
              </p>
            </div>
            <ClipboardCheck className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Passed</p>
              <p className="text-2xl font-bold text-green-500">
                {inspections.filter(i => i.overall_status === 'pass').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-red-500">
                {inspections.filter(i => i.overall_status === 'fail').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Critical</p>
              <p className="text-2xl font-bold text-red-500">
                {inspections.filter(i => i.has_critical_defects).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={isMobile ? 'space-y-4' : 'grid grid-cols-3 gap-6'}>
        {/* Inspections List */}
        <div className={isMobile ? '' : 'col-span-1'}>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">Inspections</h2>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {loading ? (
                <p className="text-gray-400">Loading inspections...</p>
              ) : inspections.length === 0 ? (
                <p className="text-gray-400">No inspections yet</p>
              ) : (
                inspections.map(inspection => (
                  <div
                    key={inspection.id}
                    onClick={() => fetchInspectionDetails(inspection.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedInspection?.id === inspection.id 
                        ? 'bg-amber-500/20 border border-amber-500' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-sm">
                          {inspection.form_name}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {inspection.project_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(inspection.started_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        {inspection.status === 'completed' && (
                          <div className={`flex items-center gap-1 ${getStatusColor(inspection.overall_status || '')}`}>
                            {getStatusIcon(inspection.overall_status || '')}
                            <span className="text-xs uppercase">{inspection.overall_status}</span>
                          </div>
                        )}
                        {inspection.status === 'in_progress' && (
                          <span className="text-xs text-yellow-400">In Progress</span>
                        )}
                        {inspection.has_critical_defects && (
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Inspection Details/Checklist */}
        {selectedInspection && (
          <div className={isMobile ? 'mt-4' : 'col-span-2'}>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedInspection.form_name}
                  </h2>
                  <p className="text-gray-400">{selectedInspection.project_name}</p>
                </div>
                {selectedInspection.status === 'completed' && (
                  <div className={`flex items-center gap-2 ${getStatusColor(selectedInspection.overall_status || '')}`}>
                    {getStatusIcon(selectedInspection.overall_status || '')}
                    <span className="font-semibold">{selectedInspection.overall_status?.toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* Checklist Items */}
              {selectedInspection.status === 'in_progress' && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white mb-2">Checklist Items</h3>
                  
                  {checklist.map((item, index) => (
                    <div key={item.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-white">
                            {index + 1}. {item.item_name}
                          </p>
                          <p className="text-sm text-gray-400">{item.category}</p>
                        </div>
                        {item.status === 'checked' && (
                          <div className={`flex items-center gap-1 ${
                            item.pass_fail === 'pass' ? 'text-green-500' : 
                            item.pass_fail === 'fail' ? 'text-red-500' : 'text-gray-400'
                          }`}>
                            {item.pass_fail === 'pass' ? <CheckCircle className="w-5 h-5" /> :
                             item.pass_fail === 'fail' ? <XCircle className="w-5 h-5" /> :
                             <span className="text-xs">N/A</span>}
                          </div>
                        )}
                      </div>

                      {item.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleChecklistUpdate(item.id, 'checked', 'pass')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm min-h-[36px]"
                          >
                            Pass
                          </button>
                          <button
                            onClick={() => handleChecklistUpdate(item.id, 'checked', 'fail')}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm min-h-[36px]"
                          >
                            Fail
                          </button>
                          <button
                            onClick={() => handleChecklistUpdate(item.id, 'checked', 'na')}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm min-h-[36px]"
                          >
                            N/A
                          </button>
                        </div>
                      )}

                      {item.notes && (
                        <p className="text-sm text-gray-300 mt-2">{item.notes}</p>
                      )}
                    </div>
                  ))}

                  {/* Complete Inspection Button */}
                  {checklist.every(item => item.status === 'checked') && (
                    <div className="mt-6 pt-6 border-t border-gray-600">
                      <button
                        onClick={() => handleCompleteInspection('digital_signature')}
                        className="w-full px-6 py-3 bg-amber-500 text-black rounded-lg font-semibold min-h-[48px]"
                      >
                        Complete Inspection
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Results Summary for Completed */}
              {selectedInspection.status === 'completed' && (
                <div className="mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-500">
                        {selectedInspection.items_passed || 0}
                      </p>
                      <p className="text-sm text-gray-400">Passed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-500">
                        {selectedInspection.items_failed || 0}
                      </p>
                      <p className="text-sm text-gray-400">Failed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-400">
                        {selectedInspection.total_items || 0}
                      </p>
                      <p className="text-sm text-gray-400">Total</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg flex items-center gap-2 min-h-[44px]">
                  <Camera className="w-4 h-4" />
                  Add Photo
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg flex items-center gap-2 min-h-[44px]">
                  <AlertTriangle className="w-4 h-4" />
                  Report Defect
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg flex items-center gap-2 min-h-[44px]">
                  <TestTube className="w-4 h-4" />
                  Add Test Result
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
