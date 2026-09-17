import { StrictMode, useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RotateCcw, Timer, Target, Sparkles } from 'lucide-react';
import './styles.css';

const SACRED_ITEMS = [
  { name: 'Coconut', icon: '🥥' },
  { name: 'Durva Grass', icon: '🌿' },
  { name: 'Diya', icon: '🪔' },
  { name: 'Marigold', icon: '🌼' },
  { name: 'Banana', icon: '🍌' },
  { name: 'Incense', icon: '🕯️' },
  { name: 'Lotus', icon: '🪷' },
  { name: 'Modak', icon: '🍡' },
];

const DISTRACTORS = [
  { name: 'Phone', icon: '📱' },
  { name: 'Book', icon: '📚' },
  { name: 'Bag', icon: '👜' },
  { name: 'Water Bottle', icon: '🍶' },
  { name: 'Shoe', icon: '👟' },
  { name: 'Clock', icon: '⏰' },
  { name: 'Umbrella', icon: '☂️' },
  { name: 'Key', icon: '🗝️' },
];

const shuffle = (items) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

function App() {
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(16);
  const [score, setScore] = useState(0);
  const [collected, setCollected] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const items = useMemo(() => shuffle([...SACRED_ITEMS, ...DISTRACTORS]), [round]);

  const resetGame = useCallback(() => {
    setRound((value) => value + 1);
    setTimeLeft(16);
    setScore(0);
    setCollected([]);
    setFeedback(null);
    setIsFinished(false);
  }, []);

  useEffect(() => {
    if (isFinished) return undefined;
    if (timeLeft <= 0) {
      setIsFinished(true);
      return undefined;
    }
    const timer = window.setInterval(() => setTimeLeft((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [isFinished, timeLeft]);

  useEffect(() => {
    if (collected.length === SACRED_ITEMS.length) setIsFinished(true);
  }, [collected.length]);

  const collectItem = (item) => {
    if (isFinished || collected.includes(item.name)) return;
    const isSacred = SACRED_ITEMS.some(({ name }) => name === item.name);
    setFeedback({ correct: isSacred, name: item.name });
    setScore((value) => Math.max(0, value + (isSacred ? 10 : -5)));
    if (isSacred) setCollected((value) => [...value, item.name]);
    window.setTimeout(() => setFeedback(null), 700);
  };

  const progress = Math.round((collected.length / SACRED_ITEMS.length) * 100);

  return (
    <main className="page-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <header className="topbar">
        <div className="brand-mark" aria-label="Ganesha Utsav home">
          <span className="brand-om">ॐ</span>
          <span className="brand-name">Ganesha Utsav</span>
        </div>
        <div className="top-progress" aria-label="Journey stages">
          {[1, 2, 3].map((stage) => (
            <span className={`stage-dot ${stage === 1 ? 'active' : ''}`} key={stage}>
              {stage}
            </span>
          ))}
        </div>
        <div className="header-score">
          <Sparkles size={16} />
          <span>{score}</span>
        </div>
      </header>

      <section className="game-card">
        <div className="eyebrow"><span className="eyebrow-line" /> Stage 1 <span className="eyebrow-line" /></div>
        <div className="game-label">• &nbsp; Puja Collector</div>
        <h1>Collect the Puja Items!</h1>
        <p className="subtitle">Tap the sacred items before time runs out. Avoid non-puja objects!</p>

        <div className="stats-row">
          <div className="stat-card">
            <Sparkles size={19} />
            <strong>{score}</strong>
            <span>points</span>
          </div>
          <div className="stat-card progress-stat">
            <strong>{collected.length}<small>/8</small></strong>
            <span>collected</span>
            <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          </div>
          <div className={`stat-card timer-stat ${timeLeft <= 5 ? 'urgent' : ''}`}>
            <Timer size={20} />
            <strong>{timeLeft}s</strong>
            <span>remaining</span>
          </div>
        </div>

        <div className="rules">
          <span className="correct">✓ Correct: +10pts</span>
          <span className="wrong">✗ Wrong: -5pts</span>
        </div>

        <div className="target-box">
          <div className="target-heading"><Target size={17} /> Collect these 8 sacred items:</div>
          <div className="target-list">
            {SACRED_ITEMS.map((item) => (
              <span className={collected.includes(item.name) ? 'target-collected' : ''} key={item.name}>
                {item.icon} {item.name}
              </span>
            ))}
          </div>
        </div>

        <div className="items-grid" aria-label="Puja items">
          {items.map((item) => (
            <button
              className={`item-button ${collected.includes(item.name) ? 'collected' : ''}`}
              key={item.name}
              onClick={() => collectItem(item)}
              type="button"
              disabled={isFinished || collected.includes(item.name)}
            >
              <span className="item-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        {feedback && (
          <div className={`feedback ${feedback.correct ? 'feedback-good' : 'feedback-bad'}`}>
            {feedback.correct ? `✨ ${feedback.name} collected!` : `Keep focused — ${feedback.name} isn't a puja item`}
          </div>
        )}

        {isFinished && (
          <div className="result-panel">
            <div className="result-emoji">{collected.length === 8 ? '🙏' : '⏳'}</div>
            <h2>{collected.length === 8 ? 'Beautifully done!' : 'Time for a reset'}</h2>
            <p>{collected.length === 8 ? `You collected every sacred item with ${score} points.` : `You found ${collected.length} of 8 sacred items.`}</p>
            <button className="reset-button" onClick={resetGame} type="button"><RotateCcw size={16} /> Play again</button>
          </div>
        )}
      </section>

      <footer>Ganesha Utsav <span>•</span> The Sacred Journey</footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>,
);
