// src/services/eventBus.js
const eventBus = {
    listeners: {},
    on(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
      console.log(`Listener added for event: ${event}`); // Debug log
    },
    off(event, callback) {
      if (!this.listeners[event]) return;
      const initialLength = this.listeners[event].length; // Debug log
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      console.log(`Listener removed for event: ${event}. Count reduced from ${initialLength} to ${this.listeners[event].length}`); // Debug log
    },
    emit(event, data) {
      if (!this.listeners[event]) return;
      console.log(`Emitting event: ${event}`, data || ''); // Debug log
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          console.error(`Error in listener for event ${event}:`, e);
        }
      });
    }
  };
  
  export default eventBus;
  