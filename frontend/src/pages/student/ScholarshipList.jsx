import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ScholarshipList = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const { data } = await client.get('/student/scholarships/open');
      setScholarships(data);
    } catch (err) {
      setError('Failed to fetch scholarships');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (id) => {
    if (role !== 'MAHASISWA') {
      alert('Only students can apply for scholarships');
      return;
    }
    navigate(`/apply/${id}`);
  };

  if (loading) return <div className="p-8">Loading scholarships...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Available Scholarships</h1>
      
      {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scholarships.map((s) => (
          <div key={s.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                  {s.sponsor?.name}
                </span>
                <span className="text-gray-500 text-xs">
                  Deadline: {new Date(s.deadline).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-2">{s.name}</h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{s.description}</p>
              <p className="text-lg font-bold text-blue-600">
                Rp {parseFloat(s.amount).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 p-4 border-t">
              <button
                onClick={() => handleApply(s.id)}
                className="w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {scholarships.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No open scholarships available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default ScholarshipList;
