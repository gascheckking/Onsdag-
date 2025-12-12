// src/App.tsx - EXAKT REPLIKATION AV DIN ÖNSKADE DESIGN FÖR HOME VIEW

import React, { useState } from 'react';
import './styles.css'; 
import { 
    Home, Box, User, Coins, TrendingUp, Users, Package, History, Settings, Award, 
    Target, Brain, ChevronsRight, CheckCircle, Cpu, Zap, Award as Trophy, Link, Map, Code, Activity
} from 'lucide-react';

// --- STYLED COMPONENTS (Använder de globala färgerna) ---

/** CompactCard: Använder nu de nya färgvariablerna från tailwind.config.js */
const CompactCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`p-4 bg-spawn-card border border-spawn-border rounded-xl transition-all duration-300 ${className}`}>
        {children}
    </div>
);

/** SectionTitle: Används för rubriker i andra vyer */
const SectionTitle: React.FC<{ title: string; icon: React.ElementType }> = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-2 mt-4 mb-2">
        <Icon size={20} className="text-spawn-success" />
        <h2 className="text-xl font-black text-spawn-primary">{title}</h2>
    </div>
);

/** SubNav: För Loot och Market */
const SubNav = ({ subTabs, activeSubTab, setActiveSubTab }) => (
    <div className="flex bg-spawn-card p-1 rounded-md border border-spawn-border mb-3 text-xs">
        {subTabs.map(tab => (
            <button
                key={tab.id}
                className={`flex-1 py-1.5 font-bold rounded-sm transition-colors duration-200 ${
                    activeSubTab === tab.id 
                        ? 'bg-spawn-primary text-spawn-bg shadow-sm' 
                        : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveSubTab(tab.id)}
            >
                {tab.label}
            </button>
        ))}
    </div>
);


// --- 1. HOME VIEW (MATCHAR SKÄRMDUMPEN EXAKT) ---
const HomeView = ({ seTokens, currentXP }) => (
    <div className="space-y-4 animate-fade-in">

        {/* Top Header/Status Bar (Replikation av skärmdumpens utseende) */}
        <div className="grid grid-cols-5 gap-2 text-[10px] items-center text-center font-mono">
            <div className="col-span-2 text-left text-gray-400">
                WALLET <span className="text-red-400 block leading-none">Disconnected</span>
            </div>
            <div className="col-span-1 text-gray-400 leading-none">
                GAS <span className="text-spawn-success block leading-none">-0.25 gwei est.</span>
            </div>
            <div className="col-span-2 text-right text-gray-400">
                <span className="text-white block leading-none">9 events</span>
                <span className="text-gray-500 block leading-none">v0.2 - mock</span>
            </div>
        </div>

        {/* Mesh Profile Card */}
        <CompactCard className="space-y-4 pt-3 pb-3 bg-spawn-card/70 border-spawn-primary/20">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Activity size={20} className="text-spawn-primary" /> MESH PROFILE
            </h2>
            <div className="flex justify-between items-center pb-2 border-b border-spawn-border">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-spawn-success">@spawnengine</span>
                    <span className="text-[10px] text-gray-500 border border-gray-600 px-2 py-0.5 rounded-full">ONLINE</span>
                </div>
                <div className="text-xs text-right text-gray-400">
                    One wallet, multiple contract types.
                </div>
            </div>

            {/* Stats Block (XP, Balance, Events) */}
            <div className="grid grid-cols-3 gap-2 text-sm text-center">
                <div className="p-2 border border-spawn-border rounded-lg bg-black/20">
                    <p className="font-extrabold text-white text-lg leading-none">{currentXP}</p>
                    <p className="text-[10px] text-gray-500 mt-1">XP STREAK</p>
                </div>
                <div className="p-2 border border-spawn-border rounded-lg bg-black/20">
                    <p className="font-extrabold text-white text-lg leading-none">{seTokens}</p>
                    <p className="text-[10px] text-gray-500 mt-1">SPAWN BALANCE</p>
                </div>
                <div className="p-2 border border-spawn-border rounded-lg bg-black/20">
                    <p className="font-extrabold text-white text-lg leading-none">9</p>
                    <p className="text-[10px] text-gray-500 mt-1">TODAY'S EVENTS</p>
                </div>
            </div>
        </CompactCard>

        {/* Linked Apps Section */}
        <CompactCard className="space-y-3 bg-spawn-card/70 border-spawn-primary/20">
            <h3 className="text-sm font-black text-spawn-primary flex items-center gap-2">
                <Link size={16} /> LINKED APPS
            </h3>
            <div className="flex justify-between items-center p-2 border border-spawn-border rounded-lg bg-black/20">
                <div className="text-sm text-white">Base Wallet</div>
                <span className="text-xs font-bold text-red-400 border border-red-400 px-2 py-0.5 rounded-full">REQUIRED</span>
            </div>
            <p className="text-xs text-gray-500">
                Your first wallet to lock in your mesh identity.
            </p>
        </CompactCard>

        {/* Social Surfaces Section */}
        <CompactCard className="space-y-3 bg-spawn-card/70 border-spawn-primary/20">
            <h3 className="text-sm font-black text-spawn-primary flex items-center gap-2">
                <Code size={16} /> SOCIAL SURFACES
            </h3>
            <div className="flex justify-between items-center p-2 border border-spawn-border rounded-lg bg-black/20">
                <div className="text-sm text-white">Farcaster & Zora</div>
                <span className="text-xs font-bold text-yellow-400 border border-yellow-400 px-2 py-0.5 rounded-full">PLANNED</span>
            </div>
            <p className="text-xs text-gray-500">
                Your casts and creator actions will become first-class events.
            </p>
        </CompactCard>

        {/* Today's Loop */}
        <CompactCard className="space-y-3 bg-spawn-card/70 border-spawn-primary/20">
            <h3 className="text-sm font-black text-spawn-primary flex justify-between items-center">
                Today's loop 
                <span className="text-xs font-bold text-spawn-success">+250 XP available</span>
            </h3>
            
            <div className="space-y-2">
                {[
                    { title: "Open a test pack", progress: true, reward: "+50 XP" },
                    { title: "Connect wallet", progress: true, reward: "+100 XP" },
                    { title: "Share your mesh", progress: false, reward: "+100 XP" },
                ].map((quest, i) => (
                    <div key={i} className="flex justify-between items-center p-2 border-b border-spawn-border/50">
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                checked={quest.progress} 
                                readOnly 
                                className={`h-4 w-4 rounded border-spawn-border cursor-pointer ${quest.progress ? 'bg-spawn-success' : 'bg-gray-700'}`}
                            />
                            <p className={`text-sm font-bold ${quest.progress ? 'text-gray-500 line-through' : 'text-white'}`}>{quest.title}</p>
                        </div>
                        <p className={`text-sm font-bold ${quest.progress ? 'text-gray-600' : 'text-spawn-success'}`}>{quest.reward}</p>
                    </div>
                ))}
            </div>
        </CompactCard>
    </div>
);


// --- ÖVRIGA VIEWS (Behålls i den kompakta stilen) ---
// Slot View anpassas
const SpawnSlotMegaways = ({ seTokens, freeSpins, onSpin }) => {
    return (
        <CompactCard className="p-4 bg-purple-900/20 border-purple-500/50">
            <h2 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-400"/> SpawnEngine Megaways
            </h2>
            <div className="flex justify-between text-sm font-mono mb-3">
                <span className="text-gray-400">Tokens: <span className="text-spawn-primary">{seTokens}</span></span>
                <span className="text-gray-400">Free Spins: <span className="text-purple-400">{freeSpins}</span></span>
            </div>
            
            <div className="bg-gray-900/70 h-20 rounded-lg flex items-center justify-center mb-3 border border-white/5">
                <span className="text-3xl text-gray-700 font-bold">SPIN</span>
            </div>

            <button
                onClick={onSpin}
                disabled={seTokens < 10 && freeSpins === 0}
                className="w-full py-2 text-sm font-black rounded-lg 
                           bg-spawn-success text-black hover:bg-green-300 transition-colors disabled:bg-gray-600 disabled:text-gray-400"
            >
                {freeSpins > 0 ? `FREE SPIN (${freeSpins})` : 'SPIN (10 SE Tokens)'}
            </button>
        </CompactCard>
    );
};

// Loot View anpassas för att använda SectionTitle
const PacksView = ({ openPack }) => (
    <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <Package size={16} className="text-white" /> Available Packs
        </h3>
        <CompactCard className="text-center p-6 bg-red-900/20 border-red-500/50">
            <p className="text-3xl font-black text-white mb-2">1x ALPHA PACK</p>
            <p className="text-sm text-gray-400">Guaranteed Creator Token Fragment.</p>
            <button 
                onClick={openPack}
                className="w-full mt-4 py-3 text-lg font-black rounded-lg 
                           bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
                OPEN PACK
            </button>
        </CompactCard>
    </div>
);

const HistoryView = ({ historyData }) => (
    <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
            <History size={16} className="text-yellow-400" /> Recent Activity Log
        </h3>
        <div className="space-y-2">
            {historyData.map((item, i) => (
                <CompactCard key={i} className="p-3 flex justify-between items-center bg-gray-900/50 border-white/5">
                    <div className="flex-1">
                        <p className="text-sm font-bold text-white">{item.type}</p>
                        <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                    <div className="text-right">
                        <p className={`text-sm font-bold ${item.result.startsWith('+') ? 'text-spawn-success' : 'text-red-400'}`}>
                            {item.result}
                        </p>
                        <p className="text-xs text-purple-400">{item.xp}</p>
                    </div>
                </CompactCard>
            ))}
        </div>
    </div>
);


const LootView = ({ activeLootSubTab, setActiveLootSubTab, seTokens, freeSpins, handleSlotSpin, handleOpenPack, historyData }) => (
    <div className="space-y-4 animate-fade-in">
        <SectionTitle title="Loot" icon={Box} />
        <SubNav 
            subTabs={[{id: 'packs', label: 'Packs'}, {id: 'slot', label: 'Spawn Slot'}, {id: 'history', label: 'History'}]}
            activeSubTab={activeLootSubTab}
            setActiveSubTab={setActiveLootSubTab}
        />
        {activeLootSubTab === 'packs' && <PacksView openPack={handleOpenPack} />}
        {activeLootSubTab === 'slot' && (<SpawnSlotMegaways seTokens={seTokens} freeSpins={freeSpins} onSpin={handleSlotSpin} />)}
        {activeLootSubTab === 'history' && <HistoryView historyData={historyData} />}
    </div>
);

// Market View anpassas
const ZoraCoinTrackerCard = ({ name, ticker, price, change, holders }) => {
    const isPositive = change >= 0;
    const historyData = [10, 15, 12, 18, 25, 20, 30, 22, 28, 35, 32, 40].map(val => val + (isPositive ? 0 : 5));
    
    const Sparkline = () => (
        <div className="h-6 w-16 flex items-end overflow-hidden relative">
            {historyData.map((val, i) => (
                <div 
                    key={i} 
                    className={`flex-1 mx-[0.5px] rounded-t-sm transition-all duration-300`}
                    style={{ 
                        height: `${(val / 40) * 100}%`,
                        backgroundColor: isPositive ? 'rgba(74, 255, 180, 0.7)' : 'rgba(239, 68, 68, 0.7)'
                    }}
                />
            ))}
        </div>
    );
    
    return (
        <CompactCard className="p-3">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="text-sm font-black text-white">{name}</div>
                    <div className="text-[10px] text-gray-500 font-mono">@{ticker}</div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-white">{price} ETH</div>
                    <div className={`text-xs font-mono font-bold ${isPositive ? 'text-spawn-success' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{change.toFixed(2)}%
                    </div>
                </div>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <div className="flex items-center gap-1">
                    <Users size={14} className="text-gray-500" />
                    <span className="text-xs text-gray-400">Holders: {holders}</span>
                </div>
                <Sparkline />
            </div>
            <button className="w-full mt-3 py-1.5 text-xs font-bold rounded-lg bg-purple-500/30 text-purple-400 border border-purple-500/50 hover:bg-purple-500/50 transition-colors">
                Trade on Mesh DEX
            </button>
        </CompactCard>
    );
};

const MarketView = ({ activeMarketSubTab, setActiveMarketSubTab }) => {
    const MOCK_ZORA_COINS = [
        { name: "SpawnEngine Vibe", ticker: "SEVZ", price: 0.005, change: 8.45, holders: "5.1K" },
        { name: "Base Builder DAO", ticker: "BDAO", price: 0.012, change: -3.11, holders: "2.8K" },
    ];

    return (
        <div className="space-y-4 animate-fade-in">
            <SectionTitle title="Market" icon={Coins} />
            
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
                            <CompactCard key={i} className="p-3 flex justify-between items-center cursor-pointer hover:border-red-500/50">
                              <div>
                                <div className="text-sm font-bold text-white">{item.name}</div>
                                <div className="text-[10px] text-gray-400">P: {item.participants} | {item.price}</div>
                              </div>
                              <button className="px-3 py-1 text-xs rounded-full bg-spawn-primary text-black font-bold">
                                VIEW
                              </button>
                            </CompactCard>
                          ))}
                    </div>
                </>
            )}

            {activeMarketSubTab === 'zora' && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Coins size={16} className="text-purple-400" /> TOP CREATOR COINS
                    </h3>
                    {MOCK_ZORA_COINS.map((coin, i) => (
                        <ZoraCoinTrackerCard key={i} {...coin} />
                    ))}
                </div>
            )}
            
            {activeMarketSubTab === 'creators' && (
                <CompactCard className="p-4 text-center">
                    <h3 className="text-lg font-bold text-spawn-primary">Creator Hub</h3>
                    <p className="text-sm text-gray-400 mt-2">Discover, Follow, and Support Top Mesh Builders.</p>
                    <button className="mt-4 px-4 py-2 text-sm rounded-full bg-spawn-primary/20 text-spawn-primary border border-spawn-primary/50">
                        View Creator Leaderboard
                    </button>
                </CompactCard>
            )}
        </div>
    );
};


// Brain View anpassas
const BrainView = () => (
    <div className="space-y-4 animate-fade-in">
        <SectionTitle title="Brain" icon={Brain} />
        
        <CompactCard className="p-5 bg-green-900/20 border-green-500/50">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-black text-white">AI Assistant Status</h2>
                <span className="text-xs font-mono text-spawn-success flex items-center gap-1"><Cpu size={14} /> ONLINE</span>
            </div>
            <p className="text-sm text-gray-400">Ask the Mesh Brain about your stats, quests, or new drops.</p>
            <div className="mt-4 flex gap-2">
                <input type="text" placeholder="Ask a question..." className="flex-1 p-2 text-sm bg-gray-800/80 rounded-lg text-white border border-white/10 focus:border-green-500/50 outline-none" />
                <button className="p-2 bg-green-500/30 rounded-lg text-green-400 border border-green-500/50 hover:bg-green-500/50 transition-colors">
                    <ChevronsRight size={18} />
                </button>
            </div>
        </CompactCard>
        
        <h3 className="text-lg font-bold text-gray-300 mt-6 flex items-center gap-2">
            <Target size={18} className="text-yellow-400" /> Weekly Bounties
        </h3>
        <div className="space-y-3">
            {[
                { title: "Mint 3 Zora NFTs", reward: "+500 SE Tokens", completed: false },
                { title: "Achieve 500 XP this week", reward: "+1 Alpha Pack", completed: true },
                { title: "Trade 1 Creator Coin", reward: "+2 Free Spins", completed: false },
            ].map((bounty, i) => (
                <CompactCard key={i} className={`flex justify-between items-center ${bounty.completed ? 'bg-gray-800/70 border-green-500/30' : 'hover:border-white/20'}`}>
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
                </CompactCard>
            ))}
        </div>
    </div>
);


// Profile View anpassas
const ProfileView = () => (
    <div className="space-y-4 animate-fade-in">
        {/* Profile Header (Kompakt) */}
        <div className="flex items-center gap-3 pt-2 mb-4">
            <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-base">S</div>
            <div className="flex-1">
                <p className="text-sm font-black text-white leading-none">@spawniz</p>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span>Mesh ID · Creator</span>
                    <span className="h-1.5 w-1.5 bg-spawn-success rounded-full block"></span>
                    <span className="text-spawn-primary font-bold">Mesh v1.0 PRO</span>
                </div>
            </div>
            <Settings size={18} className="text-gray-500 cursor-pointer hover:text-white" /> 
        </div>

        <h1 className="text-2xl font-black text-white mb-4">Settings & API</h1>

        {/* XP SDK & Integration (Pillar 1) */}
        <CompactCard>
            <h3 className="text-sm font-bold text-white mb-1">XP SDK & Integration (Pillar 1)</h3>
            <p className="text-xs text-gray-400 mb-3">Manage API keys to integrate SpawnEngine XP into your own apps.</p>
            <button className="w-full py-2 text-xs font-bold rounded-lg bg-spawn-success/80 text-black border border-spawn-success hover:bg-spawn-success transition-colors">
                Show API Key
            </button>
        </CompactCard>

        {/* Premium Mesh Filters (Pillar 4) */}
        <CompactCard>
            <h3 className="text-sm font-bold text-white mb-1">Premium Mesh Filters (Pillar 4)</h3>
            <p className="text-xs text-gray-400 mb-3">Unlock Alpha Hunters and Whale Tracking.</p>
            <button className="w-full py-2 text-xs font-bold rounded-lg bg-blue-700/40 text-white border border-blue-500 hover:bg-blue-700/50 transition-colors">
                Upgrade to Premium
            </button>
        </CompactCard>
        
        {/* Launchpad Builder (Pillar 8) */}
        <CompactCard>
            <h3 className="text-sm font-bold text-white mb-1">Launchpad Builder (Pillar 8)</h3>
            <p className="text-xs text-gray-400 mb-3">Access the Zero-Code Token/NFT Builder.</p>
            <button className="w-full py-2 text-xs font-bold rounded-lg bg-purple-700/40 text-white border border-purple-500 hover:bg-purple-700/50 transition-colors">
                Open Creator Panel
            </button>
        </CompactCard>
    </div>
);


// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
    // Initial State och Handlers BEHÅLLS OINTAKTA
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
        // Wrapper som säkerställer att appen är centrerad och har rätt mobil bredd
        <div className="min-h-screen bg-spawn-bg text-white font-sans flex flex-col items-center">
            
            {/* Neural Mesh Background Animation (Behålls) */}
            <div className="neural-bg">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
                <div className="grid-overlay"></div>
            </div>
            
            {/* Huvud Header (Fast överst som i skärmdumpen) */}
            <header className="sticky top-0 z-50 w-full max-w-md bg-spawn-bg/90 backdrop-blur-sm border-b border-spawn-border">
                <div className="flex justify-between items-center p-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-spawn-primary rounded-full flex items-center justify-center text-xs font-bold text-black">SE</div>
                        <div>
                            <h1 className="text-xs font-bold text-white leading-none">SPAWNENGINE</h1>
                            <p className="text-[10px] text-gray-500 leading-none">Modular onchain engine for packs, XP, badges & creator modules</p>
                        </div>
                    </div>
                    
                    <button className="text-xs font-bold text-black bg-spawn-primary px-3 py-1 rounded-full hover:bg-white/90 flex items-center gap-1">
                        <Map size={12} /> Connect
                    </button>
                </div>
                
                {/* Sub-Navigation (Under headern, matchar skärmdumpen) */}
                <div className="flex justify-around text-xs p-2 border-t border-spawn-border">
                    {['Profile', 'Overview', 'Trading', 'Pull Lab', 'Pack Maps'].map((label, index) => (
                        <button
                            key={label}
                            className={`px-3 py-1 rounded-full transition-colors duration-200 ${
                                index === 0 
                                    ? 'bg-spawn-primary text-black font-bold' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                            // I en riktig app skulle detta vara en funktionell knapp
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </header>


            {/* Innehållet */}
            <div className="w-full max-w-md p-3 pb-20 relative z-10">
                {renderContent()}
            </div>
            
            {/* Bottom Navigation Bar (Fast längst nere) - Matchar din skärmdump */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gray-900/90 backdrop-blur-md border-t border-spawn-border p-2 flex justify-around z-50">
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
                            activeTab === item.id ? 'text-spawn-primary' : 'text-gray-500 hover:text-white'
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
