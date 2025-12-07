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
  X,
} from 'lucide-react';

type MainTab =
  | 'home'
  | 'loot'
  | 'market'
  | 'trading'
  | 'quests'
  | 'mesh'
  | 'supcast'
  | 'leaderboard'
  | 'profile';

type SupCastCategory = 'tokens' | 'packs' | 'infra' | 'frames' | 'ux';

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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTab>('home');

  // XP / gamification
  const [xp, setXp] = useState<number>(420);
  const [streakDays, setStreakDays] = useState<number>(3);
  const [trophies, setTrophies] = useState<string[]>(['Tiny Founder', 'Early Mesh']);
  const [spawnRep, setSpawnRep] = useState<number>(78); // 0–100
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // bottom sheet
  const [showSettings, setShowSettings] = useState(false); // header dropdown
  const [showApiKey, setShowApiKey] = useState(false);
  const level = useMemo(() => Math.floor(xp / 200) + 1, [xp]);
  const xpInLevel = useMemo(() => xp % 200, [xp]);
  const xpToNext = 200 - xpInLevel;

  // Holo theme helpers
  const neon = 'text-[#00FFC0]';
  const accentBlue = 'text-[#7dd3fc]';
  const cardBg = 'bg-[#050509]';
  const borderColor = 'border border-[#1b1f2b]';

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

  // SupCast local chat
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

  // Loot / jackpot
  const [jackpotPot, setJackpotPot] = useState<number>(128.4); // USDC mock
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

  // Activity rows (dashboard)
  const activityRows: ActivityRow[] = useMemo(
    () => [
      { id: 'a1', label: 'Last action', value: 'Minted Tiny Legend pack', note: 'via Vibe on Base' },
      { id: 'a2', label: 'Gas 24h', value: '$4.12', note: 'mock · Base only' },
      { id: 'a3', label: 'Packs opened', value: '37', note: 'last 7 days' },
      { id: 'a4', label: 'Creator coins', value: '12', note: 'Zora / frames' },
    ],
    []
  );

  // Helpers
  const showToast = useCallback((msg: string) => {
    console.log('[TOAST]', msg);
  }, []);

  const addXP = useCallback(
    (amount: number) => {
      setXp((prev) => prev + amount);
      showToast(`+${amount} XP`);
    },
    [showToast]
  );

  const addTrophy = useCallback(
    (label: string) => {
      if (!trophies.includes(label)) {
        setTrophies((prev) => [...prev, label]);
        setSpawnRep((prev) => Math.min(100, prev + 2));
        showToast(`Trophy unlocked: ${label}`);
      }
    },
    [trophies, showToast]
  );

  // HoloCard component
  const HoloCard: React.FC<{ className?: string; children: React.ReactNode }> = ({
    className = '',
    children,
  }) => (
    <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-[#00FFC0] via-[#7dd3fc] to-[#a855f7] shadow-[0_0_24px_rgba(0,0,0,0.7)]">
      <div
        className={`${cardBg} ${borderColor} rounded-2xl h-full w-full p-3 sm:p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(0,255,192,0.25)] hover:rotate-[0.25deg] ${className}`}
      >
        <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-screen bg-[radial-gradient(circle_at_0_0,#22d3ee,transparent_60%),radial-gradient(circle_at_100%_100%,#a855f7,transparent_60%)]" />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );

  // SupCast helpers
  const categoryLabel = (cat: SupCastCategory | string | undefined) => {
    switch (cat) {
      case 'tokens':
        return 'Tokens & markets';
      case 'packs':
        return 'Packs & odds';
      case 'infra':
        return 'Infra / gas / RPC';
      case 'frames':
        return 'Frames & miniapps';
      case 'ux':
        return 'UX / flows';
      default:
        return 'Other';
    }
  };

  const handlePostCase = useCallback(() => {
    if (!newCaseTitle.trim() || !newCaseDesc.trim()) return;
    setIsPostingCase(true);
    const newCase: SupCastCase = {
      id: `local-${Date.now()}`,
      title: newCaseTitle.trim(),
      description: newCaseDesc.trim(),
      status: 'Open',
      posterHandle: '@spawniz',
      posterId: '0xspawn',
      category: newCaseCategory,
    };
    setSupCastFeed((prev) => [newCase, ...prev]);
    setNewCaseTitle('');
    setNewCaseDesc('');
    setNewCaseCategory('tokens');
    setIsPostingCase(false);
    addXP(8);
  }, [newCaseTitle, newCaseDesc, newCaseCategory, addXP]);

  const handleGenerateSuggestion = useCallback(() => {
    const latest = supCastFeed[0];
    const baseTopic = latest
      ? latest.title.toLowerCase()
      : 'base wallet routing between Zora, Vibe and Farcaster frames';

    const suggestions = [
      `Isometric Base control room tracking ${baseTopic} in holo HUD style`,
      `Neon-black dashboard visualizing ${baseTopic} like a game lobby UI`,
      `Minimal creator terminal for ${baseTopic}, dark OS-style interface`,
      `3D orbit map of wallets involved in ${baseTopic} on Base`,
      `XP quest screen gamifying ${baseTopic} across creator tokens`,
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

  // Loot / jackpot spin
  const handleSpinJackpot = useCallback(() => {
    const roll = Math.random();
    let result: string;

    if (roll > 0.985) {
      result = 'JACKPOT HIT 💎 +500 XP + Trophy';
      addXP(500);
      addTrophy('Daily Jackpot');
      setJackpotPot((prev) => prev * 0.7);
    } else if (roll > 0.9) {
      result = '+50 XP & small pot share';
      addXP(50);
      setJackpotPot((prev) => prev * 0.96);
    } else if (roll > 0.6) {
      result = '+10 XP';
      addXP(10);
    } else {
      result = 'No win – pot grows';
      setJackpotPot((prev) => prev + 5);
    }

    setLastJackpotResult(result);
  }, [addXP, addTrophy]);

  // Tabs
  const TabButton: React.FC<{ id: MainTab; icon: React.ReactNode; label: string }> = ({
    id,
    icon,
    label,
  }) => (
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

  // Views
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
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-[#020617] border border-[#1b1f2b] flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#00FFC0]" />
            <span className="text-gray-300">Base mainnet</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#020617] border border-[#1b1f2b] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-gray-300">Mesh streak {streakDays}d</span>
          </div>
        </div>
      </div>

      {/* XP strip */}
      <HoloCard className="overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Account status</p>
            <p className="text-sm sm:text-base text-white font-semibold mt-0.5">
              Level {level} · <span className={neon}>{xp} XP</span> · Rep {spawnRep}/100
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              {xpToNext} XP to next rank · quests, packs, SupCast & streaks all count.
            </p>
          </div>
          <div className="w-full sm:w-56">
            <div className="h-2.5 w-full rounded-full bg-[#020617] overflow-hidden border border-[#1f2937]">
              <div
                className="h-full bg-gradient-to-r from-[#00FFC0] via-[#22d3ee] to-[#a855f7]"
                style={{ width: `${Math.min(100, (xpInLevel / 200) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1 text-right">
              {xpInLevel}/200 XP in level {level}
            </p>
          </div>
        </div>
      </HoloCard>

      {/* Grid: dashboard + market */}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="md:col-span-2 space-y-3">
          <HoloCard>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-[#00FFC0]" />
                <h2 className="text-xs font-semibold text-white uppercase tracking-wide">
                  Mesh HUD · wallet pulse
                </h2>
              </div>
              <span className="text-[10px] text-gray-500">Mock data · live later</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-[11px]">
              {activityRows.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827]"
                >
                  <div>
                    <p className="text-gray-300">{row.label}</p>
                    {row.note && <p className="text-[10px] text-gray-500">{row.note}</p>}
                  </div>
                  <span className={neon}>{row.value}</span>
                </div>
              ))}
            </div>
          </HoloCard>

          <HoloCard>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-[#a855f7]" />
                <h2 className="text-xs font-semibold text-white uppercase tracking-wide">
                  Creator tokens & packs
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('market')}
                className="flex items-center gap-1 text-[10px] text-[#7dd3fc] hover:text-[#bae6fd]"
              >
                Open market
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-lg bg-[#020617] border border-[#111827] p-2">
                <p className="text-gray-400 mb-1">Tiny Legends pool</p>
                <p className="text-xs text-white font-semibold">+12.4% P&L (mock)</p>
              </div>
              <div className="rounded-lg bg-[#020617] border border-[#111827] p-2">
                <p className="text-gray-400 mb-1">Zora coins tracked</p>
                <p className="text-xs text-white font-semibold">12 tokens</p>
              </div>
              <div className="rounded-lg bg-[#020617] border border-[#111827] p-2">
                <p className="text-gray-400 mb-1">Packs ecosystems</p>
                <p className="text-xs text-white font-semibold">3 active</p>
              </div>
            </div>
          </HoloCard>
        </div>

        <div className="space-y-3">
          <HoloCard>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-300 font-semibold flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-300" />
                Trophies
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {trophies.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[#020617] border border-[#4b5563] text-gray-200"
                >
                  {t}
                </span>
              ))}
              {trophies.length === 0 && (
                <span className="text-[10px] text-gray-500">Unlock trophies by playing the mesh.</span>
              )}
            </div>
          </HoloCard>

          <HoloCard>
            <p className="text-xs text-gray-300 font-semibold mb-1">Quick actions</p>
            <div className="flex flex-col gap-1.5 text-[11px]">
              <button
                onClick={() => {
                  setActiveTab('quests');
                  addXP(5);
                }}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827] hover:border-[#00FFC0]"
              >
                <span>Open creator quests</span>
                <Sparkles className="w-3.5 h-3.5 text-[#00FFC0]" />
              </button>
              <button
                onClick={() => setActiveTab('supcast')}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827] hover:border-[#7dd3fc]"
              >
                <span>Ask SupCast (Base help)</span>
                <HelpCircle className="w-3.5 h-3.5 text-[#7dd3fc]" />
              </button>
              <button
                onClick={() => setActiveTab('trading')}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827] hover:border-[#a855f7]"
              >
                <span>Open trading lab</span>
                <Shuffle className="w-3.5 h-3.5 text-[#a855f7]" />
              </button>
            </div>
          </HoloCard>
        </div>
      </div>
    </div>
  );

  const LootTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sword className="w-4 h-4 text-red-400" />
          Loot & Pull Lab
        </h2>
        <p className="text-[11px] text-gray-500">Entropy playground · packs later onchain</p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <HoloCard className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-300 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Daily Jackpot 🎰
            </p>
            <span className="text-[11px] text-gray-500">USDC pot (mock)</span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">
            Cheap entry spin. One click per day later → today only UI. Hits feed your XP, trophies and future rewards.
          </p>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className={`${neon} text-xl font-bold`}>{jackpotPot.toFixed(2)} USDC</p>
              <p className="text-[11px] text-gray-500">Growing with each miss</p>
            </div>
            <button
              onClick={handleSpinJackpot}
              className="px-3 py-1.5 rounded-xl bg-red-600/70 text-xs font-semibold text-white hover:bg-red-500 shadow-lg flex items-center gap-1.5"
            >
              Spin now
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-[11px] text-gray-300 px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827]">
            Result: <span className={neon}>{lastJackpotResult}</span>
          </div>
        </HoloCard>

        <HoloCard>
          <p className="text-xs text-gray-300 font-semibold mb-1">Pack modules</p>
          <ul className="text-[11px] text-gray-400 space-y-0.5 list-disc ml-4">
            <li>Fragments → Shards</li>
            <li>Shards → Relics</li>
            <li>Relics → Mythics (no burn)</li>
          </ul>
          <p className="text-[10px] text-gray-500 mt-2">
            UI first, then wired to PackFactory / TokenPackSeries on Base.
          </p>
        </HoloCard>
      </div>
    </div>
  );

  const MarketTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Box className="w-4 h-4 text-[#7dd3fc]" />
          Market · Tokens & Packs
        </h2>
        <p className="text-[11px] text-gray-500">Zora · Vibe · frames · SpawnEngine packs</p>
      </div>

      <div className="grid md:grid-cols-[2fr,1.4fr] gap-3">
        <HoloCard>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-300 font-semibold flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#00FFC0]" />
              Trending creator tokens (mock)
            </p>
            <span className="text-[11px] text-gray-500">Live Zora feed later</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            {[
              {
                name: 'SPAWNIZ',
                chain: 'Base',
                move: '+18.2%',
                note: 'Tiny Legends + packs',
              },
              { name: 'WARP', chain: 'Base', move: '+7.4%', note: 'Onchain activity tracker' },
              { name: 'MESH', chain: 'Base', move: '-3.1%', note: 'XP & streak infra' },
            ].map((t) => (
              <div
                key={t.name}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827]"
              >
                <div>
                  <p className="text-gray-200 font-semibold">{t.name}</p>
                  <p className="text-[10px] text-gray-500">
                    {t.chain} · {t.note}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold ${
                    t.move.startsWith('-') ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {t.move}
                </span>
              </div>
            ))}
          </div>
        </HoloCard>

        <HoloCard>
          <p className="text-xs text-gray-300 font-semibold mb-2">Tiny Legends / packs spotlight</p>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827]">
              <div>
                <p className="text-gray-200 font-semibold">Tiny Legends 2 · Genesis</p>
                <p className="text-[10px] text-gray-500">Animated holo cards planned</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('profile');
                  addXP(4);
                }}
                className="px-2 py-1 rounded-lg bg-[#00FFC0]/15 text-[10px] text-[#00FFC0] border border-[#00FFC0]/60"
              >
                View profile
              </button>
            </div>
            <p className="text-[10px] text-gray-500">
              This section later wires to Vibe / SpawnEngine pack index on Base.
            </p>
          </div>
        </HoloCard>
      </div>
    </div>
  );

  const TradingTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Shuffle className="w-4 h-4 text-[#a855f7]" />
          Trading Lab · Auctions & P2P
        </h2>
        <p className="text-[11px] text-gray-500">UI ready · contracts later</p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <HoloCard className="md:col-span-2">
          <p className="text-xs text-gray-300 font-semibold mb-2">Create listing</p>
          <div className="grid sm:grid-cols-2 gap-2 text-[11px]">
            <div className="space-y-1.5">
              <label className="block text-gray-400">Asset</label>
              <input
                className="w-full px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827] text-xs text-gray-200"
                placeholder="Token / pack / NFT id"
              />
              <label className="block text-gray-400 mt-2">Mode</label>
              <select className="w-full px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827] text-xs text-gray-200">
                <option>Auction</option>
                <option>P2P swap</option>
                <option>Fixed price</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-gray-400">Price / terms</label>
              <input
                className="w-full px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827] text-xs text-gray-200"
                placeholder="e.g. 0.03 ETH, or swap for X"
              />
              <label className="block text-gray-400 mt-2">Expiry</label>
              <input
                className="w-full px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827] text-xs text-gray-200"
                placeholder="e.g. 24h"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-[10px] text-gray-500">
              Contracts plug in later (SpawnEngine market module). For now this is layout + flow.
            </p>
            <button
              onClick={() => {
                addXP(6);
                addTrophy('First trade draft');
              }}
              className="px-3 py-1.5 rounded-xl bg-[#22c55e]/80 text-xs font-semibold text-white hover:bg-[#16a34a]"
            >
              Draft listing
            </button>
          </div>
        </HoloCard>

        <HoloCard>
          <p className="text-xs text-gray-300 font-semibold mb-2">Active ideas</p>
          <ul className="text-[11px] text-gray-400 space-y-1 list-disc ml-4">
            <li>Creator-only auctions for pack mythics</li>
            <li>P2P swaps across Tiny / other collections</li>
            <li>“Copy trader” rails for Base meme coins</li>
          </ul>
        </HoloCard>
      </div>
    </div>
  );

  const QuestsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00FFC0]" />
          Quests & creator bounties
        </h2>
        <p className="text-[11px] text-gray-500">Do things on Base · earn XP / spawn rewards</p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <HoloCard className="md:col-span-2">
          <p className="text-xs text-gray-300 font-semibold mb-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-300" />
            Live creator quests (mock)
          </p>
          <div className="space-y-1.5 text-[11px]">
            {[
              {
                title: 'Mint your first Tiny Legends 2 pack',
                reward: '+40 XP · chance for “Tiny Starter” trophy',
              },
              {
                title: 'Answer 1 SupCast question with real Base alpha',
                reward: '+60 XP · +spawn rep',
              },
              {
                title: 'Bridge small amount to Base and mint a Zora coin',
                reward: '+80 XP · future spawn token rewards',
              },
            ].map((q, i) => (
              <div
                key={q.title}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827]"
              >
                <div>
                  <p className="text-gray-200">{q.title}</p>
                  <p className="text-[10px] text-gray-500">{q.reward}</p>
                </div>
                <button
                  onClick={() => {
                    addXP(20 + i * 10);
                    if (i === 0) addTrophy('Tiny Starter');
                  }}
                  className="px-2 py-1 rounded-lg bg-[#00FFC0]/15 text-[10px] text-[#00FFC0] border border-[#00FFC0]/60"
                >
                  Track
                </button>
              </div>
            ))}
          </div>
        </HoloCard>

        <HoloCard>
          <p className="text-xs text-gray-300 font-semibold mb-1">Bounty jackpot idea</p>
          <p className="text-[11px] text-gray-400">
            “Do this, win this.” Some quests can feed into the same jackpot logic as Loot tab — onchain raffles later,
            UI here.
          </p>
        </HoloCard>
      </div>
    </div>
  );

  const MeshTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Network className="w-4 h-4 text-[#22d3ee]" />
          Mesh Explorer (preview)
        </h2>
        <p className="text-[11px] text-gray-500">Later: wallet bubbles, flows, creator clusters</p>
      </div>

      <HoloCard>
        <p className="text-xs text-gray-300 font-semibold mb-2">Bubble map concept</p>
        <p className="text-[11px] text-gray-400 mb-2">
          This view becomes “Nansen for creators” later: wallet clusters, creator ecosystems, pack migrations and token
          streaks. For now it’s just reserved space and layout.
        </p>
        <div className="h-40 sm:h-52 rounded-xl bg-gradient-to-br from-[#020617] via-[#020617] to-[#0b1120] border border-[#111827] flex items-center justify-center">
          <p className="text-[11px] text-gray-600">Mesh bubble map placeholder · animation + onchain data later</p>
        </div>
      </HoloCard>
    </div>
  );

  const SupCastTab = () => {
    const userProfile = { solved: 7, xp: 350, rating: 4.5 };

    return (
      <div className="space-y-4">
        <h2 className={`${neon} text-sm font-semibold uppercase tracking-wide flex items-center gap-2`}>
          <MessageCircle className="w-4 h-4" />
          SupCast · Base help desk
        </h2>

        {/* row 1 */}
        <div className="grid sm:grid-cols-2 gap-3">
          <HoloCard>
            <h3 className={`${accentBlue} text-xs font-semibold mb-1`}>Ask Base (any topic)</h3>
            <p className="text-[11px] text-gray-400 mb-2">
              Wallets, bridges, creator tokens, packs, frames, infra. If it touches Base, it belongs here.
            </p>

            <div className="flex gap-1.5 text-[11px] mb-2">
              <select
                value={newCaseCategory}
                onChange={(e) => setNewCaseCategory(e.target.value as SupCastCategory)}
                className="flex-1 px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827] text-gray-200"
              >
                <option value="tokens">Tokens / markets</option>
                <option value="packs">Packs / odds</option>
                <option value="infra">Infra / gas</option>
                <option value="frames">Frames / miniapps</option>
                <option value="ux">UX / flows</option>
              </select>
              <span className="px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827] text-[10px] text-gray-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[#00FFC0]" />
                Base-wide
              </span>
            </div>

            <input
              type="text"
              placeholder="Short title: e.g. bridge stuck mainnet → Base"
              value={newCaseTitle}
              onChange={(e) => setNewCaseTitle(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827] text-xs text-gray-200 mb-2"
            />
            <textarea
              placeholder="Describe what happened, tools you used (Zora, Vibe, Base app, frame, etc.)"
              value={newCaseDesc}
              onChange={(e) => setNewCaseDesc(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827] text-xs text-gray-200 h-20 resize-none mb-2"
            />
            <button
              onClick={handlePostCase}
              disabled={!newCaseTitle || !newCaseDesc || isPostingCase}
              className={`w-full py-2 rounded-lg text-[11px] font-semibold border ${
                !newCaseTitle || !newCaseDesc || isPostingCase
                  ? 'bg-gray-900 text-gray-500 border-gray-700 cursor-not-allowed'
                  : 'bg-red-600/40 text-red-200 border-red-600 hover:bg-red-600/60'
              }`}
            >
              {isPostingCase ? 'Posting…' : 'Post to SupCast mesh'}
            </button>
          </HoloCard>

          <HoloCard>
            <h3 className={`${accentBlue} text-xs font-semibold mb-1`}>AI mesh helper (mock)</h3>
            <p className="text-[11px] text-gray-400 mb-2">
              Takes the latest Base problem and turns it into a visual or UX concept for MidJourney, Sora, Figma or
              quests.
            </p>
            <button
              onClick={handleGenerateSuggestion}
              className="w-full px-3 py-2 rounded-xl text-[11px] font-semibold bg-pink-600/40 text-pink-100 border border-pink-600 hover:bg-pink-600/60"
            >
              Generate concept from latest SupCast
            </button>
            {aiSuggestion && (
              <div className="bg-[#020617] border border-pink-600/70 rounded-xl px-2.5 py-2 mt-2">
                <p className="text-[11px] text-gray-300 mb-1">Concept:</p>
                <p className="text-[11px] font-mono text-pink-300 break-words">{aiSuggestion}</p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Copy into your prompt flow. XP + trophies later for shipped designs.
                </p>
              </div>
            )}
          </HoloCard>
        </div>

        {/* row 2: live questions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className={`${accentBlue} text-xs font-semibold`}>Live Base questions ({supCastFeed.length})</h3>
            <span className="text-[10px] text-gray-500">Sorted by latest</span>
          </div>
          {supCastFeed.length === 0 ? (
            <div className="px-3 py-3 bg-[#020617] rounded-2xl border border-[#111827] text-center text-[11px] text-gray-500">
              No open cases yet. First wave of Base questions will show up here.
            </div>
          ) : (
            <div className="space-y-1.5">
              {supCastFeed.map((item) => (
                <div
                  key={item.id}
                  className="px-3 py-2.5 bg-[#020617] rounded-2xl border border-[#111827] flex justify-between items-start"
                >
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[10px] font-mono text-gray-500">
                        {item.posterHandle} ({item.posterId.slice(0, 4)}…)
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#020617] border border-[#1f2937] text-gray-300">
                        {categoryLabel(item.category)}
                      </span>
                    </div>
                    <p className="text-[12px] font-semibold text-white mt-0.5">{item.title}</p>
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      item.status === 'Open'
                        ? 'bg-red-600/25 text-red-300 border-red-600'
                        : item.status === 'Claimed'
                        ? 'bg-blue-600/25 text-blue-300 border-blue-600'
                        : 'bg-[#00FFC0]/15 text-[#00FFC0] border-[#00FFC0]'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* row 3 */}
        <div className="grid sm:grid-cols-2 gap-3">
          <HoloCard>
            <h3 className={`${accentBlue} text-xs font-semibold mb-1`}>Base mesh chat (local mock)</h3>
            <div className="flex flex-col h-40 text-[11px]">
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {chatMessages.map((m) => (
                  <div key={m.id} className={`flex ${m.kind === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-[11px] shadow ${
                        m.kind === 'user'
                          ? 'bg-[#00FFC0]/20 text-white'
                          : 'bg-[#020617] text-gray-100 border border-[#111827]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[9px] font-mono opacity-80">{m.user}</span>
                        <span className="text-[9px] opacity-60">{m.ts}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center mt-1">
                <input
                  type="text"
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  placeholder="Quick Base question / comment..."
                  className="flex-grow px-2.5 py-1.5 rounded-l-lg bg-[#020617] border border-[#111827] text-[11px] text-gray-200"
                />
                <button
                  onClick={handleSendChat}
                  disabled={!newChatMessage.trim()}
                  className="px-2.5 py-1.5 rounded-r-lg text-[11px] font-semibold bg-[#00FFC0]/20 text-[#00FFC0] border border-[#00FFC0] hover:bg-[#00FFC0]/40 disabled:opacity-40"
                >
                  Send
                </button>
              </div>
              <p className="text-[9px] text-gray-500 mt-1">
                Local demo room. Later wired to shared Firestore / Neynar / onchain chat.
              </p>
            </div>
          </HoloCard>

          <HoloCard>
            <h3 className={`${neon} text-xs font-semibold mb-1`}>Your SupCast profile</h3>
            <div className="flex justify-around text-center mt-1">
              <div>
                <p className={`${neon} text-xl font-extrabold`}>{userProfile.xp}</p>
                <p className="text-[10px] text-gray-400">Support XP</p>
              </div>
              <div>
                <p className={`${accentBlue} text-xl font-extrabold`}>{userProfile.solved}</p>
                <p className="text-[10px] text-gray-400">Solved</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-yellow-300">{userProfile.rating}</p>
                <p className="text-[10px] text-gray-400">Rating</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">
              Later this ties into real XP payouts, bounties and Base-wide reputation + spawn token flow.
            </p>
          </HoloCard>
        </div>
      </div>
    );
  };

  const LeaderboardTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-300" />
          Leaderboards
        </h2>
        <div className="flex items-center gap-1.5 text-[11px]">
          <button
            onClick={() => setLeaderFilter('xp')}
            className={`px-2 py-1 rounded-lg border text-xs ${
              leaderFilter === 'xp'
                ? 'bg-[#0f172a] text-[#00FFC0] border-[#00FFC0]'
                : 'bg-[#020617] text-gray-400 border-[#111827]'
            }`}
          >
            XP
          </button>
          <button
            onClick={() => setLeaderFilter('packs')}
            className={`px-2 py-1 rounded-lg border text-xs ${
              leaderFilter === 'packs'
                ? 'bg-[#0f172a] text-[#7dd3fc] border-[#7dd3fc]'
                : 'bg-[#020617] text-gray-400 border-[#111827]'
            }`}
          >
            Packs
          </button>
          <button
            onClick={() => setLeaderFilter('trader')}
            className={`px-2 py-1 rounded-lg border text-xs ${
              leaderFilter === 'trader'
                ? 'bg-[#0f172a] text-[#a855f7] border-[#a855f7]'
                : 'bg-[#020617] text-gray-400 border-[#111827]'
            }`}
          >
            Traders
          </button>
        </div>
      </div>

      <HoloCard>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-300 font-semibold">Top mesh players (mock)</p>
          <p className="text-[10px] text-gray-500">SpawnEngine-only · cross-app later</p>
        </div>
        <div className="space-y-1.5 text-[11px]">
          {filteredLeaders.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827]"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-6">#{l.rank}</span>
                <p className="text-gray-200">{l.handle}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-yellow-300" />
                  {l.trophies}
                </span>
                <span className={neon}>{l.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </HoloCard>
    </div>
  );

  const ProfileTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-[#7dd3fc]" />
          Profile · Tiny Legends & mesh identity
        </h2>
        <p className="text-[11px] text-gray-500">Later synced with Farcaster / Zora profile</p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <HoloCard className="md:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FFC0] via-[#22d3ee] to-[#a855f7] flex items-center justify-center text-xs font-bold text-black">
              SP
            </div>
            <div>
              <p className="text-sm text-white font-semibold">@spawniz</p>
              <p className="text-[11px] text-gray-400">Base · Tiny Legends · SpawnEngine</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-2 text-[11px]">
            <div className="px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827]">
              <p className="text-gray-400 mb-0.5">Mesh level</p>
              <p className={`${neon} text-sm font-semibold`}>L{level}</p>
            </div>
            <div className="px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827]">
              <p className="text-gray-400 mb-0.5">XP</p>
              <p className="text-sm text-white font-semibold">{xp}</p>
            </div>
            <div className="px-2 py-1.5 rounded-lg bg-[#020617] border border-[#111827]">
              <p className="text-gray-400 mb-0.5">Tiny achievements</p>
              <p className="text-sm text-white font-semibold">Coming UI</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            This page will later show exact Tiny Legends sets, foil pulls, mythics and card stats for your wallet.
          </p>
        </HoloCard>

        <HoloCard>
          <p className="text-xs text-gray-300 font-semibold mb-1">Gamification summary</p>
          <ul className="text-[11px] text-gray-400 space-y-1 list-disc ml-4">
            <li>XP from: quests, packs, SupCast, jackpots, trading.</li>
            <li>Trophies from key moments (first mythic, jackpot, big quests).</li>
            <li>Rep from SupCast support & clean trading.</li>
          </ul>
        </HoloCard>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-gray-100">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
        {/* header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#00FFC0] via-[#22d3ee] to-[#a855f7] flex items-center justify-center text-xs font-bold text-black shadow-lg">
              SE
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">SpawnEngine</p>
              <p className="text-sm text-white font-semibold">
                Home for everything onchain · Base creator OS
              </p>
            </div>
          </div>

          {/* right side + settings dropdown */}
          <div className="flex items-center gap-2 text-xs relative">
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#020617] border border-[#1b1f2b]">
              <Wallet className="w-3.5 h-3.5 text-[#00FFC0]" />
              <span className="text-gray-300">Wallet: not connected (UI only)</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#020617] border border-[#1b1f2b]">
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              <span className="text-gray-300">Streak {streakDays}d</span>
            </div>

            {/* settings button */}
            <button
              type="button"
              onClick={() => setShowSettings((prev) => !prev)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#020617] border border-[#1b1f2b] text-gray-300 hover:border-[#4b5563] hover:bg-[#020617]/80"
            >
              <Settings className="w-3.5 h-3.5 text-[#7dd3fc]" />
              <span>Settings</span>
            </button>

            {/* dropdown landing links */}
            {showSettings && (
              <div className="absolute right-0 top-10 mt-1 w-64 sm:w-72 rounded-2xl bg-[#020617] border border-[#1b1f2b] shadow-[0_18px_40px_rgba(0,0,0,0.65)] z-30">
                <div className="px-3 py-2 border-b border-[#111827]">
                  <p className="text-[11px] text-gray-300 font-semibold">SpawnEngine OS</p>
                  <p className="text-[10px] text-gray-500">Landing links · mock only (for now)</p>
                </div>
                <div className="py-1">
                  {[
                    {
                      label: 'SupCast · Base help desk',
                      desc: 'Support hub & question feed',
                      tab: 'supcast' as MainTab,
                    },
                    {
                      label: 'Loot & Pull Lab · entropy UI',
                      desc: 'Pack-style spins, jackpots & odds',
                      tab: 'loot' as MainTab,
                    },
                    {
                      label: 'Market · tokens & packs index',
                      desc: 'Creator tokens, packs & LP overviews',
                      tab: 'market' as MainTab,
                    },
                    {
                      label: 'Mesh Explorer · bubble map',
                      desc: 'Wallet clusters & creator ecosystems',
                      tab: 'mesh' as MainTab,
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.tab);
                        setShowSettings(false);
                      }}
                      className="w-full text-left px-3 py-2 text-[11px] hover:bg-[#020617]/80 flex flex-col"
                    >
                      <span className="text-gray-100">{item.label}</span>
                      <span className="text-[10px] text-gray-500">{item.desc}</span>
                    </button>
                  ))}
                </div>
                <div className="px-3 py-2 border-t border-[#111827]">
                  <p className="text-[10px] text-gray-500">
                    Later: docs, API keys, miniapp embed code, onchain modules.
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* nav */}
        <nav className="flex flex-wrap gap-1.5 mb-4">
          <TabButton id="home" icon={<Home className="w-4 h-4" />} label="Home" />
          <TabButton id="loot" icon={<Sword className="w-4 h-4" />} label="Loot" />
          <TabButton id="market" icon={<Box className="w-4 h-4" />} label="Market" />
          <TabButton id="trading" icon={<Shuffle className="w-4 h-4" />} label="Trading" />
          <TabButton id="quests" icon={<Sparkles className="w-4 h-4" />} label="Quests" />
          <TabButton id="mesh" icon={<Network className="w-4 h-4" />} label="Mesh" />
          <TabButton id="supcast" icon={<MessageCircle className="w-4 h-4" />} label="SupCast" />
          <TabButton id="leaderboard" icon={<Trophy className="w-4 h-4" />} label="Leaders" />
          <TabButton id="profile" icon={<User className="w-4 h-4" />} label="Profile" />
        </nav>

        {/* content */}
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
        </main>

        {/* bottom-sheet Settings & API (Pillars) */}
        {isSettingsOpen && (
          <div
            className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSettingsOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-t-3xl bg-[#020617] border-t border-[#1b1f2b] p-4 pb-6 shadow-[0_-24px_80px_rgba(0,0,0,0.95)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* drag handle */}
              <div className="flex justify-center mb-3">
                <div className="w-12 h-1.5 rounded-full bg-gray-700" />
              </div>

              {/* header rad med avatar + stäng */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                    S
                  </div>
                <div>
                    <p className="text-sm text-white font-semibold">@spawniz</p>
                    <p className="text-[11px] text-gray-400">Mesh ID · Creator</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#020617] border border-[#1f2937] hover:border-red-500 transition"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <h2 className="text-[#00FFC0] text-sm font-semibold mb-2">Settings & API</h2>

              <div className="space-y-3 text-[11px]">
                {/* Pillar 1 */}
                <div className="rounded-2xl bg-[#020617] border border-[#1b1f2b] px-3 py-3">
                  <p className="text-[#38bdf8] text-xs font-semibold mb-0.5">
                    XP SDK & Integration (Pillar 1)
                  </p>
                  <p className="text-gray-400 mb-2">
                    Manage API keys to integrate SpawnEngine XP into your own apps.
                  </p>
                  <button
                    onClick={() => setShowApiKey((v) => !v)}
                    className="w-full mt-1 py-2 rounded-xl bg-emerald-600 text-[11px] font-semibold text-white hover:bg-emerald-500"
                  >
                    {showApiKey ? 'Hide API Key' : 'Show API Key'}
                  </button>
                  {showApiKey && (
                    <p className="mt-2 px-2 py-1.5 rounded-lg bg-black/50 border border-emerald-700 font-mono text-[10px] text-emerald-300 break-all">
                      spn_test_0xDEADBEEF_MESH_XP_KEY
                    </p>
                  )}
                </div>

                {/* Pillar 4 */}
                <div className="rounded-2xl bg-[#020617] border border-[#1b1f2b] px-3 py-3">
                  <p className="text-[#38bdf8] text-xs font-semibold mb-0.5">
                    Premium Mesh Filters (Pillar 4)
                  </p>
                  <p className="text-gray-400 mb-2">
                    Unlock Alpha Hunters and Whale Tracking. Requires 500 SPN staking.
                  </p>
                  <button className="w-full py-2 rounded-xl bg-slate-800 text-[11px] font-semibold text-gray-300 border border-slate-600">
                    Upgrade to Premium
                  </button>
                </div>

                {/* Pillar 8 */}
                <div className="rounded-2xl bg-[#020617] border border-[#1b1f2b] px-3 py-3">
                  <p className="text-[#38bdf8] text-xs font-semibold mb-0.5">
                    Launchpad Builder (Pillar 8)
                  </p>
                  <p className="text-gray-400 mb-2">
                    Access the Zero-Code Token/NFT Builder and Bonding Curve configuration.
                  </p>
                  <button className="w-full py-2 rounded-xl bg-indigo-600 text-[11px] font-semibold text-white hover:bg-indigo-500">
                    Open Creator Panel
                  </button>
                </div>

                {/* Notifications */}
                <button className="w-full mt-1 py-2.5 rounded-xl bg-slate-900 border border-[#1f2937] text-[11px] font-semibold text-gray-200">
                  Manage Notifications
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;