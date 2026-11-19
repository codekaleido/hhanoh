
import React, { useEffect, useRef, useState } from 'react';
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
        // Extract plain ASCII characters for copy and download
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
              style={{
                width: '100%',
                height: '420px',
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

  const section = useRef(null);
  const rail = useRef(null);

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

  // Horizontal gallery animation
  useEffect(() => {
    if (!items.length || !rail.current || !section.current) return;

    const ctx = gsap.context(() => {
      const distance = () =>
        Math.max(0, rail.current.scrollWidth - window.innerWidth + 100);

      gsap.to(rail.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => `+=${distance() + 250}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
    }, section);

    return () => ctx.revert();
  }, [items.length]);

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
      <section className="gallery" ref={section}>
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
          <div className="rail" ref={rail}>
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

function Dino() {
  const [on, setOn] = useState(false);
  const [jump, setJump] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!on) return;

    const timer = setInterval(
      () => setScore(s => s + 1),
      110
    );

    return () => clearInterval(timer);
  }, [on]);

  useEffect(() => {
    if (!jump) return;

    const timer = setTimeout(() => setJump(false), 520);

    return () => clearTimeout(timer);
  }, [jump]);

  return (
    <div className="dino">
      <div className="score">
        HI {String(score).padStart(5, '0')}
      </div>

      <div className="ground">
        <b className={jump ? 'jump' : ''}>▰</b>
        <i>♟</i>
      </div>

      <div className="game-controls">
        <span>SPACE / TAP TO JUMP</span>

        <button onClick={() => {
          setOn(!on);
          if (on) setScore(0);
        }}>
          {on ? 'PAUSE' : 'START'}
        </button>

        <button onClick={() => {
          setOn(false);
          setScore(0);
        }}>
          RESET
        </button>

        <button onClick={() => {
          setOn(true);
          setJump(true);
        }}>
          JUMP
        </button>
      </div>
    </div>
  );
}

/* ---------------- TIC TAC TOE ---------------- */

function TicTacToe() {
  const [cells, setCells] = useState(Array(9).fill(''));
  const [turn, setTurn] = useState('X');
  const [winner, setWinner] = useState('');

  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  function play(i) {
    if (cells[i] || winner) return;

    const next = [...cells];
    next[i] = turn;
    setCells(next);

    const line = wins.find(([a, b, c]) =>
      next[a] && next[a] === next[b] && next[b] === next[c]
    );

    if (line) {
      setWinner(turn);
    } else if (next.every(Boolean)) {
      setWinner('DRAW');
    } else {
      setTurn(turn === 'X' ? 'O' : 'X');
    }
  }

  function reset() {
    setCells(Array(9).fill(''));
    setTurn('X');
    setWinner('');
  }

  return (
    <div className="ttt">
      <p>
        {winner
          ? winner === 'DRAW' ? "IT'S A DRAW" : `${winner} WINS`
          : `${turn}'S TURN`}
      </p>

      <div>
        {cells.map((v, i) => (
          <button key={i} onClick={() => play(i)}>
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
