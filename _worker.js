// _worker.js - Ultimate Standalone Version for Discipline Baby
// Feature Update: Pomodoro Timer re-integrated into Dashboard

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;
        const HARDCODED_USER_ID = 'user_2fP7sW5gR8zX9yB1eA6vC4jK0lM';

        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json',
        };
        if (method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

        const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: corsHeaders });

        const DEFAULT_REWARDS = [{ id: 'reward-1', title: '示例奖品', type: 'totalTasks', targetValue: 5 }];
        const DEFAULT_ACHS = [{ id: 'ach-1', title: '荣誉之星', type: 'totalTasks', targetValue: 1, unlocked: false }];
        const DEFAULT_USER = {
            id: HARDCODED_USER_ID, name: '小英雄', level: 1, xp: 0, xpToNextLevel: 100, activeDays: 1,
            lastLoginDate: ''
        };

        const getKV = async (key, defaultValue) => {
            const val = await env.KV.get(`${key}:${HARDCODED_USER_ID}`);
            return val ? JSON.parse(val) : defaultValue;
        };
        const setKV = async (key, val) => await env.KV.put(`${key}:${HARDCODED_USER_ID}`, JSON.stringify(val));

        try {
            if (path.startsWith('/api/')) {
                if (path === '/api/user') {
                    let user = await getKV('user', DEFAULT_USER);
                    if (method === 'GET') return jsonResponse(user);
                    if (method === 'POST') {
                        user = { ...user, ...(await request.json()) };
                        await setKV('user', user);
                        return jsonResponse(user);
                    }
                }
                if (path === '/api/tasks') {
                    let tasks = await getKV('tasks', []);
                    if (method === 'GET') return jsonResponse(tasks);
                    if (method === 'POST') {
                        const body = await request.json();
                        let user = await getKV('user', DEFAULT_USER);
                        if (body.action === 'add') tasks.unshift({ ...body.task, id: `task-${Date.now()}` });
                        if (body.action === 'edit') tasks = tasks.map(t => t.id === body.taskId ? { ...t, ...body.task } : t);
                        if (body.action === 'delete') tasks = tasks.filter(t => t.id !== body.taskId);
                        if (body.action === 'complete') {
                            const t = tasks.find(t => t.id === body.taskId);
                            if (t && t.completed !== body.completed) {
                                const xpVal = parseInt(t.xp) || 10;
                                user.xp += (body.completed ? xpVal : -xpVal);
                                if (user.xp < 0) user.xp = 0;
                                while (user.xp >= user.xpToNextLevel) {
                                    user.level++;
                                    user.xp -= user.xpToNextLevel;
                                    user.xpToNextLevel = Math.floor(user.xpToNextLevel * 1.2);
                                }
                                t.completed = body.completed;
                                await setKV('user', user);
                            }
                        }
                        await setKV('tasks', tasks);
                        return jsonResponse({ tasks, user });
                    }
                }
                if (path === '/api/rewards' || path === '/api/achievements') {
                    const key = path === '/api/rewards' ? 'rewards' : 'achievements';
                    let items = await getKV(key, key === 'rewards' ? DEFAULT_REWARDS : DEFAULT_ACHS);
                    if (method === 'GET') return jsonResponse(items);
                    if (method === 'POST') {
                        const body = await request.json();
                        if (body.action === 'add') items.unshift({ ...body.item, id: `item-${Date.now()}` });
                        if (body.action === 'edit') items = items.map(i => i.id === body.itemId ? { ...i, ...body.item } : i);
                        if (body.action === 'delete') items = items.filter(i => i.id !== body.itemId);
                        await setKV(key, items);
                        return jsonResponse(items);
                    }
                }
            }

            if (path === '/') {
                const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>自律宝贝 - 番茄时钟版</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap');
        body { font-family: 'Quicksand', system-ui; background-color: #f7f9fc; color: #1e293b; overflow-x: hidden; }
        .glass { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.3); }
        .nav-active { color: #f43f5e; font-weight: 700; transform: translateY(-2px); }
        .nav-active i { color: #f43f5e; }
        .day-badge.active { background: #f43f5e; color: white; border-color: #f43f5e; }
        .tab-view { animation: fadeInUp 0.4s ease; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .pomodoro-active { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(244, 63, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); } }
    </style>
</head>
<body class="pb-32">
    <header class="fixed top-0 inset-x-0 glass z-50 px-6 py-4 flex justify-between items-center max-w-4xl mx-auto md:rounded-b-[40px] shadow-sm">
        <div class="flex items-center gap-3">
            <div id="nav-pet-box" class="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🐣</div>
            <h1 class="text-xl font-bold">自律宝贝</h1>
        </div>
        <button onclick="switchTab('settings')" class="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400"><i data-lucide="settings" class="w-5 h-5"></i></button>
    </header>

    <main class="mt-28 px-4 max-w-4xl mx-auto space-y-6">
        <!-- Dashboard -->
        <div id="tab-dashboard" class="tab-view space-y-6">
            <div class="bg-gradient-to-br from-rose-500 to-orange-400 p-8 rounded-[40px] shadow-2xl text-white flex flex-col md:flex-row items-center gap-8">
                <div id="pet-hero" class="text-8xl">🌱</div>
                <div class="flex-1 w-full text-center md:text-left">
                    <h2 class="text-3xl font-bold mb-2">你好，<span id="welcome-name">小英雄</span>！</h2>
                    <div class="flex items-center justify-center md:justify-start gap-4 text-sm opacity-90">
                        <span class="bg-white/10 px-3 py-1 rounded-full border border-white/20">坚持 <span id="stat-days">1</span> 天</span>
                        <span>LV.<span id="stat-level">1</span></span>
                        <span>XP: <span id="stat-xp">0</span>/<span id="stat-xp-max">100</span></span>
                    </div>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
                <!-- NEW: Pomodoro Timer -->
                <div class="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col items-center">
                    <h3 class="w-full font-bold text-gray-800 flex items-center gap-3 mb-6"><i data-lucide="timer" class="text-indigo-500"></i>专注星球</h3>
                    <div class="relative w-48 h-48 flex items-center justify-center mb-6">
                        <svg class="w-full h-full -rotate-90">
                            <circle cx="96" cy="96" r="88" stroke="currentColor" stroke-width="8" fill="transparent" class="text-gray-100"></circle>
                            <circle id="timer-progress" cx="96" cy="96" r="88" stroke="currentColor" stroke-width="8" fill="transparent" stroke-dasharray="553" stroke-dashoffset="553" class="text-indigo-500 transition-all duration-300"></circle>
                        </svg>
                        <div id="timer-display" class="absolute text-4xl font-mono font-bold text-gray-800">25:00</div>
                    </div>
                    <div class="flex gap-2 mb-6">
                        <button onclick="setTimerMode('focus')" class="timer-mode-btn px-4 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-200">专注</button>
                        <button onclick="setTimerMode('short')" class="timer-mode-btn px-4 py-1 rounded-full bg-gray-50 text-gray-400 text-xs font-bold border border-transparent">短休</button>
                        <button onclick="setTimerMode('long')" class="timer-mode-btn px-4 py-1 rounded-full bg-gray-50 text-gray-400 text-xs font-bold border border-transparent">长休</button>
                    </div>
                    <div class="flex gap-4 w-full">
                        <button id="btn-timer-start" onclick="toggleTimer()" class="flex-1 bg-indigo-600 text-white py-4 rounded-[25px] font-bold shadow-lg shadow-indigo-100">开始</button>
                        <button onclick="resetTimer()" class="w-16 bg-gray-50 text-gray-400 rounded-[25px] flex items-center justify-center"><i data-lucide="refresh-cw" class="w-5 h-5"></i></button>
                    </div>
                </div>

                <!-- Today Tasks -->
                <div class="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="font-bold text-gray-800 flex items-center gap-3"><i data-lucide="calendar" class="text-rose-500"></i>今日任务</h3>
                        <span id="stat-today-progress" class="text-xs text-gray-400 font-bold">0/0</span>
                    </div>
                    <div id="dashboard-task-list" class="space-y-3 flex-1 overflow-y-auto max-h-[300px]"></div>
                </div>

                <!-- Honor Wall -->
                <div class="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="font-bold text-gray-800 flex items-center gap-3"><i data-lucide="award" class="text-amber-500"></i>荣誉殿堂</h3>
                        <button onclick="switchTab('achievements')" class="text-xs text-amber-500 font-bold">详情</button>
                    </div>
                    <div id="dashboard-ach-list" class="flex flex-wrap gap-4 justify-center items-center py-4"></div>
                </div>

                <!-- Rewards -->
                <div class="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="font-bold text-gray-800 flex items-center gap-3"><i data-lucide="gift" class="text-orange-500"></i>兑换进度</h3>
                        <button onclick="switchTab('rewards')" class="text-xs text-orange-400 font-bold">去兑换</button>
                    </div>
                    <div id="dashboard-reward-list" class="space-y-4"></div>
                </div>
            </div>
        </div>

        <!-- Task Tab -->
        <div id="tab-tasks" class="tab-view hidden space-y-6">
            <div class="flex justify-between items-center"><h2 class="text-3xl font-bold text-gray-800">所有挑战</h2><button onclick="openTaskModal()" class="bg-rose-500 h-14 w-14 rounded-[22px] text-white shadow-lg flex items-center justify-center"><i data-lucide="plus" class="w-8 h-8"></i></button></div>
            <div id="task-list" class="space-y-4"></div>
        </div>

        <!-- Achievement Tab -->
        <div id="tab-achievements" class="tab-view hidden space-y-6">
            <div class="flex justify-between items-center"><h2 class="text-3xl font-bold text-gray-800">挑战荣誉</h2><button onclick="openManageModal('ach')" class="text-amber-500 font-bold text-sm bg-amber-50 px-4 py-2 rounded-xl">管理荣誉</button></div>
            <div id="achievement-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"></div>
        </div>

        <!-- Reward Tab -->
        <div id="tab-rewards" class="tab-view hidden space-y-6">
            <div class="flex justify-between items-center"><h2 class="text-3xl font-bold text-gray-800">愿望清单</h2><button onclick="openManageModal('rewards')" class="text-orange-500 font-bold text-sm bg-orange-50 px-4 py-2 rounded-xl">管理奖品</button></div>
            <div id="reward-full-list" class="grid gap-6 md:grid-cols-2"></div>
        </div>

        <!-- Settings Tab -->
        <div id="tab-settings" class="tab-view hidden space-y-6">
             <h2 class="text-3xl font-bold text-gray-800">偏好设置</h2>
             <div class="bg-white p-8 rounded-[40px] border space-y-4">
                <div class="space-y-1"><label class="text-xs font-bold text-gray-400">我的昵称</label><input id="set-name" class="w-full bg-gray-50 p-4 rounded-2xl border outline-none" placeholder="输入昵称" /></div>
                <button onclick="saveUser()" class="w-full bg-rose-500 text-white py-4 rounded-3xl font-bold shadow-lg shadow-rose-100">保存修改</button>
             </div>
        </div>
    </main>

    <!-- Navigation -->
    <nav class="fixed bottom-8 inset-x-6 max-w-md mx-auto z-50">
        <div class="glass p-3 rounded-[35px] shadow-2xl flex justify-between items-center">
            <button onclick="switchTab('dashboard')" class="nav-item flex-1 flex flex-col items-center gap-1 active"><i data-lucide="layout-dashboard" class="w-6 h-6 text-gray-400"></i><span class="text-[10px] font-bold text-gray-400">首页</span></button>
            <button onclick="switchTab('tasks')" class="nav-item flex-1 flex flex-col items-center gap-1"><i data-lucide="list-checks" class="w-6 h-6 text-gray-400"></i><span class="text-[10px] font-bold text-gray-400">挑战</span></button>
            <button onclick="switchTab('achievements')" class="nav-item flex-1 flex flex-col items-center gap-1"><i data-lucide="award" class="w-6 h-6 text-gray-400"></i><span class="text-[10px] font-bold text-gray-400">荣誉</span></button>
            <button onclick="switchTab('rewards')" class="nav-item flex-1 flex flex-col items-center gap-1"><i data-lucide="gift" class="w-6 h-6 text-gray-400"></i><span class="text-[10px] font-bold text-gray-400">奖励</span></button>
        </div>
    </nav>

    <!-- Modal: Task -->
    <div id="modal-task" class="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center hidden">
        <div class="bg-white w-full max-w-sm m-4 p-8 rounded-[40px] shadow-2xl space-y-6">
            <h3 class="text-2xl font-bold">新挑战</h3>
            <div class="space-y-4">
                <input id="task-title" class="w-full bg-gray-50 p-4 rounded-2xl border outline-none" placeholder="挑战内容" />
                <div class="space-y-1"><label class="text-[10px] text-gray-400 font-bold">成长值奖赏 (XP)</label><input type="number" id="task-xp" class="w-full bg-gray-50 p-4 rounded-2xl border outline-none" value="10" /></div>
                <div class="grid grid-cols-2 gap-2"><button id="btn-t-once" onclick="setTaskType(false)" class="bg-rose-500 text-white py-3 rounded-2xl text-xs font-bold">一次性</button><button id="btn-t-loop" onclick="setTaskType(true)" class="bg-gray-50 text-gray-400 py-3 rounded-2xl text-xs font-bold">重复性</button></div>
                <div id="box-t-once"><input type="date" id="task-date" class="w-full bg-gray-50 p-4 rounded-2xl border" /></div>
                <div id="box-t-loop" class="hidden flex justify-between gap-1">
                    <span onclick="toggleDay(1, this)" class="day-badge border p-2 flex-1 text-center rounded-xl text-xs font-bold">一</span>
                    <span onclick="toggleDay(2, this)" class="day-badge border p-2 flex-1 text-center rounded-xl text-xs font-bold">二</span>
                    <span onclick="toggleDay(3, this)" class="day-badge border p-2 flex-1 text-center rounded-xl text-xs font-bold">三</span>
                    <span onclick="toggleDay(4, this)" class="day-badge border p-2 flex-1 text-center rounded-xl text-xs font-bold">四</span>
                    <span onclick="toggleDay(5, this)" class="day-badge border p-2 flex-1 text-center rounded-xl text-xs font-bold">五</span>
                    <span onclick="toggleDay(6, this)" class="day-badge border p-2 flex-1 text-center rounded-xl text-xs font-bold">六</span>
                    <span onclick="toggleDay(0, this)" class="day-badge border p-2 flex-1 text-center rounded-xl text-xs font-bold">日</span>
                </div>
            </div>
            <div class="flex gap-4"><button onclick="closeModals()" class="flex-1 text-gray-300 font-bold">取消</button><button onclick="saveTask()" class="flex-[2] bg-rose-500 text-white py-4 rounded-3xl font-bold">保存挑战</button></div>
        </div>
    </div>

    <!-- Modal: Management -->
    <div id="modal-manage" class="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center hidden">
        <div class="bg-white w-full max-w-md m-4 p-8 rounded-[40px] shadow-2xl h-[80vh] flex flex-col">
            <h3 id="manage-title" class="text-2xl font-bold mb-4">管理项目</h3>
            <div id="manage-list" class="flex-1 overflow-y-auto space-y-3 mb-6"></div>
            <div class="border-t pt-4 space-y-4">
                <input id="mg-title" class="w-full bg-gray-50 p-3 rounded-xl border outline-none text-sm" placeholder="方案名称" />
                <div class="grid grid-cols-2 gap-2">
                    <div class="space-y-1"><label class="text-[10px] text-gray-400 font-bold">解锁条件类型</label>
                    <select id="mg-type" onchange="toggleMgExtra()" class="w-full bg-gray-50 p-3 rounded-xl border text-sm"><option value="totalTasks">累计任务数</option><option value="daysCount">坚持天数</option><option value="totalXP">成长值 (XP)</option><option value="specificTask">指定任务</option></select></div>
                    <div class="space-y-1" id="box-mg-val"><label class="text-[10px] text-gray-400 font-bold">目标值</label><input id="mg-val" type="number" class="w-full bg-gray-50 p-3 rounded-xl border outline-none text-sm" value="10" /></div>
                    <div class="hidden space-y-1" id="box-mg-task"><label class="text-[10px] text-gray-400 font-bold">选择任务</label><select id="mg-task-sel" class="w-full bg-gray-50 p-3 rounded-xl border text-sm"></select></div>
                </div>
                <button onclick="submitManage()" id="mg-submit-btn" class="w-full bg-rose-500 text-white py-4 rounded-3xl font-bold">保存方案</button>
            </div>
            <button onclick="closeModals()" class="mt-4 text-gray-300 font-bold">退出</button>
        </div>
    </div>

    <script>
        let state = { user: null, tasks: [], achievements: [], rewards: [] };
        let taskForm = { isRecurring: false, days: [], editId: null };
        let manageForm = { mode: 'rewards', editId: null };
        
        // Timer State
        let timer = { timeLeft: 1500, totalTime: 1500, isRunning: false, interval: null, mode: 'focus' };

        const api = async (p, m='GET', b=null) => {
            const r = await fetch('/api/'+p, { method: m, headers: {'Content-Type': 'application/json'}, body: b ? JSON.stringify(b) : null });
            return await r.json();
        };

        const load = async () => {
             const [u, t, a, r] = await Promise.all([api('user'), api('tasks'), api('achievements'), api('rewards')]);
             state = { user: u, tasks: t, achievements: a, rewards: r };
             
             // Sync active days
             const d = new Date();
             const todayStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
             if(u.lastLoginDate !== todayStr) {
                const updated = await api('user', 'POST', { lastLoginDate: todayStr, activeDays: (u.activeDays || 0) + 1 });
                state.user = updated;
             }
             render();
        };

        const isToday = (t) => {
            const d = new Date();
            const todayStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            if(t.isRecurring) return t.days && t.days.includes(d.getDay());
            return t.dueDate === todayStr;
        };

        const getProgress = (item) => {
            const { user: u, tasks } = state;
            if(item.type === 'totalTasks') return Math.min(100, (tasks.filter(t=>t.completed).length / (item.targetValue || 1)) * 100);
            if(item.type === 'daysCount') return Math.min(100, (u.activeDays / (item.targetValue || 1)) * 100);
            if(item.type === 'totalXP') return Math.min(100, (u.xp / (item.targetValue || 100)) * 100);
            if(item.type === 'specificTask') {
                const target = tasks.find(t=>t.id === item.targetValue);
                return target && target.completed ? 100 : 0;
            }
            return 0;
        };

        const render = () => {
             const { user: u, tasks, achievements: achs, rewards } = state;
             if(!u) return;
             document.getElementById('welcome-name').innerText = u.name;
             document.getElementById('stat-days').innerText = u.activeDays;
             document.getElementById('stat-level').innerText = u.level;
             document.getElementById('stat-xp').innerText = u.xp;
             document.getElementById('stat-xp-max').innerText = u.xpToNextLevel;

             // Dashboard Tasks
             const tToday = tasks.filter(t => isToday(t));
             document.getElementById('stat-today-progress').innerText = tToday.filter(t=>t.completed).length + '/' + tToday.length;
             const tDash = document.getElementById('dashboard-task-list');
             tDash.innerHTML = tToday.length ? '' : '<p class="text-center text-gray-200 py-10 text-sm">今日无挑战，尽情放松吧</p>';
             tToday.forEach(t => {
                const div = document.createElement('div');
                div.className = \`flex items-center justify-between p-4 bg-gray-50 rounded-[25px] \${t.completed ? 'opacity-40' : ''}\`;
                div.innerHTML = \`<div class="flex items-center gap-3"><button onclick="toggleTask('\${t.id}', \${!t.completed})" class="w-6 h-6 rounded-lg shadow-sm border-2 \${t.completed ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-100'}"><i data-lucide="check" class="w-4 h-4 text-white \${t.completed ? '' : 'hidden'}"></i></button><span class="text-sm font-bold \${t.completed ? 'line-through text-gray-400' : ''}">\${t.title}</span></div><span class="text-[10px] font-bold text-gray-300">\${t.xp} XP</span>\`;
                tDash.appendChild(div);
             });

             // Dashboard Ach snapshots
             const achDash = document.getElementById('dashboard-ach-list');
             achDash.innerHTML = '';
             let count = 0;
             achs.forEach(a => { if(getProgress(a) >= 100) { achDash.innerHTML += '<div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm">✨</div>'; count++; } });
             if(!count) achDash.innerHTML = '<p class="text-xs text-gray-300">还没有荣誉哦</p>';

             // Dashboard Rewards
             const rDash = document.getElementById('dashboard-reward-list');
             rDash.innerHTML = '';
             rewards.slice(0, 3).forEach(r => {
                const p = getProgress(r);
                rDash.innerHTML += \`<div class="space-y-2"><div class="flex justify-between items-center"><span class="text-xs font-bold text-gray-600 truncate pr-4">\${r.title}</span><span class="text-[10px] text-orange-400 font-bold">\${Math.round(p)}%</span></div><div class="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden"><div class="bg-orange-400 h-full transition-all duration-700" style="width:\${p}%"></div></div></div>\`;
             });

             // Task Tab
             const tFull = document.getElementById('task-list');
             tFull.innerHTML = '';
             tasks.forEach(t => {
                const div = document.createElement('div');
                div.className = 'bg-white p-5 rounded-[35px] border border-gray-100 flex items-center justify-between';
                div.innerHTML = \`<div><p class="font-bold">\${t.title}</p><p class="text-[10px] text-gray-300">\${t.isRecurring ? '每周' : t.dueDate} | \${t.xp}XP</p></div><div class="flex gap-2"><button onclick="openTaskModal('\${t.id}')" class="text-gray-200 hover:text-rose-500"><i data-lucide="edit-3" class="w-4 h-4"></i></button><button onclick="deleteTask('\${t.id}')" class="text-gray-200 hover:text-rose-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>\`;
                tFull.appendChild(div);
             });

             // Honor Tab
             const achGrid = document.getElementById('achievement-grid');
             achGrid.innerHTML = '';
             achs.forEach(a => {
                const p = getProgress(a);
                achGrid.innerHTML += \`<div class="bg-white p-6 rounded-[35px] text-center space-y-2 \${p>=100 ? 'shadow-lg shadow-amber-50' : 'grayscale opacity-30 border border-dashed'}\"><div class="text-4xl">\${p>=100 ? '🏆' : '🔒'}</div><p class="font-bold text-xs truncate">\${a.title}</p></div>\`;
             });

             // Reward Tab
             const rewFull = document.getElementById('reward-full-list');
             rewFull.innerHTML = '';
             rewards.forEach(r => {
                 const p = getProgress(r);
                 rewFull.innerHTML += \`<div class="bg-white p-6 rounded-[40px] border border-gray-50 shadow-sm flex flex-col gap-4"><div class="flex items-center gap-4"><div class="text-3xl">🎁</div><div class="flex-1 overflow-hidden"><h4 class="font-bold truncate">\${r.title}</h4><p class="text-[10px] text-gray-400">条件: \${r.type} | 目标: \${r.targetValue}</p></div></div><div class="flex items-center gap-3"><div class="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden"><div class="bg-orange-400 h-full" style="width:\${p}%"></div></div><button class="px-5 py-2 rounded-xl text-xs font-bold \${p>=100?'bg-orange-500 text-white shadow-lg shadow-orange-100':'bg-white border text-gray-200 disabled cursor-not-allowed'}">\${p>=100?'兑换':'未达成'}</button></div></div>\`;
             });

             updateTimerUI();
             lucide.createIcons();
        };

        const switchTab = (tab) => {
            document.querySelectorAll('.tab-view').forEach(v => v.classList.add('hidden'));
            document.getElementById('tab-' + tab).classList.remove('hidden');
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('nav-active'));
            window.scrollTo({top:0, behavior:'smooth'});
        };

        // Timer Logic
        const setTimerMode = (m) => {
             timer.mode = m;
             const times = { focus: 1500, short: 300, long: 900 };
             timer.totalTime = times[m];
             timer.timeLeft = times[m];
             timer.isRunning = false;
             clearInterval(timer.interval);
             
             document.querySelectorAll('.timer-mode-btn').forEach(b => {
                b.className = 'timer-mode-btn px-4 py-1 rounded-full text-xs font-bold border transition-all';
                if(b.innerText === (m==='focus'?'专注':m==='short'?'短休':'长休')) {
                    b.classList.add('bg-indigo-50', 'text-indigo-600', 'border-indigo-200');
                } else {
                    b.classList.add('bg-gray-50', 'text-gray-400', 'border-transparent');
                }
             });
             updateTimerUI();
        };

        const updateTimerUI = () => {
             const m = Math.floor(timer.timeLeft / 60);
             const s = timer.timeLeft % 60;
             document.getElementById('timer-display').innerText = \`\${m}:\${String(s).padStart(2,'0')}\`;
             
             const progress = 553 - (553 * (timer.timeLeft / timer.totalTime));
             document.getElementById('timer-progress').style.strokeDashoffset = progress;
             document.getElementById('btn-timer-start').innerText = timer.isRunning ? '暂停' : '开始';
             document.getElementById('btn-timer-start').classList.toggle('pomodoro-active', timer.isRunning);
        };

        const toggleTimer = () => {
            if(timer.isRunning) {
                clearInterval(timer.interval);
                timer.isRunning = false;
            } else {
                timer.isRunning = true;
                timer.interval = setInterval(() => {
                    timer.timeLeft--;
                    if(timer.timeLeft <= 0) {
                        clearInterval(timer.interval);
                        timer.isRunning = false;
                        alert('专注完成！休息一下吧。');
                        resetTimer();
                    }
                    updateTimerUI();
                }, 1000);
            }
            updateTimerUI();
        };

        const resetTimer = () => {
             clearInterval(timer.interval);
             timer.isRunning = false;
             timer.timeLeft = timer.totalTime;
             updateTimerUI();
        };

        // Other Modals & CRUD (Same as before but polished)
        const openTaskModal = (id = null) => {
             taskForm.editId = id;
             if(id) {
                 const t = state.tasks.find(x=>x.id===id);
                 document.getElementById('task-title').value = t.title;
                 document.getElementById('task-xp').value = t.xp;
                 document.getElementById('task-date').value = t.dueDate || '';
                 setTaskType(t.isRecurring);
                 currentTaskDays = t.isRecurring ? [...t.days] : [];
                 document.querySelectorAll('.day-badge').forEach((b,i) => { b.classList.toggle('active', currentTaskDays.includes([1,2,3,4,5,6,0][i])); });
             } else {
                 document.getElementById('task-title').value = '';
                 document.getElementById('task-xp').value = 10;
                 setTaskType(false);
                 currentTaskDays = [];
                 document.querySelectorAll('.day-badge').forEach(b => b.classList.remove('active'));
             }
             document.getElementById('modal-task').classList.remove('hidden');
        };
        const setTaskType = (is) => {
             taskForm.isRecurring = is;
             document.getElementById('box-t-loop').classList.toggle('hidden', !is);
             document.getElementById('box-t-once').classList.toggle('hidden', is);
             document.getElementById('btn-t-once').className = !is ? 'bg-rose-500 text-white py-3 rounded-2xl text-xs font-bold' : 'bg-gray-50 text-gray-300 py-3 rounded-2xl text-xs font-bold';
             document.getElementById('btn-t-loop').className = is ? 'bg-rose-500 text-white py-3 rounded-2xl text-xs font-bold' : 'bg-gray-50 text-gray-300 py-3 rounded-2xl text-xs font-bold';
        };
        const toggleDay = (d, el) => {
             const idx = currentTaskDays.indexOf(d);
             if(idx > -1) currentTaskDays.splice(idx, 1); else currentTaskDays.push(d);
             el.classList.toggle('active');
        };
        const saveTask = async () => {
             const title = document.getElementById('task-title').value;
             if(!title) return;
             const task = { title, xp: parseInt(document.getElementById('task-xp').value), isRecurring: taskForm.isRecurring, days: currentTaskDays, dueDate: document.getElementById('task-date').value, completed: false };
             const res = await api('tasks', 'POST', { action: taskForm.editId ? 'edit' : 'add', taskId: taskForm.editId, task });
             state.tasks = res.tasks; state.user = res.user; render(); closeModals();
        };
        const toggleTask = async (id, c) => {
             const res = await api('tasks', 'POST', { action: 'complete', taskId: id, completed: c });
             state.tasks = res.tasks; state.user = res.user; render();
        };
        const deleteTask = async (id) => {
             if(!confirm('确定删除此挑战吗？')) return;
             const res = await api('tasks', 'POST', { action: 'delete', taskId: id });
             state.tasks = res.tasks; state.user = res.user; render();
        };

        const openManageModal = (mode) => {
             manageForm.mode = mode;
             manageForm.editId = null;
             document.getElementById('manage-title').innerText = mode === 'rewards' ? '奖品方案' : '荣誉方案';
             refreshManageList();
             const sel = document.getElementById('mg-task-sel');
             sel.innerHTML = '<option value="">-- 选择目标任务 --</option>';
             state.tasks.forEach(t => sel.innerHTML += \`<option value="\${t.id}">\${t.title}</option>\`);
             document.getElementById('modal-manage').classList.remove('hidden');
        };
        const toggleMgExtra = () => {
             const t = document.getElementById('mg-type').value;
             document.getElementById('box-mg-task').classList.toggle('hidden', t !== 'specificTask');
             document.getElementById('box-mg-val').classList.toggle('hidden', t === 'specificTask');
        };
        const refreshManageList = () => {
             const list = document.getElementById('manage-list');
             list.innerHTML = '';
             const items = manageForm.mode === 'rewards' ? state.rewards : state.achievements;
             items.forEach(it => {
                 list.innerHTML += \`<div class="flex justify-between items-center bg-gray-50 p-4 rounded-[25px] border border-gray-100"><span class="text-sm font-bold truncate pr-4">\${it.title}</span><div class="flex gap-2"><button onclick="editManageItem('\${it.id}')" class="text-gray-300 hover:text-indigo-400"><i data-lucide="edit-2" class="w-4 h-4"></i></button><button onclick="deleteManageItem('\${it.id}')" class="text-gray-300 hover:text-rose-400"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div></div>\`;
             });
             lucide.createIcons();
        };
        const editManageItem = (id) => {
             const items = manageForm.mode === 'rewards' ? state.rewards : state.achievements;
             const it = items.find(x=>x.id===id);
             manageForm.editId = id;
             document.getElementById('mg-title').value = it.title;
             document.getElementById('mg-type').value = it.type || 'totalTasks';
             document.getElementById('mg-val').value = it.targetValue || 0;
             document.getElementById('mg-task-sel').value = it.targetValue || '';
             document.getElementById('mg-submit-btn').innerText = '保存修改';
             toggleMgExtra();
        };
        const submitManage = async () => {
             const title = document.getElementById('mg-title').value;
             const type = document.getElementById('mg-type').value;
             const val = type === 'specificTask' ? document.getElementById('mg-task-sel').value : parseInt(document.getElementById('mg-val').value);
             if(!title) return;
             const item = { title, type, targetValue: val };
             const endpoint = manageForm.mode === 'rewards' ? 'rewards' : 'achievements';
             const action = manageForm.editId ? 'edit' : 'add';
             const res = await api(endpoint, 'POST', { action, itemId: manageForm.editId, item });
             if(manageForm.mode === 'rewards') state.rewards = res; else state.achievements = res;
             manageForm.editId = null;
             document.getElementById('mg-title').value = '';
             document.getElementById('mg-submit-btn').innerText = '新增项目';
             refreshManageList(); render();
        };
        const deleteManageItem = async (id) => {
             const endpoint = manageForm.mode === 'rewards' ? 'rewards' : 'achievements';
             const res = await api(endpoint, 'POST', { action: 'delete', itemId: id });
             if(manageForm.mode === 'rewards') state.rewards = res; else state.achievements = res;
             refreshManageList(); render();
        };

        const saveUser = async () => {
             const name = document.getElementById('set-name').value;
             if(!name) return;
             state.user = await api('user', 'POST', { name });
             alert('保存成功！');
             render();
        };

        const closeModals = () => document.querySelectorAll('.fixed.inset-0').forEach(m => m.classList.add('hidden'));

        load();
    </script>
</body>
</html>
`;
                return new Response(html, { headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
            }

            return jsonResponse({ error: 'Endpoint not found' }, 404);

        } catch (err) {
            return jsonResponse({ error: err.message }, 500);
        }
    },
};
