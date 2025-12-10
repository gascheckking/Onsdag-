import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Home, Sword, Box, User, Settings, Zap, 
  Wallet, Trophy, Sparkles, Activity, ArrowRight, 
  Terminal, Cpu, Coins, Flame, RefreshCw,
  ChevronRight, ExternalLink, ShieldCheck, Ghost, 
  Target, TrendingUp, HelpCircle, Send, Users, Layers, Star
} from 'lucide-react';

// --- TYPES & INTERFACES ---
type MainTab = 'home' | 'loot' | 'market' | 'brain' | 'profile';
type LootSubTab = 'packs' | 'slot' | 'history';
type MarketSubTab = 'trending' | 'creators' | 'zora';
type BrainSubTab = 'quests' | 'ai' | 'supcast';

// --- MOCK DATA GENERATORS ---
const generateAddress = () => `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`;

const MOCK_ACTIVITY = [
  { id: 1, text: "Minted Zora Drop #442", time: "2m ago", type: "mint", value: "-0.003 ETH" },
  { id: 2, text: "SpawnBot auto-claimed XP", time: "15m ago", type: "bot", value: "+50 XP" },
  { id: 3, text: "Opened 'Vibe Genesis' Pack", time: "1h ago", type: "pack", value: "Rare Pull" },
  { id: 4, text: "Bridge Mainnet -> Base", time: "3h ago", type: "bridge", value: "0.5 ETH" },
];

const MOCK_QUESTS = [
    { id: 1, title: "Deploy your first PackFactory", reward: "500 XP + 'Creator' Role", completed: false },
    { id: 2, title: "Bridge 0.05 ETH to Base", reward: "250 XP + Base Badge", completed: true },
    { id: 3, title: "Submit 1 SupCast idea", reward: "100 XP", completed: false },
];

const MOCK_SUPCASTS = [
    { id: 1, title: "Bug: Slot machine lag on low-end mobile", context: "The CSS animations cause stuttering...", category: "SpawnEngine", useCount: 2 },
    { id: 2, title: "Idea: XP Quest for Zora coin holders", context: "We should reward users who hold a Zora Creator Coin...", category: "Zora", useCount: 5 },
];

// --- COMPONENTS ---

// 1. NEURAL BACKGROUND (From index.html CSS)
const NeuralBackground = () => (
  <div className="neural-bg pointer-events-none">
    <div className="orb orb-1"></div>
    <div className="orb orb-2"></div>
    <div className="orb orb-3"></div>
    <div className="grid-overlay"></div>
  </div>
);

// 2. HOLO CARD (Standard container)
const HoloCard = ({ children, className = "", glow = false, onClick = undefined }: any) => (
  <div 
    onClick={onClick}
    className={`glass-card rounded-2xl p-4 relative overflow-hidden transition-all duration-300 ${glow ? 'border-mesh-neon/50 shadow-[0_0_15px_rgba(0,255,192,0.1)]' : ''} ${className}`}
  >
    {glow && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mesh-neon to-transparent opacity-50" />}
    <div className="relative z-10">{children}</div>
  </div>
);

// 3. GAS METER (WOW Goal #2)
const GasMeter = () => {
  const [gwei, setGwei] = useState(0.05);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulera live gas-uppdateringar (WOW Goal #2)
      setGwei(prev => Math.max(0.01, +(prev + (Math.random() * 0.04 - 0.02)).toFixed(3)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const color = gwei < 0.1 ? 'text-emerald-400' : gwei < 0.5 ? 'text-yellow-400' : 'text-red-400';
  const barWidth = Math.min(100, (gwei / 0.8) * 100); // 0.8 max for bar visualization

  return (
    <div className="flex flex-col gap-1 w-20">
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-gray-400 font-mono">GAS:</span>
        <span className={`text-xs font-bold font-mono ${color}`}>{gwei.toFixed(3)}</span>
      </div>
      <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full"
          style={{ width: `${barWidth}%`, backgroundColor: gwei < 0.1 ? '#10b981' : gwei < 0.5 ? '#f59e0b' : '#ef4444' }}
        />
      </div>
    </div>
  );
};

// 4. SLOT MACHINE ENGINE (Loot Tab)
const SlotMachine = ({ onSpin }: { onSpin: (win: boolean) => void }) => {
  const [spinning, setSpinning] = useState(false);
  const [slots, setSlots] = useState(['💎', '🍒', '🍋']);
  const [message, setMessage] = useState('SPIN TO WIN');

  const symbols = ['💎', '7️⃣', '🍒', '🍋', '👾', '⚡️'];

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setMessage('ROLLING...');
    
    let iterations = 0;
    const finalResult = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
    ];
    
    const interval = setInterval(() => {
      setSlots([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ]);
      iterations++;
      
      if (iterations > 20) {
        clearInterval(interval);
        setSpinning(false);
        setSlots(finalResult);
        
        const win = finalResult[0] === finalResult[1] && finalResult[1] === finalResult[2];
        setMessage(win ? 'JACKPOT! 🏆 Mythic Artifact Unlocked' : 'NO MATCH – Try again');
        onSpin(win);
      }
    }, 100);
  };

  return (
    <div className="relative p-1 rounded-2xl bg-gradient-to-b from-purple-500 to-blue-600 shadow-lg">
      <div className="bg-black rounded-xl p-4 border-4 border-gray-800">
        <div className="flex justify-between gap-2 mb-4 bg-[#111] p-3 rounded-lg border-inner shadow-inner">
          {slots.map((s, i) => (
            <div key={i} className="flex-1 h-16 flex items-center justify-center text-4xl bg-[#222] rounded border border-gray-700 font-mono">
              {spinning ? <span className="animate-spin-slow">{s}</span> : s}
            </div>
          ))}
        </div>
        <div className="text-center text-mesh-neon font-mono text-sm mb-3 tracking-widest">{message}</div>
        <button 
          onClick={handleSpin}
          disabled={spinning}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-lg shadow-[0_0_15px_rgba(234,179,8,0.5)] active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
        >
          {spinning ? 'PROCESSING TX...' : 'SPIN FOR RNG (0.001 ETH)'}
        </button>
      </div>
    </div>
  );
};

// 5. SPAWNBOT TERMINAL (Brain Tab)
const SpawnBotTerminal = () => {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<string[]>([
    "> SpawnBot v1.0.4 initialized...",
    "> Connected to Base Mainnet.",
    "> Monitoring mempool for alpha...",
    "> Ready for input. (Type 'help')",
    "> TODO: Replace mock with actual LLM API hook"
  ]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if(!input.trim()) return;
    
    const command = input.toLowerCase().trim();
    const newLogs = [...logs, `> ${command}`];
    
    setTimeout(() => {
        let response = "> Command not recognized. Use 'help' for available commands.";
        if(command.includes("scan wallet")) response = `> Scanning wallet ${generateAddress()}... found 3 active diverse tokens, 4 unclaimed XP quests.`;
        if(command.includes("mint daily")) response = "> Initiating daily free mint sequence... (Simulated TX successful. +50 XP)";
        if(command.includes("help")) response = "> Available Commands: scan wallet, mint daily, bridge eth (mock), auto-compound (toggle), create pack (mock config).";
        
        setLogs(prev => [...prev, response]);
    }, 600);

    setLogs(newLogs);
    setInput('');
  };

  return (
    <div className="bg-[#0c0c0c] border border-gray-800 rounded-xl p-4 font-mono text-xs h-64 flex flex-col">
      <div 
        ref={logContainerRef}
        className="flex-1 overflow-y-auto space-y-1 mb-2 scrollbar-thin scrollbar-thumb-gray-700"
      >
        {logs.map((log, i) => (
          <div key={i} className={log.startsWith(">") ? "text-emerald-500" : "text-gray-400"}>
            {log}
          </div>
        ))}
      </div>
      <form onSubmit={handleCommand} className="flex gap-2 border-t border-gray-800 pt-2">
        <span className="text-emerald-500 font-bold">SPAWNBOT:~$</span>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600"
          placeholder="Type command here..."
        />
      </form>
    </div>
  );
};


// 6. SUB NAV (Top Tabs)
const SubNav = ({ subTabs, activeSubTab, setActiveSubTab }: {
  subTabs: { id: string, label: string }[],
  activeSubTab: string,
  setActiveSubTab: (id: string) => void
}) => (
    <div className="flex p-1 mb-4 rounded-xl bg-black/50 border border-white/10 overflow-x-auto whitespace-nowrap">
      {subTabs.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setActiveSubTab(id)}
          className={`flex-1 px-4 py-2 text-xs font-bold rounded-lg transition-colors duration-200 
            ${activeSubTab === id 
              ? 'bg-mesh-neon text-black shadow-[0_0_10px_rgba(0,255,192,0.5)]' 
              : 'text-gray-400 hover:bg-white/10'}`
          }
        >
          {label}
        </button>
      ))}
    </div>
);


// --- APP ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [showSettings, setShowSettings] = useState(false);
  const [xp, setXp] = useState(1575);
  const [streak, setStreak] = useState(4);
  const [activeLootSubTab, setActiveLootSubTab] = useState<LootSubTab>('packs');
  const [activeBrainSubTab, setActiveBrainSubTab] = useState<BrainSubTab>('quests');
  const [latestSupCast, setLatestSupCast] = useState(MOCK_SUPCASTS[0].context);
  
  // -- HANDLERS --
  const addXP = (amount: number) => setXp(p => p + amount);
  const handleSlotSpin = (win: boolean) => {
    addXP(win ? 150 : 50);
  };
  
  // --- SUB TAB VIEWS ---
  
  // 1. Loot Sub Views
  const PacksView = () => (
    <div className="grid grid-cols-2 gap-3">
        {[{title: "Starter Pack", desc: "Contains 3 common shards.", price: "OPEN (Free)", icon: "🔥", color: "mesh-neon"},
          {title: "Elite Pack", desc: "High chance of Rares.", price: "0.01 ETH", icon: "💎", color: "mesh-purple"}]
          .map((pack, i) => (
          <HoloCard key={i} className={`border-${pack.color}/30 cursor-pointer active:scale-[0.98]`}>
            <div className="absolute top-2 right-2 text-xs">{pack.icon}</div>
            <Box className={`w-8 h-8 text-${pack.color} mb-2`} />
            <h3 className="text-sm font-bold text-white">{pack.title}</h3>
            <p className="text-[10px] text-gray-400 mb-3">{pack.desc}</p>
            <button className={`w-full py-1.5 rounded bg-${pack.color}/10 border border-${pack.color}/50 text-${pack.color} text-xs font-bold hover:bg-${pack.color} hover:text-black transition-colors`}>
              {pack.price}
            </button>
          </HoloCard>
        ))}
    </div>
  );

  const SlotView = () => (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-white">Mesh Slot · Experimental</h2>
        <p className="text-xs text-gray-400">Spin to simulate pack RNG – UX only (no real tokens yet).</p>
      </div>
      <SlotMachine onSpin={handleSlotSpin} />
    </div>
  );

  const HistoryView = () => (
    <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-300">Recent Loot Drops</h3>
        {[{date: "2025-12-10", type: "Slot", result: "JACKPOT! 🏆", xp: "+150 XP"}, 
          {date: "2025-12-09", type: "Pack", result: "2 Commons, 1 Rare", xp: "+80 XP"}]
          .map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-xs text-white">
                    <span className="font-mono text-gray-500 mr-2">{item.date} ·</span>
                    {item.type} · {item.result}
                </div>
                <span className="text-xs font-mono text-mesh-neon">{item.xp}</span>
            </div>
          ))}
    </div>
  );


  // 2. Brain Sub Views
  const QuestsView = () => (
    <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-300 mb-2">Active Quests</h3>
        {MOCK_QUESTS.map(quest => (
            <HoloCard key={quest.id} className={`p-3 cursor-pointer ${quest.completed ? 'opacity-50 border-gray-700' : 'hover:border-mesh-neon/50'}`}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Target className={`w-5 h-5 ${quest.completed ? 'text-gray-500' : 'text-mesh-neon'}`} />
                        <div>
                            <div className={`text-sm font-bold ${quest.completed ? 'line-through text-gray-500' : 'text-white'}`}>{quest.title}</div>
                            <div className="text-[10px] text-gray-400">{quest.reward}</div>
                        </div>
                    </div>
                    {quest.completed ? (
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ) : (
                        <button className="px-3 py-1 text-xs rounded-full bg-mesh-cyan/20 text-mesh-cyan hover:bg-mesh-cyan hover:text-black">
                            Mark as Shipped
                        </button>
                    )}
                </div>
            </HoloCard>
        ))}
    </div>
  );

  const AIMeshHelperView = () => {
    const [prompt, setPrompt] = useState(latestSupCast);
    const [concept, setConcept] = useState('');
    const [generating, setGenerating] = useState(false);

    const generateConcept = () => {
      setGenerating(true);
      setConcept('');
      setTimeout(() => {
        setConcept(`// MidJourney Prompt (v6.1):\nUX concept for gamifying the mainnet -> base bridge, holographic interface, deep blue background, neon cyan accents, cinematic lighting, 8k --style spawnengine`);
        setGenerating(false);
        addXP(75);
      }, 1500);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-300">AI Mesh Helper (Prompt Generator)</h3>
            <HoloCard>
                <label className="text-xs text-gray-400 mb-1 block">Latest Challenge / Problem (from SupCast):</label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-16 p-2 bg-black/50 border border-gray-700 rounded text-xs text-white"
                />
            </HoloCard>

            <button 
                onClick={generateConcept}
                disabled={generating}
                className="w-full py-2 rounded-lg bg-mesh-purple text-white font-bold text-sm hover:bg-mesh-purple/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {generating ? <RefreshCw size={14} className="animate-spin" /> : <Cpu size={14} />}
                {generating ? 'GENERATING CONCEPT...' : 'GENERATE MESH CONCEPT (+75 XP)'}
            </button>

            {concept && (
                <HoloCard className="bg-mesh-neon/5 border-mesh-neon/30 p-3">
                    <pre className="text-[10px] text-mesh-neon whitespace-pre-wrap">{concept}</pre>
                    <button className="mt-3 w-full py-1 text-xs rounded bg-mesh-neon text-black font-bold">
                        Copy Prompt
                    </button>
                </HoloCard>
            )}
        </div>
    );
  };

  const SupCastView = () => {
    const [title, setTitle] = useState('');
    const [context, setContext] = useState('');
    const [category, setCategory] = useState('SpawnEngine');

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        // In V1, this just updates the mock and latest input
        if (title && context) {
            setLatestSupCast(context); // Set as latest AI input
            setContext('');
            setTitle('');
            alert('SupCast stored locally (Mock)');
        }
    }

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-300">Create SupCast (Feedback)</h3>
            <HoloCard>
                <form onSubmit={handleSend} className="space-y-3">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What do you want to tell Base / Farcaster / Vibe?"
                        className="w-full p-2 bg-black/50 border border-gray-700 rounded text-sm text-white placeholder-gray-500"
                    />
                    <textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Describe the bug/idea/experience."
                        className="w-full h-20 p-2 bg-black/50 border border-gray-700 rounded text-xs text-white placeholder-gray-500"
                    />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2 bg-black/50 border border-gray-700 rounded text-xs text-white"
                    >
                        {['SpawnEngine', 'Base App', 'Vibe', 'Zora'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button type="submit" className="w-full py-2 rounded-lg bg-mesh-cyan text-black font-bold text-sm hover:opacity-90">
                        <Send size={14} className="inline mr-2" /> Send SupCast
                    </button>
                </form>
            </HoloCard>

            <h3 className="text-sm font-bold text-gray-300 mt-6">Latest SupCasts</h3>
            <div className="space-y-2">
                {MOCK_SUPCASTS.map(sc => (
                    <HoloCard key={sc.id} className="p-3">
                        <div className="flex justify-between items-start">
                            <div className="text-sm font-bold text-white">{sc.title}</div>
                            <span className="text-[10px] bg-gray-700/50 px-2 py-0.5 rounded-full">{sc.category}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{sc.context}</p>
                        <button 
                            onClick={() => setActiveBrainSubTab('ai')}
                            className="mt-2 text-[10px] font-bold text-mesh-neon hover:underline"
                        >
                            Use as Mesh Input ({sc.useCount})
                        </button>
                    </HoloCard>
                ))}
            </div>
        </div>
    );
  };

  // --- MAIN TAB VIEWS ---

  const HomeView = () => (
    <div className="space-y-6 animate-fade-in">
      {/* HUD HEADER (WOW Goal #5) */}
      <HoloCard className="bg-gradient-to-r from-mesh-dark to-[#0a1025]">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-mesh-neon to-mesh-purple p-[2px]">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                        <span className="text-xl">👾</span>
                    </div>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white leading-none">@spawniz</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-mesh-neon/20 text-mesh-neon border border-mesh-neon/30">Mesh Architect</span>
                        <span className="text-[10px] text-gray-400">SpawnEngine · Mesh HUD</span>
                    </div>
                </div>
            </div>
            <button onClick={() => setShowSettings(true)} className="p-1 rounded-full text-gray-400 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
            </button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
            <div className="text-center">
                <div className="text-lg font-bold text-white">{xp.toLocaleString()}</div>
                <div className="text-[10px] text-gray-400 uppercase">Total XP</div>
            </div>
            <div className="text-center">
                <div className="text-lg font-bold text-white">42</div>
                <div className="text-[10px] text-gray-400 uppercase">Mints / Packs</div>
            </div>
            <div className="text-center">
                <div className="text-lg font-bold text-white">$15.20</div>
                <div className="text-[10px] text-gray-400 uppercase">Gas Saved</div>
            </div>
        </div>
      </HoloCard>

      {/* STREAK & ACTIONS (WOW Goal #1) */}
      <div className="grid grid-cols-2 gap-3">
        <HoloCard onClick={() => setStreak(s => s + 1)} className="cursor-pointer active:scale-95 bg-orange-900/20 border-orange-500/30">
          <div className="flex flex-col items-center justify-center text-center h-full">
            <Flame className={`w-8 h-8 ${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse-slow' : 'text-gray-600'}`} />
            <div className="text-2xl font-bold text-white mt-1">{streak}</div>
            <div className="text-[10px] text-gray-400 uppercase">Day Streak</div>
            <button onClick={() => addXP(100)} className="text-[10px] px-2 mt-1 rounded-full bg-mesh-neon/20 text-mesh-neon hover:bg-mesh-neon hover:text-black">
                Check-in Today (+100 XP)
            </button>
          </div>
        </HoloCard>
        
        <HoloCard className="bg-mesh-neon/5 border-mesh-neon/30 flex flex-col justify-between">
          <div className="text-xs text-mesh-neon font-bold uppercase mb-2 flex items-center gap-1">
            <Zap size={12} /> Quick Mint (WOW Goal #3)
          </div>
          <button className="w-full py-2 bg-mesh-neon text-black font-bold text-xs rounded hover:bg-white transition-colors">
            BUY $WARP COIN (1-Click)
          </button>
          <button className="w-full py-2 mt-2 bg-blue-600/50 text-white font-bold text-xs rounded hover:bg-blue-600/70 transition-colors">
            Bridge ETH to Base
          </button>
        </HoloCard>
      </div>

      {/* ACTIVITY FEED (WOW Goal #1) */}
      <div>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-mesh-cyan" /> 
            LIVE MESH FEED
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 animate-pulse">● Live</span>
        </div>
        <div className="space-y-2">
          {MOCK_ACTIVITY.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                  ${item.type === 'mint' ? 'bg-purple-500/20 text-purple-400' : 
                    item.type === 'bot' ? 'bg-mesh-cyan/20 text-mesh-cyan' : 
                    'bg-orange-500/20 text-orange-400'}`}>
                  {item.type === 'mint' ? <Sparkles size={14}/> : item.type === 'bot' ? <Cpu size={14}/> : <Box size={14}/>}
                </div>
                <div>
                  <div className="text-xs text-white font-medium">{item.text}</div>
                  <div className="text-[10px] text-gray-500">{item.time}</div>
                </div>
              </div>
              <div className="text-xs font-mono text-gray-300">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const LootView = () => (
    <div className="animate-fade-in">
        <SubNav 
            subTabs={[{id: 'packs', label: 'Packs'}, {id: 'slot', label: 'Slot'}, {id: 'history', label: 'History'}]}
            activeSubTab={activeLootSubTab}
            setActiveSubTab={setActiveLootSubTab}
        />
        {activeLootSubTab === 'packs' && <PacksView />}
        {activeLootSubTab === 'slot' && <SlotView />}
        {activeLootSubTab === 'history' && <HistoryView />}
    </div>
  );
  
  const MarketView = () => (
    <div className="space-y-5 animate-fade-in">
      <SubNav 
            subTabs={[{id: 'trending', label: 'Trending'}, {id: 'creators', label: 'Creators'}, {id: 'zora', label: 'Zora Coins'}]}
            activeSubTab={'trending'} // Simplified mock
            setActiveSubTab={() => {}}
        />

      <HoloCard className="relative h-28 rounded-2xl overflow-hidden bg-gray-900 border border-white/10 group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <div className="absolute bottom-0 left-0 p-4 z-20 w-full">
            <h3 className="text-xl font-bold text-white">Onchain Market · Base</h3>
            <p className="text-xs text-gray-300">Follow packs, tokens, and creators.</p>
        </div>
      </HoloCard>

      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <TrendingUp size={16} className="text-red-500" /> HOT TRENDING (WOW Goal #4)
      </h3>
      <div className="space-y-3">
        {[{name: "VibeMarket Booster", price: "0.025 ETH", participants: "1.2K"},
          {name: "Creator Token · $SPAWNIZ", price: "0.001 ETH", participants: "500"}]
          .map((item, i) => (
            <HoloCard key={i} className="p-3 flex justify-between items-center hover:border-red-500/50">
              <div>
                <div className="text-sm font-bold text-white">{item.name}</div>
                <div className="text-[10px] text-gray-400">P: {item.participants} | {item.price}</div>
              </div>
              <button className="px-3 py-1 text-xs rounded-full bg-mesh-neon text-black font-bold">
                VIEW
              </button>
            </HoloCard>
          ))}
      </div>
    </div>
  );
  
  const BrainView = () => (
    <div className="space-y-5 animate-fade-in">
        <SubNav 
            subTabs={[{id: 'quests', label: 'Quests'}, {id: 'ai', label: 'AI Helper'}, {id: 'supcast', label: 'SupCast'}]}
            activeSubTab={activeBrainSubTab}
            setActiveSubTab={setActiveBrainSubTab}
        />
        
        {activeBrainSubTab === 'quests' && <QuestsView />}
        {activeBrainSubTab === 'ai' && <AIMeshHelperView />}
        {activeBrainSubTab === 'supcast' && <SupCastView />}
    </div>
  );
  
  const ProfileView = () => (
    <div className="space-y-6 animate-fade-in">
        <HoloCard className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-mesh-neon to-mesh-purple mb-3 p-[3px]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-3xl">👾</div>
            </div>
            <h2 className="text-xl font-bold text-white">@spawniz</h2>
            <p className="text-xs text-gray-400">Mesh Architect | XP Lvl 12 | Base Builder</p>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10 w-full">
                <div className="text-center">
                    <div className="text-lg font-bold text-white">1575</div>
                    <div className="text-[10px] text-gray-400 uppercase">XP</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-white">3/3</div>
                    <div className="text-[10px] text-gray-400 uppercase">Quests Completed</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-white">42</div>
                    <div className="text-[10px] text-gray-400 uppercase">Collectibles</div>
                </div>
            </div>
        </HoloCard>

        <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-300">Account Overview</h3>
            {[
                { title: 'Preferred Wallet', value: generateAddress().slice(0, 10) + '...', icon: Wallet },
                { title: 'Linked Farcaster Handle', value: '@spawniz (Active)', icon: Users },
                { title: 'Roles & Permissions', value: 'Mesh Architect', icon: Layers },
            ].map((item, i) => (
                <HoloCard key={i} className="p-3 flex justify-between items-center cursor-pointer hover:border-mesh-cyan/50">
                    <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-mesh-cyan" />
                        <div>
                            <div className="text-xs font-bold text-white">{item.title}</div>
                            <div className="text-[10px] text-gray-500 font-mono">{item.value}</div>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                </HoloCard>
            ))}
        </div>
    </div>
  );
  

  const SettingsModal = () => {
    if (!showSettings) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
        <div className="relative w-full max-w-md bg-[#0f111a] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 pb-10 sm:pb-6 animate-float-up">
          <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-6 sm:hidden" />
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">System Settings</h2>
            <button onClick={() => setShowSettings(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
              <ArrowRight className="w-4 h-4 text-gray-400 rotate-90 sm:rotate-0" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-mesh-neon" />
                <div>
                  <div className="text-sm font-bold text-white">Wallet Connection</div>
                  <div className="text-[10px] text-gray-400 font-mono">0x4A...F89C (Base)</div>
                </div>
              </div>
              <button className="px-3 py-1.5 text-xs font-bold bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">
                Disconnect
              </button>
            </div>

            <h3 className="text-xs font-bold text-gray-400 uppercase mt-4">Other Settings (WOW Goal #7)</h3>
            <div className="space-y-2">
                {[
                    { title: 'Devices & Storage', icon: Cpu, desc: 'Manage cache and connected devices.' },
                    { title: 'Theme: Dark / Neon', icon: Sparkles, desc: 'Change visual styling.' },
                    { title: 'Trade Ideas', icon: TrendingUp, desc: 'Go to SupCast creation.' },
                    { title: 'Support / Docs', icon: HelpCircle, desc: 'Open knowledge base.' },
                    { title: 'Log Out', icon: ExternalLink, desc: 'Clear session.' },
                ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:border-mesh-cyan/50 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-sm font-bold text-white">{item.title}</div>
                                <div className="text-[10px] text-gray-500">{item.desc}</div>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                    </div>
                ))}
            </div>

            <button className="w-full py-3 rounded-xl bg-mesh-neon text-black font-bold text-sm hover:opacity-90 mt-4">
                Upgrade to Premium ($9/mo) (WOW Goal #9)
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- MAIN LAYOUT RENDER ---

  return (
    <div className="min-h-screen relative font-sans selection:bg-mesh-neon/30 text-gray-100">
      <NeuralBackground />
      
      {/* MOBILE APP CONTAINER */}
      <div className="max-w-md mx-auto min-h-screen bg-transparent relative flex flex-col pb-24">
        
        {/* HEADER BAR */}
        <header className="sticky top-0 z-30 px-4 py-3 backdrop-blur-md bg-black/20 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mesh-neon to-blue-600 flex items-center justify-center font-black text-black italic">
              SE
            </div>
            <span className="font-bold text-sm tracking-wide">SPAWN<span className="text-mesh-neon">ENGINE</span></span>
          </div>
          
          <div className="flex items-center gap-3">
            <GasMeter />
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'loot' && <LootView />}
          {activeTab === 'market' && <MarketView />}
          {activeTab === 'brain' && <BrainView />}
          {activeTab === 'profile' && <ProfileView />}
        </main>

        {/* BOTTOM NAV (WOW Goal #7, Glassmorphism) */}
        <nav className="fixed bottom-0 left-0 w-full z-40 px-4 pb-4 pt-2">
          <div className="max-w-md mx-auto bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl h-16 px-2 flex justify-between items-center shadow-2xl">
            {[
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'loot', icon: Sword, label: 'Loot' },
              { id: 'market', icon: Box, label: 'Market' },
              { id: 'brain', icon: Terminal, label: 'Brain' },
              { id: 'profile', icon: User, label: 'Profile' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as MainTab)}
                  className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${isActive ? 'text-mesh-neon -translate-y-1' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {isActive && (
                    <div className="absolute -top-2 w-8 h-8 bg-mesh-neon/20 rounded-full blur-md" />
                  )}
                  <tab.icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* OVERLAYS */}
        <SettingsModal />
        
      </div>
    </div>
  );
};

export default App;
