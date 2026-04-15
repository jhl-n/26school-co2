import React, { useState, useEffect, useMemo } from 'react';
import { Wind, Map as MapIcon, Plus, Trash2, Info, Building2, MapPin, Navigation, Calendar, Users, Filter, Edit3, X, AlertCircle } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, doc, deleteDoc, updateDoc } from 'firebase/firestore';

// --- Firebase 설정 ---
const getFirebaseConfig = () => {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    return JSON.parse(__firebase_config);
  }
  return {
  apiKey: "AIzaSyDVmR3MwCh362Ht__XlHJFMpZwKw2QyaBw",
  authDomain: "school-co2map.firebaseapp.com",
  projectId: "school-co2map",
  storageBucket: "school-co2map.firebasestorage.app",
  messagingSenderId: "343212195899",
  appId: "1:343212195899:web:0f0c1ddc286cd1b6995c1e",
  measurementId: "G-FJMVHB9GP9"
  };
};

const firebaseConfig = getFirebaseConfig();
const appId = typeof __app_id !== 'undefined' ? __app_id : '26school-co2';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const schoolStructure = {
  3: { label: "3층", rooms: [
    { id: "3-sci", name: "과학실", x: 52, y: 12, type: "special", wide: true },
    { id: "3-sci-prep", name: "준비실", x: 55, y: 22, type: "special" },
    { id: "3-gym-in", name: "실내체육실", x: 55, y: 38, type: "special" },
    { id: "3-rest-up", name: "화장실", x: 44, y: 42, type: "restroom" },
    { id: "3-stairs-up", name: "계단", x: 44, y: 12, type: "passage" },
    { id: "3-hall-left", name: "복도(좌)", x: 20, y: 60, type: "corridor", wide: true },
    { id: "3-hall-center", name: "복도(중앙)", x: 50, y: 55, type: "corridor" },
    { id: "3-hall-right", name: "복도(우)", x: 75, y: 65, type: "corridor", wide: true },
    { id: "2-1", name: "2-1", x: 5, y: 88, type: "class" },
    { id: "2-2", name: "2-2", x: 14, y: 88, type: "class" },
    { id: "2-3", name: "2-3", x: 22, y: 88, type: "class" },
    { id: "6-5", name: "6-5", x: 31, y: 88, type: "class" },
    { id: "3-rest-low", name: "화장실", x: 31, y: 72, type: "restroom" },
    { id: "lab-2", name: "2연구실", x: 60, y: 88, type: "office" },
    { id: "lab-6", name: "6연구실", x: 67, y: 88, type: "office" },
    { id: "6-1", name: "6-1", x: 75, y: 88, type: "class" },
    { id: "6-2", name: "6-2", x: 84, y: 88, type: "class" },
    { id: "6-3", name: "6-3", x: 92, y: 88, type: "class" },
    { id: "6-4", name: "6-4", x: 98, y: 88, type: "class" }
  ]},
  2: { label: "2층", rooms: [
    { id: "2-gym", name: "체육관", x: 18, y: 20, type: "special", wide: true },
    { id: "2-gym-outdoor", name: "체육관 앞 야외", x: 38, y: 20, type: "passage", wide: true },
    { id: "2-stairs-up", name: "계단", x: 44, y: 12, type: "passage" },
    { id: "2-lib", name: "도서실", x: 52, y: 12, type: "special" },
    { id: "2-comp", name: "컴퓨터실", x: 55, y: 32, type: "special" },
    { id: "2-rest-up", name: "화장실", x: 44, y: 40, type: "restroom" },
    { id: "2-hall-left", name: "복도(좌)", x: 20, y: 65, type: "corridor", wide: true },
    { id: "2-hall-center", name: "복도(중앙)", x: 48, y: 55, type: "corridor" },
    { id: "2-hall-right", name: "복도(우)", x: 75, y: 68, type: "corridor", wide: true },
    { id: "1-3", name: "1-3", x: 5, y: 88, type: "class" },
    { id: "1-2", name: "1-2", x: 14, y: 88, type: "class" },
    { id: "1-1", name: "1-1", x: 23, y: 88, type: "class" },
    { id: "2-4", name: "2-4", x: 31, y: 88, type: "class" },
    { id: "lab-1", name: "1연구실", x: 60, y: 88, type: "office" },
    { id: "2-broadcast", name: "방송실", x: 67, y: 88, type: "office" },
    { id: "2-office", name: "교무실", x: 76, y: 88, type: "office", wide: true },
    { id: "2-it", name: "전산실", x: 86, y: 88, type: "office" },
    { id: "2-minwon", name: "민원실", x: 92, y: 88, type: "office" },
    { id: "2-restarea", name: "남여휴게실", x: 98, y: 88, type: "office" }
  ]},
  1: { label: "1층", rooms: [
    { id: "1-cafeteria", name: "급식실", x: 18, y: 15, type: "special", wide: true },
    { id: "1-hall", name: "시청각실", x: 54, y: 12, type: "special" },
    { id: "1-yejeol", name: "예절실", x: 54, y: 32, type: "special" },
    { id: "1-path", name: "중앙통로(야외)", x: 53, y: 62, type: "passage", highlight: true, wide: true },
    { id: "1-entrance", name: "중앙현관", x: 65, y: 65, type: "passage" },
    { id: "1-dolbom3", name: "돌봄3", x: 5, y: 88, type: "class" },
    { id: "1-dolbom2", name: "돌봄2", x: 14, y: 88, type: "class" },
    { id: "1-dolbom1", name: "돌봄1", x: 23, y: 88, type: "class" },
    { id: "1-4", name: "1-4(늘봄)", x: 32, y: 88, type: "class" },
    { id: "1-sarang", name: "사랑반", x: 42, y: 88, type: "class" },
    { id: "1-admin", name: "행정실", x: 72, y: 88, type: "office" },
    { id: "1-principal", name: "교장실", x: 79, y: 88, type: "office" },
    { id: "1-nurse", name: "보건실", x: 82, y: 56, type: "office" },
    { id: "1-kinder", name: "유치원", x: 98, y: 75, type: "special" }
  ]}
};

const CLASSES = ['6-1', '6-2', '6-3', '6-4', '6-5'];

const App = () => {
  const [user, setUser] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(2);
  const [measurements, setMeasurements] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [targetClass, setTargetClass] = useState("6-1");
  const [viewMode, setViewMode] = useState("class"); 
  const [measureDate, setMeasureDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPpm, setNewPpm] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { console.error(e); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'co2_measurements');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMeasurements(data);
    });
    return () => unsubscribe();
  }, [user]);

  const filteredData = useMemo(() => {
    if (viewMode === 'all') return measurements;
    return measurements.filter(m => m.classGroup === targetClass);
  }, [measurements, viewMode, targetClass]);

  const floorMapData = useMemo(() => {
    const map = {};
    const floorList = filteredData.filter(m => m.floor === selectedFloor);
    [...floorList].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).forEach(m => {
      if (!map[m.roomId]) map[m.roomId] = m;
    });
    return map;
  }, [filteredData, selectedFloor]);

  const getAirQuality = (ppm) => {
    const p = parseInt(ppm);
    if (p < 450) return { color: "bg-emerald-500", text: "매우 쾌적", textCol: "text-emerald-600" };
    if (p < 1000) return { color: "bg-green-400", text: "보통", textCol: "text-green-600" };
    if (p < 2000) return { color: "bg-amber-400", text: "환기 필요", textCol: "text-amber-600" };
    return { color: "bg-rose-500", text: "매우 나쁨", textCol: "text-rose-600" };
  };

  const handleSaveData = async () => {
    if (!user || !selectedRoom || !newPpm || !studentName || !targetClass) return;
    const docData = {
      roomId: selectedRoom.id, roomName: selectedRoom.name, floor: selectedFloor,
      ppm: parseInt(newPpm), student: studentName, classGroup: targetClass,
      date: measureDate, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userId: user.uid, updatedAt: Date.now()
    };
    try {
      if (editingId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'co2_measurements', editingId), docData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'co2_measurements'), { ...docData, createdAt: Date.now() });
      }
      setNewPpm(""); 
      setSelectedRoom(null); 
      setStudentName("");
      setMeasureDate(new Date().toISOString().split('T')[0]);
    } catch (e) { console.error(e); }
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setSelectedRoom({ id: m.roomId, name: m.roomName });
    setSelectedFloor(m.floor);
    setNewPpm(m.ppm.toString());
    setStudentName(m.student);
    setTargetClass(m.classGroup);
    setMeasureDate(m.date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewPpm("");
    setSelectedRoom(null);
    setStudentName("");
    setMeasureDate(new Date().toISOString().split('T')[0]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("이 기록을 정말 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'co2_measurements', id));
    } catch (e) { console.error(e); }
  };

  if (!typeof __firebase_config !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.apiKey.includes("본인의")) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white p-8 text-center font-sans">
        <div>
          <AlertCircle className="mx-auto mb-4 text-rose-500" size={48} />
          <h1 className="text-2xl font-bold mb-2">설정이 더 필요합니다!</h1>
          <p className="text-slate-400">App.jsx 파일 상단의 firebaseConfig 변수에 <br/> 본인의 파이어베이스 설정값을 입력해 주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg"><Wind size={28} /></div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800">우리 학교 이산화탄소 분포도</h1>
              <p className="text-slate-500 font-bold text-sm mt-1 flex items-center gap-2"><Users size={14}/> 실시간 탐사 공유</p>
            </div>
          </div>
          <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-200 gap-3">
             <select value={targetClass} onChange={(e) => setTargetClass(e.target.value)} className="bg-slate-100 rounded-lg px-2 py-1 text-sm font-bold border-none outline-none">
                {CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </select>
              <div className="flex gap-1">
                <button onClick={() => setViewMode('class')} className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${viewMode === 'class' ? 'bg-blue-100 text-blue-700' : 'text-slate-400'}`}>학급만</button>
                <button onClick={() => setViewMode('all')} className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${viewMode === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>전체</button>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {[3, 2, 1].map(f => <button key={f} onClick={() => { setSelectedFloor(f); setSelectedRoom(null); }} className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${selectedFloor === f ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>{f}F</button>)}
              </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-white p-4 md:p-8 rounded-[2.5rem] shadow-xl relative aspect-[25/11] border-2 border-slate-100 overflow-hidden shadow-inner">
                {/* 현재 층수 및 범례 오버레이 */}
                <div className="absolute top-6 left-6 z-20 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xl shadow-2xl flex items-center gap-2 border-2 border-slate-700">
                      <MapIcon size={24} className="text-blue-400" />
                      {selectedFloor}층
                    </div>
                  </div>
                  
                  {/* 오염도 범례 (Legend) */}
                  <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xl space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CO2 Level Guide</p>
                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div> <span className="text-emerald-600">~450 (매우쾌적)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div> <span className="text-green-600">~1000 (보통)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div> <span className="text-amber-600">~2000 (환기필요)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div> <span className="text-rose-600">2000~ (나쁨)</span>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 grid grid-cols-20 grid-rows-10 opacity-[0.03] pointer-events-none">
                  {Array.from({length: 200}).map((_, i) => <div key={i} className="border-r border-b border-slate-900"></div>)}
                </div>

                {schoolStructure[selectedFloor].rooms.map(room => {
                  const data = floorMapData[room.id];
                  const quality = data ? getAirQuality(data.ppm) : null;
                  const isSelected = selectedRoom?.id === room.id;
                  
                  return (
                    <button key={room.id} onClick={() => setSelectedRoom(room)} 
                      style={{ left: `${room.x}%`, top: `${room.y}%` }}
                      // 버튼 크기 및 폰트 크기 1.5배 확대 적용
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-24 md:w-36 h-14 md:h-16 border-2 rounded-xl text-[14px] md:text-[17px] font-black transition-all flex items-center justify-center px-2 text-center leading-tight
                        ${isSelected ? 'border-blue-600 ring-8 ring-blue-50 z-50 scale-110 shadow-2xl' : 'bg-white border-slate-200 hover:border-blue-300 text-slate-700 shadow-sm'}`}>
                      {room.name}
                      {data && (
                        <div className="absolute -top-6 -right-6 z-40">
                          <div className={`${quality.color} text-white text-[12px] md:text-[14px] px-3 py-1 rounded-full font-black shadow-2xl border-4 border-white animate-bounce flex flex-col items-center`}>
                            {data.ppm}
                            <span className="text-[8px] opacity-90 mt-[-2px]">{data.student}</span>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>

            <div className={`bg-white p-6 rounded-3xl shadow-xl border-2 transition-all ${editingId ? 'border-orange-500 ring-8 ring-orange-50' : selectedRoom ? 'border-blue-500 ring-[10px] ring-blue-50' : 'border-slate-100'}`}>
               <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-slate-700 flex items-center gap-2">
                    {editingId ? <Edit3 size={18} className="text-orange-500"/> : <Plus size={18} className="text-blue-500"/>}
                    {editingId ? "기록 수정하기" : "새 기록 추가하기"}
                  </h3>
                  {editingId && (
                    <button onClick={cancelEdit} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                      <X size={14}/> 취소
                    </button>
                  )}
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 tracking-wider">측정 날짜</label>
                    <input type="date" value={measureDate} onChange={e => setMeasureDate(e.target.value)} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 tracking-wider">탐사대원 성명</label>
                    <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="이름" disabled={!selectedRoom} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 tracking-wider">농도 (PPM)</label>
                    <input type="number" value={newPpm} onChange={e => setNewPpm(e.target.value)} placeholder="농도 입력" disabled={!selectedRoom} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-black text-blue-600 text-lg outline-none focus:border-blue-500" />
                  </div>
                  <button onClick={handleSaveData} disabled={!selectedRoom || !newPpm || !studentName} className={`h-[52px] rounded-xl font-black text-white transition-all shadow-xl ${(!selectedRoom || !newPpm || !studentName) ? 'bg-slate-200 shadow-none' : editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-100'}`}>
                    {editingId ? "수정 완료" : "기록 및 공유"}
                  </button>
               </div>
            </div>
          </div>
          
          <div className="xl:col-span-1 bg-slate-900 rounded-[2.5rem] p-6 text-white overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
            <h2 className="font-black text-xl mb-6 flex justify-between items-center">
               <div className="flex items-center gap-2"><Building2 size={20} className="text-blue-400"/> 실시간 로그</div>
               <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-bold">{filteredData.length}건</span>
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
              {filteredData.length === 0 ? (
                <div className="text-slate-600 text-center py-20 font-bold text-sm italic">기록을 기다리고 있습니다...</div>
              ) : (
                [...filteredData].sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)).map(m => {
                  const isOwnRecord = user && m.userId === user.uid;
                  const q = getAirQuality(m.ppm);
                  return (
                    <div key={m.id} className={`p-4 rounded-2xl border-l-4 relative group ${q.color.replace('bg-', 'bg-')}/10 border-${q.color.split('-')[1]}-500 bg-slate-800/50`}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-[10px] font-black text-slate-500">{m.date} {m.timestamp}</div>
                        {isOwnRecord && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(m)} className="text-blue-400 hover:text-blue-300"><Edit3 size={12}/></button>
                            <button onClick={() => handleDelete(m.id)} className="text-rose-500 hover:text-rose-400"><Trash2 size={12}/></button>
                          </div>
                        )}
                      </div>
                      <div className="font-black text-white text-sm">{m.roomName}</div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-700 text-blue-300 text-[8px] px-1.5 py-0.5 rounded-md font-black">{m.classGroup}</span>
                          <span className="text-xs text-slate-400 font-bold">{m.student}</span>
                        </div>
                        <span className={`font-black ${q.textCol}`}>{m.ppm} ppm</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
