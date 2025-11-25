import { useEffect, useState } from 'react';
import { qotdAPI } from '../../services/api';
import { Plus, Edit, Trash2, X, Save, Calendar, Trophy } from 'lucide-react';

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer_a: '',
    answer_b: '',
    answer_c: '',
    answer_d: '',
    correct_answer: 'A',
    category: '',
    explanation: '',
    display_date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await qotdAPI.getAll();
      setQuestions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        question: question.question,
        answer_a: question.answer_a,
        answer_b: question.answer_b,
        answer_c: question.answer_c,
        answer_d: question.answer_d,
        correct_answer: question.correct_answer,
        category: question.category || '',
        explanation: question.explanation || '',
        display_date: question.display_date?.split('T')[0] || new Date().toISOString().split('T')[0]
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        question: '',
        answer_a: '',
        answer_b: '',
        answer_c: '',
        answer_d: '',
        correct_answer: 'A',
        category: '',
        explanation: '',
        display_date: new Date().toISOString().split('T')[0]
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      if (editingQuestion) {
        await qotdAPI.update(editingQuestion.id, formData);
        setMessage({ type: 'success', text: 'Question updated successfully!' });
      } else {
        await qotdAPI.create(formData);
        setMessage({ type: 'success', text: 'Question created successfully!' });
      }
      await loadQuestions();
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (error) {
      console.error('Error saving question:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to save question. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await qotdAPI.delete(id);
      setMessage({ type: 'success', text: 'Question deleted successfully!' });
      await loadQuestions();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting question:', error);
      setMessage({ type: 'error', text: 'Failed to delete question.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-800 rounded mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Trophy className="text-brit-gold" size={40} />
            <h1 className="text-4xl font-black text-white uppercase">Daily Quiz Questions</h1>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Question
          </button>
        </div>

        {/* Messages */}
        {message && !showModal && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-500/20 border-2 border-green-500 text-green-500' : 'bg-red-500/20 border-2 border-red-500 text-red-500'
          }`}>
            {message.text}
          </div>
        )}

        {/* Questions List */}
        {questions.length === 0 ? (
          <div className="service-card text-center py-16">
            <Trophy className="text-brit-gold mx-auto mb-4" size={64} />
            <h3 className="text-2xl font-black mb-2 text-white">No Questions Yet</h3>
            <p className="text-gray-400 mb-6">Start adding daily quiz questions for your users!</p>
            <button onClick={() => handleOpenModal()} className="btn btn-primary">
              Add First Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className="service-card">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="text-brit-gold" size={20} />
                      <span className="text-gray-400 text-sm">
                        {new Date(question.display_date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      {question.category && (
                        <span className="px-3 py-1 bg-brit-red/20 text-brit-red rounded-full text-xs font-bold uppercase">
                          {question.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">{question.question}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-400">A. {question.answer_a}</div>
                      <div className="text-gray-400">B. {question.answer_b}</div>
                      <div className="text-gray-400">C. {question.answer_c}</div>
                      <div className="text-gray-400">D. {question.answer_d}</div>
                    </div>
                    <div className="mt-3 text-sm">
                      <span className="text-gray-400">Correct Answer: </span>
                      <span className="text-brit-gold font-bold">{question.correct_answer}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(question)}
                      className="p-2 bg-brit-blue hover:bg-brit-blue/80 text-white rounded transition"
                      title="Edit"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="p-2 bg-brit-red hover:bg-brit-red/80 text-white rounded transition"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl border-2 border-brit-gold/30 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-black text-white uppercase">
                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-white transition"
                  >
                    <X size={28} />
                  </button>
                </div>

                {message && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' ? 'bg-green-500/20 border-2 border-green-500 text-green-500' : 'bg-red-500/20 border-2 border-red-500 text-red-500'
                  }`}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Display Date */}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">
                      Display Date <span className="text-brit-red">*</span>
                    </label>
                    <input
                      type="date"
                      name="display_date"
                      value={formData.display_date}
                      onChange={handleChange}
                      className="input w-full bg-gray-800 border-gray-700 text-gray-200"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="e.g., General Knowledge, Sports, History"
                      className="input w-full bg-gray-800 border-gray-700 text-gray-200"
                    />
                  </div>

                  {/* Question */}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">
                      Question <span className="text-brit-red">*</span>
                    </label>
                    <textarea
                      name="question"
                      value={formData.question}
                      onChange={handleChange}
                      rows={3}
                      className="input w-full bg-gray-800 border-gray-700 text-gray-200"
                      required
                    />
                  </div>

                  {/* Answers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-300">
                        Answer A <span className="text-brit-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="answer_a"
                        value={formData.answer_a}
                        onChange={handleChange}
                        className="input w-full bg-gray-800 border-gray-700 text-gray-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-300">
                        Answer B <span className="text-brit-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="answer_b"
                        value={formData.answer_b}
                        onChange={handleChange}
                        className="input w-full bg-gray-800 border-gray-700 text-gray-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-300">
                        Answer C <span className="text-brit-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="answer_c"
                        value={formData.answer_c}
                        onChange={handleChange}
                        className="input w-full bg-gray-800 border-gray-700 text-gray-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-300">
                        Answer D <span className="text-brit-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="answer_d"
                        value={formData.answer_d}
                        onChange={handleChange}
                        className="input w-full bg-gray-800 border-gray-700 text-gray-200"
                        required
                      />
                    </div>
                  </div>

                  {/* Correct Answer */}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">
                      Correct Answer <span className="text-brit-red">*</span>
                    </label>
                    <select
                      name="correct_answer"
                      value={formData.correct_answer}
                      onChange={handleChange}
                      className="input w-full bg-gray-800 border-gray-700 text-gray-200"
                      required
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">
                      Explanation (Optional)
                    </label>
                    <textarea
                      name="explanation"
                      value={formData.explanation}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Provide an explanation for the correct answer"
                      className="input w-full bg-gray-800 border-gray-700 text-gray-200"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="btn btn-outline"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary flex items-center gap-2"
                      disabled={submitting}
                    >
                      <Save size={20} />
                      {submitting ? 'Saving...' : 'Save Question'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuestions;
