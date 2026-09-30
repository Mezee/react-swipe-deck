import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ideas, type VideoIdea } from './content';
import { clamp } from './utils/math';
import './index.css';
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
} from 'motion/react';
import ProgressMask from './components/progress-mask';
const thumbnail = '/thumbnail.jpg';
function Heading({
  idea,
  shared = false,
}: {
  idea: VideoIdea;
  shared?: boolean;
}) {
  return (
    <>
      <motion.h1 layoutId={shared ? `title-${idea.id}` : undefined}>
        {idea.title}
      </motion.h1>
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
    [interacting, setInteracting] = useState(false),
    [exiting, setExiting] = useState(false),
    [drag, setDrag] = useState({ x: 0, y: 0 }),
    [selected, setSelected] = useState<string | null>(() =>
      localStorage.getItem('selected-video'),
    ),
    [comment, setComment] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null),
    timer = useRef<ReturnType<typeof setTimeout>>(),
    flightTimer = useRef<ReturnType<typeof setTimeout>>(),
    busy = useRef(false),
    report = useRef<HTMLDivElement>(null),
    reportStart = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const sample = useRef({ x: 0, time: 0, velocity: 0 });
  const idea = ideas[index];
  const cancel = () => {
    clearTimeout(timer.current);
    setHolding(false);
  };
  const navigate = (direction: number, flightDirection = direction) => {
    if (busy.current) return;
    cancel();
    start.current = null;
    setInteracting(false);
    busy.current = true;
    setExiting(true);
    setDrag({ x: flightDirection * (window.innerWidth + 500), y: 40 });
    flightTimer.current = setTimeout(() => {
      setIndex((i) => (i + direction + ideas.length) % ideas.length);
      setDrag({ x: 0, y: 0 });
      setComment(0);
      setExiting(false);
      busy.current = false;
    }, 300);
  };
  const open = () => {
    if (busy.current) return;
    cancel();
    setInteracting(false);
    start.current = null;
    setDrag({ x: 0, y: 0 });
    setExpanded(true);
  };
  const close = () => {
    setExpanded(false);
    reportStart.current = null;
  };
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(flightTimer.current);
    },
    [],
  );
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
      if (!expanded && e.key === 'ArrowRight') navigate(1);
      if (!expanded && e.key === 'ArrowLeft') navigate(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });
  useEffect(() => {
    if (expanded) {
      const previous = document.activeElement as HTMLElement;
      report.current?.focus();
      return () => previous?.focus();
    }
  }, [expanded]);
  const down = (e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || busy.current) return;
    setInteracting(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    sample.current = { x: e.clientX, time: performance.now(), velocity: 0 };
    setHolding(true);
    timer.current = setTimeout(open, 3000);
  };
  const move = (e: PointerEvent<HTMLElement>) => {
    if (!start.current) return;
    const now = performance.now();
    const elapsed = now - sample.current.time;
    if (elapsed > 0)
      sample.current = {
        x: e.clientX,
        time: now,
        velocity: (e.clientX - sample.current.x) / elapsed,
      };
    const x = e.clientX - start.current.x,
      y = e.clientY - start.current.y;
    if (Math.hypot(x, y) > 10) cancel();
    setDrag({ x: x * 0.8, y: y * 0.5 });
  };
  const up = (e: PointerEvent<HTMLElement>) => {
    cancel();
    setInteracting(false);
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    start.current = null;
    const velocity =
      performance.now() - sample.current.time < 100
        ? sample.current.velocity
        : 0;
    const flick =
      Math.abs(dx) > 25 &&
      Math.abs(velocity) > 0.5 &&
      Math.sign(dx) === Math.sign(velocity);
    if (Math.abs(dx) > 100 || flick) navigate(dx < 0 ? 1 : -1, dx < 0 ? -1 : 1);
    else setDrag({ x: 0, y: 0 });
  };
  return (
    <LayoutGroup>
      <main>
        <nav className="top-progress" aria-label="Deck progress">
          {ideas.map((v, i) => (
            <button
              key={v.id}
              aria-label={`Go to idea ${i + 1}`}
              aria-current={i === index ? 'step' : undefined}
              className={i <= index ? 'filled' : ''}
              disabled={exiting}
              onClick={() => {
                cancel();
                setIndex(i);
                setComment(0);
              }}
            />
          ))}
        </nav>
        <div className="deck-area">
          <div
            className={`stack preview-card ${exiting ? 'promoting' : ''}`}
            aria-hidden="true"
          >
            <div className="thumbnail">
              <img src={thumbnail} alt="" />
            </div>
            <div className="description">
              <Heading idea={ideas[(index + 1) % ideas.length]} />
            </div>
          </div>
          <motion.article
            key={idea.id}
            aria-label={`Video idea ${index + 1} of 5`}
            className={`idea-card ${interacting ? 'dragging' : ''} ${exiting ? 'exiting' : ''}`}
            layoutId={`card-${idea.id}`}
            animate={{
              x: drag.x,
              y: drag.y,
              rotate: clamp(drag.x / 600, -1, 1) * -30,
              scale: interacting ? 1.02 : 1,
            }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : interacting
                  ? { duration: 0 }
                  : exiting
                    ? { duration: 0.3, ease: 'easeInOut' }
                    : { type: 'spring', stiffness: 300, damping: 25 }
            }
            style={{ visibility: expanded ? 'hidden' : 'visible' }}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={() => {
              cancel();
              setInteracting(false);
              start.current = null;
              setDrag({ x: 0, y: 0 });
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <motion.div className="thumbnail" layoutId={`thumbnail-${idea.id}`}>
              <img
                src={thumbnail}
                alt="Pixelated owl from your Paper design"
                draggable={false}
              />
            </motion.div>
            <div className="description">
              <Heading idea={idea} shared />
            </div>
            <ProgressMask
              progress={clamp(drag.x / 100, -1, 1)}
              isInteracting={interacting}
            />
            <div className={`hold-track ${holding ? 'holding' : ''}`}>
              <span />
            </div>
          </motion.article>
        </div>
        <nav className="deck-controls" aria-label="Deck navigation">
          <button aria-label="Previous idea" onClick={() => navigate(-1)}>
            ←
          </button>
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
        <AnimatePresence>
          {' '}
          {expanded && (
            <motion.div
              className="report-overlay"
              key="report"
              initial={{ backgroundColor: '#eeeeee00' }}
              animate={{ backgroundColor: '#eeeeee' }}
              exit={{ backgroundColor: '#eeeeee00' }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
              role="dialog"
              aria-modal="true"
              aria-label={idea.title}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  const nodes = Array.from(
                    e.currentTarget.querySelectorAll<HTMLButtonElement>(
                      'button',
                    ),
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
                    report.current?.scrollTop === 0
                      ? e.touches[0].clientY
                      : null;
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
                <motion.div
                  className="report-shell"
                  layoutId={`card-${idea.id}`}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    duration: reducedMotion ? 0 : undefined,
                  }}
                >
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
                  <motion.div
                    className="thumbnail"
                    layoutId={`thumbnail-${idea.id}`}
                  >
                    <img
                      src={thumbnail}
                      alt="Pixelated owl from your Paper design"
                    />
                  </motion.div>
                  <motion.div
                    className="report-body"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      delay: reducedMotion ? 0 : 0.2,
                      duration: reducedMotion ? 0 : 0.2,
                    }}
                  >
                    <div className="report-heading">
                      <Heading idea={idea} shared />
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
                          No sourced comments yet. Validate this idea with
                          audience research.
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
                  </motion.div>
                </motion.div>
              </div>
              <button
                className="close-button"
                aria-label="Close report"
                onClick={close}
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </LayoutGroup>
  );
}
export default App;
