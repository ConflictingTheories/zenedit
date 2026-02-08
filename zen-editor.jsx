// React is loaded via CDN as global variables
const { useState, useEffect, useRef } = React;

// Nature sound configurations with offline-capable data URIs
// Using short audio loops that can be embedded
const NATURE_SCENES = [
  {
    id: 'rain',
    name: 'Rain',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    // Simple rain sound (generated tone)
    audioUrl: null // Will be generated via Web Audio API
  },
  {
    id: 'forest',
    name: 'Forest',
    gradient: 'linear-gradient(135deg, #0f9b0f 0%, #000000 100%)',
    audioUrl: null
  },
  {
    id: 'ocean',
    name: 'Ocean',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    audioUrl: null
  },
  {
    id: 'night',
    name: 'Night',
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
    audioUrl: null
  }
];

// Web Audio API generator for ambient sounds
const generateAmbientAudio = (sceneId) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  const createNoise = () => {
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  };
  
  const noise = audioContext.createBufferSource();
  noise.buffer = createNoise();
  noise.loop = true;
  
  const filter = audioContext.createBiquadFilter();
  
  switch(sceneId) {
    case 'rain':
      filter.type = 'lowpass';
      filter.frequency.value = 1000;
      filter.Q.value = 0.5;
      break;
    case 'ocean':
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      filter.Q.value = 1;
      break;
    case 'forest':
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 0.7;
      break;
    case 'night':
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      filter.Q.value = 0.3;
      break;
    default:
      filter.type = 'lowpass';
      filter.frequency.value = 1000;
  }
  
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0.3;
  
  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  return { noise, gainNode, audioContext };
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

// Nature audio player using Web Audio API
const AudioPlayer = ({ scene, isPlaying, onToggle, volume, onVolumeChange }) => {
  const audioNodesRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioNodesRef.current) {
        const { noise, audioContext } = audioNodesRef.current;
        noise.stop();
        audioContext.close();
        audioNodesRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioNodesRef.current) {
      audioNodesRef.current.gainNode.gain.value = volume * 0.3;
    }
  }, [volume]);

  useEffect(() => {
    // Clean up previous audio
    if (audioNodesRef.current) {
      const { noise, audioContext } = audioNodesRef.current;
      noise.stop();
      audioContext.close();
      audioNodesRef.current = null;
    }

    if (isPlaying) {
      audioNodesRef.current = generateAmbientAudio(scene.id);
      audioNodesRef.current.gainNode.gain.value = volume * 0.3;
      audioNodesRef.current.noise.start();
    }
  }, [isPlaying, scene.id]);

  return (
    <>
      <button 
        className="icon-button" 
        onClick={onToggle}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className="volume-slider"
        title="Volume"
      />
    </>
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

  return (
    <>
      <button 
        className="toolbar-toggle"
        onClick={onToggleVisibility}
        title={isVisible ? 'Hide toolbar' : 'Show toolbar'}
      >
        {isVisible ? '▲' : '▼'}
      </button>
      
      {isVisible && (
        <div className="toolbar">
          <div className="toolbar-group">
            {formatButtons.map(btn => (
              <button
                key={btn.command}
                className="toolbar-button"
                onClick={() => onFormat(btn.command)}
                title={btn.title}
              >
                <span className={btn.command}>{btn.icon}</span>
              </button>
            ))}
          </div>
          
          <div className="toolbar-divider" />
          
          <div className="toolbar-group">
            {headingButtons.map(btn => (
              <button
                key={btn.label}
                className="toolbar-button heading-button"
                onClick={() => onFormat(btn.command, btn.value)}
                title={btn.title}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// Editor component with contentEditable
const Editor = ({ content, onChange }) => {
  const editorRef = useRef(null);
  const [toolbarVisible, setToolbarVisible] = useState(false);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || '';
      editorRef.current.focus();
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

// Main app
const ZenTextEditor = () => {
  const [text, setText] = useState('');
  const [activeScene, setActiveScene] = useState(NATURE_SCENES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);

  // Load saved text
  useEffect(() => {
    const saved = localStorage.getItem('zenText');
    if (saved) setText(saved);
  }, []);

  // Auto-save text
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('zenText', text);
    }, 500);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div className="app">
      <div className="background" style={{ background: activeScene.gradient }} />
      
      <div className="container">
        <header className="header">
          <TimeDisplay />
          <SceneSelector 
            scenes={NATURE_SCENES}
            activeScene={activeScene}
            onSelect={setActiveScene}
          />
        </header>

        <main className="main">
          <div className="editor-container">
            <AudioVisualizer isPlaying={isPlaying} />
            <Editor content={text} onChange={setText} />
          </div>
        </main>

        <footer className="footer">
          <WordCount text={text} />
          <div className="audio-controls">
            <AudioPlayer
              scene={activeScene}
              isPlaying={isPlaying}
              onToggle={() => setIsPlaying(!isPlaying)}
              volume={volume}
              onVolumeChange={setVolume}
            />
          </div>
        </footer>
      </div>
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
