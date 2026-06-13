let timer = null;
Component({
  properties: {
    seconds: { type: Number, value: 15 },
    running: { type: Boolean, value: false },
  },
  data: { current: 15, urgent: false },
  observers: {
    seconds(s) { this.setData({ current: s, urgent: s <= 5 }); },
    running(r) { if (r) this.start(); else this.stop(); },
  },
  detached() { this.stop(); },
  methods: {
    start() {
      this.stop();
      this.data.current = this.properties.seconds;
      timer = setInterval(() => {
        const next = this.data.current - 1;
        this.setData({ current: Math.max(next, 0), urgent: next <= 5 });
        if (next <= 0) { this.stop(); this.triggerEvent("timeout"); }
      }, 1000);
    },
    stop() { if (timer) { clearInterval(timer); timer = null; } },
  },
});
