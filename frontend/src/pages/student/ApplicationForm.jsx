import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

const ApplicationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [scholarshipRes, profileRes] = await Promise.all([
        client.get(`/student/scholarships/open`), // We filter locally or add a detail route
        client.get('/student/profile')
      ]);
      
      const found = scholarshipRes.data.find(s => s.id === id);
      if (!found) {
        setError('Scholarship not found or closed');
      } else {
        setScholarship(found);
      }
      setDocuments(profileRes.data.documents);
    } catch (err) {
      setError('Failed to fetch application data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if mandatory documents are present
    const hasKTM = documents.some(d => d.type === 'KTM');
    const hasTranskrip = documents.some(d => d.type === 'TRANSKRIP');

    if (!hasKTM || !hasTranskrip) {
      alert('Please upload KTM and Transkrip in your profile before applying');
      navigate('/profile');
      return;
    }

    try {
      setSubmitting(true);
      await client.post('/student/apply', { scholarship_id: id });
      alert('Application submitted successfully!');
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading application form...</div>;
  if (!scholarship) return <div className="p-8 text-red-600">{error || 'Scholarship not found'}</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Application Form</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-blue-600 mb-2">{scholarship.name}</h2>
        <p className="text-gray-600 mb-4">{scholarship.description}</p>
        <div className="flex justify-between text-sm border-t pt-4">
          <p><span className="font-bold">Sponsor:</span> {scholarship.sponsor?.name}</p>
          <p><span className="font-bold">Amount:</span> Rp {parseFloat(scholarship.amount).toLocaleString()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-bold mb-4">Confirmation</h3>
        <p className="text-gray-600 mb-6">
          By clicking the button below, you confirm that your profile information is correct and you wish to apply for this scholarship using your uploaded documents.
        </p>
        
        <div className="mb-6">
          <p className="text-sm font-bold mb-2">Required Documents Check:</p>
          <ul className="text-sm space-y-2">
            <li className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${documents.some(d => d.type === 'KTM') ? 'bg-green-500' : 'bg-red-500'}`}></span>
              Kartu Tanda Mahasiswa (KTM)
            </li>
            <li className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${documents.some(d => d.type === 'TRANSKRIP') ? 'bg-green-500' : 'bg-red-500'}`}></span>
              Transkrip Nilai
            </li>
          </ul>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded text-sm">{error}</div>}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Confirm Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
