import React, { useState, useEffect } from 'react';
import client from '../../api/client';

const ScholarshipManagement = () => {
  const [scholarships, setScholarships] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentScholarship, setCurrentScholarship] = useState({
    sponsor_id: '',
    name: '',
    description: '',
    amount: '',
    deadline: '',
    status: 'OPEN'
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [scholarshipRes, sponsorRes] = await Promise.all([
        client.get('/admin/scholarships'),
        client.get('/admin/sponsors')
      ]);
      setScholarships(scholarshipRes.data);
      setSponsors(sponsorRes.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await client.put(`/admin/scholarships/${currentScholarship.id}`, currentScholarship);
      } else {
        await client.post('/admin/scholarships', currentScholarship);
      }
      setIsModalOpen(false);
      setCurrentScholarship({
        sponsor_id: '',
        name: '',
        description: '',
        amount: '',
        deadline: '',
        status: 'OPEN'
      });
      setIsEditing(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save scholarship');
    }
  };

  const handleEdit = (scholarship) => {
    // Format date for input[type="date"]
    const formattedDeadline = scholarship.deadline ? new Date(scholarship.deadline).toISOString().split('T')[0] : '';
    setCurrentScholarship({ ...scholarship, deadline: formattedDeadline });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this scholarship?')) {
      try {
        await client.delete(`/admin/scholarships/${id}`);
        fetchData();
      } catch (err) {
        setError('Failed to delete scholarship');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Scholarship Management</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setCurrentScholarship({
              sponsor_id: sponsors[0]?.id || '',
              name: '',
              description: '',
              amount: '',
              deadline: '',
              status: 'OPEN'
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Scholarship
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Sponsor
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Deadline
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {scholarships.map((s) => (
              <tr key={s.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap font-semibold">{s.name}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{s.sponsor?.name}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">Rp {parseFloat(s.amount).toLocaleString()}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{new Date(s.deadline).toLocaleDateString()}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${s.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Scholarship' : 'Add New Scholarship'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Sponsor</label>
                <select
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={currentScholarship.sponsor_id}
                  onChange={(e) => setCurrentScholarship({ ...currentScholarship, sponsor_id: e.target.value })}
                  required
                >
                  <option value="">Select Sponsor</option>
                  {sponsors.map(sp => (
                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={currentScholarship.name}
                  onChange={(e) => setCurrentScholarship({ ...currentScholarship, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Amount (IDR)</label>
                <input
                  type="number"
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={currentScholarship.amount}
                  onChange={(e) => setCurrentScholarship({ ...currentScholarship, amount: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Deadline</label>
                <input
                  type="date"
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={currentScholarship.deadline}
                  onChange={(e) => setCurrentScholarship({ ...currentScholarship, deadline: e.target.value })}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                <select
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={currentScholarship.status}
                  onChange={(e) => setCurrentScholarship({ ...currentScholarship, status: e.target.value })}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="mr-4 text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarshipManagement;
