import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  collection,
  addDoc,
  runTransaction,
  Timestamp
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
  MessageSquare
} from 'lucide-react';

// --- GLOBAL FIREBASE CONFIGURATION (Provided by Environment) ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Försök läsa global __firebase_config (om den finns)
let firebaseConfig = null;
if (typeof __firebase_config !== 'undefined') {
  try {
    firebaseConfig = JSON.parse(__firebase_config);
  } catch (e) {
    console.error('Failed to parse __firebase_config:', e);
  }
}

// true = vi har riktig Firebase-konfig
const hasFirebaseConfig = !!(firebaseConfig && firebaseConfig.apiKey);

// Om du kör med backend-token:
const initialAuthToken =
  typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Helper to get Firestore paths
const getUserProfilePath = (userId) =>
  `artifacts/${appId}/users/${userId}/spawn_data/profile`;
const getUserInventoryPath = (userId) =>
  `artifacts/${appId}/users/${userId}/spawn_data/inventory`;
const getPublicSupCastCollectionPath = () =>
  `artifacts/${appId}/public/data/supcast_cases`;

const App = () => {
  // --- STATE MANAGEMENT ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(true);
const [isLoading, setIsLoading] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null); // 'account' or 'settings'
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Firestore Data State
  const [profileData, setProfileData] = useState({
    xpBalance: 0,
    spawnTokenBalance: 0.0,
    streakDays: 0,
    lastCheckIn: null
  });
  const [inventory, setInventory] = useState([]);
  const [supCastFeed, setSupCastFeed] = useState([]);

  // SupCast Form State
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [isPostingCase, setIsPostingCase] = useState(false);

  // --- UI/UX COMPONENTS ---

  const showToast = useCallback((message, type = 'info') => {
    let color = 'bg-neon-green/90';
    if (type === 'error') color = 'bg-red-600/90';
    if (type === 'success') color = 'bg-neon-green/90';
    if (type === 'info') color = 'bg-neon-blue/90';

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

  // Custom Styles & Color Palette
  const neon = 'text-[#00FFC0]';
  const neonBg = 'bg-[#00FFC0]';
  const accentBlue = 'text-[#00A6FF]';
  const darkBg = 'bg-[#0A0A10]';
  const cardBg = 'bg-[#151520]';
  const borderColor = 'border-[#252535]';

  // --- INITIALIZATION ---

  useEffect(() => {
    // DEMO-LÄGE (ingen Firebase-konfig hittad)
    if (!hasFirebaseConfig) {
      console.warn('No Firebase config found – running in DEMO mode.');
      setUserId('demo-user-1234');
      setProfileData({
        xpBalance: 12345,
        spawnTokenBalance: 42.69,
        streakDays: 3,
        lastCheckIn: new Date(Date.now() - 20 * 60 * 60 * 1000) // 20h sen
      });
      setInventory([
        { id: 'startermeshpack', type: 'Starter Mesh Pack', count: 2 },
        { id: 'fragment', type: 'Fragment', count: 5 },
        { id: 'shard', type: 'Shard', count: 1 },
        { id: 'relic', type: 'Relic', count: 0 }
      ]);
      setSupCastFeed([
        {
          id: 'case1',
          title: 'Base App stuck on loading',
          description:
            'Screen hangs on “Loading wallet data…” after I connect. Using iOS + Brave.',
          status: 'Open',
          posterHandle: '@spawniz',
          posterId: '0x1234',
          timestamp: Timestamp.now()
        },
        {
          id: 'case2',
          title: 'Gas spikes on Zora mints',
          description:
            'Gas shows crazy spikes for a few minutes when minting packs. Any idea why?',
          status: 'Claimed',
          posterHandle: '@meshwizard',
          posterId: '0x5678',
          timestamp: Timestamp.now()
        }
      ]);
      setIsAuthReady(true);
      setIsLoading(false);
      return;
    }

    // RIKTIG FIREBASE-LÄGE
    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const firestoreInstance = getFirestore(app);
      setDb(firestoreInstance);
      setAuth(authInstance);

      const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
        if (user) {
          setUserId(user.uid);
          setIsAuthReady(true);
        } else {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(authInstance, initialAuthToken);
            } else {
              await signInAnonymously(authInstance);
            }
          } catch (e) {
            console.error('Auth failed:', e);
            showToast('Authentication failed. Check logs.', 'error');
            setIsAuthReady(true);
          }
        }
      });

      return () => unsubscribe();
    } catch (e) {
      console.error('Firebase Initialization Error:', e);
      setIsAuthReady(true);
      setIsLoading(false);
    }
  }, [showToast]);

  // --- FIREBASE DATA LISTENERS ---

  useEffect(() => {
    if (!hasFirebaseConfig) return; // demo-läge, redan satt
    if (!isAuthReady || !userId || !db) return;
    setIsLoading(true);

    const getTsMs = (ts) => {
      if (!ts) return 0;
      if (ts instanceof Timestamp) return ts.toMillis();
      if (ts instanceof Date) return ts.getTime();
      return 0;
    };

    const profileRef = doc(db, getUserProfilePath(userId));
    const unsubscribeProfile = onSnapshot(
      profileRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData((prev) => ({
            ...prev,
            xpBalance: data.xpBalance || 0,
            spawnTokenBalance: data.spawnTokenBalance || 0.0,
            streakDays: data.streakDays || 0,
            lastCheckIn:
              data.lastCheckIn instanceof Timestamp
                ? data.lastCheckIn.toDate()
                : null
          }));
        } else {
          const initialData = {
            xpBalance: 100,
            spawnTokenBalance: 5.0,
            streakDays: 1,
            lastCheckIn: Timestamp.now()
          };
          setDoc(profileRef, initialData).then(() => {
            setProfileData({
              xpBalance: initialData.xpBalance,
              spawnTokenBalance: initialData.spawnTokenBalance,
              streakDays: initialData.streakDays,
              lastCheckIn: new Date()
            });
            showToast(
              'Welcome to SpawnEngine! Initial XP/SPN credited.',
              'success'
            );
          });
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Profile Snapshot Error:', error);
        showToast('Error loading profile data.', 'error');
        setIsLoading(false);
      }
    );

    const inventoryColRef = collection(db, getUserInventoryPath(userId));
    const unsubscribeInventory = onSnapshot(
      inventoryColRef,
      (snapshot) => {
        const newInventory = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setInventory(newInventory);
      },
      (error) => {
        console.error('Inventory Snapshot Error:', error);
        showToast('Error loading inventory.', 'error');
      }
    );

    const supCastColRef = collection(db, getPublicSupCastCollectionPath());
    const unsubscribeSupCast = onSnapshot(
      supCastColRef,
      (snapshot) => {
        const feed = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        feed.sort(
          (a, b) => getTsMs(b.timestamp) - getTsMs(a.timestamp)
        );
        setSupCastFeed(feed.slice(0, 50));
      },
      (error) => {
        console.error('SupCast Snapshot Error:', error);
        showToast('Error loading SupCast feed.', 'error');
      }
    );

    return () => {
      unsubscribeProfile();
      unsubscribeInventory();
      unsubscribeSupCast();
    };
  }, [isAuthReady, userId, db, showToast]);

  // --- CORE PLATFORM LOGIC ---

  const handleCheckIn = useCallback(async () => {
    const now = new Date();
    const lastCheckIn = profileData.lastCheckIn;

    const isReadyForCheckIn =
      !lastCheckIn ||
      now.getTime() - lastCheckIn.getTime() >= 24 * 60 * 60 * 1000;

    if (!isReadyForCheckIn) {
      const timeRemainingMs =
        lastCheckIn.getTime() +
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

    // DEMO-läge: bara local state
    if (!hasFirebaseConfig || !db || !userId) {
      setProfileData((prev) => {
        const newStreakDays = prev.streakDays + 1;
        const reward = 50 + prev.streakDays * 5;
        return {
          ...prev,
          streakDays: newStreakDays,
          xpBalance: prev.xpBalance + reward,
          lastCheckIn: new Date()
        };
      });
      showToast('Demo check-in: +XP added locally.', 'success');
      return;
    }

    try {
      const profileRef = doc(db, getUserProfilePath(userId));
      await runTransaction(db, async (transaction) => {
        const profileDoc = await transaction.get(profileRef);
        if (!profileDoc.exists())
          throw new Error('Profile does not exist!');

        const data = profileDoc.data();
        let newStreakDays = data.streakDays || 0;
        let newXp = data.xpBalance || 0;
        const checkInReward = 50 + newStreakDays * 5;

        const isStreakContinued =
          !lastCheckIn ||
          now.getTime() - lastCheckIn.getTime() <
            48 * 60 * 60 * 1000;

        if (isStreakContinued) {
          newStreakDays += 1;
        } else {
          newStreakDays = 1;
          showToast('Streak lost, reset to Day 1.', 'error');
        }

        newXp += checkInReward;

        transaction.update(profileRef, {
          streakDays: newStreakDays,
          xpBalance: newXp,
          lastCheckIn: Timestamp.now()
        });
        showToast(
          `Day ${newStreakDays} Check-in successful! +${checkInReward} XP.`,
          'success'
        );
      });
    } catch (e) {
      console.error('Check-in Transaction failed:', e);
      showToast('Check-in failed. Please try again.', 'error');
    }
  }, [db, userId, profileData.lastCheckIn, showToast, profileData.streakDays]);

  const handlePackOpen = useCallback(
    async (packId) => {
      // DEMO-läge: bara local RNG
      if (!hasFirebaseConfig || !db || !userId) {
        setInventory((current) => {
          const copy = [...current];
          const idx = copy.findIndex((i) => i.id === packId);
          if (idx !== -1 && copy[idx].count > 0) {
            copy[idx] = {
              ...copy[idx],
              count: copy[idx].count - 1
            };
          }
          let dropType = Math.random();
          let rewardText = '';
          let fragments = copy.find(
            (i) => i.id === 'fragment'
          );
          let shards = copy.find((i) => i.id === 'shard');
          let relics = copy.find((i) => i.id === 'relic');
          if (!fragments) {
            fragments = { id: 'fragment', type: 'Fragment', count: 0 };
            copy.push(fragments);
          }
          if (!shards) {
            shards = { id: 'shard', type: 'Shard', count: 0 };
            copy.push(shards);
          }
          if (!relics) {
            relics = { id: 'relic', type: 'Relic', count: 0 };
            copy.push(relics);
          }

          if (dropType < 0.05) {
            relics.count += 1;
            rewardText = 'MYTHIC DROP! +1 Relic.';
          } else if (dropType < 0.25) {
            shards.count += 1;
            rewardText = '+1 Shard.';
          } else {
            const amt = Math.floor(Math.random() * 3) + 1;
            fragments.count += amt;
            rewardText = `+${amt} Fragments.`;
          }
          showToast(`Demo open: ${rewardText}`, 'success');
          return copy;
        });
        return;
      }

      try {
        await runTransaction(db, async (transaction) => {
          const packRef = doc(
            db,
            getUserInventoryPath(userId),
            packId
          );
          const profileRef = doc(
            db,
            getUserProfilePath(userId)
          );

          const packDoc = await transaction.get(packRef);
          const profileDoc = await transaction.get(profileRef);

          if (!packDoc.exists() || packDoc.data().count <= 0) {
            throw new Error('Pack not found or count is zero.');
          }
          if (!profileDoc.exists()) {
            throw new Error('Profile not found.');
          }

          const currentPacks = packDoc.data().count;
          const currentXP = profileDoc.data().xpBalance || 0;

          const dropType = Math.random();
          let rewardText = '';
          let xpReward = 0;
          let itemType = null;
          let itemAmount = 0;

          if (dropType < 0.05) {
            itemType = 'Relic';
            itemAmount = 1;
            xpReward = 500;
            rewardText = 'MYTHIC DROP! +1 Relic & 500 XP.';
          } else if (dropType < 0.25) {
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

          transaction.update(packRef, {
            count: currentPacks - 1
          });

          transaction.update(profileRef, {
            xpBalance: currentXP + xpReward
          });

          const itemRef = doc(
            db,
            getUserInventoryPath(userId),
            itemType.toLowerCase()
          );
          const itemDoc = await transaction.get(itemRef);
          const currentItemCount = itemDoc.exists()
            ? itemDoc.data().count
            : 0;

          transaction.set(
            itemRef,
            {
              type: itemType,
              count: currentItemCount + itemAmount,
              lastAcquired: Timestamp.now()
            },
            { merge: true }
          );

          showToast(rewardText, 'success');
        });
      } catch (e) {
        console.error('Pack Open Transaction failed:', e);
        showToast(`Open failed: ${e.message}`, 'error');
      }
    },
    [db, userId, showToast]
  );

  const handlePostCase = useCallback(
    async () => {
      if (!newCaseTitle || !newCaseDesc)
        return showToast(
          'Title and description are required.',
          'error'
        );

      // DEMO-läge: uppdatera bara lokalt
      if (!hasFirebaseConfig || !db || !userId) {
        const newItem = {
          id: `local-${Date.now()}`,
          title: newCaseTitle,
          description: newCaseDesc,
          status: 'Open',
          posterHandle: '@spawniz',
          posterId: 'local-user',
          timestamp: Timestamp.now()
        };
        setSupCastFeed((prev) => [newItem, ...prev]);
        setNewCaseTitle('');
        setNewCaseDesc('');
        showToast(
          'Demo: Question added locally to feed.',
          'success'
        );
        return;
      }

      setIsPostingCase(true);
      try {
        const supCastColRef = collection(
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
          posterHandle: '@spawniz'
        };

        await addDoc(supCastColRef, newCase);

        setNewCaseTitle('');
        setNewCaseDesc('');
        showToast(
          'Question posted successfully to SupCast Network!',
          'success'
        );
      } catch (e) {
        console.error('Post Case failed:', e);
        showToast('Failed to post case. Check network.', 'error');
      } finally {
        setIsPostingCase(false);
      }
    },
    [db, userId, newCaseTitle, newCaseDesc, showToast]
  );

  // --- RENDERING HELPERS ---

  const formatTimeRemaining = (lastCheckIn) => {
    if (!lastCheckIn) return 'Ready Now';
    const nextCheckIn =
      lastCheckIn.getTime() + 24 * 60 * 60 * 1000;
    const timeRemainingMs = nextCheckIn - new Date().getTime();

    if (timeRemainingMs <= 0) return 'Ready Now';

    const hours = Math.floor(
      timeRemainingMs / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60)
    );
    return `${hours}h ${minutes}m`;
  };

  const streakReady = useMemo(() => {
    if (!profileData.lastCheckIn) return true;
    return (
      new Date().getTime() -
        profileData.lastCheckIn.getTime() >=
      24 * 60 * 60 * 1000
    );
  }, [profileData.lastCheckIn]);

  const streakHoursLeft = useMemo(() => {
    if (!profileData.lastCheckIn) return 0;
    const nextCheckIn =
      profileData.lastCheckIn.getTime() +
      24 * 60 * 60 * 1000;
    const timeRemainingMs =
      nextCheckIn - new Date().getTime();
    if (timeRemainingMs <= 0) return 0;
    return 24 - timeRemainingMs / (1000 * 60 * 60);
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
          <ShieldCheck className="w-4 h-4 text-neon" />
        )
      },
      {
        type: 'gravity',
        message:
          'Gravity Shift: Creator Y cluster has +200% XP flow. Hype cycle initiating.',
        icon: (
          <TrendingUp className="w-4 h-4 text-yellow-400" />
        )
      },
      {
        type: 'burn',
        message:
          "Burn Event: High-volume wallet '0xde...f12' burned 50% of Creator Z tokens.",
        icon: (
          <Flame className="w-4 h-4 text-red-500" />
        )
      },
      {
        type: 'quest',
        message:
          'Quest: New IRL Quest available: Check-in at ETH London Meetup!',
        icon: (
          <MapPin className="w-4 h-4 text-blue-400" />
        )
      }
    ];

    return (
      <div className="space-y-6">
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
              className={`px-4 py-2 rounded-full font-bold transition duration-300 text-sm shadow-md 
                ${
                  streakReady
                    ? 'bg-neon-green/30 text-neon border border-neon'
                    : 'bg-gray-700/50 text-gray-400 border border-gray-600 cursor-not-allowed'
                }
              `}
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
            <ShieldCheck className="w-3 h-3 inline-block mr-1" />{' '}
            Buy Streak Insurance (Pillar 3)
          </button>
        </div>

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
            {oracleFeed.map((item, index) => (
              <div
                key={index}
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
        type: 'Starter Mesh Pack'
      };
    const fragments = getItemCount('Fragment');
    const shards = getItemCount('Shard');
    const relics = getItemCount('Relic');

    const handleSynthesis = async () => {
      if (fragments < 3)
        return showToast(
          'Not enough Fragments (3 needed).',
          'error'
        );

      // DEMO-läge: bara local
      if (!hasFirebaseConfig || !db || !userId) {
        setInventory((curr) => {
          const copy = [...curr];
          const frag = copy.find(
            (i) => i.id === 'fragment'
          );
          const shard = copy.find(
            (i) => i.id === 'shard'
          );
          if (frag && frag.count >= 3) frag.count -= 3;
          if (shard) shard.count += 1;
          else
            copy.push({
              id: 'shard',
              type: 'Shard',
              count: 1
            });
          return copy;
        });
        showToast(
          'Demo synthesis: 3 Fragments -> 1 Shard.',
          'success'
        );
        return;
      }

      try {
        await runTransaction(db, async (transaction) => {
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

          transaction.update(fragRef, {
            count: fragments - 3
          });

          const shardDoc = await transaction.get(shardRef);
          const currentShardCount = shardDoc.exists()
            ? shardDoc.data()?.count || 0
            : 0;
          transaction.set(
            shardRef,
            {
              type: 'Shard',
              count: currentShardCount + 1,
              lastAcquired: Timestamp.now()
            },
            { merge: true }
          );

          showToast(
            'Synthesis successful! 3 Fragments -> 1 Shard.',
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

    return (
      <div className="space-y-6">
        <div className="flex justify-around bg-gray-900 p-1 rounded-xl border border-gray-700/50 shadow-inner">
          <button
            className={`w-1/3 py-2 text-sm rounded-lg ${neonBg}/30 ${neon} font-semibold transition-colors`}
          >
            Packs
          </button>
          <button className="w-1/3 py-2 text-sm rounded-lg text-gray-400 hover:bg-gray-800 transition-colors">
            Pull Lab
          </button>
          <button className="w-1/3 py-2 text-sm rounded-lg text-gray-400 hover:bg-gray-800 transition-colors">
            Inventory
          </button>
        </div>

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
              className={`px-4 py-2 rounded-lg font-bold transition text-sm ${
                starterPack.count > 0
                  ? `${neonBg}/30 ${neon} border border-neon hover:bg-neon/50`
                  : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
              }`}
            >
              Simulate Open
            </button>
          </div>
        </div>

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

          <div className="grid grid-cols-3 text-center text-sm font-mono pt-2 border-t border-gray-800/50">
            <div className="p-2 border-r border-gray-800">
              <p className="text-3xl font-bold text-white">
                {fragments}
              </p>
              <p className="text-xs text-gray-400">Fragments</p>
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
              <p className={`text-3xl font-bold text-red-400`}>
                {relics}
              </p>
              <p className="text-xs text-gray-400">Relics</p>
            </div>
          </div>

          <button
            onClick={handleSynthesis}
            disabled={fragments < 3}
            className={`w-full px-4 py-2 rounded-lg font-bold transition text-sm ${
              fragments >= 3
                ? 'bg-blue-600/30 text-blue-400 border border-blue-600 hover:bg-blue-600/50'
                : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
            }`}
          >
            Run Synthesis (3 Fragments → 1 Shard)
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
        status: 'Completed'
      },
      {
        type: 'Daily',
        title: 'Open 1 Pack',
        reward: 25,
        status: 'Claimable'
      },
      {
        type: 'Weekly',
        title: '5 Day Streak Run',
        reward: 150,
        status: 'Locked'
      },
      {
        type: 'Weekly',
        title: 'Solve 1 SupCast Case',
        reward: 100,
        status: 'Claimable'
      },
      {
        type: 'IRL',
        title: 'Base Builders Meetup (Stockholm)',
        reward: 200,
        status: 'Locked'
      }
    ];

    const handleClaim = (questTitle) => {
      showToast(
        `Reward for "${questTitle}" claimed! +XP credited.`,
        'success'
      );
    };

    const getStatusStyle = (status) => {
      switch (status) {
        case 'Claimable':
          return 'bg-neon-green/30 text-neon border-neon';
        case 'Completed':
          return 'bg-green-600/30 text-green-400 border-green-600';
        case 'Locked':
        default:
          return 'bg-gray-700/50 text-gray-400 border-gray-600';
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
            .map((quest, index) => (
              <div
                key={index}
                className={`${cardBg} ${borderColor} border p-3 rounded-xl flex justify-between items-center shadow-md`}
              >
                <div className="space-y-1">
                  <p className="font-semibold text-white">
                    {quest.title}
                  </p>
                  <p className="text-sm text-gray-400 flex items-center">
                    <Star className="w-3 h-3 mr-1 text-yellow-400 fill-yellow-400/50" />{' '}
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
            Weekly Milestones & IRL
          </h3>
          {quests
            .filter((q) => q.type !== 'Daily')
            .map((quest, index) => (
              <div
                key={index}
                className={`${cardBg} ${borderColor} border p-3 rounded-xl flex justify-between items-center shadow-md`}
              >
                <div className="space-y-1">
                  <p className="font-semibold text-white">
                    {quest.title}
                  </p>
                  <p className="text-sm text-gray-400 flex items-center">
                    <Star className="w-3 h-3 mr-1 text-yellow-400 fill-yellow-400/50" />{' '}
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
        desc: 'Tracks wallets with high Pack/Relic activity and unusual buying patterns.',
        icon: ShieldCheck
      },
      {
        id: 'new',
        name: 'New Creators',
        desc: 'Tracks newly deployed tokens/contracts via the Zero-Code Builder (Launchpad).',
        icon: Zap
      },
      {
        id: 'gravity',
        name: 'Gravity Clusters',
        desc: 'Visualizes clusters of wallets with the highest XP flows and token holdings.',
        icon: Globe
      }
    ];

    const [activeMode, setActiveMode] = useState(modes[0]);

    const legendItems = [
      { color: neon, name: 'XP Streams', icon: Activity },
      {
        color: accentBlue,
        name: 'Pack Pulls',
        icon: Box
      },
      { color: 'text-red-500', name: 'Burn Events', icon: Flame },
      {
        color: 'text-yellow-400',
        name: 'Creator Coin Flows',
        icon: DollarSign
      }
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
                className={`p-3 rounded-xl border transition duration-200 shadow-md ${
                  activeMode.id === mode.id
                    ? `border-neon ${neonBg}/30`
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
          <div className="text-sm text-gray-500 p-3 border-l-4 border-neon/50 bg-gray-900/50 rounded-r-xl">
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
            {legendItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-2"
              >
                <item.icon
                  className={`w-4 h-4 ${item.color}`}
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
            3D WebGL Mesh Simulation Running
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

    return (
      <div className="space-y-6">
        <h2 className={`text-2xl font-extrabold ${neon}`}>
          SupCast (Pillar 11)
        </h2>

        <div
          className={`${cardBg} ${borderColor} border p-4 rounded-xl space-y-3 shadow-lg`}
        >
          <h3 className={`text-lg font-bold ${accentBlue}`}>
            Post a Question
          </h3>
          <input
            type="text"
            placeholder="Short title of the problem"
            value={newCaseTitle}
            onChange={(e) => setNewCaseTitle(e.target.value)}
            className="w-full p-3 bg-gray-800 rounded-lg border border-gray-600 text-sm text-white focus:ring-neon focus:border-neon"
          />
          <textarea
            placeholder="Describe your problem (Wallet ID, chain, error code...)"
            value={newCaseDesc}
            onChange={(e) => setNewCaseDesc(e.target.value)}
            className="w-full p-3 bg-gray-800 rounded-lg border border-gray-600 h-20 text-sm text-white focus:ring-neon focus:border-neon"
          ></textarea>
          <button
            onClick={handlePostCase}
            disabled={
              !newCaseTitle || !newCaseDesc || isPostingCase
            }
            className={`w-full py-3 rounded-lg font-semibold border text-sm transition ${
              !newCaseTitle || !newCaseDesc || isPostingCase
                ? 'bg-gray-700/50 text-gray-400 border-gray-600 cursor-not-allowed'
                : 'bg-red-600/50 border-red-700/50 text-red-400 hover:bg-red-600/70'
            }`}
          >
            {isPostingCase ? 'Posting...' : 'Post Question to Network'}
          </button>
        </div>

        <div className="space-y-3">
          <h3 className={`text-lg font-bold ${accentBlue}`}>
            Open Questions Feed ({supCastFeed.length} active)
          </h3>
          {supCastFeed.length === 0 ? (
            <div className="p-4 bg-gray-900/50 text-gray-500 rounded-xl border border-gray-800 text-center">
              No open cases found. Be the first!
            </div>
          ) : (
            supCastFeed.map((item) => {
              const safePosterHandle =
                item.posterHandle || 'Unknown';
              const safePosterId =
                typeof item.posterId === 'string'
                  ? item.posterId
                  : '????';
              const shortId = safePosterId.slice(0, 4);
              const status = item.status || 'Open';

              const statusClass =
                status === 'Open'
                  ? 'bg-red-600/30 text-red-400 border-red-600'
                  : status === 'Claimed'
                  ? 'bg-blue-600/30 text-blue-400 border-blue-600'
                  : 'bg-neon-green/30 text-neon border-neon';

              return (
                <div
                  key={item.id}
                  className="p-3 bg-gray-900 rounded-xl border border-gray-800 flex justify-between items-start shadow-sm"
                >
                  <div className="flex-grow pr-2">
                    <span className="text-xs font-mono text-gray-500">
                      Posted by: {safePosterHandle} (
                      {shortId}...)
                    </span>
                    <p className="font-semibold text-white mt-0.5">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-400/70 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${statusClass}`}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div
          className={`${cardBg} ${borderColor} border p-4 rounded-xl text-center space-y-2 shadow-lg`}
        >
          <h3 className={`text-xl font-bold ${neon}`}>
            Your SupCast Profile
          </h3>
          <div className="flex justify-around text-center mt-2">
            <div>
              <p
                className={`text-3xl font-extrabold ${neon}`}
              >
                {userProfile.xp}
              </p>
              <p className="text-xs text-gray-400">
                Support XP
              </p>
            </div>
            <div>
              <p
                className={`text-3xl font-extrabold ${accentBlue}`}
              >
                {userProfile.solved}
              </p>
              <p className="text-xs text-gray-400">
                Solved Cases
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-yellow-400">
                {userProfile.rating}
              </p>
              <p className="text-xs text-gray-400">Rating</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- LAYOUT ---

  const NavItem = ({ icon: Icon, tabName, label }) => (
    <button
      onClick={() => setCurrentTab(tabName)}
      className={`flex flex-col items-center p-2 rounded-lg transition duration-200 
        ${
          currentTab === tabName
            ? neon
            : 'text-gray-500 hover:text-white'
        }
      `}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs mt-0.5">{label}</span>
    </button>
  );

  const Sheet = ({ id, title, children }) => (
    <div
      className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm h-[90vh] ${darkBg} rounded-t-3xl shadow-2xl transition-transform duration-500 ease-out z-50 overflow-y-auto p-4 sm:max-w-md ${
        activeSheet === id ? 'translate-y-0' : 'translate-y-full'
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
              ? `${userId.substring(0, 4)}...${userId.substring(
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
          <p className={`text-2xl font-bold ${neon}`}>
            {profileData.xpBalance.toLocaleString()}
          </p>
        </div>
        <div
          className={`${cardBg} ${borderColor} border p-3 rounded-xl shadow-md`}
        >
          <p className="text-sm text-gray-400">SPN Balance</p>
          <p className={`text-2xl font-bold ${accentBlue}`}>
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
          <span className={`font-mono ${neon} text-sm`}>
            SPAWN-MESH-74F
          </span>
          <button
            className={`text-xs px-3 py-1 rounded-full font-semibold ${neonBg}/30 ${neon} border border-neon hover:bg-neon/50 transition`}
          >
            Copy
          </button>
        </div>
      </div>

      <button className="w-full py-3 mt-8 bg-red-700/50 rounded-xl font-semibold border border-red-700 text-white/80 hover:bg-red-700/70 transition flex items-center justify-center">
        <LogOut className="w-5 h-5 mr-2" /> Switch Wallet /
        Logout
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
            Manage API keys to integrate SpawnEngine XP into
            your own apps.
          </p>
          <button
            className={`w-full py-2.5 ${neonBg}/30 rounded-xl font-semibold ${neon} border border-neon hover:bg-neon/50 transition text-sm`}
          >
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

  // --- MAIN RENDER ---

  const renderTabContent = () => {
  if (!isAuthReady || isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon"></div>
        <p className="ml-3 text-white">Loading Platform Data...</p>
      </div>
    );
  }
  ...
};

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
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .neon-glow { box-shadow: 0 0 5px #00FFC0, 0 0 10px #00FFC0 inset; }
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
        <header className="mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setActiveSheet('account')}
              className={`flex items-center space-x-3 p-2 rounded-full ${cardBg} border ${borderColor} transition duration-200 hover:border-neon`}
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

            <div className="flex space-x-2 items-center">
              <span
                className={`w-2 h-2 rounded-full ${neonBg} neon-glow`}
              ></span>
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded-full ${neonBg}/20 ${neon} border border-neon/50 shadow-md`}
              >
                Mesh v1.0 PRO
              </span>
              <button
                onClick={() => setActiveSheet('settings')}
                className="text-gray-400 hover:text-white transition duration-200 p-2 rounded-full hover:bg-gray-800"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex space-x-1.5">
              <span
                className={`text-xs px-2.5 py-1 rounded-full ${neonBg}/20 ${neon} border border-neon/50`}
              >
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

        <main id="tab-content" className="flex-grow pb-4">
          {renderTabContent()}
        </main>

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

        <SheetAccount />
        <SheetSettings />
      </div>
    </div>
  );
};

export default App;