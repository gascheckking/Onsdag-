// src/App.tsx - KOMPLETT KOD FÖR ALLA FLIKAR
import React, { useState } from 'react';
import './styles.css'; // Används för grundläggande återställningar

// --- ICON IMPORTS (Dessa är nu installerade, bra!) ---
import { 
    Home, Box, User, Coins, TrendingUp, Users, Package, History, Settings, Award, 
    Target, Brain, ChevronsRight, CheckCircle, Cpu, Wifi, Zap, Award as Trophy
} from 'lucide-react';

// --- STYLED COMPONENTS (Återanvändbara UI-element) ---

/** HoloCard: Använder Tailwind-klasser och den anpassade mesh-neon färgen från index.html */
const HoloCard = ({ children, className = '' }) => (
    <div className={`p-4 bg-gray-900/40 border border-white/10 rounded-xl backdrop-blur-sm transition-all duration-300 ${className}`}>
        {children}
    </div>
);

/** PlatformHeader: Rubrik och ikon för varje flik */
const PlatformHeader = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-3 mb-6 pt-2">
        <Icon size={28} className="text-mesh-neon" />
        <h1 className="text-3xl font-black text-white">{title}</h1>
    </div>
);

/** SubNav: För Loot och Market */
const SubNav = ({ subTabs, activeSubTab, setActiveSubTab }) => (
    <div className="flex bg-gray-900/60 p-1 rounded-full border border-white/10 mb-4">
        {subTabs.map(tab => (
            <button
                key={tab.id}
                className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors duration-200 ${
                    activeSubTab === tab.id 
                        ? 'bg-mesh-neon text-black shadow-lg shadow-mesh-neon/20' 
                        : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveSubTab(tab.id)}
            >
                {tab.label}
            </button>
        ))}
    </div>
);

// --- 1. SLOT MACHINE VIEW ---
const SpawnSlotMegaways = ({ seTokens, freeSpins, onSpin }) => {
    return (
        <HoloCard className="p-6 bg-purple-900/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <h2 className="text-xl font-black text-white mb-3 flex items-center gap-2">
                <Trophy size={20} className="text-yellow-400"/> 🎰 SpawnEngine Megaways
            </h2>
            <div className="flex justify-between text-lg font-mono mb-4">
                <span className="text-gray-400">Tokens: <span className="text-mesh-neon">{seTokens}</span></span>
                <span className="text-gray-400">Free Spins: <span className="text-purple-400">{freeSpins}</span></span>
            </div>
            
            {/* Reels Area - Håller samma storlek som dina kort för en enhetlig layout */}
            <div className="bg-gray-900/70 h-28 rounded-lg flex items-center justify-center mb-4 border border-white/5">
                <span className="text-4xl text-gray-700 font-bold">SPIN</span>
            </div>

            <button
                onClick={onSpin}
                disabled={seTokens < 10 && freeSpins === 0}
                className="w-full py-3 text-lg font-black rounded-lg 
                           bg-mesh-neon text-black hover:bg-green-300 transition-colors disabled:bg-gray-600 disabled:text-gray-400"
            >
                {freeSpins > 0 ? `FREE SPIN (${freeSpins})` : 'SPIN (10 SE Tokens)'}
            </button>
        </HoloCard>
    );
};

// --- 2. MARKET VIEW COMPONENTS ---
const ZoraCoinTrackerCard = ({ name, ticker, price, change, holders }) => {
    const isPositive = change >= 0;
    const historyData = [10, 15, 12, 18, 25, 20, 30, 22, 28, 35, 32, 40].map(val => val + (isPositive ? 0 : 5));
    
    const Sparkline = () => (
        <div className="h-8 w-20 flex items-end overflow-hidden relative">
            {historyData.map((val, i) => (
                <div 
                    key={i} 
                    className={`flex-1 mx-[0.5px] rounded-t-sm transition-all duration-300`}
                    style={{ 
                        height: `${(val / 40) * 100}%`,
                        backgroundColor: isPositive ? 'rgba(0, 255, 192, 0.7)' : 'rgba(239, 68, 68, 0.7)'
                    }}
                />
            ))}
        </div>
    );
    
    return (
        <HoloCard className={`p-4 border-mesh-neon/30 ${isPositive ? 'shadow-[0_0_10px_rgba(0,255,192,0.2)]' : 'shadow-[0_0_10px_rgba(239,68,68,0.2)]'}`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="text-lg font-black text-white">{name}</div>
                    <div className="text-xs text-gray-500 font-mono">@{ticker} · Zora Protocol</div>
                </div>
                <div className="text-right">
                    <div className="text-base font-bold text-white">{price} ETH</div>
                    <div className={`text-xs font-mono font-bold ${isPositive ? 'text-mesh-neon' : 'text-danger'}`}>
                        {isPositive ? '+' : ''}{change.toFixed(2)}%
                    </div>
                </div>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-400">Holders: {holders}</span>
                </div>
                <Sparkline />
            </div>
            
            <button className="w-full mt-4 py-2 text-sm font-bold rounded-lg bg-purple-500/30 text-purple-400 border border-purple-500/50 hover:bg-purple-500/50 transition-colors">
                Trade on Mesh DEX
            </button>
        </HoloCard>
    );
};

// --- 3. CORE VIEWS ---

// --- A. HOME VIEW (Overview) ---
const HomeView = ({ seTokens, currentXP }) => (
    <div className="space-y-5 animate-fade-in">
        <PlatformHeader title="SpawnEngine" icon={Home} />
        
        {/* Kontokort: Matchar layouten från din första skärmdump (Mesh Profile) */}
        <HoloCard className="p-5 bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] grid grid-cols-2 gap-4">
            <div>
                <p className="text-xs text-gray-400">XP Streak</p>
                <p className="text-3xl font-mono font-extrabold text-mesh-neon">{currentXP}</p>
                <p className="text-xs text-gray-500">Daily tasks completed</p>
            </div>
            <div>
                <p className="text-xs text-gray-400">Spawn Balance</p>
                <p className="text-3xl font-mono font-extrabold text-white">{seTokens}</p>
                <p className="text-xs text-gray-500">Test rewards from packs</p>
            </div>
            <div className="col-span-2 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-400 flex items-center gap-1"><Zap size={12} className="text-yellow-400" /> Today's Loop</p>
                <p className="text-sm text-white font-bold mt-1">9 pack_open · mints · swaps</p>
            </div>
        </HoloCard>

        <h3 className="text-lg font-bold text-gray-300 mt-6 flex items-center gap-2"><Target size={18} className="text-yellow-400" /> Active Quests</h3>
        <div className="space-y-3">
            {[
                { title: "Connect Wallet", progress: 1, max: 1, reward: "+100 XP" },
                { title: "Open a Pack", progress: 0, max: 1, reward: "+50 XP" },
                { title: "Spin the Slot 3 Times", progress: 2, max: 3, reward: "+200 SE Tokens" },
            ].map((quest, i) => (
                <HoloCard key={i} className="flex justify-between items-center border-white/10 hover:border-mesh-neon/50">
                    <div>
                        <p className="text-sm font-bold text-white">{quest.title}</p>
                        <p className="text-xs text-gray-500">
                            Progress: {quest.progress}/{quest.max}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-mesh-neon">{quest.reward}</p>
                    </div>
                </HoloCard>
            ))}
        </div>
    </div>
);


// --- B. LOOT VIEW (Packs, Slot, History) ---
const PacksView = ({ openPack }) => (
    <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <Package size={16} className="text-white" /> Available Packs
        </h3>
        <HoloCard className="text-center p-6 bg-red-900/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <p className="text-3xl font-black text-white mb-2">1x ALPHA PACK</p>
            <p className="text-sm text-gray-400">Guaranteed Creator Token Fragment.</p>
            <button 
                onClick={openPack}
                className="w-full mt-4 py-3 text-lg font-black rounded-lg 
                           bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
                OPEN PACK
            </button>
        </HoloCard>
    </div>
);

const SlotView = ({ seTokens, freeSpins, handleSlotSpin }) => (
    <div className="space-y-4">
        <SpawnSlotMegaways 
            seTokens={seTokens} 
            freeSpins={freeSpins}
            onSpin={handleSlotSpin} 
        />
    </div>
);

const HistoryView = ({ historyData }) => (
    <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <History size={16} className="text-yellow-400" /> Recent Activity Log
        </h3>
        <div className="space-y-2">
            {historyData.map((item, i) => (
                <HoloCard key={i} className="p-3 flex justify-between items-center bg-gray-900/50 border-white/5">
                    <div className="flex-1">
                        <p className="text-sm font-bold text-white">{item.type}</p>
                        <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                    <div className="text-right">
                        <p className={`text-sm font-bold ${item.result.startsWith('+') ? 'text-mesh-neon' : 'text-danger'}`}>
                            {item.result}
                        </p>
                        <p className="text-xs text-purple-400">{item.xp}</p>
                    </div>
                </HoloCard>
            ))}
        </div>
    </div>
);

const LootView = ({ activeLootSubTab, setActiveLootSubTab, seTokens, freeSpins, handleSlotSpin, handleOpenPack, historyData }) => (
    <div className="space-y-5 animate-fade-in">
        <PlatformHeader title="Loot" icon={Box} />
        
        <SubNav 
            subTabs={[{id: 'packs', label: 'Packs'}, {id: 'slot', label: 'Spawn Slot'}, {id: 'history', label: 'History'}]}
            activeSubTab={activeLootSubTab}
            setActiveSubTab={setActiveLootSubTab}
        />

        {activeLootSubTab === 'packs' && <PacksView openPack={handleOpenPack} />}
        {activeLootSubTab === 'slot' && (
            <SlotView 
                seTokens={seTokens} 
                freeSpins={freeSpins} 
                handleSlotSpin={handleSlotSpin} 
            />
        )}
        {activeLootSubTab === 'history' && <HistoryView historyData={historyData} />}
    </div>
);


// --- C. MARKET VIEW ---
const MarketView = ({ activeMarketSubTab, setActiveMarketSubTab }) => {
    const MOCK_ZORA_COINS = [
        { name: "SpawnEngine Vibe", ticker: "SEVZ", price: 0.005, change: 8.45, holders: "5.1K" },
        { name: "Base Builder DAO", ticker: "BDAO", price: 0.012, change: -3.11, holders: "2.8K" },
    ];

    return (
        <div className="space-y-5 animate-fade-in">
            <PlatformHeader title="Market" icon={Coins} />
            
            <SubNav 
                subTabs={[{id: 'trending', label: 'Trending'}, {id: 'creators', label: 'Creators'}, {id: 'zora', label: 'Zora Coins'}]}
                activeSubTab={activeMarketSubTab}
                setActiveSubTab={setActiveMarketSubTab}
            />

            {activeMarketSubTab === 'trending' && (
                <>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <TrendingUp size={16} className="text-red-500" /> HOT TRENDING (Drops)
                    </h3>
                    <div className="space-y-3">
                        {[{name: "VibeMarket Booster", price: "0.025 ETH", participants: "1.2K"},
                          {name: "Creator Token · $SPAWNIZ", price: "0.001 ETH", participants: "500"}]
                          .map((item, i) => (
                            <HoloCard key={i} className="p-3 flex justify-between items-center cursor-pointer hover:border-red-500/50">
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
                </>
            )}

            {activeMarketSubTab === 'zora' && (
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Coins size={16} className="text-purple-400" /> TOP CREATOR COINS
                    </h3>
                    {MOCK_ZORA_COINS.map((coin, i) => (
                        <ZoraCoinTrackerCard key={i} {...coin} />
                    ))}
                </div>
            )}
            
            {activeMarketSubTab === 'creators' && (
                <HoloCard className="p-4 border-cyan-500/50 text-center">
                    <h3 className="text-lg font-bold text-cyan-400">Creator Hub</h3>
                    <p className="text-sm text-gray-400 mt-2">Discover, Follow, and Support Top Mesh Builders.</p>
                    <button className="mt-4 px-4 py-2 text-sm rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">
                        View Creator Leaderboard
                    </button>
                </HoloCard>
            )}
        </div>
    );
};


// --- D. BRAIN VIEW ---
const BrainView = () => (
    <div className="space-y-5 animate-fade-in">
        <PlatformHeader title="Brain" icon={Brain} />
        
        <HoloCard className="p-5 bg-green-900/20 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-black text-white">AI Assistant Status</h2>
                <span className="text-xs font-mono text-mesh-neon flex items-center gap-1"><Cpu size={14} /> ONLINE</span>
            </div>
            <p className="text-sm text-gray-400">Ask the Mesh Brain about your stats, quests, or new drops.</p>
            <div className="mt-4 flex gap-2">
                <input type="text" placeholder="Ask a question..." className="flex-1 p-2 text-sm bg-gray-800/80 rounded-lg text-white border border-white/10 focus:border-green-500/50 outline-none" />
                <button className="p-2 bg-green-500/30 rounded-lg text-green-400 border border-green-500/50 hover:bg-green-500/50 transition-colors">
                    <ChevronsRight size={18} />
                </button>
            </div>
        </HoloCard>
        
        <h3 className="text-lg font-bold text-gray-300 mt-6 flex items-center gap-2">
            <Target size={18} className="text-yellow-400" /> Weekly Bounties
        </h3>
        <div className="space-y-3">
            {[
                { title: "Mint 3 Zora NFTs", reward: "+500 SE Tokens", completed: false },
                { title: "Achieve 500 XP this week", reward: "+1 Alpha Pack", completed: true },
                { title: "Trade 1 Creator Coin", reward: "+2 Free Spins", completed: false },
            ].map((bounty, i) => (
                <HoloCard key={i} className={`flex justify-between items-center ${bounty.completed ? 'bg-gray-800/70 border-green-500/30' : 'hover:border-white/20'}`}>
                    <div>
                        <p className={`text-sm font-bold ${bounty.completed ? 'text-green-500 line-through' : 'text-white'}`}>{bounty.title}</p>
                        <p className="text-xs text-gray-500">{bounty.reward}</p>
                    </div>
                    {bounty.completed && <CheckCircle size={20} className="text-green-500" />}
                    {!bounty.completed && (
                        <button className="px-3 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                            VIEW
                        </button>
                    )}
                </HoloCard>
            ))}
        </div>
    </div>
);


// --- E. PROFILE VIEW (Settings & API) ---
const ProfileView = () => (
    <div className="space-y-5 animate-fade-in">
        {/* Profile Header (Matchar exakt layouten från den andra bilden) */}
        <div className="flex items-center gap-3 pt-2 mb-6">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">S</div>
            <div>
                <p className="text-lg font-black text-white">@spawniz</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Mesh ID · Creator</span>
                    <span className="h-2 w-2 bg-mesh-neon rounded-full block"></span>
                    <span className="text-mesh-neon font-bold">Mesh v1.0 PRO</span>
                </div>
            </div>
            {/* Settings-ikonen flyttar sig till höger, matchar bilden */}
            <Settings size={20} className="text-gray-500 ml-auto cursor-pointer hover:text-white" /> 
        </div>

        <h1 className="text-3xl font-black text-white mb-6">Settings & API</h1>

        {/* XP SDK & Integration (Pillar 1) - Matchar bildens knappfärg */}
        <HoloCard className="p-5 bg-gray-900/50 border-mesh-neon/30">
            <h3 className="text-lg font-bold text-white mb-2">XP SDK & Integration (Pillar 1)</h3>
            <p className="text-sm text-gray-400 mb-4">Manage API keys to integrate SpawnEngine XP into your own apps.</p>
            <button className="w-full py-3 text-sm font-bold rounded-lg bg-green-500 text-black hover:bg-green-400 transition-colors">
                Show API Key
            </button>
        </HoloCard>

        {/* Premium Mesh Filters (Pillar 4) */}
        <HoloCard className="p-5 bg-gray-900/50 border-blue-500/30">
            <h3 className="text-lg font-bold text-white mb-2">Premium Mesh Filters (Pillar 4)</h3>
            <p className="text-sm text-gray-400 mb-4">Unlock Alpha Hunters and Whale Tracking. Requires 500 SPN staking.</p>
            <button className="w-full py-3 text-sm font-bold rounded-lg bg-blue-700/50 text-white border border-blue-500 hover:bg-blue-700/70 transition-colors">
                Upgrade to Premium
            </button>
        </HoloCard>

        {/* Launchpad Builder (Pillar 8) */}
        <HoloCard className="p-5 bg-gray-900/50 border-purple-500/30">
            <h3 className="text-lg font-bold text-white mb-2">Launchpad Builder (Pillar 8)</h3>
            <p className="text-sm text-gray-400 mb-4">Access the Zero-Code Token/NFT Builder and Bonding Curve configuration.</p>
            <button className="w-full py-3 text-sm font-bold rounded-lg bg-purple-700/50 text-white border border-purple-500 hover:bg-purple-700/70 transition-colors">
                Open Creator Panel
            </button>
        </HoloCard>

        {/* Manage Notifications */}
        <HoloCard className="p-5 bg-gray-900/50 border-white/10 text-center">
            <button className="w-full py-3 text-lg font-bold rounded-lg bg-gray-700/50 text-white hover:bg-gray-700/70 transition-colors">
                Manage Notifications
            </button>
        </HoloCard>
    </div>
);


// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
    // Initial State (använder mock-värden från dina skärmdumpar)
    const [activeTab, setActiveTab] = useState<'home' | 'loot' | 'market' | 'brain' | 'profile'>('home');
    const [activeLootSubTab, setActiveLootSubTab] = useState<'packs' | 'slot' | 'history'>('packs');
    const [activeMarketSubTab, setActiveMarketSubTab] = useState<'trending' | 'creators' | 'zora'>('trending');
    
    // Global State
    const [seTokens, setSeTokens] = useState(497); // Spawn Balance
    const [freeSpins, setFreeSpins] = useState(5);
    const [currentXP, setCurrentXP] = useState(1575); // XP Streak
    const [history, setHistory] = useState([
        { date: "2025-12-10", type: "Slot Win", result: "+1500 SE Tokens", xp: "+150 XP" }, 
        { date: "2025-12-09", type: "Mint", result: "Zora Drop #443", xp: "+80 XP" }
    ]);

    // HANDLERS
    const handleSlotSpin = () => {
        let win = false;
        let tokensGained = 0;
        let xpGained = 0;

        if (freeSpins > 0) {
            setFreeSpins(fs => fs - 1);
            win = Math.random() < 0.6; 
        } else if (seTokens >= 10) {
            setSeTokens(t => t - 10);
            win = Math.random() < 0.3;
        } else {
            alert("Insufficient SE Tokens!");
            return;
        }

        if (win) {
            tokensGained = Math.floor(Math.random() * 50) + 50; 
            xpGained = 20;
            setSeTokens(t => t + tokensGained);
            setCurrentXP(xp => xp + xpGained);
            setHistory(h => [
                { date: new Date().toLocaleDateString(), type: "Slot Win", result: `+${tokensGained} SE Tokens`, xp: `+${xpGained} XP` },
                ...h
            ]);
        } else {
            xpGained = 5;
            setCurrentXP(xp => xp + xpGained);
            setHistory(h => [
                { date: new Date().toLocaleDateString(), type: "Slot Loss", result: `-10 SE Tokens`, xp: `+${xpGained} XP` },
                ...h
            ]);
        }
    };
    
    const handleOpenPack = () => {
        const tokensGained = Math.floor(Math.random() * 200) + 100;
        const freeSpinsGained = Math.floor(Math.random() * 3) + 1;
        const xpGained = 50;
        
        setSeTokens(t => t + tokensGained);
        setFreeSpins(fs => fs + freeSpinsGained);
        setCurrentXP(xp => xp + xpGained);
        
        alert(`Pack Opened! Gained ${tokensGained} SE Tokens and ${freeSpinsGained} Free Spins.`);

        setHistory(h => [
            { date: new Date().toLocaleDateString(), type: "Pack Open", result: `+${tokensGained} SE Tokens`, xp: `+${xpGained} XP` },
            ...h
        ]);
    }

    // --- RENDER LOGIC ---
    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <HomeView seTokens={seTokens} currentXP={currentXP} />;
            case 'loot':
                return (
                    <LootView 
                        activeLootSubTab={activeLootSubTab} 
                        setActiveLootSubTab={setActiveLootSubTab}
                        seTokens={seTokens} 
                        freeSpins={freeSpins}
                        handleSlotSpin={handleSlotSpin}
                        handleOpenPack={handleOpenPack}
                        historyData={history}
                    />
                );
            case 'market':
                return <MarketView activeMarketSubTab={activeMarketSubTab} setActiveMarketSubTab={setActiveMarketSubTab} />;
            case 'brain':
                return <BrainView />;
            case 'profile':
                return <ProfileView />;
            default:
                return <HomeView seTokens={seTokens} currentXP={currentXP} />;
        }
    };

    return (
        // Använder flex för att centrera innehållet och pusha navbaren till botten
        <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center">
            {/* Neural Mesh Background Animation (Från index.html) */}
            <div className="neural-bg">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
                <div className="grid-overlay"></div>
            </div>

            <div className="w-full max-w-md p-4 pb-20 relative z-10">
                {/* Dynamiskt innehåll baserat på vald flik */}
                {renderContent()}
            </div>
            
            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gray-900/90 backdrop-blur-md border-t border-white/10 p-2 flex justify-around z-50">
                {[
                    { id: 'home', icon: Home, label: 'Home' },
                    { id: 'loot', icon: Box, label: 'Loot' },
                    { id: 'market', icon: Coins, label: 'Market' },
                    { id: 'brain', icon: Brain, label: 'Brain' },
                    { id: 'profile', icon: User, label: 'Profile' },
                ].map((item) => (
                    <button
                        key={item.id}
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
                            activeTab === item.id ? 'text-mesh-neon' : 'text-gray-500 hover:text-white'
                        }`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <item.icon size={24} />
                        <span className="text-xs mt-1">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default App;
