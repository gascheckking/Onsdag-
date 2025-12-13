import React, { useState, useEffect, useRef } from 'react';
import { Home, Compass, Box, ShoppingCart, Cpu, Settings, User, Zap, Activity, Link, MessageCircle } from 'lucide-react';

// Kontrollera att THREE.js är tillgängligt, annars logga ett fel.
if (typeof THREE === 'undefined') {
  console.warn("THREE.js är inte laddat. MeshBackground kommer inte att synas.");
}

// --- MeshBackground Component ---
// Denna komponent skapar en 3D-mesh av punkter som subtilt roterar 
// och blinkar slumpmässigt för att simulera "onchain activity" i bakgrunden.
const MeshBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (typeof THREE === 'undefined' || !mountRef.current) return;

    // 1. Setup
    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setClearColor(0x000000, 0); // Transparent bakgrund
    currentMount.appendChild(renderer.domElement);
    
    // 2. Mesh Generation
    const particlesCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const color = new THREE.Color();
    const range = 50; 
    
    for (let i = 0; i < particlesCount; i++) {
      // Slumpmässig position i 3D-rymden
      positions.push((Math.random() - 0.5) * range);
      positions.push((Math.random() - 0.5) * range);
      positions.push((Math.random() - 0.5) * range);

      // Initial färg (Subtil indigo/blå nyans, låg ljusstyrka)
      color.setHSL(0.6, 0.5, 0.4 + Math.random() * 0.2); 
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ 
      size: 0.2, 
      vertexColors: true, 
      sizeAttenuation: true 
    });

    const mesh = new THREE.Points(geometry, material);
    scene.add(mesh);
    camera.position.z = 30; 

    // 3. Animation Loop & Activity Simulation
    let frame = 0;
    let animationId;

    const animate = () => {
      frame++;
      animationId = requestAnimationFrame(animate);

      // Subtil rotation
      mesh.rotation.y += 0.0005;
      mesh.rotation.x += 0.0001;

      const colorsArray = geometry.attributes.color.array;
      
      // Fada ut blinkande noder mot basfärgen
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        // Ljusstyrka (index 2) fadar mot 0.4 (basfärg)
        colorsArray[i3 + 2] = colorsArray[i3 + 2] * 0.98 + (0.4 * 0.02); 
      }
      
      // Slumpmässigt blinka 1-3 noder var 50:e frame (simulerar aktivitet)
      if (frame % 50 === 0) {
        for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
          const index = Math.floor(Math.random() * particlesCount);
          const i3 = index * 3;
          
          // Öka ljusstyrkan till nästan vit (1.0) för att blinka
          colorsArray[i3 + 2] = 1.0; 
        }
      }

      geometry.attributes.color.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    // 4. Handle Resize
    const handleResize = () => {
      if (currentMount) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // 5. Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      // Positionerar den absolut i bakgrunden med låg opacitet
      className="absolute inset-0 z-0 opacity-20 pointer-events-none"
    >
      {/* Three.js canvas kommer att injiceras här */}
    </div>
  );
};
// --- End of MeshBackground Component ---


// Denna komponent implementerar hela SpawnEngine Dashboard UI med Tailwind CSS,
// baserat på den visade designen (exempel.png).
// All logik och presentation är samlad i denna enda fil för enkelhetens skull.

const App = () => {
  // Simulerad användarstatus
  const [walletConnected, setWalletConnected] = useState(false);
  const [xpStreak, setXpStreak] = useState(1575);
  const [spawnBalance, setSpawnBalance] = useState(497);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [activeTab, setActiveTab] = useState('Home');

  // Navigationslänkar för sidomenyn och bottenmenyn
  const navItems = [
    { name: 'Profile', icon: User, hiddenOnDesktop: true },
    { name: 'Home', icon: Home, desktopOnly: true },
    { name: 'Loot', icon: Box },
    { name: 'Market', icon: ShoppingCart },
    { name: 'Brain', icon: Cpu },
    { name: 'Settings', icon: Settings },
  ];

  // Mock-data för "Today's Loop"
  const loopTasks = [
    { label: 'Open a test pack', xp: 50, checked: true },
    { label: 'Connect wallet', xp: 100, checked: false },
    { label: 'Share your mesh', xp: 100, checked: false },
  ];

  // --- UI Komponenter ---

  // Huvudstatistikkort för snabb översikt
  const StatCard = ({ title, value, unit, icon: Icon }) => (
    <div className="relative p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 flex flex-col justify-between overflow-hidden">
      <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-2 z-10">{title}</div>
      <div className="text-2xl font-bold text-white leading-none z-10">
        {value}
        {unit && <span className="text-base font-normal text-gray-400 ml-1">{unit}</span>}
      </div>
      {Icon && <Icon className="w-5 h-5 text-indigo-400 absolute top-4 right-4 opacity-30 z-0" />}
    </div>
  );

  // Linkad App/Social Yta Kort
  const FeatureCard = ({ title, description, status, icon: Icon }) => (
    <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base font-semibold text-white flex items-center">
          {Icon && <Icon className="w-5 h-5 text-indigo-400 mr-2" />}
          {title}
        </h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          status === 'REQUIRED' ? 'bg-red-900/50 text-red-300 border border-red-700' :
          status === 'PLANNED' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' :
          'bg-green-900/50 text-green-300 border border-green-700'
        }`}>{status}</span>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );

  // Sidomeny/Navigationskomponent
  const Sidebar = ({ isMobile = false }) => (
    <nav className={isMobile ? "flex justify-around w-full" : "space-y-2 p-4"}>
      {navItems.filter(item => isMobile ? true : !item.hiddenOnDesktop).map((item) => {
        const isActive = activeTab === item.name;
        const Icon = item.icon;
        
        // Döljer Profile-länken på desktop eftersom den har en egen plats i header/avatar-området i designen
        if (!isMobile && item.name === 'Profile') return null;

        return (
          <a
            key={item.name}
            href="#"
            onClick={() => setActiveTab(item.name)}
            className={`flex items-center justify-center lg:justify-start w-full transition-colors ${
              isMobile ? 'flex-col text-xs py-1.5' : 'py-2 px-3 rounded-xl'
            } ${
              isActive
                ? 'text-white bg-indigo-600 lg:bg-indigo-600/50'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Icon className={`w-5 h-5 ${isMobile ? 'mb-1 lg:mr-3' : 'mr-3'}`} />
            <span className={isMobile ? '' : 'font-medium'}>{item.name}</span>
          </a>
        );
      })}
    </nav>
  );

  // --- Huvudlayout ---

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col lg:flex-row relative overflow-hidden">
      
      {/* 0. Mesh Bakgrund (Z-index 0) */}
      <MeshBackground />
      
      {/* 1. Desktop Sidomeny (Hidden on Mobile) */}
      {/* Z-index 10 behövs för att menyn ska vara över den dolda mesh-bakgrunden */}
      <div className="hidden lg:flex lg:w-64 flex-col bg-gray-900 border-r border-gray-800 p-4 fixed h-full z-10">
        {/* Logotyp och profil-toggle */}
        <div className="flex items-center p-2 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-sm mr-3">SE</div>
          <span className="text-lg font-bold">SPAWNENGINE</span>
        </div>
        
        {/* Huvudnavigering */}
        <Sidebar />

        {/* Rapporter/Config sektion */}
        <div className="mt-auto pt-4 border-t border-gray-800">
          <div className="text-sm font-semibold text-gray-500 uppercase mb-3 px-3">Reports / Config</div>
          <ul className="space-y-1 text-gray-400 text-sm">
            {['Trading Hub', 'Deploy Center', 'Creator Forge', 'Activity Mesh'].map(item => (
              <li key={item} className="py-1 px-3 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 2. Huvudinnehåll */}
      {/* Relative z-10 ser till att UI-innehållet ligger över mesh-bakgrunden */}
      <main className="flex-1 pb-20 lg:pb-4 lg:ml-64 p-4 lg:p-8 relative z-10">
        
        {/* Toppremsa (Header) */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-800 pb-4">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-sm mr-3 lg:hidden">SE</div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-white">
              <span className="lg:hidden">SPAWNENGINE</span> <span className="hidden lg:inline">SpawnEngine Platform View</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center space-x-2 text-sm">
            <div className="bg-green-900/50 text-green-300 font-bold px-3 py-1 rounded-full border border-green-700">BASE MESH LAYER</div>
            <button
              onClick={() => setWalletConnected(!walletConnected)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-900/30"
            >
              <Link className="inline w-4 h-4 mr-1" />
              {walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
            </button>
          </div>
        </header>

        {/* Anslutningsstatus och snabbinfo */}
        <section className="mb-8 p-4 bg-gray-800/50 rounded-2xl border border-gray-700">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-sm font-medium text-gray-400">
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${walletConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              WALLET: <span className={`ml-1 ${walletConnected ? 'text-green-400' : 'text-red-400'}`}>{walletConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="flex items-center col-span-1 lg:col-span-2">GAS: ~0.25 gwei est.</div>
            <div className="flex items-center">MESH: 9 events</div>
            <div className="flex items-center">XP: {xpStreak}</div>
            <div className="flex items-center">SPAWN: {spawnBalance}</div>
            <div className="flex items-center">MODE: v0.2 - mock data</div>
          </div>
          
          {/* Navigeringsflikar under statusen */}
          <div className="mt-4 flex flex-wrap gap-2">
            {['Profile', 'Overview', 'Trading', 'Pull Lab', 'Pack Maps'].map(tab => (
              <button key={tab} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                tab === 'Profile'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-4 text-xs text-gray-500 border-t border-gray-700 pt-3">
            LIVE PUL: <span className="text-white font-mono">pack_open · 0xA9...93 → Neon Fragments (Fragment) · burn → 0x4B...2F</span>
          </div>
        </section>

        {/* MESH PROFILE Sektion */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-indigo-400 mb-4 flex items-center">
            <Activity className="w-6 h-6 mr-2" /> MESH PROFILE
          </h2>
          
          {/* Användarinfo */}
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 mb-6">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-xs mr-2">SE</div>
                <span className="text-lg font-bold text-white mr-2">@spawnengine</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${onlineStatus ? 'bg-green-700/50 text-green-300' : 'bg-gray-700/50 text-gray-400'}`}>
                  {onlineStatus ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400">One wallet, multiple contract types, all flowing into a single activity mesh.</p>
            <p className="text-xs mt-2 text-gray-500">Connected modules: Factory · TokenPackSeries · ReserveGuard · UtilityRouter (mock v0.2)</p>
          </div>

          {/* Statistikgaller */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="XP Streak" value={xpStreak} unit="(mock)" icon={Zap} />
            <StatCard title="Spawn Balance" value={spawnBalance} unit="(mock)" icon={Box} />
            <StatCard title="Today's Events" value={9} icon={Activity} />
            <div className="sm:col-span-2 lg:col-span-1 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-2">Connected Surfaces</div>
                <div className="text-2xl font-bold text-white leading-none">3</div>
                <p className="text-xs text-gray-400 mt-1">Token packs · NFT packs · Zora packs (planned).</p>
            </div>
          </div>
        </section>

        {/* Länkade Appar */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-3">LINKED APPS</h2>
          <FeatureCard
            title="Base wallet"
            description="Connect wallet to lock in your mesh identity. XP, and Spawn rewards will be tied to this wallet's onchain activity."
            status="REQUIRED"
            icon={Link}
          />
        </section>

        {/* Sociala Ytor */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-3">SOCIAL SURFACES</h2>
          <FeatureCard
            title="Farcaster & Zora"
            description="Profile hooks: casts, mints & creator coins streamed into the mesh. Your casts and creator actions will become first-class events in the activity layer."
            status="PLANNED"
            icon={MessageCircle}
          />
        </section>
        
        {/* Dagens Loop */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-3">TODAY'S LOOP</h2>
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 space-y-4">
            {loopTasks.map((task, index) => (
              <div key={index} className="flex justify-between items-center">
                <label className="flex items-center text-white cursor-pointer">
                  <input
                    type="radio"
                    name="loop-task"
                    checked={task.checked}
                    readOnly
                    className="form-radio h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                  />
                  <span className="ml-3">
                    {task.label}
                    {task.checked && <span className="text-xs text-green-400 ml-2">(completed)</span>}
                  </span>
                </label>
                <span className="text-green-400 font-bold">+ {task.xp} XP available</span>
              </div>
            ))}
            <p className="text-sm text-gray-500 pt-3 border-t border-gray-700">Daily tasks reset in 10h 32m.</p>
          </div>
        </section>

      </main>

      {/* 3. Mobil Bottenmeny (Hidden on Desktop) */}
      <footer className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-800 p-2 lg:hidden z-10 shadow-[0_-5px_10px_rgba(0,0,0,0.5)]">
        <Sidebar isMobile={true} />
      </footer>
    </div>
  );
};

export default App;
