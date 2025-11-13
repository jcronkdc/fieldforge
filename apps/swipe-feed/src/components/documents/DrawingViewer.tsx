import React, { useState, useEffect, useRef } from 'react';
import { FileText, ZoomIn, ZoomOut, RotateCw, Download, Upload, Grid, Maximize2, Layers, Ruler, Edit2, MessageSquare, Check, X, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Drawing {
  id: number;
  name: string;
  file_url: string;
  file_type: string;
  project_id: number;
  project_name?: string;
  revision: string;
  sheet_number: string;
  discipline: 'architectural' | 'structural' | 'electrical' | 'mechanical' | 'civil' | 'other';
  status: 'draft' | 'review' | 'approved' | 'superseded';
  uploaded_by: string;
  upload_date: string;
  file_size: number;
  annotations?: Annotation[];
  tags: string[];
}

interface Annotation {
  id: string;
  type: 'comment' | 'measurement' | 'markup';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color?: string;
  created_by: string;
  created_at: string;
  resolved?: boolean;
}

interface ViewerState {
  zoom: number;
  rotation: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  showAnnotations: boolean;
  currentTool: 'select' | 'comment' | 'measure' | 'markup';
}

const DISCIPLINES = [
  { value: 'architectural', label: 'Architectural', prefix: 'A' },
  { value: 'structural', label: 'Structural', prefix: 'S' },
  { value: 'electrical', label: 'Electrical', prefix: 'E' },
  { value: 'mechanical', label: 'Mechanical', prefix: 'M' },
  { value: 'civil', label: 'Civil', prefix: 'C' },
  { value: 'other', label: 'Other', prefix: 'X' }
];

export const DrawingViewer: React.FC = () => {
  const { session } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewerState, setViewerState] = useState<ViewerState>({
    zoom: 1,
    rotation: 0,
    panX: 0,
    panY: 0,
    showGrid: false,
    showAnnotations: true,
    currentTool: 'select'
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newAnnotation, setNewAnnotation] = useState<Partial<Annotation> | null>(null);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    sheet_number: '',
    revision: 'A',
    discipline: 'architectural',
    tags: ''
  });

  useEffect(() => {
    fetchDrawings();
  }, [filter, searchTerm]);

  useEffect(() => {
    if (selectedDrawing?.annotations) {
      setAnnotations(selectedDrawing.annotations);
    }
  }, [selectedDrawing]);

  const fetchDrawings = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('discipline', filter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/documents/drawings?${params}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch drawings');
      const data = await response.json();
      setDrawings(data);
    } catch (error) {
      console.error('Error fetching drawings:', error);
      toast.error('Failed to load drawings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) return;

    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          resolve(base64.split(',')[1]); // Remove data:type;base64, prefix
        };
      });
      reader.readAsDataURL(uploadForm.file);
      const fileData = await base64Promise;

      const response = await fetch('/api/documents/drawings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          name: uploadForm.file.name,
          file_data: fileData,
          file_type: uploadForm.file.type,
          sheet_number: uploadForm.sheet_number,
          revision: uploadForm.revision,
          discipline: uploadForm.discipline,
          tags: uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });

      if (!response.ok) throw new Error('Failed to upload drawing');

      toast.success('Drawing uploaded successfully');
      fetchDrawings();
      resetUploadForm();
    } catch (error) {
      console.error('Error uploading drawing:', error);
      toast.error('Failed to upload drawing');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      file: null,
      sheet_number: '',
      revision: 'A',
      discipline: 'architectural',
      tags: ''
    });
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setViewerState(prev => ({
      ...prev,
      zoom: direction === 'in' 
        ? Math.min(prev.zoom * 1.2, 5) 
        : Math.max(prev.zoom / 1.2, 0.1)
    }));
  };

  const handleRotate = () => {
    setViewerState(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleAddAnnotation = (e: React.MouseEvent) => {
    if (viewerState.currentTool === 'select' || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / viewerState.zoom;
    const y = (e.clientY - rect.top) / viewerState.zoom;

    const newAnn: Annotation = {
      id: `ann-${Date.now()}`,
      type: viewerState.currentTool === 'comment' ? 'comment' : 
            viewerState.currentTool === 'measure' ? 'measurement' : 'markup',
      x,
      y,
      text: '',
      color: '#f59e0b',
      created_by: 'Current User',
      created_at: new Date().toISOString(),
      resolved: false
    };

    setNewAnnotation(newAnn);
  };

  const saveAnnotation = async (annotation: Annotation) => {
    try {
      const response = await fetch(`/api/documents/drawings/${selectedDrawing?.id}/annotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(annotation)
      });

      if (!response.ok) throw new Error('Failed to save annotation');

      setAnnotations([...annotations, annotation]);
      setNewAnnotation(null);
      toast.success('Annotation added');
    } catch (error) {
      console.error('Error saving annotation:', error);
      toast.error('Failed to save annotation');
    }
  };

  const renderViewer = () => {
    if (!selectedDrawing) {
      return (
        <div className="flex items-center justify-center h-full text-slate-400">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <p>Select a drawing to view</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative h-full bg-slate-900" ref={containerRef}>
        {/* Toolbar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
            <button
              onClick={() => handleZoom('out')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-white px-2">{Math.round(viewerState.zoom * 100)}%</span>
            <button
              onClick={() => handleZoom('in')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-slate-600 mx-1" />
            <button
              onClick={handleRotate}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
              title="Rotate"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewerState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
              className={`p-2 rounded transition ${
                viewerState.showGrid 
                  ? 'text-amber-400 bg-slate-700' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="Toggle Grid"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
              title="Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
            <button
              onClick={() => setViewerState(prev => ({ ...prev, currentTool: 'select' }))}
              className={`p-2 rounded transition ${
                viewerState.currentTool === 'select' 
                  ? 'text-amber-400 bg-slate-700' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="Select"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewerState(prev => ({ ...prev, currentTool: 'comment' }))}
              className={`p-2 rounded transition ${
                viewerState.currentTool === 'comment' 
                  ? 'text-amber-400 bg-slate-700' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="Add Comment"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewerState(prev => ({ ...prev, currentTool: 'measure' }))}
              className={`p-2 rounded transition ${
                viewerState.currentTool === 'measure' 
                  ? 'text-amber-400 bg-slate-700' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="Measure"
            >
              <Ruler className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewerState(prev => ({ ...prev, currentTool: 'markup' }))}
              className={`p-2 rounded transition ${
                viewerState.currentTool === 'markup' 
                  ? 'text-amber-400 bg-slate-700' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="Markup"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>

          <a
            href={selectedDrawing.file_url}
            download={selectedDrawing.name}
            className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </a>
        </div>

        {/* Drawing Display */}
        <div className="w-full h-full flex items-center justify-center overflow-auto">
          <div 
            className="relative"
            style={{
              transform: `scale(${viewerState.zoom}) rotate(${viewerState.rotation}deg)`,
              transformOrigin: 'center'
            }}
          >
            {selectedDrawing.file_type.includes('pdf') ? (
              <iframe
                src={selectedDrawing.file_url}
                className="w-[1200px] h-[800px] bg-white"
                title={selectedDrawing.name}
              />
            ) : (
              <img
                src={selectedDrawing.file_url}
                alt={selectedDrawing.name}
                className="max-w-none"
                onClick={handleAddAnnotation}
              />
            )}

            {/* Grid Overlay */}
            {viewerState.showGrid && (
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 50px, rgba(255,255,255,0.1) 50px), repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 50px, rgba(255,255,255,0.1) 50px)',
                  backgroundSize: '50px 50px'
                }}
              />
            )}

            {/* Annotations */}
            {viewerState.showAnnotations && annotations.map(annotation => (
              <div
                key={annotation.id}
                className="absolute"
                style={{ 
                  left: `${annotation.x}px`, 
                  top: `${annotation.y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {annotation.type === 'comment' && (
                  <div className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:scale-110 transition">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* New Annotation Form */}
            {newAnnotation && (
              <div
                className="absolute bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl"
                style={{ 
                  left: `${newAnnotation.x}px`, 
                  top: `${newAnnotation.y}px`,
                  transform: 'translate(-50%, -100%)',
                  marginTop: '-10px'
                }}
              >
                <textarea
                  autoFocus
                  value={newAnnotation.text || ''}
                  onChange={(e) => setNewAnnotation({ ...newAnnotation, text: e.target.value })}
                  className="w-48 h-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm resize-none"
                  placeholder="Add your comment..."
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setNewAnnotation(null)}
                    className="p-1 text-slate-400 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => saveAnnotation(newAnnotation as Annotation)}
                    className="p-1 text-green-400 hover:text-green-300 transition"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drawing Info */}
        <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 text-sm">
          <p className="text-white font-medium">{selectedDrawing.name}</p>
          <p className="text-slate-400">
            Sheet: {selectedDrawing.sheet_number} | Rev: {selectedDrawing.revision} | 
            {DISCIPLINES.find(d => d.value === selectedDrawing.discipline)?.label}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading drawings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white mb-4">📐 Drawing Viewer</h1>
          
          {/* Search */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search drawings..."
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm mb-4"
          />

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm mb-4"
          >
            <option value="all">All Disciplines</option>
            {DISCIPLINES.map(disc => (
              <option key={disc.value} value={disc.value}>
                {disc.label} ({disc.prefix})
              </option>
            ))}
          </select>

          {/* Upload Button */}
          <label className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition">
            <Upload className="w-5 h-5" />
            Upload Drawing
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.dwg"
              onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
              className="hidden"
            />
          </label>
        </div>

        {/* Drawing List */}
        <div className="flex-1 overflow-y-auto p-4">
          {drawings.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Layers className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p>No drawings found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {drawings.map((drawing) => (
                <div
                  key={drawing.id}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedDrawing?.id === drawing.id
                      ? 'bg-amber-600/20 border border-amber-600/50'
                      : 'bg-slate-700/50 hover:bg-slate-700 border border-transparent'
                  }`}
                  onClick={() => setSelectedDrawing(drawing)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-white text-sm truncate flex-1">
                      {drawing.name}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      drawing.status === 'approved' ? 'bg-green-900/50 text-green-400' :
                      drawing.status === 'review' ? 'bg-yellow-900/50 text-yellow-400' :
                      drawing.status === 'draft' ? 'bg-gray-900/50 text-gray-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      {drawing.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {drawing.sheet_number} | Rev {drawing.revision} | 
                    {DISCIPLINES.find(d => d.value === drawing.discipline)?.prefix}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(drawing.upload_date).toLocaleDateString()}
                  </p>
                  {drawing.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {drawing.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-600/50 rounded text-xs text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1">
        {renderViewer()}
      </div>

      {/* Upload Form Modal */}
      {uploadForm.file && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Upload Drawing</h2>
            
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">File</label>
                <p className="text-white bg-slate-800/50 rounded-lg px-4 py-2">
                  {uploadForm.file.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Sheet Number</label>
                  <input
                    type="text"
                    value={uploadForm.sheet_number}
                    onChange={(e) => setUploadForm({...uploadForm, sheet_number: e.target.value})}
                    placeholder="E-101"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Revision</label>
                  <input
                    type="text"
                    value={uploadForm.revision}
                    onChange={(e) => setUploadForm({...uploadForm, revision: e.target.value})}
                    placeholder="A"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Discipline</label>
                <select
                  value={uploadForm.discipline}
                  onChange={(e) => setUploadForm({...uploadForm, discipline: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                >
                  {DISCIPLINES.map(disc => (
                    <option key={disc.value} value={disc.value}>
                      {disc.label} ({disc.prefix})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Tags</label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                  placeholder="Comma separated tags"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetUploadForm();
                  }}
                  className="px-4 py-2 text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};