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
  User,
  LogOut,
  ShieldCheck,
  Globe,
  DollarSign,
  Activity,
  MapPin,
  MessageSquare,
  X,
} from 'lucide-react';

// --- GLOBAL FIREBASE CONFIGURATION (Provided by Environment) ---
const appId =
  typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(
  typeof __firebase_config !== 'undefined' ? __firebase_config : '{}'
);
const initialAuthToken =
  typeof __initial_auth_token !== 'undefined'
    ? __initial_auth_token
    : null;

// Firestore path helpers
const getUserProfilePath = (userId) =>
  `artifacts/${appId}/users/${userId}/spawn_data/profile`;
const getUserInventoryPath = (userId) =>
  `artifacts/${appId}/users/${userId}/spawn_data/inventory`;
const getPublicSupCastCollectionPath = () =>
  `artifacts/${appId}/public/data/supcast_cases`;

const App = () => {
  // --- STATE ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentTab, setCurrentTab] = useState('home');
  const [activeSheet, setActiveSheet] = useState(null); // 'account' | 'settings'
  const [toast, setToast] = useState(null);

  const [profileData, setProfileData] = useState({
    xpBalance: 0,
    spawnTokenBalance: 0.0,
    streakDays: 0,
    lastCheckIn: null,
  });
  const [inventory, setInventory] = useState([]);
  const [supCastFeed, setSupCastFeed] = useState([]);

  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [isPostingCase, setIsPostingCase] = useState(false);

  // --- THEME ---
  const neon = 'text-[#00FFC0]';
  const neonBg = 'bg-[#00FFC0]';
  const neonShadow =
    'shadow-[0_0_15px_rgba(0,255,192,0.25)]';
  const accentBlue = 'text-[#00A6FF]';
  const darkBg = 'bg-[#050509]';
  const cardBg = 'bg-[#11111A]';
  const borderColor = 'border-[#252535]';

  // --- TOASTS ---
  const showToast = useCallback((message, type = 'info') => {
    let color = 'bg-[#00FFC0]/90';
    if (type === 'error') color = 'bg-red-600/90';
    if (type === 'success') color = 'bg-[#00FFC0]/90';
    if (type === 'info') color = 'bg-[#00A6FF]/90';

    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const ToastComponent = () =>
    toast && (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs transition-all duration-300">
        <div
          className={`px-3 py-2 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold text-gray-900 backdrop-blur-sm ${toast.color}`}
        >
          {toast.message}
        </div>
      </div>
    );

  // --- FIREBASE INIT ---
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const firestoreInstance = getFirestore(app);
      setDb(firestoreInstance);
      setAuth(authInstance);

      const unsub = onAuthStateChanged(
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
                'Authentication failed. Running in local mode.',
                'error'
              );
              setIsAuthReady(true);
            }
          }
        }
      );

      return () => unsub();
    } catch (e) {
      console.error('Firebase Initialization Error:', e);
      // Kör ändå UI i "offline/mock"
      setIsAuthReady(true);
    }
  }, [showToast]);

  // --- SNAPSHOTS (om Firebase funkar) ---
  useEffect(() => {
    if (!isAuthReady || !userId || !db) return;

    // Profile
    const profileRef = doc(db, getUserProfilePath(userId));
    const unsubProfile = onSnapshot(
      profileRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setProfileData((prev) => ({
            ...prev,
            xpBalance: data.xpBalance || 0,
            spawnTokenBalance: data.spawnTokenBalance || 0.0,
            streakDays: data.streakDays || 0,
            lastCheckIn:
              data.lastCheckIn instanceof Timestamp
                ? data.lastCheckIn.toDate()
                : null,
          }));
        } else {
          const initialData = {
            xpBalance: 100,
            spawnTokenBalance: 5.0,
            streakDays: 1,
            lastCheckIn: Timestamp.now(),
          };
          setDoc(profileRef, initialData).then(() => {
            setProfileData({
              ...initialData,
              lastCheckIn: new Date(),
            });
            showToast(
              'Welcome to SpawnEngine! Initial XP & SPN credited.',
              'success'
            );
          });
        }
      },
      (err) => {
        console.error('Profile Snapshot Error:', err);
        showToast('Error loading profile data.', 'error');
      }
    );

    // Inventory
    const invCol = collection(
      db,
      getUserInventoryPath(userId)
    );
    const unsubInv = onSnapshot(
      invCol,
      (snap) => {
        const inv = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setInventory(inv);
      },
      (err) => {
        console.error('Inventory Snapshot Error:', err);
        showToast('Error loading inventory.', 'error');
      }
    );

    // SupCast
    const supCol = collection(
      db,
      getPublicSupCastCollectionPath()
    );
    const unsubSup = onSnapshot(
      supCol,
      (snap) => {
        const feed = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        feed.sort(
          (a, b) =>
            (b.timestamp?.toDate()?.getTime() || 0) -
            (a.timestamp?.toDate()?.getTime() || 0)
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

  // --- HELPERS ---
  const formatTimeRemaining = (lastCheckIn) => {
    if (!lastCheckIn) return 'Ready now';
    const next =
      lastCheckIn.getTime() + 24 * 60 * 60 * 1000;
    const diff = next - Date.now();
    if (diff <= 0) return 'Ready now';

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor(
      (diff % (1000 * 60 * 60)) / (1000 * 60)
    );
    return `${h}h ${m}m`;
  };

  const streakReady = useMemo(() => {
    if (!profileData.lastCheckIn) return true;
    return (
      Date.now() -
        profileData.lastCheckIn.getTime() >=
      24 * 60 * 60 * 1000
    );
  }, [profileData.lastCheckIn]);

  const streakHoursLeft = useMemo(() => {
    if (!profileData.lastCheckIn) return 0;
    const next =
      profileData.lastCheckIn.getTime() +
      24 * 60 * 60 * 1000;
    const diff = next - Date.now();
    if (diff <= 0) return 24;
    return 24 - diff / (1000 * 60 * 60);
  }, [profileData.lastCheckIn]);

  // --- CORE ACTIONS ---
  const handleCheckIn = useCallback(async () => {
    if (!db || !userId) {
      // Lokal mock bara
      const now = new Date();
      const last = profileData.lastCheckIn;
      const ready =
        !last ||
        now.getTime() - last.getTime() >=
          24 * 60 * 60 * 1000;
      if (!ready) {
        return showToast(
          'Daily check-in already used (mock).',
          'info'
        );
      }
      const newStreak = (profileData.streakDays || 0) + 1;
      const reward = 50 + (newStreak - 1) * 5;
      setProfileData((prev) => ({
        ...prev,
        streakDays: newStreak,
        xpBalance: prev.xpBalance + reward,
        lastCheckIn: now,
      }));
      return showToast(
        `Day ${newStreak} check-in (mock): +${reward} XP`,
        'success'
      );
    }

    const profileRef = doc(db, getUserProfilePath(userId));
    const now = new Date();
    const last = profileData.lastCheckIn;

    const ready =
      !last ||
      now.getTime() - last.getTime() >=
        24 * 60 * 60 * 1000;

    if (!ready) {
      const remaining =
        last.getTime() +
        24 * 60 * 60 * 1000 -
        now.getTime();
      const h = Math.floor(
        remaining / (1000 * 60 * 60)
      );
      const m = Math.floor(
        (remaining % (1000 * 60 * 60)) /
          (1000 * 60)
      );
      return showToast(
        `Next check-in in ${h}h ${m}m.`,
        'info'
      );
    }

    try {
      await runTransaction(db, async (tx) => {
        const profileDoc = await tx.get(profileRef);
        if (!profileDoc.exists())
          throw new Error('Profile missing');

        const data = profileDoc.data();
        let newStreak = data.streakDays || 0;
        let newXp = data.xpBalance || 0;
        const reward = 50 + newStreak * 5;

        const keepStreak =
          !last ||
          now.getTime() - last.getTime() <
            48 * 60 * 60 * 1000;

        if (keepStreak) {
          newStreak += 1;
        } else {
          newStreak = 1;
          showToast(
            'Streak lost, reset to Day 1.',
            'error'
          );
        }

        newXp += reward;

        tx.update(profileRef, {
          streakDays: newStreak,
          xpBalance: newXp,
          lastCheckIn: Timestamp.now(),
        });
        showToast(
          `Day ${newStreak} check-in: +${reward} XP`,
          'success'
        );
      });
    } catch (e) {
      console.error('Check-in failed:', e);
      showToast(
        'Check-in failed. Please try again.',
        'error'
      );
    }
  }, [db, userId, profileData.lastCheckIn, profileData.streakDays, profileData.xpBalance, showToast]);

  const handlePackOpen = useCallback(
    async (packId) => {
      if (!db || !userId) {
        // Lokal mock – bränn 1 pack och ge fragment/shard
        const starter =
          inventory.find(
            (i) => i.id === packId
          ) || {
            id: packId,
            count: 1,
            type: 'Starter Mesh Pack',
          };
        if (starter.count <= 0) {
          return showToast(
            'No packs left to open (mock).',
            'error'
          );
        }
        const r = Math.random();
        let rewardText = '';
        let xpReward = 0;
        let type = '';
        let amount = 0;

        if (r < 0.05) {
          type = 'Relic';
          amount = 1;
          xpReward = 500;
          rewardText =
            'MYTHIC DROP! +1 Relic & 500 XP (mock).';
        } else if (r < 0.25) {
          type = 'Shard';
          amount = 1;
          xpReward = 100;
          rewardText = '+1 Shard & 100 XP (mock).';
        } else {
          type = 'Fragment';
          amount = Math.floor(Math.random() * 3) + 1;
          xpReward = 25;
          rewardText = `+${amount} Fragments & 25 XP (mock).`;
        }

        // uppdatera inventory/xp lokalt
        const newInv = inventory.map((it) =>
          it.id === packId
            ? { ...it, count: Math.max(0, (it.count || 0) - 1) }
            : it
        );
        // lägg till loot
        const lowerId = type.toLowerCase();
        const existing = newInv.find((i) => i.id === lowerId);
        if (existing) {
          existing.count = (existing.count || 0) + amount;
        } else {
          newInv.push({
            id: lowerId,
            type,
            count: amount,
            lastAcquired: new Date(),
          });
        }

        setInventory(newInv);
        setProfileData((prev) => ({
          ...prev,
          xpBalance: prev.xpBalance + xpReward,
        }));
        return showToast(rewardText, 'success');
      }

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

          if (
            !packDoc.exists() ||
            packDoc.data().count <= 0
          ) {
            throw new Error(
              'Pack not found or count is zero.'
            );
          }
          if (!profileDoc.exists()) {
            throw new Error('Profile not found.');
          }

          const currentPacks = packDoc.data().count;
          const currentXP =
            profileDoc.data().xpBalance || 0;

          const r = Math.random();
          let rewardText = '';
          let xpReward = 0;
          let itemType = null;
          let itemAmount = 0;

          if (r < 0.05) {
            itemType = 'Relic';
            itemAmount = 1;
            xpReward = 500;
            rewardText =
              'MYTHIC DROP! +1 Relic & 500 XP.';
          } else if (r < 0.25) {
            itemType = 'Shard';
            itemAmount = 1;
            xpReward = 100;
            rewardText = '+1 Shard & 100 XP.';
          } else {
            itemType = 'Fragment';
            itemAmount =
              Math.floor(Math.random() * 3) + 1;
            xpReward = 25;
            rewardText = `+${itemAmount} Fragments & 25 XP.`;
          }

          tx.update(packRef, {
            count: currentPacks - 1,
          });

          tx.update(profileRef, {
            xpBalance: currentXP + xpReward,
          });

          const itemRef = doc(
            db,
            getUserInventoryPath(userId),
            itemType.toLowerCase()
          );
          const itemSnap = await tx.get(itemRef);
          const currentCount = itemSnap.exists()
            ? itemSnap.data().count
            : 0;

          tx.set(
            itemRef,
            {
              type: itemType,
              count: currentCount + itemAmount,
              lastAcquired: Timestamp.now(),
            },
            { merge: true }
          );

          showToast(rewardText, 'success');
        });
      } catch (e) {
        console.error('Pack open failed:', e);
        showToast(
          `Open failed: ${e.message}`,
          'error'
        );
      }
    },
    [db, userId, inventory, showToast]
  );

  const handlePostCase = useCallback(
    async () => {
      if (!newCaseTitle || !newCaseDesc)
        return showToast(
          'Title and description required.',
          'error'
        );

      if (!db || !userId) {
        // Lokal mock
        const localCase = {
          id: `local-${Date.now()}`,
          title: newCaseTitle,
          description: newCaseDesc,
          status: 'Open',
          posterId: 'local',
          expertId: null,
          timestamp: { toDate: () => new Date() },
          posterHandle: '@local-mesh',
        };
        setSupCastFeed((prev) => [
          localCase,
          ...prev,
        ]);
        setNewCaseTitle('');
        setNewCaseDesc('');
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
        };
        await addDoc(supCol, newCase);
        setNewCaseTitle('');
        setNewCaseDesc('');
        showToast(
          'Question posted to SupCast network!',
          'success'
        );
      } catch (e) {
        console.error('Post case failed:', e);
        showToast(
          'Failed to post case. Check network.',
          'error'
        );
      } finally {
        setIsPostingCase(false);
      }
    },
    [db, userId, newCaseTitle, newCaseDesc, showToast]
  );

  // --- TABS ---

  const HomeTab = () => {
    const timeRemainingText = formatTimeRemaining(
      profileData.lastCheckIn
    );
    const progressPercent = Math.min(
      100,
      (streakHoursLeft / 24) * 100
    );

    const meshOverview = [
      {
        label: 'Active wallets',
        value: '4',
        sub: 'Mesh linked',
      },
      {
        label: 'Creator tokens',
        value: '12',
        sub: 'Tracked',
      },
      {
        label: 'Packs opened',
        value: '31',
        sub: 'Last 7 days',
      },
      {
        label: 'SupCast cases',
        value: supCastFeed.length.toString(),
        sub: 'Open',
      },
    ];

    const gasInfo = {
      base: {
        low: '0.05',
        avg: '0.09',
        high: '0.14',
      },
      pnl: {
        profit30d: '+1.24 ETH',
        fees30d: '0.31 ETH',
        hitRate: '62%',
      },
    };

    const oracleFeed = [
      {
        message:
          "Alpha: wallet '0xab...c78' ramped pack volume by 220%.",
        icon: (
          <ShieldCheck className="w-3.5 h-3.5 text-[#00FFC0]" />
        ),
      },
      {
        message:
          'Gravity: Creator mesh Y is pulling fresh liquidity on Base.',
        icon: (
          <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
        ),
      },
      {
        message:
          "Burn: wallet '0xde...f12' reduced supply by 18% in 24h.",
        icon: (
          <Flame className="w-3.5 h-3.5 text-red-500" />
        ),
      },
      {
        message:
          'Quest: 1 SupCast solve + 1 pack open today = bonus XP.',
        icon: (
          <MapPin className="w-3.5 h-3.5 text-blue-400" />
        ),
      },
    ];

    return (
      <div className="space-y-4">
        {/* Mesh overview */}
        <section
          className={`${cardBg} ${borderColor} border px-3 py-2.5 rounded-2xl shadow-lg`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Hexagon className="w-4 h-4 text-[#00FFC0]" />
              <h2 className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
                Mesh overview
              </h2>
            </div>
            <span className="text-[10px] font-mono text-gray-500">
              Phase 1 · HUD v0.2
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {meshOverview.map((item, idx) => (
              <div
                key={idx}
                className="px-2.5 py-2 rounded-xl bg-[#171722] border border-[#26263A] flex flex-col gap-0.5"
              >
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                  {item.label}
                </span>
                <span
                  className={`text-lg font-bold leading-none ${neon}`}
                >
                  {item.value}
                </span>
                <span className="text-[10px] text-gray-500">
                  {item.sub}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* XP / SPN */}
        <section className="grid grid-cols-2 gap-2">
          <div
            className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl text-center shadow-md transition hover:scale-[1.01] ${neonShadow}`}
          >
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              Mesh XP
            </p>
            <p
              className={`text-2xl sm:text-3xl font-extrabold mt-1 ${neon}`}
            >
              {profileData.xpBalance.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              Quests · packs · automations
            </p>
          </div>
          <div
            className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl text-center shadow-md transition hover:scale-[1.01]`}
          >
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              SPN balance
            </p>
            <p
              className={`text-2xl sm:text-3xl font-extrabold mt-1 ${accentBlue}`}
            >
              {profileData.spawnTokenBalance.toFixed(2)}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              Future mesh rewards
            </p>
          </div>
        </section>

        {/* Streak */}
        <section
          className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl space-y-2.5 shadow-md`}
        >
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                Daily streak
              </span>
              <span className="text-sm font-semibold text-white">
                {profileData.streakDays} days active
              </span>
            </div>
            <button
              onClick={handleCheckIn}
              disabled={!streakReady}
              className={`px-3 py-1.5 rounded-full font-semibold text-[11px] border transition ${
                streakReady
                  ? `${neonBg}/10 ${neon} border-[#00FFC0] hover:bg-[#00FFC0]/30`
                  : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
              }`}
            >
              {streakReady ? 'Check in now' : 'Check in'}
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            Next check-in:{' '}
            <span className="font-mono text-gray-200">
              {timeRemainingText}
            </span>
          </p>
          <div className="w-full bg-gray-900 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${neonBg} transition-all duration-1000`}
              style={{
                width: `${progressPercent}%`,
              }}
            ></div>
          </div>
          <button className="w-full text-[11px] text-center text-red-400/80 hover:text-red-300 pt-1 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Preview streak insurance module</span>
          </button>
        </section>

        {/* Gas & earnings */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div
            className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#00FFC0]" />
                <span className="text-[11px] text-gray-300 font-semibold uppercase tracking-wide">
                  Base gas
                </span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">
                Live mock
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <div className="space-y-0.5">
                <p className="text-gray-400">Low</p>
                <p className="font-mono text-green-400">
                  {gasInfo.base.low} gwei
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-gray-400">Average</p>
                <p className="font-mono text-yellow-300">
                  {gasInfo.base.avg} gwei
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-gray-400">High</p>
                <p className="font-mono text-red-400">
                  {gasInfo.base.high} gwei
                </p>
              </div>
            </div>
          </div>
          <div
            className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#00A6FF]" />
                <span className="text-[11px] text-gray-300 font-semibold uppercase tracking-wide">
                  30d mesh earnings
                </span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">
                Simulation
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <div className="space-y-0.5">
                <p className="text-gray-400">Profit</p>
                <p className="font-mono text-green-400">
                  {gasInfo.pnl.profit30d}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-gray-400">Fees</p>
                <p className="font-mono text-red-300">
                  {gasInfo.pnl.fees30d}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-gray-400">Hit rate</p>
                <p className="font-mono text-[#00FFC0]">
                  {gasInfo.pnl.hitRate}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Oracle feed */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3
              className={`text-xs font-semibold tracking-wide uppercase ${accentBlue}`}
            >
              Oracle feed
            </h3>
            <span className="text-[10px] text-gray-500">
              Phase 1 · Signals
            </span>
          </div>
          <div className="space-y-1.5">
            {oracleFeed.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-2 px-3 py-2 bg-[#101018] rounded-xl border border-[#252535] shadow-sm"
              >
                <div className="mt-0.5 flex-shrink-0">
                  {item.icon}
                </div>
                <span className="text-[11px] text-gray-200 leading-snug">
                  {item.message}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  const LootTab = () => {
    const [lootView, setLootView] = useState('packs'); // 'packs' | 'lab' | 'inventory'

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
      if (!db || !userId) {
        if (fragments < 3) {
          return showToast(
            'Not enough Fragments (3 needed).',
            'error'
          );
        }
        const newInv = [...inventory];
        const fragIdx = newInv.findIndex(
          (i) => i.id === 'fragment'
        );
        if (fragIdx !== -1) {
          newInv[fragIdx].count -= 3;
        }
        const shardIdx = newInv.findIndex(
          (i) => i.id === 'shard'
        );
        if (shardIdx !== -1) {
          newInv[shardIdx].count += 1;
        } else {
          newInv.push({
            id: 'shard',
            type: 'Shard',
            count: 1,
            lastAcquired: new Date(),
          });
        }
        setInventory(newInv);
        return showToast(
          'Synthesis successful! 3 Fragments → 1 Shard (mock).',
          'success'
        );
      }

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

          tx.update(fragRef, {
            count: fragments - 3,
          });

          const shardDoc = await tx.get(shardRef);
          const currentShard = shardDoc.exists()
            ? shardDoc.data().count
            : 0;

          tx.set(
            shardRef,
            {
              type: 'Shard',
              count: currentShard + 1,
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

    const sortedInventory = [...inventory].sort((a, b) =>
      a.id.localeCompare(b.id)
    );

    return (
      <div className="space-y-4">
        {/* Loot sub-tabs */}
        <div className="flex justify-around bg-[#101018] px-1 py-1 rounded-2xl border border-[#26263A] shadow-inner text-[11px]">
          <button
            onClick={() => setLootView('packs')}
            className={`w-1/3 py-1.5 rounded-lg font-semibold ${
              lootView === 'packs'
                ? `${neonBg}/10 ${neon} border border-[#00FFC0]`
                : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            Packs
          </button>
          <button
            onClick={() => setLootView('lab')}
            className={`w-1/3 py-1.5 rounded-lg font-semibold ${
              lootView === 'lab'
                ? 'bg-blue-600/15 text-blue-300 border border-blue-600'
                : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            Pull lab
          </button>
          <button
            onClick={() => setLootView('inventory')}
            className={`w-1/3 py-1.5 rounded-lg font-semibold ${
              lootView === 'inventory'
                ? 'bg-gray-800 text-gray-100 border border-gray-600'
                : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            Inventory
          </button>
        </div>

        {/* Packs view */}
        {lootView === 'packs' && (
          <section
            className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl space-y-2.5 shadow-md`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Starter mesh pack
                </h3>
                <p className="text-[11px] text-gray-400">
                  Base pack with guaranteed Fragments and a
                  chance for Shards.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-800 text-gray-200 border border-gray-700">
                ID: S001
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-800">
              <span
                className={`text-xl font-extrabold ${neon}`}
              >
                {starterPack.count} left
              </span>
              <button
                onClick={() =>
                  handlePackOpen(starterPack.id)
                }
                disabled={starterPack.count <= 0}
                className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] border transition ${
                  starterPack.count > 0
                    ? `${neonBg}/10 ${neon} border-[#00FFC0] hover:bg-[#00FFC0]/40`
                    : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                }`}
              >
                Simulate open
              </button>
            </div>
          </section>
        )}

        {/* Pull lab view */}
        {lootView === 'lab' && (
          <section
            className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl space-y-3 shadow-md`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`text-sm font-semibold ${accentBlue}`}
              >
                Pull lab · synthesis
              </h3>
              <span className="text-[10px] text-gray-500">
                3 Fragments → 1 Shard
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Upgrade low-tier loot into Shards. Relics stay
              mythic and non-burnable. Perfect hook for creator
              bounties and future jackpots.
            </p>

            <div className="grid grid-cols-3 text-center text-xs pt-2 border-t border-gray-800/50">
              <div className="p-2 border-r border-gray-800">
                <p className="text-xl font-bold text-white">
                  {fragments}
                </p>
                <p className="text-[10px] text-gray-400">
                  Fragments
                </p>
              </div>
              <div className="p-2 border-r border-gray-800">
                <p
                  className={`text-xl font-bold ${accentBlue}`}
                >
                  {shards}
                </p>
                <p className="text-[10px] text-gray-400">
                  Shards
                </p>
              </div>
              <div className="p-2">
                <p className="text-xl font-bold text-red-400">
                  {relics}
                </p>
                <p className="text-[10px] text-gray-400">
                  Relics
                </p>
              </div>
            </div>

            <button
              onClick={handleSynthesis}
              disabled={fragments < 3}
              className={`w-full px-3 py-1.75 rounded-lg font-semibold text-[11px] border transition ${
                fragments >= 3
                  ? 'bg-blue-600/20 text-blue-300 border-blue-600 hover:bg-blue-600/40'
                  : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
              }`}
            >
              Run synthesis (3 → 1)
            </button>
          </section>
        )}

        {/* Inventory view */}
        {lootView === 'inventory' && (
          <section
            className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl space-y-2 shadow-md`}
          >
            <div className="flex items-center justify-between mb-1">
              <h3
                className={`text-sm font-semibold ${accentBlue}`}
              >
                Inventory overview
              </h3>
              <span className="text-[10px] text-gray-500">
                {sortedInventory.length} entries
              </span>
            </div>

            {sortedInventory.length === 0 ? (
              <p className="text-[11px] text-gray-500 text-center py-4">
                No items yet. Open packs or run bounties to fill
                this up.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {sortedInventory.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center px-2.5 py-1.75 rounded-xl bg-[#101018] border border-gray-800 text-[11px]"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">
                        {item.type || item.id}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {item.id}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className={`${neon} font-bold`}>
                        x{item.count ?? 0}
                      </p>
                      {item.lastAcquired && (
                        <p className="text-[10px] text-gray-500">
                          recent
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    );
  };

  const QuestsTab = () => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [lastJackpotResult, setLastJackpotResult] =
      useState(null);
    const [jackpotPool, setJackpotPool] = useState(2.4); // ETH pot (mock)

    const dailyQuests = [
      {
        type: 'Daily',
        title: 'Daily check-in (completed)',
        reward: 10,
        status: 'Completed',
      },
      {
        type: 'Daily',
        title: 'Open 1 pack',
        reward: 25,
        status: 'Claimable',
      },
    ];

    // Creator bounties – “do this, win this”
    const creatorBounties = [
      {
        title: 'Create & mint a new Base token',
        reward: 150,
        status: 'Locked',
        desc: 'Use any creator platform, link it in SupCast, and tag your mesh ID.',
      },
      {
        title: 'Deploy & shill a pack series',
        reward: 200,
        status: 'Locked',
        desc: 'Launch any pack collection and share a Farcaster cast with your pulls.',
      },
      {
        title: 'Help another creator via SupCast',
        reward: 100,
        status: 'Claimable',
        desc: 'Solve one SupCast case with a real fix (wallet / pack / XP issue).',
      },
    ];

    const handleClaim = (questTitle) => {
      showToast(
        `Reward for "${questTitle}" claimed! XP added.`,
        'success'
      );
    };

    const getStatusStyle = (status) => {
      switch (status) {
        case 'Claimable':
          return 'bg-[#00FFC0]/15 text-[#00FFC0] border-[#00FFC0]';
        case 'Completed':
          return 'bg-green-600/25 text-green-300 border-green-600';
        case 'Locked':
        default:
          return 'bg-gray-800 text-gray-500 border-gray-700';
      }
    };

    const handleJackpotSpin = () => {
      if (isSpinning) return;
      setIsSpinning(true);

      const r = Math.random();
      let result =
        'Base XP: +15 XP added to your mesh (mock).';

      // simulera pott-rörelse
      setJackpotPool((prev) => {
        if (r < 0.03) {
          // jackpot – pott minskar
          return Math.max(0, prev - 0.5);
        }
        // annars pott växer lite
        return parseFloat((prev + 0.005).toFixed(3));
      });

      if (r < 0.03) {
        result =
          '🎰 JACKPOT! +500 XP & 1 Relic ticket (mock).';
        setProfileData((prev) => ({
          ...prev,
          xpBalance: prev.xpBalance + 500,
        }));
      } else if (r < 0.2) {
        result =
          'Nice hit: +120 XP & 1 Shard ticket (mock).';
        setProfileData((prev) => ({
          ...prev,
          xpBalance: prev.xpBalance + 120,
        }));
      } else {
        setProfileData((prev) => ({
          ...prev,
          xpBalance: prev.xpBalance + 15,
        }));
      }

      setLastJackpotResult(result);
      showToast(result, 'success');

      setTimeout(() => {
        setIsSpinning(false);
      }, 700);
    };

    return (
      <div className="space-y-4">
        <h2 className={`text-sm font-semibold uppercase tracking-wide ${neon}`}>
          Quest matrix · creator bounties
        </h2>

        {/* Daily quests */}
        <section className="space-y-2">
          <h3 className={`text-xs font-semibold ${accentBlue}`}>
            Daily goals
          </h3>
          {dailyQuests.map((quest, index) => (
            <div
              key={index}
              className={`${cardBg} ${borderColor} border px-3 py-2.5 rounded-2xl flex justify-between items-center shadow-sm`}
            >
              <div className="space-y-0.5">
                <p className="text-[12px] font-semibold text-white">
                  {quest.title}
                </p>
                <p className="text-[11px] text-gray-400 flex items-center">
                  <Star className="w-3 h-3 mr-1 text-yellow-400" />{' '}
                  {quest.reward} XP
                </p>
              </div>
              <button
                onClick={() =>
                  quest.status === 'Claimable' &&
                  handleClaim(quest.title)
                }
                disabled={quest.status !== 'Claimable'}
                className={`px-2.5 py-1 text-[10px] rounded-full font-semibold border transition ${getStatusStyle(
                  quest.status
                )}`}
              >
                {quest.status}
              </button>
            </div>
          ))}
        </section>

        {/* Creator bounties */}
        <section className="space-y-2">
          <h3 className={`text-xs font-semibold ${accentBlue}`}>
            Creator bounties
          </h3>
          {creatorBounties.map((bounty, idx) => (
            <div
              key={idx}
              className={`${cardBg} ${borderColor} border px-3 py-2.5 rounded-2xl shadow-sm`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="space-y-0.5">
                  <p className="text-[12px] font-semibold text-white">
                    {bounty.title}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {bounty.desc}
                  </p>
                </div>
                <span className="text-[11px] text-gray-300 flex items-center">
                  <Star className="w-3 h-3 mr-1 text-yellow-400" />
                  {bounty.reward} XP
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] text-gray-500">
                  Turn your onchain work into XP streams.
                </span>
                <button
                  onClick={() =>
                    bounty.status === 'Claimable' &&
                    handleClaim(bounty.title)
                  }
                  disabled={bounty.status !== 'Claimable'}
                  className={`px-2.5 py-1 text-[10px] rounded-full font-semibold border transition ${getStatusStyle(
                    bounty.status
                  )}`}
                >
                  {bounty.status}
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Daily jackpot – “soft casino” */}
        <section
          className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl space-y-2 shadow-md`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎰</span>
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-white">
                  Daily XP jackpot
                </h3>
                <p className="text-[10px] text-gray-400">
                  Spin once per day · XP-only simulation.
                </p>
              </div>
            </div>
            <span className="text-[10px] text-gray-500">
              House edge: just vibes
            </span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <div className="space-y-0.5">
              <p className="text-gray-400">
                Current pot (mock)
              </p>
              <p className="text-gray-100 font-mono">
                {jackpotPool.toFixed(3)} ETH on Base
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                Buy-in (mock):{' '}
                <span className="text-[#00FFC0] font-mono">
                  0.0003 ETH
                </span>{' '}
                or{' '}
                <span className="text-[#00FFC0] font-mono">
                  0.25 USDC
                </span>{' '}
                per spin.
              </p>
            </div>
            <button
              onClick={handleJackpotSpin}
              disabled={isSpinning}
              className={`px-3 py-1.75 rounded-full font-semibold text-[11px] border transition ${
                isSpinning
                  ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                  : 'bg-purple-600/30 text-purple-200 border border-purple-600 hover:bg-purple-600/50'
              }`}
            >
              {isSpinning ? 'Spinning...' : 'Spin daily'}
            </button>
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1">
            <span>
              Chance: 3% jackpot · 17% good hit · 80% base XP
            </span>
          </div>

          {lastJackpotResult && (
            <div className="mt-2 px-2.5 py-2 rounded-xl bg-[#101018] border border-gray-700 text-[11px] text-gray-200">
              {lastJackpotResult}
            </div>
          )}

          <p className="text-[10px] text-gray-500">
            This is visual only. Real ETH/USDC pot + entry will
            come from onchain contracts later.
          </p>
        </section>
      </div>
    );
  };

  const MeshTab = () => {
    const modes = [
      {
        id: 'alpha',
        name: 'Alpha hunters',
        desc:
          'Track wallets with aggressive pack / creator token activity across Base.',
        icon: ShieldCheck,
      },
      {
        id: 'new',
        name: 'New creators',
        desc:
          'Surface tokens and packs launched via zero-code builders & miniapps.',
        icon: Zap,
      },
      {
        id: 'gravity',
        name: 'Gravity clusters',
        desc:
          'Visualize clusters of wallets with the highest XP flow and SPN exposure.',
        icon: Globe,
      },
    ];

    const [activeMode, setActiveMode] = useState(modes[0]);

    const legendItems = [
      { color: neon, name: 'XP streams', icon: Activity },
      {
        color: accentBlue,
        name: 'Pack pulls',
        icon: Box,
      },
      {
        color: 'text-red-500',
        name: 'Burn events',
        icon: Flame,
      },
      {
        color: 'text-yellow-400',
        name: 'Creator flows',
        icon: DollarSign,
      },
    ];

    return (
      <div className="space-y-4">
        <h2 className={`text-sm font-semibold uppercase tracking-wide ${neon}`}>
          Mesh explorer
        </h2>

        <section className="space-y-3">
          <h3 className={`text-xs font-semibold ${accentBlue}`}>
            Mesh modes
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode)}
                className={`px-2 py-2 rounded-xl border text-[11px] shadow-sm transition ${
                  activeMode.id === mode.id
                    ? `border-[#00FFC0] ${neonBg}/10`
                    : `${borderColor} bg-[#101018] hover:border-gray-500`
                }`}
              >
                <mode.icon
                  className={`w-4 h-4 mx-auto mb-1 ${
                    activeMode.id === mode.id
                      ? neon
                      : 'text-gray-400'
                  }`}
                />
                <span className="font-semibold text-white">
                  {mode.name}
                </span>
              </button>
            ))}
          </div>
          <div className="text-[11px] text-gray-400 px-3 py-2 border-l-4 border-[#00FFC0]/60 bg-[#101018]/80 rounded-r-xl">
            <span className="font-semibold text-white mr-1">
              {activeMode.name}:
            </span>
            {activeMode.desc}
          </div>
        </section>

        <section
          className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl space-y-2 shadow-md`}
        >
          <h3 className={`text-xs font-semibold ${accentBlue}`}>
            Legend · flows
          </h3>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {legendItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-gray-300"
              >
                <item.icon
                  className={`w-3.5 h-3.5 ${item.color}`}
                />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="h-40 w-full bg-[#101018] rounded-2xl border border-[#26263A] flex items-center justify-center shadow-inner">
          <p className="text-[11px] text-gray-500 italic">
            3D WebGL mesh simulation placeholder · Phase 5
          </p>
        </section>

        <button className="w-full py-2.5 bg-blue-600/20 rounded-2xl font-semibold text-[11px] text-blue-300 border border-blue-600 hover:bg-blue-600/40 transition shadow-md">
          Open full mesh explorer (future)
        </button>
      </div>
    );
  };

  const SupportTab = () => {
    const userProfile = { solved: 7, xp: 350, rating: 4.5 };

    return (
      <div className="space-y-4">
        <h2 className={`text-sm font-semibold uppercase tracking-wide ${neon}`}>
          SupCast network
        </h2>

        {/* Ask */}
        <section
          className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl space-y-2.5 shadow-md`}
        >
          <h3 className={`text-xs font-semibold ${accentBlue}`}>
            Post a question
          </h3>
          <input
            type="text"
            placeholder="Short title of the problem"
            value={newCaseTitle}
            onChange={(e) =>
              setNewCaseTitle(e.target.value)
            }
            className="w-full px-2.5 py-1.75 bg-[#101018] rounded-lg border border-gray-700 text-[12px] text-white focus:outline-none focus:ring-1 focus:ring-[#00FFC0]"
          />
          <textarea
            placeholder="Describe your problem (wallet, chain, error code...)"
            value={newCaseDesc}
            onChange={(e) =>
              setNewCaseDesc(e.target.value)
            }
            className="w-full px-2.5 py-1.75 bg-[#101018] rounded-lg border border-gray-700 h-20 text-[12px] text-white resize-none focus:outline-none focus:ring-1 focus:ring-[#00FFC0]"
          />
          <button
            onClick={handlePostCase}
            disabled={
              !newCaseTitle ||
              !newCaseDesc ||
              isPostingCase
            }
            className={`w-full py-2.25 rounded-lg font-semibold text-[11px] border transition ${
              !newCaseTitle ||
              !newCaseDesc ||
              isPostingCase
                ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                : 'bg-red-600/30 border-red-700 text-red-300 hover:bg-red-600/50'
            }`}
          >
            {isPostingCase
              ? 'Posting...'
              : 'Post to SupCast mesh'}
          </button>
        </section>

        {/* Feed */}
        <section className="space-y-2">
          <h3 className={`text-xs font-semibold ${accentBlue}`}>
            Open questions ({supCastFeed.length})
          </h3>
          {supCastFeed.length === 0 ? (
            <div className="px-3 py-3 bg-[#101018] text-[11px] text-gray-500 rounded-2xl border border-gray-800 text-center">
              No open cases yet. Be the first to ask.
            </div>
          ) : (
            supCastFeed.map((item) => (
              <div
                key={item.id}
                className="px-3 py-2.5 bg-[#101018] rounded-2xl border border-gray-800 flex justify-between items-start shadow-sm"
              >
                <div className="flex-1 pr-2">
                  <span className="text-[10px] font-mono text-gray-500">
                    {item.posterHandle || '@mesh-user'} (
                    {item.posterId?.substring(0, 4) ||
                      '0000'}
                    ...)
                  </span>
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

        {/* Profile */}
        <section
          className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl text-center space-y-2 shadow-md`}
        >
          <h3 className={`text-xs font-semibold ${neon}`}>
            Your SupCast profile
          </h3>
          <div className="flex justify-around text-center mt-1">
            <div>
              <p className={`text-xl font-extrabold ${neon}`}>
                {userProfile.xp}
              </p>
              <p className="text-[10px] text-gray-400">
                Support XP
              </p>
            </div>
            <div>
              <p
                className={`text-xl font-extrabold ${accentBlue}`}
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
        </section>
      </div>
    );
  };

  // --- SHEETS & NAV ---
  const NavItem = ({ icon: Icon, tabName, label }) => (
    <button
      onClick={() => setCurrentTab(tabName)}
      className={`flex flex-col items-center px-2 py-1 rounded-lg transition ${
        currentTab === tabName
          ? `${neon}`
          : 'text-gray-500 hover:text-gray-200'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] mt-0.5">
        {label}
      </span>
    </button>
  );

  const Sheet = ({ id, title, children }) => (
    <div
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm sm:max-w-md h-[88vh] ${darkBg} rounded-t-3xl shadow-2xl transition-transform duration-500 ease-out z-50 overflow-y-auto px-3 pt-1 pb-4 ${
        activeSheet === id
          ? 'translate-y-0'
          : 'translate-y-full'
      }`}
    >
      <div className="w-full flex justify-center py-2">
        <div className="h-1.5 w-10 bg-gray-600 rounded-full" />
      </div>
      <div className="px-1">
        <div className="flex items-center justify-between mb-2">
          <h2 className={`text-base font-bold ${neon}`}>
            {title}
          </h2>
          <button
            onClick={() => setActiveSheet(null)}
            className="p-1 rounded-full hover:bg-[#11111A] text-gray-400 hover:text-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  const SheetAccount = () => (
    <Sheet id="account" title="Account & rewards">
      <div
        className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl flex items-center gap-3 mb-4 shadow-md`}
      >
        <div className="w-9 h-9 bg-[#9A00FF] rounded-full flex items-center justify-center text-sm font-bold text-white">
          S
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-white">
            @spawniz
          </p>
          <p className="text-[11px] text-gray-400">
            Mesh ID:{' '}
            {userId
              ? `${userId.substring(
                  0,
                  4
                )}...${userId.substring(
                  userId.length - 4
                )}`
              : 'Local mode'}
          </p>
          <p className="text-[10px] text-gray-500 font-mono">
            {userId || 'No wallet yet'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div
          className={`${cardBg} ${borderColor} border px-3 py-2.5 rounded-2xl shadow-sm`}
        >
          <p className="text-[11px] text-gray-400">
            Total XP
          </p>
          <p className={`text-xl font-bold ${neon}`}>
            {profileData.xpBalance.toLocaleString()}
          </p>
        </div>
        <div
          className={`${cardBg} ${borderColor} border px-3 py-2.5 rounded-2xl shadow-sm`}
        >
          <p className="text-[11px] text-gray-400">
            SPN balance
          </p>
          <p className={`text-xl font-bold ${accentBlue}`}>
            {profileData.spawnTokenBalance.toFixed(2)}
          </p>
        </div>
      </div>

      <div
        className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl space-y-2 shadow-md`}
      >
        <h3 className={`text-xs font-semibold ${accentBlue}`}>
          Referral system
        </h3>
        <p className="text-[11px] text-gray-400">
          Share your mesh code to earn XP when friends
          interact with creator tokens and packs.
        </p>
        <div className="flex items-center justify-between bg-[#101018] px-3 py-2 rounded-xl border border-gray-700">
          <span className={`font-mono ${neon} text-[11px]`}>
            SPAWN-MESH-74F
          </span>
          <button
            className={`text-[11px] px-3 py-1 rounded-full font-semibold ${neonBg}/10 ${neon} border border-[#00FFC0] hover:bg-[#00FFC0]/40 transition`}
          >
            Copy
          </button>
        </div>
      </div>

      <button
        onClick={() => setActiveSheet(null)}
        className="w-full py-2.5 mt-5 bg-red-700/40 rounded-2xl font-semibold text-[11px] border border-red-700 text-white/80 hover:bg-red-700/60 transition flex items-center justify-center gap-1.5"
      >
        <LogOut className="w-4 h-4" />
        <span>Close & return to HUD</span>
      </button>
    </Sheet>
  );

  const SheetSettings = () => (
    <Sheet id="settings" title="Settings & builders">
      <div className="space-y-3">
        <div
          className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl space-y-2 shadow-md`}
        >
          <h3 className={`text-xs font-semibold ${accentBlue}`}>
            XP SDK & integration
          </h3>
          <p className="text-[11px] text-gray-400">
            Connect SpawnEngine XP to your own apps, bots or
            frames.
          </p>
          <button
            className={`w-full py-2 text-[11px] ${neonBg}/10 rounded-xl font-semibold ${neon} border border-[#00FFC0] hover:bg-[#00FFC0]/40 transition`}
          >
            Show developer key (mock)
          </button>
        </div>

        <div
          className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl space-y-2 shadow-md`}
        >
          <h3 className={`text-xs font-semibold ${accentBlue}`}>
            Premium mesh filters
          </h3>
          <p className="text-[11px] text-gray-400">
            Unlock Alpha Hunters, whale alerts and advanced
            pack analytics.
          </p>
          <button className="w-full py-2 text-[11px] bg-gray-800 rounded-xl font-semibold text-gray-500 border border-gray-700 cursor-not-allowed">
            Upgrade to premium (soon)
          </button>
        </div>

        <div
          className={`${cardBg} ${borderColor} border px-3 py-3 rounded-2xl space-y-2 shadow-md`}
        >
          <h3 className={`text-xs font-semibold ${accentBlue}`}>
            Launchpad builder
          </h3>
          <p className="text-[11px] text-gray-400">
            Future zero-code deployer for creator tokens, packs
            & quests.
          </p>
          <button className="w-full py-2 text-[11px] bg-blue-600/20 rounded-xl font-semibold text-blue-300 border border-blue-600 hover:bg-blue-600/40 transition">
            Open creator panel (design only)
          </button>
        </div>

        <button className="w-full py-2.25 mt-2 bg-[#101018] rounded-xl font-semibold text-[11px] border border-gray-700 text-gray-300 hover:bg-gray-800 transition">
          Manage notifications (mock)
        </button>
      </div>
    </Sheet>
  );

  // --- RENDER ---
  const renderTabContent = () => {
    if (!isAuthReady) {
      return (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#00FFC0]" />
          <p className="text-[12px] text-gray-300">
            Loading mesh data...
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

  return (
    <div className={`min-h-screen ${darkBg} flex justify-center`}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }
          button:disabled { cursor: not-allowed; }
        `}
      </style>

      <ToastComponent />

      <div
        id="app-container"
        className="relative w-full max-w-sm sm:max-w-md pt-3 px-3 pb-16 flex flex-col"
      >
        {/* Header */}
        <header className="mb-4 space-y-2">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setActiveSheet('account')}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-full ${cardBg} border ${borderColor} transition hover:border-[#00FFC0]`}
            >
              <div className="w-7 h-7 bg-[#9A00FF] rounded-full flex items-center justify-center text-xs font-bold text-white">
                S
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-white">
                  @spawniz
                </span>
                <span className="text-[10px] text-gray-400">
                  Mesh creator · Base
                </span>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${neonBg} ${neonShadow}`}
              />
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${neonBg}/10 ${neon} border border-[#00FFC0]/60 shadow-sm`}
              >
                SpawnEngine · v1.0 HUD
              </span>
              <button
                onClick={() => setActiveSheet('settings')}
                className="text-gray-400 hover:text-gray-100 transition p-1.5 rounded-full hover:bg-[#11111A]"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-1.5">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${neonBg}/10 ${neon} border border-[#00FFC0]/50`}
              >
                Base · Creator mesh
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-300 border border-blue-600/50">
                Farcaster ready
              </span>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-gray-500 border-y border-gray-800 py-1 px-1">
              <span>
                GAS:{' '}
                <span className="text-gray-100">
                  0.05 gwei
                </span>
              </span>
              <span>
                MODE:{' '}
                <span className="text-gray-100">
                  Alpha hunter
                </span>
              </span>
              <span>
                WALLETS:{' '}
                <span className="text-gray-100">
                  4 linked
                </span>
              </span>
            </div>
          </div>
        </header>

        {/* Main */}
        <main id="tab-content" className="flex-grow pb-2">
          {renderTabContent()}
        </main>

        {/* Bottom nav */}
        <nav
          id="bottom-nav"
          className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm sm:max-w-md ${darkBg} flex justify-around items-center h-14 px-2 border-t border-gray-800 shadow-[0_-6px_16px_rgba(0,0,0,0.7)]`}
        >
          <NavItem icon={Home} tabName="home" label="Overview" />
          <NavItem icon={Box} tabName="loot" label="Packs" />
          <NavItem icon={Sword} tabName="quests" label="Quests" />
          <NavItem icon={Hexagon} tabName="mesh" label="Mesh" />
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