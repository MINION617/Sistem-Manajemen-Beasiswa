import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import client from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Upload, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data } = await client.get('/student/profile');
      setDocuments(data.documents);
      setApplications(data.applications);
    } catch (err) {
      setError('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit');
      return;
    }

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      await client.post('/student/documents', {
        file_name: file.name,
        file_url: publicUrl,
        type: type
      });

      fetchProfileData();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}

      {/* Profile Info */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">User Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 uppercase">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase">Role</p>
            <p className="font-medium">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['KTM', 'TRANSKRIP', 'SERTIFIKAT'].map((type) => {
            const doc = documents.find(d => d.type === type);
            return (
              <div key={type} className="border rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                <p className="font-bold mb-2">{type}</p>
                {doc ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="text-green-500 w-8 h-8 mb-2" />
                    <p className="text-xs text-gray-600 truncate max-w-[150px]">{doc.file_name}</p>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline mt-2">View File</a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FileText className="text-gray-400 w-8 h-8 mb-2" />
                    <label className={`cursor-pointer bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {uploading ? 'Uploading...' : 'Upload PDF'}
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf" 
                        onChange={(e) => handleFileUpload(e, type)}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Applications History */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Application History</h2>
        {applications.length === 0 ? (
          <p className="text-gray-500">You haven't applied for any scholarships yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-semibold">{app.scholarship?.name}</p>
                  <p className="text-xs text-gray-500">Applied on {new Date(app.applied_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  app.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800' :
                  app.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
