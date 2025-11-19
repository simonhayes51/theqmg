import { useEffect, useState } from 'react';
import { contactAPI } from '../../services/api';
import { Trash2, Mail, Phone, Calendar, Eye, X } from 'lucide-react';

const AdminContact = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [message, setMessage] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await contactAPI.getAll();
      setSubmissions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      showMessage('Failed to load contact submissions. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const openViewModal = (submission) => {
    setSelectedSubmission(submission);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubmission(null);
  };

  const handleDelete = async (submission) => {
    if (!window.confirm(`Are you sure you want to delete the submission from "${submission.name}"?\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      await contactAPI.delete(submission.id);
      showMessage('✅ Submission deleted successfully!', 'success');
      loadSubmissions();
      if (selectedSubmission?.id === submission.id) {
        closeModal();
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      showMessage('❌ Failed to delete submission. Please try again.', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter(submission => {
    if (filterStatus === 'all') return true;
    // You can implement read/unread filtering here if needed
    return true;
  });

  if (loading) {
    return (
      <div className="container-custom py-12">
        <h1 className="text-4xl font-heading text-quiz-blue mb-8">Contact Submissions</h1>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-heading text-quiz-blue">Contact Submissions</h1>
        <div className="text-sm text-gray-600">
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`mb-6 p-4 rounded border-2 ${
          message.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded p-4 mb-6">
        <p className="text-blue-800">
          <strong>💡 Tip:</strong> View and manage contact form submissions from your website. Click "View" to see the full message and contact details.
        </p>
      </div>

      {/* Submissions Table */}
      {filteredSubmissions.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📧</div>
          <h3 className="text-2xl font-heading mb-2 text-quiz-blue">No Submissions Yet</h3>
          <p className="text-gray-600">Contact form submissions will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded border-2 border-quiz-blue overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-quiz-blue text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">Message</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission, index) => (
                  <tr key={submission.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-quiz-blue">{submission.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center text-gray-700">
                          <Mail size={14} className="mr-1" />
                          <a href={`mailto:${submission.email}`} className="hover:text-quiz-blue truncate max-w-[200px]">
                            {submission.email}
                          </a>
                        </div>
                        {submission.phone && (
                          <div className="flex items-center text-gray-700">
                            <Phone size={14} className="mr-1" />
                            <a href={`tel:${submission.phone}`} className="hover:text-quiz-blue">
                              {submission.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-700">{submission.subject}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 line-clamp-2 max-w-md">
                        {submission.message}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(submission.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openViewModal(submission)}
                          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center text-sm"
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(submission)}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center text-sm"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">Total: {submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-heading text-quiz-blue">Contact Submission</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Contact Information */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-heading mb-4 text-quiz-blue">Contact Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Name</label>
                    <p className="text-gray-800">{selectedSubmission.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">Email</label>
                    <p className="text-gray-800">
                      <a href={`mailto:${selectedSubmission.email}`} className="text-quiz-blue hover:underline">
                        {selectedSubmission.email}
                      </a>
                    </p>
                  </div>

                  {selectedSubmission.phone && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Phone</label>
                      <p className="text-gray-800">
                        <a href={`tel:${selectedSubmission.phone}`} className="text-quiz-blue hover:underline">
                          {selectedSubmission.phone}
                        </a>
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-gray-600">Submitted</label>
                    <p className="text-gray-800">{formatDate(selectedSubmission.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-600">Subject</label>
                <p className="text-gray-800 mt-1">{selectedSubmission.subject}</p>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-600">Message</label>
                <div className="mt-2 p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <a
                  href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`}
                  className="btn btn-primary flex items-center flex-1"
                >
                  <Mail size={20} className="mr-2" />
                  Reply via Email
                </a>
                <button
                  onClick={() => handleDelete(selectedSubmission)}
                  className="btn bg-red-500 hover:bg-red-600 text-white flex items-center"
                >
                  <Trash2 size={20} className="mr-2" />
                  Delete
                </button>
                <button
                  onClick={closeModal}
                  className="btn btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContact;
