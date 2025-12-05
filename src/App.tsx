import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Home,
  Box,
  Sword,
  Hexagon,
  Zap,
  Settings,
  Flame,
  TrendingUp,
  Star,
  Gift,
  User,
  LogOut,
  ShieldCheck,
  Globe,
  DollarSign,
  Activity,
  MapPin,
  MessageSquare,
} from 'lucide-react';

const App = () => {
  // --- BASIC STATE ---
  const [currentTab, setCurrentTab] = useState('home');
  const [activeSheet, setActiveSheet] = useState(null); // 'account' | 'settings' | null
  const [toast, setToast] = useState(null);

  // Profile & inventory
  const [profileData, setProfileData] = useState({
    xpBalance: 2500,
    spawnTokenBalance: 42.5,
    streakDays: 3,
    lastCheckIn: null, // Date | null
  });

  const [inventory, setInventory] = useState([
    {
      id: 'startermeshpack',
      type: 'Starter Mesh Pack',
      count: 3,
    },
    {
      id: 'fragment',
      type: 'Fragment',
      count: 5,
    },
    {
      id: 'shard',
      type: 'Shard',
      count: 1,
    },
    {
      id: 'relic',
      type: 'Relic',
      count: 0,
    },
  ]);

  const [supCastFeed, setSupCastFeed] = useState([]);
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [isPostingCase, setIsPostingCase] = useState(false);

  // Simulated user id just for display
  const [userId] = useState('spawn-mesh-1234-abcdef');

  // Colors / UI tokens
  const neon = 'text-[#00FFC0]';
  const neonBg = 'bg-[#00FFC0]';
  const accentBlue = 'text-[#22A8FF]';
  const darkBg = 'bg-[#050509]';
  const cardBg = 'bg-[#101019]';
  const borderColor = 'border-[#262636]';

  // --- LOCALSTORAGE PERSISTENCE (simple) ---

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('spawnengine_mesh_profile');
      if (raw) {
        const parsed = JSON.parse(raw);
        setProfileData({
          ...parsed,
          lastCheckIn: parsed.lastCheckIn ? new Date(parsed.lastCheckIn) : null,
        });
      }
      const invRaw = window.localStorage.getItem('spawnengine_mesh_inventory');
      if (invRaw) {
        setInventory(JSON.parse(invRaw));
      }
      const supRaw = window.localStorage.getItem('spawnengine_mesh_supcast');
      if (supRaw) {
        setSupCastFeed(JSON.parse(supRaw));
      }
    } catch (e) {
      console.error('Failed to load local state', e);
    }
  }, []);

  useEffect(() => {
    try {
      const { lastCheckIn, ...rest } = profileData;
      window.localStorage.setItem(
        'spawnengine_mesh_profile',
        JSON.stringify({
          ...rest,
          lastCheckIn: lastCheckIn ? lastCheckIn.toISOString() : null,
        }),
      );
    } catch {}
  }, [profileData]);

  useEffect(() => {
    try {
      window.localStorage.setItem('spawnengine_mesh_inventory', JSON.stringify(inventory));
    } catch {}
  }, [inventory]);

  useEffect(() => {
    try {
      window.localStorage.setItem('spawnengine_mesh_supcast', JSON.stringify(supCastFeed));
    } catch {}
  }, [supCastFeed]);

  // --- TOAST ---

  const showToast = useCallback((message, type = 'info') => {
    let color = 'bg-[#00FFC0]/90';
    if (type === 'error') color = 'bg-red-600/90';
    if (type === 'success') color = 'bg-[#00FFC0]/90';
    if (type === 'info') color = 'bg-[#22A8FF]/90';

    setToast({ message, color });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const ToastComponent = () =>
    toast && (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs transition-all duration-300 text-xs">
        <div
          className={`px-3 py-2 rounded-xl shadow-2xl font-semibold text-gray-900 backdrop-blur-sm ${toast.color}`}
        >
          {toast.message}
        </div>
      </div>
    );

  // --- CHECK-IN / STREAK LOGIC ---

  const streakReady = useMemo(() => {
    if (!profileData.lastCheckIn) return true;
    const delta = Date.now() - profileData.lastCheckIn.getTime();
    return delta >= 24 * 60 * 60 * 1000;
  }, [profileData.lastCheckIn]);

  const streakHoursLeft = useMemo(() => {
    if (!profileData.lastCheckIn) return 0;
    const next = profileData.lastCheckIn.getTime() + 24 * 60 * 60 * 1000;
    const remaining = next - Date.now();
    if (remaining <= 0) return 0;
    return 24 - remaining / (1000 * 60 * 60);
  }, [profileData.lastCheckIn]);

  const formatTimeRemaining = (lastCheckIn) => {
    if (!lastCheckIn) return 'Ready now';
    const next = lastCheckIn.getTime() + 24 * 60 * 60 * 1000;
    const remaining = next - Date.now();
    if (remaining <= 0) return 'Ready now';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleCheckIn = useCallback(() => {
    const now = new Date();
    if (!streakReady) {
      const text = formatTimeRemaining(profileData.lastCheckIn);
      showToast(`Next check-in in ${text}`, 'info');
      return;
    }

    setProfileData((prev) => {
      const prevLast = prev.lastCheckIn;
      let newStreak = prev.streakDays || 0;

      if (!prevLast) {
        newStreak = 1;
      } else {
        const delta = now.getTime() - prevLast.getTime();
        const within48h = delta < 48 * 60 * 60 * 1000;
        if (within48h) {
          newStreak += 1;
        } else {
          newStreak = 1;
          showToast('Streak lost, reset to Day 1.', 'error');
        }
      }

      const reward = 50 + newStreak * 5;
      showToast(`Day ${newStreak} check-in: +${reward} XP`, 'success');

      return {
        ...prev,
        streakDays: newStreak,
        xpBalance: prev.xpBalance + reward,
        lastCheckIn: now,
      };
    });
  }, [profileData.lastCheckIn, streakReady, showToast]);

  // --- PACK OPEN / SYNTHESIS ---

  const getItemCount = useCallback(
    (id) => {
      const item = inventory.find((i) => i.id === id);
      return item ? item.count : 0;
    },
    [inventory],
  );

  const setItemCount = useCallback(
    (id, typeLabel, newCount) => {
      setInventory((prev) => {
        const existing = prev.find((i) => i.id === id);
        if (!existing) {
          return [...prev, { id, type: typeLabel, count: newCount }];
        }
        return prev.map((i) => (i.id === id ? { ...i, count: newCount } : i));
      });
    },
    [],
  );

  const handlePackOpen = useCallback(
    (packId) => {
      const pack = inventory.find((i) => i.id === packId);
      if (!pack || pack.count <= 0) {
        showToast('No packs available.', 'error');
        return;
      }

      const dropType = Math.random();
      let itemId = 'fragment';
      let itemType = 'Fragment';
      let itemAmount = 1;
      let xpReward = 25;
      let rewardText = '';

      if (dropType < 0.05) {
        itemId = 'relic';
        itemType = 'Relic';
        itemAmount = 1;
        xpReward = 500;
        rewardText = 'MYTHIC DROP! +1 Relic & 500 XP.';
      } else if (dropType < 0.25) {
        itemId = 'shard';
        itemType = 'Shard';
        itemAmount = 1;
        xpReward = 120;
        rewardText = '+1 Shard & 120 XP.';
      } else {
        itemId = 'fragment';
        itemType = 'Fragment';
        itemAmount = Math.floor(Math.random() * 3) + 1;
        xpReward = 30;
        rewardText = `+${itemAmount} Fragments & 30 XP.`;
      }

      setInventory((prev) =>
        prev.map((i) => (i.id === packId ? { ...i, count: i.count - 1 } : i)),
      );

      setItemCount(itemId, itemType, getItemCount(itemId) + itemAmount);
      setProfileData((prev) => ({ ...prev, xpBalance: prev.xpBalance + xpReward }));
      showToast(rewardText, 'success');
    },
    [inventory, getItemCount, setItemCount, showToast],
  );

  const handleSynthesis = useCallback(() => {
    const fragments = getItemCount('fragment');
    if (fragments < 3) {
      showToast('Need 3 Fragments.', 'error');
      return;
    }
    setItemCount('fragment', 'Fragment', fragments - 3);
    const shards = getItemCount('shard');
    setItemCount('shard', 'Shard', shards + 1);
    showToast('Synthesis: 3 Fragments → 1 Shard.', 'success');
  }, [getItemCount, setItemCount, showToast]);

  // --- SUPCAST POST ---

  const handlePostCase = useCallback(() => {
    if (!newCaseTitle || !newCaseDesc) {
      showToast('Title and description required.', 'error');
      return;
    }
    setIsPostingCase(true);
    setTimeout(() => {
      const newCase = {
        id: Date.now().toString(),
        title: newCaseTitle,
        description: newCaseDesc,
        status: 'Open',
        posterHandle: '@spawniz',
        posterId: userId,
        timestamp: new Date().toISOString(),
      };
      setSupCastFeed((prev) => [newCase, ...prev]);
      setNewCaseTitle('');
      setNewCaseDesc('');
      setIsPostingCase(false);
      showToast('Posted to SupCast mesh.', 'success');
    }, 400);
  }, [newCaseTitle, newCaseDesc, userId, showToast]);

  // --- NAV & SHEETS ---

  const NavItem = ({ icon: Icon, tabName, label }) => (
    <button
      onClick={() => setCurrentTab(tabName)}
      className={`flex flex-col items-center px-2 py-1.5 rounded-lg transition duration-150 ${
        currentTab === tabName ? `${neon}` : 'text-slate-500 hover:text-slate-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] mt-0.5">{label}</span>
    </button>
  );

  const Sheet = ({ id, title, children }) => (
    <div
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[88vh] ${darkBg} rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out z-50 overflow-y-auto px-3 pt-2 pb-4 ${
        activeSheet === id ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="w-full flex justify-center py-1 cursor-pointer" onClick={() => setActiveSheet(null)}>
        <div className="h-1 w-10 bg-slate-600 rounded-full" />
      </div>
      <div className="pt-2">
        <h2 className={`text-lg font-bold mb-3 ${neon}`}>{title}</h2>
        {children}
      </div>
    </div>
  );

  const SheetAccount = () => (
    <Sheet id="account" title="Account & Rewards">
      <div className={`${cardBg} ${borderColor} border p-3 rounded-xl flex items-center space-x-3 mb-4`}>
        <User className={`w-7 h-7 ${neon}`} />
        <div className="text-xs">
          <p className="font-semibold text-slate-50">@spawniz</p>
          <p className="text-slate-400">
            Mesh ID: {userId ? `${userId.slice(0, 6)}...${userId.slice(-4)}` : 'Loading...'}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Full ID: <span className="font-mono">{userId}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div className={`${cardBg} ${borderColor} border p-3 rounded-xl`}>
          <p className="text-[11px] text-slate-400">Total XP</p>
          <p className={`text-xl font-bold ${neon}`}>{profileData.xpBalance.toLocaleString()}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border p-3 rounded-xl`}>
          <p className="text-[11px] text-slate-400">SPN Balance</p>
          <p className={`text-xl font-bold ${accentBlue}`}>{profileData.spawnTokenBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className={`${cardBg} ${borderColor} border p-3 rounded-xl space-y-2 text-xs`}>
        <h3 className={`${accentBlue} font-semibold text-sm`}>Referral Mesh</h3>
        <p className="text-slate-400 text-[11px]">
          Share your referral key to earn XP and mesh rewards across Base.
        </p>
        <div className="flex justify-between items-center bg-slate-900 px-2 py-2 rounded-lg border border-slate-700">
          <span className={`font-mono ${neon} text-[11px]`}>SPAWN-MESH-74F</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText('SPAWN-MESH-74F');
              showToast('Referral code copied.', 'success');
            }}
            className={`text-[10px] px-2 py-1 rounded-full font-semibold ${neonBg}/20 ${neon} border border-[#00FFC0]/60`}
          >
            Copy
          </button>
        </div>
      </div>

      <button className="w-full mt-5 py-2.5 bg-red-700/60 rounded-xl font-semibold border border-red-800 text-xs text-slate-50 flex items-center justify-center hover:bg-red-700/80">
        <LogOut className="w-4 h-4 mr-1" /> Switch wallet / Logout
      </button>
    </Sheet>
  );

  const SheetSettings = () => (
    <Sheet id="settings" title="Settings & Mesh API">
      <div className="space-y-3 text-xs">
        <div className={`${cardBg} ${borderColor} border p-3 rounded-xl space-y-1.5`}>
          <h3 className={`${accentBlue} font-semibold text-sm`}>XP SDK & Integration</h3>
          <p className="text-slate-400 text-[11px]">
            Connect SpawnEngine XP to your own Base apps, frames, or bots.
          </p>
          <button className={`w-full py-2 ${neonBg}/20 rounded-xl font-semibold ${neon} border border-[#00FFC0]/60`}>
            Show API key
          </button>
        </div>

        <div className={`${cardBg} ${borderColor} border p-3 rounded-xl space-y-1.5`}>
          <h3 className={`${accentBlue} font-semibold text-sm`}>Premium Mesh Filters</h3>
          <p className="text-slate-400 text-[11px]">
            Alpha wallets, creator clusters, and whale tracking. Requires SPN staking.
          </p>
          <button className="w-full py-2 bg-slate-800 rounded-xl font-semibold text-slate-400 border border-slate-700 cursor-not-allowed">
            Upgrade (soon)
          </button>
        </div>

        <div className={`${cardBg} ${borderColor} border p-3 rounded-xl space-y-1.5`}>
          <h3 className={`${accentBlue} font-semibold text-sm`}>Launchpad Builder</h3>
          <p className="text-slate-400 text-[11px]">
            Future zero-code deploy for tokens, packs, quests and automations.
          </p>
          <button className="w-full py-2 bg-blue-600/20 rounded-xl font-semibold text-[#22A8FF] border border-blue-600/60">
            Open Creator Panel
          </button>
        </div>

        <button className="w-full py-2.5 mt-3 bg-slate-900 rounded-xl font-semibold border border-slate-700 text-slate-300">
          Manage notifications
        </button>
      </div>
    </Sheet>
  );

  // --- TABS ---

  const HomeTab = () => {
    const timeRemainingText = formatTimeRemaining(profileData.lastCheckIn);
    const progressPercent = Math.min(100, (streakHoursLeft / 24) * 100);

    const oracleFeed = [
      {
        type: 'alpha',
        message: "Whale 0xab...c78 opened 3 creator packs in a row. Mesh entropy spike.",
        icon: <ShieldCheck className="w-3.5 h-3.5 text-[#00FFC0]" />,
      },
      {
        type: 'gravity',
        message: 'Creator cluster “Y” has +220% XP flow in the last 24h on Base.',
        icon: <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />,
      },
      {
        type: 'burn',
        message: 'High-volume wallet 0xde...f12 burned 40% of a meme-token supply.',
        icon: <Flame className="w-3.5 h-3.5 text-red-500" />,
      },
      {
        type: 'quest',
        message: 'IRL Quest: Base builders meetup – bonus streak XP if checked in.',
        icon: <MapPin className="w-3.5 h-3.5 text-blue-400" />,
      },
    ];

    return (
      <div className="space-y-4">
        {/* XP / SPN */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div
            className={`${cardBg} ${borderColor} border px-3 py-3 rounded-xl text-center shadow-sm hover:scale-[1.01] transition-transform`}
          >
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">XP</p>
            <p className={`text-3xl font-extrabold mt-1 ${neon}`}>{profileData.xpBalance.toLocaleString()}</p>
          </div>
          <div
            className={`${cardBg} ${borderColor} border px-3 py-3 rounded-xl text-center shadow-sm hover:scale-[1.01] transition-transform`}
          >
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">SPN</p>
            <p className={`text-3xl font-extrabold mt-1 ${accentBlue}`}>
              {profileData.spawnTokenBalance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className={`${cardBg} ${borderColor} border px-3 py-3 rounded-xl space-y-2 text-xs`}>
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-50">Daily streak · {profileData.streakDays} days</h3>
            <button
              onClick={handleCheckIn}
              disabled={!streakReady}
              className={`px-3 py-1.5 rounded-full font-semibold text-[11px] border ${
                streakReady
                  ? `${neonBg}/20 ${neon} border-[#00FFC0]`
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
              }`}
            >
              {streakReady ? 'Check in' : 'Pending'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Next check-in in: <span className="font-mono text-slate-100">{timeRemainingText}</span>
          </p>
          <div className="w-full bg-slate-900 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${neonBg} transition-all duration-700`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <button className="w-full text-[10px] text-left text-red-400/80 hover:text-red-300 pt-0.5">
            <ShieldCheck className="w-3 h-3 inline-block mr-1" />
            Activate streak insurance (soon)
          </button>
        </div>

        {/* Oracle feed */}
        <div className="space-y-2 text-xs">
          <h3 className={`text-sm font-bold ${accentBlue}`}>Mesh signals</h3>
          <div className="space-y-1.5">
            {oracleFeed.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2.5 px-3 py-2 bg-slate-900 rounded-xl border border-slate-800"
              >
                <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                <span className="text-[11px] text-slate-200">{item.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const LootTab = () => {
    const starterPack =
      inventory.find((i) => i.id === 'startermeshpack') || {
        id: 'startermeshpack',
        type: 'Starter Mesh Pack',
        count: 0,
      };
    const fragments = getItemCount('fragment');
    const shards = getItemCount('shard');
    const relics = getItemCount('relic');

    return (
      <div className="space-y-4 text-xs">
        <div className="flex justify-between bg-slate-900 px-1.5 py-1 rounded-xl border border-slate-800">
          <button className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800 text-slate-100">
            Packs
          </button>
          <button className="flex-1 py-1.5 rounded-lg text-[11px] text-slate-400 hover:bg-slate-800">
            Pull Lab
          </button>
          <button className="flex-1 py-1.5 rounded-lg text-[11px] text-slate-400 hover:bg-slate-800">
            Inventory
          </button>
        </div>

        {/* Pack */}
        <div className={`${cardBg} ${borderColor} border px-3 py-3 rounded-xl space-y-2`}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-slate-50">Starter Mesh Pack</h3>
              <p className="text-[11px] text-slate-400">
                Base pack with guaranteed Fragments and a chance for Shards / Relics.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
              ID: S001
            </span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-800 mt-1">
            <span className={`text-2xl font-extrabold ${neon}`}>{starterPack.count}x</span>
            <button
              onClick={() => handlePackOpen(starterPack.id)}
              disabled={starterPack.count <= 0}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] border ${
                starterPack.count > 0
                  ? `${neonBg}/20 ${neon} border-[#00FFC0]`
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
              }`}
            >
              Open pack
            </button>
          </div>
        </div>

        {/* Pull Lab */}
        <div className={`${cardBg} ${borderColor} border px-3 py-3 rounded-xl space-y-3`}>
          <h3 className={`text-sm font-bold ${accentBlue}`}>Pull Lab · Synthesis</h3>
          <p className="text-[11px] text-slate-400">
            Test your luck. Convert low-tier fragments into higher-tier items.
          </p>

          <div className="grid grid-cols-3 text-center text-xs border-t border-slate-800 pt-2">
            <div className="p-2 border-r border-slate-800">
              <p className="text-2xl font-bold text-slate-50">{fragments}</p>
              <p className="text-[10px] text-slate-400">Fragments</p>
            </div>
            <div className="p-2 border-r border-slate-800">
              <p className="text-2xl font-bold text-[#22A8FF]">{shards}</p>
              <p className="text-[10px] text-slate-400">Shards</p>
            </div>
            <div className="p-2">
              <p className="text-2xl font-bold text-red-400">{relics}</p>
              <p className="text-[10px] text-slate-400">Relics</p>
            </div>
          </div>

          <button
            onClick={handleSynthesis}
            disabled={fragments < 3}
            className={`w-full px-3 py-2 rounded-lg font-semibold text-[11px] border ${
              fragments >= 3
                ? 'bg-blue-600/20 text-[#22A8FF] border-blue-600 hover:bg-blue-600/40'
                : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
            }`}
          >
            Run synthesis · 3 Fragments → 1 Shard
          </button>
        </div>
      </div>
    );
  };

  const QuestsTab = () => {
    const quests = [
      { type: 'Daily', title: 'Daily check-in', reward: 10, status: 'Completed' },
      { type: 'Daily', title: 'Open 1 pack', reward: 25, status: 'Claimable' },
      { type: 'Weekly', title: '5 day streak', reward: 150, status: 'Locked' },
      { type: 'Weekly', title: 'Solve 1 SupCast case', reward: 100, status: 'Claimable' },
      { type: 'IRL', title: 'Base meetup (Stockholm)', reward: 200, status: 'Locked' },
    ];

    const handleClaim = (title) => {
      showToast(`Reward for "${title}" claimed. XP added.`, 'success');
      // could update quest state if we track it
    };

    const getStatusStyle = (status) => {
      switch (status) {
        case 'Claimable':
          return 'bg-[#00FFC0]/20 text-[#00FFC0] border-[#00FFC0]';
        case 'Completed':
          return 'bg-green-600/30 text-green-300 border-green-600';
        case 'Locked':
        default:
          return 'bg-slate-800 text-slate-500 border-slate-700';
      }
    };

    return (
      <div className="space-y-4 text-xs">
        <h2 className={`text-sm font-extrabold ${neon}`}>Quests & routines</h2>

        <div className="space-y-2">
          <h3 className={`text-xs font-bold ${accentBlue}`}>Daily</h3>
          {quests
            .filter((q) => q.type === 'Daily')
            .map((q, idx) => (
              <div
                key={idx}
                className={`${cardBg} ${borderColor} border px-3 py-2.5 rounded-xl flex justify-between items-center`}
              >
                <div>
                  <p className="text-xs font-semibold text-slate-50">{q.title}</p>
                  <p className="text-[11px] text-slate-400 flex items-center mt-0.5">
                    <Star className="w-3 h-3 mr-1 text-yellow-400" />
                    {q.reward} XP
                  </p>
                </div>
                <button
                  onClick={() => q.status === 'Claimable' && handleClaim(q.title)}
                  disabled={q.status !== 'Claimable'}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getStatusStyle(
                    q.status,
                  )} ${q.status !== 'Claimable' && 'cursor-not-allowed'}`}
                >
                  {q.status}
                </button>
              </div>
            ))}
        </div>

        <div className="space-y-2">
          <h3 className={`text-xs font-bold ${accentBlue}`}>Weekly & IRL</h3>
          {quests
            .filter((q) => q.type !== 'Daily')
            .map((q, idx) => (
              <div
                key={idx}
                className={`${cardBg} ${borderColor} border px-3 py-2.5 rounded-xl flex justify-between items-center`}
              >
                <div>
                  <p className="text-xs font-semibold text-slate-50">{q.title}</p>
                  <p className="text-[11px] text-slate-400 flex items-center mt-0.5">
                    <Gift className="w-3 h-3 mr-1 text-pink-400" />
                    {q.reward} XP
                  </p>
                </div>
                <button
                  onClick={() => q.status === 'Claimable' && handleClaim(q.title)}
                  disabled={q.status !== 'Claimable'}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getStatusStyle(
                    q.status,
                  )} ${q.status !== 'Claimable' && 'cursor-not-allowed'}`}
                >
                  {q.status}
                </button>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const MeshTab = () => {
    const modes = [
      {
        id: 'alpha',
        name: 'Alpha wallets',
        desc: 'Wallets with heavy creator-pack and token activity on Base.',
        icon: ShieldCheck,
      },
      {
        id: 'new',
        name: 'New creators',
        desc: 'Fresh deploys: tokens, packs and quests entering the mesh.',
        icon: Zap,
      },
      {
        id: 'gravity',
        name: 'Gravity clusters',
        desc: 'Wallet clusters with the highest XP and liquidity flow.',
        icon: Globe,
      },
    ];

    const [activeMode, setActiveMode] = useState(modes[0]);

    const legendItems = [
      { color: neon, name: 'XP streams', icon: Activity },
      { color: accentBlue, name: 'Pack pulls', icon: Box },
      { color: 'text-red-500', name: 'Burn events', icon: Flame },
      { color: 'text-yellow-400', name: 'Creator flows', icon: DollarSign },
    ];

    return (
      <div className="space-y-4 text-xs">
        <h2 className={`text-sm font-extrabold ${neon}`}>Mesh explorer</h2>

        <div className="space-y-2">
          <h3 className={`text-xs font-bold ${accentBlue}`}>Modes</h3>
          <div className="grid grid-cols-3 gap-2">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode)}
                className={`p-2.5 rounded-xl border text-center text-[11px] shadow-sm ${
                  activeMode.id === mode.id
                    ? `border-[#00FFC0] ${neonBg}/10`
                    : `${borderColor} bg-slate-900 hover:border-slate-500`
                }`}
              >
                <mode.icon
                  className={`w-4 h-4 mx-auto mb-1 ${
                    activeMode.id === mode.id ? neon : 'text-slate-400'
                  }`}
                />
                <span className="font-semibold text-slate-50">{mode.name}</span>
              </button>
            ))}
          </div>
          <div className="text-[11px] text-slate-400 px-3 py-2 border-l-4 border-[#00FFC0]/60 bg-slate-900/70 rounded-r-xl">
            <span className="font-semibold text-slate-100 mr-1">{activeMode.name}:</span>
            {activeMode.desc}
          </div>
        </div>

        <div className={`${cardBg} ${borderColor} border px-3 py-3 rounded-xl space-y-2`}>
          <h3 className={`text-xs font-bold ${accentBlue}`}>Legend</h3>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {legendItems.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="text-slate-300">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-40 w-full bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-center text-[11px] text-slate-500 italic">
          3D mesh / Bubble map placeholder · “Nansen for creators” comes here
        </div>

        <button className="w-full py-2.5 bg-blue-600/20 rounded-xl font-semibold text-[11px] text-[#22A8FF] border border-blue-600 hover:bg-blue-600/40">
          Open full Mesh explorer (v2)
        </button>
      </div>
    );
  };

  const SupportTab = () => {
    const userProfile = { solved: 7, xp: 350, rating: 4.5 };

    return (
      <div className="space-y-4 text-xs">
        <h2 className={`text-sm font-extrabold ${neon}`}>SupCast · Support Mesh</h2>

        {/* Ask form */}
        <div className={`${cardBg} ${borderColor} border px-3 py-3 rounded-xl space-y-2`}>
          <h3 className={`text-xs font-bold ${accentBlue}`}>Post a question</h3>
          <input
            type="text"
            placeholder="Short title"
            value={newCaseTitle}
            onChange={(e) => setNewCaseTitle(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-900 rounded-lg border border-slate-700 text-[11px] text-slate-100 focus:outline-none focus:border-[#00FFC0]"
          />
          <textarea
            placeholder="Describe the issue (wallet, chain, error...)"
            value={newCaseDesc}
            onChange={(e) => setNewCaseDesc(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-900 rounded-lg border border-slate-700 text-[11px] text-slate-100 h-16 resize-none focus:outline-none focus:border-[#00FFC0]"
          />
          <button
            onClick={handlePostCase}
            disabled={!newCaseTitle || !newCaseDesc || isPostingCase}
            className={`w-full py-2.5 rounded-lg font-semibold text-[11px] border ${
              !newCaseTitle || !newCaseDesc || isPostingCase
                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                : 'bg-red-600/50 border-red-700 text-red-100 hover:bg-red-600/70'
            }`}
          >
            {isPostingCase ? 'Posting...' : 'Post to SupCast network'}
          </button>
        </div>

        {/* Feed */}
        <div className="space-y-2">
          <h3 className={`text-xs font-bold ${accentBlue}`}>Open cases ({supCastFeed.length})</h3>
          {supCastFeed.length === 0 ? (
            <div className="px-3 py-3 bg-slate-900/60 text-[11px] text-slate-500 rounded-xl border border-slate-800 text-center">
              No open cases yet. Be first.
            </div>
          ) : (
            supCastFeed.map((item) => (
              <div
                key={item.id}
                className="px-3 py-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-start"
              >
                <div className="pr-2">
                  <span className="text-[10px] font-mono text-slate-500">
                    {item.posterHandle} ({item.posterId.slice(0, 4)}…)
                  </span>
                  <p className="text-xs font-semibold text-slate-50 mt-0.5 line-clamp-1">{item.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{item.description}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-600/30 text-red-300 border border-red-600">
                    {item.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Profile */}
        <div className={`${cardBg} ${borderColor} border px-3 py-3 rounded-xl text-center space-y-1.5`}>
          <h3 className={`text-sm font-bold ${neon}`}>Your SupCast profile</h3>
          <div className="flex justify-around text-center mt-1 text-xs">
            <div>
              <p className={`${neon} text-xl font-extrabold`}>{userProfile.xp}</p>
              <p className="text-[10px] text-slate-400">Support XP</p>
            </div>
            <div>
              <p className={`${accentBlue} text-xl font-extrabold`}>{userProfile.solved}</p>
              <p className="text-[10px] text-slate-400">Solved</p>
            </div>
            <div>
              <p className="text-yellow-400 text-xl font-extrabold">{userProfile.rating}</p>
              <p className="text-[10px] text-slate-400">Rating</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MarketTab = () => {
    const trendingActivities = [
      {
        id: 1,
        title: 'NFT art auction',
        description: 'Curated tokenized art drop. Limited editions.',
        price: 1.2,
        participants: 45,
      },
      {
        id: 2,
        title: 'DeFi lending pool',
        description: 'Join a Base-native lending pool with live rewards.',
        price: 0.05,
        participants: 1200,
      },
      {
        id: 3,
        title: 'DAO vote · Proposal X',
        description: 'Governance proposal for a creator ecosystem.',
        price: 0,
        participants: 890,
      },
      {
        id: 4,
        title: 'Virtual conf ticket',
        description: 'Access to a web3 / Base dev conference.',
        price: 0.8,
        participants: 230,
      },
      {
        id: 5,
        title: 'GameFi quest · Lvl 7',
        description: 'Complete an onchain quest and claim rewards.',
        price: 0.01,
        participants: 512,
      },
    ];

    const allActivities = [
      {
        id: 6,
        title: 'Smart contract audits',
        description: 'Have your new contracts reviewed by pros.',
        price: 2.5,
        participants: 15,
      },
      {
        id: 7,
        title: 'Onchain education',
        description: 'Learn Solidity and Base dev step by step.',
        price: 0.3,
        participants: 98,
      },
      {
        id: 8,
        title: 'Token pre-launch',
        description: 'Early access to upcoming utility token.',
        price: 0.1,
        participants: 350,
      },
      {
        id: 9,
        title: 'Metaverse land deal',
        description: 'Buy virtual land plots in a shared world.',
        price: 3.5,
        participants: 12,
      },
      {
        id: 10,
        title: 'Hackathon reg',
        description: 'Register your team to a Base hackathon.',
        price: 0,
        participants: 75,
      },
      {
        id: 11,
        title: 'Gov. proposal',
        description: 'Discuss direction of a key protocol.',
        price: 0,
        participants: 110,
      },
      {
        id: 12,
        title: 'Decentralized storage',
        description: 'Buy storage on a distributed network.',
        price: 0.005,
        participants: 600,
      },
    ];

    const partners = [
      { name: 'DAO Builder Pro', icon: '🏛️', status: 'Aktiv' },
      { name: 'GameFi Studio X', icon: '🎮', status: 'Aktiv' },
      { name: 'Secure Audit Corp', icon: '🔒', status: 'Pending' },
      { name: 'Metaverse Land Agency', icon: '🌍', status: 'Utkast' },
    ];

    const getIcon = (id) => {
      const icons = ['🎨', '📈', '🗳️', '🎫', '⚔️', '📝', '🎓', '🚀', '🏡', '💻', '💡', '💾'];
      return icons[id % icons.length];
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'Aktiv':
          return 'bg-green-800 text-green-200';
        case 'Pending':
          return 'bg-yellow-800 text-yellow-200';
        case 'Utkast':
          return 'bg-slate-700 text-slate-200';
        default:
          return 'bg-slate-600 text-slate-100';
      }
    };

    return (
      <div className="space-y-4 text-xs">
        {/* Top filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Marketplace · Onchain actions</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <button className="px-2 py-1 bg-slate-800 rounded-full border border-slate-700 text-slate-200">
              All
            </button>
            <button className="px-2 py-1 bg-slate-900 rounded-full border border-slate-700 text-slate-400">
              Creator
            </button>
            <button className="px-2 py-1 bg-slate-900 rounded-full border border-slate-700 text-slate-400">
              DeFi
            </button>
            <button className="px-2 py-1 bg-slate-900 rounded-full border border-slate-700 text-slate-400">
              IRL
            </button>
          </div>
        </div>

        {/* Horizontal “rows” */}
        <section>
          <h2 className="text-xs font-semibold mb-1 text-slate-50">
            Trending on Base <span className="text-[#00FFC0]">right now</span>
          </h2>
          <div className="flex overflow-x-scroll space-x-3 pb-2 scrollbar-hide">
            {trendingActivities.map((activity) => (
              <div
                key={activity.id}
                className="w-64 flex-shrink-0 bg-slate-900 rounded-xl shadow-sm hover:shadow-lg transition duration-200 transform hover:scale-[1.01] border border-slate-800 cursor-pointer"
              >
                <div className="h-20 bg-slate-800/80 rounded-t-xl flex items-center justify-center">
                  <span className="text-2xl text-[#00FFC0]">{getIcon(activity.id)}</span>
                </div>
                <div className="p-2.5">
                  <h3 className="font-semibold text-[12px] truncate mb-0.5 text-slate-50">
                    {activity.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2 h-8 mb-1">
                    {activity.description}
                  </p>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-green-400 font-bold">{activity.price} ETH</span>
                    <span className="text-slate-400">{activity.participants} joined</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Grid */}
        <section>
          <h2 className="text-xs font-semibold mb-1 text-slate-50">All active actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {allActivities.map((activity) => (
              <div
                key={activity.id}
                className="bg-slate-900 rounded-lg shadow-sm p-3 transition duration-150 hover:bg-slate-800 border border-slate-800"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xl text-yellow-400">{getIcon(activity.id)}</span>
                  <h3 className="text-[12px] font-semibold truncate text-slate-50">
                    {activity.title}
                  </h3>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 h-7 mb-1">
                  {activity.description}
                </p>
                <div className="flex justify-between items-center text-[10px] mt-0.5">
                  <span className="text-green-400 font-bold">{activity.price} ETH</span>
                  <button className="text-[#00FFC0] hover:text-teal-200 font-medium">
                    View details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Partner overview */}
        <section>
          <h2 className="text-xs font-semibold mb-1 text-slate-50">Partner platforms overview</h2>
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-[10px]">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-400 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                    Last activity
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="bg-[#050509] divide-y divide-slate-900">
                {partners.map((p) => (
                  <tr key={p.name}>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-100">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{p.icon}</span>
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-400 hidden sm:table-cell">
                      {p.status === 'Aktiv' ? 'Today, 14:30' : 'No recent activity'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`${getStatusColor(
                          p.status,
                        )} px-2 inline-flex text-[10px] leading-5 font-semibold rounded-full`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      <button className="text-[#00FFC0] hover:text-teal-200 font-medium">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* scrollbar-hide for the horizontal row */}
          <style>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
        </section>
      </div>
    );
  };

  // --- RENDER TAB CONTENT ---

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomeTab />;
      case 'loot':
        return <LootTab />;
      case 'quests':
        return <QuestsTab />;
      case 'mesh':
        return <MeshTab />;
      case 'support':
        return <SupportTab />;
      case 'market':
        return <MarketTab />;
      default:
        return <HomeTab />;
    }
  };

  // --- MAIN RENDER ---

  return (
    <div className={`min-h-screen ${darkBg} flex justify-center`}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800&display=swap');
          body { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }
          button:disabled { cursor: not-allowed; opacity: 0.7; }
        `}
      </style>

      <ToastComponent />

      <div
        id="app-container"
        className="w-full max-w-5xl px-3 sm:px-4 pt-3 pb-16 sm:pb-18 flex flex-col"
      >
        {/* Header */}
        <header className="mb-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setActiveSheet('account')}
              className={`${cardBg} ${borderColor} border px-2.5 py-1.5 rounded-full flex items-center space-x-2 hover:border-[#00FFC0] transition text-xs`}
            >
              <div className="w-7 h-7 bg-[#9A00FF] rounded-full flex items-center justify-center text-[11px] font-bold text-white">
                S
              </div>
              <div className="text-[11px] leading-tight text-left">
                <div className="font-semibold text-slate-50">@spawniz</div>
                <div className="text-slate-400">SpawnEngine · Base mesh</div>
              </div>
            </button>

            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#00FFC0] shadow-[0_0_8px_#00FFC0]" />
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${neonBg}/10 ${neon} border border-[#00FFC0]/60`}
              >
                Mesh HUD v0.3
              </span>
              <button
                onClick={() => setActiveSheet('settings')}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Info bar */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px]">
            <div className="flex space-x-1.5">
              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                BASE · Ecosystem
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-600/20 text-[#22A8FF] border border-blue-600/60">
                Farcaster-ready
              </span>
            </div>
            <div className="flex space-x-3 font-mono text-slate-500 border-t border-b border-slate-800 py-0.5 px-1.5 w-full sm:w-auto justify-between sm:justify-end">
              <span>
                GAS: <span className="text-slate-100">0.05 Gwei</span>
              </span>
              <span>
                MODE: <span className="text-slate-100">Alpha mode</span>
              </span>
              <span>
                WALLETS: <span className="text-slate-100">420k+</span>
              </span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 pb-2">{renderTabContent()}</main>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl bg-[#050509]/95 border-t border-slate-800 h-14 flex items-center justify-around px-2 shadow-[0_-8px_20px_rgba(0,0,0,0.75)]">
          <NavItem icon={Home} tabName="home" label="Home" />
          <NavItem icon={Box} tabName="loot" label="Loot" />
          <NavItem icon={Sword} tabName="quests" label="Quests" />
          <NavItem icon={Hexagon} tabName="mesh" label="Mesh" />
          <NavItem icon={MessageSquare} tabName="support" label="SupCast" />
          <NavItem icon={Globe} tabName="market" label="Market" />
        </nav>

        {/* Sheets */}
        <SheetAccount />
        <SheetSettings />
      </div>
    </div>
  );
};

export default App;