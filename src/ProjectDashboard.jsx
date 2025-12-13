import React, { useState, useEffect, useCallback } from 'react';
import { Box, Sliders, Target, Zap, MessageSquare, Monitor, X, Activity, HardHat, GitBranch } from 'lucide-react';

/**
 * Huvudkomponenten för projektkontrollpanelen - SpawnEngine PLATFORM.
 * Denna applikation är responsiv och byggd med Tailwind CSS, designad för fullskärm.
 * Alla komponenter, logik och stilar finns i denna fil.
 */
const ProjectDashboard = () => {
  // Global app state
  const [activeTab, setActiveTab] = useState('trading'); // Ändrad till 'trading' som default
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Använd enbart mock data för UI-demonstration
  const mockTradingData = [
    { id: 1, name: 'Fragment Pack #004', value: 75, status: 'Öppen' },
    { id: 2, name: 'Relic Vault Key', value: 100, status: 'Låst' },
    { id: 3, name: 'XP Series Pass', value: 40, status: 'Tillgänglig' },
  ];

  // --- Firebase/Firestore Setup (Placeholder - ignoreras av web-preview) ---

  // Placeholder för Firebase/Firestore initialisering och Auth.
  useEffect(() => {
    // Simulerar Firebase initialisering...
    
    // I en riktig miljö skulle du hantera __firebase_config och inloggning här.
    
    // Simulerar inloggning
    setTimeout(() => {
        const mockUserId = 'user-' + Math.random().toString(36).substring(2, 9); 
        setUserId(mockUserId);
        setIsAuthReady(true);
        console.log(`Användar-ID: ${mockUserId}`);
    }, 500);

    return () => {
        // Cleanup logik
    };
  }, []);

  // Komponenten för navigationslänkar
  const NavItem = ({ name, icon: Icon, tabKey }) => (
    <button
      onClick={() => {
        setActiveTab(tabKey);
        setIsMobileMenuOpen(false); // Stänger menyn på mobil
      }}
      className={`
        flex items-center space-x-3 p-3 rounded-xl transition-colors w-full text-left
        ${activeTab === tabKey
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-400 hover:bg-slate-700 dark:text-gray-300'
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{name}</span>
    </button>
  );

  // Komponenter för de olika sektionerna

  // 1. Deploy Center (Ersätter SpawnBot Control)
  const DeployCenter = () => (
    <div className="p-6 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
        <GitBranch className="w-6 h-6 mr-2 text-green-400" /> Deploy Center (Factory System)
      </h2>
      <p className="text-gray-400 mb-6">
        Använd Pack Factory för att deploya nya mesh-kompatibla serier (Token/NFT/Hybrid). 
        Alla serier får automatiskt ReserveGuard Safety och Utility Router-hooks.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deploy Card 1: Token Pack Series */}
        <div className="p-4 border border-slate-700 rounded-lg bg-slate-900 hover:border-green-500 transition-colors">
          <h3 className="font-semibold text-lg mb-2 text-green-400 flex items-center"><Zap className='w-4 h-4 mr-2'/> Token Pack Series</h3>
          <p className="text-sm text-gray-400">Deploya en standard ERC20-baserad pack-serie.</p>
          <button className="mt-3 px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">Starta Mall</button>
        </div>
        {/* Deploy Card 2: NFT Pack Series */}
        <div className="p-4 border border-slate-700 rounded-lg bg-slate-900 hover:border-yellow-500 transition-colors">
          <h3 className="font-semibold text-lg mb-2 text-yellow-400 flex items-center"><HardHat className='w-4 h-4 mr-2'/> NFT Pack Series (Coming)</h3>
          <p className="text-sm text-gray-400">ERC721/1155 packar med stöd för Burn Ladders.</p>
          <button className="mt-3 px-4 py-1.5 bg-yellow-600 text-white text-sm rounded-lg opacity-50 cursor-not-allowed">Ej Tillgänglig</button>
        </div>
        {/* ... (fler kort kan läggas till här) */}
      </div>

    </div>
  );

  // 2. Trading Hub (Ersätter Tracker Dashboard)
  const TradingHub = () => (
    <div className="p-6 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
        <Target className="w-6 h-6 mr-2 text-red-500" /> Trading Hub (Pack & Trade)
      </h2>
      <p className="text-gray-400 mb-6">
        Öppna, handla och hantera alla dina Series Packs. Se marknadslistor och trender.
      </p>

      <div className="space-y-4">
        {mockTradingData.map((item) => (
          <div 
            key={item.id} 
            className="p-4 border border-slate-700 rounded-lg hover:shadow-xl transition-shadow bg-slate-900"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg text-blue-400">{item.name}</h3>
              <span className={`text-sm font-medium px-3 py-1 rounded-full 
                ${item.status === 'Låst' ? 'bg-red-700 text-white' : 
                   item.status === 'Öppen' ? 'bg-green-700 text-white' : 
                   'bg-blue-700 text-white'}`}
              >
                {item.status}
              </span>
            </div>
            
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full" 
                style={{ 
                  width: `${item.value}%`, // Använd 'value' som en mock för t.ex. rarity/odds
                  backgroundColor: item.value >= 70 ? '#4ADE80' : item.value < 50 ? '#F87171' : '#60A5FA'
                }}
              ></div>
            </div>
            <p className="text-right text-sm font-bold mt-1 text-gray-300">Rarity/Odds: {item.value}%</p>
          </div>
        ))}
      </div>
      <button className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md">
        Öppna Pack (Mock)
      </button>
    </div>
  );

  // 3. Unified Activity Mesh (Ersätter Supcast Hub)
  const UnifiedActivityMesh = () => (
    <div className="p-6 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
        <Activity className="w-6 h-6 mr-2 text-purple-400" /> Unified Activity Mesh (Live Feed)
      </h2>
      <p className="text-gray-400 mb-4">
        En enda, normaliserad feed som mergar Onchain Events + Opens + Swaps + Quests + Social Triggers.
      </p>

      {/* Loggvisare som simulerar den gemensamma event-meshen */}
      <div className="mt-6 bg-slate-900 border border-slate-700 p-4 rounded-lg h-96 overflow-y-auto font-mono text-xs text-green-300 hide-scrollbar">
        <p>[14:55:01] <span className='text-yellow-400'>[PACK OPEN]</span> User-4h3k1 öppnade Fragment Pack #004 (Rarity: 75%).</p>
        <p>[14:55:10] <span className='text-blue-400'>[SWAP]</span> User-8j2d0 bytte Shard #12 mot Shard #13 (Series A).</p>
        <p>[14:55:25] <span className='text-green-400'>[XP GAIN]</span> User-4h3k1 fick +50 XP via Pack Ascension Path.</p>
        <p>[14:55:30] <span className='text-red-400'>[BURN]</span> User-2a7e9 brände 5 Fragment (Tier 1).</p>
        <p>[14:55:40] <span className='text-purple-400'>[SOCIAL]</span> User-8j2d0 utlöste Farcaster Badge: "First Trade".</p>
        <p>[14:55:55] <span className='text-yellow-400'>[TREASURE]</span> User-9f8g7 träffade Rare Drop (Relic Key) i TokenPackSeries-001!</p>
        <p>[14:56:05] <span className='text-blue-400'>[DEPLOY]</span> CreatorXYZ deployade en ny Hybrid Token/NFT Series.</p>
        <p>[14:56:15] <span className='text-green-400'>[QUEST]</span> User-4h3k1 slutförde "Open 3 Packs" Cross-series Quests.</p>
      </div>

    </div>
  );


  // 4. Creator Forge (Ersätter Plattform Deluxe Settings)
  const CreatorForge = () => (
    <div className="p-6 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
        <HardHat className="w-6 h-6 mr-2 text-teal-400" /> Creator Forge
      </h2>
      <p className="text-gray-400 mb-6">
        Här hanteras Registry, Rarity-generator, Foil-preview och Creator Profiles.
      </p>

      <div className="space-y-6">
        {/* Creator Profile */}
        <div className="p-4 border border-slate-700 rounded-lg bg-slate-900">
            <h3 className="font-semibold text-lg text-teal-400">Creator Registry Profile</h3>
            <p className="text-sm text-gray-400">Hantera fees, splits, och verifiering (X / Farcaster / Base).</p>
        </div>

        {/* Rarity & Foil Generation */}
        <div className="p-4 border border-slate-700 rounded-lg flex justify-between items-center bg-slate-900">
            <div>
                <h3 className="font-semibold text-lg text-teal-400">Rarity Generator</h3>
                <p className="text-sm text-gray-400">Definiera odds och tiers för din nästa serie (Fragment, Relic, etc.).</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">Öppna Verktyg</button>
        </div>

        {/* Social Hooks */}
        <SettingToggle 
          title="Farcaster Hooks (Utility Router)" 
          description="Aktivera sociala belöningar och gated drops." 
          defaultChecked={true} 
          color="text-fuchsia-400"
        />
      </div>
    </div>
  );
  
  // En omarbetad SettingToggle för Creator Forge
  const SettingToggle = ({ title, description, defaultChecked, color }) => {
    const [isChecked, setIsChecked] = useState(defaultChecked);
    const ringColor = color === 'text-fuchsia-400' ? 'peer-focus:ring-fuchsia-300 peer-checked:bg-fuchsia-600' : 'peer-focus:ring-teal-300 peer-checked:bg-teal-600';
    
    return (
      <div className="p-4 border border-slate-700 rounded-lg flex justify-between items-center bg-slate-900">
        <div>
          <h3 className={`font-semibold text-lg ${color}`}>{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
          <div className={`w-11 h-6 bg-slate-700 rounded-full peer ${ringColor} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-500 after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
        </label>
      </div>
    );
  };


  // Renderar det aktiva innehållet
  const renderContent = () => {
    switch (activeTab) {
      case 'deploy':
        return <DeployCenter />;
      case 'trading':
        return <TradingHub />;
      case 'activity':
        return <UnifiedActivityMesh />;
      case 'forge':
        return <CreatorForge />;
      default:
        return <TradingHub />;
    }
  };

  const navItems = [
    { name: 'Trading Hub', icon: Target, tabKey: 'trading' },
    { name: 'Deploy Center', icon: GitBranch, tabKey: 'deploy' },
    { name: 'Creator Forge', icon: HardHat, tabKey: 'forge' },
    { name: 'Activity Mesh', icon: Activity, tabKey: 'activity' },
  ];

  return (
    // Fullskärmslayout (min-h-screen och bg-slate-900 täcker hela webläsaren)
    <div className="min-h-screen w-full bg-slate-900 text-white font-sans p-4 sm:p-6 md:p-8">
      <style jsx global>{`
        /* Säkerställer att bakgrunden fyller hela webläsaren */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          background-color: #0F172A; /* Tailwind slate-900 */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>

      {/* Huvudlayout */}
      <div className="w-full mx-auto flex flex-col lg:flex-row gap-6">

        {/* Vänster Sida: Navigering (Sidebar) */}
        <aside className="lg:w-64 flex-shrink-0">
          {/* Header/Titel - Ändrad till SpawnEngine */}
          <div className="flex justify-between items-center lg:block mb-6 p-2">
            <h1 className="text-3xl font-extrabold text-blue-400">
              SpawnEngine
            </h1>
            <h2 className='text-sm text-gray-500'>One-Mesh Protocol</h2>

            {/* Användarinfo/Autentisering Status */}
            <div className="mt-2 text-xs text-gray-500 truncate hidden lg:block">
              {isAuthReady ? (
                <>Användare ID: {userId}</>
              ) : (
                <span className='text-yellow-400'>Autentiserar...</span>
              )}
            </div>
            {/* Mobil Menyknapp */}
            <button 
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:bg-slate-700" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Box className="w-6 h-6" />}
            </button>
          </div>

          {/* Navigering för Desktop */}
          <nav className="hidden lg:block space-y-2 bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
            {navItems.map(item => (
              <NavItem key={item.tabKey} {...item} />
            ))}
          </nav>
          
          {/* Navigering för Mobil (Popup) */}
          {isMobileMenuOpen && (
            <nav className="absolute z-10 top-20 left-4 right-4 bg-slate-800 p-4 rounded-xl shadow-2xl lg:hidden space-y-2 border border-slate-700">
              {navItems.map(item => (
                <NavItem key={item.tabKey} {...item} />
              ))}
              <div className="mt-4 text-xs text-gray-500 pt-2 border-t border-slate-700">
                {isAuthReady ? (
                  <>Användare ID: {userId}</>
                ) : (
                  <span className='text-yellow-400'>Autentiserar...</span>
                )}
              </div>
            </nav>
          )}
        </aside>

        {/* Höger Sida: Innehåll (Main Content) */}
        <main className="flex-1 min-w-0">
          <div className="space-y-6">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Loading overlay if auth not ready */}
      {!isAuthReady && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-95 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl flex items-center space-x-3 border border-slate-700">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-white">Laddar Applikation...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
