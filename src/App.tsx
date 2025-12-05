import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Home,
  Box,
  Sword,
  Hexagon,
  MessageSquare,
  Settings,
  User,
  LogOut,
  ShieldCheck,
  Flame,
  TrendingUp,
  Star,
  Gift,
  Activity,
  MapPin,
  DollarSign,
  Zap,
  Globe,
  CheckCircle,
} from 'lucide-react';

const App = () => {
  // THEME (compact, farcaster/base hybrid)
  const appBg = 'bg-slate-950';
  const cardBg = 'bg-slate-900';
  const borderColor = 'border-slate-700';
  const accentPurple = 'text-purple-400';
  const accentPurpleBg = 'bg-purple-500';
  const accentCyan = 'text-cyan-400';
  const accentCyanBg = 'bg-cyan-500';
  const softText = 'text-slate-400';

  // BASIC STATE
  const [currentTab, setCurrentTab] = useState('home');
  const [activeSheet, setActiveSheet] = useState(null); // 'account' | 'settings' | null
  const [toast, setToast] = useState(null);

  // MOCK USER ID (later: wallet or firebase uid)
  const [userId] = useState('0xSpawnMesh1234abcd');

  // PROFILE / XP / STREAK
  const [profileData, setProfileData] = useState({
    xpBalance: 1250,
    spawnTokenBalance: 8.75,
    streakDays: 3,
    lastCheckIn: null, // Date or null
  });

  // INVENTORY / PACKS
  const [inventory, setInventory] = useState([
    { id: 'startermeshpack', type: 'Starter Mesh Pack', count: 2 },
    { id: 'fragment', type: 'Fragment', count: 4 },
    { id: 'shard', type: 'Shard', count: 1 },
    { id: 'relic', type: 'Relic', count: 0 },
  ]);

  // SUPCAST
  const [supCastFeed, setSupCastFeed] = useState([
    {
      id: 'case1',
      title: 'Base app stuck on “Connecting wallet”',
      description: 'Tried multiple wallets, same result. Any known fix?',
      status: 'Open',
      posterId: '0xabc123',
      posterHandle: '@meshtrader',
      timestamp: Date.now() - 1000 * 60 * 12,
    },
    {
      id: 'case2',
      title: 'Gas too high for micro packs?',
      description: 'Looking for best strategy to batch-pack pulls without wasting gas.',
      status: 'Claimed',
      posterId: '0xdef456',
      posterHandle: '@vibebuilder',
      timestamp: Date.now() - 1000 * 60 * 45,
    },
  ]);
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [isPostingCase, setIsPostingCase] = useState(false);

  // TOAST
  const showToast = useCallback((message, type = 'info') => {
    let colorClasses = 'bg-slate-800 text-slate-100 border border-slate-600';
    if (type === 'error') colorClasses = 'bg-red-600 text-white border border-red-400';
    if (type === 'success') colorClasses = 'bg-emerald-600 text-white border border-emerald-400';
    if (type === 'info') colorClasses = 'bg-blue-600 text-white border border-blue-400';

    setToast({ message, colorClasses });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const ToastComponent = () =>
    toast && (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-3">
        <div className={`rounded-xl px-3 py-2 text-xs font-semibold shadow-xl ${toast.colorClasses}`}>
          {toast.message}
        </div>
      </div>
    );

  // LOCAL STORAGE SYNC (PROFILE & INVENTORY & SUPCAST)
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('spawnengine_profile');
      const storedInventory = localStorage.getItem('spawnengine_inventory');
      const storedSupCast = localStorage.getItem('spawnengine_supcast');

      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        if (parsed.lastCheckIn) parsed.lastCheckIn = new Date(parsed.lastCheckIn);
        setProfileData(parsed);
      }

      if (storedInventory) {
        setInventory(JSON.parse(storedInventory));
      }

      if (storedSupCast) {
        const parsedFeed = JSON.parse(storedSupCast).map((c) => ({
          ...c,
          timestamp: typeof c.timestamp === 'number' ? c.timestamp : Date.now(),
        }));
        setSupCastFeed(parsedFeed);
      }
    } catch (e) {
      console.error('localStorage load error', e);
    }
  }, []);

  useEffect(() => {
    try {
      const toStore = { ...profileData, lastCheckIn: profileData.lastCheckIn ? profileData.lastCheckIn.toISOString() : null };
      localStorage.setItem('spawnengine_profile', JSON.stringify(toStore));
    } catch (e) {
      console.error('profile save error', e);
    }
  }, [profileData]);

  useEffect(() => {
    try {
      localStorage.setItem('spawnengine_inventory', JSON.stringify(inventory));
    } catch (e) {
      console.error('inventory save error', e);
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('spawnengine_supcast', JSON.stringify(supCastFeed));
    } catch (e) {
      console.error('supcast save error', e);
    }
  }, [supCastFeed]);

  // STREAK / CHECK-IN HELPERS
  const formatTimeRemaining = (lastCheckIn) => {
    if (!lastCheckIn) return 'Ready now';
    const nextCheckIn = lastCheckIn.getTime() + 24 * 60 * 60 * 1000;
    const diff = nextCheckIn - Date.now();
    if (diff <= 0) return 'Ready now';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const streakReady = useMemo(() => {
    if (!profileData.lastCheckIn) return true;
    return Date.now() - profileData.lastCheckIn.getTime() >= 24 * 60 * 60 * 1000;
  }, [profileData.lastCheckIn]);

  const streakProgressPercent = useMemo(() => {
    if (!profileData.lastCheckIn) return 100;
    const last = profileData.lastCheckIn.getTime();
    const now = Date.now();
    const diff = now - last;
    const pct = Math.min(100, Math.max(0, (diff / (24 * 60 * 60 * 1000)) * 100));
    return pct;
  }, [profileData.lastCheckIn]);

  const handleCheckIn = useCallback(() => {
    const now = new Date();
    const last = profileData.lastCheckIn;

    if (last) {
      const diff = now.getTime() - last.getTime();
      if (diff < 24 * 60 * 60 * 1000) {
        const remaining = 24 * 60 * 60 * 1000 - diff;
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        showToast(`Next check-in in ${hours}h ${mins}m`, 'info');
        return;
      }
    }

    let newStreak = profileData.streakDays || 0;
    let newXP = profileData.xpBalance || 0;

    const hasStreak = !!last && now.getTime() - last.getTime() < 48 * 60 * 60 * 1000;
    if (hasStreak) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    const reward = 40 + newStreak * 5;
    newXP += reward;

    setProfileData({
      ...profileData,
      streakDays: newStreak,
      xpBalance: newXP,
      lastCheckIn: now,
    });

    showToast(`Day ${newStreak} check-in: +${reward} XP`, 'success');
  }, [profileData, showToast]);

  // INVENTORY HELPERS
  const getItemCount = (id) => {
    const found = inventory.find((i) => i.id === id);
    return found ? found.count : 0;
  };

  const updateItemCount = (id, type, delta) => {
    setInventory((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (!existing && delta <= 0) return prev;
      if (!existing && delta > 0) {
        return [...prev, { id, type, count: delta }];
      }
      const newCount = Math.max(0, existing.count + delta);
      return prev.map((i) => (i.id === id ? { ...i, count: newCount } : i));
    });
  };

  const handlePackOpen = useCallback(
    (packId) => {
      const packCount = getItemCount(packId);
      if (packCount <= 0) {
        showToast('No packs left to open.', 'error');
        return;
      }

      // Simple mock RNG
      const r = Math.random();
      let rewardText = '';
      let xpGain = 0;

      if (r < 0.06) {
        // Relic
        updateItemCount('relic', 'Relic', 1);
        xpGain = 400;
        rewardText = 'MYTHIC RELIC DROP! +1 Relic, +400 XP.';
      } else if (r < 0.25) {
        // Shard
        updateItemCount('shard', 'Shard', 1);
        xpGain = 120;
        rewardText = 'Shard hit! +1 Shard, +120 XP.';
      } else {
        // Fragment
        const amount = Math.floor(Math.random() * 3) + 1;
        updateItemCount('fragment', 'Fragment', amount);
        xpGain = 30;
        rewardText = `+${amount} Fragments, +30 XP.`;
      }

      updateItemCount(packId, 'Starter Mesh Pack', -1);
      setProfileData((prev) => ({ ...prev, xpBalance: prev.xpBalance + xpGain }));
      showToast(rewardText, 'success');
    },
    [showToast]
  );

  const handleSynthesis = useCallback(() => {
    const frags = getItemCount('fragment');
    if (frags < 3) {
      showToast('Need 3 Fragments to synthesize a Shard.', 'error');
      return;
    }
    updateItemCount('fragment', 'Fragment', -3);
    updateItemCount('shard', 'Shard', 1);
    showToast('Synthesis complete: 3 Fragments → 1 Shard.', 'success');
  }, [showToast]);

  // SUPCAST HANDLERS
  const handlePostCase = useCallback(() => {
    if (!newCaseTitle.trim() || !newCaseDesc.trim()) {
      showToast('Title and description required.', 'error');
      return;
    }
    setIsPostingCase(true);

    const newCase = {
      id: `case_${Date.now()}`,
      title: newCaseTitle.trim(),
      description: newCaseDesc.trim(),
      status: 'Open',
      posterId: userId,
      posterHandle: '@spawniz',
      timestamp: Date.now(),
    };

    setSupCastFeed((prev) => [newCase, ...prev]);
    setNewCaseTitle('');
    setNewCaseDesc('');
    setIsPostingCase(false);
    showToast('Case posted to SupCast network.', 'success');
  }, [newCaseTitle, newCaseDesc, userId, showToast]);

  // COMPONENTS

  const NavItem = ({ icon: Icon, tabName, label }) => (
    <button
      onClick={() => setCurrentTab(tabName)}
      className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-lg transition ${
        currentTab === tabName ? 'text-purple-400' : 'text-slate-500 hover:text-slate-200'
      }`}
    >
      <Icon className="w-5 h-5 mb-0.5" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  const Sheet = ({ id, title, children }) => (
    <div
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm h-[90vh] ${appBg} border-t border-slate-700 rounded-t-3xl shadow-2xl transition-transform duration-300 z-40 overflow-y-auto px-3 ${
        activeSheet === id ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="w-full flex justify-center py-2" onClick={() => setActiveSheet(null)}>
        <div className="h-1 w-12 bg-slate-600 rounded-full" />
      </div>
      <div className="pb-6">
        <h2 className="text-xl font-bold text-purple-300 mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );

  const SheetAccount = () => (
    <Sheet id="account" title="Account & Mesh Identity">
      <div className={`${cardBg} ${borderColor} border rounded-xl p-3 flex items-center space-x-3 mb-4`}>
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
          S
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-100">@spawniz</p>
          <p className={`text-[11px] ${softText}`}>Mesh ID · Creator</p>
          <p className="text-[10px] text-slate-500 mt-1">
            {userId.slice(0, 6)}...{userId.slice(-4)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`${cardBg} ${borderColor} border rounded-xl p-2.5`}>
          <p className={`text-[11px] ${softText}`}>Total XP</p>
          <p className="text-xl font-bold text-purple-300">{profileData.xpBalance.toLocaleString()}</p>
        </div>
        <div className={`${cardBg} ${borderColor} border rounded-xl p-2.5`}>
          <p className={`text-[11px] ${softText}`}>SPN Balance</p>
          <p className="text-xl font-bold text-cyan-300">{profileData.spawnTokenBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className={`${cardBg} ${borderColor} border rounded-xl p-3 mb-4`}>
        <h3 className="text-sm font-semibold text-purple-300 mb-1">Referral Mesh</h3>
        <p className={`text-[11px] ${softText} mb-2`}>
          Share your mesh code for XP + pack multipliers when friends connect.
        </p>
        <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5">
          <span className="font-mono text-[11px] text-purple-200">SPAWN-MESH-74F</span>
          <button
            className="text-[10px] font-semibold px-2 py-1 rounded-full border border-purple-400 text-purple-300 hover:bg-purple-500/10"
            onClick={() => {
              navigator.clipboard?.writeText('SPAWN-MESH-74F');
              showToast('Referral code copied.', 'success');
            }}
          >
            Copy
          </button>
        </div>
      </div>

      <button
        className="w-full mt-4 py-2.5 bg-red-700/70 hover:bg-red-700 rounded-xl text-sm font-semibold text-slate-50 flex items-center justify-center gap-2"
        onClick={() => showToast('Wallet switching mocked in this version.', 'info')}
      >
        <LogOut className="w-4 h-4" />
        Switch Wallet / Logout
      </button>
    </Sheet>
  );

  const SheetSettings = () => (
    <Sheet id="settings" title="Settings & Creator Tools">
      <div className="space-y-3">
        <div className={`${cardBg} ${borderColor} border rounded-xl p-3`}>
          <h3 className="text-sm font-semibold text-purple-300 mb-1">XP SDK & Mesh API</h3>
          <p className={`text-[11px] ${softText} mb-2`}>
            Drop this SDK into your own app to sync XP, streaks and pack pulls into the mesh.
          </p>
          <button
            className="w-full py-1.5 rounded-lg text-[11px] font-semibold border border-purple-400 text-purple-300 hover:bg-purple-500/10"
            onClick={() => showToast('API key & SDK are mocked here.', 'info')}
          >
            Show API Key & Docs
          </button>
        </div>

        <div className={`${cardBg} ${borderColor} border rounded-xl p-3`}>
          <h3 className="text-sm font-semibold text-purple-300 mb-1">Creator Launchpad</h3>
          <p className={`text-[11px] ${softText} mb-2`}>
            Future panel for deploying creator tokens, pack series and quest layers from one place.
          </p>
          <button
            className="w-full py-1.5 rounded-lg text-[11px] font-semibold border border-cyan-400 text-cyan-300 hover:bg-cyan-500/10"
            onClick={() => showToast('Launchpad UI is planned for Phase 3.', 'info')}
          >
            Open Creator Panel (Soon)
          </button>
        </div>

        <div className={`${cardBg} ${borderColor} border rounded-xl p-3`}>
          <h3 className="text-sm font-semibold text-purple-300 mb-1">Notifications</h3>
          <p className={`text-[11px] ${softText} mb-2`}>
            Control streak reminders, big pack pulls and onchain automations from Spawn Bot.
          </p>
          <button
            className="w-full py-1.5 rounded-lg text-[11px] font-semibold border border-slate-600 text-slate-100 hover:bg-slate-700/70"
            onClick={() => showToast('Notification center is mocked.', 'info')}
          >
            Manage Notifications
          </button>
        </div>
      </div>
    </Sheet>
  );

  // TABS

  const HomeTab = () => {
    const timeRemaining = formatTimeRemaining(profileData.lastCheckIn);
    const oracleFeed = [
      {
        type: 'alpha',
        message: "Whale wallet just stacked creator tokens in 3 different apps.",
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      },
      {
        type: 'flow',
        message: 'Pack pulls spiked x3 across Base in the last hour.',
        icon: <TrendingUp className="w-4 h-4 text-yellow-400" />,
      },
      {
        type: 'burn',
        message: 'Commons burn rate is up – fragments flowing into shards.',
        icon: <Flame className="w-4 h-4 text-red-500" />,
      },
      {
        type: 'quest',
        message: 'New IRL quest: Base Builders meetup (Stockholm) – XP bonus.',
        icon: <MapPin className="w-4 h-4 text-blue-400" />,
      },
    ];

    return (
      <div className="space-y-3">
        {/* XP / SPN */}
        <div className="grid grid-cols-2 gap-2">
          <div
            className={`${cardBg} ${borderColor} border rounded-xl px-2.5 py-2 shadow-md flex flex-col justify-between`}
          >
            <p className="text-[11px] uppercase tracking-wide text-slate-500">XP Balance</p>
            <p className="text-2xl font-extrabold text-purple-300 leading-tight">
              {profileData.xpBalance.toLocaleString()}
            </p>
          </div>
          <div
            className={`${cardBg} ${borderColor} border rounded-xl px-2.5 py-2 shadow-md flex flex-col justify-between`}
          >
            <p className="text-[11px] uppercase tracking-wide text-slate-500">SPN Token</p>
            <p className="text-2xl font-extrabold text-cyan-300 leading-tight">
              {profileData.spawnTokenBalance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Streak */}
        <div
          className={`streak-card ${cardBg} ${borderColor} border rounded-xl px-2.5 py-2.5 shadow-md flex flex-col space-y-2`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Daily Streak <span className="text-purple-300">· {profileData.streakDays} days</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Next check-in:{' '}
                <span className="font-mono text-slate-200">{timeRemaining || 'Ready now'}</span>
              </p>
            </div>
            <button
              onClick={handleCheckIn}
              disabled={!streakReady}
              className={`text-[11px] px-3 py-1 rounded-full font-semibold border ${
                streakReady
                  ? 'border-purple-400 text-purple-200 hover:bg-purple-500/10'
                  : 'border-slate-600 text-slate-500 cursor-not-allowed'
              }`}
            >
              {streakReady ? 'Check In' : 'Locked'}
            </button>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 transition-all"
              style={{ width: `${streakProgressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">
            Streak XP scales with behavior across packs, coins & quests.
          </p>
        </div>

        {/* Mesh HUD Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`${cardBg} ${borderColor} border rounded-xl px-2 py-1.5`}>
            <p className="text-[10px] text-slate-500 mb-0.5">Mesh Load</p>
            <p className="text-sm font-semibold text-slate-100">Medium</p>
            <p className="text-[10px] text-slate-500">3 active wallets</p>
          </div>
          <div className={`${cardBg} ${borderColor} border rounded-xl px-2 py-1.5`}>
            <p className="text-[10px] text-slate-500 mb-0.5">Creator Tokens</p>
            <p className="text-sm font-semibold text-purple-300">7</p>
            <p className="text-[10px] text-slate-500">tracking</p>
          </div>
          <div className={`${cardBg} ${borderColor} border rounded-xl px-2 py-1.5`}>
            <p className="text-[10px] text-slate-500 mb-0.5">Open Packs</p>
            <p className="text-sm font-semibold text-cyan-300">{getItemCount('startermeshpack')}</p>
            <p className="text-[10px] text-slate-500">ready</p>
          </div>
        </div>

        {/* Oracle Feed */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">Mesh Signals</h3>
            <span className="text-[10px] text-slate-500">Phase 1 · HUD</span>
          </div>
          <div className="space-y-1.5">
            {oracleFeed.map((item, idx) => (
              <div
                key={idx}
                className={`${cardBg} ${borderColor} border rounded-lg px-2.5 py-1.5 flex items-start space-x-2`}
              >
                <div className="mt-0.5">{item.icon}</div>
                <p className="text-[11px] text-slate-200">{item.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const LootTab = () => {
    const starterPack = {
      id: 'startermeshpack',
      label: 'Starter Mesh Pack',
      description: 'Guaranteed fragments · chance for shards & relics.',
    };

    const fragments = getItemCount('fragment');
    const shards = getItemCount('shard');
    const relics = getItemCount('relic');

    return (
      <div className="space-y-3">
        {/* Mode toggle (static visual for now) */}
        <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1 text-[11px]">
          <button className="flex-1 rounded-lg py-1 bg-slate-800 text-slate-100 font-semibold">
            Packs
          </button>
          <button className="flex-1 rounded-lg py-1 text-slate-500">Pull Lab</button>
          <button className="flex-1 rounded-lg py-1 text-slate-500">Inventory</button>
        </div>

        {/* Pack card */}
        <div className={`${cardBg} ${borderColor} border rounded-xl px-2.5 py-2.5 space-y-2`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-100">{starterPack.label}</p>
              <p className="text-[11px] text-slate-500">{starterPack.description}</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-600 text-slate-300 font-mono">
              ID: S001
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <div>
              <p className="text-[11px] text-slate-500 mb-0.5">Available</p>
              <p className="text-xl font-bold text-purple-300">
                {getItemCount(starterPack.id)}
              </p>
            </div>
            <button
              onClick={() => handlePackOpen(starterPack.id)}
              disabled={getItemCount(starterPack.id) <= 0}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border ${
                getItemCount(starterPack.id) > 0
                  ? 'border-purple-400 text-purple-200 hover:bg-purple-500/10'
                  : 'border-slate-600 text-slate-500 cursor-not-allowed'
              }`}
            >
              Open Pack
            </button>
          </div>
          <p className="text-[10px] text-slate-500">
            Future: hooked into onchain PackFactory / TokenPackSeries.
          </p>
        </div>

        {/* Pull Lab */}
        <div className={`${cardBg} ${borderColor} border rounded-xl px-2.5 py-2.5 space-y-2`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-purple-300">Pull Lab · Synthesis</h3>
            <span className="text-[10px] text-slate-500">Phase 3 · Protocol</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Test entropy and crafting: turn fragments into shards, shards into relics.
          </p>

          <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono mt-1 border-t border-slate-800 pt-2">
            <div className="border-r border-slate-800">
              <p className="text-xl font-bold text-slate-100">{fragments}</p>
              <p className="text-[10px] text-slate-500">Fragments</p>
            </div>
            <div className="border-r border-slate-800">
              <p className="text-xl font-bold text-cyan-300">{shards}</p>
              <p className="text-[10px] text-slate-500">Shards</p>
            </div>
            <div>
              <p className="text-xl font-bold text-rose-400">{relics}</p>
              <p className="text-[10px] text-slate-500">Relics</p>
            </div>
          </div>

          <button
            onClick={handleSynthesis}
            disabled={fragments < 3}
            className={`w-full mt-2 py-1.5 rounded-lg text-[11px] font-semibold border ${
              fragments >= 3
                ? 'border-cyan-400 text-cyan-200 hover:bg-cyan-500/10'
                : 'border-slate-600 text-slate-500 cursor-not-allowed'
            }`}
          >
            Run Synthesis (3 Fragments → 1 Shard)
          </button>
        </div>

        {/* Boosterbox / Future integration placeholder */}
        <div className={`${cardBg} ${borderColor} border rounded-xl px-2.5 py-2`}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-slate-100">Booster Mesh Slots</h3>
            <span className="text-[10px] text-slate-500">Inspired by vibe.market</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-1.5">
            Future region for reading boosterboxes, card metadata and odds via your own APIs.
          </p>
          <div className="h-16 rounded-lg bg-slate-900/70 border border-dashed border-slate-700 flex items-center justify-center">
            <p className="text-[11px] text-slate-500">
              Hook in SpawnEngine pack contracts & booster metadata here.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const QuestsTab = () => {
    const quests = [
      {
        type: 'Daily',
        title: 'Daily Mesh Check-in',
        reward: 25,
        status: 'Claimable',
      },
      {
        type: 'Daily',
        title: 'Open 1 Pack',
        reward: 40,
        status: 'Locked',
      },
      {
        type: 'Weekly',
        title: '5 Day Streak',
        reward: 200,
        status: 'Locked',
      },
      {
        type: 'Weekly',
        title: 'Solve 1 SupCast Case',
        reward: 120,
        status: 'Claimable',
      },
      {
        type: 'IRL',
        title: 'Attend 1 Base Meetup',
        reward: 300,
        status: 'Locked',
      },
    ];

    const claimStatusClass = (status) => {
      if (status === 'Claimable') return 'border-emerald-400 text-emerald-300 bg-emerald-500/10';
      if (status === 'Locked') return 'border-slate-600 text-slate-500 bg-slate-800/60';
      return 'border-purple-400 text-purple-300 bg-purple-500/10';
    };

    const handleClaimQuest = (q) => {
      if (q.status !== 'Claimable') return;
      setProfileData((prev) => ({ ...prev, xpBalance: prev.xpBalance + q.reward }));
      showToast(`Quest "${q.title}" claimed: +${q.reward} XP`, 'success');
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Quests Layer</h2>
          <span className="text-[10px] text-slate-500">Phase 1 · Micro-rituals</span>
        </div>

        <div className="space-y-2">
          {quests.map((q, idx) => (
            <div
              key={idx}
              className={`${cardBg} ${borderColor} border rounded-xl px-2.5 py-2 flex items-center justify-between`}
            >
              <div>
                <p className="text-xs font-semibold text-slate-100">{q.title}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  {q.reward} XP · <span className="text-slate-400">{q.type}</span>
                </p>
              </div>
              <button
                onClick={() => handleClaimQuest(q)}
                className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border ${claimStatusClass(
                  q.status
                )}`}
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
        id: 'creator',
        name: 'Creator Mesh',
        desc: 'Tracks creator tokens across Zora, Base miniapps & Frames.',
        icon: Globe,
      },
      {
        id: 'packs',
        name: 'Pack Mesh',
        desc: 'Follows pack ecosystems, pull clusters and burn ladders.',
        icon: Box,
      },
      {
        id: 'wallets',
        name: 'Wallet Mesh',
        desc: 'Groups wallets into one identity: vault, sniper, treasury.',
        icon: Activity,
      },
    ];

    const [activeMode, setActiveMode] = useState(modes[0]);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Mesh Explorer</h2>
          <span className="text-[10px] text-slate-500">Phase 5 · v2.0 later</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m)}
              className={`${cardBg} ${borderColor} border rounded-xl px-2 py-2 flex flex-col items-center gap-1 ${
                activeMode.id === m.id ? 'border-purple-400 bg-slate-900' : 'hover:border-slate-500'
              }`}
            >
              <m.icon
                className={`w-4 h-4 ${
                  activeMode.id === m.id ? 'text-purple-300' : 'text-slate-400'
                }`}
              />
              <span className="text-[10px] text-slate-100 text-center">{m.name}</span>
            </button>
          ))}
        </div>

        <div className={`${cardBg} ${borderColor} border rounded-xl px-2.5 py-2`}>
          <p className="text-xs font-semibold text-purple-300 mb-1">{activeMode.name}</p>
          <p className="text-[11px] text-slate-400 mb-1.5">{activeMode.desc}</p>
          <p className="text-[10px] text-slate-500">
            Future: live wallet graph, bubble maps, XP flows & creator clusters rendered here.
          </p>
        </div>

        <div className="h-40 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
          <p className="text-[11px] text-slate-500 italic">
            WebGL mesh / graph visualization placeholder (phase 5).
          </p>
        </div>
      </div>
    );
  };

  const SupportTab = () => {
    const supportProfile = {
      solved: 7,
      xp: 320,
      rating: 4.6,
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">SupCast · Onchain Support</h2>
          <span className="text-[10px] text-slate-500">Phase 4 · Bot later</span>
        </div>

        {/* Post form */}
        <div className={`${cardBg} ${borderColor} border rounded-xl px-2.5 py-2 space-y-2`}>
          <h3 className="text-xs font-semibold text-purple-300">Post a case</h3>
          <input
            type="text"
            value={newCaseTitle}
            onChange={(e) => setNewCaseTitle(e.target.value)}
            placeholder="Short title of your problem"
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-[11px] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
          <textarea
            value={newCaseDesc}
            onChange={(e) => setNewCaseDesc(e.target.value)}
            placeholder="Wallet, chain, error, what happened..."
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-[11px] text-slate-100 placeholder:text-slate-600 h-16 resize-none focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
          <button
            onClick={handlePostCase}
            disabled={!newCaseTitle.trim() || !newCaseDesc.trim() || isPostingCase}
            className={`w-full py-1.5 rounded-lg text-[11px] font-semibold border ${
              !newCaseTitle.trim() || !newCaseDesc.trim() || isPostingCase
                ? 'border-slate-600 text-slate-500 bg-slate-800 cursor-not-allowed'
                : 'border-red-500 text-red-300 bg-red-600/20 hover:bg-red-600/40'
            }`}
          >
            {isPostingCase ? 'Posting...' : 'Post to SupCast network'}
          </button>
        </div>

        {/* Feed */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-100">
              Open cases ({supCastFeed.length})
            </h3>
          </div>
          {supCastFeed.length === 0 ? (
            <div
              className={`${cardBg} ${borderColor} border rounded-xl px-2.5 py-2 text-[11px] text-slate-500 text-center`}
            >
              No cases yet – your first one sets the tone.
            </div>
          ) : (
            supCastFeed.map((c) => (
              <div
                key={c.id}
                className={`${cardBg} ${borderColor} border rounded-xl px-2.5 py-2 flex items-start justify-between gap-2`}
              >
                <div className="flex-1">
                  <p className="text-[10px] text-slate-500 mb-0.5">
                    {c.posterHandle}{' '}
                    <span className="text-slate-600">
                      ({c.posterId.slice(0, 4)}...{c.posterId.slice(-3)})
                    </span>
                  </p>
                  <p className="text-xs font-semibold text-slate-100">{c.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{c.description}</p>
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                      c.status === 'Open'
                        ? 'border-red-500 text-red-300 bg-red-600/20'
                        : c.status === 'Claimed'
                        ? 'border-blue-500 text-blue-300 bg-blue-600/20'
                        : 'border-emerald-500 text-emerald-300 bg-emerald-600/20'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Profile */}
        <div className={`${cardBg} ${borderColor} border rounded-xl px-2.5 py-2`}>
          <h3 className="text-xs font-semibold text-purple-300 mb-1">Your SupCast Profile</h3>
          <div className="flex items-center justify-between text-center">
            <div className="flex-1">
              <p className="text-lg font-bold text-purple-300">{supportProfile.xp}</p>
              <p className="text-[10px] text-slate-500">Support XP</p>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-cyan-300">{supportProfile.solved}</p>
              <p className="text-[10px] text-slate-500">Solved Cases</p>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-yellow-300 flex items-center justify-center gap-1">
                {supportProfile.rating}
                <CheckCircle className="w-3 h-3" />
              </p>
              <p className="text-[10px] text-slate-500">Rating</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // RENDER TAB CONTENT
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
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className={`min-h-screen ${appBg} flex justify-center`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }

        .compact-ui * {
          letter-spacing: 0.01em;
        }

        .compact-ui h1, 
        .compact-ui h2, 
        .compact-ui h3 {
          letter-spacing: 0.03em;
        }

        #bottom-nav {
          height: 54px;
        }
      `}</style>

      <ToastComponent />

      <div
        id="app-container"
        className="relative w-full max-w-sm px-3 pt-2 pb-16 flex flex-col compact-ui"
      >
        {/* HEADER */}
        <header className="mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveSheet('account')}
              className={`${cardBg} ${borderColor} border rounded-full px-2 py-1.5 flex items-center gap-2 hover:border-purple-400 transition`}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center text-[11px] font-bold text-white">
                S
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-100">@spawniz</p>
                <p className="text-[10px] text-slate-500">Mesh HUD · Phase 1</p>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-purple-400 bg-purple-500/10 text-purple-200">
                BASE · Connected
              </span>
              <button
                onClick={() => setActiveSheet('settings')}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            className={`${cardBg} ${borderColor} border rounded-xl px-2.5 py-2 flex items-center justify-between`}
          >
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">SpawnEngine</p>
              <p className="text-xs font-semibold text-slate-100">Mesh HUD v0.3</p>
              <p className="text-[10px] text-slate-500">
                XP · Packs · Wallet Mesh · SupCast · Quests
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500">Gas (Base)</p>
              <p className="text-xs font-mono text-emerald-300">~0.05 gwei</p>
              <p className="text-[10px] text-slate-500">Mode: Alpha</p>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 pb-2 overflow-y-auto">{renderTabContent()}</main>

        {/* BOTTOM NAV */}
        <nav
          id="bottom-nav"
          className={`${appBg} border-t border-slate-800 fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm flex items-center justify-around px-2`}
        >
          <NavItem icon={Home} tabName="home" label="Home" />
          <NavItem icon={Box} tabName="loot" label="Loot" />
          <NavItem icon={Sword} tabName="quests" label="Quests" />
          <NavItem icon={Hexagon} tabName="mesh" label="Mesh" />
          <NavItem icon={MessageSquare} tabName="support" label="SupCast" />
        </nav>

        {/* SHEETS */}
        <SheetAccount />
        <SheetSettings />
      </div>
    </div>
  );
};

export default App;