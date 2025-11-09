
// TEST YOUR NEW FEATURES!
// Open browser console and try these:

// Toast Notifications:
window.testToast = () => {
  const { toast } = window;
  toast.success('System online!');
  setTimeout(() => toast.info('Checking connections...'), 1000);
  setTimeout(() => toast.warning('Low battery detected'), 2000);
  setTimeout(() => toast.error('Connection lost'), 3000);
  setTimeout(() => {
    const id = toast.loading('Reconnecting...');
    setTimeout(() => {
      toast.dismiss(id);
      toast.success('Connection restored!');
    }, 3000);
  }, 4000);
};

// Run: window.testToast() in console

// Keyboard Shortcuts:
// Press Shift+? to see all shortcuts

