import React, { useState, useEffect, useCallback } from 'react';
import { Box, Sliders, Target, Zap, MessageSquare, Monitor, X } from 'lucide-react';

/**
 * Huvudkomponenten för projektkontrollpanelen.
 * Denna applikation är responsiv och byggd med Tailwind CSS.
 * Alla komponenter, logik och stilar finns i denna fil.
 */
const ProjectDashboard = () => {
  // Global app state
  const [activeTab, setActiveTab] = useState('tracker');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Använd enbart mock data för UI-demonstration
  const mockTrackerData = [
    { id: 1, name: 'Q3 Huvudmål', progress: 75, status: 'Pågående' },
    { id: 2, name: 'Backend Migrering', progress: 100, status: 'Klar' },
    { id: 3, name: 'Mobil Optimeriing', progress: 40, status: 'Försenad' },
  ];

  // --- Firestore & Firebase Setup (Placeholder - måste importera i en riktig miljö) ---

  // Placeholder för Firebase/Firestore initialisering och Auth.
  useEffect(() => {
    console.log("Simulerar Firebase initialisering...");
    
    // I en riktig miljö skulle du ha:
    // import { initializeApp } from 'firebase/app';
    // import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
    // import { getFirestore } from 'firebase/firestore';
    
    // const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
    // const app = initializeApp(firebaseConfig);
    // setDb(getFirestore(app));
    // setAuth(getAuth(app));
    
    // Simulerar inloggning
    setTimeout(() => {
        const mockUserId = 'user-' + Math.random().toString(36).substring(2, 9); 
        setUserId(mockUserId);
        setIsAuthReady(true);
        console.log(`Användar-ID: ${mockUserId}`);
    }, 500);

    return () => {
        // Cleanup logik för riktig Firestore/Auth lyssnare
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
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{name}</span>
    </button>
  );

  // Komponenter för de olika sektionerna

  // 1. Spawnbot Control
  const SpawnBotControl = () => (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <Zap className="w-6 h-6 mr-2 text-yellow-500" /> SpawnBot Styrning
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Här hanterar du alla automatiserade robotar och deras scheman. 
        Starta, stoppa eller justera parameterar för bot-processer.
      </p>
      
      <div className="space-y-4">
        {/* Kontrollkort */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
          <h3 className="font-semibold text-lg mb-2 text-blue-500">Auto-Generering (SpawnBot A)</h3>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300">Status: <span className="text-green-500 font-bold">Aktiv</span></span>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Stoppa</button>
          </div>
        </div>
        
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
          <h3 className="font-semibold text-lg mb-2 text-blue-500">Data Synkronisering (SpawnBot B)</h3>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300">Status: <span className="text-yellow-500 font-bold">Schemalagd</span></span>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Starta Nu</button>
          </div>
        </div>
        
        {/* Loggvisare placeholder */}
        <div className="mt-6 bg-gray-100 dark:bg-gray-900 p-3 rounded-lg max-h-48 overflow-y-auto font-mono text-xs text-gray-700 dark:text-gray-300">
          <p>[11:41:22] SpawnBot A: Startade framgångsrikt.</p>
          <p>[11:41:30] SpawnBot A: Bearbetar 150/500 poster...</p>
          <p>[11:41:55] SpawnBot B: Väntar på schema 01:00.</p>
        </div>
      </div>
    </div>
  );

  // 2. Tracker Dashboard
  const TrackerDashboard = () => (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <Target className="w-6 h-6 mr-2 text-red-500" /> Projektmåls Tracker
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Övervaka de viktigaste milstolparna och målen i realtid.
      </p>

      <div className="space-y-4">
        {mockTrackerData.map((goal) => (
          <div 
            key={goal.id} 
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-900"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg text-blue-500">{goal.name}</h3>
              <span className={`text-sm font-medium px-3 py-1 rounded-full 
                ${goal.status === 'Klar' ? 'bg-green-100 text-green-700' : 
                   goal.status === 'Pågående' ? 'bg-blue-100 text-blue-700' : 
                   'bg-red-100 text-red-700'}`}
              >
                {goal.status}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full" 
                style={{ 
                  width: `${goal.progress}%`,
                  backgroundColor: goal.progress === 100 ? '#10B981' : goal.progress < 50 ? '#EF4444' : '#3B82F6'
                }}
              ></div>
            </div>
            <p className="text-right text-sm font-bold mt-1 text-gray-700 dark:text-gray-300">{goal.progress}%</p>
          </div>
        ))}
      </div>
      <button className="mt-6 w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-md">
        Lägg till nytt mål
      </button>
    </div>
  );

  // 3. Supcast Hub
  const SupcastHub = () => (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <MessageSquare className="w-6 h-6 mr-2 text-purple-500" /> Supcast Hub
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Centraliserad kommunikations- och sändningskontroll. Hantera meddelanden och eventuella liveströmmar.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SupcastCard title="Senaste Meddelanden" icon={MessageSquare} status="2 Nya" color="text-purple-500">
          <p className="text-sm text-gray-600 dark:text-gray-400">"Fixa buggen i modul X ASAP."</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Från Jonas, 11:30</p>
        </SupcastCard>
        
        <SupcastCard title="Livesändning" icon={Monitor} status="Offline" color="text-gray-500">
          <p className="text-sm text-gray-600 dark:text-gray-400">Nästa sändning: "Sprint Review" imorgon 14:00.</p>
          <button className="mt-2 text-xs font-semibold text-blue-500 hover:text-blue-600">Schemalägg</button>
        </SupcastCard>
      </div>
      <div className="mt-6">
        <input 
          type="text" 
          placeholder="Skicka ett snabbmeddelande till teamet..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
    </div>
  );

  const SupcastCard = ({ title, icon: Icon, status, color, children }) => (
    <div className="p-4 border border-purple-300 dark:border-purple-700 rounded-lg bg-purple-50 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{status}</span>
      </div>
      <h3 className="font-bold text-md mb-1 text-gray-800 dark:text-white">{title}</h3>
      {children}
    </div>
  );


  // 4. Plattform Deluxe Settings
  const PlattformDeluxeSettings = () => (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <Sliders className="w-6 h-6 mr-2 text-teal-500" /> Plattform Deluxe
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Konfigurera avancerade systeminställningar och integrationer för plattformen.
      </p>

      <div className="space-y-6">
        {/* Inställning 1: API-nyckel */}
        <SettingToggle title="Aktivera Premium API" description="Använd den snabbare, dedikerade API-gatewayen." defaultChecked={true} />

        {/* Inställning 2: Loggning */}
        <SettingToggle title="Detaljerad Loggning" description="Spara alla transaktioner för djupare analys (kan påverka prestanda)." defaultChecked={false} />
        
        {/* Inställning 3: Cache Tömning */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center bg-gray-50 dark:bg-gray-900">
            <div>
                <h3 className="font-semibold text-lg text-teal-500">Töm Cache</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rensa all systemcache omedelbart.</p>
            </div>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Töm</button>
        </div>
      </div>
    </div>
  );
  
  const SettingToggle = ({ title, description, defaultChecked }) => {
    const [isChecked, setIsChecked] = useState(defaultChecked);
    return (
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center bg-gray-50 dark:bg-gray-900">
        <div>
          <h3 className="font-semibold text-lg text-teal-500">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
        </label>
      </div>
    );
  };


  // Renderar det aktiva innehållet
  const renderContent = () => {
    switch (activeTab) {
      case 'spawnbot':
        return <SpawnBotControl />;
      case 'tracker':
        return <TrackerDashboard />;
      case 'supcast':
        return <SupcastHub />;
      case 'deluxe':
        return <PlattformDeluxeSettings />;
      default:
        return <TrackerDashboard />;
    }
  };

  const navItems = [
    { name: 'Tracker', icon: Target, tabKey: 'tracker' },
    { name: 'SpawnBot', icon: Zap, tabKey: 'spawnbot' },
    { name: 'Supcast Hub', icon: MessageSquare, tabKey: 'supcast' },
    { name: 'Plattform Deluxe', icon: Box, tabKey: 'deluxe' },
  ];

  return (
    // Använd dark mode för bättre estetik
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans p-4 sm:p-8">
      <style jsx global>{`
        /* Stilar för att säkerställa att mobilvyn ser bra ut */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
        /* Dölj scrollbar på vissa webbläsare för clean UI */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>

      {/* Huvudlayout - Grid för Desktop, Flex/Toggle för Mobil */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">

        {/* Vänster Sida: Navigering (Sidebar) */}
        <aside className="lg:w-64 flex-shrink-0">
          {/* Header/Titel */}
          <div className="flex justify-between items-center lg:block mb-6 p-2">
            <h1 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              Projekt HUB
            </h1>
            {/* Användarinfo/Autentisering Status */}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate hidden lg:block">
              {isAuthReady ? (
                <>Användare ID: {userId}</>
              ) : (
                <span className='text-yellow-500'>Autentiserar...</span>
              )}
            </div>
            {/* Mobil Menyknapp */}
            <button 
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Box className="w-6 h-6" />}
            </button>
          </div>

          {/* Navigering för Desktop */}
          <nav className="hidden lg:block space-y-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
            {navItems.map(item => (
              <NavItem key={item.tabKey} {...item} />
            ))}
          </nav>
          
          {/* Navigering för Mobil (Popup) */}
          {isMobileMenuOpen && (
            <nav className="absolute z-10 top-20 left-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl lg:hidden space-y-2">
              {navItems.map(item => (
                <NavItem key={item.tabKey} {...item} />
              ))}
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t dark:border-gray-700">
                {isAuthReady ? (
                  <>Användare ID: {userId}</>
                ) : (
                  <span className='text-yellow-500'>Autentiserar...</span>
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
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl flex items-center space-x-3">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-800 dark:text-white">Laddar Applikation...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
