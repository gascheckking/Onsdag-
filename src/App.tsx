import React, { useState, useMemo, useCallback } from 'react';
import {
  Home,
  Zap,
  Box,
  Sword,
  Network,
  MessageCircle,
  User,
  Trophy,
  Activity as ActivityIcon,
  Globe,
  Coins,
  ArrowRight,
  Sparkles,
  Star,
  Shuffle,
  Wallet,
  Settings,
  HelpCircle,
  Code2,
  Palette,
  Radar,
  HeartHandshake,
} from 'lucide-react';

// --- TYPER ---
type MainTab =
  | 'home'
  | 'loot'
  | 'market'
  | 'trading'
  | 'quests'
  | 'mesh'
  | 'supcast'
  | 'leaderboard'
  | 'profile'
  | 'settings';

type SupCastCategory = 'tokens' | 'packs' | 'infra' | 'frames' | 'ux';

type MeshRole = 'dev' | 'creator' | 'alpha' | 'collector';

interface SupCastCase {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'Claimed' | 'Solved';
  posterHandle: string;
  posterId: string;
  category: SupCastCategory;
}

interface MeshChatMessage {
  id: number;
  user: string;
  kind: 'system' | 'user';
  text: string;
  ts: string;
}

interface LeaderRow {
  id: string;
  handle: string;
  xp: number;
  trophies: number;
  rank: number;
  type: 'xp' | 'packs' | 'trader';
}

interface ActivityRow {
  id: string;
  label: string;
  value: string;
  note?: string;
}

// --- MOCK: Firebase Setup and Database Functions ---
const MOCK_DB_DELAY = 1000;

const postSupCastCaseToDB = (caseData: Omit<SupCastCase, 'id' | 'status' | 'posterHandle' | 'posterId'>): Promise<SupCastCase> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newCase: SupCastCase = {
        ...caseData,
        id: `db-${Date.now()}`,
        status: 'Open',
        posterHandle: '@spawniz',
        posterId: '0xspawn-db',
      };
      resolve(newCase);
    }, MOCK_DB_DELAY);
  });
};

// --- KOMPONENTER ---

// Holo Card (Återanvändbar kortkomponent)
const HoloCard: React.FC<{ className?: string; children: React.ReactNode }> = ({
    className = '',
    children,
  }) => (
    <div className={`relative rounded-2xl p-[1px] bg-gradient-to-br from-[#00FFC0] via-[#7dd3fc] to-[#a855f7] shadow-[0_0_24px_rgba(0,0,0,0.7)] ${className}`}>
      <div className="bg-[#050509] border border-[#1b1f2b] rounded-2xl h-full w-full p-3 sm:p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(0,255,192,0.25)] hover:rotate-[0.25deg] relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-screen bg-[radial-gradient(circle_at_0_0,#22d3ee,transparent_60%),radial-gradient(circle_at_100%_100%,#a855f7,transparent_60%)]" />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
);

// Mesh Background (Cooooool Effekt)
const MeshBackground = () => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="holo-mesh-bg w-full h-full opacity-60"></div>
        {/* Extra stjärnor/partiklar kan läggas till här om man vill */}
    </div>
);


// --- HUVUDAPPLIKATIONEN ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTab>('home');

  // XP / gamification
  const [xp, setXp] = useState<number>(420);
  const [streakDays, setStreakDays] = useState<number>(3);
  const [trophies, setTrophies] = useState<string[]>(['Tiny Founder', 'Early Mesh']);
  const [spawnRep, setSpawnRep] = useState<number>(78);

  const level = useMemo(() => Math.floor(xp / 200) + 1, [xp]);
  const xpInLevel = useMemo(() => xp % 200, [xp]);
  const xpToNext = 200 - xpInLevel;

  // Roll / mesh ID
  const [meshRole, setMeshRole] = useState<MeshRole>('creator');
  const [pendingRole, setPendingRole] = useState<MeshRole>('creator');
  const [showRoleModal, setShowRoleModal] = useState<boolean>(true);

  const meshRoleLabel = (role: MeshRole): string => {
    switch (role) {
      case 'dev': return 'Dev / Builder';
      case 'creator': return 'Creator / Artist';
      case 'alpha': return 'Alpha hunter';
      case 'collector': return 'Collector / Fan';
    }
    return 'Explorer'; 
  };

  // Theme Helpers
  const neon = 'text-[#00FFC0]';
  const accentBlue = 'text-[#7dd3fc]';

  // SupCast state
  const [newCaseCategory, setNewCaseCategory] = useState<SupCastCategory>('tokens');
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [isPostingCase, setIsPostingCase] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [supCastFeed, setSupCastFeed] = useState<SupCastCase[]>([
    {
      id: '1',
      title: 'Best route: mainnet → Base for small mints?',
      description: 'Under $50, which bridge keeps gas/fees lowest for Zora coins?',
      status: 'Open',
      posterHandle: '@mesh-user',
      posterId: '0x1234abcd',
      category: 'infra',
    },
    {
      id: '2',
      title: 'Why is my Zora coin not showing in Base app?',
      description: 'Minted via frame, wallet sees it, but Base app feed stays empty.',
      status: 'Claimed',
      posterHandle: '@spawniz',
      posterId: '0xfeedcafe',
      category: 'frames',
    },
  ]);

  // Chat
  const [chatMessages, setChatMessages] = useState<MeshChatMessage[]>([
    {
      id: 1,
      user: 'Mesh bot',
      kind: 'system',
      text: 'Welcome to SupCast — ask anything about Base: wallets, tokens, packs, frames, infra.',
      ts: 'now',
    },
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  // Loot
  const [jackpotPot, setJackpotPot] = useState<number>(128.4); 
  const [lastJackpotResult, setLastJackpotResult] = useState<string>('No spin yet');

  // Leaderboard
  const [leaderFilter, setLeaderFilter] = useState<'xp' | 'packs' | 'trader'>('xp');
  const leaders: LeaderRow[] = useMemo(
    () => [
      { id: '1', handle: '@spawniz', xp: 4200, trophies: 7, rank: 1, type: 'xp' },
      { id: '2', handle: '@mesh-whale', xp: 3200, trophies: 6, rank: 2, type: 'xp' },
      { id: '3', handle: '@vibe-hunter', xp: 2850, trophies: 4, rank: 3, type: 'xp' },
      { id: '4', handle: '@tiny-maxi', xp: 2600, trophies: 5, rank: 4, type: 'packs' },
      { id: '5', handle: '@sniper.eth', xp: 2500, trophies: 3, rank: 5, type: 'trader' },
    ],
    []
  );

  const filteredLeaders = useMemo(
    () => leaders.filter((l) => l.type === leaderFilter).sort((a, b) => a.rank - b.rank),
    [leaders, leaderFilter]
  );

  // Activity Rows
  const activityRows: ActivityRow[] = useMemo(
    () => [
      { id: 'a1', label: 'Last action', value: 'Minted Tiny Legend pack', note: 'via Vibe on Base' },
      { id: 'a2', label: 'Gas 24h', value: '$4.12', note: 'mock · Base only' },
      { id: 'a3', label: 'Packs opened', value: '37', note: 'last 7 days' },
      { id: 'a4', label: 'Creator coins', value: '12', note: 'Zora / frames' },
    ],
    []
  );

  // --- ACTIONS ---

  const showToast = useCallback((msg: string) => {
    console.log('[TOAST]', msg);
    // Här skulle man kunna implementera en riktig toast-notifikation
  }, []);

  const addXP = useCallback((amount: number) => {
      setXp((prev) => prev + amount);
      showToast(`+${amount} XP`);
  }, [showToast]);

  const addTrophy = useCallback((label: string) => {
      if (!trophies.includes(label)) {
        setTrophies((prev) => [...prev, label]);
        setSpawnRep((prev) => Math.min(100, prev + 2));
        showToast(`Trophy unlocked: ${label}`);
      }
  }, [trophies, showToast]);

  const handlePostCase = useCallback(async () => {
    if (!newCaseTitle.trim() || !newCaseDesc.trim()) return;
    setIsPostingCase(true);
    const caseData = {
      title: newCaseTitle.trim(),
      description: newCaseDesc.trim(),
      category: newCaseCategory,
    };
    try {
      const postedCase = await postSupCastCaseToDB(caseData);
      setSupCastFeed((prev) => [postedCase, ...prev]);
      setNewCaseTitle('');
      setNewCaseDesc('');
      setNewCaseCategory('tokens');
      addXP(8);
      showToast('SupCast case posted to mesh!');
    } catch (error) {
      showToast('Error posting SupCast case.');
      console.error('DB Post Error:', error);
    } finally {
      setIsPostingCase(false);
    }
  }, [newCaseTitle, newCaseDesc, newCaseCategory, addXP, showToast]);

  const handleGenerateSuggestion = useCallback(() => {
    const latest = supCastFeed[0];
    const baseTopic = latest ? latest.title.toLowerCase() : 'base wallet routing';
    const suggestions = [
      `Isometric Base control room tracking ${baseTopic}`,
      `Neon-black dashboard visualizing ${baseTopic}`,
      `Minimal creator terminal for ${baseTopic}`,
      `3D orbit map of wallets involved in ${baseTopic}`,
      `XP quest screen gamifying ${baseTopic}`,
    ];
    const choice = suggestions[Math.floor(Math.random() * suggestions.length)];
    setAiSuggestion(choice);
    addXP(3);
  }, [supCastFeed, addXP]);

  const handleSendChat = useCallback(() => {
    const text = newChatMessage.trim();
    if (!text) return;
    const msg: MeshChatMessage = {
      id: Date.now(),
      user: '@you',
      kind: 'user',
      text,
      ts: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, msg]);
    setNewChatMessage('');
    addXP(2);
    setSpawnRep((prev) => Math.min(100, prev + 1));
  }, [newChatMessage, addXP]);

  const handleSpinJackpot = useCallback(() => {
    const roll = Math.random();
    let result: string;
    if (roll > 0.985) {
      result = 'JACKPOT HIT 💎 +500 XP + Trophy';
      addXP(500); addTrophy('Daily Jackpot'); setJackpotPot((prev) => prev * 0.7);
    } else if (roll > 0.9) {
      result = '+50 XP & small pot share';
      addXP(50); setJackpotPot((prev) => prev * 0.96);
    } else if (roll > 0.6) {
      result = '+10 XP';
      addXP(10);
    } else {
      result = 'No win – pot grows';
      setJackpotPot((prev) => prev + 5);
    }
    setLastJackpotResult(result);
  }, [addXP, addTrophy]);

  const categoryLabel = (cat: SupCastCategory | string | undefined) => {
    switch (cat) {
      case 'tokens': return 'Tokens & markets';
      case 'packs': return 'Packs & odds';
      case 'infra': return 'Infra / gas / RPC';
      case 'frames': return 'Frames & miniapps';
      case 'ux': return 'UX / flows';
      default: return 'Other';
    }
  };

  // --- TAB KOMPONENTER ---

  const TabButton: React.FC<{ id: MainTab; icon: React.ReactNode; label: string }> = ({ id, icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
        activeTab === id
          ? 'bg-[#0f172a] text-white shadow-[0_0_16px_rgba(0,255,192,0.22)]'
          : 'text-gray-400 hover:bg-[#020617]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const HomeTab = () => (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-white tracking-wide">
            SpawnEngine · <span className={neon}>Onchain Home Base</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-1 max-w-xl">
            One HUD for Base: creator tokens, packs, quests, XP, SupCast, trading & mesh automations.
          </p>
        </div>
      </div>
      
      <HoloCard>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Account status</p>
            <p className="text-sm sm:text-base text-white font-semibold mt-0.5">
              Level {level} · <span className={neon}>{xp} XP</span> · Rep {spawnRep}/100
            </p>
          </div>
          <div className="w-full sm:w-56">
            <div className="h-2.5 w-full rounded-full bg-[#020617] overflow-hidden border border-[#1f2937]">
              <div className="h-full bg-gradient-to-r from-[#00FFC0] via-[#22d3ee] to-[#a855f7]" style={{ width: `${Math.min(100, (xpInLevel / 200) * 100)}%` }} />
            </div>
            <p className="text-[10px] text-gray-500 mt-1 text-right">{xpInLevel}/200 XP in level {level}</p>
          </div>
        </div>
      </HoloCard>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="md:col-span-2 space-y-3">
            <HoloCard>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><ActivityIcon className="w-4 h-4 text-[#00FFC0]" /><h2 className="text-xs font-semibold text-white uppercase tracking-wide">Mesh HUD · wallet pulse</h2></div>
                    <span className="text-[10px] text-gray-500">Mock data · live later</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-[11px]">
                    {activityRows.map((row) => (
                        <div key={row.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827]">
                            <div><p className="text-gray-300">{row.label}</p>{row.note && <p className="text-[10px] text-gray-500">{row.note}</p>}</div>
                            <span className={neon}>{row.value}</span>
                        </div>
                    ))}
                </div>
            </HoloCard>
        </div>
        <div className="space-y-3">
            <HoloCard>
                <div className="flex items-center justify-between mb-1"><p className="text-xs text-gray-300 font-semibold flex items-center gap-1"><Trophy className="w-4 h-4 text-yellow-300" />Trophies</p></div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                    {trophies.map((t) => (<span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#020617] border border-[#4b5563] text-gray-200">{t}</span>))}
                </div>
            </HoloCard>
        </div>
      </div>
    </div>
  );

  const LootTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-white flex items-center gap-2"><Sword className="w-4 h-4 text-red-400" />Loot & Pull Lab</h2></div>
      <div className="grid md:grid-cols-3 gap-3">
        <HoloCard className="md:col-span-2">
          <div className="flex items-center justify-between mb-2"><p className="text-xs text-gray-300 font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-300" />Daily Jackpot 🎰</p><span className="text-[11px] text-gray-500">USDC pot (mock)</span></div>
          <div className="flex items-center justify-between mb-3"><div><p className={`${neon} text-xl font-bold`}>{jackpotPot.toFixed(2)} USDC</p></div><button onClick={handleSpinJackpot} className="px-3 py-1.5 rounded-xl bg-red-600/70 text-xs font-semibold text-white hover:bg-red-500 shadow-lg flex items-center gap-1.5">Spin now<Shuffle className="w-3.5 h-3.5" /></button></div>
          <div className="text-[11px] text-gray-300 px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827]">Result: <span className={neon}>{lastJackpotResult}</span></div>
        </HoloCard>
        <HoloCard><p className="text-xs text-gray-300 font-semibold mb-1">Pack modules</p><ul className="text-[11px] text-gray-400 space-y-0.5 list-disc ml-4"><li>Fragments → Shards</li><li>Shards → Relics</li></ul></HoloCard>
      </div>
    </div>
  );

  const MarketTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[11px] text-gray-400"><div className="flex items-center gap-3"><span>GAS: <span className="text-emerald-400 font-semibold">0.05 gwei</span></span></div></div>
      <HoloCard>
        <div className="flex items-center justify-between gap-3">
          <div className="max-w-md"><p className="text-xs font-semibold text-[#00FFC0] tracking-[0.15em]">SPAWNENGINE MARKET</p><p className="text-sm text-white mt-1">One surface for Base activities.</p></div>
          <button className="px-3 py-2 rounded-xl bg-emerald-500/90 text-xs font-semibold text-black hover:bg-emerald-400 shadow-lg whitespace-nowrap">Create listing (mock)</button>
        </div>
      </HoloCard>
    </div>
  );

  const TradingTab = () => (<div className="space-y-4"><HoloCard><p className="text-xs text-gray-300 font-semibold mb-2">Create listing</p><button onClick={() => { addXP(6); addTrophy('First trade draft'); }} className="px-3 py-1.5 rounded-xl bg-[#22c55e]/80 text-xs font-semibold text-white hover:bg-[#16a34a]">Draft listing</button></HoloCard></div>);
  const QuestsTab = () => (<div className="space-y-4"><HoloCard className="md:col-span-2"><p className="text-xs text-gray-300 font-semibold mb-2 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-300" />Live creator quests (mock)</p></HoloCard></div>);
  const MeshTab = () => (<div className="space-y-4"><HoloCard><p className="text-xs text-gray-300 font-semibold mb-2">Bubble map concept</p></HoloCard></div>);
  
  const SupCastTab = () => (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <HoloCard>
          <h3 className={`${accentBlue} text-xs font-semibold mb-1`}>Ask Base (any topic)</h3>
          <input type="text" placeholder="Short title..." value={newCaseTitle} onChange={(e) => setNewCaseTitle(e.target.value)} className="w-full px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827] text-xs text-gray-200 mb-2" />
          <textarea placeholder="Describe what happened..." value={newCaseDesc} onChange={(e) => setNewCaseDesc(e.target.value)} className="w-full px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827] text-xs text-gray-200 h-20 resize-none mb-2" />
          <button onClick={handlePostCase} disabled={!newCaseTitle || !newCaseDesc || isPostingCase} className={`w-full py-2 rounded-lg text-[11px] font-semibold border ${!newCaseTitle || !newCaseDesc || isPostingCase ? 'bg-gray-900 text-gray-500 border-gray-700 cursor-not-allowed' : 'bg-red-600/40 text-red-200 border-red-600 hover:bg-red-600/60'}`}>{isPostingCase ? 'Posting…' : 'Post to SupCast mesh'}</button>
        </HoloCard>
        <div className="space-y-2">
            <h3 className={`${accentBlue} text-xs font-semibold`}>Live Base questions ({supCastFeed.length})</h3>
            {supCastFeed.map((item) => (
                <div key={item.id} className="px-3 py-2.5 bg-[#020617] rounded-2xl border border-[#111827] flex justify-between items-start">
                    <div className="flex-1 pr-2"><p className="text-[12px] font-semibold text-white mt-0.5">{item.title}</p></div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-[#00FFC0]/15 text-[#00FFC0] border-[#00FFC0]`}>{item.status}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );

  const LeaderboardTab = () => (<div className="space-y-4"><HoloCard><div className="space-y-1.5 text-[11px]">{filteredLeaders.map((l) => (<div key={l.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827]"><div className="flex items-center gap-2"><span className="text-[10px] text-gray-500 w-6">#{l.rank}</span><p className="text-gray-200">{l.handle}</p></div><span className={neon}>{l.xp} XP</span></div>))}</div></HoloCard></div>);
  
  const ProfileTab = () => (
    <div className="space-y-4">
      <HoloCard>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FFC0] via-[#22d3ee] to-[#a855f7] flex items-center justify-center text-xs font-bold text-black">SP</div>
          <div><p className="text-sm text-white font-semibold">@spawniz</p><p className="text-[11px] text-gray-400">{meshRoleLabel(meshRole)}</p></div>
        </div>
        <button onClick={() => setShowRoleModal(true)} className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#020617] border border-[#1b1f2b] text-[11px] text-gray-200 hover:border-[#00FFC0]"><Settings className="w-3.5 h-3.5 text-[#7dd3fc]" />Change mesh role</button>
      </HoloCard>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2"><Settings className="w-4 h-4 text-[#7dd3fc]" />Settings & Integrations (Pillars)</h2>
        <HoloCard>
            <h3 className="text-xs font-semibold text-[#00FFC0] mb-2">Wallet Management</h3>
            <div className="space-y-2 text-[11px]">
                <button className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg bg-[#020617] border border-[#111827] hover:border-[#00FFC0]"><span>Current Active: 0x...64AB (MetaMask)</span><Coins className="w-4 h-4 text-[#00FFC0]" /></button>
                <button className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg bg-[#020617] border border-[#111827] hover:border-[#a855f7]"><span>Swap / Connect New Wallet</span><Wallet className="w-4 h-4 text-[#a855f7]" /></button>
            </div>
        </HoloCard>
        <HoloCard>
            <h3 className="text-xs font-semibold text-[#7dd3fc] mb-2">XP SDK & API (Pillar 1)</h3>
            <button className="w-full py-2 rounded-lg text-[11px] font-semibold bg-emerald-600/60 text-white border border-emerald-600 hover:bg-emerald-600/80">Show API Key</button>
        </HoloCard>
        <HoloCard>
            <h3 className="text-xs font-semibold text-[#a855f7] mb-2">Premium Mesh Filters (Pillar 4)</h3>
            <button className="w-full py-2 rounded-lg text-[11px] font-semibold bg-violet-600/60 text-white border border-violet-600 hover:bg-violet-600/80">Upgrade to Mesh Pro Tier</button>
        </HoloCard>
    </div>
  );

  const RoleModal: React.FC = () => {
    if (!showRoleModal) return null;
    return (
      <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm pb-24 sm:pb-0">
        <div className="w-full max-w-lg px-3">
          <HoloCard>
            <button onClick={() => setShowRoleModal(false)} className="absolute right-3 top-2 text-gray-500 text-sm hover:text-gray-300">×</button>
            <h3 className="text-sm font-semibold text-white mb-1">Choose your role</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
              {['dev', 'creator', 'alpha', 'collector'].map((r) => (
                  <button key={r} onClick={() => setPendingRole(r as MeshRole)} className={`text-left rounded-xl border px-2.5 py-2 flex flex-col gap-1 transition ${pendingRole === r ? 'border-[#00FFC0] bg-[#00FFC0]/10' : 'border-[#111827] bg-[#020617]'}`}>
                    <span className="text-gray-100 font-semibold">{r.toUpperCase()}</span>
                  </button>
              ))}
            </div>
            <button onClick={() => { setMeshRole(pendingRole); setShowRoleModal(false); addXP(12); }} className="w-full py-2 rounded-xl bg-gradient-to-r from-[#00FFC0] via-[#22d3ee] to-[#a855f7] text-xs font-semibold text-black shadow-lg hover:brightness-110">Save role</button>
          </HoloCard>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-gray-100 relative">
      <MeshBackground /> {/* Bakgrundseffekten */}
      
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <button onClick={() => setActiveTab('profile')} className="flex items-center gap-3 text-left hover:opacity-80 transition">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#00FFC0] via-[#22d3ee] to-[#a855f7] flex items-center justify-center text-xs font-bold text-black shadow-lg">SE</div>
            <div><p className="text-xs text-gray-500 uppercase tracking-[0.2em]">SpawnEngine</p><p className="text-sm text-white font-semibold">Home for everything onchain</p></div>
          </button>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#020617] border border-[#1b1f2b]"><Wallet className="w-3.5 h-3.5 text-[#00FFC0]" /><span className="text-gray-300">Wallet: not connected</span></div>
            <button onClick={() => setActiveTab('settings')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#020617] border border-[#1b1f2b] text-gray-300 hover:border-[#7dd3fc]"><Settings className="w-3.5 h-3.5 text-[#7dd3fc]" /><span>Settings</span></button>
          </div>
        </header>

        {/* Nav */}
        <nav className="flex flex-wrap gap-1.5 mb-4">
          <TabButton id="home" icon={<Home className="w-4 h-4" />} label="Overview" />
          <TabButton id="loot" icon={<Sword className="w-4 h-4" />} label="Packs" />
          <TabButton id="market" icon={<Box className="w-4 h-4" />} label="Market" />
          <TabButton id="trading" icon={<Shuffle className="w-4 h-4" />} label="Trading" />
          <TabButton id="quests" icon={<Sparkles className="w-4 h-4" />} label="Quests" />
          <TabButton id="mesh" icon={<Network className="w-4 h-4" />} label="Mesh" />
          <TabButton id="supcast" icon={<MessageCircle className="w-4 h-4" />} label="SupCast" />
          <TabButton id="leaderboard" icon={<Trophy className="w-4 h-4" />} label="Leaders" />
          <TabButton id="profile" icon={<User className="w-4 h-4" />} label="Profile" />
          <TabButton id="settings" icon={<Settings className="w-4 h-4" />} label="Settings" />
        </nav>

        {/* Content */}
        <main className="pb-8 space-y-4">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'loot' && <LootTab />}
          {activeTab === 'market' && <MarketTab />}
          {activeTab === 'trading' && <TradingTab />}
          {activeTab === 'quests' && <QuestsTab />}
          {activeTab === 'mesh' && <MeshTab />}
          {activeTab === 'supcast' && <SupCastTab />}
          {activeTab === 'leaderboard' && <LeaderboardTab />}
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>
      <RoleModal />
    </div>
  );
};

export default App;
