import React, { useState } from 'react';
import { 
    Home, Box, User, Coins, TrendingUp, Users, Package, History, Settings, Award, 
    Target, Brain, ChevronsRight, CheckCircle, Cpu, Zap, Link, Map, Code, Activity, Layers
} from 'lucide-react';

// --- STYLES & TAILWIND CONFIG INTEGRATION ---
const styles = `
    /* Custom Tailwind Colors based on the dark, neon aesthetic */
    .spawn-bg { background-color: #0d1117; } /* Deep Dark Background */
    .spawn-card { background-color: #161b22; } /* Card background */
    .spawn-border { border-color: #30363d; } /* Subtle Borders */
    .spawn-primary { color: #58a6ff; background-color: #58a6ff; } /* Blue Primary (Buttons, Highlights) */
    .spawn-success { color: #3fb950; background-color: #3fb950; } /* Green Success */
    
    /* Background Animation (Neural Mesh) - Integrated from styles.css */
    .neural-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
        opacity: 0.3;
        z-index: 0;
    }
    
    .grid-overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        background-image: 
            linear-gradient(to right, #ffffff05 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff05 1px, transparent 1px);
        background-size: 40px 40px;
    }

    .orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.4;
        animation: pulse 15s infinite alternate;
    }

    .orb-1 {
        width: 300px;
        height: 300px;
        background-color: #58a6ff; /* Primary Blue */
        top: 10%;
        left: 15%;
        animation-duration: 18s;
    }
    .orb-2 {
        width: 400px;
        height: 400px;
        background-color: #3fb950; /* Success Green */
        bottom: 5%;
        right: 10%;
        animation-duration: 20s;
    }
    .orb-3 {
        width: 250px;
        height: 250px;
        background-color: #ff007f; /* Neon Pink/Red */
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation-duration: 16s;
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.2); }
    }
    
    /* Utility for Card background colors to match screenshot */
    .bg-spawn-card-trans { background-color: rgba(22, 27, 34, 0.7); }
`;

// --- HELPER COMPONENTS ---

const CompactCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`p-4 bg-spawn-card-trans backdrop-blur-sm border border-spawn-border rounded-xl transition-all duration-300 ${className}`}>
        {children}
    </div>
);

const SectionTitle: React.FC<{ title: string; icon: React.ElementType }> = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-2 mt-4 mb-2">
        <Icon size={20} className="text-spawn-success" />
        <h2 className="text-xl font-black text-white">{title}</h2>
    </div>
);

const SubNav = ({ subTabs, activeSubTab, setActiveSubTab }) => (
    <div className="flex bg-spawn-card-trans p-1 rounded-lg border border-spawn-border mb-3 text-sm">
        {subTabs.map(tab => (
            <button
                key={tab.id}
                className={`flex-1 py-2 font-bold rounded-md transition-colors duration-200 ${
                    activeSubTab === tab.id 
                        ? 'bg-spawn-primary text-black shadow-lg shadow-spawn-primary/20' 
                        : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveSubTab(tab.id)}
            >
                {tab.label}
            </button>
        ))}
    </div>
);


// --- VIEWS (Content remains compact as in the screenshot) ---
const HomeView = ({ seTokens, currentXP }) => (
    <div className="space-y-6 animate-fade-in">

        {/* Status Bar (Now integrated into the main content area) */}
        <div className="flex justify-between items-center text-[10px] text-center font-mono py-2 px-1 border-b border-spawn-border">
            {/* WALLET & GAS (Left side of status bar in screenshot) */}
            <div className="flex gap-6 text-left">
                <div className="text-gray-400">
                    WALLET <span className="text-red-400 block leading-none">Disconnected</span>
                </div>
                <div className="text-gray-400 leading-none">
                    GAS <span className="text-spawn-success block leading-none">-0.26 gwei est.</span>
                </div>
                <div className="text-gray-400 leading-none">
                    MESH <span className="text-white block leading-none">9 events</span>
                </div>
            </div>

            {/* XP, SPAWN, MODE (Center of status bar in screenshot) */}
            <div className="flex items-center gap-4 text-center">
                <div className="text-gray-400 leading-none">
                    XP <span className="text-white font-bold block leading-none">{currentXP}</span>
                </div>
                <div className="text-gray-400 leading-none">
                    SPAWN <span className="text-white font-bold block leading-none">{seTokens}</span>
                </div>
                <div className="text-gray-400 leading-none">
                    MODE <span className="text-gray-500 font-bold block leading-none">v0.2 mock data</span>
                </div>
            </div>
        </div>

        {/* Live Event/Pulse Header (Replikation av skärmdumpens utseende) */}
        <div className="text-xs font-mono text-gray-400 border-l-4 border-red-500 pl-3">
            LIVE PULPACK_open · 0xA9...93 → Neon Fragments (Fragment) · burn · 0x4B...2F
        </div>

        {/* Main Content: Split into two columns for desktop feel */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">

            {/* MESH PROFILE CARD (Matches image style) - Takes full width on small screens, 1/2 or 1/3 on desktop */}
            <CompactCard className="space-y-4 pt-4 pb-4 bg-spawn-card-trans/90 border-spawn-primary/40 col-span-full xl:col-span-2">
                <h2 className="text-xl font-black text-white flex items-center gap-2 pb-2 border-b border-spawn-border/50">
                    <Activity size={20} className="text-spawn-primary" /> MESH PROFILE
                </h2>
                
                {/* Profile Header */}
                <div className="flex justify-between items-center pb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-white">SE</div>
                        <div>
                            <span className="text-base font-bold text-spawn-success block">@spawnengine</span>
                            <span className="text-xs text-gray-500">Mesh owner on Base · Layer-4 style XP & packs</span>
                        </div>
                        <span className="text-[10px] text-spawn-success border border-spawn-success px-2 py-0.5 rounded-full font-mono">ONLINE</span>
                    </div>
                    <div className="text-xs text-right text-gray-400">
                        One wallet, multiple contract types, all flowing into a single activity mesh.
                    </div>
                </div>

                {/* Stats Block (XP, Balance, Events) */}
                <div className="grid grid-cols-3 gap-3 text-sm text-center pt-2">
                    <div className="p-3 border border-spawn-border rounded-xl bg-black/20 text-left">
                        <p className="font-extrabold text-white text-2xl leading-none">{currentXP}</p>
                        <p className="text-xs text-gray-500 mt-1">XP STREAK</p>
                        <p className="text-[10px] text-gray-600 mt-0.5">Grown as you complete daily mesh tasks.</p>
                    </div>
                    <div className="p-3 border border-spawn-border rounded-xl bg-black/20 text-left">
                        <p className="font-extrabold text-white text-2xl leading-none">{seTokens}</p>
                        <p className="text-xs text-gray-500 mt-1">SPAWN BALANCE</p>
                        <p className="text-[10px] text-gray-600 mt-0.5">XP rewards from packs & quests (mock).</p>
                    </div>
                    <div className="p-3 border border-spawn-border rounded-xl bg-black/20 text-left">
                        <p className="font-extrabold text-white text-2xl leading-none">3</p>
                        <p className="text-xs text-gray-500 mt-1">CONNECTED SURFACES</p>
                        <p className="text-[10px] text-gray-600 mt-0.5">Token packs · NFT pacps · Zora packs (planned).</p>
                    </div>
                </div>
            </CompactCard>

            {/* Today's Loop (Moved to the side for the desktop layout) */}
            <CompactCard className="space-y-4 bg-spawn-card-trans/90 border-spawn-primary/20 col-span-full xl:col-span-1">
                <h3 className="text-sm font-black text-spawn-primary flex justify-between items-center border-b border-spawn-border/50 pb-2">
                    Today's loop 
                    <span className="text-xs font-bold text-spawn-success">+250 XP available</span>
                </h3>
                
                <div className="space-y-2">
                    {[
                        { title: "Open a test pack", reward: "+50 XP", sub: "from the pulpack_open event" },
                        { title: "Connect wallet", reward: "+100 XP", sub: "Any Base wallet counts" },
                        { title: "Share your mesh", reward: "+100 XP", sub: "Post a cast with your stats" },
                    ].map((quest, i) => (
                        <div key={i} className="flex justify-between items-center p-3 border border-spawn-border/50 rounded-lg bg-black/10">
                            <div className="flex items-start gap-2">
                                <input 
                                    type="radio" 
                                    name="quest" 
                                    checked={i < 2} 
                                    readOnly 
                                    className={`mt-1 h-4 w-4 rounded-full border-spawn-border cursor-pointer ${i < 2 ? 'bg-spawn-success text-spawn-success' : 'bg-gray-700'}`}
                                />
                                <div>
                                    <p className={`text-sm font-bold ${i < 2 ? 'text-gray-500 line-through' : 'text-white'}`}>{quest.title}</p>
                                    <p className="text-[10px] text-gray-600 italic">{quest.sub}</p>
                                </div>
                            </div>
                            <p className="text-sm font-bold text-spawn-success flex-shrink-0">{quest.reward}</p>
                        </div>
                    ))}
                </div>
            </CompactCard>

            {/* Linked Apps Section (Bottom left corner card) */}
            <CompactCard className="space-y-3 bg-spawn-card-trans/90 border-spawn-primary/20 xl:col-span-1">
                <h3 className="text-sm font-black text-spawn-primary flex items-center gap-2 pb-1 border-b border-spawn-border/50">
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

            {/* Social Surfaces Section (Bottom right corner card) */}
            <CompactCard className="space-y-3 bg-spawn-card-trans/90 border-spawn-primary/20 xl:col-span-1">
                <h3 className="text-sm font-black text-spawn-primary flex items-center gap-2 pb-1 border-b border-spawn-border/50">
                    <Code size={16} /> SOCIAL SURFACES
                </h3>
                <div className="flex justify-between items-center p-2 border border-spawn-border rounded-lg bg-black/20">
                    <div className="text-sm text-white">Farcaster & Zora</div>
                    <span className="text-xs font-bold text-yellow-400 border border-yellow-400 px-2 py-0.5 rounded-full">PLANNED</span>
                </div>
                <p className="text-xs text-gray-500">
                    Future hooks: casts, mints & creator coins streamed into the mesh.
                </p>
            </CompactCard>

        </div>
    </div>
);

// Other views (Loot, Market, Brain, Profile) remain but use the wider context

const SpawnSlotMegaways = ({ seTokens, freeSpins, onSpin }) => (
    <CompactCard className="p-6 bg-purple-900/20 border-purple-500/50">
        <h2 className="text-xl font-black text-white mb-3 flex items-center gap-3">
            <Award size={20} className="text-yellow-400"/> SpawnEngine Megaways
        </h2>
        <div className="flex justify-between text-base font-mono mb-5 border-b border-white/10 pb-3">
            <span className="text-gray-400">Tokens: <span className="text-spawn-primary font-bold">{seTokens}</span></span>
            <span className="text-gray-400">Free Spins: <span className="text-purple-400 font-bold">{freeSpins}</span></span>
        </div>
        
        <div className="bg-gray-900/70 h-32 rounded-xl flex items-center justify-center mb-5 border border-white/5 shadow-2xl shadow-purple-900/50">
            <span className="text-5xl text-gray-700 font-extrabold tracking-widest">SPIN</span>
        </div>

        <button
            onClick={onSpin}
            disabled={seTokens < 10 && freeSpins === 0}
            className="w-full py-3 text-lg font-black rounded-xl 
                        bg-spawn-success text-black hover:bg-green-300 transition-all duration-300 disabled:bg-gray-600 disabled:text-gray-400 shadow-lg shadow-spawn-success/30"
        >
            {freeSpins > 0 ? `FREE SPIN (${freeSpins})` : 'SPIN (10 SE Tokens)'}
        </button>
    </CompactCard>
);

const PacksView = ({ openPack }) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CompactCard className="text-center p-6 bg-red-900/20 border-red-500/50">
            <p className="text-3xl font-black text-white mb-2">1x ALPHA PACK</p>
            <p className="text-sm text-gray-400">Guaranteed Creator Token Fragment.</p>
            <button 
                onClick={openPack}
                className="w-full mt-4 py-3 text-lg font-black rounded-lg 
                            bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
            >
                OPEN PACK
            </button>
        </CompactCard>
        
        <CompactCard className="text-center p-6 bg-gray-900/50 border-gray-700/50 opacity-70">
            <p className="text-3xl font-black text-gray-600 mb-2">0x PREMIUM PACK</p>
            <p className="text-sm text-gray-600">Purchase required for access.</p>
            <button className="w-full mt-4 py-3 text-lg font-black rounded-lg bg-gray-700 text-gray-500 cursor-not-allowed">
                LOCKED
            </button>
        </CompactCard>
    </div>
);

const HistoryView = ({ historyData }) => (
    <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 border-b border-spawn-border/50 pb-2">
            <History size={16} className="text-yellow-400" /> Recent Activity Log
        </h3>
        <div className="space-y-2">
            {historyData.map((item, i) => (
                <CompactCard key={i} className="p-3 flex justify-between items-center bg-gray-900/50 border-white/5 hover:border-spawn-primary/20 transition-all">
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
    <div className="space-y-6 animate-fade-in">
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
                    <div className="text-base font-black text-white">{name}</div>
                    <div className="text-xs text-gray-500 font-mono">@{ticker}</div>
                </div>
                <div className="text-right">
                    <div className="text-base font-bold text-white">{price} ETH</div>
                    <div className={`text-sm font-mono font-bold ${isPositive ? 'text-spawn-success' : 'text-red-400'}`}>
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
            <button className="w-full mt-3 py-2 text-sm font-bold rounded-lg bg-purple-500/30 text-purple-400 border border-purple-500/50 hover:bg-purple-500/50 transition-colors shadow-inner shadow-black/30">
                Trade on Mesh DEX
            </button>
        </CompactCard>
    );
};

const MarketView = ({ activeMarketSubTab, setActiveMarketSubTab }) => {
    const MOCK_ZORA_COINS = [
        { name: "SpawnEngine Vibe", ticker: "SEVZ", price: 0.005, change: 8.45, holders: "5.1K" },
        { name: "Base Builder DAO", ticker: "BDAO", price: 0.012, change: -3.11, holders: "2.8K" },
        { name: "Farcaster OG", ticker: "FROG", price: 0.008, change: 2.01, holders: "10.5K" },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <SectionTitle title="Market" icon={Coins} />
            
            <SubNav 
                subTabs={[{id: 'trending', label: 'Trending Drops'}, {id: 'creators', label: 'Creators'}, {id: 'zora', label: 'Zora Coins'}]}
                activeSubTab={activeMarketSubTab}
                setActiveSubTab={setActiveMarketSubTab}
            />

            {activeMarketSubTab === 'trending' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-spawn-border/50 pb-2">
                        <TrendingUp size={18} className="text-red-500" /> HOT TRENDING (Drops)
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[{name: "VibeMarket Booster", price: "0.025 ETH", participants: "1.2K", icon: Zap, color: 'text-yellow-400'},
                          {name: "Creator Token · $SPAWNIZ", price: "0.001 ETH", participants: "500", icon: Award, color: 'text-purple-400'}]
                            .map((item, i) => (
                                <CompactCard key={i} className="p-4 flex justify-between items-center cursor-pointer hover:border-red-500/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} className={item.color} />
                                        <div>
                                            <div className="text-base font-bold text-white">{item.name}</div>
                                            <div className="text-xs text-gray-400">P: {item.participants} | {item.price}</div>
                                        </div>
                                    </div>
                                    <button className="px-3 py-1 text-sm rounded-full bg-spawn-primary/80 text-black font-bold hover:bg-spawn-primary">
                                        VIEW DROP
                                    </button>
                                </CompactCard>
                              ))}
                    </div>
                </div>
            )}

            {activeMarketSubTab === 'zora' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-spawn-border/50 pb-2">
                        <Coins size={18} className="text-purple-400" /> TOP CREATOR COINS (Powered by Zora)
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MOCK_ZORA_COINS.map((coin, i) => (
                            <ZoraCoinTrackerCard key={i} {...coin} />
                        ))}
                    </div>
                </div>
            )}
            
            {activeMarketSubTab === 'creators' && (
                <CompactCard className="p-8 text-center border-blue-500/50">
                    <h3 className="text-2xl font-black text-spawn-primary">Creator Hub V1</h3>
                    <p className="text-sm text-gray-400 mt-2">Discover, Follow, and Support Top Mesh Builders. Track their XP and token performance.</p>
                    <button className="mt-6 px-6 py-3 text-sm rounded-full bg-spawn-primary/20 text-spawn-primary border border-spawn-primary/50 font-bold hover:bg-spawn-primary/30 transition-colors">
                        View Creator Leaderboard
                    </button>
                </CompactCard>
            )}
        </div>
    );
};


const BrainView = () => (
    <div className="space-y-6 animate-fade-in">
        <SectionTitle title="Brain" icon={Brain} />
        
        <CompactCard className="p-6 bg-green-900/20 border-green-500/50">
            <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                <h2 className="text-xl font-black text-white">Mesh Brain AI Assistant</h2>
                <span className="text-xs font-mono text-spawn-success flex items-center gap-1"><Cpu size={14} /> ACTIVE</span>
            </div>
            <p className="text-sm text-gray-400">Ask the Mesh Brain about your stats, quests, or new drops in the ecosystem.</p>
            <div className="mt-4 flex gap-3">
                <input type="text" placeholder="Ask a question about your mesh activity..." className="flex-1 p-3 text-sm bg-gray-800/80 rounded-xl text-white border border-white/10 focus:border-green-500/50 outline-none" />
                <button className="p-3 bg-green-500/30 rounded-xl text-green-400 border border-green-500/50 hover:bg-green-500/50 transition-colors shadow-inner shadow-black/30">
                    <ChevronsRight size={20} />
                </button>
            </div>
        </CompactCard>
        
        <div className="grid md:grid-cols-2 gap-6">
            <CompactCard className="p-6">
                <h3 className="text-lg font-bold text-spawn-primary mb-3 flex items-center gap-2">
                    <Target size={18} className="text-yellow-400" /> Weekly Bounties
                </h3>
                <div className="space-y-3">
                    {[
                        { title: "Mint 3 Zora NFTs", reward: "+500 SE Tokens", completed: false },
                        { title: "Achieve 500 XP this week", reward: "+1 Alpha Pack", completed: true },
                        { title: "Trade 1 Creator Coin", reward: "+2 Free Spins", completed: false },
                    ].map((bounty, i) => (
                        <div key={i} className={`flex justify-between items-center p-3 rounded-lg border ${bounty.completed ? 'bg-gray-800/70 border-green-500/30' : 'border-spawn-border hover:border-white/20'}`}>
                            <div>
                                <p className={`text-sm font-bold ${bounty.completed ? 'text-green-500 line-through' : 'text-white'}`}>{bounty.title}</p>
                                <p className="text-xs text-gray-500">{bounty.reward}</p>
                            </div>
                            {bounty.completed && <CheckCircle size={20} className="text-green-500 flex-shrink-0" />}
                            {!bounty.completed && (
                                <button className="px-3 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 font-bold hover:bg-yellow-500/30 flex-shrink-0">
                                    VIEW
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </CompactCard>

            <CompactCard className="p-6 border-red-500/50">
                <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                    <Zap size={18} className="text-red-400" /> Active Alerts
                </h3>
                <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-center gap-2 border-b border-spawn-border/50 pb-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        VibeMarket contract migration is pending.
                    </li>
                    <li className="flex items-center gap-2 border-b border-spawn-border/50 pb-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        New Zora coin deployer identified.
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-spawn-success rounded-full"></div>
                        XP Streak goal achieved for today.
                    </li>
                </ul>
            </CompactCard>
        </div>
    </div>
);


const ProfileView = () => (
    <div className="space-y-6 animate-fade-in">
        <SectionTitle title="Account Settings & API" icon={User} />

        {/* Profile Header (Larger, desktop style) */}
        <div className="p-4 bg-spawn-card-trans border border-spawn-primary/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-xl font-bold text-white">SE</div>
                <div>
                    <p className="text-xl font-black text-white leading-tight">@spawniz</p>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <span>Mesh ID · Creator</span>
                        <span className="h-2 w-2 bg-spawn-success rounded-full block"></span>
                        <span className="text-spawn-primary font-bold">Mesh v1.0 PRO</span>
                    </div>
                </div>
            </div>
            <button className="text-gray-500 hover:text-white transition-colors p-2 rounded-full border border-spawn-border">
                <Settings size={20} />
            </button> 
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            {/* XP SDK & Integration (Pillar 1) */}
            <CompactCard className="hover:border-spawn-success/50 transition-all">
                <h3 className="text-lg font-bold text-spawn-success mb-2">XP SDK & Integration</h3>
                <p className="text-sm text-gray-400 mb-4">Manage API keys to integrate SpawnEngine XP into your own apps.</p>
                <button className="w-full py-2 text-sm font-bold rounded-lg bg-spawn-success/80 text-black border border-spawn-success hover:bg-spawn-success transition-colors shadow-md shadow-spawn-success/20">
                    Show API Key
                </button>
            </CompactCard>

            {/* Premium Mesh Filters (Pillar 4) */}
            <CompactCard className="hover:border-blue-500/50 transition-all">
                <h3 className="text-lg font-bold text-blue-400 mb-2">Premium Mesh Filters</h3>
                <p className="text-sm text-gray-400 mb-4">Unlock Alpha Hunters and Whale Tracking features for the Market.</p>
                <button className="w-full py-2 text-sm font-bold rounded-lg bg-blue-700/40 text-white border border-blue-500 hover:bg-blue-700/50 transition-colors shadow-md shadow-blue-500/20">
                    Upgrade to PRO
                </button>
            </CompactCard>
            
            {/* Launchpad Builder (Pillar 8) */}
            <CompactCard className="hover:border-purple-500/50 transition-all">
                <h3 className="text-lg font-bold text-purple-400 mb-2">Launchpad Builder</h3>
                <p className="text-sm text-gray-400 mb-4">Access the Zero-Code Token/NFT Builder for your creator coin.</p>
                <button className="w-full py-2 text-sm font-bold rounded-lg bg-purple-700/40 text-white border border-purple-500 hover:bg-purple-700/50 transition-colors shadow-md shadow-purple-500/20">
                    Open Creator Panel
                </button>
            </CompactCard>
        </div>
    </div>
);


// --- SIDEBAR COMPONENT ---
const Sidebar = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'profile', icon: User, label: 'Profile' },
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'loot', icon: Box, label: 'Loot' },
        { id: 'market', icon: Coins, label: 'Market' },
        { id: 'brain', icon: Brain, label: 'Brain' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];
    
    // Hardcoded items to mimic the image structure (Trading Hub, Deploy Center, etc.)
    const secondaryNav = [
        { label: 'Trading Hub', icon: TrendingUp, id: 'market' },
        { label: 'Deploy Center', icon: Package, id: 'profile' },
        { label: 'Creator Forge', icon: Code, id: 'profile' },
        { label: 'Activity Mesh', icon: Activity, id: 'home' },
    ];

    return (
        <nav className="w-64 flex-shrink-0 bg-spawn-card/90 border-r border-spawn-border h-screen sticky top-0 flex flex-col p-4 z-40">
            
            {/* Top Logo / App Title */}
            <div className="flex items-center gap-3 p-2 mb-6 border-b border-spawn-border/50 pb-4">
                <div className="w-8 h-8 bg-spawn-primary rounded-full flex items-center justify-center text-sm font-bold text-black">SE</div>
                <div>
                    <h1 className="text-base font-black text-white leading-none">SPAWNENGINE</h1>
                    <p className="text-[10px] text-gray-500 leading-none">onchain engine</p>
                </div>
            </div>

            {/* Primary Navigation (Matches mobile bar functionality) */}
            <div className="flex flex-col space-y-1 mb-6">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        className={`flex items-center gap-3 p-2 rounded-lg font-medium transition-all duration-200 ${
                            activeTab === item.id 
                                ? 'bg-spawn-primary/20 text-spawn-primary border border-spawn-primary/50' 
                                : 'text-gray-400 hover:bg-spawn-card hover:text-white'
                        }`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Secondary Platform Navigation (Matching Image Structure) */}
            <div className="flex flex-col space-y-1">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-2">REPORTS / CONFIG</h3>
                {secondaryNav.map((item) => (
                    <button
                        key={item.label}
                        className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-all duration-200 text-gray-500 hover:bg-spawn-card hover:text-white`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <item.icon size={16} />
                        {item.label}
                    </button>
                ))}
            </div>
            
        </nav>
    );
}

// --- MAIN APP COMPONENT ---

export default function App() {
    // Inject custom styles globally
    React.useEffect(() => {
        const styleTag = document.createElement('style');
        styleTag.innerHTML = styles;
        document.head.appendChild(styleTag);
        return () => {
            document.head.removeChild(styleTag);
        };
    }, []);

    // Initial State och Handlers BEHÅLLS OINTAKTA
    const [activeTab, setActiveTab] = useState<'home' | 'loot' | 'market' | 'brain' | 'profile' | 'settings'>('home');
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
    
    // HANDLERS (Same as before, simplified alert() replacement)
    const showMessage = (msg: string) => {
        console.log("ALERT:", msg);
        // In a real app, replace alert() with a custom modal/notification
    }
    
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
            showMessage("Insufficient SE Tokens! (10 needed)");
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
            showMessage(`WIN! Gained ${tokensGained} SE Tokens and ${xpGained} XP.`);
        } else {
            xpGained = 5;
            setCurrentXP(xp => xp + xpGained);
            setHistory(h => [
                { date: new Date().toLocaleDateString(), type: "Slot Spin", result: freeSpins > 0 ? "Free Spin" : "-10 SE Tokens", xp: `+${xpGained} XP` },
                ...h
            ]);
            showMessage("No luck this time, but gained 5 XP.");
        }
    };
    
    const handleOpenPack = () => {
        const tokensGained = Math.floor(Math.random() * 200) + 100;
        const freeSpinsGained = Math.floor(Math.random() * 3) + 1;
        const xpGained = 50;
        
        setSeTokens(t => t + tokensGained);
        setFreeSpins(fs => fs + freeSpinsGained);
        setCurrentXP(xp => xp + xpGained);
        
        showMessage(`Pack Opened! Gained ${tokensGained} SE Tokens and ${freeSpinsGained} Free Spins.`);

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
            case 'settings': // Settings leads to the same comprehensive profile view
                return <ProfileView />;
            default:
                return <HomeView seTokens={seTokens} currentXP={currentXP} />;
        }
    };


    return (
        <div className="min-h-screen spawn-bg text-white font-sans flex overflow-hidden">
            
            {/* Neural Mesh Background Animation */}
            <div className="neural-bg">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
                <div className="grid-overlay"></div>
            </div>
            
            {/* 1. Static Left Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {/* 2. Main Content Area */}
            <div className="flex-grow flex flex-col relative z-10 min-w-0">

                {/* Main Top Header (Connect & Base Layer Status - Matches image top bar) */}
                <header className="flex justify-between items-center p-4 bg-spawn-card/90 backdrop-blur-md border-b border-spawn-border flex-shrink-0">
                    <div className="flex items-center gap-4 text-sm font-bold">
                        <Layers size={18} className="text-spawn-primary" />
                        <span className="text-white uppercase tracking-wider">BASE MESH LAYER</span>
                        <div className="h-2 w-2 bg-spawn-success rounded-full animate-pulse"></div>
                    </div>
                    
                    <button className="text-sm font-bold text-black bg-spawn-primary px-4 py-2 rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2 shadow-lg shadow-spawn-primary/30">
                        <Map size={16} /> Connect Wallet
                    </button>
                </header>

                {/* Scrollable Content */}
                <main className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                    {/* Add a transparent scrollbar style using Tailwind utility classes in a custom class for better aesthetics on desktop */}
                    {renderContent()}
                </main>
                
            </div>
            
        </div>
    );
};
