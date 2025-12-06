import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  collection,
  addDoc,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
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

// --- GLOBAL ENV VARS INJEKTAS AV HOST / WEBVIEW ---
const appId =
  typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig =
  typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : {};
const initialAuthToken =
  typeof __initial_auth_token !== 'undefined'
    ? __initial_auth_token
    : null;

// Helper paths
const getUserProfilePath = (userId) =>
  `artifacts/${appId}/users/${userId}/spawn_data/profile`;
const getUserInventoryPath = (userId) =>
  `artifacts/${appId}/users/${userId}/spawn_data/inventory`;
const getPublicSupCastCollectionPath = () =>
  `artifacts/${appId}/public/data/supcast_cases`;

const App = () => {
  // --- CORE STATE ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [currentTab, setCurrentTab] = useState('home');
  const [activeSheet, setActiveSheet] = useState(null); // 'account' | 'settings'
  const [toast, setToast] = useState(null);

  // Profile / Inventory / SupCast
  const [profileData, setProfileData] = useState({
    xpBalance: 0,
    spawnTokenBalance: 0,
    streakDays: 0,
    lastCheckIn: null,
  });
  const [inventory, setInventory] = useState([]);
  const [supCastFeed, setSupCastFeed] = useState([]);

  // SupCast form
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [isPostingCase, setIsPostingCase] = useState(false);
  const [newCaseCategory, setNewCaseCategory] =
    useState('tokens'); // tokens | packs | infra | frames | ux
  const [aiSuggestion, setAiSuggestion] = useState(null);

  // SupCast local chat (demo)
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      user: 'Mesh bot',
      kind: 'system',
      text: 'Welcome to SupCast — ask anything about Base: wallets, tokens, packs, frames, infra.',
      ts: 'now',
    },
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  // --- TOAST ---
  const showToast = useCallback((message, type = 'info') => {
    let color = 'bg-[#00FFC0]/90';
    if (type === 'error') color = 'bg-red-600/90';
    if (type === 'info') color = 'bg-[#00A6FF]/90';

    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const ToastComponent = () =>
    toast && (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-xs transition-all duration-300">
        <div
          className={`p-3 rounded-xl shadow-2xl text-sm font-semibold text-gray-900 backdrop-blur-sm ${toast.color}`}
        >
          {toast.message}
        </div>
      </div>
    );

  // --- STYLE SHORTCUTS ---
  const neon = 'text-[#00FFC0]';
  const neonBg = 'bg-[#00FFC0]';
  const accentBlue = 'text-[#00A6FF]';
  const darkBg = 'bg-[#0A0A10]';
  const cardBg = 'bg-[#151520]';
  const borderColor = 'border-[#252535]';

  // --- FIREBASE INIT / AUTH ---
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const firestoreInstance = getFirestore(app);
      setDb(firestoreInstance);
      setAuth(authInstance);

      const unsubscribe = onAuthStateChanged(
        authInstance,
        async (user) => {
          if (user) {
            setUserId(user.uid);
            setIsAuthReady(true);
          } else {
            try {
              if (initialAuthToken) {
                await signInWithCustomToken(
                  authInstance,
                  initialAuthToken
                );
              } else {
                await signInAnonymously(authInstance);
              }
            } catch (e) {
              console.error('Auth failed:', e);
              showToast(
                'Authentication failed. Check logs.',
                'error'
              );
              setIsAuthReady(true);
            }
          }
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.error('Firebase Initialization Error:', e);
      setIsAuthReady(true);
    }
  }, [showToast]);

  // --- FIRESTORE LISTENERS ---
  useEffect(() => {
    if (!isAuthReady || !userId || !db) return;
    setIsLoading(true);

    // PROFILE
    const profileRef = doc(db, getUserProfilePath(userId));
    const unsubProfile = onSnapshot(
      profileRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData((prev) => ({
            ...prev,
            xpBalance: data.xpBalance || 0,
            spawnTokenBalance: data.spawnTokenBalance || 0,
            streakDays: data.streakDays || 0,
            lastCheckIn:
              data.lastCheckIn instanceof Timestamp
                ? data.lastCheckIn.toDate()
                : null,
          }));
        } else {
          const initialData = {
            xpBalance: 100,
            spawnTokenBalance: 5,
            streakDays: 1,
            lastCheckIn: Timestamp.now(),
          };
          setDoc(profileRef, initialData).then(() => {
            setProfileData({
              ...initialData,
              lastCheckIn: new Date(),
            });
            showToast(
              'Welcome to SpawnEngine! Initial XP/SPN credited.',
              'success'
            );
          });
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Profile Snapshot Error:', err);
        showToast('Error loading profile data.', 'error');
        setIsLoading(false);
      }
    );

    // INVENTORY
    const invCol = collection(db, getUserInventoryPath(userId));
    const unsubInv = onSnapshot(
      invCol,
      (snapshot) => {
        const newInventory = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setInventory(newInventory);
      },
      (err) => {
        console.error('Inventory Snapshot Error:', err);
        showToast('Error loading inventory.', 'error');
      }
    );

    // SUPCAST FEED (public)
    const supCol = collection(db, getPublicSupCastCollectionPath());
    const unsubSup = onSnapshot(
      supCol,
      (snapshot) => {
        const feed = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        feed.sort(
          (a, b) =>
            (b.timestamp?.toDate?.() || 0) -
            (a.timestamp?.toDate?.() || 0)
        );
        setSupCastFeed(feed.slice(0, 50));
      },
      (err) => {
        console.error('SupCast Snapshot Error:', err);
        showToast('Error loading SupCast feed.', 'error');
      }
    );

    return () => {
      unsubProfile();
      unsubInv();
      unsubSup();
    };
  }, [isAuthReady, userId, db, showToast]);

  // --- CHECK-IN ---
  const handleCheckIn = useCallback(
    async () => {
      if (!db || !userId) return;
      const profileRef = doc(db, getUserProfilePath(userId));
      const now = new Date();
      const last = profileData.lastCheckIn;

      const ready =
        !last ||
        now.getTime() - last.getTime() >= 24 * 60 * 60 * 1000;

      if (!ready) {
        const timeRemainingMs =
          last.getTime() +
          24 * 60 * 60 * 1000 -
          now.getTime();
        const hours = Math.floor(
          timeRemainingMs / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        return showToast(
          `Next check-in in ${hours}h ${minutes}m.`,
          'info'
        );
      }

      try {
        await runTransaction(db, async (tx) => {
          const profileDoc = await tx.get(profileRef);
          if (!profileDoc.exists())
            throw new Error('Profile does not exist');

          const data = profileDoc.data();
          let newStreak = data.streakDays || 0;
          let newXp = data.xpBalance || 0;
          const reward = 50 + newStreak * 5;

          const isStreakContinued =
            !last ||
            now.getTime() - last.getTime() <
              48 * 60 * 60 * 1000;

          if (isStreakContinued) {
            newStreak += 1;
          } else {
            newStreak = 1;
            showToast('Streak lost, reset to Day 1.', 'error');
          }

          newXp += reward;

          tx.update(profileRef, {
            streakDays: newStreak,
            xpBalance: newXp,
            lastCheckIn: Timestamp.now(),
          });

          showToast(
            `Day ${newStreak} Check-in successful! +${reward} XP.`,
            'success'
          );
        });
      } catch (e) {
        console.error('Check-in failed:', e);
        showToast('Check-in failed. Please try again.', 'error');
      }
    },
    [db, userId, profileData.lastCheckIn, showToast]
  );

  // --- PACK OPEN ---
  const handlePackOpen = useCallback(
    async (packId) => {
      if (!db || !userId)
        return showToast('Platform is initializing.', 'error');

      try {
        await runTransaction(db, async (tx) => {
          const packRef = doc(
            db,
            getUserInventoryPath(userId),
            packId
          );
          const profileRef = doc(
            db,
            getUserProfilePath(userId)
          );

          const packDoc = await tx.get(packRef);
          const profileDoc = await tx.get(profileRef);

          if (!packDoc.exists() || packDoc.data().count <= 0)
            throw new Error('Pack not found or count zero');
          if (!profileDoc.exists())
            throw new Error('Profile not found');

          const currentPacks = packDoc.data().count;
          const currentXP = profileDoc.data().xpBalance || 0;

          const r = Math.random();
          let rewardText = '';
          let xpReward = 0;
          let itemType = null;
          let itemAmount = 0;

          if (r < 0.05) {
            itemType = 'Relic';
            itemAmount = 1;
            xpReward = 500;
            rewardText = 'MYTHIC DROP! +1 Relic & 500 XP.';
          } else if (r < 0.25) {
            itemType = 'Shard';
            itemAmount = 1;
            xpReward = 100;
            rewardText = '+1 Shard & 100 XP.';
          } else {
            itemType = 'Fragment';
            itemAmount = Math.floor(Math.random() * 3) + 1;
            xpReward = 25;
            rewardText = `+${itemAmount} Fragments & 25 XP.`;
          }

          tx.update(packRef, { count: currentPacks - 1 });
          tx.update(profileRef, {
            xpBalance: currentXP + xpReward,
          });

          const itemRef = doc(
            db,
            getUserInventoryPath(userId),
            itemType.toLowerCase()
          );
          const itemDoc = await tx.get(itemRef);
          const currentItemCount = itemDoc.exists()
            ? itemDoc.data().count
            : 0;

          tx.set(
            itemRef,
            {
              type: itemType,
              count: currentItemCount + itemAmount,
              lastAcquired: Timestamp.now(),
            },
            { merge: true }
          );

          showToast(rewardText, 'success');
        });
      } catch (e) {
        console.error('Open pack failed:', e);
        showToast(`Open failed: ${e.message}`, 'error');
      }
    },
    [db, userId, showToast]
  );

  // --- SUPCAST POST ---
  const handlePostCase = useCallback(
    async () => {
      if (!newCaseTitle || !newCaseDesc)
        return showToast(
          'Title and description required.',
          'error'
        );

      // Offline/mock fallback
      if (!db || !userId) {
        const localCase = {
          id: `local-${Date.now()}`,
          title: newCaseTitle,
          description: newCaseDesc,
          status: 'Open',
          posterId: 'local',
          expertId: null,
          timestamp: { toDate: () => new Date() },
          posterHandle: '@local-mesh',
          category: newCaseCategory,
        };
        setSupCastFeed((prev) => [localCase, ...prev]);
        setNewCaseTitle('');
        setNewCaseDesc('');
        setNewCaseCategory('tokens');
        return showToast(
          'Question added (local mock).',
          'success'
        );
      }

      setIsPostingCase(true);
      try {
        const supCol = collection(
          db,
          getPublicSupCastCollectionPath()
        );
        const newCase = {
          title: newCaseTitle,
          description: newCaseDesc,
          status: 'Open',
          posterId: userId,
          expertId: null,
          timestamp: Timestamp.now(),
          posterHandle: '@spawniz',
          category: newCaseCategory,
        };
        await addDoc(supCol, newCase);
        setNewCaseTitle('');
        setNewCaseDesc('');
        setNewCaseCategory('tokens');
        showToast(
          'Question posted to SupCast network!',
          'success'
        );
      } catch (e) {
        console.error('Post case failed:', e);
        showToast('Failed to post case. Check network.', 'error');
      } finally {
        setIsPostingCase(false);
      }
    },
    [
      db,
      userId,
      newCaseTitle,
      newCaseDesc,
      newCaseCategory,
      showToast,
    ]
  );

  // --- STREAK HELPERS ---
  const formatTimeRemaining = (lastCheckIn) => {
    if (!lastCheckIn) return 'Ready Now';
    const next =
      lastCheckIn.getTime() + 24 * 60 * 60 * 1000;
    const ms = next - Date.now();
    if (ms <= 0) return 'Ready Now';
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor(
      (ms % (1000 * 60 * 60)) / (1000 * 60)
    );
    return `${h}h ${m}m`;
  };

  const streakReady = useMemo(() => {
    if (!profileData.lastCheckIn) return true;
    return (
      Date.now() - profileData.lastCheckIn.getTime() >=
      24 * 60 * 60 * 1000
    );
  }, [profileData.lastCheckIn]);

  const streakHoursLeft = useMemo(() => {
    if (!profileData.lastCheckIn) return 0;
    const next =
      profileData.lastCheckIn.getTime() +
      24 * 60 * 60 * 1000;
    const ms = next - Date.now();
    if (ms <= 0) return 0;
    return 24 - ms / (1000 * 60 * 60);
  }, [profileData.lastCheckIn]);

  // --- TABS ---

  const HomeTab = () => {
    const timeRemainingText = formatTimeRemaining(
      profileData.lastCheckIn
    );
    const progressPercent = Math.min(
      100,
      (streakHoursLeft / 24) * 100
    );

    const oracleFeed = [
      {
        type: 'alpha',
        message:
          "Alpha Signal: Whale '0xab...c78' purchased 3 Launchpad Packs. Unusual activity.",
        icon: (
          <ShieldCheck
            className={`w-4 h-4 ${neon}`}
          />
        ),
      },
      {
        type: 'gravity',
        message:
          'Gravity Shift: Creator Y cluster has +200% XP flow. Hype cycle initiating.',
        icon: (
          <TrendingUp className="w-4 h-4 text-yellow-400" />
        ),
      },
      {
        type: 'burn',
        message:
          "Burn Event: High-volume wallet '0xde...f12' burned 50% of Creator Z tokens.",
        icon: (
          <Flame className="w-4 h-4 text-red-500" />
        ),
      },
      {
        type: 'quest',
        message:
          'Quest: New IRL Quest available: Check-in at ETH London Meetup!',
        icon: (
          <MapPin className="w-4 h-4 text-blue-400" />
        ),
      },
    ];

    return (
      <div className="space-y-6">
        {/* XP / SPN */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className={`${cardBg} ${borderColor} border p-4 rounded-xl text-center shadow-lg transition duration-200 hover:scale-[1.02]`}
          >
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              XP BALANCE
            </p>
            <p
              className={`text-4xl font-extrabold mt-1 ${neon}`}
            >
              {profileData.xpBalance.toLocaleString()}
            </p>
          </div>
          <div
            className={`${cardBg} ${borderColor} border p-4 rounded-xl text-center shadow-lg transition duration-200 hover:scale-[1.02]`}
          >
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              SPAWN TOKEN
            </p>
            <p
              className={`text-4xl font-extrabold mt-1 ${accentBlue}`}
            >
              {profileData.spawnTokenBalance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Streak */}
        <div
          className={`${cardBg} ${borderColor} border p-4 rounded-xl space-y-3 shadow-lg`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">
              Daily Streak: {profileData.streakDays} Days
            </h3>
            <button
              onClick={handleCheckIn}
              disabled={!streakReady}
              className={`px-4 py-2 rounded-full font-bold text-sm shadow-md transition ${
                streakReady
                  ? 'bg-[#00FFC0]/20 text-[#00FFC0] border border-[#00FFC0]'
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600 cursor-not-allowed'
              }`}
            >
              {streakReady ? 'Check In Now' : 'Check In'}
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Next check-in in:{' '}
            <span className="font-mono text-white">
              {timeRemainingText}
            </span>
          </p>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${neonBg} transition-all duration-1000`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <button className="w-full text-xs text-center text-red-400/80 hover:text-red-300 pt-1">
            <ShieldCheck className="w-3 h-3 inline-block mr-1" />
            Buy Streak Insurance (Pillar 3)
          </button>
        </div>

        {/* Oracle feed */}
        <div className="space-y-3">
          <h3
            className={`text-xl font-bold ${accentBlue} tracking-wider`}
          >
            Oracle Feed{' '}
            <span className="text-sm font-light text-gray-500">
              (Pillar 8)
            </span>
          </h3>
          <div className="space-y-2">
            {oracleFeed.map((item, i) => (
              <div
                key={i}
                className="flex items-start space-x-3 p-3 bg-gray-900 rounded-xl border border-gray-800 shadow-md"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <span className="text-sm text-gray-200">
                  {item.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const LootTab = () => {
    const getItemCount = (type) => {
      const item = inventory.find(
        (i) => i.id === type.toLowerCase()
      );
      return item ? item.count : 0;
    };

    const starterPack =
      inventory.find(
        (i) => i.id === 'startermeshpack'
      ) || {
        id: 'startermeshpack',
        count: 1,
        type: 'Starter Mesh Pack',
      };

    const fragments = getItemCount('Fragment');
    const shards = getItemCount('Shard');
    const relics = getItemCount('Relic');

    const handleSynthesis = async () => {
      if (!db || !userId) return;
      if (fragments < 3)
        return showToast(
          'Not enough Fragments (3 needed).',
          'error'
        );

      try {
        await runTransaction(db, async (tx) => {
          const fragRef = doc(
            db,
            getUserInventoryPath(userId),
            'fragment'
          );
          const shardRef = doc(
            db,
            getUserInventoryPath(userId),
            'shard'
          );

          tx.update(fragRef, { count: fragments - 3 });
          const shardDoc = await tx.get(shardRef);
          const currentShardCount = shardDoc.exists()
            ? shardDoc.data().count
            : 0;

          tx.set(
            shardRef,
            {
              type: 'Shard',
              count: currentShardCount + 1,
              lastAcquired: Timestamp.now(),
            },
            { merge: true }
          );

          showToast(
            'Synthesis successful! 3 Fragments → 1 Shard.',
            'success'
          );
        });
      } catch (e) {
        console.error('Synthesis failed:', e);
        showToast(
          'Synthesis failed. Please try again.',
          'error'
        );
      }
    };

    const handleEnterJackpot = () => {
      showToast(
        'Entered daily jackpot (mock). Onchain version hooks into Base later.',
        'success'
      );
    };

    return (
      <div className="space-y-6">
        {/* Sub-tabs top row (mock) */}
        <div className="flex justify-around bg-gray-900 p-1 rounded-xl border border-gray-700/50 shadow-inner text-xs">
          <button className="w-1/3 py-2 rounded-lg bg-[#00FFC0]/10 text-[#00FFC0] font-semibold">
            Packs
          </button>
          <button className="w-1/3 py-2 rounded-lg text-gray-400 hover:bg-gray-800">
            Pull Lab
          </button>
          <button className="w-1/3 py-2 rounded-lg text-gray-400 hover:bg-gray-800">
            Inventory
          </button>
        </div>

        {/* Starter pack */}
        <div
          className={`${cardBg} ${borderColor} border p-4 rounded-xl space-y-3 shadow-lg`}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-white">
              Starter Mesh Pack
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-700 text-white">
              ID: S001
            </span>
          </div>
          <p className="text-sm text-gray-400">
            A base pack with guaranteed Fragments and a chance
            for Shards. (Pillar 2)
          </p>
          <div className="flex justify-between items-center pt-2 border-t border-gray-800">
            <span
              className={`text-2xl font-extrabold ${neon}`}
            >
              {starterPack.count} available
            </span>
            <button
              onClick={() => handlePackOpen(starterPack.id)}
              disabled={starterPack.count <= 0}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                starterPack.count > 0
                  ? 'bg-[#00FFC0]/20 text-[#00FFC0] border border-[#00FFC0]/60 hover:bg-[#00FFC0]/40'
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600 cursor-not-allowed'
              }`}
            >
              Simulate Open
            </button>
          </div>
        </div>

        {/* Pull Lab */}
        <div
          className={`${cardBg} ${borderColor} border p-4 rounded-xl space-y-4 shadow-lg`}
        >
          <h3 className={`text-lg font-bold ${accentBlue}`}>
            Pull Lab (Synthesis)
          </h3>
          <p className="text-sm text-gray-400">
            Combine Fragments to synthesize rare Relics (Pillar
            2).
          </p>

          <div className="grid grid-cols-3 text-center text-sm pt-2 border-t border-gray-800/50">
            <div className="p-2 border-r border-gray-800">
              <p className="text-3xl font-bold text-white">
                {fragments}
              </p>
              <p className="text-xs text-gray-400">
                Fragments
              </p>
            </div>
            <div className="p-2 border-r border-gray-800">
              <p
                className={`text-3xl font-bold ${accentBlue}`}
              >
                {shards}
              </p>
              <p className="text-xs text-gray-400">Shards</p>
            </div>
            <div className="p-2">
              <p className="text-3xl font-bold text-red-400">
                {relics}
              </p>
              <p className="text-xs text-gray-400">Relics</p>
            </div>
          </div>

          <button
            onClick={handleSynthesis}
            disabled={fragments < 3}
            className={`w-full px-4 py-2 rounded-lg font-bold text-sm transition ${
              fragments >= 3
                ? 'bg-blue-600/30 text-blue-400 border border-blue-600 hover:bg-blue-600/50'
                : 'bg-gray-700/50 text-gray-400 border border-gray-600 cursor-not-allowed'
            }`}
          >
            Run Synthesis (3 Fragments → 1 Shard)
          </button>
        </div>

        {/* Daily Jackpot */}
        <div
          className={`${cardBg} ${borderColor} border p-4 rounded-xl space-y-3 shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center">
                <Gift className="w-4 h-4 mr-2 text-yellow-400" />
                Daily Jackpot · Mesh Pot
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Cheap entry in USDC or ETH on Base later. Right
                now: mock entry for UX.
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
              v0.1 mock
            </span>
          </div>
          <div className="flex justify-between items-center mt-2 text-sm">
            <div>
              <p className="text-gray-400 text-xs">
                Est. pool (mock)
              </p>
              <p className="text-xl font-bold text-green-400">
                123.45 ETH
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">
                Entries today (mock)
              </p>
              <p className="text-xl font-bold text-[#00A6FF]">
                3 842
              </p>
            </div>
          </div>
          <button
            onClick={handleEnterJackpot}
            className="w-full mt-2 py-2 rounded-lg text-sm font-semibold bg-purple-600/40 text-purple-100 border border-purple-500 hover:bg-purple-600/60 transition"
          >
            Enter Daily Jackpot (0.001 ETH · mock UX)
          </button>
        </div>
      </div>
    );
  };

  const QuestsTab = () => {
    const quests = [
      {
        type: 'Daily',
        title: 'Daily Check-in (Completed)',
        reward: 10,
        status: 'Completed',
      },
      {
        type: 'Daily',
        title: 'Open 1 Pack',
        reward: 25,
        status: 'Claimable',
      },
      {
        type: 'Weekly',
        title: '5 Day Streak Run',
        reward: 150,
        status: 'Locked',
      },
      {
        type: 'Weekly',
        title: 'Solve 1 SupCast Case',
        reward: 100,
        status: 'Claimable',
      },
      {
        type: 'IRL',
        title: 'Base Builders Meetup (Stockholm)',
        reward: 200,
        status: 'Locked',
      },
    ];

    const handleClaim = (title) => {
      showToast(
        `Reward for "${title}" claimed! +XP credited.`,
        'success'
      );
    };

    const getStatusStyle = (status) => {
      switch (status) {
        case 'Claimable':
          return 'bg-[#00FFC0]/20 text-[#00FFC0] border border-[#00FFC0]';
        case 'Completed':
          return 'bg-green-600/30 text-green-400 border border-green-600';
        case 'Locked':
        default:
          return 'bg-gray-700/50 text-gray-400 border border-gray-600';
      }
    };

    return (
      <div className="space-y-6">
        <h2 className={`text-2xl font-extrabold ${neon}`}>
          Quests Platform
        </h2>

        <div className="space-y-3">
          <h3 className={`text-lg font-bold ${accentBlue}`}>
            Daily Goals
          </h3>
          {quests
            .filter((q) => q.type === 'Daily')
            .map((quest, i) => (
              <div
                key={i}
                className={`${cardBg} ${borderColor} border p-3 rounded-xl flex justify-between items-center shadow-md`}
              >
                <div className="space-y-1">
                  <p className="font-semibold text-white">
                    {quest.title}
                  </p>
                  <p className="text-sm text-gray-400 flex items-center">
                    <Star className="w-3 h-3 mr-1 text-yellow-400" />
                    {quest.reward} XP Reward
                  </p>
                </div>
                <button
                  onClick={() =>
                    quest.status === 'Claimable' &&
                    handleClaim(quest.title)
                  }
                  disabled={quest.status !== 'Claimable'}
                  className={`px-3 py-1 text-xs rounded-full font-semibold border transition ${getStatusStyle(
                    quest.status
                  )}`}
                >
                  {quest.status}
                </button>
              </div>
            ))}
        </div>

        <div className="space-y-3">
          <h3 className={`text-lg font-bold ${accentBlue}`}>
            Weekly & IRL
          </h3>
          {quests
            .filter((q) => q.type !== 'Daily')
            .map((quest, i) => (
              <div
                key={i}
                className={`${cardBg} ${borderColor} border p-3 rounded-xl flex justify-between items-center shadow-md`}
              >
                <div className="space-y-1">
                  <p className="font-semibold text-white">
                    {quest.title}
                  </p>
                  <p className="text-sm text-gray-400 flex items-center">
                    <Star className="w-3 h-3 mr-1 text-yellow-400" />
                    {quest.reward} XP Reward
                  </p>
                </div>
                <button
                  onClick={() =>
                    quest.status === 'Claimable' &&
                    handleClaim(quest.title)
                  }
                  disabled={quest.status !== 'Claimable'}
                  className={`px-3 py-1 text-xs rounded-full font-semibold border transition ${getStatusStyle(
                    quest.status
                  )}`}
                >
                  {quest.status}
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
        name: 'Alpha Hunters',
        desc: 'Tracks wallets with high pack/relic activity and unusual buying patterns.',
        icon: ShieldCheck,
      },
      {
        id: 'new',
        name: 'New Creators',
        desc: 'Tracks newly deployed tokens/contracts via the Zero-Code Builder.',
        icon: Zap,
      },
      {
        id: 'gravity',
        name: 'Gravity Clusters',
        desc: 'Visualizes clusters of wallets with the highest XP flows and token holdings.',
        icon: Globe,
      },
    ];

    const [activeMode, setActiveMode] = useState(modes[0]);

    const legendItems = [
      { color: neon, name: 'XP Streams', icon: Activity },
      { color: accentBlue, name: 'Pack Pulls', icon: Box },
      {
        color: 'text-red-500',
        name: 'Burn Events',
        icon: Flame,
      },
      {
        color: 'text-yellow-400',
        name: 'Creator Coin Flows',
        icon: DollarSign,
      },
    ];

    return (
      <div className="space-y-6">
        <h2 className={`text-2xl font-extrabold ${neon}`}>
          Mesh Explorer
        </h2>

        <div className="space-y-4">
          <h3 className={`text-lg font-bold ${accentBlue}`}>
            Select Mesh Mode
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode)}
                className={`p-3 rounded-xl border transition shadow-md ${
                  activeMode.id === mode.id
                    ? 'border-[#00FFC0] bg-[#00FFC0]/15'
                    : `${borderColor} bg-gray-900 hover:border-gray-500`
                }`}
              >
                <mode.icon
                  className={`w-5 h-5 mx-auto mb-1 ${
                    activeMode.id === mode.id
                      ? neon
                      : 'text-gray-400'
                  }`}
                />
                <span className="text-xs font-semibold text-white">
                  {mode.name}
                </span>
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-500 p-3 border-l-4 border-[#00FFC0]/50 bg-gray-900/50 rounded-r-xl">
            <span className="font-semibold text-white mr-1">
              {activeMode.name}:
            </span>
            {activeMode.desc}
          </div>
        </div>

        <div
          className={`${cardBg} ${borderColor} border p-4 rounded-xl space-y-3 shadow-lg`}
        >
          <h3 className={`text-lg font-bold ${accentBlue}`}>
            Legend (Flows)
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {legendItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center space-x-2"
              >
                <item.icon
                  className={`w-4 h-4 ${
                    item.color.includes('text-')
                      ? item.color
                      : neon
                  }`}
                />
                <span className="text-gray-300">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-48 w-full bg-gray-900/50 rounded-xl border border-gray-700 flex items-center justify-center shadow-inner">
          <p className="text-gray-500 text-sm italic">
            3D WebGL Mesh Simulation Placeholder
          </p>
        </div>

        <button className="w-full py-3 bg-blue-600/30 rounded-xl font-semibold text-blue-400 border border-blue-600 hover:bg-blue-600/50 transition shadow-lg text-sm">
          Open Full Mesh Explorer (v2.0 UI)
        </button>
      </div>
    );
  };

  const SupportTab = () => {
    const userProfile = { solved: 7, xp: 350, rating: 4.5 };

    const handleSendChat = () => {
      const text = newChatMessage.trim();
      if (!text) return;
      const msg = {
        id: Date.now(),
        user: '@you',
        kind: 'user',
        text,
        ts: new Date().toLocaleTimeString('sv-SE', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setChatMessages((prev) => [...prev, msg]);
      setNewChatMessage('');
    };

    const handleGenerateSuggestion = () => {
      const latest =
        supCastFeed.length > 0 ? supCastFeed[0] : null;

      const baseTopic = latest
        ? latest.title.toLowerCase()
        : 'base wallet routing between Zora, Vibe and Farcaster frames';

      const suggestions = [
        `Visual map of ${baseTopic} on Base, clean diagram UI`,
        `Cinematic dashboard for tracking ${baseTopic} in neon HUD style`,
        `Minimalist onchain activity feed for ${baseTopic}, mobile app UI`,
        `Isometric Base control room monitoring ${baseTopic}`,
        `XP quest screen gamifying ${baseTopic} across creator tokens`,
      ];

      const choice =
        suggestions[Math.floor(Math.random() * suggestions.length)];
      setAiSuggestion(choice);
      showToast('AI mesh helper generated a concept.', 'success');
    };

    const categoryLabel = (cat) => {
      switch (cat) {
        case 'tokens':
          return 'Tokens & liquidity';
        case 'packs':
          return 'Packs & odds';
        case 'infra':
          return 'Infra / RPC / gas';
        case 'frames':
          return 'Frames & miniapps';
        case 'ux':
          return 'UX / bugs / flows';
        default:
          return 'Other';
      }
    };

    return (
      <div className="space-y-4">
        <h2
          className={`${neon} text-sm font-semibold uppercase tracking-wide`}
        >
          SupCast · Base help desk
        </h2>

        {/* Row 1: Ask Base + AI helper */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Ask */}
          <div
            className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl space-y-2.5 shadow-md`}
          >
            <h3 className={`${accentBlue} text-xs font-semibold`}>
              Ask Base (any topic)
            </h3>
            <p className="text-[11px] text-gray-400">
              Wallets, bridges, creator tokens, packs, frames,
              infra, UX. If it touches Base, it belongs here.
            </p>

            <div className="flex gap-1.5 text-[11px]">
              <select
                value={newCaseCategory}
                onChange={(e) =>
                  setNewCaseCategory(e.target.value)
                }
                className="flex-1 px-2 py-1.5 rounded-lg bg-[#101018] border border-gray-700 text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#00FFC0]"
              >
                <option value="tokens">Tokens / markets</option>
                <option value="packs">Packs / odds</option>
                <option value="infra">Infra / gas / RPC</option>
                <option value="frames">Frames / miniapps</option>
                <option value="ux">UX / bugs / flows</option>
              </select>
              <span className="px-2 py-1.5 rounded-lg bg-[#101018] border border-gray-700 text-[10px] text-gray-400 flex items-center">
                <Globe className="w-3.5 h-3.5 mr-1 text-[#00FFC0]" />
                Base-wide
              </span>
            </div>

            <input
              type="text"
              placeholder="Short title: e.g. 'Bridge stuck from mainnet to Base'"
              value={newCaseTitle}
              onChange={(e) => setNewCaseTitle(e.target.value)}
              className="w-full px-2.5 py-1.75 bg-[#101018] rounded-lg border border-gray-700 text-[12px] text-white focus:outline-none focus:ring-1 focus:ring-[#00FFC0]"
            />

            <textarea
              placeholder="Describe what happened, tools you used (Zora, Vibe, Base app, frame, etc.)"
              value={newCaseDesc}
              onChange={(e) => setNewCaseDesc(e.target.value)}
              className="w-full px-2.5 py-1.75 bg-[#101018] rounded-lg border border-gray-700 h-20 text-[12px] text-white resize-none focus:outline-none focus:ring-1 focus:ring-[#00FFC0]"
            />

            <button
              onClick={handlePostCase}
              disabled={
                !newCaseTitle || !newCaseDesc || isPostingCase
              }
              className={`w-full py-2.25 rounded-lg font-semibold text-[11px] border transition ${
                !newCaseTitle || !newCaseDesc || isPostingCase
                  ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                  : 'bg-red-600/30 border-red-700 text-red-300 hover:bg-red-600/50'
              }`}
            >
              {isPostingCase
                ? 'Posting...'
                : 'Post to SupCast mesh'}
            </button>
          </div>

          {/* AI helper */}
          <div
            className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl space-y-2.5 shadow-md`}
          >
            <h3 className={`${accentBlue} text-xs font-semibold`}>
              AI mesh helper (mock)
            </h3>
            <p className="text-[11px] text-gray-400">
              Takes the latest Base problem and turns it into a
              visual or UX concept you can build, cast or mint.
            </p>

            <button
              onClick={handleGenerateSuggestion}
              className="w-full px-3 py-2 rounded-xl text-[11px] font-semibold bg-pink-600/30 text-pink-200 border border-pink-600 hover:bg-pink-600/50 transition"
            >
              Generate concept from latest SupCast
            </button>

            {aiSuggestion && (
              <div className="bg-[#101018] p-2.5 rounded-xl border-l-4 border-pink-500 mt-2">
                <p className="text-[11px] text-gray-300">
                  Concept:
                </p>
                <p className="text-[11px] font-mono text-pink-300 break-words mt-1">
                  {aiSuggestion}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Copy this into MidJourney, Sora, Figma, or a new
                  quest.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Row 2: Live questions */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className={`${accentBlue} text-xs font-semibold`}>
              Live Base questions ({supCastFeed.length})
            </h3>
            <span className="text-[10px] text-gray-500">
              Sorted by latest
            </span>
          </div>

          {supCastFeed.length === 0 ? (
            <div className="px-3 py-3 bg-[#101018] text-[11px] text-gray-500 rounded-2xl border border-gray-800 text-center">
              No open cases yet. First wave of Base questions will
              show up here.
            </div>
          ) : (
            supCastFeed.map((item) => (
              <div
                key={item.id}
                className="px-3 py-2.5 bg-[#101018] rounded-2xl border border-gray-800 flex justify-between items-start shadow-sm"
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[10px] font-mono text-gray-500">
                      {item.posterHandle || '@mesh-user'} (
                      {item.posterId?.substring(0, 4) || '0000'}
                      ...)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#101018] border border-gray-700 text-gray-300">
                      {categoryLabel(item.category || 'tokens')}
                    </span>
                  </div>
                  <p className="text-[12px] font-semibold text-white mt-0.5">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
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
            ))
          )}
        </section>

        {/* Row 3: Chat + profile */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Chat */}
          <div
            className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl flex flex-col space-y-2 shadow-md`}
          >
            <h3 className={`${accentBlue} text-xs font-semibold`}>
              Base mesh chat (local mock)
            </h3>
            <div className="flex-1 min-h-[120px] max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.kind === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-[11px] shadow ${
                      m.kind === 'user'
                        ? 'bg-[#00FFC0]/20 text-white'
                        : 'bg-[#101018] text-gray-100 border border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[9px] font-mono opacity-80">
                        {m.user}
                      </span>
                      <span className="text-[9px] opacity-60">
                        {m.ts}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">
                      {m.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center mt-1">
              <input
                type="text"
                value={newChatMessage}
                onChange={(e) =>
                  setNewChatMessage(e.target.value)
                }
                placeholder="Quick Base question / comment..."
                className="flex-grow px-2.5 py-1.5 rounded-l-lg bg-[#101018] border border-gray-700 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-[#00FFC0]"
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
              Local demo chat. Later wired to a real public Base
              room.
            </p>
          </div>

          {/* Profile */}
          <div
            className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl text-center space-y-2 shadow-md`}
          >
            <h3 className={`${neon} text-xs font-semibold`}>
              Your SupCast profile
            </h3>
            <div className="flex justify-around text-center mt-1">
              <div>
                <p
                  className={`${neon} text-xl font-extrabold`}
                >
                  {userProfile.xp}
                </p>
                <p className="text-[10px] text-gray-400">
                  Support XP
                </p>
              </div>
              <div>
                <p
                  className={`${accentBlue} text-xl font-extrabold`}
                >
                  {userProfile.solved}
                </p>
                <p className="text-[10px] text-gray-400">
                  Solved
                </p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-yellow-400">
                  {userProfile.rating}
                </p>
                <p className="text-[10px] text-gray-400">
                  Rating
                </p>
              </div>
            </div>
            <p className="text-[10px] text-gray-500">
              Later this ties into real XP payouts, bounties and
              Base-wide reputation.
            </p>
          </div>
        </section>
      </div>
    );
  };

  // --- NAV & SHEETS ---
  const NavItem = ({ icon: Icon, tabName, label }) => (
    <button
      onClick={() => setCurrentTab(tabName)}
      className={`flex flex-col items-center p-2 rounded-lg transition ${
        currentTab === tabName
          ? neon
          : 'text-gray-500 hover:text-white'
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs mt-0.5">{label}</span>
    </button>
  );

  const Sheet = ({ id, title, children }) => (
    <div
      className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm h-[90vh] ${darkBg} rounded-t-3xl shadow-2xl transition-transform duration-500 ease-out z-50 overflow-y-auto p-4 sm:max-w-md ${
        activeSheet === id
          ? 'translate-y-0'
          : 'translate-y-full'
      }`}
    >
      <div
        className="w-full flex justify-center py-2 cursor-pointer"
        onClick={() => setActiveSheet(null)}
      >
        <div className="h-1.5 w-12 bg-gray-600 rounded-full"></div>
      </div>
      <div className="p-2">
        <h2 className={`text-2xl font-bold mb-6 ${neon}`}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );

  const SheetAccount = () => (
    <Sheet id="account" title="Account & Rewards">
      <div
        className={`${cardBg} ${borderColor} border p-4 rounded-xl flex items-center space-x-4 mb-6 shadow-lg`}
      >
        <User className={`w-8 h-8 ${neon}`} />
        <div>
          <p className="text-base font-semibold text-white">
            @spawniz
          </p>
          <p className="text-sm text-gray-400">
            Mesh ID:{' '}
            {userId
              ? `${userId.substring(
                  0,
                  4
                )}...${userId.substring(
                  userId.length - 4
                )}`
              : 'Loading...'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Full ID:{' '}
            <span className="font-mono">
              {userId || 'N/A'}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          className={`${cardBg} ${borderColor} border p-3 rounded-xl shadow-md`}
        >
          <p className="text-sm text-gray-400">Total XP</p>
          <p
            className={`text-2xl font-bold ${neon}`}
          >
            {profileData.xpBalance.toLocaleString()}
          </p>
        </div>
        <div
          className={`${cardBg} ${borderColor} border p-3 rounded-xl shadow-md`}
        >
          <p className="text-sm text-gray-400">
            SPN Balance
          </p>
          <p
            className={`text-2xl font-bold ${accentBlue}`}
          >
            {profileData.spawnTokenBalance.toFixed(2)}
          </p>
        </div>
      </div>

      <div
        className={`${cardBg} ${borderColor} border p-4 rounded-xl space-y-3 shadow-lg`}
      >
        <h3 className={`text-lg font-semibold ${accentBlue}`}>
          Referral System (Pillar 9)
        </h3>
        <p className="text-sm text-gray-400">
          Share your unique code for XP bonuses and Mesh
          earnings.
        </p>
        <div className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
          <span
            className={`font-mono ${neon} text-sm`}
          >
            SPAWN-MESH-74F
          </span>
          <button className="text-xs px-3 py-1 rounded-full font-semibold bg-[#00FFC0]/20 text-[#00FFC0] border border-[#00FFC0] hover:bg-[#00FFC0]/40 transition">
            Copy
          </button>
        </div>
      </div>

      <button className="w-full py-3 mt-8 bg-red-700/50 rounded-xl font-semibold border border-red-700 text-white/80 hover:bg-red-700/70 transition flex items-center justify-center">
        <LogOut className="w-5 h-5 mr-2" />
        Switch Wallet / Logout
      </button>
    </Sheet>
  );

  const SheetSettings = () => (
    <Sheet id="settings" title="Settings & API">
      <div className="space-y-4">
        <div
          className={`${cardBg} ${borderColor} border p-4 rounded-xl space-y-2 shadow-lg`}
        >
          <h3 className={`text-lg font-semibold ${accentBlue}`}>
            XP SDK & Integration (Pillar 1)
          </h3>
          <p className="text-sm text-gray-400">
            Manage API keys to integrate SpawnEngine XP into your
            own apps.
          </p>
          <button className="w-full py-2.5 bg-[#00FFC0]/20 rounded-xl font-semibold text-[#00FFC0] border border-[#00FFC0] hover:bg-[#00FFC0]/40 transition text-sm">
            Show API Key
          </button>
        </div>

        <div
          className={`${cardBg} ${borderColor} border p-4 rounded-xl space-y-2 shadow-lg`}
        >
          <h3 className={`text-lg font-semibold ${accentBlue}`}>
            Premium Mesh Filters (Pillar 4)
          </h3>
          <p className="text-sm text-gray-400">
            Unlock Alpha Hunters and Whale Tracking. Requires
            500 SPN staking.
          </p>
          <button className="w-full py-2.5 bg-gray-700/50 rounded-xl font-semibold text-gray-400 border border-gray-700/50 cursor-not-allowed text-sm">
            Upgrade to Premium
          </button>
        </div>

        <div
          className={`${cardBg} ${borderColor} border p-4 rounded-xl space-y-2 shadow-lg`}
        >
          <h3 className={`text-lg font-semibold ${accentBlue}`}>
            Launchpad Builder (Pillar 8)
          </h3>
          <p className="text-sm text-gray-400">
            Access the Zero-Code Token/NFT Builder and Bonding
            Curve configuration.
          </p>
          <button className="w-full py-2.5 bg-blue-600/30 rounded-xl font-semibold text-blue-400 border border-blue-600/50 hover:bg-blue-600/50 transition text-sm">
            Open Creator Panel
          </button>
        </div>

        <button className="w-full py-3 mt-6 bg-gray-800 rounded-xl font-semibold border border-gray-700 text-gray-300 hover:bg-gray-700 transition">
          Manage Notifications
        </button>
      </div>
    </Sheet>
  );

  // --- MAIN CONTENT ROUTER ---
  const renderTabContent = () => {
    if (!isAuthReady || isLoading) {
      return (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FFC0]"></div>
          <p className="ml-3 text-white">
            Loading Mesh Data...
          </p>
        </div>
      );
    }

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

  // --- MAIN RENDER ---
  return (
    <div className={`min-h-screen ${darkBg} flex justify-center`}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
          body { font-family: 'Inter', sans-serif; }
          #app-container {
            width: 100%;
            max-width: 480px;
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
          }
          button:disabled { cursor: not-allowed; opacity: 0.7; }
        `}
      </style>

      <ToastComponent />

      <div
        id="app-container"
        className="relative pt-4 px-4 pb-20 flex flex-col"
      >
        {/* Header */}
        <header className="mb-6 space-y-3">
          <div className="flex justify-between items-center">
            {/* Avatar chip */}
            <button
              onClick={() => setActiveSheet('account')}
              className={`flex items-center space-x-3 p-2 rounded-full ${cardBg} border ${borderColor} transition hover:border-[#00FFC0]`}
            >
              <div className="w-8 h-8 bg-[#9A00FF] rounded-full flex items-center justify-center text-sm font-bold text-white shadow-xl">
                S
              </div>
              <div>
                <div className="text-base font-semibold text-white">
                  @spawniz
                </div>
                <div className="text-xs text-gray-400">
                  Mesh ID · Creator
                </div>
              </div>
            </button>

            {/* Status + settings */}
            <div className="flex space-x-2 items-center">
              <span
                className={`w-2 h-2 rounded-full ${neonBg}`}
              ></span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#00FFC0]/10 text-[#00FFC0] border border-[#00FFC0]/50 shadow-md">
                Mesh v1.0 PRO
              </span>
              <button
                onClick={() => setActiveSheet('settings')}
                className="text-gray-400 hover:text-white transition p-2 rounded-full hover:bg-gray-800"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Badges + status row */}
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-1.5">
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#00FFC0]/10 text-[#00FFC0] border border-[#00FFC0]/50">
                BASE · Ecosystem
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/50">
                Farcaster Ready
              </span>
            </div>
            <div className="flex justify-between text-xs font-mono text-gray-500 border-t border-b border-gray-800 py-1.5 px-1">
              <span>
                GAS:{' '}
                <span className="text-white">0.05 Gwei</span>
              </span>
              <span>
                MODE:{' '}
                <span className="text-white">
                  Alpha Hunter
                </span>
              </span>
              <span>
                WALLETS:{' '}
                <span className="text-white">420k+</span>
              </span>
            </div>
          </div>
        </header>

        {/* Main */}
        <main id="tab-content" className="flex-grow pb-4">
          {renderTabContent()}
        </main>

        {/* Bottom nav */}
        <nav
          id="bottom-nav"
          className={`fixed bottom-0 w-full max-w-sm sm:max-w-md ${darkBg} flex justify-around items-center h-16 px-2 border-t border-gray-800 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]`}
        >
          <NavItem icon={Home} tabName="home" label="Home" />
          <NavItem icon={Box} tabName="loot" label="Loot" />
          <NavItem
            icon={Sword}
            tabName="quests"
            label="Quests"
          />
          <NavItem
            icon={Hexagon}
            tabName="mesh"
            label="Mesh"
          />
          <NavItem
            icon={MessageSquare}
            tabName="support"
            label="SupCast"
          />
        </nav>

        {/* Sheets */}
        <SheetAccount />
        <SheetSettings />
      </div>
    </div>
  );
};

export default App;