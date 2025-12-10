import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Home, Sword, Box, User, Settings, Zap, 
  Wallet, Trophy, Sparkles, Activity, ArrowRight, 
  Terminal, Cpu, Coins, Flame, RefreshCw,
  ChevronRight, ExternalLink, ShieldCheck, TrendingUp, HelpCircle, Send, Users, Layers, Star,
  GitBranch, Gem, Gift, DollarSign, RotateCw, Globe, Target
} from 'lucide-react';

// --- TYPES & INTERFACES ---
type MainTab = 'home' | 'loot' | 'market' | 'brain' | 'profile';
type LootSubTab = 'packs' | 'slot' | 'history';
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

// 3. GAS METER
const GasMeter = () => {
  const [gwei, setGwei] = useState(0.33);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGwei(prev => Math.max(0.01, +(prev + (Math.random() * 0.04 - 0.02)).toFixed(3)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const color = gwei < 0.2 ? 'text-emerald-400' : gwei < 0.5 ? 'text-yellow-400' : 'text-red-400';
  
  return (
    <div className="flex flex-col gap-1 w-20">
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-gray-400 font-mono">GAS:</span>
        <span className={`text-xs font-bold font-mono ${color}`}>{gwei.toFixed(2)} Gwei</span>
      </div>
    </div>
  );
};

// 4. SPAWNENGINE MEGAWAYS SLOT V4.0 (MED DYNAMISK STORLEK OCH $S SCATTER)
interface SlotResult {
    payout: number;
    win: boolean;
    freeSpinTriggered: boolean;
}

const SYMBOLS = {
    // Symbol | Payout (per match 5) | Color | Icon | Scatter
    '$S': { payout: 1000, color: 'text-mesh-neon', icon: <DollarSign size={32} className="text-mesh-neon" />, scatter: true }, // SpawnToken / Scatter
    '⚔️': { payout: 500, color: 'text-red-500', icon: <Sword size={32} className="text-red-500" />, scatter: false }, // High
    '7️⃣': { payout: 250, color: 'text-amber-400', icon: '7️⃣', scatter: false }, // Medium
    '💎': { payout: 100, color: 'text-purple-400', icon: <Gem size={32} className="text-purple-400" />, scatter: false }, // Low
    '📦': { payout: 0, color: 'text-gray-500', icon: <Box size={32} className="text-gray-500" />, scatter: false }, // Low
};
const SYMBOL_KEYS = Object.keys(SYMBOLS);
const BET_COST = 500;
const MAX_REELS = 5;

// Funktion för att slumpa fram symboler
const rollSymbol = () => {
    // Justerar vikter för att göra Scatter ($S) lite mer sällsynt men inte omöjligt
    const weights = [0.08, 0.15, 0.2, 0.25, 0.32]; // $S, ⚔️, 7️⃣, 💎, 📦
    const rand = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < SYMBOL_KEYS.length; i++) {
        cumulativeWeight += weights[i];
        if (rand < cumulativeWeight) {
            return SYMBOL_KEYS[i];
        }
    }
    return SYMBOL_KEYS[SYMBOL_KEYS.length - 1]; // Fallback (📦)
};

// Reel komponent som visar en stapel med symboler (Megaways-känslan)
const Reel = ({ symbols, reelHeight, spinning }: { symbols: string[], reelHeight: number, spinning: boolean }) => {
    // Använder en statisk symbol per 'drop' för enkelheten, men visuellt staplar vi dem
    const mainSymbol = symbols[Math.floor(symbols.length / 2)] || '📦';
    const symbolData = SYMBOLS[mainSymbol as keyof typeof SYMBOLS] || SYMBOLS['📦'];
    const content = (typeof symbolData.icon === 'string' ? symbolData.icon : symbolData.icon) || mainSymbol;
    const isScatter = symbolData.scatter;

    // Dynamisk höjd baserat på reelHeight (Megaways-effekt)
    const heightClass = `h-[${reelHeight * 25}px] min-h-[75px] max-h-[175px]`; // 3x25=75px (min 3 symboler) till 7x25=175px (max 7 symboler)

    return (
        <div 
            style={{ height: `${reelHeight * 32}px` }} // Ökad storlek för bättre mobilvisning
            className={`flex-1 flex flex-col items-center justify-center bg-[#070707] rounded-lg border-2 
                        transition-transform duration-100 ease-linear ${spinning ? 'opacity-50 blur-[2px] border-gray-900' : 'opacity-100 border-gray-700'} 
                        text-2xl sm:text-4xl shadow-inner overflow-hidden relative`}
        >
            <div className={`text-center transition-all duration-300 ${spinning ? 'translate-y-0' : 'translate-y-0'}`}>
                 <span className={`${symbolData.color} ${!spinning ? (isScatter ? 'text-glow-fs' : 'text-glow') : ''} ${isScatter ? 'text-5xl font-extrabold' : 'text-4xl'}`}>
                    {content}
                </span>
                <span className="text-[10px] text-gray-500 block mt-1">{reelHeight} Ways</span>
            </div>

            {/* Neon Border för Scatter symbolen */}
            {isScatter && !spinning && (
                <div className="absolute inset-0 border-4 border-mesh-neon rounded-lg animate-pulse pointer-events-none"></div>
            )}
        </div>
    );
};

const SpawnSlotMegaways = ({ seTokens, setSeTokens, freeSpins, setFreeSpins, onSpin }: { 
    seTokens: number, 
    setSeTokens: (amount: number) => void,
    freeSpins: number,
    setFreeSpins: (amount: number) => void,
    onSpin: (result: SlotResult) => void
}) => {
    const [spinning, setSpinning] = useState(false);
    const [reels, setReels] = useState<string[][]>(Array(MAX_REELS).fill(null).map(() => Array(5).fill('$S')));
    const [reelHeights, setReelHeights] = useState<number[]>(Array(MAX_REELS).fill(5));
    const [message, setMessage] = useState(`BET: ${BET_COST} SE. Match 3+ or land 3x $S for FS!`);
    const [error, setError] = useState('');
    const [multiplier, setMultiplier] = useState(1);
    
    // Antal symboler per hjul (3-7, Megaways-känslan)
    const generateReelHeight = () => Math.floor(Math.random() * 5) + 3; // 3 till 7

    const hasFreeSpin = freeSpins > 0;
    const canSpin = hasFreeSpin || seTokens >= BET_COST;

    const calculateResult = (finalReels: string[][]): SlotResult => {
        const flatSymbols = finalReels.flat(); // Samtliga symboler på skärmen (för scatter och matchning)
        
        // 1. SCATTER / FREE SPIN LOGIC ($S)
        const scatterCount = flatSymbols.filter(s => SYMBOLS[s as keyof typeof SYMBOLS].scatter).length;
        const freeSpinTriggered = scatterCount >= 3;
        
        // 2. PAYOUT LOGIC (förenklat: match 3+ av en symbol någonstans på skärmen)
        let payout = 0;
        let win = false;
        
        const counts: { [key: string]: number } = flatSymbols.reduce((acc, symbol) => {
            if (symbol !== '$S' && symbol !== '📦') { // Uteslut Scatter och Empty för vanlig vinst
                acc[symbol] = (acc[symbol] || 0) + 1;
            }
            return acc;
        }, {});
        
        for (const symbol in counts) {
            const count = counts[symbol];
            if (count >= 3) {
                win = true;
                const basePayout = SYMBOLS[symbol as keyof typeof SYMBOLS].payout;
                let winMultiplier = 0;
                if (count === 3) winMultiplier = 0.5;
                if (count === 4) winMultiplier = 1;
                if (count >= 5) winMultiplier = 3;
                
                payout += basePayout * winMultiplier;
            }
        }
        
        return { 
            payout: Math.round(payout * multiplier), 
            win: win, 
            freeSpinTriggered 
        };
    };

    const handleSpin = () => {
        if (spinning || !canSpin) {
            if (!canSpin) setError('Not enough SE Tokens! Minimum bet: 500 SE');
            return;
        }
        setError('');
        
        // Återställ multiplikatorn om det inte är Freespin
        if (!hasFreeSpin) setMultiplier(1); 

        // Hantera insats/Freespin kostnad
        if (hasFreeSpin) {
            setFreeSpins(freeSpins - 1);
            setMessage(`FREE SPIN! Current Multiplier: x${multiplier}`);
        } else {
            setSeTokens(seTokens - BET_COST);
            setMessage('ROLLING MEGAWAYS...');
        }
        
        setSpinning(true);
        
        // Generera nya hjulhöjder och det faktiska slutresultatet 
        const newHeights = Array(MAX_REELS).fill(null).map(generateReelHeight);
        setReelHeights(newHeights);

        const finalReels = newHeights.map(height => 
            Array(height).fill(null).map(rollSymbol)
        );
        
        let iterations = 0;
        const spinInterval = setInterval(() => {
            // Under spinning, visa slumpmässiga symboler
            setReels(newHeights.map(height => 
                Array(height).fill(null).map(rollSymbol)
            ));
            iterations++;
            
            if (iterations > 30) {
                clearInterval(spinInterval);
                
                // Sätt slutresultatet
                setReels(finalReels);
                const result = calculateResult(finalReels);
                
                // Hantera utbetalning/vinst
                if (result.freeSpinTriggered) {
                    const newFS = 5;
                    setFreeSpins(f => f + newFS);
                    setMessage(`💥 MEGAWAY SCATTER WIN! +${newFS} FREE SPINS! 💥`);
                    setMultiplier(2); // Starta Freespin med x2 multiplikator
                } else if (result.payout > 0) {
                    setSeTokens(s => s + result.payout);
                    setMessage(`BIG WIN! +${result.payout} SE Tokens! (x${multiplier})`);
                    if (!hasFreeSpin) setMultiplier(m => m + 1); // Öka Multiplikatorn vid vinst (för nästa runda)
                } else {
                    setMessage('NO MATCH - Try again');
                    if (!hasFreeSpin) setMultiplier(1);
                }

                setSpinning(false);
                onSpin(result);
            }
        }, 60);
    };

    // Anpassad CSS för Neon Scatter Glow
    useEffect(() => {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            @keyframes glow-fs {
                0%, 100% { box-shadow: 0 0 10px rgba(0, 255, 192, 0.5), 0 0 20px rgba(0, 255, 192, 0.3); }
                50% { box-shadow: 0 0 15px rgba(0, 255, 192, 0.8), 0 0 30px rgba(0, 255, 192, 0.5); }
            }
            .text-glow-fs {
                text-shadow: 0 0 10px rgba(0, 255, 192, 0.7);
                animation: glow-fs 1.5s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

    return (
        <div className="relative p-1 rounded-3xl bg-gradient-to-b from-purple-700 to-blue-800 shadow-2xl border-4 border-mesh-neon/50">
            <div className="bg-black/90 rounded-2xl p-4 border-2 border-gray-900">
                
                <h3 className="text-center text-xl font-black text-mesh-neon mb-2 tracking-widest uppercase">
                    SpawnEngine Megaways
                </h3>
                
                {/* Info / Progressive Jackpot */}
                <div className="text-center mb-4 p-2 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
                    <span className="text-xs font-mono text-yellow-300">PROGRESSIVE JACKPOT: 500,000+ SE</span>
                </div>

                {/* Slot Reels Container */}
                <div className="flex gap-2">
                    {/* Multiplier Display (Vänster sida) */}
                    <div className="w-10 flex flex-col items-center justify-around bg-gray-900 rounded-lg p-1 border-2 border-gray-700">
                        <span className="text-[10px] text-gray-400 font-mono rotate-180" style={{ writingMode: 'vertical-lr' }}>MULTIPLIER</span>
                        <div className={`text-3xl font-black font-mono ${multiplier > 1 ? 'text-mesh-neon text-glow animate-pulse-slow' : 'text-gray-500'}`}>
                            x{multiplier}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono rotate-180" style={{ writingMode: 'vertical-lr' }}>LEVEL</span>
                    </div>

                    {/* Reels */}
                    <div className="flex-1 flex justify-between gap-1.5 p-1 bg-[#090909] rounded-lg border-2 border-gray-800 shadow-inner">
                        {reels.map((symbols, i) => (
                            <Reel key={i} symbols={symbols} reelHeight={reelHeights[i]} spinning={spinning} />
                        ))}
                    </div>

                    {/* Slot Handle (Höger sida) */}
                    <div className="w-8 flex items-center justify-center">
                        <button onClick={handleSpin} disabled={spinning || !canSpin} className="relative w-full h-1/2 bg-red-600 rounded-full hover:bg-red-500 transition-all active:scale-90 disabled:opacity-50">
                            <div className="w-4 h-4 bg-red-300 rounded-full absolute top-1 left-1/2 -translate-x-1/2 shadow-inner" />
                            <div className="w-2 h-full bg-red-800 rounded-b-full mx-auto" />
                        </button>
                    </div>
                </div>
                
                {/* Win / Status Message */}
                <div className="text-center font-mono text-sm my-3 tracking-widest h-5">
                    {error ? (
                        <span className="text-red-500 animate-pulse">{error}</span>
                    ) : (
                        <span className="text-mesh-neon">{message}</span>
                    )}
                </div>

                {/* Footer Controls (Matcha bilden) */}
                <div className="flex justify-between items-center mt-4 p-2 rounded-lg bg-gray-900/50 border border-gray-700">
                    {/* Bet Display */}
                    <div className="flex flex-col text-xs font-mono text-gray-400">
                        BET: <span className="text-white font-bold">{BET_COST} SE</span>
                    </div>

                    {/* Spin Button */}
                    <button 
                        onClick={handleSpin}
                        disabled={spinning || !canSpin}
                        className={`w-36 py-2 rounded-full font-bold text-sm shadow-[0_0_15px_rgba(0,255,192,0.6)] active:scale-95 transition-transform disabled:opacity-50 
                            ${hasFreeSpin ? 'bg-cyan-500 text-black' : 'bg-mesh-neon text-black'}`}
                    >
                        {spinning ? <RotateCw size={18} className="animate-spin inline mr-1" /> : hasFreeSpin ? 'FREE SPIN' : 'SPIN'}
                    </button>
                    
                    {/* Free Spins / Autoplay */}
                    <div className="flex flex-col text-xs font-mono text-right text-gray-400">
                        FS: <span className={`font-bold ${hasFreeSpin ? 'text-mesh-neon' : 'text-gray-500'}`}>{freeSpins}</span>
                        <span className="text-[10px] text-purple-400 mt-0.5 cursor-pointer hover:underline">AUTOPLAY</span>
                    </div>
                </div>
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
  const [activeTab, setActiveTab] = useState<MainTab>('loot'); // Startar direkt på Loot-fliken
  const [showSettings, setShowSettings] = useState(false);
  const [xp, setXp] = useState(5208); // Uppdaterad XP för att matcha bilden
  const [seTokens, setSeTokens] = useState(5000); // MOCK TOKEN BALANCE
  const [freeSpins, setFreeSpins] = useState(5); // MOCK FREE SPINS (Matcha bilden)
  const [activeLootSubTab, setActiveLootSubTab] = useState<LootSubTab>('slot');
  const [activeBrainSubTab, setActiveBrainSubTab] = useState<BrainSubTab>('quests');
  const [latestSupCast, setLatestSupCast] = useState(MOCK_SUPCASTS[0].context);
  
  // -- HANDLERS --
  const addXP = (amount: number) => setXp(p => p + amount);
  const handleSlotSpin = (result: SlotResult) => {
    addXP(100); // Mer XP för Megaways Spin
    if (result.win) addXP(result.payout / 100); // Extra XP for big win
  };
  
  // --- SUB TAB VIEWS ---
  
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
    <div className="space-y-4">
      {/* SpawnEngine Megaways Slot */}
      <SpawnSlotMegaways 
          seTokens={seTokens} 
          setSeTokens={setSeTokens}
          freeSpins={freeSpins}
          setFreeSpins={setFreeSpins}
          onSpin={handleSlotSpin} 
      />
    </div>
  );

  const HistoryView = () => (
    <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-300">Recent Activity</h3>
        {[{date: "2025-12-10", type: "Slot Win", result: "+1500 SE Tokens", xp: "+150 XP"}, 
          {date: "2025-12-09", type: "Mint", result: "Zora Drop #443", xp: "+80 XP"}]
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


  // 2. Brain Sub Views (Minskade för fokus)
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
                            Start Quest
                        </button>
                    )}
                </div>
            </HoloCard>
        ))}
    </div>
  );
  
  const AIMeshHelperView = () => (
    <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-300">AI Mesh Helper (Coming Soon)</h3>
        <SpawnBotTerminal />
        <p className="text-xs text-gray-500">The SpawnBot Terminal is your interface to the AI Mesh. Use commands to scan, mint, or automate actions.</p>
    </div>
  );

  const SupCastView = () => (
    <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-300">Create SupCast (Coming Soon)</h3>
        <p className="text-xs text-gray-500">SupCast will allow direct feedback and idea submission to the core team.</p>
        <div className="space-y-2">
            {MOCK_SUPCASTS.map(sc => (
                <HoloCard key={sc.id} className="p-3 opacity-50">
                    <div className="text-sm font-bold text-white">{sc.title}</div>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{sc.context}</p>
                </HoloCard>
            ))}
        </div>
    </div>
  );

  // --- MAIN TAB VIEWS ---
  
  const PlatformHeader = ({ title, icon: Icon, actions = null }: { title: string, icon: React.ElementType, actions?: React.ReactNode }) => (
      <div className="flex justify-between items-center p-4 rounded-xl bg-black/50 border border-white/10 mb-4">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Icon size={20} className="text-mesh-neon" /> {title}
          </h1>
          {actions}
      </div>
  );


  const HomeView = () => (
    <div className="space-y-6 animate-fade-in">
        <PlatformHeader 
            title="Overview" 
            icon={Home} 
            actions={<button onClick={() => setShowSettings(true)} className="text-gray-400 hover:text-white"><Settings size={20} /></button>}
        />
        
        {/* Huvudstatistik (Matcha bilden) */}
        <div className="grid grid-cols-2 gap-4">
            <HoloCard className="border-mesh-neon/30">
                <div className="text-sm text-gray-400">SpawnEngine Tokens (SE)</div>
                <div className="text-2xl font-black text-white">{seTokens.toLocaleString()}</div>
                <div className="text-xs text-mesh-neon font-mono mt-1">+1.08% / 30d</div>
            </HoloCard>
            <HoloCard className="border-purple-500/30">
                <div className="text-sm text-gray-400">Total XP</div>
                <div className="text-2xl font-black text-white">{xp.toLocaleString()}</div>
                <div className="text-xs text-purple-400 font-mono mt-1">Lvl 12</div>
            </HoloCard>
        </div>

        {/* Live Feed */}
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
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${item.type === 'mint' ? 'bg-purple-500/20 text-purple-400' : item.type === 'bot' ? 'bg-mesh-cyan/20 text-mesh-cyan' : 'bg-orange-500/20 text-orange-400'}`}>
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
        <PlatformHeader 
            title="Loot" 
            icon={Sword} 
            actions={
                <div className="flex gap-2">
                    <button className="text-xs text-purple-400 font-bold hover:text-purple-300">Post Loot</button>
                    <button className="text-xs text-gray-400 hover:text-white">History</button>
                </div>
            }
        />

        {/* Loot Sub Nav */}
        <SubNav 
            subTabs={[{id: 'packs', label: 'Packs'}, {id: 'slot', label: 'Spawn Slot'}, {id: 'history', label: 'History'}]}
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
        <PlatformHeader title="Market" icon={Box} />
        <SubNav 
            subTabs={[{id: 'trending', label: 'Trending'}, {id: 'creators', label: 'Creators'}, {id: 'zora', label: 'Zora Coins'}]}
            activeSubTab={'trending'}
            setActiveSubTab={() => {}}
        />

        <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-red-500" /> HOT TRENDING
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
        <PlatformHeader title="Brain" icon={Terminal} />
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
        <PlatformHeader title="Profile" icon={User} />
        <HoloCard className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-mesh-neon to-mesh-purple mb-3 p-[3px]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-3xl">👾</div>
            </div>
            <h2 className="text-xl font-bold text-white">@spawniz</h2>
            <p className="text-xs text-gray-400">Mesh Architect | XP Lvl 12 | Base Builder</p>
        </HoloCard>
        
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-300">Account Overview</h3>
            {[
                { title: 'Preferred Wallet', value: generateAddress().slice(0, 10) + '...', icon: Wallet },
                { title: 'Linked Farcaster Handle', value: '@spawniz (Active)', icon: Users },
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

          {/* New Settings UI from image */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-mesh-neon">Settings & API</h2>
            
            <HoloCard className="border-mesh-neon/50">
                <div className="text-sm font-bold text-white mb-1">XP SDK & Integration (Pillar 1)</div>
                <p className="text-xs text-gray-400 mb-3">Manage API keys to integrate SpawnEngine XP into your own apps.</p>
                <button className="w-full py-2 rounded bg-mesh-neon text-black font-bold text-sm hover:opacity-90">
                    Show API Key
                </button>
            </HoloCard>

            <HoloCard className="border-purple-500/50">
                <div className="text-sm font-bold text-white mb-1">Premium Mesh Filters (Pillar 4)</div>
                <p className="text-xs text-gray-400 mb-3">Unlock Alpha Hunters and Whale Tracking. Requires 500 SPN staking.</p>
                <button className="w-full py-2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/50 font-bold text-sm hover:bg-purple-500/30">
                    Upgrade to Premium
                </button>
            </HoloCard>
            
            <HoloCard className="border-blue-500/50">
                <div className="text-sm font-bold text-white mb-1">Launchpad Builder (Pillar 8)</div>
                <p className="text-xs text-gray-400 mb-3">Access the Zero-Code Token/NFT Builder and Bonding Curve configuration.</p>
                <button className="w-full py-2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/50 font-bold text-sm hover:bg-blue-500/30">
                    Open Creator Panel
                </button>
            </HoloCard>
            
            <button className="w-full py-3 rounded-xl bg-white/5 text-gray-300 font-bold text-sm hover:bg-white/10 mt-4">
                Manage Notifications
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
      
      {/* PLATTFORMSCONTAINER SOM MATCHAR BILDEN */}
      <div className="min-h-screen relative flex">
        
        {/* VÄNSTER NAV (Sidebar) */}
        <nav className="hidden sm:flex flex-col w-20 bg-black/50 backdrop-blur-lg border-r border-white/10 p-2 pt-16 sticky top-0 h-screen z-40">
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
                  className={`flex flex-col items-center justify-center p-3 my-1 rounded-xl transition-all duration-300 
                              ${isActive ? 'bg-mesh-neon/20 text-mesh-neon shadow-[0_0_10px_rgba(0,255,192,0.3)]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                >
                  <tab.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">{tab.label}</span>
                </button>
              )
            })}
        </nav>

        {/* HÖGER CONTAINER (Huvudområdet) */}
        <div className="flex-1 flex flex-col relative overflow-y-auto">
            
            {/* TOP HEADER BAR */}
            <header className="sticky top-0 z-30 px-4 py-3 backdrop-blur-md bg-black/30 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="sm:hidden w-8 h-8 rounded-lg bg-gradient-to-br from-mesh-neon to-blue-600 flex items-center justify-center font-black text-black italic">
                        SE
                    </div>
                    <span className="font-bold text-lg tracking-wider hidden sm:block">SPAWN<span className="text-mesh-neon">ENGINE</span></span>
                    
                    {/* Huvudstatistik i toppen (Matcha bilden) */}
                    <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
                        <div className="flex items-center gap-1 text-gray-400">
                            <Coins size={12} className="text-yellow-400" />
                            Tokens: <span className="text-white font-bold">{seTokens.toLocaleString()} SE</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                            <Trophy size={12} className="text-purple-400" />
                            XP: <span className="text-white font-bold">{xp.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <GasMeter />
                    <button onClick={() => setShowSettings(true)} className="p-2 rounded-full text-gray-400 hover:text-white transition-colors border border-gray-700">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                <div className="max-w-xl mx-auto sm:max-w-full">
                    {activeTab === 'home' && <HomeView />}
                    {activeTab === 'loot' && <LootView />}
                    {activeTab === 'market' && <MarketView />}
                    {activeTab === 'brain' && <BrainView />}
                    {activeTab === 'profile' && <ProfileView />}
                </div>
            </main>

            {/* BOTTOM NAV (Endast Mobil - Döljs på Desktop/Plattformsvy) */}
            <nav className="sm:hidden fixed bottom-0 left-0 w-full z-40 px-4 pb-4 pt-2">
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

        </div>
        
        {/* OVERLAYS */}
        <SettingsModal />
        
      </div>
    </div>
  );
};

export default App;
