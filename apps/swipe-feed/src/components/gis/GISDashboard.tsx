/**
 * GIS Dashboard Component
 * 
 * Main dashboard for GIS functionality:
 * - 3D visualization of project infrastructure
 * - File import/export
 * - Layer management
 * - Spatial queries
 * - Project coordinate system configuration
 */

import React, { useState, useEffect } from 'react';
import { FileUp, FileDown, Map, Layers, Settings, Search, MapPin, Video, Users } from 'lucide-react';
import GIS3DViewer from './GIS3DViewer';
import { useAuthContext } from '../../lib/auth-context';
import toast from 'react-hot-toast';
import Ably from 'ably';

interface GISDashboardProps {
  projectId: string;
}

// Ably client for cursor sync
let ablyClient: Ably.Realtime | null = null;

function getAblyClient() {
  if (!ablyClient && import.meta.env.VITE_ABLY_API_KEY) {
    ablyClient = new Ably.Realtime(import.meta.env.VITE_ABLY_API_KEY);
  }
  return ablyClient;
}

export function GISDashboard({ projectId }: GISDashboardProps) {
  const { user } = useAuthContext();
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  const [transmissionLines, setTransmissionLines] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [siteBoundaries, setSiteBoundaries] = useState<any[]>([]);
  const [importedLayers, setImportedLayers] = useState<any[]>([]);
  const [coordinateSystem, setCoordinateSystem] = useState<any>(null);
  const [reviewRooms, setReviewRooms] = useState<any[]>([]);
  
  const [selectedStructure, setSelectedStructure] = useState<any>(null);
  const [selectedLine, setSelectedLine] = useState<any>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCRSModal, setShowCRSModal] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [show3D, setShow3D] = useState(true);

  // Team cursor positions (synced via Ably)
  const [teamCursors, setTeamCursors] = useState<Map<string, { x: number; y: number; z: number; userName: string }>>(new Map());

  // Fetch GIS data
  useEffect(() => {
    loadGISData();
    loadReviewRooms();
  }, [projectId]);

  // Setup Ably cursor sync
  useEffect(() => {
    const ably = getAblyClient();
    if (!ably) return;

    const channel = ably.channels.get(`gis:${projectId}:cursors`);

    // Subscribe to team cursor movements
    channel.subscribe('cursor-move', (message) => {
      const { userId, position, userName } = message.data;
      if (userId !== user?.id) {
        setTeamCursors(prev => new Map(prev).set(userId, { ...position, userName }));
      }
    });

    // Publish own cursor position (will be sent from 3D viewer)
    const publishCursor = (position: { x: number; y: number; z: number }) => {
      channel.publish('cursor-move', {
        userId: user?.id,
        userName: user?.email?.split('@')[0] || 'User',
        position
      });
    };

    // Cleanup
    return () => {
      channel.unsubscribe();
      channel.detach();
    };
  }, [projectId, user]);

  const loadGISData = async () => {
    setLoading(true);
    try {
      const headers = {
        'Authorization': `Bearer ${user?.session?.access_token}`
      };

      // Fetch all GIS data in parallel
      const [linesRes, structuresRes, sitesRes, layersRes, crsRes] = await Promise.all([
        fetch(`${apiUrl}/api/gis/projects/${projectId}/transmission-lines`, { headers }),
        fetch(`${apiUrl}/api/gis/projects/${projectId}/structures`, { headers }),
        fetch(`${apiUrl}/api/gis/projects/${projectId}/site-boundaries`, { headers }),
        fetch(`${apiUrl}/api/gis/projects/${projectId}/imported-layers`, { headers }),
        fetch(`${apiUrl}/api/gis/projects/${projectId}/coordinate-system`, { headers })
      ]);

      if (linesRes.ok) setTransmissionLines(await linesRes.json());
      if (structuresRes.ok) setStructures(await structuresRes.json());
      if (sitesRes.ok) setSiteBoundaries(await sitesRes.json());
      if (layersRes.ok) setImportedLayers(await layersRes.json());
      if (crsRes.ok) {
        const crs = await crsRes.json();
        if (crs.configured) setCoordinateSystem(crs);
      }
    } catch (error) {
      console.error('Error loading GIS data:', error);
      toast.error('Failed to load GIS data');
    } finally {
      setLoading(false);
    }
  };

  const loadReviewRooms = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/gis/projects/${projectId}/review-rooms`, {
        headers: {
          'Authorization': `Bearer ${user?.session?.access_token}`
        }
      });

      if (response.ok) {
        setReviewRooms(await response.json());
      }
    } catch (error) {
      console.error('Error loading review rooms:', error);
    }
  };

  // Create GIS review room (Daily.co)
  const handleCreateReviewRoom = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/gis/projects/${projectId}/create-review-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.session?.access_token}`
        },
        body: JSON.stringify({
          roomName: 'GIS Review Session',
          enableCursorSync: true
        })
      });

      if (!response.ok) throw new Error('Failed to create review room');

      const result = await response.json();
      toast.success('Review room created! Opening video...');
      
      // Open Daily.co room in new tab
      window.open(result.room.roomUrl, '_blank');
      
      loadReviewRooms(); // Refresh list
      setShowCollaborationPanel(true);
    } catch (error: any) {
      console.error('Error creating review room:', error);
      toast.error(`Failed to create review room: ${error.message}`);
    }
  };

  // Import file
  const handleFileImport = async (file: File, options: any) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(options).forEach(key => {
      if (options[key]) formData.append(key, options[key]);
    });

    try {
      const response = await fetch(`${apiUrl}/api/gis/projects/${projectId}/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.session?.access_token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Import failed');
      
      const result = await response.json();
      toast.success(`Imported ${result.featureCount} features from ${result.sourceFormat}`);
      
      setShowImportModal(false);
      loadGISData(); // Reload data
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(`Import failed: ${error.message}`);
    }
  };

  // Export layers
  const handleExport = async (layerIds: string[], format: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/gis/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.session?.access_token}`
        },
        body: JSON.stringify({ layerIds, format })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${Date.now()}.${format === 'shapefile' ? 'zip' : format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Export successful');
      setShowExportModal(false);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message}`);
    }
  };

  // Find nearest structure
  const handleFindNearest = async (lon: number, lat: number) => {
    try {
      const response = await fetch(`${apiUrl}/api/gis/projects/${projectId}/find-nearest-structure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.session?.access_token}`
        },
        body: JSON.stringify({ longitude: lon, latitude: lat, maxDistanceFeet: 5280 })
      });

      if (!response.ok) throw new Error('Search failed');
      
      const result = await response.json();
      
      if (result.found) {
        toast.success(`Nearest: ${result.structureNumber} (${result.distanceFeet.toFixed(0)} ft away)`);
        // Highlight structure in 3D view
        const structure = structures.find(s => s.structureNumber === result.structureNumber);
        if (structure) setSelectedStructure(structure);
      } else {
        toast.error('No structures found within 1 mile');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(`Search failed: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Top toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Map className="w-6 h-6 text-blue-400" />
          GIS Infrastructure
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateReviewRoom}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
            title="Start video room with team - cursor positions sync in 3D (invite-only)"
          >
            <Video className="w-4 h-4" />
            Review with Team
          </button>

          {reviewRooms.length > 0 && (
            <button
              onClick={() => setShowCollaborationPanel(!showCollaborationPanel)}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2"
              title="Show active review rooms"
            >
              <Users className="w-4 h-4" />
              {reviewRooms.length} Active
            </button>
          )}

          <button
            onClick={() => setShow3D(!show3D)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            {show3D ? <Layers /> : <Map />}
            {show3D ? '3D View' : 'Map View'}
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <FileUp className="w-4 h-4" />
            Import
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
            disabled={importedLayers.length === 0}
          >
            <FileDown className="w-4 h-4" />
            Export
          </button>

          <button
            onClick={() => setShowCRSModal(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            CRS
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          {/* Stats */}
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-3">Project Data</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Transmission Lines:</span>
                <span className="font-bold text-yellow-400">{transmissionLines.length}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Structures:</span>
                <span className="font-bold text-blue-400">{structures.length}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Site Boundaries:</span>
                <span className="font-bold text-green-400">{siteBoundaries.length}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Imported Layers:</span>
                <span className="font-bold text-purple-400">{importedLayers.length}</span>
              </div>
            </div>
          </div>

          {/* Coordinate System */}
          {coordinateSystem && (
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold text-white mb-2">Coordinate System</h3>
              <div className="text-sm text-gray-300">
                <div><strong>Name:</strong> {coordinateSystem.workingCrsName}</div>
                <div><strong>EPSG:</strong> {coordinateSystem.workingCrsEpsg}</div>
                <div><strong>Units:</strong> {coordinateSystem.displayUnits}</div>
              </div>
            </div>
          )}

          {/* Selected feature info */}
          {(selectedStructure || selectedLine) && (
            <div className="p-4 border-b border-gray-700 bg-gray-750">
              <h3 className="font-semibold text-white mb-2">Selected</h3>
              
              {selectedStructure && (
                <div className="text-sm text-gray-300 space-y-1">
                  <div><strong>Structure:</strong> {selectedStructure.structureNumber}</div>
                  <div><strong>Type:</strong> {selectedStructure.structureType}</div>
                  <div><strong>Height:</strong> {selectedStructure.heightFeet} ft</div>
                  <div><strong>Status:</strong> {selectedStructure.status}</div>
                  <button
                    onClick={() => setSelectedStructure(null)}
                    className="mt-2 text-blue-400 hover:underline"
                  >
                    Clear selection
                  </button>
                </div>
              )}

              {selectedLine && (
                <div className="text-sm text-gray-300 space-y-1">
                  <div><strong>Line:</strong> {selectedLine.lineName}</div>
                  <div><strong>Voltage:</strong> {selectedLine.voltageKv} kV</div>
                  <div><strong>Length:</strong> {selectedLine.lineLengthMiles?.toFixed(2)} mi</div>
                  <div><strong>Conductor:</strong> {selectedLine.conductorType}</div>
                  <button
                    onClick={() => setSelectedLine(null)}
                    className="mt-2 text-blue-400 hover:underline"
                  >
                    Clear selection
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Transmission Lines List */}
          {transmissionLines.length > 0 && (
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold text-white mb-2">Transmission Lines</h3>
              <div className="space-y-2">
                {transmissionLines.map(line => (
                  <button
                    key={line.id}
                    onClick={() => setSelectedLine(line)}
                    className={`w-full text-left p-2 rounded text-sm ${
                      selectedLine?.id === line.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-semibold">{line.lineName}</div>
                    <div className="text-xs">{line.voltageKv} kV • {line.lineLengthMiles?.toFixed(2)} mi</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Review Rooms (Collaboration) */}
          {showCollaborationPanel && reviewRooms.length > 0 && (
            <div className="p-4 border-b border-gray-700 bg-orange-900 bg-opacity-30">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Video className="w-4 h-4" />
                Active Review Rooms (Invite-Only)
              </h3>
              <div className="space-y-2">
                {reviewRooms.map(room => (
                  <div key={room.id} className="bg-gray-700 p-2 rounded text-sm">
                    <div className="font-semibold text-white">{room.roomName}</div>
                    <div className="text-xs text-gray-400">
                      {room.enableCursorSync && '🎯 Cursor Sync ON'}
                    </div>
                    <button
                      onClick={() => window.open(room.roomUrl, '_blank')}
                      className="mt-1 text-xs text-orange-400 hover:underline"
                    >
                      Join Room →
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                💡 Team members see each other's cursors in 3D view
              </div>
            </div>
          )}

          {/* Team Cursors (if any) */}
          {teamCursors.size > 0 && (
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Viewing ({teamCursors.size})
              </h3>
              <div className="space-y-1 text-sm text-gray-300">
                {Array.from(teamCursors.entries()).map(([userId, cursor]) => (
                  <div key={userId} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{cursor.userName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3D Viewer */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="flex items-center justify-center h-full bg-gray-900 text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <div>Loading GIS data...</div>
              </div>
            </div>
          ) : show3D && (transmissionLines.length > 0 || structures.length > 0) ? (
            <GIS3DViewer
              projectId={projectId}
              transmissionLines={transmissionLines}
              structures={structures}
              siteBoundaries={siteBoundaries}
              onStructureClick={setSelectedStructure}
              onLineClick={setSelectedLine}
              showLabels={true}
              showSky={true}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
              <div className="text-center">
                <Map className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h2 className="text-xl font-semibold mb-2">No GIS Data Yet</h2>
                <p className="mb-4">Import CAD files or create transmission lines to get started</p>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center gap-2"
                >
                  <FileUp className="w-5 h-5" />
                  Import Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleFileImport}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          layers={importedLayers}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
        />
      )}
    </div>
  );
}

// Import Modal Component
function ImportModal({ onClose, onImport }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [layerName, setLayerName] = useState('');
  const [latColumn, setLatColumn] = useState('latitude');
  const [lonColumn, setLonColumn] = useState('longitude');

  const handleSubmit = () => {
    if (!file) return;
    onImport(file, { layerName: layerName || file.name, latColumn, lonColumn });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Import GIS File</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              File (DXF, Shapefile, KML, CSV, GeoJSON)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-gray-300 bg-gray-700 rounded p-2"
              accept=".dxf,.dwg,.shp,.kml,.kmz,.csv,.geojson,.json,.gpkg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Layer Name (optional)
            </label>
            <input
              type="text"
              value={layerName}
              onChange={(e) => setLayerName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              placeholder="Auto-detected from file"
            />
          </div>

          {file?.name.toLowerCase().endsWith('.csv') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Latitude Column
                </label>
                <input
                  type="text"
                  value={latColumn}
                  onChange={(e) => setLatColumn(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Longitude Column
                </label>
                <input
                  type="text"
                  value={lonColumn}
                  onChange={(e) => setLonColumn(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}

// Export Modal Component
function ExportModal({ layers, onClose, onExport }: any) {
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [format, setFormat] = useState('shapefile');

  const handleExport = () => {
    if (selectedLayers.length === 0) return;
    onExport(selectedLayers, format);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Export Layers</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Layers
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {layers.map((layer: any) => (
                <label key={layer.id} className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLayers.includes(layer.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLayers([...selectedLayers, layer.id]);
                      } else {
                        setSelectedLayers(selectedLayers.filter(id => id !== layer.id));
                      }
                    }}
                    className="rounded"
                  />
                  <span>{layer.layerName} ({layer.layerType})</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Export Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            >
              <option value="shapefile">Shapefile (.zip)</option>
              <option value="dxf">DXF (CAD)</option>
              <option value="kml">KML (Google Earth)</option>
              <option value="geopackage">GeoPackage (.gpkg)</option>
              <option value="geojson">GeoJSON (.json)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={selectedLayers.length === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

export default GISDashboard;

