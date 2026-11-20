
/* ---------------- ASCII VIEWER ---------------- */

function Output({ item }) {
  const [ascii, setAscii] = useState('');
  const [view, setView] = useState('ascii');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [imageRatio, setImageRatio] = useState(1);

  // Get original image dimensions to determine viewer shape
  useEffect(() => {
    const img = new Image();

    img.onload = () => {
      setImageRatio(img.naturalWidth / img.naturalHeight);
    };

    img.src = item.image;
  }, [item.image]);

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
                height: `min(75vh, ${Math.max(
                  350,
                  Math.min(750, window.innerWidth / imageRatio)
                )}px)`,
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
