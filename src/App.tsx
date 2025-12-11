// src/App.tsx - Kompakt SpawnEngine Layout & Funktionalitet

import React, { useState } from 'react';
import './styles.css'; 
import { Home, Box, User, Coins, TrendingUp, Cpu, Target, History, Settings, Zap } from 'lucide-react';

// --- STYLED COMPONENTS (Baserat på Kompakt CSS) ---

/** Standardkort för alla sektioner */
const CompactCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`compact-card ${className}`}>
        {children}
    </div>
);

/** Kompakt Section Title */
const SectionTitle: React.FC<{ title: string; icon: React.ElementType }> = ({ title, icon: Icon }) => (
    <h2 className="section-title flex items-center gap-2 mt-4 mb-2">
        <Icon size={20} className="text-[#4affb4]"/> {title}
    </h2>
);

// --- 1. TRACKER VIEW (Landing Page) ---
const SpawnTrackerView: React.FC<{ txCount: number; ethMoved: string }> = ({ txCount, ethMoved }) => {
    // Mock Data för att fylla Tracker-fliken
    const MOCK_DATA = {
        baseGas: '3.45',
        avgGas: '45.67',
        volume30d: '$12.5k',
        pnlToday: '+ $1.25',
        gasFees30d: '$12.34',
        latestActivity: { to: '0x123...456', eth: '0.001', result: '$3.50' },
        connectedDapps: ['Zora', 'OpenSea', 'Mirror']
    };

    return (
        <div className="p-2 space-y-3">
            <SectionTitle title="Spawn Tracker" icon={TrendingUp} />
            
            <div className="grid grid-cols-3 gap-2 text-xs">
                {/* Gas Overview */}
                <CompactCard className="col-span-1">
                    <h3 className="text-sm text-center text-primary">⛽ Gas</h3>
                    <p className="text-center font-bold text-white leading-tight mt-1">{MOCK_DATA.baseGas} Gwei</p>
                    <p className="text-center text-gray-500 leading-tight">Avg: {MOCK_DATA.avgGas}</p>
                </CompactCard>
                
                {/* Volume / PnL */}
                <CompactCard className="col-span-1">
                    <h3 className="text-sm text-center text-primary">📊 PnL</h3>
                    <p className="text-center font-bold text-white leading-tight mt-1">{MOCK_DATA.volume30d}</p>
                    <p className="text-center text-gray-500 leading-tight">Today: {MOCK_DATA.pnlToday}</p>
                </CompactCard>
                
                {/* Fees / Tokens */}
                <CompactCard className="col-span-1">
                    <h3 className="text-sm text-center text-primary">📦 Mints</h3>
                    <p className="text-center font-bold text-white leading-tight mt-1">{txCount}</p>
                    <p className="text-center text-gray-500 leading-tight">Fees: {MOCK_DATA.gasFees30d}</p>
                </CompactCard>

                {/* Latest Activity (Full Bredd) */}
                <CompactCard className="col-span-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm text-primary">📜 Latest Activity Log</h3>
                        <button className="text-gray-500 hover:text-white">↻</button>
                    </div>
                    <p className="font-mono mt-2 text-white">
                        ↪ {MOCK_DATA.latestActivity.to.slice(0, 6)}... — {MOCK_DATA.latestActivity.eth} ETH
                    </p>
                    <small className="text-success font-bold block text-right">+{MOCK_DATA.latestActivity.result}</small>
                </CompactCard>
                
                {/* Eth Moved & Dapps (2 kolumner) */}
                <CompactCard className="col-span-2">
                    <h3 className="text-sm text-primary">💰 ETH Moved (Total)</h3>
                    <p className="font-bold text-white mt-1">{ethMoved} ETH</p>
                </CompactCard>
                <CompactCard className="col-span-1">
                    <h3 className="text-sm text-primary">🧩 dApps</h3>
                    <ul className="list-none p-0 text-xs text-gray-400 mt-1">
                        {MOCK_DATA.connectedDapps.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                </CompactCard>
            </div>
        </div>
    );
};


// --- 2. HOME VIEW (Mesh Profile) ---
const MeshProfileView: React.FC<{ currentXP: number; seTokens: number }> = ({ currentXP, seTokens }) => (
    <div className="p-2 space-y-3">
        <SectionTitle title="Mesh Profile" icon={Home} />

        {/* 3-Kolumns Statistik (matchar din bild) */}
        <CompactCard className="grid grid-cols-3 gap-3 bg-[#12151a] border-[#00d0ff50] shadow-[0_0_8px_rgba(0,208,255,0.1)]">
            <div className="text-center">
                <p className="text-xs text-gray-500 font-bold leading-none">XP STREAK</p>
                <p className="text-lg font-extrabold text-[#4affb4] leading-tight mt-1">{currentXP}</p>
                <small className="text-[10px] text-gray-500">Daily tasks</small>
            </div>
            <div className="text-center">
                <p className="text-xs text-gray-500 font-bold leading-none">SPAWN BALANCE</p>
                <p className="text-lg font-extrabold text-white leading-tight mt-1">{seTokens}</p>
                <small className="text-[10px] text-gray-500">Test rewards</small>
            </div>
            <div className="text-center">
                <p className="text-xs text-gray-500 font-bold leading-none">TODAY'S EVENTS</p>
                <p className="text-lg font-extrabold text-white leading-tight mt-1">9</p>
                <small className="text-[10px] text-gray-500">mints · swaps · packs</small>
            </div>
        </CompactCard>

        {/* Linked Apps & Social (matchar din bild) */}
        <CompactCard>
            <h3 className="text-sm text-primary mb-1">LINKED APPS</h3>
            <p className="text-xs text-white">Base wallet <span className="text-red-500 font-bold ml-1">[REQUIRED]</span></p>
        </CompactCard>
        
        <CompactCard>
            <h3 className="text-sm text-primary mb-1">SOCIAL SURFACES</h3>
            <p className="text-xs text-white">Farcaster & Zora <span className="text-blue-400 font-bold ml-1">[PLANNED]</span></p>
        </CompactCard>

        {/* Today's Loop/Quests */}
        <CompactCard>
            <h3 className="text-sm text-primary mb-2">TODAY'S LOOP</h3>
            <ul className="list-none p-0 space-y-1">
                <li className="flex justify-between text-xs border-b border-gray-700/50 pb-1">
                    Open a test pack
                    <span className="text-[#4affb4] font-bold">+50 XP</span>
                </li>
                <li className="flex justify-between text-xs border-b border-gray-700/50 pb-1">
                    Connect wallet
                    <span className="text-[#4affb4] font-bold">+100 XP</span>
                </li>
            </ul>
        </CompactCard>
    </div>
);


// --- 3. PROFILE VIEW (Settings & API) ---
const ProfileView = () => (
    <div className="p-2 space-y-3">
        {/* Profile Header (Matchar exakt layouten från din bild) */}
        <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-base">S</div>
                <div>
                    <p className="text-sm font-black text-white leading-none">@spawniz</p>
                    <div className="text-[10px] text-gray-400">Mesh ID · Creator</div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#4affb4] rounded-full block"></span>
                <span className="text-[10px] text-primary border border-primary/50 px-1 py-[1px] rounded">Mesh v1.0 PRO</span>
                <Settings size={18} className="text-gray-500 cursor-pointer hover:text-white" /> 
            </div>
        </div>

        <h1 className="text-xl font-black text-white px-2 mt-4">Settings & API</h1>

        {/* API/SDK Card (Pillar 1) */}
        <CompactCard>
            <h3 className="text-sm font-bold text-white mb-1">XP SDK & Integration (Pillar 1)</h3>
            <p className="text-xs text-gray-400 mb-3">Manage API keys to integrate SpawnEngine XP into your own apps.</p>
            <button className="w-full py-2 text-xs font-bold rounded-lg bg-[#2c9463] text-black border border-[#4affb4]">
                Show API Key
            </button>
        </CompactCard>

        {/* Filters Card (Pillar 4) */}
        <CompactCard>
            <h3 className="text-sm font-bold text-white mb-1">Premium Mesh Filters (Pillar 4)</h3>
            <p className="text-xs text-gray-400 mb-3">Unlock Alpha Hunters and Whale Tracking. Requires 500 SPN staking.</p>
            <button className="w-full py-2 text-xs font-bold rounded-lg bg-blue-700/40 text-white border border-blue-500">
                Upgrade to Premium
            </button>
        </CompactCard>
        
        {/* Launchpad Card (Pillar 8) */}
        <CompactCard>
            <h3 className="text-sm font-bold text-white mb-1">Launchpad Builder (Pillar 8)</h3>
            <p className="text-xs text-gray-400 mb-3">Access the Zero-Code Token/NFT Builder and Bonding Curve configuration.</p>
            <button className="w-full py-2 text-xs font-bold rounded-lg bg-purple-700/40 text-white border border-purple-500">
                Open Creator Panel
            </button>
        </CompactCard>

        {/* Notifications Card */}
        <CompactCard className="text-center">
            <button className="w-full py-2 text-xs font-bold rounded-lg bg-gray-700/50 text-white hover:bg-gray-700/70">
                Manage Notifications
            </button>
        </CompactCard>
    </div>
);


// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'track' | 'home' | 'rewards' | 'premium' | 'profile'>('track');
    
    // MOCK DATA för att fylla layouten
    const [seTokens] = useState(497); 
    const [currentXP] = useState(1575);
    const [txCount] = useState(45); // Mock transaktionsantal
    const [ethMoved] = useState('1.25'); // Mock ETH moved

    // --- RENDER LOGIC ---
    const renderContent = () => {
        switch (activeTab) {
            case 'track':
                return <SpawnTrackerView txCount={txCount} ethMoved={ethMoved} />;
            case 'home':
                return <MeshProfileView currentXP={currentXP} seTokens={seTokens} />;
            case 'profile':
                return <ProfileView />;
            case 'rewards':
            case 'premium':
                return (
                    <div className="p-4 text-center mt-8">
                        <SectionTitle title={activeTab === 'rewards' ? "Rewards" : "Premium"} icon={activeTab === 'rewards' ? Box : Coins} />
                        <CompactCard className="mt-4">
                            <p className="text-lg text-gray-400">Innehåll för {activeTab} kommer snart i kompakt stil.</p>
                        </CompactCard>
                    </div>
                );
            default:
                return <SpawnTrackerView txCount={txCount} ethMoved={ethMoved} />;
        }
    };

    return (
        <div className="app-wrapper min-h-screen flex flex-col">
            {/* Huvud Header */}
            <header className="compact-header sticky top-0 z-50">
                <h1 className="text-xl font-bold text-primary">SPAWNENGINE</h1>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#4affb4] bg-[#0d2c20] p-1 rounded">
                        {currentXP} XP 🔥
                    </span>
                    <button className="text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded">
                        Connect
                    </button>
                </div>
            </header>
            
            {/* Kompakt Header Bar (XP/Balance) */}
            <div className="flex justify-around items-center p-2 bg-[#1a2230] text-xs font-mono border-b border-gray-700">
                <div className="text-center">
                    <span className="text-gray-500">XP:</span> <span className="font-bold">{currentXP}</span>
                </div>
                <div className="text-center">
                    <span className="text-gray-500">SPAWN:</span> <span className="font-bold">{seTokens}</span>
                </div>
                <div className="text-center">
                    <span className="text-gray-500">MODE:</span> <span className="font-bold">v0.2</span>
                </div>
                <button className="text-[10px] text-primary border border-primary/50 px-2 py-0.5 rounded">
                    9 events
                </button>
            </div>

            {/* Navigation */}
            <nav className="compact-nav sticky top-[48px] z-40">
                {[{ id: 'track', icon: TrendingUp, label: 'Spawn Tracker' },
                  { id: 'home', icon: Home, label: 'Mesh Profile' },
                  { id: 'rewards', icon: Zap, label: 'Rewards' },
                  { id: 'premium', icon: Coins, label: 'Premium' },
                  { id: 'profile', icon: User, label: 'Settings' },
                ].map((item) => (
                    <button
                        key={item.id}
                        className={`tab-button ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id as any)}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Huvudinnehåll */}
            <main className="flex-grow pb-8">
                {renderContent()}
            </main>
            
            {/* Här kan en fast bottennavigering läggas till om det behövs */}
        </div>
    );
};

export default App;
