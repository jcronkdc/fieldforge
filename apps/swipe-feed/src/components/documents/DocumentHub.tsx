import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Upload, Download, Search, Filter, Eye, Trash2, Share2, Folder, Clock, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DocumentCategory {
  id: string;
  name: string;
  icon: string;
}

interface Document {
  id: string;
  project_id: string;
  project_name: string;
  category: string;
  title: string;
  description?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  version: string;
  tags: string[];
  status: string;
  created_at: string;
  uploaded_by_name: string;
  download_count: number;
  last_accessed?: string;
}

export const DocumentHub: React.FC = () => {
  const { session } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const isMobile = window.innerWidth < 768;

  // FETCH CATEGORIES
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/documents/categories', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // FETCH DOCUMENTS
  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams({
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedProject && { project_id: selectedProject }),
        limit: '50'
      });

      const response = await fetch(`/api/documents?${params}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      
      const data = await response.json();
      setDocuments(data.documents);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Failed to load documents');
      setLoading(false);
    }
  };

  // FETCH PROJECTS FOR FILTER
  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects/list', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  // UPLOAD DOCUMENT
  const handleUpload = async (formData: any) => {
    try {
      // Convert file to base64
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]); // Remove data:type;base64, prefix
          };
          reader.onerror = reject;
        });
      };

      const base64Data = await fileToBase64(formData.file);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          project_id: formData.project_id,
          category: formData.category,
          title: formData.title,
          description: formData.description,
          file_name: formData.file.name,
          file_type: formData.file.type,
          file_data: base64Data,
          tags: formData.tags || [],
          version: formData.version || '1.0'
        })
      });

      if (!response.ok) throw new Error('Upload failed');

      toast.success('Document uploaded successfully');
      setShowUploadModal(false);
      await fetchDocuments(); // Refresh list
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    }
  };

  // DOWNLOAD DOCUMENT
  const handleDownload = async (document: Document) => {
    try {
      const response = await fetch(`/api/documents/download/${document.id}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = document.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Document downloaded');
      
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  // VIEW DOCUMENT
  const handleView = async (document: Document) => {
    try {
      const response = await fetch(`/api/documents/view/${document.id}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });

      if (!response.ok) throw new Error('View failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      
    } catch (error) {
      toast.error('Failed to view document');
    }
  };

  // DELETE DOCUMENT
  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });

      if (!response.ok) throw new Error('Delete failed');

      toast.success('Document deleted');
      await fetchDocuments();
      
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  // SHARE DOCUMENT
  const handleShare = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ expires_in_hours: 24 })
      });

      if (!response.ok) throw new Error('Share failed');

      const data = await response.json();
      const shareUrl = `${window.location.origin}${data.share_url}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard');
      
    } catch (error) {
      toast.error('Failed to share document');
    }
  };

  useEffect(() => {
    if (session) {
      fetchCategories();
      fetchProjects();
      fetchDocuments();
    }
  }, [session, selectedCategory, searchTerm, selectedProject]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel')) return '📊';
    if (fileType.includes('dwg') || fileType.includes('autocad')) return '📐';
    if (fileType.includes('zip')) return '📦';
    return '📎';
  };

  return (
    <div className={isMobile ? 'p-4' : 'p-6'}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Document Hub</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-amber-500 text-black rounded-lg flex items-center gap-2 min-h-[44px]"
        >
          <Upload className="w-4 h-4" />
          {!isMobile && 'Upload'}
        </button>
      </div>

      {/* Filters */}
      <div className={isMobile ? 'space-y-4 mb-6' : 'flex gap-4 mb-6'}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 min-h-[44px]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white min-h-[44px]"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white min-h-[44px]"
        >
          <option value="">All Projects</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>

      {/* Documents Grid */}
      <div className={isMobile ? 'space-y-4' : 'grid grid-cols-2 lg:grid-cols-3 gap-4'}>
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-400">
            Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-400">
            No documents found
          </div>
        ) : (
          documents.map(doc => (
            <div
              key={doc.id}
              className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-amber-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getFileIcon(doc.file_type)}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm line-clamp-1">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-400">
                      v{doc.version} • {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                  {doc.category}
                </span>
              </div>

              {doc.description && (
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                  {doc.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{doc.project_name}</span>
                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
              </div>

              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {doc.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-gray-700 rounded">
                      <Tag className="w-3 h-3 inline mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>By {doc.uploaded_by_name}</span>
                <span>{doc.download_count} downloads</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleView(doc)}
                  className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm flex items-center justify-center gap-1 min-h-[36px]"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="flex-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 rounded text-white text-sm flex items-center justify-center gap-1 min-h-[36px]"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => handleShare(doc.id)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white min-h-[36px]"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white min-h-[36px]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Upload Document</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpload({
                file: (e.currentTarget.querySelector('#file') as HTMLInputElement).files?.[0],
                project_id: formData.get('project_id'),
                category: formData.get('category'),
                title: formData.get('title'),
                description: formData.get('description'),
                tags: formData.get('tags')?.toString().split(',').map(t => t.trim()),
                version: formData.get('version')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">File</label>
                  <input
                    id="file"
                    type="file"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Project</label>
                  <select
                    name="project_id"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">Select project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <select
                    name="category"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input
                    name="title"
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tags (comma separated)</label>
                  <input
                    name="tags"
                    type="text"
                    placeholder="structural, revision, approved"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Version</label>
                  <input
                    name="version"
                    type="text"
                    defaultValue="1.0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
