import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { fetchMaterials, uploadMaterial, deleteMaterial } from '../../services/materialService';
import { Search, Upload, FileText, Download, Trash2, File } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/common/ConfirmModal';

const TYPE_ICONS = { pdf: '📄', video: '🎬', image: '🖼️', doc: '📝', ppt: '📊', other: '📁' };

const Materials = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', isPublic: true });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, materialId: null });
  const fileRef = useRef();

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  const getMaterialsList = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter !== 'all') params.type = typeFilter;
      const data = await fetchMaterials(params);
      setMaterials(data || []);
    } catch { 
      toast.error('Failed to load materials'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { getMaterialsList(); }, [search, typeFilter]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', uploadForm.title || file.name);
      formData.append('description', uploadForm.description);
      formData.append('isPublic', uploadForm.isPublic);
      await uploadMaterial(formData);
      toast.success('Material uploaded!');
      setShowUpload(false);
      setFile(null);
      setUploadForm({ title: '', description: '', isPublic: true });
      getMaterialsList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleConfirmDelete = async () => {
    const id = confirmModal.materialId;
    if (!id) return;
    try {
      await deleteMaterial(id);
      toast.success('Deleted');
      setMaterials(m => m.filter(x => x._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Materials Library</h1>
            <p className="page-subtitle">Browse and download learning resources</p>
          </div>
          {isInstructor && (
            <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
              <Upload size={15} /> Upload Material
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Search size={16} />
            <input placeholder="Search materials..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="tabs" style={{ margin: 0, width: 'auto' }}>
            {['all', 'pdf', 'video', 'doc', 'ppt', 'image', 'other'].map(t => (
              <button key={t} className={`tab ${typeFilter === t ? 'active' : ''}`} style={{ flex: 'none', padding: '6px 14px' }}
                onClick={() => setTypeFilter(t)}>{t.toUpperCase()}</button>
            ))}
          </div>
        </div>

        {loading ? <div className="loading"><FileText size={20} /> Loading materials...</div> :
          materials.length === 0 ? (
            <div className="empty-state">
              <FileText size={50} color="var(--text-faint)" />
              <h3 style={{ marginTop: 16, fontSize: 16, fontWeight: 700 }}>No materials found</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {materials.map(mat => (
                <div key={mat._id} className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, background: 'var(--bg-card2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {TYPE_ICONS[mat.type] || '📁'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4, color: '#1e293b' }}>{mat.title}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span>By {mat.uploadedBy?.name}</span>
                      {mat.course && <span>📚 {mat.course?.title}</span>}
                      {mat.fileSize > 0 && <span>{formatSize(mat.fileSize)}</span>}
                      <span>{new Date(mat.createdAt).toLocaleDateString()}</span>
                    </div>
                    {mat.description && <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>{mat.description}</p>}
                    {mat.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                        {mat.tags.map(t => <span key={t} className="badge badge-primary" style={{ fontSize: 10 }}>{t}</span>)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                      <Download size={13} /> Download
                    </a>
                    {(mat.uploadedBy?._id === user?._id || user?.role === 'admin') && (
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmModal({ isOpen: true, materialId: mat._id })}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        }

        {/* Upload Modal */}
        {showUpload && (
          <div className="modal-overlay" onClick={() => setShowUpload(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Upload Material</h2>
                <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24 }}>×</button>
              </div>
              <form onSubmit={handleUploadSubmit}>
                {/* File Drop Zone */}
                <div onClick={() => fileRef.current.click()} style={{
                  border: `2px dashed ${file ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)', padding: '24px', textAlign: 'center',
                  cursor: 'pointer', marginBottom: 16, background: file ? 'rgba(46,125,50,0.04)' : 'transparent',
                  transition: 'all 0.2s'
                }}>
                  <input type="file" ref={fileRef} style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.webm,.txt" />
                  <File size={30} color={file ? 'var(--primary)' : 'var(--text-faint)'} style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{file ? file.name : 'Click to select file'}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>PDF, DOC, PPT, XLS, Images, Videos (max 50MB)</div>
                </div>
                <div className="form-group"><label>Title (optional)</label><input placeholder="Leave blank to use filename" value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })} /></div>
                <div className="form-group"><label>Description</label><textarea rows={2} placeholder="Brief description..." value={uploadForm.description} onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })} /></div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="isPublic" checked={uploadForm.isPublic} onChange={e => setUploadForm({ ...uploadForm, isPublic: e.target.checked })} style={{ width: 'auto' }} />
                  <label htmlFor="isPublic" style={{ margin: 0, fontWeight: 500 }}>Make publicly accessible to all students</label>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContext: 'flex-end', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowUpload(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {confirmModal.isOpen && (
          <ConfirmModal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ isOpen: false, materialId: null })}
            onConfirm={handleConfirmDelete}
            title="Delete Material"
            message="Are you sure you want to delete this learning material?"
            confirmText="Delete Material"
          />
        )}
      </main>
    </div>
  );
};

export default Materials;
