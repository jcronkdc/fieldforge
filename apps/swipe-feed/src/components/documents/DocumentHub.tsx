import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Download, Share2, Folder, Search, Filter, Grid, List, File, Image, FileSpreadsheet, Eye, Trash2, Plus, Loader2, X, Calendar, User, FolderOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Document {
  id: string;
  name: string;
  type: 'drawing' | 'report' | 'permit' | 'spec' | 'photo' | 'other';
  file_type: string;
  size: number;
  url: string;
  thumbnail_url?: string;
  project_id?: string;
  project_name?: string;
  folder_id?: string;
  uploaded_by: string;
  uploader_name?: string;
  created_at: string;
  updated_at: string;
  version: number;
  tags: string[];
  is_public: boolean;
  download_count: number;
}

interface Folder {
  id: string;
  name: string;
  parent_id?: string;
  document_count: number;
  created_at: string;
}

export const DocumentHub: React.FC = () => {
  const { session } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [newFolder, setNewFolder] = useState({ name: '' });
  const [uploadDetails, setUploadDetails] = useState({
    type: 'drawing',
    tags: '',
    is_public: false
  });

  useEffect(() => {
    fetchDocuments();
    fetchFolders();
  }, [currentFolder, filterType, searchTerm]);

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams();
      if (currentFolder) params.append('folder_id', currentFolder);
      if (filterType !== 'all') params.append('type', filterType);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/documents?${params}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/documents/folders', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders || []);
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', uploadDetails.type);
    formData.append('tags', uploadDetails.tags);
    formData.append('is_public', uploadDetails.is_public.toString());
    if (currentFolder) formData.append('folder_id', currentFolder);
    if (localStorage.getItem('current_project_id')) {
      formData.append('project_id', localStorage.getItem('current_project_id')!);
    }

    try {
      setUploadProgress(10);
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: formData
      });

      setUploadProgress(90);

      if (response.ok) {
        setUploadProgress(100);
        setShowUploadModal(false);
        setUploadDetails({ type: 'drawing', tags: '', is_public: false });
        fetchDocuments();
        alert('Document uploaded successfully!');
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const createFolder = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/documents/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          ...newFolder,
          parent_id: currentFolder
        })
      });

      if (response.ok) {
        setShowCreateFolder(false);
        setNewFolder({ name: '' });
        fetchFolders();
        alert('Folder created successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to create folder: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder');
    }
  };

  const downloadDocument = async (doc: Document) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/download`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download document');
    }
  };

  const shareDocument = async (doc: Document) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (navigator.share) {
          navigator.share({
            title: doc.name,
            text: `Check out this document: ${doc.name}`,
            url: data.shareUrl
          });
        } else {
          navigator.clipboard.writeText(data.shareUrl);
          alert('Share link copied to clipboard!');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('Failed to share document');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (fileType.includes('image')) return <Image className="w-8 h-8 text-green-500" />;
    if (fileType.includes('sheet')) return <FileSpreadsheet className="w-8 h-8 text-blue-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  const documentTypes = ['all', 'drawing', 'report', 'permit', 'spec', 'photo', 'other'];

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Document Hub</h1>
          <p className="text-gray-600 mt-1">Central repository for all project documents</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateFolder(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">New Folder</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 min-h-[44px]"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Size</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
              </p>
            </div>
            <Download className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Folders</p>
              <p className="text-2xl font-bold text-gray-900">{folders.length}</p>
            </div>
            <Folder className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Downloads</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.reduce((sum, doc) => sum + doc.download_count, 0)}
              </p>
            </div>
            <Share2 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 min-h-[44px]"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 min-h-[44px]"
          >
            {documentTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors min-w-[44px] min-h-[44px] ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors min-w-[44px] min-h-[44px] ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      {currentFolder && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={() => setCurrentFolder(null)}
            className="hover:text-blue-600 transition-colors"
          >
            All Documents
          </button>
          <span>/</span>
          <span className="font-medium text-gray-900">
            {folders.find(f => f.id === currentFolder)?.name}
          </span>
        </div>
      )}

      {/* Folders Grid */}
      {!currentFolder && folders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Folders</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {folders.filter(f => !f.parent_id).map(folder => (
              <button
                key={folder.id}
                onClick={() => setCurrentFolder(folder.id)}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-center"
              >
                <Folder className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 truncate">{folder.name}</p>
                <p className="text-xs text-gray-500 mt-1">{folder.document_count} items</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Documents Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {documents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No documents found</p>
              <p className="text-sm text-gray-500 mt-1">Upload your first document to get started</p>
            </div>
          ) : (
            documents.map(doc => (
              <div
                key={doc.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedDocument(doc)}
              >
                <div className="p-4">
                  <div className="flex justify-center mb-3">
                    {doc.thumbnail_url ? (
                      <img src={doc.thumbnail_url} alt={doc.name} className="w-full h-32 object-cover rounded" />
                    ) : (
                      getFileIcon(doc.file_type)
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatFileSize(doc.size)}</p>
                    <p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="flex border-t">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadDocument(doc);
                    }}
                    className="flex-1 p-2 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      shareDocument(doc);
                    }}
                    className="flex-1 p-2 text-gray-600 hover:bg-gray-50 transition-colors border-l"
                  >
                    <Share2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {documents.map(doc => (
                <tr
                  key={doc.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedDocument(doc)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getFileIcon(doc.file_type)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        {doc.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {doc.tags.map(tag => (
                              <span key={tag} className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doc.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatFileSize(doc.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadDocument(doc);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          shareDocument(doc);
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Upload Document</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type
                </label>
                <select
                  value={uploadDetails.type}
                  onChange={(e) => setUploadDetails({...uploadDetails, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 min-h-[44px]"
                >
                  <option value="drawing">Drawing</option>
                  <option value="report">Report</option>
                  <option value="permit">Permit</option>
                  <option value="spec">Specification</option>
                  <option value="photo">Photo</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={uploadDetails.tags}
                  onChange={(e) => setUploadDetails({...uploadDetails, tags: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 min-h-[44px]"
                  placeholder="e.g., electrical, phase-1, approved"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={uploadDetails.is_public}
                  onChange={(e) => setUploadDetails({...uploadDetails, is_public: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="is_public" className="ml-2 text-sm text-gray-700">
                  Make document publicly accessible
                </label>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-3">
                  Click to select file or drag and drop
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.dwg"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Select File
                </button>
              </div>

              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadProgress(0);
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create New Folder</h2>
            <form onSubmit={createFolder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  required
                  value={newFolder.name}
                  onChange={(e) => setNewFolder({ name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 min-h-[44px]"
                  placeholder="e.g., Electrical Drawings"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateFolder(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-[44px]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedDocument.name}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedDocument.uploader_name || 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedDocument.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span>{formatFileSize(selectedDocument.size)}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Preview */}
            <div className="mb-4 bg-gray-100 rounded-lg p-8 text-center">
              {selectedDocument.file_type.includes('image') ? (
                <img
                  src={selectedDocument.url}
                  alt={selectedDocument.name}
                  className="max-w-full mx-auto"
                />
              ) : (
                <div>
                  {getFileIcon(selectedDocument.file_type)}
                  <p className="text-gray-600 mt-4">Preview not available</p>
                </div>
              )}
            </div>

            {/* Document Info */}
            {selectedDocument.tags.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => downloadDocument(selectedDocument)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-[44px] flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => shareDocument(selectedDocument)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 min-h-[44px] flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};





