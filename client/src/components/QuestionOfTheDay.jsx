import { useState, useEffect } from 'react';
import { qotdAPI } from '../services/api';
import { Trophy, Check, X, Calendar, TrendingUp } from 'lucide-react';

const QuestionOfTheDay = () => {
  const [todayQuestion, setTodayQuestion] = useState(null);
  const [yesterdayQuestion, setYesterdayQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [userName, setUserName] = useState('');
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('today'); // 'today', 'yesterday', 'leaderboard'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [todayRes, yesterdayRes, leaderboardRes] = await Promise.all([
        qotdAPI.getToday().catch(() => null),
        qotdAPI.getYesterday().catch(() => null),
        qotdAPI.getLeaderboard().catch(() => ({ data: [] }))
      ]);

      if (todayRes) setTodayQuestion(todayRes.data);
      if (yesterdayRes) setYesterdayQuestion(yesterdayRes.data);
      setLeaderboard(leaderboardRes.data);

      // Check if already answered today
      const answeredToday = localStorage.getItem(`qotd_answered_${todayRes?.data?.id}`);
      if (answeredToday) {
        setAnswered(true);
        setResult(JSON.parse(answeredToday));
      }
    } catch (error) {
      console.error('Error loading QOTD:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();

    if (!selectedAnswer) {
      alert('Please select an answer!');
      return;
    }

    try {
      const response = await qotdAPI.submitAnswer({
        question_id: todayQuestion.id,
        selected_answer: selectedAnswer,
        user_name: userName || 'Anonymous'
      });

      setResult(response.data);
      setAnswered(true);

      // Save to localStorage so they can't answer again today
      localStorage.setItem(`qotd_answered_${todayQuestion.id}`, JSON.stringify(response.data));

      // Reload leaderboard
      const leaderboardRes = await qotdAPI.getLeaderboard();
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      if (error.response?.status === 400) {
        alert(error.response.data.message);
      } else {
        alert('Failed to submit answer. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="qotd-container animate-pulse">
        <div className="h-64 bg-gray-800 rounded-2xl"></div>
      </div>
    );
  }

  if (!todayQuestion && !yesterdayQuestion) {
    return null; // Don't show QOTD if no questions available
  }

  return (
    <section className="section">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-brit-gold/20 rounded-full mb-6">
            <Trophy className="text-brit-gold" size={40} />
          </div>
          <h2 className="section-title">Question of the Day</h2>
          <p className="section-subtitle">Test your knowledge and compete for the monthly leaderboard!</p>
        </div>

        {/* View Tabs */}
        <div className="flex justify-center mb-8 gap-4 flex-wrap">
          {todayQuestion && (
            <button
              onClick={() => setView('today')}
              className={`btn ${view === 'today' ? 'btn-primary' : 'btn btn-outline border-2 border-brit-gold text-brit-gold hover:bg-brit-gold hover:text-gray-900'}`}
            >
              Today's Question
            </button>
          )}
          {yesterdayQuestion && (
            <button
              onClick={() => setView('yesterday')}
              className={`btn ${view === 'yesterday' ? 'btn-primary' : 'btn btn-outline border-2 border-brit-gold text-brit-gold hover:bg-brit-gold hover:text-gray-900'}`}
            >
              Yesterday's Answer
            </button>
          )}
          {leaderboard.length > 0 && (
            <button
              onClick={() => setView('leaderboard')}
              className={`btn ${view === 'leaderboard' ? 'btn-primary' : 'btn btn-outline border-2 border-brit-gold text-brit-gold hover:bg-brit-gold hover:text-gray-900'}`}
            >
              Leaderboard
            </button>
          )}
        </div>

        {/* Today's Question */}
        {view === 'today' && todayQuestion && (
          <div className="max-w-3xl mx-auto">
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="text-brit-gold" size={24} />
                <span className="text-gray-400">
                  {new Date(todayQuestion.display_date).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="mb-2 inline-block px-3 py-1 bg-brit-red/20 text-brit-red rounded-full text-sm font-bold uppercase">
                {todayQuestion.category || 'General Knowledge'}
              </div>

              <h3 className="text-3xl font-black mb-8 text-white leading-tight">
                {todayQuestion.question}
              </h3>

              {!answered ? (
                <form onSubmit={handleSubmitAnswer}>
                  <div className="space-y-4 mb-8">
                    {['a', 'b', 'c', 'd'].map((letter) => (
                      <label
                        key={letter}
                        className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedAnswer === letter.toUpperCase()
                            ? 'border-brit-gold bg-brit-gold/20'
                            : 'border-gray-700 hover:border-brit-gold/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="answer"
                            value={letter.toUpperCase()}
                            checked={selectedAnswer === letter.toUpperCase()}
                            onChange={(e) => setSelectedAnswer(e.target.value)}
                            className="w-5 h-5"
                          />
                          <span className="font-bold text-brit-gold text-xl">{letter.toUpperCase()}.</span>
                          <span className="text-lg">{todayQuestion[`answer_${letter}`]}</span>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold mb-2 text-gray-300">
                      Your Name (optional - leave blank for Anonymous)
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name for the leaderboard"
                      className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:border-brit-gold focus:outline-none text-white"
                      maxLength={100}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-full text-lg">
                    Submit Answer
                  </button>
                </form>
              ) : (
                <div className={`p-6 rounded-xl ${result.is_correct ? 'bg-green-500/20 border-2 border-green-500' : 'bg-red-500/20 border-2 border-red-500'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    {result.is_correct ? (
                      <>
                        <Check className="text-green-500" size={32} />
                        <h4 className="text-2xl font-black text-green-500">Correct!</h4>
                      </>
                    ) : (
                      <>
                        <X className="text-red-500" size={32} />
                        <h4 className="text-2xl font-black text-red-500">Incorrect</h4>
                      </>
                    )}
                  </div>
                  <p className="text-lg text-gray-200">
                    The correct answer was: <span className="font-bold text-brit-gold">{result.correct_answer}</span>
                  </p>
                  <p className="text-gray-400 mt-2">Come back tomorrow for a new question!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Yesterday's Answer */}
        {view === 'yesterday' && yesterdayQuestion && (
          <div className="max-w-3xl mx-auto">
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="text-brit-gold" size={24} />
                <span className="text-gray-400">
                  {new Date(yesterdayQuestion.display_date).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="mb-2 inline-block px-3 py-1 bg-brit-red/20 text-brit-red rounded-full text-sm font-bold uppercase">
                {yesterdayQuestion.category || 'General Knowledge'}
              </div>

              <h3 className="text-3xl font-black mb-8 text-white leading-tight">
                {yesterdayQuestion.question}
              </h3>

              <div className="space-y-4 mb-8">
                {['a', 'b', 'c', 'd'].map((letter) => (
                  <div
                    key={letter}
                    className={`p-4 rounded-xl border-2 ${
                      letter.toUpperCase() === yesterdayQuestion.correct_answer
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-brit-gold text-xl">{letter.toUpperCase()}.</span>
                      <span className="text-lg">{yesterdayQuestion[`answer_${letter}`]}</span>
                      {letter.toUpperCase() === yesterdayQuestion.correct_answer && (
                        <Check className="text-green-500 ml-auto" size={24} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {yesterdayQuestion.explanation && (
                <div className="p-6 bg-brit-blue/20 rounded-xl border-2 border-brit-blue">
                  <h4 className="font-bold text-brit-gold mb-2 text-lg">Explanation:</h4>
                  <p className="text-gray-200 text-lg">{yesterdayQuestion.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {view === 'leaderboard' && (
          <div className="max-w-3xl mx-auto">
            <div className="card">
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="text-brit-gold" size={32} />
                <h3 className="text-3xl font-black text-white">Monthly Leaderboard</h3>
              </div>

              {leaderboard.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No entries yet this month. Be the first to answer!</p>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 rounded-xl ${
                        index === 0 ? 'bg-brit-gold/20 border-2 border-brit-gold' :
                        index === 1 ? 'bg-gray-700/50 border-2 border-gray-600' :
                        index === 2 ? 'bg-orange-900/30 border-2 border-orange-700' :
                        'bg-gray-800/50'
                      }`}
                    >
                      <div className={`text-3xl font-black ${
                        index === 0 ? 'text-brit-gold' :
                        index === 1 ? 'text-gray-300' :
                        index === 2 ? 'text-orange-500' :
                        'text-gray-500'
                      }`}>
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white text-lg">{entry.user_name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-brit-gold">{entry.correct_count}</div>
                        <div className="text-sm text-gray-400">correct</div>
                      </div>
                      {index === 0 && <Trophy className="text-brit-gold" size={32} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuestionOfTheDay;
