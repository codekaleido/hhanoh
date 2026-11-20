
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Download,
  Instagram,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

// ADD YOUR ARTWORK HERE
// Leave empty until you add your own artwork.


/* ---------------- HERO ---------------- */

function Hero() {
  const ref = useRef(null);
  const shape = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-copy > *', {
        y: 35,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out'
      });

      gsap.to(shape.current, {
        y: 70,
        rotate: 5,
        scale: 0.96,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  function move(e) {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;

    gsap.to(shape.current, {
      rotateY: x * 9,
      rotateX: -y * 8,
      duration: 0.6
    });
  }

  return (
    <section
      className="hero"
      ref={ref}
      onMouseMove={move}
      onMouseLeave={() =>
        gsap.to(shape.current, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.8,
          ease: 'elastic.out(1,0.5)'
        })
      }
    >
      <div className="topline">
        <span>HEHEEE NNA PIDICHO</span>
        <span>SCROLL EYYY ↓</span>
      </div>

      <div className="shape-wrap" ref={shape}>
        <div className="hero-shape">
          <img src="/artworks/hero.svg" alt="Hero portrait" />
          <i />
        </div>
        <b className="bubble b1" />
        <b className="bubble b2" />
      </div>

      <div className="hero-copy">
        <p>A TINY CORNER OF THE INTERNET JUST GOT BLESSED</p>
        <h1>
          Hii.
          <br />
          <em>Hannohh!!</em>
        </h1>
      </div>

      <div className="hero-bottom">
        <span>TADAWWW!!</span>
        <span>KEEP SCROLLING ↓</span>
      </div>
    </section>
  );
}


/* ---------------- GALLERY CARD ---------------- */

function Card({ item, index, selected, onClick }) {
  const el = useRef(null);
  const start = useRef(0);

  function tilt(e) {
    const r = el.current.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;

    el.current.style.setProperty(
      '--rx',
      `${-y / r.height * 8}deg`
    );

    el.current.style.setProperty(
      '--ry',
      `${x / r.width * 10}deg`
    );
  }

  function reset() {
    if (!el.current) return;

    el.current.style.setProperty('--rx', '0deg');
    el.current.style.setProperty('--ry', '0deg');
    el.current.style.setProperty('--jelly', '0deg');
  }

  return (
    <button
      ref={el}
      className={`card ${item.tone || ''} ${selected ? 'chosen' : ''}`}
      onPointerDown={e => {
        start.current = e.clientX;
      }}
      onPointerMove={tilt}
      onPointerUp={e => {
        const d = e.clientX - start.current;
        const jelly = Math.max(-14, Math.min(14, d * 0.13));

        el.current.style.setProperty(
          '--jelly',
          `${jelly}deg`
        );

        setTimeout(reset, 480);
      }}
      onPointerLeave={reset}
      onClick={onClick}
    >
      <div className="card-img">
        <img src={item.image} alt={item.title} />
      </div>

      <div className="card-meta">
        <small>{item.type || 'ARTWORK'}</small>
        <strong>{item.title}</strong>
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>

      <i className="shine" />
    </button>
  );
}


/* ---------------- ASCII VIEWER ---------------- */

function Output({ item }) {
  const [ascii, setAscii] = useState('');
  const [view, setView] = useState('ascii');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [imageRatio, setImageRatio] = useState(1);

  // Get original image dimensions
  useEffect(() => {
    const img = new Image();

    img.onload = () => {
      setImageRatio(img.naturalWidth / img.naturalHeight);
    };

    img.onerror = () => {
      setImageRatio(1);
    };

    img.src = item.image;
  }, [item.image]);

  // Load ASCII HTML and extract plain text for copy/download
  useEffect(() => {
    let cancelled = false;

    setAscii('');
    setError('');
    setView('ascii');
    setCopied(false);

    fetch(item.asciiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('ASCII artwork could not be loaded.');
        }

        return response.text();
      })
      .then(html => {
        const document = new DOMParser().parseFromString(
          html,
          'text/html'
        );

        const pre = document.querySelector('pre');

        if (!pre) {
          throw new Error('No ASCII artwork found in the HTML file.');
        }

        if (!cancelled) {
          setAscii(pre.textContent || '');
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [item.asciiUrl]);

  function save() {
    const blob = new Blob([ascii], {
      type: 'text/plain;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `${item.id}-ascii.txt`;
    a.click();

    URL.revokeObjectURL(url);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(ascii);
      setCopied(true);

      setTimeout(() => setCopied(false), 1300);
    } catch {
      setError('Could not copy text. Check clipboard permissions.');
    }
  }

  // Adapt viewer height to image orientation
  const viewerHeight = Math.min(
    window.innerHeight * 0.75,
    Math.max(350, Math.min(750, 600 / imageRatio))
  );

  return (
    <section className="output" id="output">
      <div className="kicker">
        <span>02 / THE TRANSFORMATION</span>
        <span>ONE IMAGE, MANY CHARACTERS</span>
      </div>

      <div className="out-head">
        <h2>{item.title}<em>.</em></h2>
        <p>{item.note || ''}</p>
      </div>

      <div className="terminal">
        <div className="terminal-top">
          <span>
            <i /> {item.id.toUpperCase()} / ASCII VIEWER
          </span>

          <div>
            <button onClick={copy} disabled={!ascii}>
              {copied ? 'COPIED' : 'COPY TEXT'}
            </button>

            <button onClick={save} disabled={!ascii}>
              <Download size={13} /> SAVE .TXT
            </button>
          </div>
        </div>

        <div className="ascii-stage">
          {error ? (
            <p>{error}</p>
          ) : view === 'ascii' ? (
            <iframe
              key={item.asciiUrl}
              src={item.asciiUrl}
              title={`${item.title} RGB ASCII artwork`}
              scrolling="yes"
              style={{
                width: '100%',
                height: 'min(65vh, 520px)',
                minHeight: '300px',
                border: 'none',
                display: 'block',
                background: '#111'
                }}
            />
          ) : (
            <img src={item.image} alt={item.title} />
          )}
        </div>

        <div className="terminal-bottom">
          <span>BLACK CANVAS · MONOSPACE STUDY</span>

          <button
            onClick={() =>
              setView(view === 'ascii' ? 'original' : 'ascii')
            }
          >
            <RotateCcw size={13} />
            {view === 'ascii' ? 'VIEW ORIGINAL' : 'VIEW ASCII'}
          </button>
        </div>
      </div>
    </section>
  );
}


/* ---------------- GALLERY ---------------- */

function Gallery() {
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load artwork manifest
  useEffect(() => {
    fetch('/artworks/manifest.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Could not load artwork manifest');
        }
        return response.json();
      })
      .then(data => {
        console.log('Loaded artworks:', data);
        setItems(data);
      })
      .catch(error => {
        console.error('Artwork loading error:', error);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Horizontal gallery GSAP animation removed.
  // The gallery now scrolls independently using CSS overflow-x:auto.

  function choose(item) {
    setSelected(item);

    setTimeout(() => {
      document.querySelector('#output')?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 60);
  }

  return (
    <>
      <section className="gallery">
        <div className="gallery-head">
          <div className="kicker">
            <span>01 / THE COLLECTION</span>
            <span>SCROLL TO WANDER</span>
          </div>

          <h2>
            Pick a <em>picture.</em>
          </h2>

          <p>ninte ishtem pole click chethoo.</p>
        </div>

        <div className="rail-window">
          <div className="rail">
            {items.map((item, index) => (
              <Card
                key={item.id}
                item={item}
                index={index}
                selected={selected?.id === item.id}
                onClick={() => choose(item)}
              />
            ))}

            {items.length > 0 && (
              <div className="end-card">
                <Sparkles size={30} />
                <span>THAT'S ALL<br />FOR NOW.</span>
              </div>
            )}
          </div>
        </div>

        {items.length > 0 && (
          <div className="gallery-hint">
            <span>SCROLL TO MOVE THE CARDS</span>
            <span>✳</span>
            <span>CHOOSE ONE TO REVEAL ITS ASCII</span>
          </div>
        )}

        {items.length === 0 && (
          <div className="empty-gallery">
            <Sparkles size={25} />
            <p>YOUR COLLECTION STARTS HERE.</p>
          </div>
        )}
      </section>

      {selected && <Output item={selected} />}
    </>
  );
}


/* ---------------- DINO GAME ---------------- */

// ---- Dino game constants ----
const DG_WIDTH = 600;
const DG_X = 40;       // dino left position
const DG_W = 28;       // dino width
const DG_OBS_W = 18;   // obstacle width
const DG_OBS_H = 28;   // obstacle height
const DG_GRAVITY = 2600;
const DG_JUMP_V = 760;
const DG_START_SPEED = 280;
const DG_MAX_SPEED = 620;

const dgInitial = () => ({ y: 0, vy: 0, obsX: DG_WIDTH, speed: DG_START_SPEED, distance: 0 });
const dgPad = (n) => String(n).padStart(5, '0');

const DG_CSS = `
.dg { font-family: 'Courier New', monospace; width: 600px; max-width: 100%;
  user-select: none; -webkit-user-select: none; touch-action: manipulation; }
.dg-score { text-align: right; letter-spacing: 2px; font-weight: bold; margin-bottom: 6px; }
.dg-stage { position: relative; height: 150px; overflow: hidden;
  border-bottom: 2px solid currentColor; cursor: pointer; }
.dg-sprite { position: absolute; bottom: 0; display: flex; align-items: center;
  justify-content: center; height: 28px; font-size: 26px; line-height: 1; will-change: transform; }
.dg-dino { left: 40px; width: 28px; }
.dg-obs { left: 0; width: 18px; }
.dg-overlay { position: absolute; inset: 0; display: flex; align-items: center;
  justify-content: center; font-weight: bold; letter-spacing: 2px; pointer-events: none; }
.dg-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
  margin-top: 10px; font-size: 12px; }
.dg-controls span { margin-right: auto; }
.dg-controls button { font: inherit; padding: 4px 10px; border: 1px solid currentColor;
  background: transparent; color: inherit; cursor: pointer; }
`;

function Dino() {
  const [status, setStatus] = useState('idle'); // idle | running | paused | over
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const statusRef = useRef('idle');
  const game = useRef(dgInitial());
  const dinoEl = useRef(null);
  const obsEl = useRef(null);

  const changeStatus = useCallback((s) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const paint = useCallback(() => {
    const g = game.current;
    if (dinoEl.current) dinoEl.current.style.transform = `translateY(${-g.y}px)`;
    if (obsEl.current) obsEl.current.style.transform = `translateX(${g.obsX}px)`;
  }, []);

  const resetGame = useCallback(() => {
    game.current = dgInitial();
    paint();
    setScore(0);
  }, [paint]);

  const toggle = useCallback(() => {
    const s = statusRef.current;
    if (s === 'running') {
      changeStatus('paused');
    } else {
      if (s === 'over') resetGame();
      changeStatus('running');
    }
  }, [changeStatus, resetGame]);

  const reset = useCallback(() => {
    changeStatus('idle');
    resetGame();
  }, [changeStatus, resetGame]);

  const jump = useCallback(() => {
    if (statusRef.current !== 'running') {
      toggle();
    } else if (game.current.y === 0) {
      game.current.vy = DG_JUMP_V;
    }
  }, [toggle]);

  useEffect(() => { paint(); }, [paint]);

  // Game loop
  useEffect(() => {
    if (status !== 'running') return;
    let raf;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const g = game.current;

      if (g.y > 0 || g.vy > 0) {
        g.vy -= DG_GRAVITY * dt;
        g.y += g.vy * dt;
        if (g.y <= 0) { g.y = 0; g.vy = 0; }
      }

      g.speed = Math.min(DG_MAX_SPEED, g.speed + 6 * dt);
      g.obsX -= g.speed * dt;
      g.distance += g.speed * dt;
      if (g.obsX < -DG_OBS_W) g.obsX = DG_WIDTH + Math.random() * 250;

      const hit =
        g.obsX < DG_X + DG_W - 6 &&
        g.obsX + DG_OBS_W > DG_X + 6 &&
        g.y < DG_OBS_H - 6;

      paint();

      const s = Math.floor(g.distance / 10);
      setScore((prev) => (prev === s ? prev : s));

      if (hit) {
        setBest((b) => Math.max(b, s));
        changeStatus('over');
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, paint, changeStatus]);

  // Keyboard: Space / ArrowUp
  useEffect(() => {
    const isTyping = (t) =>
      t instanceof HTMLElement &&
      (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);

    const onKeyDown = (e) => {
      if (e.code !== 'Space' && e.code !== 'ArrowUp') return;
      if (isTyping(e.target)) return;
      e.preventDefault();
      if (!e.repeat) jump();
    };
    const onKeyUp = (e) => {
      if (e.code === 'Space' && !isTyping(e.target)) e.preventDefault();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [jump]);

  return (
    <div className="dg">
      <style>{DG_CSS}</style>

      <div className="dg-score">HI {dgPad(best)} &nbsp; {dgPad(score)}</div>

      <div className="dg-stage" onPointerDown={jump}>
        <div ref={dinoEl} className="dg-sprite dg-dino">▰</div>
        <div ref={obsEl} className="dg-sprite dg-obs">♟</div>

        {status === 'idle' && <div className="dg-overlay">PRESS SPACE OR TAP TO START</div>}
        {status === 'paused' && <div className="dg-overlay">PAUSED</div>}
        {status === 'over' && <div className="dg-overlay">GAME OVER — TAP TO RESTART</div>}
      </div>

      <div className="dg-controls" onMouseDown={(e) => e.preventDefault()}>
        <span>SPACE / TAP TO JUMP</span>
        <button onClick={toggle}>{status === 'running' ? 'PAUSE' : 'START'}</button>
        <button onClick={reset}>RESET</button>
        <button onClick={jump}>JUMP</button>
      </div>
    </div>
  );
}


/* ---------------- TIC TAC TOE ---------------- */

const WINS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// Returns 'X', 'O', 'DRAW', or '' (game still going)
function getWinner(board) {
  const line = WINS.find(([a, b, c]) =>
    board[a] && board[a] === board[b] && board[b] === board[c]
  );
  if (line) return board[line[0]];
  return board.every(Boolean) ? 'DRAW' : '';
}

function TicTacToe() {
  const [cells, setCells] = useState(Array(9).fill(''));
  const [turn, setTurn] = useState('X'); // you are X
  const [winner, setWinner] = useState('');

  // Your move
  function play(i) {
    if (turn !== 'X' || cells[i] || winner) return;

    const next = [...cells];
    next[i] = 'X';
    setCells(next);

    const result = getWinner(next);
    if (result) setWinner(result);
    else setTurn('O');
  }

  // Computer's move (O): picks a random empty square
  useEffect(() => {
    if (turn !== 'O' || winner) return;

    const timer = setTimeout(() => {
      const empty = cells
        .map((v, i) => (v ? null : i))
        .filter((i) => i !== null);
      const pick = empty[Math.floor(Math.random() * empty.length)];

      const next = [...cells];
      next[pick] = 'O';
      setCells(next);

      const result = getWinner(next);
      if (result) setWinner(result);
      else setTurn('X');
    }, 500);

    return () => clearTimeout(timer);
  }, [turn, winner, cells]);

  function reset() {
    setCells(Array(9).fill(''));
    setTurn('X');
    setWinner('');
  }

  return (
    <div className="ttt">
      <p>
        {winner
          ? winner === 'DRAW'
            ? "IT'S A DRAW"
            : winner === 'X'
              ? 'YOU WIN'
              : 'COMPUTER WINS'
          : turn === 'X'
            ? 'YOUR TURN (X)'
            : 'COMPUTER IS THINKING...'}
      </p>

      <div>
        {cells.map((v, i) => (
          <button key={i} onClick={() => play(i)} disabled={!!v || !!winner || turn !== 'X'}>
            {v}
          </button>
        ))}
      </div>

      <button className="again" onClick={reset}>
        PLAY AGAIN ↗
      </button>
    </div>
  );
}


/* ---------------- GAMES ---------------- */

function Games() {
  return (
    <section className="games">
      <div className="kicker">
        <span>03 / PLAY BREAK</span>
        <span>NO SERIOUS BUSINESS HERE</span>
      </div>

      <div className="games-head">
        <h2>Stay & <em>play.</em></h2>
        <p>Take a tiny break. You deserve it.</p>
      </div>

      <div className="game-grid">
        <article className="gamebox runner">
          <small>01 — THE RUNNER</small>
          <h3>Little dino.</h3>
          <Dino />
        </article>

        <article className="gamebox nought">
          <small>02 — THE CLASSIC</small>
          <h3>Tic tac toe.</h3>
          <TicTacToe />
        </article>
      </div>
    </section>
  );
}


/* ---------------- FOOTER ---------------- */

function Footer() {
  return (
    <footer>
      <div className="foot-top">
        <span>THAT'S ALL, FOLKS.</span>

        <a
          href="#top"
          onClick={() => window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })}
        >
          BACK TO TOP ↑
        </a>
      </div>

      <div className="foot-main">
        <h2>
          Made with a<br />
          <em>little wonder.</em>
        </h2>

        <div>
          <small>CREATED BY</small>
          <strong>Appu</strong>

          <a
            href="https://instagram.com/aabhijithh._"
            target="_blank"
            rel="noreferrer"
          >
            <Instagram size={15} />
            @aabhijithh._ ↗
          </a>
        </div>
      </div>

      <div className="foot-bottom">
        <span>© 2026 · A SMALL INTERNET THING</span>
        <span>PIXELS, PLEASE.</span>
        <span>BUILT WITH CURIOSITY ✳</span>
      </div>
    </footer>
  );
}


/* ---------------- APP ---------------- */

function App() {
  return (
    <main id="top">
      <Hero />
      <Gallery />
      <Games />
      <Footer />
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
