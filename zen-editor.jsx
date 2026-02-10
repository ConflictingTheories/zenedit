// React is loaded via CDN as global variables
const { useState, useEffect, useRef } = React;

// Nature sound configurations
const NATURE_SCENES = [
  {
    id: 'rain',
    name: 'Rain',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'Gentle rain falling'
  },
  {
    id: 'forest',
    name: 'Forest',
    gradient: 'linear-gradient(135deg, #0f9b0f 0%, #000000 100%)',
    description: 'Forest ambiance with birds'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    description: 'Ocean waves on shore'
  },
  {
    id: 'night',
    name: 'Night',
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
    description: 'Night crickets and wind'
  }
];

// Audio context singleton
let audioContext = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// Generate nature sounds using Web Audio API with multiple layers
const createNatureSound = (sceneId, equalizerValues = { low: 50, midLow: 50, mid: 50, midHigh: 50, high: 50 }) => {
  const ctx = getAudioContext();
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);

  const nodes = [];

  switch (sceneId) {
    case 'rain': {
      // Rain: pink noise with filtering
      const noise = createPinkNoise(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      const gain = ctx.createGain();
      gain.gain.value = 0.4 * (equalizerValues.high / 50);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      nodes.push(noise);

      // Occasional thunder rumble (very subtle)
      const rumble = createBrownNoise(ctx);
      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.value = 80;
      const rumbleGain = ctx.createGain();
      rumbleGain.gain.value = 0.02;

      rumble.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(masterGain);
      nodes.push(rumble);
      break;
    }

    case 'ocean': {
      // Ocean: modulated waves
      const waveNoise = createPinkNoise(ctx);
      const waveFilter = ctx.createBiquadFilter();
      waveFilter.type = 'bandpass';
      waveFilter.frequency.value = 400;
      waveFilter.Q.value = 0.5;

      // LFO for wave modulation
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.1; // Very slow waves
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.3;

      lfo.connect(lfoGain);
      lfoGain.connect(waveFilter.frequency);

      const waveGain = ctx.createGain();
      waveGain.gain.value = 0.35 * (equalizerValues.low / 50);

      waveNoise.connect(waveFilter);
      waveFilter.connect(waveGain);
      waveGain.connect(masterGain);
      lfo.start();
      nodes.push(waveNoise, lfo);

      // Shore break sounds
      const shoreNoise = createBrownNoise(ctx);
      const shoreFilter = ctx.createBiquadFilter();
      shoreFilter.type = 'lowpass';
      shoreFilter.frequency.value = 300;
      const shoreGain = ctx.createGain();
      shoreGain.gain.value = 0.15 * (equalizerValues.mid / 50);

      shoreNoise.connect(shoreFilter);
      shoreFilter.connect(shoreGain);
      shoreGain.connect(masterGain);
      nodes.push(shoreNoise);
      break;
    }

    case 'forest': {
      // Forest: mixed layers
      const baseNoise = createPinkNoise(ctx);
      const baseFilter = ctx.createBiquadFilter();
      baseFilter.type = 'lowpass';
      baseFilter.frequency.value = 1000;
      const baseGain = ctx.createGain();
      baseGain.gain.value = 0.2 * (equalizerValues.mid / 50);

      baseNoise.connect(baseFilter);
      baseFilter.connect(baseGain);
      baseGain.connect(masterGain);
      nodes.push(baseNoise);

      // Bird-like chirps (simulated)
      const birdInterval = setInterval(() => {
        if (ctx.state === 'closed') { clearInterval(birdInterval); return; }
        playBirdChirp(ctx, masterGain, equalizerValues);
      }, 2000 + Math.random() * 3000);

      // Wind
      const wind = createPinkNoise(ctx);
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.value = 600;
      windFilter.Q.value = 0.3;
      const windGain = ctx.createGain();
      windGain.gain.value = 0.1 * (equalizerValues.high / 50);

      // Wind LFO
      const windLfo = ctx.createOscillator();
      windLfo.type = 'sine';
      windLfo.frequency.value = 0.2;
      const windLfoGain = ctx.createGain();
      windLfoGain.gain.value = 200;
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);

      wind.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(masterGain);
      windLfo.start();
      nodes.push(wind, windLfo);

      // Store interval for cleanup
      nodes.push({ type: 'interval', value: birdInterval });
      break;
    }

    case 'night': {
      // Night: crickets and gentle wind
      const crickets = createCricketSound(ctx);
      const cricketGain = ctx.createGain();
      cricketGain.gain.value = 0.3 * (equalizerValues.high / 50);
      crickets.connect(cricketGain);
      cricketGain.connect(masterGain);
      nodes.push(crickets);

      // Gentle wind
      const wind = createPinkNoise(ctx);
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.value = 400;
      const windGain = ctx.createGain();
      windGain.gain.value = 0.15 * (equalizerValues.low / 50);

      wind.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(masterGain);
      nodes.push(wind);

      // Occasional owl
      const owlInterval = setInterval(() => {
        if (ctx.state === 'closed') { clearInterval(owlInterval); return; }
        playOwlSound(ctx, masterGain);
      }, 15000 + Math.random() * 20000);
      nodes.push({ type: 'interval', value: owlInterval });
      break;
    }
  }

  return { nodes, masterGain, context: ctx };
};

// Helper: Create pink noise
const createPinkNoise = (ctx) => {
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    output[i] *= 0.11;
    b6 = white * 0.115926;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.start();
  return source;
};

// Helper: Create brown noise
const createBrownNoise = (ctx) => {
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  let lastOut = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.start();
  return source;
};

// Helper: Bird chirp simulation
const playBirdChirp = (ctx, destination, eq) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(2000 + Math.random() * 1000, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(4000 + Math.random() * 1000, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.05 * (eq.midHigh / 50), ctx.currentTime + 0.05);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

  osc.connect(gain);
  gain.connect(destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
};

// Helper: Cricket sound
const createCricketSound = (ctx) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = 4500;

  // Cricket chirp pattern
  const lfo = ctx.createOscillator();
  lfo.type = 'square';
  lfo.frequency.value = 4; // Chirps per second
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 3000;

  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  gain.gain.value = 0.15;

  osc.connect(gain);
  lfo.start();
  return osc;
};

// Helper: Owl sound
const playOwlSound = (ctx, destination) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.3);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.1);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

  osc.connect(gain);
  gain.connect(destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.35);
};

// Audio visualizer component
const AudioVisualizer = ({ isPlaying }) => {
  const bars = 40;

  return (
    <div className="visualizer">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`visualizer-bar ${isPlaying ? 'active' : ''}`}
          style={{
            animationDelay: `${i * 0.05}s`,
            animationDuration: `${0.8 + Math.random() * 0.4}s`
          }}
        />
      ))}
    </div>
  );
};

// Equalizer component with 5 bands
const Equalizer = ({ values, onChange, isVisible }) => {
  const bands = [
    { id: 'low', label: 'Low', color: '#ff6b6b', freq: '60Hz' },
    { id: 'midLow', label: 'Mid-Low', color: '#feca57', freq: '250Hz' },
    { id: 'mid', label: 'Mid', color: '#48dbfb', freq: '1kHz' },
    { id: 'midHigh', label: 'Mid-High', color: '#1dd1a1', freq: '4kHz' },
    { id: 'high', label: 'High', color: '#ff9ff3', freq: '16kHz' }
  ];

  return React.createElement(
    'div',
    { className: `equalizer ${isVisible ? 'visible' : ''}` },
    React.createElement(
      'div',
      { className: 'equalizer-header' },
      React.createElement('span', { className: 'equalizer-title' }, '🎚 Equalizer'),
      React.createElement('span', { className: 'equalizer-label' }, 'Drag sliders to adjust')
    ),
    React.createElement(
      'div',
      { className: 'equalizer-bands' },
      bands.map(band =>
        React.createElement(
          'div',
          { key: band.id, className: 'equalizer-band' },
          React.createElement(
            'div',
            { className: 'eq-slider-container' },
            React.createElement('input', {
              type: 'range',
              min: '0',
              max: '100',
              value: values[band.id],
              onChange: (e) => onChange(band.id, parseInt(e.target.value)),
              className: 'eq-slider',
              style: {
                background: `linear-gradient(to top, ${band.color} ${values[band.id]}%, rgba(255,255,255,0.1) ${values[band.id]}%)`
              }
            })
          ),
          React.createElement(
            'div',
            { className: 'eq-label-group' },
            React.createElement('span', { className: 'eq-band-label' }, band.label),
            React.createElement('span', { className: 'eq-freq-label' }, band.freq)
          )
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'eq-presets' },
      React.createElement('span', { className: 'eq-preset-label' }, 'Presets:'),
      React.createElement('button', { className: 'eq-preset-btn', onClick: () => onChange('preset', 'nature') }, 'Nature'),
      React.createElement('button', { className: 'eq-preset-btn', onClick: () => onChange('preset', 'deep') }, 'Deep'),
      React.createElement('button', { className: 'eq-preset-btn', onClick: () => onChange('preset', 'clear') }, 'Clear')
    )
  );
};

// Music Player controls with scene selection
const MusicPlayer = ({
  isPlaying,
  onPlayPause,
  volume,
  onVolumeChange,
  activeScene,
  onSceneChange,
  equalizerVisible,
  onToggleEqualizer,
  equalizerValues,
  onEqualizerChange
}) => {
  return (
    <div className="music-player">
      <div className="player-main">
        <button
          className={`play-button ${isPlaying ? 'playing' : ''}`}
          onClick={onPlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        <div className="scene-display">
          <span className="scene-icon">
            {activeScene.id === 'rain' ? '🌧' :
              activeScene.id === 'forest' ? '🌲' :
                activeScene.id === 'ocean' ? '🌊' : '🌙'}
          </span>
          <span className="scene-name">{activeScene.name}</span>
        </div>

        <div className="volume-control">
          <span className="volume-icon">🔊</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={(e) => onVolumeChange(parseInt(e.target.value) / 100)}
            className="volume-slider"
          />
          <span className="volume-value">{Math.round(volume * 100)}%</span>
        </div>

        <button
          className={`eq-toggle ${equalizerVisible ? 'active' : ''}`}
          onClick={onToggleEqualizer}
          title="Equalizer"
        >
          🎚
        </button>
      </div>

      <Equalizer
        values={equalizerValues}
        onChange={onEqualizerChange}
        isVisible={equalizerVisible}
      />
    </div>
  );
};

// Time display component
const TimeDisplay = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');

  return (
    <div className="time-display gradient-text">
      {hours}:{minutes}
    </div>
  );
};

// Scene selector
const SceneSelector = ({ scenes, activeScene, onSelect }) => {
  return (
    <div className="scene-tabs">
      {scenes.map(scene => (
        <button
          key={scene.id}
          className={`scene-tab ${activeScene.id === scene.id ? 'active' : ''}`}
          onClick={() => onSelect(scene)}
        >
          {scene.name}
        </button>
      ))}
    </div>
  );
};

// Formatting toolbar component
const FormattingToolbar = ({ onFormat, isVisible, onToggleVisibility }) => {
  const formatButtons = [
    { command: 'bold', icon: 'B', title: 'Bold' },
    { command: 'italic', icon: 'I', title: 'Italic' },
    { command: 'underline', icon: 'U', title: 'Underline' },
    { command: 'strikeThrough', icon: 'S', title: 'Strikethrough' },
  ];

  const headingButtons = [
    { command: 'formatBlock', value: 'h1', label: 'H1', title: 'Heading 1' },
    { command: 'formatBlock', value: 'h2', label: 'H2', title: 'Heading 2' },
    { command: 'formatBlock', value: 'h3', label: 'H3', title: 'Heading 3' },
    { command: 'formatBlock', value: 'p', label: 'P', title: 'Paragraph' },
  ];

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'button',
      {
        className: 'toolbar-toggle',
        onClick: onToggleVisibility,
        title: isVisible ? 'Hide toolbar' : 'Show toolbar'
      },
      isVisible ? '▲' : '▼'
    ),
    isVisible && React.createElement(
      'div',
      { className: 'toolbar' },
      React.createElement(
        'div',
        { className: 'toolbar-group' },
        formatButtons.map(btn =>
          React.createElement(
            'button',
            {
              key: btn.command,
              className: 'toolbar-button',
              onClick: () => onFormat(btn.command),
              title: btn.title
            },
            React.createElement('span', { className: btn.command }, btn.icon)
          )
        )
      ),
      React.createElement('div', { className: 'toolbar-divider' }),
      React.createElement(
        'div',
        { className: 'toolbar-group' },
        headingButtons.map(btn =>
          React.createElement(
            'button',
            {
              key: btn.label,
              className: 'toolbar-button heading-button',
              onClick: () => onFormat(btn.command, btn.value),
              title: btn.title
            },
            btn.label
          )
        )
      )
    )
  );
};

// Editor component with contentEditable
const Editor = ({ content, onChange }) => {
  const editorRef = useRef(null);
  const [toolbarVisible, setToolbarVisible] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      const currentHTML = editorRef.current.innerHTML;
      if (currentHTML !== content) {
        editorRef.current.innerHTML = content || '';
      }
      if (!editorRef.current.innerHTML) {
        editorRef.current.focus();
      }
    }
  }, [content]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            handleFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            handleFormat('italic');
            break;
          case 'u':
            e.preventDefault();
            handleFormat('underline');
            break;
          case 's':
            e.preventDefault();
            handleFormat('strikeThrough');
            break;
          default:
            break;
        }
      }
    };

    if (editorRef.current) {
      editorRef.current.addEventListener('keydown', handleKeyDown);
      return () => editorRef.current.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  return (
    <div className="editor-wrapper">
      <FormattingToolbar
        onFormat={handleFormat}
        isVisible={toolbarVisible}
        onToggleVisibility={() => setToolbarVisible(!toolbarVisible)}
      />
      <div
        ref={editorRef}
        className="editor"
        contentEditable
        onInput={handleInput}
        data-placeholder="Start writing..."
        suppressContentEditableWarning
      />
    </div>
  );
};

// Word count
const WordCount = ({ text }) => {
  const plainText = text.replace(/<[^>]*>/g, '').trim();
  const count = plainText ? plainText.split(/\s+/).length : 0;
  return <span className="word-count">{count} words</span>;
};

// Shader animation component
const ShaderAnimation = ({ sceneId }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 100;
    canvas.height = window.innerHeight;

    let animationFrameId;
    let time = 0;

    const sceneColors = {
      rain: ['#667eea', '#764ba2', '#f093fb'],
      forest: ['#0f9b0f', '#000000', '#1a4d1a'],
      ocean: ['#4facfe', '#00f2fe', '#0099ff'],
      night: ['#2c3e50', '#000000', '#1a1a2e']
    };

    const colors = sceneColors[sceneId] || sceneColors.rain;

    const animate = () => {
      time += 0.005;

      // Clear with semi-transparent background for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw flowing waves/lines
      for (let i = 0; i < 5; i++) {
        const yOffset = (time * 20 + i * 80) % canvas.height;
        const waveHeight = Math.sin(time + i) * 10 + 15;

        ctx.strokeStyle = colors[i % colors.length];
        ctx.globalAlpha = 0.3 + Math.sin(time + i * 0.5) * 0.2;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, yOffset);

        for (let x = 0; x <= canvas.width; x += 10) {
          const y = yOffset + Math.sin(x * 0.05 + time) * waveHeight;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw particles
      ctx.globalAlpha = 0.6;
      for (let i = 0; i < 8; i++) {
        const x = (Math.sin(time * 0.3 + i) + 1) * 25;
        const y = (time * 30 + i * 60) % canvas.height;
        const size = Math.sin(time + i) * 1 + 1.5;

        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [sceneId]);

  return <canvas ref={canvasRef} className="shader-canvas" />;
};

// Main app
const ZenTextEditor = () => {
  const [text, setText] = useState('');
  const [activeScene, setActiveScene] = useState(NATURE_SCENES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [equalizerVisible, setEqualizerVisible] = useState(false);
  const [equalizerValues, setEqualizerValues] = useState({
    low: 50,
    midLow: 50,
    mid: 50,
    midHigh: 50,
    high: 50
  });
  const [pinnedNotes, setPinnedNotes] = useState([]);
  const [collapsedNotes, setCollapsedNotes] = useState({});
  const fileInputRef = React.createRef();

  // Audio ref to store current audio nodes
  const audioRef = useRef(null);

  // Handle audio playback
  useEffect(() => {
    // Clean up previous audio
    if (audioRef.current) {
      const { nodes } = audioRef.current;
      nodes.forEach(node => {
        if (node.type === 'interval') {
          clearInterval(node.value);
        } else if (node.stop) {
          try {
            node.stop();
          } catch (e) {
            // Node might already be stopped
          }
        }
      });
      audioRef.current = null;
    }

    if (isPlaying) {
      const ctx = getAudioContext();
      // Resume context if suspended (required for some browsers)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      // Create new audio regardless of resume status
      audioRef.current = createNatureSound(activeScene.id, equalizerValues);
    }
  }, [isPlaying, activeScene.id, equalizerValues]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.masterGain.gain.value = volume * 0.3;
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        const { nodes } = audioRef.current;
        nodes.forEach(node => {
          if (node.type === 'interval') {
            clearInterval(node.value);
          } else if (node.stop) {
            try {
              node.stop();
            } catch (e) {
              // Node might already be stopped
            }
          }
        });
      }
      // Close the global context
      const ctx = getAudioContext();
      if (ctx.state !== 'closed') {
        ctx.close();
      }
    };
  }, []);

  // Load saved text and pinned notes
  useEffect(() => {
    const saved = localStorage.getItem('zenText');
    if (saved) setText(saved);
    const notes = localStorage.getItem('pinnedNotes');
    if (notes) {
      try {
        setPinnedNotes(JSON.parse(notes));
      } catch (e) {
        console.error('Failed to load pinned notes');
      }
    }

    // Load saved equalizer values
    const savedEq = localStorage.getItem('equalizerValues');
    if (savedEq) {
      try {
        setEqualizerValues(JSON.parse(savedEq));
      } catch (e) { }
    }
  }, []);

  // Auto-save text
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('zenText', text);
    }, 500);
    return () => clearTimeout(timer);
  }, [text]);

  // Auto-save pinned notes
  useEffect(() => {
    localStorage.setItem('pinnedNotes', JSON.stringify(pinnedNotes));
  }, [pinnedNotes]);

  // Pin current text as a note
  const handlePinNote = () => {
    if (!text.trim()) {
      alert('Cannot pin an empty note');
      return;
    }
    const noteTitle = text.split('\n')[0].substring(0, 40) || 'Untitled Note';
    const newNote = {
      id: Date.now(),
      title: noteTitle,
      content: text,
      timestamp: new Date().toLocaleString()
    };
    setPinnedNotes([...pinnedNotes, newNote]);
  };

  // Remove pinned note
  const handleRemoveNote = (id) => {
    setPinnedNotes(pinnedNotes.filter(note => note.id !== id));
  };

  // Load pinned note into editor
  const handleLoadNote = (note) => {
    setText(note.content);
  };

  // Toggle note collapse
  const toggleNoteCollapse = (id) => {
    setCollapsedNotes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S for save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveFile();
      }
      // Ctrl+O or Cmd+O for open/import
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        if (fileInputRef.current) fileInputRef.current.click();
      }
      // Ctrl+N or Cmd+N for new document
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (text && !confirm('Clear current document? This action cannot be undone.')) return;
        setText('');
      }
      // Ctrl+P or Cmd+P for pin note
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePinNote();
      }
      // Space for play/pause when not typing in editor
      if (e.key === ' ' && !e.target.matches('input, textarea, [contenteditable]')) {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text, isPlaying]);

  // Save file to disk
  const handleSaveFile = () => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `zen-document-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Import file
  const handleImportFile = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target && e.target.result;
      if (typeof content === 'string') {
        setText(content);
      }
    };
    reader.readAsText(file);
  };

  // Handle equalizer changes
  const handleEqualizerChange = (band, value) => {
    if (band === 'preset') {
      const presets = {
        nature: { low: 70, midLow: 60, mid: 50, midHigh: 40, high: 30 },
        deep: { low: 100, midLow: 80, mid: 40, midHigh: 20, high: 10 },
        clear: { low: 50, midLow: 50, mid: 50, midHigh: 50, high: 50 }
      };
      setEqualizerValues(presets[value] || presets.clear);
    } else {
      setEqualizerValues(prev => ({
        ...prev,
        [band]: value
      }));
    }
  };

  return (
    <div className="app">
      <div className="background" style={{ background: activeScene.gradient }} />
      <canvas className="shader-canvas"></canvas>

      <div className="container">
        <header className="header">
          <TimeDisplay />
          <SceneSelector
            scenes={NATURE_SCENES}
            activeScene={activeScene}
            onSelect={setActiveScene}
          />
          <div className="file-controls">
            <button className="icon-button" onClick={handleSaveFile} title="Save (Ctrl+S)">💾</button>
            <button className="icon-button" onClick={() => { if (fileInputRef.current) fileInputRef.current.click(); }} title="Open (Ctrl+O)">📂</button>
            <button className="icon-button" onClick={() => { if (text && !confirm('Clear current document?')) return; setText(''); }} title="New (Ctrl+N)">📄</button>
            <button className="icon-button" onClick={handlePinNote} title="Pin Note (Ctrl+P)">📌</button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.rtf,.text,.document,*"
            onChange={handleImportFile}
            style={{ display: 'none' }}
          />
        </header>

        <main className="main">
          <div className="pinned-sidebar">
            <div className="pinned-header">
              <h3>📌 Quick Notes</h3>
              <span className="note-count">{pinnedNotes.length}</span>
            </div>
            <div className="pinned-list">
              {pinnedNotes.map(note => (
                <div key={note.id} className="pinned-note">
                  <div className="note-header" onClick={() => toggleNoteCollapse(note.id)}>
                    <span className="note-toggle">{collapsedNotes[note.id] ? '▶' : '▼'}</span>
                    <span className="note-title">{note.title}</span>
                    <button
                      className="note-delete"
                      onClick={(e) => { e.stopPropagation(); handleRemoveNote(note.id); }}
                    >×</button>
                  </div>
                  {!collapsedNotes[note.id] && (
                    <div className="note-content">
                      <p className="note-time">{note.timestamp}</p>
                      <div className="note-text">{note.content.substring(0, 150)}...</div>
                      <button
                        className="note-load-btn"
                        onClick={() => handleLoadNote(note)}
                      >Load</button>
                    </div>
                  )}
                </div>
              ))}
              {pinnedNotes.length === 0 && (
                <div className="no-notes">No pinned notes yet. Press Ctrl+P to pin.</div>
              )}
            </div>
          </div>

          <div className="editor-container">
            <AudioVisualizer isPlaying={isPlaying} />
            <Editor content={text} onChange={setText} />
          </div>
        </main>

        <footer className="footer">
          <WordCount text={text} />
          <MusicPlayer
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            volume={volume}
            onVolumeChange={setVolume}
            activeScene={activeScene}
            onSceneChange={setActiveScene}
            equalizerVisible={equalizerVisible}
            onToggleEqualizer={() => setEqualizerVisible(!equalizerVisible)}
            equalizerValues={equalizerValues}
            onEqualizerChange={handleEqualizerChange}
          />
        </footer>
      </div>

      {/* Shader Animation */}
      <ShaderAnimation sceneId={activeScene.id} />
    </div>
  );
};

// Styles
const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    overflow: hidden;
  }

  .app {
    width: 100vw;
    height: 100vh;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: background 1s ease;
    z-index: 0;
  }

  .container {
    position: relative;
    z-index: 1;
    width: 90%;
    max-width: 900px;
    height: 85vh;
    display: flex;
    flex-direction: column;
    background: rgba(30, 30, 40, 0.85);
    backdrop-filter: blur(40px);
    border-radius: 8px;
    box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: rgba(20, 20, 28, 0.6);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    gap: 10px;
  }

  .file-controls {
    display: flex;
    gap: 8px;
  }

  .icon-button {
    background: rgba(102, 126, 234, 0.2);
    border: 1px solid rgba(102, 126, 234, 0.4);
    color: rgba(255, 255, 255, 0.8);
    padding: 6px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;
  }

  .icon-button:hover {
    background: rgba(102, 126, 234, 0.4);
    border-color: rgba(102, 126, 234, 0.8);
    color: rgba(255, 255, 255, 1);
  }

  .time-display {
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 0.5px;
  }

  .gradient-text {
    background: linear-gradient(
      90deg,
      #667eea,
      #764ba2,
      #f093fb,
      #4facfe,
      #667eea
    );
    background-size: 200% auto;
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    animation: gradient-shift 8s ease infinite;
  }

  @keyframes gradient-shift {
    0%, 100% {
      background-position: 0% center;
    }
    50% {
      background-position: 100% center;
    }
  }

  .scene-tabs {
    display: flex;
    gap: 4px;
  }

  .scene-tab {
    padding: 4px 12px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .scene-tab:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.05);
  }

  .scene-tab.active {
    color: rgba(255, 255, 255, 0.95);
    background: rgba(255, 255, 255, 0.1);
  }

  .main {
    flex: 1;
    overflow: hidden;
    display: flex;
    position: relative;
    gap: 0;
  }

  .pinned-sidebar {
    width: 250px;
    background: rgba(20, 20, 28, 0.7);
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pinned-header {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
  }

  .pinned-header h3 {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
  }

  .note-count {
    background: rgba(102, 126, 234, 0.3);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
  }

  .pinned-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .pinned-note {
    background: rgba(102, 126, 234, 0.1);
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: 6px;
    margin-bottom: 8px;
    overflow: hidden;
  }

  .note-header {
    padding: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    user-select: none;
    transition: background 0.2s;
  }

  .note-header:hover {
    background: rgba(102, 126, 234, 0.15);
  }

  .note-toggle {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    min-width: 10px;
  }

  .note-title {
    flex: 1;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .note-delete {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    font-size: 16px;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .note-delete:hover {
    color: rgba(255, 100, 100, 0.8);
  }

  .note-content {
    padding: 10px;
    border-top: 1px solid rgba(102, 126, 234, 0.1);
    background: rgba(0, 0, 0, 0.2);
  }

  .note-time {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
    margin: 0 0 8px 0;
  }

  .note-text {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 8px;
    line-height: 1.4;
    max-height: 60px;
    overflow: hidden;
  }

  .note-load-btn {
    width: 100%;
    padding: 6px;
    background: rgba(102, 126, 234, 0.3);
    border: 1px solid rgba(102, 126, 234, 0.5);
    color: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    transition: all 0.2s;
  }

  .note-load-btn:hover {
    background: rgba(102, 126, 234, 0.5);
    border-color: rgba(102, 126, 234, 0.8);
  }

  .no-notes {
    padding: 16px;
    text-align: center;
    color: rgba(255, 255, 255, 0.3);
    font-size: 12px;
  }

  .shader-canvas {
    position: fixed;
    right: 0;
    top: 0;
    width: 100px;
    height: 100vh;
    opacity: 0.15;
    pointer-events: none;
    z-index: 0;
  }

  .editor-container {
    flex: 1;
    display: flex;
    position: relative;
    flex-direction: column;
  }

  .visualizer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    padding: 8px;
    pointer-events: none;
    z-index: 0;
  }

  .visualizer-bar {
    width: 2%;
    min-width: 2px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 2px;
    height: 4px;
    transition: all 0.3s ease;
  }

  .visualizer-bar.active {
    animation: pulse-bar linear infinite;
  }

  @keyframes pulse-bar {
    0%, 100% {
      height: 4px;
      opacity: 0.3;
    }
    50% {
      height: 20px;
      opacity: 0.6;
    }
  }

  .editor-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
  }

  .toolbar-toggle {
    position: absolute;
    top: 8px;
    right: 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 10px;
    transition: all 0.2s;
    z-index: 10;
  }

  .toolbar-toggle:hover {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
  }

  .toolbar {
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(20, 20, 28, 0.7);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    align-items: center;
  }

  .toolbar-group {
    display: flex;
    gap: 4px;
  }

  .toolbar-divider {
    width: 1px;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
  }

  .toolbar-button {
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.7);
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
    min-width: 32px;
  }

  .toolbar-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.95);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .toolbar-button .bold {
    font-weight: bold;
  }

  .toolbar-button .italic {
    font-style: italic;
  }

  .toolbar-button .underline {
    text-decoration: underline;
  }

  .toolbar-button .strikeThrough {
    text-decoration: line-through;
  }

  .toolbar-button.heading-button {
    font-weight: 600;
    font-size: 11px;
  }

  .editor {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 30px 40px;
    color: rgba(255, 255, 255, 0.92);
    font-size: 16px;
    line-height: 1.7;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    overflow-y: auto;
    caret-color: rgba(255, 255, 255, 0.9);
  }

  .editor:empty:before {
    content: attr(data-placeholder);
    color: rgba(255, 255, 255, 0.25);
    pointer-events: none;
  }

  .editor h1 {
    font-size: 2em;
    margin: 0.67em 0;
    font-weight: bold;
  }

  .editor h2 {
    font-size: 1.5em;
    margin: 0.75em 0;
    font-weight: bold;
  }

  .editor h3 {
    font-size: 1.17em;
    margin: 0.83em 0;
    font-weight: bold;
  }

  .editor p {
    margin: 1em 0;
  }

  .editor::selection,
  .editor *::selection {
    background: rgba(255, 255, 255, 0.2);
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background: rgba(20, 20, 28, 0.6);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .word-count {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    font-weight: 300;
  }

  .audio-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .icon-button {
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    transition: all 0.2s;
  }

  .icon-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }

  .icon-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .volume-slider {
    width: 70px;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
    -webkit-appearance: none;
  }

  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 10px;
    height: 10px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;
  }

  .volume-slider::-webkit-slider-thumb:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.2);
  }

  .volume-slider::-moz-range-thumb {
    width: 10px;
    height: 10px;
    background: rgba(255, 255, 255, 0.8);
    border: none;
    border-radius: 50%;
    cursor: pointer;
  }

  /* Music Player Styles */
  .music-player {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .player-main {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(20, 20, 28, 0.8);
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .play-button {
    width: 32px;
    height: 32px;
    background: rgba(102, 126, 234, 0.3);
    border: 1px solid rgba(102, 126, 234, 0.5);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .play-button:hover {
    background: rgba(102, 126, 234, 0.5);
    border-color: rgba(102, 126, 234, 0.8);
    transform: scale(1.05);
  }

  .play-button.playing {
    background: rgba(255, 100, 100, 0.3);
    border-color: rgba(255, 100, 100, 0.5);
  }

  .play-button.playing:hover {
    background: rgba(255, 100, 100, 0.5);
    border-color: rgba(255, 100, 100, 0.8);
  }

  .scene-display {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 80px;
  }

  .scene-icon {
    font-size: 16px;
  }

  .scene-name {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
  }

  .volume-control {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .volume-icon {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  .volume-value {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.6);
    min-width: 30px;
    text-align: right;
  }

  .eq-toggle {
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.2s;
  }

  .eq-toggle:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }

  .eq-toggle.active {
    background: rgba(102, 126, 234, 0.3);
    border-color: rgba(102, 126, 234, 0.5);
    color: rgba(255, 255, 255, 0.95);
  }

  /* Equalizer Styles */
  .equalizer {
    width: 280px;
    background: rgba(20, 20, 28, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    pointer-events: none;
  }

  .equalizer.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .equalizer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .equalizer-title {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
  }

  .equalizer-label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
  }

  .equalizer-bands {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .equalizer-band {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .eq-slider-container {
    width: 100%;
    height: 80px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 4px;
  }

  .eq-slider {
    width: 6px;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    outline: none;
    cursor: pointer;
    -webkit-appearance: none;
    writing-mode: bt-lr;
  }

  .eq-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: currentColor;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid rgba(20, 20, 28, 0.9);
  }

  .eq-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: currentColor;
    border: none;
    border-radius: 50%;
    cursor: pointer;
  }

  .eq-label-group {
    text-align: center;
  }

  .eq-band-label {
    font-size: 9px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
  }

  .eq-freq-label {
    font-size: 8px;
    color: rgba(255, 255, 255, 0.4);
    margin-top: 1px;
  }

  .eq-presets {
    display: flex;
    gap: 6px;
    justify-content: center;
  }

  .eq-preset-btn {
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    border-radius: 4px;
    cursor: pointer;
    font-size: 10px;
    transition: all 0.2s;
  }

  .eq-preset-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }

  @media (max-width: 768px) {
    .container {
      width: 95%;
      height: 90vh;
    }

    .editor {
      padding: 20px;
      font-size: 15px;
    }

    .time-display {
      font-size: 13px;
    }

    .footer {
      flex-direction: column;
      gap: 8px;
      padding: 12px 20px;
    }

    .toolbar {
      flex-wrap: wrap;
    }
  }

  @media (max-height: 600px) {
    .container {
      height: 95vh;
    }

    .editor {
      padding: 20px 30px;
    }
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Make component globally available for script tag usage
window.ZenTextEditor = ZenTextEditor;
