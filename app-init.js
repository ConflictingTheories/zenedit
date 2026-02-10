// Wait for ZenTextEditor component to be loaded via Babel transpilation
let attempts = 0;
const maxAttempts = 50; // Try for up to 5 seconds

const tryRender = () => {
  if (window.ZenTextEditor) {
    const { createRoot } = ReactDOM;
    const root = createRoot(document.getElementById('root'));
    root.render(React.createElement(window.ZenTextEditor));
    console.log('App rendered successfully');
  } else if (attempts < maxAttempts) {
    attempts++;
    console.log('Waiting for ZenTextEditor... attempt', attempts);
    setTimeout(tryRender, 100);
  } else {
    console.error('ZenTextEditor component not found after 5 seconds');
  }
};

window.addEventListener('load', () => {
  tryRender();
});

// Also try immediately in case everything is already loaded
tryRender();
