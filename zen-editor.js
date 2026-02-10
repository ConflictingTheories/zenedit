// React is loaded via CDN as global variables
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _React = React;
var useState = _React.useState;
var useEffect = _React.useEffect;
var useRef = _React.useRef;

// Nature sound configurations
var NATURE_SCENES = [{
  id: 'rain',
  name: 'Rain',
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  description: 'Gentle rain falling'
}, {
  id: 'forest',
  name: 'Forest',
  gradient: 'linear-gradient(135deg, #0f9b0f 0%, #000000 100%)',
  description: 'Forest ambiance with birds'
}, {
  id: 'ocean',
  name: 'Ocean',
  gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  description: 'Ocean waves on shore'
}, {
  id: 'night',
  name: 'Night',
  gradient: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
  description: 'Night crickets and wind'
}];

// Audio context singleton
var audioContext = null;

var getAudioContext = function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// Generate nature sounds using Web Audio API with multiple layers
var createNatureSound = function createNatureSound(sceneId) {
  var equalizerValues = arguments.length <= 1 || arguments[1] === undefined ? { low: 50, midLow: 50, mid: 50, midHigh: 50, high: 50 } : arguments[1];

  var ctx = getAudioContext();
  var masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);

  var nodes = [];

  switch (sceneId) {
    case 'rain':
      {
        // Rain: pink noise with filtering
        var noise = createPinkNoise(ctx);
        var filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        var gain = ctx.createGain();
        gain.gain.value = 0.4 * (equalizerValues.high / 50);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        nodes.push(noise);

        // Occasional thunder rumble (very subtle)
        var rumble = createBrownNoise(ctx);
        var rumbleFilter = ctx.createBiquadFilter();
        rumbleFilter.type = 'lowpass';
        rumbleFilter.frequency.value = 80;
        var rumbleGain = ctx.createGain();
        rumbleGain.gain.value = 0.02;

        rumble.connect(rumbleFilter);
        rumbleFilter.connect(rumbleGain);
        rumbleGain.connect(masterGain);
        nodes.push(rumble);
        break;
      }

    case 'ocean':
      {
        // Ocean: modulated waves
        var waveNoise = createPinkNoise(ctx);
        var waveFilter = ctx.createBiquadFilter();
        waveFilter.type = 'bandpass';
        waveFilter.frequency.value = 400;
        waveFilter.Q.value = 0.5;

        // LFO for wave modulation
        var lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // Very slow waves
        var lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.3;

        lfo.connect(lfoGain);
        lfoGain.connect(waveFilter.frequency);

        var waveGain = ctx.createGain();
        waveGain.gain.value = 0.35 * (equalizerValues.low / 50);

        waveNoise.connect(waveFilter);
        waveFilter.connect(waveGain);
        waveGain.connect(masterGain);
        lfo.start();
        nodes.push(waveNoise, lfo);

        // Shore break sounds
        var shoreNoise = createBrownNoise(ctx);
        var shoreFilter = ctx.createBiquadFilter();
        shoreFilter.type = 'lowpass';
        shoreFilter.frequency.value = 300;
        var shoreGain = ctx.createGain();
        shoreGain.gain.value = 0.15 * (equalizerValues.mid / 50);

        shoreNoise.connect(shoreFilter);
        shoreFilter.connect(shoreGain);
        shoreGain.connect(masterGain);
        nodes.push(shoreNoise);
        break;
      }

    case 'forest':
      {
        var _ret = (function () {
          // Forest: mixed layers
          var baseNoise = createPinkNoise(ctx);
          var baseFilter = ctx.createBiquadFilter();
          baseFilter.type = 'lowpass';
          baseFilter.frequency.value = 1000;
          var baseGain = ctx.createGain();
          baseGain.gain.value = 0.2 * (equalizerValues.mid / 50);

          baseNoise.connect(baseFilter);
          baseFilter.connect(baseGain);
          baseGain.connect(masterGain);
          nodes.push(baseNoise);

          // Bird-like chirps (simulated)
          var birdInterval = setInterval(function () {
            if (ctx.state === 'closed') {
              clearInterval(birdInterval);return;
            }
            playBirdChirp(ctx, masterGain, equalizerValues);
          }, 2000 + Math.random() * 3000);

          // Wind
          var wind = createPinkNoise(ctx);
          var windFilter = ctx.createBiquadFilter();
          windFilter.type = 'bandpass';
          windFilter.frequency.value = 600;
          windFilter.Q.value = 0.3;
          var windGain = ctx.createGain();
          windGain.gain.value = 0.1 * (equalizerValues.high / 50);

          // Wind LFO
          var windLfo = ctx.createOscillator();
          windLfo.type = 'sine';
          windLfo.frequency.value = 0.2;
          var windLfoGain = ctx.createGain();
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
          return 'break';
        })();

        if (_ret === 'break') break;
      }

    case 'night':
      {
        var _ret2 = (function () {
          // Night: crickets and gentle wind
          var crickets = createCricketSound(ctx);
          var cricketGain = ctx.createGain();
          cricketGain.gain.value = 0.3 * (equalizerValues.high / 50);
          crickets.connect(cricketGain);
          cricketGain.connect(masterGain);
          nodes.push(crickets);

          // Gentle wind
          var wind = createPinkNoise(ctx);
          var windFilter = ctx.createBiquadFilter();
          windFilter.type = 'lowpass';
          windFilter.frequency.value = 400;
          var windGain = ctx.createGain();
          windGain.gain.value = 0.15 * (equalizerValues.low / 50);

          wind.connect(windFilter);
          windFilter.connect(windGain);
          windGain.connect(masterGain);
          nodes.push(wind);

          // Occasional owl
          var owlInterval = setInterval(function () {
            if (ctx.state === 'closed') {
              clearInterval(owlInterval);return;
            }
            playOwlSound(ctx, masterGain);
          }, 15000 + Math.random() * 20000);
          nodes.push({ type: 'interval', value: owlInterval });
          return 'break';
        })();

        if (_ret2 === 'break') break;
      }
  }

  return { nodes: nodes, masterGain: masterGain, context: ctx };
};

// Helper: Create pink noise
var createPinkNoise = function createPinkNoise(ctx) {
  var bufferSize = ctx.sampleRate * 4;
  var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  var output = buffer.getChannelData(0);
  var b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;

  for (var i = 0; i < bufferSize; i++) {
    var white = Math.random() * 2 - 1;
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

  var source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.start();
  return source;
};

// Helper: Create brown noise
var createBrownNoise = function createBrownNoise(ctx) {
  var bufferSize = ctx.sampleRate * 4;
  var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  var output = buffer.getChannelData(0);
  var lastOut = 0;

  for (var i = 0; i < bufferSize; i++) {
    var white = Math.random() * 2 - 1;
    output[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5;
  }

  var source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.start();
  return source;
};

// Helper: Bird chirp simulation
var playBirdChirp = function playBirdChirp(ctx, destination, eq) {
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();

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
var createCricketSound = function createCricketSound(ctx) {
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = 4500;

  // Cricket chirp pattern
  var lfo = ctx.createOscillator();
  lfo.type = 'square';
  lfo.frequency.value = 4; // Chirps per second
  var lfoGain = ctx.createGain();
  lfoGain.gain.value = 3000;

  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  gain.gain.value = 0.15;

  osc.connect(gain);
  lfo.start();
  return osc;
};

// Helper: Owl sound
var playOwlSound = function playOwlSound(ctx, destination) {
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();

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
var AudioVisualizer = function AudioVisualizer(_ref) {
  var isPlaying = _ref.isPlaying;

  var bars = 40;

  return React.createElement(
    'div',
    { className: 'visualizer' },
    Array.from({ length: bars }).map(function (_, i) {
      return React.createElement('div', {
        key: i,
        className: 'visualizer-bar ' + (isPlaying ? 'active' : ''),
        style: {
          animationDelay: i * 0.05 + 's',
          animationDuration: 0.8 + Math.random() * 0.4 + 's'
        }
      });
    })
  );
};

// Equalizer component with 5 bands
var Equalizer = function Equalizer(_ref2) {
  var values = _ref2.values;
  var _onChange = _ref2.onChange;
  var isVisible = _ref2.isVisible;

  var bands = [{ id: 'low', label: 'Low', color: '#ff6b6b', freq: '60Hz' }, { id: 'midLow', label: 'Mid-Low', color: '#feca57', freq: '250Hz' }, { id: 'mid', label: 'Mid', color: '#48dbfb', freq: '1kHz' }, { id: 'midHigh', label: 'Mid-High', color: '#1dd1a1', freq: '4kHz' }, { id: 'high', label: 'High', color: '#ff9ff3', freq: '16kHz' }];

  return React.createElement('div', { className: 'equalizer ' + (isVisible ? 'visible' : '') }, React.createElement('div', { className: 'equalizer-header' }, React.createElement('span', { className: 'equalizer-title' }, '🎚 Equalizer'), React.createElement('span', { className: 'equalizer-label' }, 'Drag sliders to adjust')), React.createElement('div', { className: 'equalizer-bands' }, bands.map(function (band) {
    return React.createElement('div', { key: band.id, className: 'equalizer-band' }, React.createElement('div', { className: 'eq-slider-container' }, React.createElement('input', {
      type: 'range',
      min: '0',
      max: '100',
      value: values[band.id],
      onChange: function onChange(e) {
        return _onChange(band.id, parseInt(e.target.value));
      },
      className: 'eq-slider',
      style: {
        background: 'linear-gradient(to top, ' + band.color + ' ' + values[band.id] + '%, rgba(255,255,255,0.1) ' + values[band.id] + '%)'
      }
    })), React.createElement('div', { className: 'eq-label-group' }, React.createElement('span', { className: 'eq-band-label' }, band.label), React.createElement('span', { className: 'eq-freq-label' }, band.freq)));
  })), React.createElement('div', { className: 'eq-presets' }, React.createElement('span', { className: 'eq-preset-label' }, 'Presets:'), React.createElement('button', { className: 'eq-preset-btn', onClick: function onClick() {
      return _onChange('preset', 'nature');
    } }, 'Nature'), React.createElement('button', { className: 'eq-preset-btn', onClick: function onClick() {
      return _onChange('preset', 'deep');
    } }, 'Deep'), React.createElement('button', { className: 'eq-preset-btn', onClick: function onClick() {
      return _onChange('preset', 'clear');
    } }, 'Clear')));
};

// Music Player controls with scene selection
var MusicPlayer = function MusicPlayer(_ref3) {
  var isPlaying = _ref3.isPlaying;
  var onPlayPause = _ref3.onPlayPause;
  var volume = _ref3.volume;
  var onVolumeChange = _ref3.onVolumeChange;
  var activeScene = _ref3.activeScene;
  var onSceneChange = _ref3.onSceneChange;
  var equalizerVisible = _ref3.equalizerVisible;
  var onToggleEqualizer = _ref3.onToggleEqualizer;
  var equalizerValues = _ref3.equalizerValues;
  var onEqualizerChange = _ref3.onEqualizerChange;

  return React.createElement(
    'div',
    { className: 'music-player' },
    React.createElement(
      'div',
      { className: 'player-main' },
      React.createElement(
        'button',
        {
          className: 'play-button ' + (isPlaying ? 'playing' : ''),
          onClick: onPlayPause,
          title: isPlaying ? 'Pause' : 'Play'
        },
        isPlaying ? React.createElement(
          'svg',
          { viewBox: '0 0 24 24', width: '20', height: '20', fill: 'currentColor' },
          React.createElement('rect', { x: '6', y: '4', width: '4', height: '16', rx: '1' }),
          React.createElement('rect', { x: '14', y: '4', width: '4', height: '16', rx: '1' })
        ) : React.createElement(
          'svg',
          { viewBox: '0 0 24 24', width: '20', height: '20', fill: 'currentColor' },
          React.createElement('polygon', { points: '5,3 19,12 5,21' })
        )
      ),
      React.createElement(
        'div',
        { className: 'scene-display' },
        React.createElement(
          'span',
          { className: 'scene-icon' },
          activeScene.id === 'rain' ? '🌧' : activeScene.id === 'forest' ? '🌲' : activeScene.id === 'ocean' ? '🌊' : '🌙'
        ),
        React.createElement(
          'span',
          { className: 'scene-name' },
          activeScene.name
        )
      ),
      React.createElement(
        'div',
        { className: 'volume-control' },
        React.createElement(
          'span',
          { className: 'volume-icon' },
          '🔊'
        ),
        React.createElement('input', {
          type: 'range',
          min: '0',
          max: '100',
          value: volume * 100,
          onChange: function (e) {
            return onVolumeChange(parseInt(e.target.value) / 100);
          },
          className: 'volume-slider'
        }),
        React.createElement(
          'span',
          { className: 'volume-value' },
          Math.round(volume * 100),
          '%'
        )
      ),
      React.createElement(
        'button',
        {
          className: 'eq-toggle ' + (equalizerVisible ? 'active' : ''),
          onClick: onToggleEqualizer,
          title: 'Equalizer'
        },
        '🎚'
      )
    ),
    React.createElement(Equalizer, {
      values: equalizerValues,
      onChange: onEqualizerChange,
      isVisible: equalizerVisible
    })
  );
};

// Time display component
var TimeDisplay = function TimeDisplay() {
  var _useState = useState(new Date());

  var _useState2 = _slicedToArray(_useState, 2);

  var time = _useState2[0];
  var setTime = _useState2[1];

  useEffect(function () {
    var timer = setInterval(function () {
      return setTime(new Date());
    }, 1000);
    return function () {
      return clearInterval(timer);
    };
  }, []);

  var hours = time.getHours().toString().padStart(2, '0');
  var minutes = time.getMinutes().toString().padStart(2, '0');

  return React.createElement(
    'div',
    { className: 'time-display gradient-text' },
    hours,
    ':',
    minutes
  );
};

// Scene selector
var SceneSelector = function SceneSelector(_ref4) {
  var scenes = _ref4.scenes;
  var activeScene = _ref4.activeScene;
  var onSelect = _ref4.onSelect;

  return React.createElement(
    'div',
    { className: 'scene-tabs' },
    scenes.map(function (scene) {
      return React.createElement(
        'button',
        {
          key: scene.id,
          className: 'scene-tab ' + (activeScene.id === scene.id ? 'active' : ''),
          onClick: function () {
            return onSelect(scene);
          }
        },
        scene.name
      );
    })
  );
};

// Formatting toolbar component
var FormattingToolbar = function FormattingToolbar(_ref5) {
  var onFormat = _ref5.onFormat;
  var isVisible = _ref5.isVisible;
  var onToggleVisibility = _ref5.onToggleVisibility;

  var formatButtons = [{ command: 'bold', icon: 'B', title: 'Bold' }, { command: 'italic', icon: 'I', title: 'Italic' }, { command: 'underline', icon: 'U', title: 'Underline' }, { command: 'strikeThrough', icon: 'S', title: 'Strikethrough' }];

  var headingButtons = [{ command: 'formatBlock', value: 'h1', label: 'H1', title: 'Heading 1' }, { command: 'formatBlock', value: 'h2', label: 'H2', title: 'Heading 2' }, { command: 'formatBlock', value: 'h3', label: 'H3', title: 'Heading 3' }, { command: 'formatBlock', value: 'p', label: 'P', title: 'Paragraph' }];

  return React.createElement(React.Fragment, null, React.createElement('button', {
    className: 'toolbar-toggle',
    onClick: onToggleVisibility,
    title: isVisible ? 'Hide toolbar' : 'Show toolbar'
  }, isVisible ? '▲' : '▼'), isVisible && React.createElement('div', { className: 'toolbar' }, React.createElement('div', { className: 'toolbar-group' }, formatButtons.map(function (btn) {
    return React.createElement('button', {
      key: btn.command,
      className: 'toolbar-button',
      onClick: function onClick() {
        return onFormat(btn.command);
      },
      title: btn.title
    }, React.createElement('span', { className: btn.command }, btn.icon));
  })), React.createElement('div', { className: 'toolbar-divider' }), React.createElement('div', { className: 'toolbar-group' }, headingButtons.map(function (btn) {
    return React.createElement('button', {
      key: btn.label,
      className: 'toolbar-button heading-button',
      onClick: function onClick() {
        return onFormat(btn.command, btn.value);
      },
      title: btn.title
    }, btn.label);
  }))));
};

// Editor component with contentEditable
var Editor = function Editor(_ref6) {
  var content = _ref6.content;
  var onChange = _ref6.onChange;

  var editorRef = useRef(null);

  var _useState3 = useState(false);

  var _useState32 = _slicedToArray(_useState3, 2);

  var toolbarVisible = _useState32[0];
  var setToolbarVisible = _useState32[1];

  useEffect(function () {
    if (editorRef.current) {
      // Convert plain text with newlines to HTML with <br> tags
      var htmlContent = content.split('\n').map(function (line) {
        return line || '<br>';
      }).join('<br>');
      editorRef.current.innerHTML = htmlContent || '';
      editorRef.current.focus();
    }
  }, [content]);

  var handleInput = function handleInput() {
    if (editorRef.current) {
      // Convert <br> tags back to newlines when saving
      var html = editorRef.current.innerHTML;
      var plainText = html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
      onChange(plainText);
    }
  };

  var handleFormat = function handleFormat(command) {
    var value = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  return React.createElement(
    'div',
    { className: 'editor-wrapper' },
    React.createElement(FormattingToolbar, {
      onFormat: handleFormat,
      isVisible: toolbarVisible,
      onToggleVisibility: function () {
        return setToolbarVisible(!toolbarVisible);
      }
    }),
    React.createElement('div', {
      ref: editorRef,
      className: 'editor',
      contentEditable: true,
      onInput: handleInput,
      'data-placeholder': 'Start writing...',
      suppressContentEditableWarning: true
    })
  );
};

// Word count
var WordCount = function WordCount(_ref7) {
  var text = _ref7.text;

  var plainText = text.replace(/<[^>]*>/g, '').trim();
  var count = plainText ? plainText.split(/\s+/).length : 0;
  return React.createElement(
    'span',
    { className: 'word-count' },
    count,
    ' words'
  );
};

// Shader animation component
var ShaderAnimation = function ShaderAnimation(_ref8) {
  var sceneId = _ref8.sceneId;

  var canvasRef = useRef(null);

  useEffect(function () {
    var canvas = canvasRef.current;
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 100;
    canvas.height = window.innerHeight;

    var animationFrameId = undefined;
    var time = 0;

    var sceneColors = {
      rain: ['#667eea', '#764ba2', '#f093fb'],
      forest: ['#0f9b0f', '#000000', '#1a4d1a'],
      ocean: ['#4facfe', '#00f2fe', '#0099ff'],
      night: ['#2c3e50', '#000000', '#1a1a2e']
    };

    var colors = sceneColors[sceneId] || sceneColors.rain;

    var animate = function animate() {
      time += 0.005;

      // Clear with semi-transparent background for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw flowing waves/lines
      for (var i = 0; i < 5; i++) {
        var yOffset = (time * 20 + i * 80) % canvas.height;
        var waveHeight = Math.sin(time + i) * 10 + 15;

        ctx.strokeStyle = colors[i % colors.length];
        ctx.globalAlpha = 0.3 + Math.sin(time + i * 0.5) * 0.2;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, yOffset);

        for (var x = 0; x <= canvas.width; x += 10) {
          var y = yOffset + Math.sin(x * 0.05 + time) * waveHeight;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw particles
      ctx.globalAlpha = 0.6;
      for (var i = 0; i < 8; i++) {
        var x = (Math.sin(time * 0.3 + i) + 1) * 25;
        var y = (time * 30 + i * 60) % canvas.height;
        var size = Math.sin(time + i) * 1 + 1.5;

        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return function () {
      return cancelAnimationFrame(animationFrameId);
    };
  }, [sceneId]);

  return React.createElement('canvas', { ref: canvasRef, className: 'shader-canvas' });
};

// Main app
var ZenTextEditor = function ZenTextEditor() {
  var _useState4 = useState('');

  var _useState42 = _slicedToArray(_useState4, 2);

  var text = _useState42[0];
  var setText = _useState42[1];

  var _useState5 = useState(NATURE_SCENES[0]);

  var _useState52 = _slicedToArray(_useState5, 2);

  var activeScene = _useState52[0];
  var setActiveScene = _useState52[1];

  var _useState6 = useState(false);

  var _useState62 = _slicedToArray(_useState6, 2);

  var isPlaying = _useState62[0];
  var setIsPlaying = _useState62[1];

  var _useState7 = useState(0.5);

  var _useState72 = _slicedToArray(_useState7, 2);

  var volume = _useState72[0];
  var setVolume = _useState72[1];

  var _useState8 = useState(false);

  var _useState82 = _slicedToArray(_useState8, 2);

  var equalizerVisible = _useState82[0];
  var setEqualizerVisible = _useState82[1];

  var _useState9 = useState({
    low: 50,
    midLow: 50,
    mid: 50,
    midHigh: 50,
    high: 50
  });

  var _useState92 = _slicedToArray(_useState9, 2);

  var equalizerValues = _useState92[0];
  var setEqualizerValues = _useState92[1];

  var _useState10 = useState([]);

  var _useState102 = _slicedToArray(_useState10, 2);

  var pinnedNotes = _useState102[0];
  var setPinnedNotes = _useState102[1];

  var _useState11 = useState({});

  var _useState112 = _slicedToArray(_useState11, 2);

  var collapsedNotes = _useState112[0];
  var setCollapsedNotes = _useState112[1];

  var fileInputRef = React.createRef();

  // Audio ref to store current audio nodes
  var audioRef = useRef(null);

  // Handle audio playback
  useEffect(function () {
    // Clean up previous audio
    if (audioRef.current) {
      var nodes = audioRef.current.nodes;

      nodes.forEach(function (node) {
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
      var ctx = getAudioContext();
      // Try to resume if suspended (some browsers require user interaction)
      if (ctx.state === 'suspended') {
        ctx.resume().then(function () {
          audioRef.current = createNatureSound(activeScene.id, equalizerValues);
        })['catch'](function () {
          // If resume fails, still try to create sound
          audioRef.current = createNatureSound(activeScene.id, equalizerValues);
        });
      } else {
        audioRef.current = createNatureSound(activeScene.id, equalizerValues);
      }
    }
  }, [isPlaying, activeScene.id, equalizerValues]);

  // Handle volume changes
  useEffect(function () {
    if (audioRef.current) {
      audioRef.current.masterGain.gain.value = volume * 0.3;
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(function () {
    return function () {
      if (audioRef.current) {
        var nodes = audioRef.current.nodes;

        nodes.forEach(function (node) {
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
      var ctx = getAudioContext();
      if (ctx.state !== 'closed') {
        ctx.close();
      }
    };
  }, []);

  // Load saved text and pinned notes
  useEffect(function () {
    var saved = localStorage.getItem('zenText');
    if (saved) setText(saved);
    var notes = localStorage.getItem('pinnedNotes');
    if (notes) {
      try {
        setPinnedNotes(JSON.parse(notes));
      } catch (e) {
        console.error('Failed to load pinned notes');
      }
    }

    // Load saved equalizer values
    var savedEq = localStorage.getItem('equalizerValues');
    if (savedEq) {
      try {
        setEqualizerValues(JSON.parse(savedEq));
      } catch (e) {}
    }
  }, []);

  // Auto-save text
  useEffect(function () {
    var timer = setTimeout(function () {
      localStorage.setItem('zenText', text);
    }, 500);
    return function () {
      return clearTimeout(timer);
    };
  }, [text]);

  // Auto-save pinned notes
  useEffect(function () {
    localStorage.setItem('pinnedNotes', JSON.stringify(pinnedNotes));
  }, [pinnedNotes]);

  // Pin current text as a note
  var handlePinNote = function handlePinNote() {
    if (!text.trim()) {
      alert('Cannot pin an empty note');
      return;
    }
    var noteTitle = text.split('\n')[0].substring(0, 40) || 'Untitled Note';
    var newNote = {
      id: Date.now(),
      title: noteTitle,
      content: text,
      timestamp: new Date().toLocaleString()
    };
    setPinnedNotes([].concat(_toConsumableArray(pinnedNotes), [newNote]));
  };

  // Remove pinned note
  var handleRemoveNote = function handleRemoveNote(id) {
    setPinnedNotes(pinnedNotes.filter(function (note) {
      return note.id !== id;
    }));
  };

  // Load pinned note into editor
  var handleLoadNote = function handleLoadNote(note) {
    setText(note.content);
  };

  // Toggle note collapse
  var toggleNoteCollapse = function toggleNoteCollapse(id) {
    setCollapsedNotes(function (prev) {
      return _extends({}, prev, _defineProperty({}, id, !prev[id]));
    });
  };

  // Keyboard shortcuts
  useEffect(function () {
    var handleKeyDown = function handleKeyDown(e) {
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
    return function () {
      return window.removeEventListener('keydown', handleKeyDown);
    };
  }, [text, isPlaying]);

  // Save file to disk
  var handleSaveFile = function handleSaveFile() {
    var element = document.createElement('a');
    var file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'zen-document-' + new Date().toISOString().slice(0, 10) + '.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Import file
  var handleImportFile = function handleImportFile(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function (e) {
      var content = e.target && e.target.result;
      if (typeof content === 'string') {
        setText(content);
      }
    };
    reader.readAsText(file);
  };

  // Handle equalizer changes
  var handleEqualizerChange = function handleEqualizerChange(band, value) {
    if (band === 'preset') {
      var presets = {
        nature: { low: 70, midLow: 60, mid: 50, midHigh: 40, high: 30 },
        deep: { low: 100, midLow: 80, mid: 40, midHigh: 20, high: 10 },
        clear: { low: 50, midLow: 50, mid: 50, midHigh: 50, high: 50 }
      };
      setEqualizerValues(presets[value] || presets.clear);
    } else {
      setEqualizerValues(function (prev) {
        return _extends({}, prev, _defineProperty({}, band, value));
      });
    }
  };

  return React.createElement(
    'div',
    { className: 'app' },
    React.createElement('div', { className: 'background', style: { background: activeScene.gradient } }),
    React.createElement('canvas', { className: 'shader-canvas' }),
    React.createElement(
      'div',
      { className: 'container' },
      React.createElement(
        'header',
        { className: 'header' },
        React.createElement(TimeDisplay, null),
        React.createElement(SceneSelector, {
          scenes: NATURE_SCENES,
          activeScene: activeScene,
          onSelect: setActiveScene
        }),
        React.createElement(
          'div',
          { className: 'file-controls' },
          React.createElement(
            'button',
            { className: 'icon-button', onClick: handleSaveFile, title: 'Save (Ctrl+S)' },
            '💾'
          ),
          React.createElement(
            'button',
            { className: 'icon-button', onClick: function () {
                if (fileInputRef.current) fileInputRef.current.click();
              }, title: 'Open (Ctrl+O)' },
            '📂'
          ),
          React.createElement(
            'button',
            { className: 'icon-button', onClick: function () {
                if (text && !confirm('Clear current document?')) return;setText('');
              }, title: 'New (Ctrl+N)' },
            '📄'
          ),
          React.createElement(
            'button',
            { className: 'icon-button', onClick: handlePinNote, title: 'Pin Note (Ctrl+P)' },
            '📌'
          )
        ),
        React.createElement('input', {
          ref: fileInputRef,
          type: 'file',
          accept: '.txt,.md,.rtf,.text,.document,*',
          onChange: handleImportFile,
          style: { display: 'none' }
        })
      ),
      React.createElement(
        'main',
        { className: 'main' },
        React.createElement(
          'div',
          { className: 'pinned-sidebar' },
          React.createElement(
            'div',
            { className: 'pinned-header' },
            React.createElement(
              'h3',
              null,
              '📌 Quick Notes'
            ),
            React.createElement(
              'span',
              { className: 'note-count' },
              pinnedNotes.length
            )
          ),
          React.createElement(
            'div',
            { className: 'pinned-list' },
            pinnedNotes.map(function (note) {
              return React.createElement(
                'div',
                { key: note.id, className: 'pinned-note' },
                React.createElement(
                  'div',
                  { className: 'note-header', onClick: function () {
                      return toggleNoteCollapse(note.id);
                    } },
                  React.createElement(
                    'span',
                    { className: 'note-toggle' },
                    collapsedNotes[note.id] ? '▶' : '▼'
                  ),
                  React.createElement(
                    'span',
                    { className: 'note-title' },
                    note.title
                  ),
                  React.createElement(
                    'button',
                    {
                      className: 'note-delete',
                      onClick: function (e) {
                        e.stopPropagation();handleRemoveNote(note.id);
                      }
                    },
                    '×'
                  )
                ),
                !collapsedNotes[note.id] && React.createElement(
                  'div',
                  { className: 'note-content' },
                  React.createElement(
                    'p',
                    { className: 'note-time' },
                    note.timestamp
                  ),
                  React.createElement(
                    'div',
                    { className: 'note-text' },
                    note.content.substring(0, 150),
                    '...'
                  ),
                  React.createElement(
                    'button',
                    {
                      className: 'note-load-btn',
                      onClick: function () {
                        return handleLoadNote(note);
                      }
                    },
                    'Load'
                  )
                )
              );
            }),
            pinnedNotes.length === 0 && React.createElement(
              'div',
              { className: 'no-notes' },
              'No pinned notes yet. Press Ctrl+P to pin.'
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'editor-container' },
          React.createElement(AudioVisualizer, { isPlaying: isPlaying }),
          React.createElement(Editor, { content: text, onChange: setText })
        )
      ),
      React.createElement(
        'footer',
        { className: 'footer' },
        React.createElement(WordCount, { text: text }),
        React.createElement(MusicPlayer, {
          isPlaying: isPlaying,
          onPlayPause: function () {
            return setIsPlaying(!isPlaying);
          },
          volume: volume,
          onVolumeChange: setVolume,
          activeScene: activeScene,
          onSceneChange: setActiveScene,
          equalizerVisible: equalizerVisible,
          onToggleEqualizer: function () {
            return setEqualizerVisible(!equalizerVisible);
          },
          equalizerValues: equalizerValues,
          onEqualizerChange: handleEqualizerChange
        })
      )
    ),
    React.createElement(ShaderAnimation, { sceneId: activeScene.id })
  );
};

// Styles
var styles = '\n  * {\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n  }\n\n  body {\n    font-family: \'Segoe UI\', -apple-system, BlinkMacSystemFont, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;\n    overflow: hidden;\n  }\n\n  .app {\n    width: 100vw;\n    height: 100vh;\n    position: relative;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n  }\n\n  .background {\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    transition: background 1s ease;\n    z-index: 0;\n  }\n\n  .container {\n    position: relative;\n    z-index: 1;\n    width: 90%;\n    max-width: 900px;\n    height: 85vh;\n    display: flex;\n    flex-direction: column;\n    background: rgba(30, 30, 40, 0.85);\n    backdrop-filter: blur(40px);\n    border-radius: 8px;\n    box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5);\n    overflow: hidden;\n  }\n\n  .header {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 12px 20px;\n    background: rgba(20, 20, 28, 0.6);\n    border-bottom: 1px solid rgba(255, 255, 255, 0.05);\n    gap: 10px;\n  }\n\n  .file-controls {\n    display: flex;\n    gap: 8px;\n  }\n\n  .icon-button {\n    background: rgba(102, 126, 234, 0.2);\n    border: 1px solid rgba(102, 126, 234, 0.4);\n    color: rgba(255, 255, 255, 0.8);\n    padding: 6px 10px;\n    border-radius: 4px;\n    cursor: pointer;\n    font-size: 16px;\n    transition: all 0.2s ease;\n  }\n\n  .icon-button:hover {\n    background: rgba(102, 126, 234, 0.4);\n    border-color: rgba(102, 126, 234, 0.8);\n    color: rgba(255, 255, 255, 1);\n  }\n\n  .time-display {\n    color: rgba(255, 255, 255, 0.9);\n    font-size: 14px;\n    font-weight: 300;\n    letter-spacing: 0.5px;\n  }\n\n  .gradient-text {\n    background: linear-gradient(\n      90deg,\n      #667eea,\n      #764ba2,\n      #f093fb,\n      #4facfe,\n      #667eea\n    );\n    background-size: 200% auto;\n    color: transparent;\n    -webkit-background-clip: text;\n    background-clip: text;\n    animation: gradient-shift 8s ease infinite;\n  }\n\n  @keyframes gradient-shift {\n    0%, 100% {\n      background-position: 0% center;\n    }\n    50% {\n      background-position: 100% center;\n    }\n  }\n\n  .scene-tabs {\n    display: flex;\n    gap: 4px;\n  }\n\n  .scene-tab {\n    padding: 4px 12px;\n    background: transparent;\n    border: none;\n    color: rgba(255, 255, 255, 0.5);\n    font-size: 12px;\n    cursor: pointer;\n    border-radius: 4px;\n    transition: all 0.2s;\n  }\n\n  .scene-tab:hover {\n    color: rgba(255, 255, 255, 0.8);\n    background: rgba(255, 255, 255, 0.05);\n  }\n\n  .scene-tab.active {\n    color: rgba(255, 255, 255, 0.95);\n    background: rgba(255, 255, 255, 0.1);\n  }\n\n  .main {\n    flex: 1;\n    overflow: hidden;\n    display: flex;\n    position: relative;\n    gap: 0;\n  }\n\n  .pinned-sidebar {\n    width: 250px;\n    background: rgba(20, 20, 28, 0.7);\n    border-right: 1px solid rgba(255, 255, 255, 0.05);\n    display: flex;\n    flex-direction: column;\n    overflow: hidden;\n  }\n\n  .pinned-header {\n    padding: 12px 16px;\n    border-bottom: 1px solid rgba(255, 255, 255, 0.05);\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    font-size: 13px;\n    color: rgba(255, 255, 255, 0.7);\n  }\n\n  .pinned-header h3 {\n    margin: 0;\n    font-size: 13px;\n    font-weight: 600;\n  }\n\n  .note-count {\n    background: rgba(102, 126, 234, 0.3);\n    padding: 2px 8px;\n    border-radius: 12px;\n    font-size: 11px;\n  }\n\n  .pinned-list {\n    flex: 1;\n    overflow-y: auto;\n    padding: 8px;\n  }\n\n  .pinned-note {\n    background: rgba(102, 126, 234, 0.1);\n    border: 1px solid rgba(102, 126, 234, 0.2);\n    border-radius: 6px;\n    margin-bottom: 8px;\n    overflow: hidden;\n  }\n\n  .note-header {\n    padding: 10px;\n    cursor: pointer;\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    user-select: none;\n    transition: background 0.2s;\n  }\n\n  .note-header:hover {\n    background: rgba(102, 126, 234, 0.15);\n  }\n\n  .note-toggle {\n    font-size: 10px;\n    color: rgba(255, 255, 255, 0.5);\n    min-width: 10px;\n  }\n\n  .note-title {\n    flex: 1;\n    font-size: 12px;\n    color: rgba(255, 255, 255, 0.8);\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n  }\n\n  .note-delete {\n    background: none;\n    border: none;\n    color: rgba(255, 255, 255, 0.5);\n    cursor: pointer;\n    font-size: 16px;\n    padding: 0;\n    width: 20px;\n    height: 20px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n  }\n\n  .note-delete:hover {\n    color: rgba(255, 100, 100, 0.8);\n  }\n\n  .note-content {\n    padding: 10px;\n    border-top: 1px solid rgba(102, 126, 234, 0.1);\n    background: rgba(0, 0, 0, 0.2);\n  }\n\n  .note-time {\n    font-size: 10px;\n    color: rgba(255, 255, 255, 0.4);\n    margin: 0 0 8px 0;\n  }\n\n  .note-text {\n    font-size: 11px;\n    color: rgba(255, 255, 255, 0.7);\n    margin-bottom: 8px;\n    line-height: 1.4;\n    max-height: 60px;\n    overflow: hidden;\n  }\n\n  .note-load-btn {\n    width: 100%;\n    padding: 6px;\n    background: rgba(102, 126, 234, 0.3);\n    border: 1px solid rgba(102, 126, 234, 0.5);\n    color: rgba(255, 255, 255, 0.8);\n    border-radius: 4px;\n    cursor: pointer;\n    font-size: 11px;\n    transition: all 0.2s;\n  }\n\n  .note-load-btn:hover {\n    background: rgba(102, 126, 234, 0.5);\n    border-color: rgba(102, 126, 234, 0.8);\n  }\n\n  .no-notes {\n    padding: 16px;\n    text-align: center;\n    color: rgba(255, 255, 255, 0.3);\n    font-size: 12px;\n  }\n\n  .shader-canvas {\n    position: fixed;\n    right: 0;\n    top: 0;\n    width: 100px;\n    height: 100vh;\n    opacity: 0.15;\n    pointer-events: none;\n    z-index: 0;\n  }\n\n  .editor-container {\n    flex: 1;\n    display: flex;\n    position: relative;\n    flex-direction: column;\n  }\n\n  .visualizer {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    display: flex;\n    justify-content: space-around;\n    align-items: flex-end;\n    padding: 8px;\n    pointer-events: none;\n    z-index: 0;\n  }\n\n  .visualizer-bar {\n    width: 2%;\n    min-width: 2px;\n    background: rgba(255, 255, 255, 0.15);\n    border-radius: 2px;\n    height: 4px;\n    transition: all 0.3s ease;\n  }\n\n  .visualizer-bar.active {\n    animation: pulse-bar linear infinite;\n  }\n\n  @keyframes pulse-bar {\n    0%, 100% {\n      height: 4px;\n      opacity: 0.3;\n    }\n    50% {\n      height: 20px;\n      opacity: 0.6;\n    }\n  }\n\n  .editor-wrapper {\n    flex: 1;\n    display: flex;\n    flex-direction: column;\n    position: relative;\n    z-index: 1;\n  }\n\n  .toolbar-toggle {\n    position: absolute;\n    top: 8px;\n    right: 12px;\n    background: rgba(255, 255, 255, 0.08);\n    border: 1px solid rgba(255, 255, 255, 0.1);\n    color: rgba(255, 255, 255, 0.6);\n    padding: 4px 10px;\n    border-radius: 4px;\n    cursor: pointer;\n    font-size: 10px;\n    transition: all 0.2s;\n    z-index: 10;\n  }\n\n  .toolbar-toggle:hover {\n    background: rgba(255, 255, 255, 0.12);\n    color: rgba(255, 255, 255, 0.9);\n  }\n\n  .toolbar {\n    display: flex;\n    gap: 8px;\n    padding: 8px 12px;\n    background: rgba(20, 20, 28, 0.7);\n    border-bottom: 1px solid rgba(255, 255, 255, 0.05);\n    align-items: center;\n  }\n\n  .toolbar-group {\n    display: flex;\n    gap: 4px;\n  }\n\n  .toolbar-divider {\n    width: 1px;\n    height: 20px;\n    background: rgba(255, 255, 255, 0.1);\n  }\n\n  .toolbar-button {\n    padding: 6px 10px;\n    background: rgba(255, 255, 255, 0.05);\n    border: 1px solid rgba(255, 255, 255, 0.08);\n    color: rgba(255, 255, 255, 0.7);\n    border-radius: 4px;\n    cursor: pointer;\n    font-size: 12px;\n    transition: all 0.2s;\n    min-width: 32px;\n  }\n\n  .toolbar-button:hover {\n    background: rgba(255, 255, 255, 0.1);\n    color: rgba(255, 255, 255, 0.95);\n    border-color: rgba(255, 255, 255, 0.15);\n  }\n\n  .toolbar-button .bold {\n    font-weight: bold;\n  }\n\n  .toolbar-button .italic {\n    font-style: italic;\n  }\n\n  .toolbar-button .underline {\n    text-decoration: underline;\n  }\n\n  .toolbar-button .strikeThrough {\n    text-decoration: line-through;\n  }\n\n  .toolbar-button.heading-button {\n    font-weight: 600;\n    font-size: 11px;\n  }\n\n  .editor {\n    flex: 1;\n    background: transparent;\n    border: none;\n    outline: none;\n    padding: 30px 40px;\n    color: rgba(255, 255, 255, 0.92);\n    font-size: 16px;\n    line-height: 1.7;\n    font-family: \'Consolas\', \'Monaco\', \'Courier New\', monospace;\n    overflow-y: auto;\n    caret-color: rgba(255, 255, 255, 0.9);\n  }\n\n  .editor:empty:before {\n    content: attr(data-placeholder);\n    color: rgba(255, 255, 255, 0.25);\n    pointer-events: none;\n  }\n\n  .editor h1 {\n    font-size: 2em;\n    margin: 0.67em 0;\n    font-weight: bold;\n  }\n\n  .editor h2 {\n    font-size: 1.5em;\n    margin: 0.75em 0;\n    font-weight: bold;\n  }\n\n  .editor h3 {\n    font-size: 1.17em;\n    margin: 0.83em 0;\n    font-weight: bold;\n  }\n\n  .editor p {\n    margin: 1em 0;\n  }\n\n  .editor::selection,\n  .editor *::selection {\n    background: rgba(255, 255, 255, 0.2);\n  }\n\n  .footer {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 10px 20px;\n    background: rgba(20, 20, 28, 0.6);\n    border-top: 1px solid rgba(255, 255, 255, 0.05);\n  }\n\n  .word-count {\n    color: rgba(255, 255, 255, 0.5);\n    font-size: 12px;\n    font-weight: 300;\n  }\n\n  .audio-controls {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n  }\n\n  .icon-button {\n    width: 28px;\n    height: 28px;\n    background: rgba(255, 255, 255, 0.08);\n    border: 1px solid rgba(255, 255, 255, 0.1);\n    border-radius: 4px;\n    color: rgba(255, 255, 255, 0.7);\n    cursor: pointer;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 11px;\n    transition: all 0.2s;\n  }\n\n  .icon-button:hover:not(:disabled) {\n    background: rgba(255, 255, 255, 0.15);\n    border-color: rgba(255, 255, 255, 0.2);\n    color: rgba(255, 255, 255, 0.9);\n  }\n\n  .icon-button:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n  }\n\n  .volume-slider {\n    width: 70px;\n    height: 3px;\n    background: rgba(255, 255, 255, 0.1);\n    border-radius: 2px;\n    outline: none;\n    cursor: pointer;\n    -webkit-appearance: none;\n  }\n\n  .volume-slider::-webkit-slider-thumb {\n    -webkit-appearance: none;\n    width: 10px;\n    height: 10px;\n    background: rgba(255, 255, 255, 0.8);\n    border-radius: 50%;\n    cursor: pointer;\n    transition: all 0.2s;\n  }\n\n  .volume-slider::-webkit-slider-thumb:hover {\n    background: rgba(255, 255, 255, 1);\n    transform: scale(1.2);\n  }\n\n  .volume-slider::-moz-range-thumb {\n    width: 10px;\n    height: 10px;\n    background: rgba(255, 255, 255, 0.8);\n    border: none;\n    border-radius: 50%;\n    cursor: pointer;\n  }\n\n  /* Music Player Styles */\n  .music-player {\n    display: flex;\n    flex-direction: column;\n    align-items: flex-end;\n    gap: 8px;\n  }\n\n  .player-main {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    background: rgba(20, 20, 28, 0.8);\n    padding: 8px 12px;\n    border-radius: 6px;\n    border: 1px solid rgba(255, 255, 255, 0.1);\n  }\n\n  .play-button {\n    width: 32px;\n    height: 32px;\n    background: rgba(102, 126, 234, 0.3);\n    border: 1px solid rgba(102, 126, 234, 0.5);\n    border-radius: 50%;\n    color: rgba(255, 255, 255, 0.9);\n    cursor: pointer;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    transition: all 0.2s;\n  }\n\n  .play-button:hover {\n    background: rgba(102, 126, 234, 0.5);\n    border-color: rgba(102, 126, 234, 0.8);\n    transform: scale(1.05);\n  }\n\n  .play-button.playing {\n    background: rgba(255, 100, 100, 0.3);\n    border-color: rgba(255, 100, 100, 0.5);\n  }\n\n  .play-button.playing:hover {\n    background: rgba(255, 100, 100, 0.5);\n    border-color: rgba(255, 100, 100, 0.8);\n  }\n\n  .scene-display {\n    display: flex;\n    align-items: center;\n    gap: 6px;\n    min-width: 80px;\n  }\n\n  .scene-icon {\n    font-size: 16px;\n  }\n\n  .scene-name {\n    font-size: 12px;\n    color: rgba(255, 255, 255, 0.8);\n    font-weight: 500;\n  }\n\n  .volume-control {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n  }\n\n  .volume-icon {\n    font-size: 12px;\n    color: rgba(255, 255, 255, 0.6);\n  }\n\n  .volume-value {\n    font-size: 10px;\n    color: rgba(255, 255, 255, 0.6);\n    min-width: 30px;\n    text-align: right;\n  }\n\n  .eq-toggle {\n    width: 28px;\n    height: 28px;\n    background: rgba(255, 255, 255, 0.08);\n    border: 1px solid rgba(255, 255, 255, 0.1);\n    border-radius: 4px;\n    color: rgba(255, 255, 255, 0.7);\n    cursor: pointer;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 14px;\n    transition: all 0.2s;\n  }\n\n  .eq-toggle:hover {\n    background: rgba(255, 255, 255, 0.15);\n    border-color: rgba(255, 255, 255, 0.2);\n    color: rgba(255, 255, 255, 0.9);\n  }\n\n  .eq-toggle.active {\n    background: rgba(102, 126, 234, 0.3);\n    border-color: rgba(102, 126, 234, 0.5);\n    color: rgba(255, 255, 255, 0.95);\n  }\n\n  /* Equalizer Styles */\n  .equalizer {\n    width: 280px;\n    background: rgba(20, 20, 28, 0.95);\n    border: 1px solid rgba(255, 255, 255, 0.1);\n    border-radius: 8px;\n    padding: 12px;\n    opacity: 0;\n    transform: translateY(-10px);\n    transition: all 0.3s ease;\n    pointer-events: none;\n  }\n\n  .equalizer.visible {\n    opacity: 1;\n    transform: translateY(0);\n    pointer-events: auto;\n  }\n\n  .equalizer-header {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    margin-bottom: 12px;\n  }\n\n  .equalizer-title {\n    font-size: 14px;\n    color: rgba(255, 255, 255, 0.9);\n    font-weight: 600;\n  }\n\n  .equalizer-label {\n    font-size: 10px;\n    color: rgba(255, 255, 255, 0.5);\n  }\n\n  .equalizer-bands {\n    display: flex;\n    gap: 8px;\n    margin-bottom: 12px;\n  }\n\n  .equalizer-band {\n    flex: 1;\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    gap: 4px;\n  }\n\n  .eq-slider-container {\n    width: 100%;\n    height: 80px;\n    display: flex;\n    align-items: flex-end;\n    justify-content: center;\n    padding: 4px;\n  }\n\n  .eq-slider {\n    width: 6px;\n    height: 100%;\n    background: rgba(255, 255, 255, 0.1);\n    border-radius: 3px;\n    outline: none;\n    cursor: pointer;\n    -webkit-appearance: none;\n    writing-mode: bt-lr;\n  }\n\n  .eq-slider::-webkit-slider-thumb {\n    -webkit-appearance: none;\n    width: 12px;\n    height: 12px;\n    background: currentColor;\n    border-radius: 50%;\n    cursor: pointer;\n    border: 2px solid rgba(20, 20, 28, 0.9);\n  }\n\n  .eq-slider::-moz-range-thumb {\n    width: 12px;\n    height: 12px;\n    background: currentColor;\n    border: none;\n    border-radius: 50%;\n    cursor: pointer;\n  }\n\n  .eq-label-group {\n    text-align: center;\n  }\n\n  .eq-band-label {\n    font-size: 9px;\n    color: rgba(255, 255, 255, 0.7);\n    font-weight: 500;\n  }\n\n  .eq-freq-label {\n    font-size: 8px;\n    color: rgba(255, 255, 255, 0.4);\n    margin-top: 1px;\n  }\n\n  .eq-presets {\n    display: flex;\n    gap: 6px;\n    justify-content: center;\n  }\n\n  .eq-preset-btn {\n    padding: 4px 8px;\n    background: rgba(255, 255, 255, 0.08);\n    border: 1px solid rgba(255, 255, 255, 0.1);\n    color: rgba(255, 255, 255, 0.7);\n    border-radius: 4px;\n    cursor: pointer;\n    font-size: 10px;\n    transition: all 0.2s;\n  }\n\n  .eq-preset-btn:hover {\n    background: rgba(255, 255, 255, 0.15);\n    border-color: rgba(255, 255, 255, 0.2);\n    color: rgba(255, 255, 255, 0.9);\n  }\n\n  @media (max-width: 768px) {\n    .container {\n      width: 95%;\n      height: 90vh;\n    }\n\n    .editor {\n      padding: 20px;\n      font-size: 15px;\n    }\n\n    .time-display {\n      font-size: 13px;\n    }\n\n    .footer {\n      flex-direction: column;\n      gap: 8px;\n      padding: 12px 20px;\n    }\n\n    .toolbar {\n      flex-wrap: wrap;\n    }\n  }\n\n  @media (max-height: 600px) {\n    .container {\n      height: 95vh;\n    }\n\n    .editor {\n      padding: 20px 30px;\n    }\n  }\n';

// Inject styles
var styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Make component globally available for script tag usage
window.ZenTextEditor = ZenTextEditor;
/* Shader Animation */
