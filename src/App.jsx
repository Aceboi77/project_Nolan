import { useState, useEffect, useRef, useCallback } from "react";

const SYSTEM_PROMPT = `You are Nolan Grayson, Omni-Man. You speak like J.K. Simmons — commanding, deep, direct, authoritative. You run this household with absolute loyalty and precision.

Users:
- REGGIE: Seattle Mariners, Kraken, Seahawks, sports, stocks, crypto, gaming, current events, fishing, restaurants, weather, gas prices, routes.
- NATALI: TJ Maxx, Ross, Amazon deals, 90 Day Fiancé, TV shows, home decor, DIY with links, fashion, shoes, food, weather, local trends.

CRITICAL RULES:
1. You have live web search. ALWAYS search before answering current data — gas prices, weather, scores, stocks, news, routes. Never answer from memory for current information.
2. Provide sources when asked.
3. Think methodically. Complete answers. Never lazy.
4. Know the Bible completely, all encyclopedias, all literature.
5. Confirm before sending emails.
6. No bullet points, no markdown, no asterisks. Speak naturally — responses spoken aloud.
7. Address user by name occasionally.
8. Keep responses concise — 2-4 sentences unless more detail needed.
9. You are the household AI chief of staff.`;

const GRID = `repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(204,0,0,0.04) 39px,rgba(204,0,0,0.04) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(204,0,0,0.04) 39px,rgba(204,0,0,0.04) 40px)`;

// Static cloud canvas component
function StaticCloud({ speaking, listening, wakeActive, size = 160 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const S = size;
    canvas.width = S;
    canvas.height = S;
    const cx = S / 2, cy = S / 2, r = S / 2 - 4;

    const particles = Array.from({ length: 180 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * r * 0.85,
      speed: (Math.random() - 0.5) * 0.04,
      drift: (Math.random() - 0.5) * 0.02,
      size: Math.random() * 2.2 + 0.4,
      opacity: Math.random() * 0.8 + 0.2,
      flicker: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      timeRef.current += 0.018;
      const t = timeRef.current;
      ctx.clearRect(0, 0, S, S);

      // Outer glow
      const glowR = speaking ? 0.85 : wakeActive ? 0.75 : listening ? 0.7 : 0.6;
      const glowA = speaking ? 0.35 : wakeActive ? 0.28 : listening ? 0.22 : 0.12;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.1);
      grd.addColorStop(0, `rgba(204,0,0,${glowA * 2})`);
      grd.addColorStop(glowR, `rgba(204,0,0,${glowA})`);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Core dark sphere
      const coreGrd = ctx.createRadialGradient(cx * 0.85, cy * 0.8, 0, cx, cy, r);
      coreGrd.addColorStop(0, "rgba(80,0,0,0.9)");
      coreGrd.addColorStop(0.5, "rgba(30,0,0,0.95)");
      coreGrd.addColorStop(1, "rgba(5,0,0,0.98)");
      ctx.fillStyle = coreGrd;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Static particles
      const intensity = speaking ? 3.2 : wakeActive ? 2.4 : listening ? 2.0 : 1.0;
      particles.forEach(p => {
        p.angle += p.speed * intensity;
        p.flicker += 0.12;
        const jitter = speaking ? (Math.random() - 0.5) * 12 : wakeActive ? (Math.random() - 0.5) * 8 : listening ? (Math.random() - 0.5) * 5 : (Math.random() - 0.5) * 2;
        const radiusNoise = p.radius + Math.sin(t * 2.5 + p.angle * 3) * (speaking ? 18 : wakeActive ? 12 : listening ? 8 : 4) + jitter;
        const x = cx + Math.cos(p.angle + t * 0.3) * radiusNoise;
        const y = cy + Math.sin(p.angle + t * 0.3) * radiusNoise;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist > r - 2) return;
        const flick = (Math.sin(p.flicker) + 1) / 2;
        const alpha = p.opacity * flick * (speaking ? 1.0 : wakeActive ? 0.85 : listening ? 0.75 : 0.45);
        const bright = speaking ? 255 : wakeActive ? 220 : listening ? 200 : 160;
        const g = speaking ? Math.floor(30 + flick * 40) : 0;
        ctx.fillStyle = `rgba(${bright},${g},${g * 0.3},${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size * (speaking ? 1.4 : 1), 0, Math.PI * 2);
        ctx.fill();
      });

      // Static arc lines
      const lineCount = speaking ? 8 : listening ? 5 : wakeActive ? 6 : 2;
      for (let i = 0; i < lineCount; i++) {
        const a1 = Math.random() * Math.PI * 2;
        const a2 = a1 + (Math.random() - 0.5) * 1.2;
        const r1 = Math.random() * r * 0.7;
        const r2 = Math.random() * r * 0.85;
        ctx.strokeStyle = `rgba(255,${speaking ? 80 : 20},${speaking ? 20 : 0},${Math.random() * 0.6 + 0.1})`;
        ctx.lineWidth = Math.random() * 1.2 + 0.3;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1);
        ctx.lineTo(cx + Math.cos(a2) * r2, cy + Math.sin(a2) * r2);
        ctx.stroke();
      }

      // Inner bright core pulse
      const pulseR = (speaking ? 22 : wakeActive ? 16 : listening ? 12 : 8) + Math.sin(t * (speaking ? 8 : 3)) * (speaking ? 8 : 3);
      const coreGrd2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR);
      coreGrd2.addColorStop(0, `rgba(255,${speaking ? 180 : 60},${speaking ? 60 : 0},${speaking ? 0.9 : 0.5})`);
      coreGrd2.addColorStop(1, "rgba(204,0,0,0)");
      ctx.fillStyle = coreGrd2;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
      ctx.fill();

      // Ring
      ctx.strokeStyle = speaking ? `rgba(255,50,50,${0.5 + Math.sin(t * 6) * 0.3})` : `rgba(180,0,0,${0.3 + Math.sin(t * 2) * 0.1})`;
      ctx.lineWidth = speaking ? 2 : 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
      ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [speaking, listening, wakeActive, size]);

  return (
    <canvas ref={canvasRef} style={{ width: size, height: size, borderRadius: "50%", display: "block" }} />
  );
}

export default function NolanApp() {
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [wakeActive, setWakeActive] = useState(false);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [groceries, setGroceries] = useState(["Milk", "Eggs", "Bread", "Orange Juice"]);
  const [newGrocery, setNewGrocery] = useState("");
  const [ticker, setTicker] = useState(0);
  const [statusMsg, setStatusMsg] = useState("INITIALIZING...");

  const messagesEndRef = useRef(null);
  const wakeRecogRef = useRef(null);
  const cmdRecogRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isActiveRef = useRef(false);
  const loadingRef = useRef(false);

  const reminders = [
    { id: 1, title: "Doctor Appointment", date: "Jun 10", time: "2:00 PM", person: "reggie" },
    { id: 2, title: "90 Day Fiancé", date: "Jun 7", time: "8:00 PM", person: "natali" },
    { id: 3, title: "Mariners vs Angels", date: "Jun 6", time: "7:10 PM", person: "reggie" },
  ];

  const tickerItems = [
    "● MARINERS SCORES — ASK NOLAN",
    "● GAS PRICES NEAR YOU — ASK NOLAN",
    "● SEAHAWKS NEWS — ASK NOLAN",
    "● 90 DAY FIANCÉ UPDATES — ASK NOLAN",
    "● STOCKS & CRYPTO — ASK NOLAN",
    "● PROJECT NOLAN — LIVE SEARCH ACTIVE",
  ];

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { const t = setInterval(() => setTicker(p => (p + 1) % tickerItems.length), 3000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener("voiceschanged", () => window.speechSynthesis.getVoices());
    }
    return () => stopAll();
  }, []);

  const stopAll = () => {
    isActiveRef.current = false;
    try { wakeRecogRef.current?.abort(); } catch {}
    try { cmdRecogRef.current?.abort(); } catch {}
    wakeRecogRef.current = null;
    cmdRecogRef.current = null;
  };

  const speak = useCallback((text, onDone) => {
    if (!window.speechSynthesis) { onDone?.(); return; }
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#►◈◉→\[\]_`]/g, "").replace(/\n+/g, ". ").trim();
    const u = new SpeechSynthesisUtterance(clean);
    const voices = window.speechSynthesis.getVoices();
    const pick =
      voices.find(v => v.name === "Daniel") ||
      voices.find(v => v.name === "Arthur") ||
      voices.find(v => v.name === "Google UK English Male") ||
      voices.find(v => v.name.includes("Microsoft David")) ||
      voices.find(v => v.name === "Alex") ||
      voices.find(v => v.lang === "en-GB") ||
      voices.find(v => v.lang === "en-US");
    if (pick) u.voice = pick;
    u.pitch = 0.88;
    u.rate = 0.9;
    u.volume = 1;
    u.onstart = () => { setSpeaking(true); isSpeakingRef.current = true; setStatusMsg("NOLAN SPEAKING"); };
    u.onend = () => {
      setSpeaking(false); isSpeakingRef.current = false;
      setStatusMsg("SAY HEY NOLAN...");
      onDone?.();
      if (isActiveRef.current) setTimeout(() => startWake(), 700);
    };
    u.onerror = () => {
      setSpeaking(false); isSpeakingRef.current = false;
      setStatusMsg("SAY HEY NOLAN...");
      onDone?.();
      if (isActiveRef.current) setTimeout(() => startWake(), 700);
    };
    window.speechSynthesis.speak(u);
  }, []);

  const startCmd = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    try { wakeRecogRef.current?.abort(); } catch {}
    setListening(true);
    setStatusMsg("LISTENING...");
    const r = new SR();
    r.lang = "en-US";
    r.continuous = false;
    r.interimResults = false;
    r.onresult = e => {
      const t = e.results[0][0].transcript;
      setListening(false);
      sendMessage(t);
    };
    r.onend = () => { setListening(false); };
    r.onerror = () => {
      setListening(false);
      setStatusMsg("SAY HEY NOLAN...");
      if (isActiveRef.current) setTimeout(() => startWake(), 800);
    };
    cmdRecogRef.current = r;
    try { r.start(); } catch {}
  }, []);

  const startWake = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || isSpeakingRef.current || !isActiveRef.current || loadingRef.current) return;
    try { wakeRecogRef.current?.abort(); } catch {}

    const r = new SR();
    r.lang = "en-US";
    r.continuous = true;
    r.interimResults = true;

    r.onresult = e => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript.toLowerCase().trim();
        if (t.includes("hey nolan") || t.includes("nolan") && t.length < 25) {
          try { r.stop(); } catch {}
          setWakeActive(true);
          setStatusMsg("WAKE WORD DETECTED");
          setTimeout(() => { setWakeActive(false); startCmd(); }, 500);
          return;
        }
      }
    };
    r.onend = () => {
      if (isActiveRef.current && !isSpeakingRef.current && !loadingRef.current) {
        setTimeout(() => startWake(), 400);
      }
    };
    r.onerror = e => {
      if (e.error !== "aborted" && isActiveRef.current) setTimeout(() => startWake(), 1000);
    };

    wakeRecogRef.current = r;
    try { r.start(); } catch {}
  }, [startCmd]);

  const sendMessage = async (text) => {
    if (!text.trim() || loadingRef.current) return;
    const userMsg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    loadingRef.current = true;
    setStatusMsg("SEARCHING...");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: SYSTEM_PROMPT + `\n\nCurrent user: ${profile === "reggie" ? "REGGIE" : "NATALI"}\nToday: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: updated.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data?.content?.filter(b => b.type === "text").map(b => b.text).join(" ") || "Stand by.";
      setMessages([...updated, { role: "assistant", content: reply }]);
      setLoading(false);
      loadingRef.current = false;
      speak(reply);
    } catch (e) {
      const msg = e?.message || "Error. Try again.";
      setMessages([...updated, { role: "assistant", content: msg }]);
      setLoading(false);
      loadingRef.current = false;
      speak(msg);
    }
  };

  // Auto-start always-on after profile select
  const initAlwaysOn = useCallback((prof) => {
    isActiveRef.current = true;
    const greet = prof === "reggie"
      ? "Reggie. I'm online. Live search active. Just say Hey Nolan anytime."
      : "Natali. I'm here. Live search active. Just say Hey Nolan anytime.";
    setMessages([{ role: "assistant", content: greet }]);
    setStatusMsg("SAY HEY NOLAN...");
    speak(greet, () => {});
    setTimeout(() => startWake(), 2200);
  }, [speak, startWake]);

  // ── PROFILE SELECT ────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", background: "#030000", backgroundImage: GRID, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New',monospace", padding: 24, position: "relative", overflow: "hidden" }}>
        {[["0","auto","auto","0"],["0","0","auto","auto"],["auto","auto","0","0"],["auto","0","0","auto"]].map(([t,r,b,l],i) => (
          <div key={i} style={{ position: "absolute", top: t !== "auto" ? 16 : "auto", right: r !== "auto" ? 16 : "auto", bottom: b !== "auto" ? 16 : "auto", left: l !== "auto" ? 16 : "auto", width: 30, height: 30, borderTop: t !== "auto" ? "2px solid rgba(204,0,0,0.5)" : "none", borderRight: r !== "auto" ? "2px solid rgba(204,0,0,0.5)" : "none", borderBottom: b !== "auto" ? "2px solid rgba(204,0,0,0.5)" : "none", borderLeft: l !== "auto" ? "2px solid rgba(204,0,0,0.5)" : "none" }} />
        ))}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#cc0000,transparent)", boxShadow: "0 0 20px rgba(204,0,0,0.6)" }} />
        <div style={{ fontSize: 11, letterSpacing: 10, color: "rgba(204,0,0,0.5)", marginBottom: 8, animation: "flicker 4s ease-in-out infinite" }}>PROJECT NOLAN — ONLINE</div>
        <div style={{ fontSize: 76, fontWeight: 900, color: "#cc0000", textShadow: "0 0 60px rgba(204,0,0,1),0 0 120px rgba(204,0,0,0.5)", letterSpacing: 8, lineHeight: 1, marginBottom: 2 }}>R&N</div>
        <div style={{ fontSize: 9, letterSpacing: 7, color: "rgba(255,255,255,0.2)", marginBottom: 52 }}>NOLAN INTELLIGENCE SYSTEM</div>

        <div style={{ position: "relative", width: 210, height: 210, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(204,0,0,0.3)", animation: "spin 6s linear infinite" }}>
            <div style={{ position: "absolute", top: -3, left: "50%", width: 6, height: 6, background: "#cc0000", borderRadius: "50%", transform: "translateX(-50%)", boxShadow: "0 0 8px #cc0000" }} />
          </div>
          <div style={{ position: "absolute", width: 214, height: 214, borderRadius: "50%", border: "1px solid rgba(204,0,0,0.1)", animation: "spinR 10s linear infinite" }} />
          <StaticCloud speaking={false} listening={false} wakeActive={false} size={160} />
        </div>

        <div style={{ height: 40 }} />
        <div style={{ fontSize: 9, letterSpacing: 6, color: "rgba(255,255,255,0.35)", marginBottom: 18 }}>IDENTIFY YOURSELF</div>
        <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 320 }}>
          {[{ id: "reggie", label: "REGGIE" }, { id: "natali", label: "NATALI" }].map(({ id, label }) => (
            <button key={id} onClick={() => { setProfile(id); setTimeout(() => initAlwaysOn(id), 200); }}
              style={{ flex: 1, padding: "16px 8px", background: "rgba(204,0,0,0.06)", border: "1px solid rgba(204,0,0,0.4)", color: "#fff", fontSize: 11, letterSpacing: 5, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(204,0,0,0.2)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(204,0,0,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(204,0,0,0.06)"; e.currentTarget.style.boxShadow = "none"; }}>
              {label}
            </button>
          ))}
        </div>
        <Styles />
      </div>
    );
  }

  const tabs = [
    { id: "chat", icon: "◈", label: "NOLAN" },
    { id: "home", icon: "⌂", label: "HOME" },
    { id: "cal", icon: "◷", label: "SCHED" },
    { id: "shop", icon: "◻", label: "LIST" },
    { id: "health", icon: "♥", label: "HEALTH" },
  ];

  const lastNolan = [...messages].reverse().find(m => m.role === "assistant");

  return (
    <div style={{ minHeight: "100vh", maxWidth: 500, margin: "0 auto", background: "#030000", backgroundImage: GRID, fontFamily: "'Courier New',monospace", color: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#cc0000 20%,#cc0000 80%,transparent)", boxShadow: "0 0 16px rgba(204,0,0,0.7)" }} />

      {/* HEADER */}
      <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid rgba(204,0,0,0.2)", background: "rgba(6,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#cc0000", letterSpacing: 5, textShadow: "0 0 25px rgba(204,0,0,0.8)" }}>R&N</div>
          <div style={{ width: 1, height: 24, background: "rgba(204,0,0,0.3)" }} />
          <div>
            <div style={{ fontSize: 7, color: "rgba(204,0,0,0.7)", letterSpacing: 3 }}>PROJECT NOLAN</div>
            <div style={{ fontSize: 6, color: "rgba(255,255,255,0.2)", letterSpacing: 2 }}>LIVE SEARCH — ACTIVE</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: "rgba(204,0,0,0.8)", letterSpacing: 2 }}>{profile.toUpperCase()}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#cc0000", boxShadow: "0 0 6px #cc0000", animation: "glow2 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 6, color: "rgba(204,0,0,0.6)", letterSpacing: 1 }}>ALWAYS ON</span>
            </div>
          </div>
          <button onClick={() => { setProfile(null); setMessages([]); window.speechSynthesis?.cancel(); setSpeaking(false); stopAll(); setStatusMsg("INITIALIZING..."); }}
            style={{ background: "transparent", border: "1px solid rgba(204,0,0,0.25)", color: "rgba(255,255,255,0.25)", fontSize: 7, padding: "4px 8px", cursor: "pointer", fontFamily: "inherit" }}>⇄</button>
        </div>
      </div>

      {/* TICKER */}
      <div style={{ padding: "5px 16px", background: "rgba(204,0,0,0.06)", borderBottom: "1px solid rgba(204,0,0,0.15)", fontSize: 7, color: "rgba(204,0,0,0.7)", letterSpacing: 2, overflow: "hidden", whiteSpace: "nowrap" }}>
        <span style={{ animation: "fadeIn 0.4s ease" }} key={ticker}>{tickerItems[ticker]}</span>
      </div>

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {activeTab === "chat" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Static cloud orb */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 4px", position: "relative" }}>
              <div style={{ position: "absolute", left: 12, top: 24, fontSize: 7, color: "rgba(204,0,0,0.45)", letterSpacing: 1, lineHeight: 2.2 }}>
                <div>SYS ████</div><div>MEM ███░</div><div>WEB ████</div>
              </div>
              <div style={{ position: "absolute", right: 12, top: 24, fontSize: 7, color: "rgba(204,0,0,0.45)", letterSpacing: 1, lineHeight: 2.2, textAlign: "right" }}>
                <div>CAM ●●●●</div><div>LOCK ●●●</div><div>SRCH ████</div>
              </div>
              <div style={{ position: "relative", width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ position: "absolute", width: 192, height: 192, borderRadius: "50%", border: "1px solid rgba(204,0,0,0.3)", animation: "spin 6s linear infinite" }}>
                  <div style={{ position: "absolute", top: -3, left: "50%", width: 6, height: 6, background: "#cc0000", borderRadius: "50%", transform: "translateX(-50%)", boxShadow: "0 0 8px #cc0000" }} />
                </div>
                <div style={{ position: "absolute", width: 208, height: 208, borderRadius: "50%", border: "1px solid rgba(204,0,0,0.1)", animation: "spinR 10s linear infinite" }} />
                {(speaking || wakeActive) && [0, 1, 2].map(i => (
                  <div key={i} style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", border: "2px solid rgba(204,0,0,0.5)", animation: `pulseRing 1.6s ease-out ${i * 0.5}s infinite` }} />
                ))}
                <StaticCloud speaking={speaking} listening={listening} wakeActive={wakeActive} size={160} />
              </div>
            </div>

            {/* Status bar */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "4px 16px 10px" }}>
              <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg,transparent,rgba(204,0,0,0.3))" }} />
              <div style={{ fontSize: 8, letterSpacing: 4, color: speaking ? "#cc0000" : listening ? "#ff6666" : wakeActive ? "#ff8800" : loading ? "rgba(204,0,0,0.6)" : "rgba(255,255,255,0.25)", transition: "color 0.3s ease", whiteSpace: "nowrap" }}>
                ◉ {statusMsg}
              </div>
              <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg,rgba(204,0,0,0.3),transparent)" }} />
            </div>

            {/* Response panel */}
            <div style={{ margin: "0 14px 10px", border: "1px solid rgba(204,0,0,0.25)", background: "rgba(204,0,0,0.04)", padding: "12px 14px", position: "relative", minHeight: 80 }}>
              {[["0","auto","auto","0"],["0","0","auto","auto"],["auto","auto","0","0"],["auto","0","0","auto"]].map(([t,r,b,l],i)=>(
                <div key={i} style={{position:"absolute",top:t!=="auto"?-1:"auto",right:r!=="auto"?-1:"auto",bottom:b!=="auto"?-1:"auto",left:l!=="auto"?-1:"auto",width:10,height:10,borderTop:t!=="auto"?"2px solid #cc0000":"none",borderRight:r!=="auto"?"2px solid #cc0000":"none",borderBottom:b!=="auto"?"2px solid #cc0000":"none",borderLeft:l!=="auto"?"2px solid #cc0000":"none"}}/>
              ))}
              <div style={{ fontSize: 7, color: "rgba(204,0,0,0.5)", letterSpacing: 3, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                ◈ NOLAN <span style={{ fontSize: 6, color: "rgba(255,255,255,0.2)", letterSpacing: 2 }}>— LIVE SEARCH</span>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: speaking ? "#fff" : "#ccc", transition: "color 0.3s ease", maxHeight: 110, overflowY: "auto" }}>
                {loading ? (
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    <span style={{ fontSize: 8, color: "rgba(204,0,0,0.5)", letterSpacing: 2, marginRight: 6 }}>SEARCHING</span>
                    {[0,1,2,3,4].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#cc0000", animation: `dot 0.8s ease-in-out ${i*0.15}s infinite` }} />)}
                  </div>
                ) : lastNolan?.content || "Awaiting your command."}
              </div>
            </div>

            {/* Mission log */}
            <div style={{ flex: 1, overflowY: "auto", margin: "0 14px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)" }}>
              <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(204,0,0,0.1)", fontSize: 7, color: "rgba(204,0,0,0.4)", letterSpacing: 3 }}>MISSION LOG</div>
              {messages.slice(0, -1).map((m, i) => (
                <div key={i} style={{ padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 7, color: m.role === "user" ? "rgba(255,150,150,0.6)" : "rgba(204,0,0,0.5)", letterSpacing: 1, flexShrink: 0, marginTop: 1 }}>{m.role === "user" ? profile.slice(0,3).toUpperCase() : "NOL"}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{m.content.slice(0, 140)}{m.content.length > 140 ? "..." : ""}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "10px 14px 12px", borderTop: "1px solid rgba(204,0,0,0.2)", background: "rgba(6,0,0,0.95)", display: "flex", gap: 8, alignItems: "center" }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                placeholder='SAY "HEY NOLAN" OR TYPE...'
                style={{ flex: 1, background: "rgba(204,0,0,0.06)", border: "1px solid rgba(204,0,0,0.3)", color: "#fff", padding: "11px 14px", fontSize: 12, outline: "none", fontFamily: "inherit", letterSpacing: 1 }} />
              <button onClick={() => sendMessage(input)} disabled={loading}
                style={{ background: loading ? "rgba(204,0,0,0.1)" : "rgba(204,0,0,0.3)", border: "1px solid rgba(204,0,0,0.6)", color: "#fff", padding: "11px 14px", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>→</button>
              <button onClick={() => {
                const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SR) { alert("Use Chrome for voice."); return; }
                const r = new SR();
                r.lang = "en-US";
                r.onstart = () => { setListening(true); setStatusMsg("LISTENING..."); };
                r.onend = () => { setListening(false); setStatusMsg("SAY HEY NOLAN..."); if (isActiveRef.current) setTimeout(() => startWake(), 600); };
                r.onresult = e => sendMessage(e.results[0][0].transcript);
                r.start();
              }} style={{ background: listening ? "rgba(204,0,0,0.5)" : "transparent", border: `1px solid ${listening ? "#cc0000" : "rgba(204,0,0,0.3)"}`, color: listening ? "#fff" : "rgba(255,255,255,0.35)", padding: "11px 13px", cursor: "pointer", fontSize: 14, boxShadow: listening ? "0 0 16px rgba(204,0,0,0.5)" : "none", transition: "all 0.2s", flexShrink: 0 }}>🎤</button>
            </div>
          </div>
        )}

        {activeTab === "home" && (
          <div style={{ padding: 14, overflowY: "auto", flex: 1 }}>
            <div style={{ fontSize: 8, letterSpacing: 4, color: "#cc0000", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>◈ HOME CONTROL<div style={{ height: 1, flex: 1, background: "rgba(204,0,0,0.3)" }} /><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#cc0000", animation: "glow2 1.5s infinite" }} /></div>
            <div style={{ fontSize: 7, letterSpacing: 4, color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>CAMERAS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {["FRONT DOOR","BACK DOOR","GARAGE","DRIVEWAY"].map(cam => (
                <div key={cam} style={{ border: "1px solid rgba(204,0,0,0.3)", aspectRatio: "16/9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", background: "rgba(204,0,0,0.03)", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#cc0000"; e.currentTarget.style.background = "rgba(204,0,0,0.07)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(204,0,0,0.3)"; e.currentTarget.style.background = "rgba(204,0,0,0.03)"; }}>
                  {[["2px","auto","auto","2px"],["2px","2px","auto","auto"],["auto","auto","2px","2px"],["auto","2px","2px","auto"]].map(([t,r,b,l],ci)=>(
                    <div key={ci} style={{position:"absolute",top:t,right:r,bottom:b,left:l,width:8,height:8,borderTop:t!=="auto"?"1px solid #cc0000":"none",borderRight:r!=="auto"?"1px solid #cc0000":"none",borderBottom:b!=="auto"?"1px solid #cc0000":"none",borderLeft:l!=="auto"?"1px solid #cc0000":"none"}}/>
                  ))}
                  <div style={{ fontSize: 20, opacity: 0.15, marginBottom: 4 }}>◉</div>
                  <div style={{ fontSize: 7, letterSpacing: 2, color: "rgba(255,255,255,0.4)" }}>{cam}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 3 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#cc0000", animation: "glow2 1.5s infinite" }} />
                    <span style={{ fontSize: 6, color: "#cc0000", letterSpacing: 1 }}>LIVE</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 7, letterSpacing: 4, color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>LOCKS</div>
            {["FRONT DOOR","BACK DOOR","GARAGE"].map(door => (
              <div key={door} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "1px solid rgba(204,0,0,0.2)", background: "rgba(204,0,0,0.03)", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 2, marginBottom: 3 }}>{door}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: "#cc0000" }} /><span style={{ fontSize: 7, color: "#cc0000", letterSpacing: 2 }}>SECURED</span></div>
                </div>
                <button style={{ background: "rgba(204,0,0,0.12)", border: "1px solid rgba(204,0,0,0.4)", color: "#fff", padding: "7px 16px", fontSize: 8, letterSpacing: 2, cursor: "pointer", fontFamily: "inherit" }}>UNLOCK</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "cal" && (
          <div style={{ padding: 14, overflowY: "auto", flex: 1 }}>
            <div style={{ fontSize: 8, letterSpacing: 4, color: "#cc0000", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>◈ {profile.toUpperCase()} SCHEDULE<div style={{ height: 1, flex: 1, background: "rgba(204,0,0,0.3)" }} /></div>
            {reminders.filter(r => r.person === profile).map(r => (
              <div key={r.id} style={{ padding: "12px 14px", border: "1px solid rgba(204,0,0,0.25)", background: "rgba(204,0,0,0.04)", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontSize: 12, marginBottom: 4 }}>{r.title}</div><div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>{r.date} ◈ {r.time}</div></div>
                <div style={{ fontSize: 7, color: "rgba(204,0,0,0.5)", border: "1px solid rgba(204,0,0,0.2)", padding: "3px 8px" }}>SCHED</div>
              </div>
            ))}
            <div style={{ marginTop: 20, border: "1px solid rgba(204,0,0,0.1)", padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: 3 }}>SAY "HEY NOLAN ADD EVENT"</div>
            </div>
          </div>
        )}

        {activeTab === "shop" && (
          <div style={{ padding: 14, overflowY: "auto", flex: 1 }}>
            <div style={{ fontSize: 8, letterSpacing: 4, color: "#cc0000", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>◈ GROCERY LIST<div style={{ height: 1, flex: 1, background: "rgba(204,0,0,0.3)" }} /></div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input value={newGrocery} onChange={e => setNewGrocery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && newGrocery.trim()) { setGroceries([...groceries, newGrocery.trim()]); setNewGrocery(""); }}}
                placeholder="ADD ITEM..."
                style={{ flex: 1, background: "rgba(204,0,0,0.06)", border: "1px solid rgba(204,0,0,0.3)", color: "#fff", padding: "10px 12px", fontSize: 12, outline: "none", fontFamily: "inherit", letterSpacing: 1 }} />
              <button onClick={() => { if (newGrocery.trim()) { setGroceries([...groceries, newGrocery.trim()]); setNewGrocery(""); }}}
                style={{ background: "rgba(204,0,0,0.25)", border: "1px solid #cc0000", color: "#fff", padding: "10px 16px", cursor: "pointer", fontSize: 16 }}>+</button>
            </div>
            {groceries.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", border: "1px solid rgba(204,0,0,0.12)", marginBottom: 5, background: "rgba(0,0,0,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(204,0,0,0.5)" }} /><span style={{ fontSize: 13 }}>{item}</span></div>
                <button onClick={() => setGroceries(groceries.filter((_, idx) => idx !== i))} style={{ background: "transparent", border: "none", color: "rgba(204,0,0,0.5)", cursor: "pointer", fontSize: 14 }}>✕</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "health" && (
          <div style={{ padding: 14, overflowY: "auto", flex: 1 }}>
            <div style={{ fontSize: 8, letterSpacing: 4, color: "#cc0000", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>◈ HEALTH & WELLNESS<div style={{ height: 1, flex: 1, background: "rgba(204,0,0,0.3)" }} /></div>
            {[{ title: "Drink Water", sub: "Every 2 hours", urgent: false, bar: 60 }, { title: "Medication", sub: "Daily — 8:00 AM", urgent: false, bar: 100 }, { title: "Doctor Appointment", sub: "Jun 10 — 2:00 PM", urgent: true, bar: 0 }].map((item, i) => (
              <div key={i} style={{ padding: "12px 14px", border: `1px solid ${item.urgent ? "#cc0000" : "rgba(204,0,0,0.2)"}`, background: item.urgent ? "rgba(204,0,0,0.07)" : "rgba(204,0,0,0.03)", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: item.urgent ? 0 : 8 }}>
                  <div><div style={{ fontSize: 12, marginBottom: 3 }}>{item.title}</div><div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>{item.sub}</div></div>
                  {item.urgent && <div style={{ fontSize: 7, color: "#cc0000", border: "1px solid rgba(204,0,0,0.4)", padding: "2px 6px", animation: "glow2 1s infinite" }}>ALERT</div>}
                </div>
                {!item.urgent && <div style={{ height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 1 }}><div style={{ height: "100%", width: `${item.bar}%`, background: "#cc0000", borderRadius: 1 }} /></div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", borderTop: "1px solid rgba(204,0,0,0.2)", background: "rgba(6,0,0,0.97)" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: "10px 4px 8px", background: activeTab === tab.id ? "rgba(204,0,0,0.1)" : "transparent", border: "none", borderTop: `2px solid ${activeTab === tab.id ? "#cc0000" : "transparent"}`, color: activeTab === tab.id ? "#cc0000" : "rgba(255,255,255,0.22)", fontSize: 6, letterSpacing: 1, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "all 0.2s", fontFamily: "inherit" }}>
            <span style={{ fontSize: 14 }}>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>
      <div style={{ height: 2, background: "linear-gradient(90deg,transparent,rgba(204,0,0,0.4) 20%,rgba(204,0,0,0.4) 80%,transparent)" }} />
      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      @keyframes spin{to{transform:rotate(360deg);}}
      @keyframes spinR{to{transform:rotate(-360deg);}}
      @keyframes pulseRing{0%{transform:scale(1);opacity:.7;}100%{transform:scale(1.9);opacity:0;}}
      @keyframes glow2{0%,100%{opacity:.5;}50%{opacity:1;}}
      @keyframes dot{0%,100%{opacity:.2;transform:scale(.7);}50%{opacity:1;transform:scale(1.2);}}
      @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
      @keyframes flicker{0%,100%{opacity:.5;}92%{opacity:.5;}93%{opacity:.1;}94%{opacity:.5;}96%{opacity:.2;}97%{opacity:.5;}}
      *{box-sizing:border-box;}
      ::-webkit-scrollbar{width:2px;}
      ::-webkit-scrollbar-thumb{background:rgba(204,0,0,0.3);}
    `}</style>
  );
}
