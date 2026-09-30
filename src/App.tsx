import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ideas, type VideoIdea } from './content';
import { clamp } from './utils/math';
import './index.css';
const thumbnail = '/thumbnail.jpg';
function Heading({ idea }: { idea: VideoIdea }) {
  return (
    <>
      <h1>{idea.title}</h1>
      <p className="signal">{idea.signal}</p>
      <div className="badge">
        Demand Score <strong>{idea.score}</strong>
        <span aria-hidden="true">★</span>
      </div>
    </>
  );
}
function App() {
  const [index, setIndex] = useState(0),
    [expanded, setExpanded] = useState(false),
    [holding, setHolding] = useState(false),
    [drag, setDrag] = useState({ x: 0, y: 0 }),
    [selected, setSelected] = useState<string | null>(() =>
      localStorage.getItem('selected-video'),
    ),
    [comment, setComment] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null),
    timer = useRef<ReturnType<typeof setTimeout>>(),
    report = useRef<HTMLDivElement>(null),
    reportStart = useRef<number | null>(null);
  const idea = ideas[index];
  const cancel = () => {
    clearTimeout(timer.current);
    setHolding(false);
  };
  const navigate = (direction: number) => {
    cancel();
    setIndex((i) => (i + direction + ideas.length) % ideas.length);
    setDrag({ x: 0, y: 0 });
    setComment(0);
  };
  const open = () => {
    cancel();
    start.current = null;
    setDrag({ x: 0, y: 0 });
    setExpanded(true);
  };
  const close = () => {
    setExpanded(false);
    reportStart.current = null;
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
      if (!expanded && e.key === 'ArrowRight')
        setIndex((i) => (i + 1) % ideas.length);
      if (!expanded && e.key === 'ArrowLeft')
        setIndex((i) => (i + ideas.length - 1) % ideas.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [expanded]);
  useEffect(() => {
    if (expanded) {
      const previous = document.activeElement as HTMLElement;
      report.current?.focus();
      return () => previous?.focus();
    }
  }, [expanded]);
  const down = (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setHolding(true);
    timer.current = setTimeout(open, 3000);
  };
  const move = (e: PointerEvent<HTMLElement>) => {
    if (!start.current) return;
    const x = e.clientX - start.current.x,
      y = e.clientY - start.current.y;
    if (Math.hypot(x, y) > 10) cancel();
    setDrag({ x: x * 0.8, y: y * 0.25 });
  };
  const up = (e: PointerEvent<HTMLElement>) => {
    cancel();
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    start.current = null;
    if (Math.abs(dx) > 100) navigate(dx < 0 ? 1 : -1);
    else setDrag({ x: 0, y: 0 });
  };
  return (
    <main>
      <header className="app-header">
        <span>Next video</span>
        <small>Five ideas. One next move.</small>
      </header>
      <div className="deck-area">
        <div className="stack back-two" />
        <div className="stack back-one" />
        <article
          aria-label={`Video idea ${index + 1} of 5`}
          className="idea-card"
          style={{
            transform: `translate(${drag.x}px,${drag.y}px) rotate(${clamp(drag.x / 600, -1, 1) * -15}deg)`,
          }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={() => {
            cancel();
            start.current = null;
            setDrag({ x: 0, y: 0 });
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="thumbnail">
            <img
              src={thumbnail}
              alt="Pixelated owl from your Paper design"
              draggable={false}
            />
            {index > 0 && (
              <span className="thumbnail-caption">
                {
                  [
                    '',
                    'YOUR FILES. YOUR AI.',
                    'WHAT HARDWARE?',
                    'ONE REAL WORKFLOW',
                    'GET UNSTUCK',
                  ][index]
                }
              </span>
            )}
          </div>
          <div className="description">
            <Heading idea={idea} />
          </div>
          <div className={`hold-track ${holding ? 'holding' : ''}`}>
            <span />
          </div>
        </article>
      </div>
      <nav className="deck-controls" aria-label="Deck navigation">
        <button aria-label="Previous idea" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="dots">
          {ideas.map((v, i) => (
            <button
              key={v.id}
              className={index === i ? 'active' : ''}
              aria-label={`Go to idea ${i + 1}`}
              aria-current={index === i ? 'true' : undefined}
              onClick={() => {
                setIndex(i);
                setComment(0);
              }}
            />
          ))}
        </div>
        <button aria-label="Next idea" onClick={() => navigate(1)}>
          →
        </button>
      </nav>
      <div className="deck-footer">
        <button className="text-button" onClick={open}>
          View report ↗
        </button>
        <span>{index + 1} / 5 · Hold card for 3 seconds</span>
      </div>
      <p className="sample-note">
        Prototype content · Scores and ideas are illustrative; first card uses
        your supplied report.
      </p>
      {expanded && (
        <div
          className="report-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={idea.title}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              const nodes = Array.from(
                e.currentTarget.querySelectorAll<HTMLButtonElement>('button'),
              );
              const first = nodes[0],
                last = nodes[nodes.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }
          }}
        >
          <div
            ref={report}
            tabIndex={-1}
            className="report-scroll"
            onTouchStart={(e) => {
              reportStart.current =
                report.current?.scrollTop === 0 ? e.touches[0].clientY : null;
            }}
            onTouchEnd={(e) => {
              if (
                reportStart.current !== null &&
                e.changedTouches[0].clientY - reportStart.current > 100
              )
                close();
              reportStart.current = null;
            }}
          >
            <div className="report-shell">
              <button
                className="handle"
                aria-label="Close report"
                onClick={close}
                onPointerDown={(e) => {
                  reportStart.current = e.clientY;
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerUp={(e) => {
                  if (
                    reportStart.current !== null &&
                    e.clientY - reportStart.current > 60
                  )
                    close();
                  reportStart.current = null;
                }}
              >
                <span />
              </button>
              <div className="thumbnail">
                <img
                  src={thumbnail}
                  alt="Pixelated owl from your Paper design"
                />
              </div>
              <div className="report-body">
                <div className="report-heading">
                  <Heading idea={idea} />
                </div>
                <section>
                  <h2>Signal</h2>
                  <p>{idea.demand}</p>
                </section>
                <section>
                  <h2>Comments</h2>
                  {idea.comments.length ? (
                    <>
                      <div className="comment">
                        <strong>{idea.comments[comment].label}</strong>
                        <small>{idea.comments[comment].author}</small>
                        <p>{idea.comments[comment].text}</p>
                      </div>
                      <div className="dots">
                        {idea.comments.map((c, i) => (
                          <button
                            key={c.label}
                            className={comment === i ? 'active' : ''}
                            aria-label={`Comment ${i + 1}`}
                            onClick={() => setComment(i)}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="empty">
                      No sourced comments yet. Validate this idea with audience
                      research.
                    </p>
                  )}
                </section>
                <section>
                  <h2>Edge</h2>
                  <p>{idea.edge}</p>
                </section>
                <section>
                  <h2>Alignment</h2>
                  <p>{idea.alignment}</p>
                </section>
                <section>
                  <h2>To succeed</h2>
                  <p>{idea.success}</p>
                </section>
                <button
                  className="select-button"
                  onClick={() => {
                    setSelected(idea.id);
                    localStorage.setItem('selected-video', idea.id);
                  }}
                >
                  {selected === idea.id
                    ? '✓ Selected as your next video'
                    : 'Make this next'}
                </button>
                <p className="sample-note">
                  Prototype · Demand scores require validation.
                </p>
              </div>
            </div>
          </div>
          <button
            className="close-button"
            aria-label="Close report"
            onClick={close}
          >
            ×
          </button>
        </div>
      )}
    </main>
  );
}
export default App;
