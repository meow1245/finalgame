// --- 彩蛋攝影機 ---
let cameraEasterEggShown = false;
let cameraX = 100;
let cameraY = 100;

// 載入攝影機圖示
const cameraIconImage = new Image();
cameraIconImage.src = "img/camera.png"; // 確保這張圖存在
cameraIconImage.onload = () => console.log("攝影機圖示載入成功");
cameraIconImage.onerror = () => console.error("攝影機圖示載入失敗");

// --- 日記內容（15 頁） ---
const journalPages = [
    "第 1 天：觀察對象已成功進入模擬校園，初始狀態穩定，尚未察覺異常。記錄飢餓與壓力反應正常。",
    "第 2 天：主體展現出高度適應力，開始探索環境。部分記憶模組成功觸發，與其他NPC互動頻率提升。",
    "第 3 天：日誌補錄：今天課上得不錯，但還是不太習慣一個人吃飯。希望能快點交到朋友。",
    "第 4 天：偵測到主體夜間夢境出現校園崩壞片段，判定為潛在系統干擾。將觀察是否影響白天行為。",
    "第 5 天：日誌：我夢到有人在監視我。醒來後感覺整個校園變得很陌生，有些角落好像我從沒去過。",
    "第 6 天：主體與任務環節交互增多，動機維持穩定。注意：開始質疑任務意義。",
    "第 7 天：日誌：為什麼每個人都在重複一樣的對話？我問了三次，社團負責人說的話一模一樣。",
    "第 8 天：訊號干擾導致部分記憶記錄模糊，嘗試補救。主體對於時間流動出現懷疑，已回報技術部門。",
    "第 9 天：日誌：今天的天空沒有太陽。我查了天氣預報，上面只有一行字：『維持穩定』。",
    "第 10 天：實驗進度正常。主體尚未明顯覺察本計畫存在。監視設備保持運作。",
    "第 11 天：日誌：我看到牆上有攝影機，而且它動了！我本來以為是裝飾，但我感覺……我被盯著。",
    "第 12 天：主體嘗試避開既定行程，已導引回正軌。推測為系統壓力所致，進行行為微調中。",
    "第 13 天：日誌：我發現筆記本上有別人寫的日記——內容竟然跟我一樣？難道……不只有我一個人？",
    "第 14 天：主體進入高度警覺狀態，心率上升。記憶區域出現回寫阻抗。或已觸及實驗邊界。",
    "第 15 天：警告！主體疑似發現實驗本質，已與觀察設備接觸，需緊急處理。進入終端階段……"
];
let currentPage = 0;
function updateEasterEggTrigger() {
    if (day >= 1 && !cameraEasterEggShown) {
        cameraEasterEggShown = true;
        cameraX = 0;
        cameraY = 0;
    }
}





// 初始化 Firebase
const firebaseConfig = {
  apiKey: "AIzaSyALYLemGImkdyEOb9bqKLfUqCdIZC1_5Iw",
  authDomain: "final1-8577a.firebaseapp.com",
  databaseURL: "https://final1-8577a-default-rtdb.firebaseio.com",
  projectId: "final1-8577a",
  storageBucket: "final1-8577a.firebasestorage.app",
  messagingSenderId: "857464222763",
  appId: "1:857464222763:web:0b4726c43670540f15666e"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();




const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const hungerDisplay = document.getElementById("hunger");
const healthDisplay = document.getElementById("health");
const hungerBar = document.getElementById("hungerBar");
const healthBar = document.getElementById("healthBar");
const scoreDisplay = document.getElementById("score");
const dayDisplay = document.getElementById("day");
const weatherDisplay = document.getElementById("weather");
const equippedWeaponDisplay = document.getElementById("equippedWeapon");

const thunderSound = document.getElementById("thunderSound");
const rainSound = document.getElementById("rainSound");

const gameOverScreen = document.getElementById("game-over-screen");
const endingText = document.getElementById("ending-text");
const scoreText = document.getElementById("score-text");
const restartButton = document.getElementById("restart-button");

const inventoryDisplay = document.getElementById("inventory");

// 對話框元素
const buildingDialog = document.getElementById("building-dialog");
const dialogTitle = document.getElementById("dialog-title");
const dialogText = document.getElementById("dialog-text");

// 任務 UI 元素
const taskUI = document.getElementById('task-ui');

const mapWidth = 6000;
const mapHeight = 6000;

const player = {
    x: mapWidth / 2,
    y: mapHeight / 2,
    size: 30,
    baseSpeed: 200,
    speed: 200,
    inventory: [],
    equipped: {
        weapon: null,
    },
    activeEffects: {
        noSlow: false,
        lightningImmune: false,
    },
    effectEndDay: {
        noSlow: 0,
        lightningImmune: 0,
    },
    major: null, // 玩家主修屬性，初始為 null
    hasChosenMajor: false, // 新增：是否已選擇主修
};

let backgroundImage = new Image();
backgroundImage.src = 'img/校園.png';
let backgroundLoaded = false;

backgroundImage.onload = () => {
    backgroundLoaded = true;
    console.log("背景圖片載入完成！");
};
backgroundImage.onerror = () => {
    console.error("背景圖片載入失敗！請檢查路徑。");
};

let hunger;
let health;
let score;
let gameOver;
let day;
let isDaytime;

let foodCollected;
let damageTaken;
let animationId;
let gamePaused = false; // 遊戲暫停狀態

let lastDaySwitch;
let lastWeatherChange;
let lastLightningStrike;

const keys = {};
let foodItems = []; // 地圖上隨機生成的食物
let buildings = [];
let items = []; // 地圖上隨機生成的其他物品

let selectedItemIndex = -1;

let riotStudents = [];
const weaponDamage = 1;
const studentInitialHealth = 5;
const studentAttackDamage = 10;
const studentAttackCooldown = 1500;
const studentSpeed = 2;
const studentSpawnDay = 5;
let studentsSpawned = false;

const weatherTypes = ["sunny", "rain", "storm"];
let currentWeather;

// 全域陣列，儲存所有可能的任務定義
let allPossibleTasks = [];

// 新增任務計數器
let successfulScienceTasksCount = 0;
let failedScienceTasksCount = 0;
let successfulArtsTasksCount = 0; // 新增文組任務成功計數
let failedArtsTasksCount = 0; // 新增文組任務失敗計數

const REQUIRED_SUCCESSFUL_TASKS = 3; // 避免退學所需的成功任務數
const MAX_FAILED_TASKS = 3; // 觸發退學結局的失敗任務數

// 小遊戲 1 (籃球) 相關變數
const minigame1Modal = document.getElementById('minigame1-modal');
const minigame1Instructions = document.getElementById('minigame1-instructions');
const startMinigame1Button = document.getElementById('start-minigame1-button');
const minigame1GameArea = document.getElementById('minigame1-game-area');
const minigame1ResultsScreen = document.getElementById('minigame1-results-screen');
const minigame1ResultText = document.getElementById('minigame1-result-text');
const minigame1ExitButton = document.getElementById('minigame1-exit-button');

const minigame1Canvas = document.getElementById('minigame1Canvas');
const minigame1Ctx = minigame1Canvas.getContext('2d');
const minigame1ShootButton = document.getElementById('minigame1-shoot-button');
const minigame1TimeDisplay = document.getElementById('minigame1-time');
const minigame1ScoreDisplay = document.getElementById('minigame1-score');

let minigame1Active = false;
let minigame1Score = 0;
let minigame1Time = 0;
let minigame1TimerInterval;
let minigame1AnimationFrameId;
let currentMinigame1Reward = {}; // 儲存當前小遊戲的獎勵
let currentMinigame1Penalty = {}; // 儲存當前小遊戲的懲罰

// 籃球小遊戲元素
const ball = {
    x: minigame1Canvas.width / 2,
    y: minigame1Canvas.height - 20,
    radius: 10,
    vy: 0,
    active: false
};
const hoop = {
    x: minigame1Canvas.width / 2,
    y: 50,
    width: 60,
    height: 10
};
let hoopSpeed = 1;
const GRAVITY = 0.5;
const SHOOT_VELOCITY = -16;

// 小問答相關變數 (工程二館)
const quizModal = document.getElementById('quiz-modal');
const quizInstructions = document.getElementById('quiz-instructions');
const startQuizButton = document.getElementById('start-quiz-button');
const quizGameArea = document.getElementById('quiz-game-area');
const quizQuestionDisplay = document.getElementById('quiz-question');
const quizOptionsContainer = document.getElementById('quiz-options');
const quizOptionButtons = quizOptionsContainer.querySelectorAll('.quiz-option-button');
const quizScoreDisplay = document.getElementById('quiz-score-display');
const quizCurrentQuestionNum = document.getElementById('quiz-current-question-num');
const quizResultsScreen = document.getElementById('quiz-results-screen');
const quizResultText = document.getElementById('quiz-result-text');
const quizExitButton = document.getElementById('quiz-exit-button');

let quizActive = false;
let currentQuizQuestionIndex = 0;
let currentQuizScore = 0;
const QUIZ_REQUIRED_CORRECT = 3; // 問答成功所需答對題數

// 問答題目定義
const scienceQuizQuestions = [{
        question: "以下哪種元素是地球大氣中最豐富的？",
        options: ["氧氣", "氮氣", "二氧化碳", "氬氣"],
        correctAnswer: "氮氣"
    },
    {
        question: "光速大約是多少公里/秒？",
        options: ["30萬", "3萬", "300萬", "3000萬"],
        correctAnswer: "30萬"
    },
    {
        question: "以下哪種力負責將行星維持在軌道上？",
        options: ["電磁力", "弱核力", "重力", "強核力"],
        correctAnswer: "重力"
    },
    {
        question: "水的化學式是什麼？",
        options: ["CO2", "H2O", "O2", "NaCl"],
        correctAnswer: "H2O"
    },
    {
        question: "太陽系中最大的行星是哪一顆？",
        options: ["地球", "火星", "木星", "土星"],
        correctAnswer: "木星"
    },
];

const artsQuizQuestions = [{
        question: "中國四大名著不包括以下哪一部？",
        options: ["紅樓夢", "西遊記", "水滸傳", "聊齋志異"],
        correctAnswer: "聊齋志異"
    },
    {
        question: "莎士比亞的四大悲劇不包括以下哪一部？",
        options: ["哈姆雷特", "奧賽羅", "羅密歐與茱麗葉", "李爾王"],
        correctAnswer: "羅密歐與茱麗葉"
    },
    {
        question: "以下哪位是古希臘哲學家？",
        options: ["亞里斯多德", "牛頓", "愛因斯坦", "達爾文"],
        correctAnswer: "亞里斯多德"
    },
    {
        question: "《蒙娜麗莎》是哪位藝術家的作品？",
        options: ["梵谷", "畢卡索", "達文西", "莫內"],
        correctAnswer: "達文西"
    },
    {
        question: "以下哪種樂器不屬於弦樂器？",
        options: ["小提琴", "大提琴", "鋼琴", "吉他"],
        correctAnswer: "鋼琴"
    },
];

// Boss 戰射擊小遊戲 (Minigame 2) 相關變數
const minigame2Modal = document.getElementById('minigame2-modal');
const minigame2Instructions = document.getElementById('minigame2-instructions');
const startMinigame2Button = document.getElementById('start-minigame2-button');
const minigame2GameArea = document.getElementById('minigame2-game-area');
const minigame2ResultsScreen = document.getElementById('minigame2-results-screen');
const minigame2ResultText = document.getElementById('minigame2-result-text');
const minigame2ExitButton = document.getElementById('minigame2-exit-button');

const minigame2Canvas = document.getElementById('minigame2Canvas');
const minigame2Ctx = minigame2Canvas.getContext('2d');
const minigame2ShootButton = document.getElementById('minigame2-shoot-button');
const minigame2TimeDisplay = document.getElementById('minigame2-time'); // Boss 戰的時間顯示
const minigame2PlayerHealthDisplay = document.getElementById('minigame2-player-health'); // Boss 戰玩家血量顯示
const minigame2ProfessorHealthDisplay = document.getElementById('minigame2-professor-health'); // Boss 戰教授血量顯示

const BOSS_MINIGAME_WIDTH = 400;
const BOSS_MINIGAME_HEIGHT = 300;
const BOSS_PLAYER_SIZE = 20;
const BOSS_PROFESSOR_SIZE = 30;
const BOSS_PROJECTILE_SIZE = 5;
const BOSS_PLAYER_PROJECTILE_SPEED = 10;
const BOSS_PROFESSOR_PROJECTILE_SPEED = 5;
const BOSS_PROFESSOR_FIRE_RATE = 2000; // 教授射擊間隔 (毫秒)
const BOSS_BATTLE_DURATION = 30; // 遊戲時間 (秒)

let bossMinigamePlayer, bossMinigameProfessor, bossMinigamePlayerProjectiles, bossMinigameProfessorProjectiles;
let bossMinigameTimer, bossMinigameAnimationFrameId;
let bossProfessorLastFired = 0;
let bossBattleResult = false; // 記錄 Boss 戰結果 (true 為勝利，false 為失敗)

// 魅惑暴走學生相關變數
let isStudentCharmed = false; // 全域變數，追蹤是否已有學生被魅惑


document.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    if (e.key === " ") {
        e.preventDefault(); // 防止空白鍵滾動頁面
        pickupItem();
    }
    if (e.key === "j" || e.key === "J") {
        useSelectedItem();
    }
    if (e.key === "k" || e.key === "K") {
        dropSelectedItem();
    }

    const numKey = parseInt(e.key);
    if (!isNaN(numKey) && numKey >= 1 && numKey <= player.inventory.length && numKey <= 9) {
        selectedItemIndex = numKey - 1;
        updateInventoryDisplay();
        if (player.inventory[selectedItemIndex]) {
            console.log(`選中物品：${player.inventory[selectedItemIndex].name}`);
        }
    }

    if (e.key === "Shift") {
        player.speed = player.baseSpeed * 2;
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
    if (e.key === "Shift") {
        player.speed = player.baseSpeed;
    }
});

canvas.addEventListener("click", (event) => {


    if (gamePaused) return; // 遊戲暫停時不處理主遊戲點擊事件

    const rect = canvas.getBoundingClientRect();
const clickX = event.clientX - rect.left;
const clickY = event.clientY - rect.top;

const offsetX = player.x - canvas.width / 2;
const offsetY = player.y - canvas.height / 2;

const cameraXOnCanvas = cameraX - offsetX;
const cameraYOnCanvas = cameraY - offsetY;

if (cameraEasterEggShown &&
    clickX >= cameraXOnCanvas && clickX <= cameraXOnCanvas + 64 &&
    clickY >= cameraYOnCanvas && clickY <= cameraYOnCanvas + 64) {
    openEasterEggJournal();
    return;
}





    // 建築物互動邏輯
    for (let b of buildings) {
        // 計算建築物在 Canvas 上的實際位置
        const bxOnCanvas = b.x - (player.x - canvas.width / 2);
        const byOnCanvas = b.y - (player.y - canvas.height / 2);

        // 檢查點擊是否在建築物範圍內
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        if (clickX >= bxOnCanvas && clickX <= bxOnCanvas + b.width &&
            clickY >= byOnCanvas && clickY <= byOnCanvas + b.height) {

            // 只有在玩家靠近建築物時才觸發效果
            const dx = player.x - (b.x + b.width / 2);
            const dy = player.y - (b.y + b.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100) { // 擴大互動距離，讓點擊更容易
                handleBuildingInteraction(b); // 統一處理建築物互動
                break; // 每次點擊只處理一個建築物
            } else {
                // 如果點擊建築物但玩家不夠近，可以顯示一個提示
                updateBuildingDialog("提示", "你離這棟建築物太遠了，無法互動。");
            }
        }
    }

    // 玩家攻擊邏輯 (如果裝備了武器)
    if (player.equipped.weapon) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const worldClickX = player.x - (canvas.width / 2) + mouseX;
        const worldClickY = player.y - (canvas.height / 2) + mouseY;

        for (let i = riotStudents.length - 1; i >= 0; i--) {
            const student = riotStudents[i];
            const distToStudent = Math.sqrt(
                (worldClickX - student.x) * (worldClickX - student.x) +
                (worldClickY - student.y) * (worldClickY - student.y)
            );
            if (distToStudent < student.size + player.size / 2) {
                student.health -= weaponDamage;
                console.log(`攻擊暴動學生！學生血量：${student.health}`);
                if (student.health <= 0) {
                    riotStudents.splice(i, 1);
                    score += 50;
                    console.log("擊殺暴動學生！");
                }
                break;
            }
        }
    }
});

function openEasterEggJournal() {
    document.getElementById("easter-egg-journal").style.display = "flex";
    currentPage = 0;
    updateJournalPage();
}

function updateJournalPage() {
    document.getElementById("journal-page-num").textContent = currentPage + 1;
    document.getElementById("journal-text").textContent = journalPages[currentPage];
    document.getElementById("prev-journal").disabled = currentPage === 0;
    document.getElementById("next-journal").disabled = currentPage === journalPages.length - 1;
    document.getElementById("trigger-ending").style.display =
        currentPage === journalPages.length - 1 ? "inline-block" : "none";
}

document.getElementById("prev-journal").onclick = () => {
    if (currentPage > 0) {
        currentPage--;
        updateJournalPage();
    }
};

document.getElementById("next-journal").onclick = () => {
    if (currentPage < journalPages.length - 1) {
        currentPage++;
        updateJournalPage();
    }
};

document.getElementById("trigger-ending").onclick = () => {
    document.getElementById("easter-egg-journal").style.display = "none";
    endGame(day, "easter_ending");
};






/**
 * 處理建築物互動的統一函數。
 * @param {object} building 被點擊的建築物物件。
 */
function handleBuildingInteraction(building) {
    // --- 最高優先級：主修選擇 (行政大樓) ---
    if (building.type === 'major-choice') {
        if (player.hasChosenMajor) { // 已選擇過主修
            updateBuildingDialog("提示", "你已經選擇過主修了，無法再次選擇。");
            return;
        }

        if (day >= building.availableDay) { // 達到可選主修的日期
            showMajorSelectionScreen(); // 顯示主修選擇畫面
            updateBuildingDialog(building.dialogTitle, building.dialogText); // 傳遞原始對話
            // 確保主修選擇任務被標記為已接取 (如果尚未接取)
            const majorTask = allPossibleTasks.find(t => t.id === 'major_choice_task');
            if (majorTask && !majorTask.accepted) {
                majorTask.accepted = true;
                updateTaskUI(); // 更新任務 UI
            }
            return; // 行政大樓的主要功能已處理，直接返回
        } else {
            updateBuildingDialog("提示", `你必須在第 ${building.availableDay} 天才能選擇主修。`);
            return; // 不在可用天數，直接返回
        }
    }

    // --- 優先級：處理所有任務相關的建築物互動 (無論建築物類型) ---
    // 遍歷所有任務，檢查當前建築物是否與任何任務相關
    let taskHandled = false; // 標記是否已經處理了任務相關的互動

    for (let task of allPossibleTasks) {
        // 確保任務未完成且已開放
        if (!task.completed && day >= task.requiredDay) {
            // 檢查任務是否與當前建築物相關
            if (building.name === task.startBuilding || building.name === task.targetBuilding || building.name === task.finalTargetBuilding) {

                // 檢查玩家主修是否符合任務類型
                if (task.isScienceTask && player.major !== 'science') {
                    continue; // 跳過不符合主修的理組任務
                }
                if (task.isArtsTask && player.major !== 'arts') {
                    continue; // 跳過不符合主修的文組任務
                }
                // 通識課任務需要已選擇主修
                if (task.isGeneralTask && !player.hasChosenMajor) {
                    continue; // 跳過未選主修的通識任務
                }


                // --- 小木屋跑腿任務 (errand_small_wooden_house) ---
                if (task.id === 'errand_small_wooden_house') {
                    if (building.name === task.startBuilding) { // 在小木屋
                        if (!task.accepted) { // 任務未接受
                            updateBuildingDialog("新任務！", task.dialog.offer + "<br><br>再次點擊建築物來接取任務。");
                            task.accepted = true; // 標記為已接受
                            updateTaskUI();
                            taskHandled = true;
                            break; // 處理完畢，跳出任務循環
                        } else if (task.accepted && !task.completed) { // 任務已接受但未完成
                            updateBuildingDialog("任務進行中", task.dialog.progress);
                            taskHandled = true;
                            break; // 處理完畢，跳出任務循環
                        }
                    } else if (building.name === task.targetBuilding && task.accepted && !task.completed) { // 在中央圖書館 (目標建築)
                        updateBuildingDialog("任務完成！", task.dialog.complete);
                        completeTask(task.id, true); // 任務成功
                        taskHandled = true;
                        break; // 處理完畢，跳出任務循環
                    }
                }

                // --- 理組任務 ---
                // 工程一館跑腿任務 (errand_eng1_eng4)
                if (task.id === 'errand_eng1_eng4') {
                    if (building.name === task.startBuilding) { // 在工程一館
                        if (task.stage === 0) { // 任務未接受
                            updateBuildingDialog("新任務！", task.dialog.offer + "<br><br>再次點擊建築物來接取任務。");
                            task.stage = 1; // 標記為已接受 (去Eng4)
                            task.accepted = true;
                            updateTaskUI();
                            taskHandled = true;
                            break;
                        } else if (task.stage === 1) { // 任務已接受，要去工程四館
                            updateBuildingDialog("任務進行中", task.dialog.progressStage1);
                            taskHandled = true;
                            break;
                        } else if (task.stage === 2) { // 已到過工程四館，回來工程一館完成任務
                            updateBuildingDialog("任務完成！", task.dialog.complete);
                            completeTask(task.id, true); // 任務成功
                            taskHandled = true;
                            break;
                        }
                    } else if (building.name === task.targetBuilding && task.stage === 1) { // 在工程四館 (中間目標)
                        updateBuildingDialog("任務進度更新！", task.dialog.progressStage2);
                        task.stage = 2; // 標記為已到過工程四館
                        updateTaskUI();
                        taskHandled = true;
                        break;
                    }
                }
                // 工程二館問答任務 (quiz_eng2)
                if (task.id === 'quiz_eng2') {
                    if (building.name === task.startBuilding) { // 在工程二館
                        if (!task.accepted) { // 任務未接受
                            updateBuildingDialog("新任務！", task.dialog.offer + "<br><br>再次點擊建築物來開始問答。");
                            task.accepted = true; // 標記為已接受
                            updateTaskUI();
                            taskHandled = true;
                            break;
                        } else if (task.accepted) { // 任務已接受，開始問答
                            startQuizMinigame(task.id); // 啟動問答小遊戲
                            taskHandled = true;
                            break;
                        }
                    }
                }
                // 工程三館任務 (eng3_talk)
                if (task.id === 'eng3_talk') {
                    if (building.name === task.startBuilding) { // 在工程三館
                        if (!task.accepted) { // 任務未接受
                            updateBuildingDialog("新任務！", task.dialog.offer + "<br><br>再次點擊建築物來接受任務。");
                            task.accepted = true; // 標記為已接受
                            updateTaskUI();
                            taskHandled = true;
                            break;
                        } else if (task.accepted) { // 任務已接受，直接完成
                            updateBuildingDialog("任務完成！", task.dialog.complete);
                            completeTask(task.id, true); // 任務成功
                            taskHandled = true;
                            break;
                        }
                    }
                }
                // 工程四館任務 (eng4_get_food)
                if (task.id === 'eng4_get_food') {
                    if (building.name === task.startBuilding) { // 在工程四館
                        if (!task.accepted) { // 任務未接受
                            updateBuildingDialog("新任務！", task.dialog.offer + "<br><br>再次點擊建築物來接受任務。");
                            task.accepted = true; // 標記為已接受
                            updateTaskUI();
                            taskHandled = true;
                            break;
                        } else if (task.accepted) { // 任務已接受，直接完成
                            updateBuildingDialog("任務完成！", task.dialog.complete);
                            completeTask(task.id, true); // 任務成功
                            taskHandled = true;
                            break;
                        }
                    }
                }
                // 工程五館任務 (eng5_get_health)
                if (task.id === 'eng5_get_health') {
                    if (building.name === task.startBuilding) { // 在工程五館
                        if (!task.accepted) { // 任務未接受
                            updateBuildingDialog("新任務！", task.dialog.offer + "<br><br>再次點擊建築物來接受任務。");
                            task.accepted = true; // 標記為已接受
                            updateTaskUI();
                            taskHandled = true;
                            break;
                        } else if (task.accepted) { // 任務已接受，直接完成
                            updateBuildingDialog("任務完成！", task.dialog.complete);
                            completeTask(task.id, true); // 任務成功
                            taskHandled = true;
                            break;
                        }
                    }
                }

                // --- 文組任務 ---
                // 文學一館任務 (arts1_talk)
                if (task.id === 'arts1_talk') {
                    if (building.name === task.startBuilding) { // 在文學一館
                        if (!task.accepted) {
                            updateBuildingDialog("新任務！", task.dialog.offer + "<br><br>再次點擊建築物來接受任務。");
                            task.accepted = true;
                            updateTaskUI();
                            taskHandled = true;
                            break;
                        } else if (task.accepted) {
                            updateBuildingDialog("任務完成！", task.dialog.complete);
                            completeTask(task.id, true);
                            taskHandled = true;
                            break;
                        }
                    }
                }
                // 文學二館問答任務 (arts2_quiz)
                if (task.id === 'arts2_quiz') {
                    if (building.name === task.startBuilding) { // 在文學二館
                        if (!task.accepted) {
                            updateBuildingDialog("新任務！", task.dialog.offer + "<br><br>再次點擊建築物來開始問答。");
                            task.accepted = true;
                            updateTaskUI();
                            taskHandled = true;
                            break;
                        } else if (task.accepted) {
                            startQuizMinigame(task.id);
                            taskHandled = true;
                            break;
                        }
                    }
                }
                // 文學三館任務 (arts3_read)
                if (task.id === 'arts3_read') {
                    if (building.name === task.startBuilding) { // 在文學三館
                        if (!task.accepted) {
                            updateBuildingDialog("新任務！", task.dialog.offer + "<br><br>再次點擊建築物來接受任務。");
                            task.accepted = true;
                            updateTaskUI();
                            taskHandled = true;
                            break;
                        } else if (task.accepted) {
                            updateBuildingDialog("任務完成！", task.dialog.complete);
                            completeTask(task.id, true);
                            taskHandled = true;
                            break;
                        }
                    }
                }
                // 客家學院任務 1 (hakka1_explore)
                if (task.id === 'hakka1_explore') {
                    if (building.name === task.startBuilding) { // 在客家學院
                        if (!task.accepted) {
                            updateBuildingDialog("新任務！", task.dialog.offer + "<br><br>再次點擊建築物來接受任務。");
                            task.accepted = true;
                            updateTaskUI();
                            taskHandled = true;
                            break;
                        } else if (task.accepted) {
                            updateBuildingDialog("任務完成！", task.dialog.complete);
                            completeTask(task.id, true);
                            taskHandled = true;
                            break;
                        }
                    }
                }
                // 客家學院任務 2 (hakka2_quiz)
                if (task.id === 'hakka2_quiz') {
                    if (building.name === task.startBuilding) { // 在客家學院
                        if (!task.accepted) {
                            updateBuildingDialog("新任務！", task.dialog.offer + "<br><br>再次點擊建築物來開始問答。");
                            task.accepted = true;
                            updateTaskUI();
                            taskHandled = true;
                            break;
                        } else if (task.accepted) {
                            startQuizMinigame(task.id);
                            taskHandled = true;
                            break;
                        }
                    }
                }

                // --- 通識課任務 ---
                if (task.id === 'general_task_1' || task.id === 'general_task_2') {
                    if (building.name === task.startBuilding) {
                        if (!task.accepted) {
                            updateBuildingDialog("新任務！", task.dialog.offer + "<br><br>再次點擊建築物來接取任務。");
                            task.accepted = true;
                            updateTaskUI();
                            taskHandled = true;
                            break;
                        } else if (task.accepted) {
                            updateBuildingDialog("任務完成！", task.dialog.complete);
                            completeTask(task.id, true);
                            taskHandled = true;
                            break;
                        }
                    }
                }
            }
        }
    }

    // 如果有任務被處理，則直接返回，不執行後續的一般建築物邏輯
    if (taskHandled) {
        return;
    }


    // --- 優先級：理組/文組建築物 (需要判斷玩家主修，且沒有任務相關) ---
    if (building.type === 'science') {
        if (player.major !== 'science') {
            updateBuildingDialog("提示", "只有理組學生才能進入這棟建築物。");
            return;
        }
        // 如果沒有任務相關的互動，但玩家是理組學生，則執行一般理組建築互動
        if (!building.visited) {
            building.visited = true;
            if (building.effectHunger !== undefined) {
                player.inventory.push({
                    type: 'food',
                    name: '食物'
                }); // 給予食物
                updateInventoryDisplay();
                console.log(`拜訪 ${building.name}！獲得一個食物。`);
            }
            if (building.effectHealth !== undefined) {
                health = Math.min(health + building.effectHealth, 100);
                console.log(`拜訪 ${building.name}！血量 +${building.effectHealth}`);
            }
            if (building.effectScore !== undefined) {
                score += building.effectScore;
                console.log(`拜訪 ${building.name}！分數 +${building.effectScore}`);
            }
            updateBuildingDialog(building.dialogTitle, building.dialogTextScience || building.dialogText);
        } else {
            updateBuildingDialog(building.dialogTitle, `你已經拜訪過此地方了。`);
        }
        return;
    } else if (building.type === 'arts') {
        if (player.major !== 'arts') {
            updateBuildingDialog("提示", "只有文組學生才能進入這棟建築物。");
            return;
        }
        // 如果沒有任務相關的互動，但玩家是文組學生，則執行一般文組建築互動
        if (!building.visited) {
            building.visited = true;
            // 文學館可能也有自己的效果，這裡可以添加
            if (building.effectScore !== undefined) {
                score += building.effectScore;
                console.log(`拜訪 ${building.name}！分數 +${building.effectScore}`);
            }
            updateBuildingDialog(building.dialogTitle, building.dialogTextArts || building.dialogText);
        } else {
            updateBuildingDialog(building.dialogTitle, `你已經拜訪過此地方了。`);
        }
        return;
    }

    // --- Boss 戰建築物 (minigame2) ---
    if (building.type === 'minigame2' && building.minigameType === 'boss-battle') {
        if (day < building.availableDay) {
            updateBuildingDialog("提示", `期末考場將於第 ${building.availableDay} 天開放。`);
            return;
        }
        if (building.visited) {
            updateBuildingDialog(building.dialogTitle, "你已經參加過期末考了。");
        } else {
            // 標記建築物已拜訪，但實際遊戲結果會在小遊戲結束時決定
            building.visited = true;
            minigame2Modal.style.display = 'flex';
            minigame2Instructions.style.display = 'block';
            minigame2GameArea.style.display = 'none';
            minigame2ResultsScreen.style.display = 'none';
            gamePaused = true; // 暫停主遊戲
            updateBuildingDialog(building.dialogTitle, building.dialogText);
            startBossBattleMinigame(); // 開始 Boss 戰小遊戲
        }
        return;
    }


    // --- 其他建築物類型處理 (如果以上都沒有觸發) ---
    if (building.type === 'minigame1') { // 籃球小遊戲
        if (building.visited) {
            updateBuildingDialog(building.dialogTitle, `你今天已經玩過${building.name}了。請明天再來！`);
        } else {
            building.visited = true;
            minigame1Modal.style.display = 'flex';
            minigame1Instructions.style.display = 'block';
            minigame1GameArea.style.display = 'none';
            minigame1ResultsScreen.style.display = 'none';
            gamePaused = true;
            currentMinigame1Reward = {
                items: [{
                        type: 'food',
                        name: '食物'
                    },
                    {
                        type: 'umbrella',
                        name: '雨傘'
                    }
                ],
                health: 0, // 小遊戲勝利不再增加體力
                hunger: 0 // 小遊戲勝利不再減少飢餓
            };
            currentMinigame1Penalty = {
                health: -10,
                hunger: 15
            };
            updateBuildingDialog(building.dialogTitle, building.dialogText);
            startBasketballGame(currentMinigame1Reward, currentMinigame1Penalty);
        }
    } else if (building.type === 'general') { // General buildings (小木屋, 依仁堂, 中央圖書館, 松果餐廳)
        // 處理一般建築物的一次性效果 (如果沒有被任務處理)
        if (!building.visited) {
            building.visited = true;
            if (building.effectHunger !== undefined) {
                player.inventory.push({
                    type: 'food',
                    name: '食物'
                }); // 給予食物
                updateInventoryDisplay();
                console.log(`拜訪 ${building.name}！獲得一個食物。`);
            }
            if (building.effectHealth !== undefined) {
                health = Math.min(health + building.effectHealth, 100);
                console.log(`拜訪 ${building.name}！血量 +${building.effectHealth}`);
            }
            if (building.effectScore !== undefined) {
                score += building.effectScore;
                console.log(`拜訪 ${building.name}！分數 +${building.effectScore}`);
            }
            updateBuildingDialog(building.dialogTitle, building.dialogText);
        } else {
            updateBuildingDialog(building.dialogTitle, `你已經拜訪過此地方了。`);
        }
    } else if (building.type === 'special' && building.name === '神秘商店') {
        if (day !== studentSpawnDay) {
            updateBuildingDialog("提示", "這家商店只有在特殊時期才會出現。");
            return;
        }
        if (!building.visited) {
            building.visited = true;
            if (building.hasItem) {
                player.inventory.push({
                    type: "special",
                    name: "愛的香水"
                });
                updateInventoryDisplay();
                updateBuildingDialog(building.dialogTitle, "你獲得了「愛的香水」！");
                building.hasItem = false;
            } else {
                updateBuildingDialog(building.dialogTitle, "這裡已經沒有東西了。");
            }
        } else {
            updateBuildingDialog(building.dialogTitle, "你已經來過這裡了。");
        }
        return;
    }
}

// 主修選擇邏輯
const majorSelectionScreen = document.getElementById('major-selection-screen');
const selectScienceButton = document.getElementById('select-science-button');
const selectArtsButton = document.getElementById('select-arts-button');
const playerMajorDisplay = document.getElementById('playerMajor');

selectScienceButton.addEventListener('click', () => {
    player.major = 'science';
    player.hasChosenMajor = true; // 標記已選擇主修
    updatePlayerMajorDisplay();
    majorSelectionScreen.style.display = 'none';
    // 完成主修選擇任務
    const majorTask = allPossibleTasks.find(t => t.id === 'major_choice_task');
    if (majorTask) {
        majorTask.completed = true;
        successfulScienceTasksCount++; // 主修選擇也算一個成功任務
        updateTaskUI();
    }
    console.log("你選擇了理組！");
});

selectArtsButton.addEventListener('click', () => {
    player.major = 'arts';
    player.hasChosenMajor = true; // 標記已選擇主修
    updatePlayerMajorDisplay();
    majorSelectionScreen.style.display = 'none';
    // 完成主修選擇任務
    const majorTask = allPossibleTasks.find(t => t.id === 'major_choice_task');
    if (majorTask) {
        majorTask.completed = true;
        successfulArtsTasksCount++; // 文組主修選擇也算一個成功任務
        updateTaskUI();
    }
    console.log("你選擇了文組！");
});

function showMajorSelectionScreen() {
    majorSelectionScreen.style.display = 'flex';
}

function updatePlayerMajorDisplay() {
    if (playerMajorDisplay) {
        playerMajorDisplay.textContent = player.major === 'science' ? '理組' : (player.major === 'arts' ? '文組' : '無');
    }
}

/**
 * 嘗試撿起附近的物品。
 */
function pickupItem() {
    // 檢查地圖上的其他物品
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const dx = item.x - player.x;
        const dy = item.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < player.size + item.size) { // 如果玩家足夠靠近物品
            if (player.inventory.length < 9) { // 物品欄最大容量為 9
                player.inventory.push(item);
                items.splice(i, 1); // 從地圖上移除物品
                updateInventoryDisplay();
                console.log(`撿到物品：${item.name}`);
            } else {
                console.log("物品欄已滿！無法撿取更多物品。");
            }
            return; // 撿到一個物品後停止檢查
        }
    }

    // 檢查地圖上的食物物品
    for (let i = foodItems.length - 1; i >= 0; i--) {
        const item = foodItems[i];
        const dx = item.x - player.x;
        const dy = item.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < player.size + item.size) {
            if (player.inventory.length < 9) {
                player.inventory.push(item);
                foodItems.splice(i, 1);
                updateInventoryDisplay();
                console.log(`撿到物品：${item.name}`);
            } else {
                console.log("物品欄已滿！無法撿取更多物品。");
            }
            return;
        }
    }
    console.log("附近沒有可撿取的物品。");
}

/**
 * 使用選中的物品 (包含裝備功能)。
 */
function useSelectedItem() {
    if (selectedItemIndex !== -1 && selectedItemIndex < player.inventory.length) {
        const item = player.inventory[selectedItemIndex];
        if (item) {
            switch (item.type) { // 物品的 type 仍然保留，用於區分物品類型
                case 'food':
                    hunger = Math.min(hunger + 20, 100); // 食物增加飢餓值
                    player.inventory.splice(selectedItemIndex, 1); // 使用後移除
                    console.log("使用食物！飢餓值 +20");
                    break;
                case 'firstAidKit':
                    health = Math.min(health + 10, 100);
                    player.inventory.splice(selectedItemIndex, 1); // 使用後移除
                    console.log("使用急救包！血量 +10");
                    break;
                case 'umbrella':
                    player.activeEffects.noSlow = true;
                    player.effectEndDay.noSlow = day + 1; // 效果持續到下一天
                    player.inventory.splice(selectedItemIndex, 1); // 使用後移除
                    console.log("使用雨傘！獲得一天不受緩速效果。");
                    break;
                case 'lightningRod':
                    player.activeEffects.lightningImmune = true;
                    player.effectEndDay.lightningImmune = day + 1; // 效果持續到下一天
                    player.inventory.splice(selectedItemIndex, 1); // 使用後移除
                    console.log("使用防雷帽！獲得一天免疫雷擊。");
                    break;
                case 'weapon':
                    // 如果已經裝備了武器，先卸下到物品欄
                    if (player.equipped.weapon) {
                        player.inventory.push(player.equipped.weapon);
                    }
                    player.equipped.weapon = player.inventory.splice(selectedItemIndex, 1)[0];
                    console.log("裝備武器！");
                    equippedWeaponDisplay.textContent = player.equipped.weapon.name; // 更新 UI 顯示 
                    break;
                case 'special': // 愛的香水
                    if (item.name === '愛的香水') {
                        if (isStudentCharmed) {
                            updateBuildingDialog("提示", "你已經魅惑了一位學生，無法再次使用。");
                            break; // 不消耗物品
                        }
                        const CHARM_RANGE = 200; // 魅惑範圍
                        let closestStudent = findClosestStudent(CHARM_RANGE);
                        if (closestStudent) {
                            closestStudent.isCharmed = true;
                            closestStudent.speed = studentSpeed / 2; // 魅惑後速度減半
                            isStudentCharmed = true; // 標記為已魅惑
                            updateBuildingDialog("成功！", "你對附近的暴走學生使用了愛的香水，他冷靜下來了！");
                            player.inventory.splice(selectedItemIndex, 1); // 成功使用後移除
                        } else {
                            updateBuildingDialog("失敗！", `附近沒有可以使用的目標（需在 ${CHARM_RANGE} 像素內）。`);
                            // 不移除物品，讓玩家可以再次嘗試
                        }
                    }
                    break;
                default:
                    console.log("該物品無法使用或裝備。");
                    break;
            }
            selectedItemIndex = -1; // 重置選中索引
            updateInventoryDisplay(); // 更新物品欄顯示
        }
    } else {
        console.log("請先選擇一個物品。");
    }
}

/**
 * 丟棄選中的物品。
 */
function dropSelectedItem() {
    if (selectedItemIndex !== -1 && selectedItemIndex < player.inventory.length) {
        const droppedItem = player.inventory.splice(selectedItemIndex, 1)[0];
        // 將物品重新放回地圖上玩家附近 (可選，但更符合遊戲邏輯)
        droppedItem.x = player.x + (Math.random() - 0.5) * 100; // 落在玩家附近，稍微散開
        droppedItem.y = player.y + (Math.random() - 0.5) * 100;
        items.push(droppedItem); // 將物品重新加入到地圖物品列表中
        console.log(`丟棄物品：${droppedItem.name}`);
        // 如果丟棄的是已裝備的武器，則卸下
        if (player.equipped.weapon === droppedItem) {
            player.equipped.weapon = null;
            equippedWeaponDisplay.textContent = "無"; // 更新 UI 顯示 
        }
        selectedItemIndex = -1; // 重置選中索引
        updateInventoryDisplay(); // 更新物品欄顯示
    } else {
        console.log("請先選擇一個要丟棄的物品。");
    }
}

/**
 * 初始化或重置所有遊戲狀態變數。
 */
function initializeGameState() {
    // 重置玩家位置和裝備/效果
    player.x = mapWidth / 2;
    player.y = mapHeight / 2;
    player.speed = player.baseSpeed;
    player.inventory = []; // 清空物品欄
    player.equipped = {
        weapon: null
    }; // 只有武器是裝備品
    player.activeEffects = {
        noSlow: false,
        lightningImmune: false
    }; // 重置效果
    player.effectEndDay = {
        noSlow: 0,
        lightningImmune: 0
    }; // 重置效果結束天數
    player.major = null; // 重置主修
    player.hasChosenMajor = false; // 重置主修選擇狀態
    updatePlayerMajorDisplay(); // 更新主修顯示

    // 重置遊戲數據
    hunger = 100;
    health = 100;
    score = 0;
    gameOver = false;
    day = 1;
    isDaytime = true;

    foodCollected = 0;
    damageTaken = 0;

    lastDaySwitch = Date.now();
    lastWeatherChange = Date.now();
    lastLightningStrike = 0;

    // 重置食物物品
    foodItems = [];
    spawnFood();

    // 定義所有可能的任務
    allPossibleTasks = [{
            id: 'major_choice_task',
            description: '到行政大樓選擇主修',
            requiredDay: 2,
            completed: false,
            accepted: false, // 初始未接取
            startBuilding: '行政大樓',
            targetBuilding: '行政大樓',
            dialog: {
                offer: '行政大樓：是時候選擇你的主修了！',
                progress: '行政大樓：請選擇你的主修。',
                complete: '你已成功選擇主修！'
            },
            // 這個任務不屬於任何特定主修的計數，但會影響遊戲流程
        },
        {
            id: 'errand_small_wooden_house',
            description: '幫小木屋老闆跑腿：將食材送到總圖',
            requiredDay: 1,
            accepted: false,
            completed: false,
            reward: {
                hunger: 20,
                score: 100
            },
            startBuilding: '小木屋',
            targetBuilding: '總圖',
            dialog: {
                offer: '老闆：你好！最近店裡食材有點缺，你能幫我把東西送到總圖嗎？',
                progress: '老闆：食材送到了嗎？還在等你呢！',
                complete: '老闆：太感謝你了！這是你的獎勵。'
            }
        },
        // 理組任務
        {
            id: 'errand_eng1_eng4',
            description: '工程一館任務：將實驗報告送到工程四館，再回來回報',
            requiredDay: 1,
            accepted: false,
            completed: false,
            stage: 0, // 0:未接受, 1:接受-去Eng4, 2:到Eng4-回Eng1
            reward: {
                score: 200,
                health: 10
            },
            startBuilding: '工程一館',
            targetBuilding: '工程四館', // 任務的中間目標
            finalTargetBuilding: '工程一館', // 任務的最終完成地點
            dialog: {
                offer: '工程一館教授：學生，你能幫我把這份實驗報告送到工程四館嗎？完成後回來找我。',
                progressStage1: '工程一館教授：報告送到了嗎？快去工程四館吧！',
                progressStage2: '工程四館助教：報告收到了！請回工程一館向教授回報吧。',
                complete: '工程一館教授：太棒了！你完成了任務，這是你的獎勵。'
            },
            isScienceTask: true // 標記為理組相關任務
        },
        {
            id: 'quiz_eng2',
            description: '工程二館任務：參與科學知識問答',
            requiredDay: 1,
            accepted: false,
            completed: false, // 這個任務在問答結束後會被標記為完成或失敗
            reward: {
                score: 180,
                hunger: -5
            },
            penalty: {
                health: -5,
                hunger: 10
            },
            startBuilding: '工程二館',
            targetBuilding: '工程二館', // 在同一個建築物完成
            dialog: {
                offer: '工程二館老師：想測試你的科學知識嗎？來參加我的小問答吧！',
                progress: '工程二館老師：開始問答吧！',
                complete: '工程二館老師：你答得很好！',
                fail: '工程二館老師：別灰心，下次再來挑戰吧！'
            },
            isScienceTask: true // 標記為理組相關任務
        },
        {
            id: 'eng3_talk',
            description: '工程三館任務：與老師交談',
            requiredDay: 1,
            accepted: false,
            completed: false,
            reward: {
                score: 100
            },
            startBuilding: '工程三館',
            targetBuilding: '工程三館',
            dialog: {
                offer: '工程三館老師：歡迎來到工程三館，有什麼我可以幫忙的嗎？',
                progress: '工程三館老師：隨時歡迎你來找我討論學術問題。',
                complete: '工程三館老師：很高興能和你交流！'
            },
            isScienceTask: true
        },
        {
            id: 'eng4_get_food',
            description: '工程四館任務：領取研究經費',
            requiredDay: 1,
            accepted: false,
            completed: false,
            reward: {
                hunger: 20
            },
            startBuilding: '工程四館',
            targetBuilding: '工程四館',
            dialog: {
                offer: '工程四館助教：這是你的研究經費，拿去買點吃的吧！',
                progress: '工程四館助教：研究加油！',
                complete: '工程四館助教：期待你的研究成果！'
            },
            isScienceTask: true
        },
        {
            id: 'eng5_get_health',
            description: '工程五館任務：接受健康檢查',
            requiredDay: 1,
            accepted: false,
            completed: false,
            reward: {
                health: 10
            },
            startBuilding: '工程五館',
            targetBuilding: '工程五館',
            dialog: {
                offer: '工程五館醫師：來做個健康檢查吧！',
                progress: '工程五館醫師：保持健康才能有好的研究效率！',
                complete: '工程五館醫師：祝你身體健康！'
            },
            isScienceTask: true
        },
        // 文組任務
        {
            id: 'arts1_talk',
            description: '文學一館任務：與教授討論文學作品',
            requiredDay: 1,
            accepted: false,
            completed: false,
            reward: {
                score: 100
            },
            startBuilding: '文學一館',
            targetBuilding: '文學一館',
            dialog: {
                offer: '文學一館教授：同學，對這部作品有什麼看法嗎？',
                progress: '文學一館教授：繼續思考，你會發現更多。',
                complete: '文學一館教授：很棒的見解！'
            },
            isArtsTask: true
        },
        {
            id: 'arts2_quiz',
            description: '文學二館任務：參與人文歷史問答',
            requiredDay: 1,
            accepted: false,
            completed: false,
            reward: {
                score: 180,
                health: -5
            },
            penalty: {
                health: -5,
                hunger: 10
            },
            startBuilding: '文學二館',
            targetBuilding: '文學二館',
            dialog: {
                offer: '文學二館老師：想測試你的人文歷史知識嗎？',
                progress: '文學二館老師：開始問答吧！',
                complete: '文學二館老師：你答得很好！',
                fail: '文學二館老師：別灰心，下次再來挑戰吧！'
            },
            isArtsTask: true
        },
        {
            id: 'arts3_read',
            description: '文學三館任務：閱讀經典詩集',
            requiredDay: 1,
            accepted: false,
            completed: false,
            reward: {
                hunger: -10
            },
            startBuilding: '文學三館',
            targetBuilding: '文學三館',
            dialog: {
                offer: '文學三館圖書管理員：這裡有本經典詩集，推薦給你。',
                progress: '文學三館圖書管理員：沉浸在文字的世界裡吧。',
                complete: '文學三館圖書管理員：希望你有所收穫。'
            },
            isArtsTask: true
        },
        {
            id: 'hakka1_explore',
            description: '客家學院任務1：探索客家文化',
            requiredDay: 1,
            accepted: false,
            completed: false,
            reward: {
                score: 120
            },
            startBuilding: '客家學院',
            targetBuilding: '客家學院',
            dialog: {
                offer: '客家學院導覽員：歡迎來到客家學院，這裡有豐富的客家文化等你探索。',
                progress: '客家學院導覽員：你對客家文化了解多少了？',
                complete: '客家學院導覽員：你對客家文化有了更深的認識！'
            },
            isArtsTask: true
        },
        {
            id: 'hakka2_quiz',
            description: '客家學院任務2：客家文化知識問答',
            requiredDay: 1,
            accepted: false,
            completed: false,
            reward: {
                score: 200,
                health: 10
            },
            penalty: {
                health: -10,
                hunger: 5
            },
            startBuilding: '客家學院',
            targetBuilding: '客家學院',
            dialog: {
                offer: '客家學院老師：來測試一下你的客家文化知識吧！',
                progress: '客家學院老師：開始問答吧！',
                complete: '客家學院老師：你對客家文化很了解！',
                fail: '客家學院老師：別灰心，多學習就能掌握。'
            },
            isArtsTask: true
        },
        // 通識課任務
        {
            id: "general_task_1",
            description: "通識課：幫忙整理圖書館資料",
            requiredDay: 3, // 第3天開放
            accepted: false,
            completed: false,
            startBuilding: '教研大樓',
            targetBuilding: '總圖',
            dialog: {
                offer: "同學，可以幫忙整理一下圖書館的資料嗎？",
                progress: "謝謝你幫忙整理資料。",
                complete: "太感謝了！你幫了大忙。",
            },
            reward: {
                score: 30,
                hunger: -5,
            },
            isGeneralTask: true // 標記為通識任務
        },
        {
            id: "general_task_2",
            description: "通識課：協助社團博覽會",
            requiredDay: 3, // 第3天開放
            accepted: false,
            completed: false,
            startBuilding: '教研大樓',
            targetBuilding: '志道樓',
            dialog: {
                offer: "同學，可以來社團博覽會幫忙嗎？",
                progress: "謝謝你協助社團博覽會。",
                complete: "太感謝了！你幫了大忙。",
            },
            reward: {
                score: 20,
                health: 5,
            },
            isGeneralTask: true // 標記為通識任務
        }
    ];

    // 重置建築物訪問狀態並定義效果、名稱和對話文案
    buildings = [{
            x: 3600,
            y: 1600,
            width: 200,
            height: 200,
            visited: false,
            name: '小木屋',
            dialogTitle: '小木屋',
            dialogText: '溫馨的小木屋餐廳，提供美味的餐點，獲得一個食物！',
            effectHunger: 10,
            type: 'general',
            imgSrc: 'img1/小木屋.png'
        },
        {
            x: 2100, y: 2650, width: 250, height: 300,
            visited: false,
            name: '依仁堂',
            dialogTitle: '依仁堂',
            dialogText: '依仁堂提供緊急醫療服務，治療你的傷勢。',
            effectHealth: 30,
            type: 'general',
            imgSrc: 'img1/依仁.png'
        },
        {
            x: 4025, y: 2900, width: 300, height: 400,
            visited: false,
            name: '總圖',
            dialogTitle: '總圖',
            dialogText: '在總圖中，你可以學習新知識，提升你的技能。',
            effectScore: 30,
            type: 'general',
            imgSrc: 'img1/總圖.png'
        },
        {
            x: 4800, y: 4700, width: 400, height: 250,
            visited: false,
            name: '松果餐廳',
            dialogTitle: '松果餐廳',
            dialogText: '在松果餐廳享受豐盛的一餐，恢復活力！',
            effectHunger: 10,
            type: 'general',
            imgSrc: 'img1/松果.png'
        },
        {
            x: 4350, y: 2900, width: 300, height: 400,
            visited: false,
            name: '行政大樓',
            dialogTitle: '行政大樓',
            dialogText: '到行政大樓選擇你的主修吧！',
            type: 'major-choice', // 標記為選擇主修的建築物
            availableDay: 2, // 第2天即可選修
            imgSrc: 'img1/行政.png'
        },
        {
            x: 2050, y: 2950, width: 325, height: 350,
            visited: false,
            name: '體育館',
            dialogTitle: '體育館',
            dialogText: '來場籃球比賽，贏了可以恢復體力，輸了會消耗體力！',
            type: 'minigame1', // 標記為小遊戲 1 (籃球) 建築物
            imgSrc: 'img1/操場.png'
        },
        // 理組建築物 (原有的 5 棟)
        {
            x: 3050, y: 3550, width: 500, height: 400,
            visited: false,
            name: '工程一館',
            dialogTitle: '工程一館',
            dialogText: '這是理組的專屬建築物，只有理組學生才能進入。',
            dialogTextScience: '歡迎來到工程一館，這裡是基礎科學實驗室。',
            type: 'science',
            imgSrc: 'img1/工一.png'
        },
        {
             x: 2450, y: 3550, width: 500, height: 400,
            visited: false,
            name: '工程二館',
            dialogTitle: '工程二館',
            dialogText: '這是理組的專屬建築物，只有理組學生才能進入。',
            dialogTextScience: '歡迎來到工程二館，這裡有豐富的科學知識等你來探索。',
            type: 'science',
            imgSrc: 'img1/工二.png'
        },
        {
            x: 1500, y: 3050, width: 400, height: 300,
            visited: false,
            name: '工程三館',
            dialogTitle: '工程三館',
            dialogText: '這是理組的專屬建築物，只有理組學生才能進入。',
            dialogTextScience: '歡迎來到工程三館，這裡有先進的實驗設備。',
            type: 'science',
            imgSrc: 'img1/工三.png'
        },
        {
            x: 1100, y: 2650, width: 400, height: 280,
            visited: false,
            name: '工程四館',
            dialogTitle: '工程四館',
            dialogText: '這是理組的專屬建築物，只有理組學生才能進入。',
            dialogTextScience: '歡迎來到工程四館，這裡是研究生的天堂。',
            type: 'science',
            imgSrc: 'img1/工四.png'
        },
        {
            x: 700, y: 3600, width: 600, height: 400,
            visited: false,
            name: '工程五館',
            dialogTitle: '工程五館',
            dialogText: '這是理組的專屬建築物，只有理組學生才能進入。',
            dialogTextScience: '歡迎來到工程五館，這裡有最新的科技成果展示。',
            type: 'science',
            imgSrc: 'img1/工5.png'
        },
        // 文組建築物 (原有的 4 棟)
        {
            x: 3950,
            y: 2000,
            width: 350,
            height: 300,
            visited: false,
            name: '文學一館',
            dialogTitle: '文學一館',
            dialogText: '這是文組的專屬建築物，只有文組學生才能進入。',
            dialogTextArts: '歡迎來到文學一館，這裡充滿了人文氣息。',
            type: 'arts',
            imgSrc: 'img1/文一.png'
        },
        {
            x: 4000,
            y: 2400,
            width: 300,
            height: 300,
            visited: false,
            name: '文學二館',
            dialogTitle: '文學二館',
            dialogText: '這是文組的專屬建築物，只有文組學生才能進入。',
            dialogTextArts: '歡迎來到文學二館，這裡有豐富的歷史典籍。',
            type: 'arts',
            imgSrc: 'img1/文二.png'
        },
        {
            x: 4300,
            y: 2000,
            width: 300,
            height: 300,
            visited: false,
            name: '文學三館',
            dialogTitle: '文學三館',
            dialogText: '這是文組的專屬建築物，只有文組學生才能進入。',
            dialogTextArts: '歡迎來到文學三館，這裡可以找到各類詩詞歌賦。',
            type: 'arts',
            imgSrc: 'img1/文三.png'
        },
        {
            x: 1900,
            y: 900,
            width: 400,
            height: 300,
            visited: false,
            name: '客家學院',
            dialogTitle: '客家學院',
            dialogText: '這是文組的專屬建築物，只有文組學生才能進入。',
            dialogTextArts: '歡迎來到客家學院，探索獨特的客家文化。',
            type: 'arts',
            imgSrc: 'img1/客家.png'
        },
        // 教研大樓 (原有的 1 棟)
        {
            name: "教研大樓",
            type: "general-task",
            x: 2550, y: 2920, width: 375, height: 350,
            visited: false,
            dialogTitle: "教研大樓",
            dialogText: "這裡提供各種通識課程任務，完成後可獲得獎勵。",
            availableDay: 3, // 第3天開放
            imgSrc: 'img1/教研.png'
        },
        // 期末考場 (Boss 戰) (原有的 1 棟)
        {
            name: "期末考場",
            type: "minigame2", // 標記為小遊戲 2 (Boss 戰) 建築物
            minigameType: "boss-battle", // 區分這是 Boss 戰小遊戲
            x: 1900, // 調整位置
            y: 600, // 調整位置
            width: 200,
            height: 200,
            visited: false, // 確保只參與一次
            dialogTitle: "期末考場",
            dialogText: "期末考來臨！通過考驗才能順利畢業！",
            availableDay: 1, // 第13天開放
            deadlineDay: 14, // 第14天結束時未完成則觸發結局
            imgSrc: 'img1/教研.png'
        },
        // 神秘商店 (愛的香水) (原有的 1 棟)
        {
            name: "神秘商店",
            type: "special", // 新增特殊建築類型
            x: 2650, y: 4700, width: 400, height: 300,
            visited: false,
            dialogTitle: "神秘商店",
            dialogText: "這裡有特別的東西...",
            appearsOnRiotDay: true, // 在暴動學生出現那天出現
            hasItem: true, // 標記有物品
            imgSrc: 'img1/幼兒園.png'
        },

        // 新增的理組建築物
        { x: 1650, y: 2650, width: 300, height: 200, name: "大力館", type: "science", dialogTitle: "大力館", dialogText: "這裡是大力館。", imgSrc: "img1/大力.png", visited: false, effectScore: 10 },
        { x: 600, y: 3000, width: 400, height: 320, name: "太遙中心", type: "science", dialogTitle: "太遙中心", dialogText: "這裡是太遙中心。", imgSrc: "img1/太遙.png", visited: false, effectScore: 10 },
        { x: 1000, y: 3050, width: 400, height: 280, name: "生物醫學工程館", type: "science", dialogTitle: "生物醫學工程館", dialogText: "這裡是生物醫學工程館。", imgSrc: "img1/研究中心二期.png", visited: false, effectScore: 10 },
        { x: 4150, y: 3500, width: 500, height: 400, name: "科學一館", type: "science", dialogTitle: "科學一館", dialogText: "這裡是科學一館。", imgSrc: "img1/科一.png", visited: false, effectScore: 10 },
        { x: 2900, y: 1480, width: 300, height: 300, name: "科學二館", type: "science", dialogTitle: "科學二館", dialogText: "這裡是科學二館。", imgSrc: "img1/科二.png", visited: false, effectScore: 10 },
        { x: 2900, y: 1200, width: 300, height: 200, name: "科學三館", type: "science", dialogTitle: "科學三館", dialogText: "這裡是科學三館。", imgSrc: "img1/科三.png", visited: false, effectScore: 10 },
        { x: 2900, y: 1000, width: 200, height: 200, name: "科學四館", type: "science", dialogTitle: "科學四館", dialogText: "這裡是科學四館。", imgSrc: "img1/科四.png", visited: false, effectScore: 10 },
        { x: 3350, y: 900, width: 200, height: 200, name: "科學五館", type: "science", dialogTitle: "科學五館", dialogText: "這裡是科學五館。", imgSrc: "img1/科五.png", visited: false, effectScore: 10 },
        { x: 3200, y: 1150, width: 300, height: 320, name: "鴻經館", type: "science", dialogTitle: "鴻經館", dialogText: "這裡是鴻經館。", imgSrc: "img1/鴻經.png", visited: false, effectScore: 10 },
        { x: 2000, y: 1450, width: 350, height: 350, name: "光電大樓", type: "science", dialogTitle: "光電大樓", dialogText: "這裡是光電大樓。", imgSrc: "img1/光電.png", visited: false, effectHealth: 5 },
        // 新增的文組建築物 
        { x: 3600, y: 1000, width: 400, height: 300, name: "管一", type: "arts", dialogTitle: "管一", dialogText: "這裡是管一。", imgSrc: "img1/管一.png", visited: false, effectScore: 5 },
        { x: 3600, y: 700, width: 400, height: 300, name: "管二", type: "arts", dialogTitle: "管二", dialogText: "這裡是管二。", imgSrc: "img1/管二.png", visited: false, effectScore: 5 },

        // 新增的 general 類型建築物
        { x: 2350, y: 1300, width: 500, height: 200, name: "中大湖", type: "general", dialogTitle: "中大湖", dialogText: "這裡是中大湖。", imgSrc: "img1/中大湖.png", visited: false, effectHealth: 5 },
        { x: 3820, y: 1600, width: 250, height: 200, name: "國鼎圖書館", type: "general", dialogTitle: "國鼎圖書館", dialogText: "這裡是國鼎圖書館。", imgSrc: "img1/國鼎.png", visited: false, effectHealth: 5 },
        { x: 3325, y: 4250, width: 360, height: 270, name: "i house", type: "general", dialogTitle: "i house", dialogText: "這裡是i house。", imgSrc: "img1/i house.png", visited: false, effectHealth: 5 },
        { x: 4150, y: 1150, width: 400, height: 200, name: "中大會館", type: "general", dialogTitle: "中大會館", dialogText: "這裡是中大會館。", imgSrc: "img1/中大.png", visited: false, effectHealth: 5 },
        { x: 1700, y: 2050, width: 300, height: 300, name: "中大運動中心", type: "general", dialogTitle: "中大運動中心", dialogText: "這裡是中大運動中心。", imgSrc: "img1/健身.png", visited: false, effectHealth: 5 },
        { x: 3150, y: 1000, width: 150, height: 150, name: "創新中心", type: "general", dialogTitle: "創新中心", dialogText: "這裡是創新中心。", imgSrc: "img1/創新.png", visited: false, effectHealth: 5 },
        { x: 3650, y: 3600, width: 300, height: 300, name: "國泰樹", type: "general", dialogTitle: "國泰樹", dialogText: "國泰樹。", imgSrc: "img1/國泰.png", visited: false, effectHunger: 15 },
        { x: 3800, y: 4250, width: 500, height: 250, name: "國際學生宿舍", type: "general", dialogTitle: "國際學生宿舍", dialogText: "這裡是國際學生宿舍。", imgSrc: "img1/國際.png", visited: false, effectHunger: 15 },
        { x: 4800, y: 1350, width: 250, height: 200, name: "第9餐廳", type: "general", dialogTitle: "第9餐廳", dialogText: "這裡是第9餐廳。", imgSrc: "img1/地9.png", visited: false, effectHunger: 15 },
        { x: 2600, y: 2050, width: 900, height: 500, name: "壘球場", type: "general", dialogTitle: "壘球場", dialogText: "這裡是壘球場。", imgSrc: "img1/壘球.png", visited: false, effectHunger: 5 },
        { x: 3000, y: 2920, width: 375, height: 350, name: "大禮堂", type: "general", dialogTitle: "大禮堂", dialogText: "這裡是大禮堂。", imgSrc: "img1/大禮堂.png", visited: false, effectHunger: 5 },
        { x: 4900, y: 3400, width: 600, height: 400, name: "大講堂", type: "general", dialogTitle: "大講堂", dialogText: "這裡是大講堂。", imgSrc: "img1/大講堂.png", visited: false },
        {x: 4325, y: 2425, width: 250, height: 200, name: "大象五形", type: "general", dialogTitle: "大象五形", dialogText: "這裡是大象五形。", imgSrc: "img1/大象.png", visited: false },
        { x: 3600, y: 2200, width: 250, height: 250, name: "太極銅雕", type: "general", dialogTitle: "太極銅雕", dialogText: "這裡是太極銅雕。", imgSrc: "img1/太極.png", visited: false, effectHunger: 5 },
        { x: 2450, y: 4200, width: 700, height: 300, name: "女生宿舍1-4", type: "general", dialogTitle: "女生宿舍1-4", dialogText: "這裡是女生宿舍1-4。", imgSrc: "img1/女1-4.png", visited: false, effectScore: 5 },
        { x: 4100, y: 4700, width: 300, height: 270, name: "女14", type: "general", dialogTitle: "女14", dialogText: "這裡是女14。", imgSrc: "img1/女14.png", visited: false },
        { x: 4000, y: 600, width: 450, height: 400, name: "曦望居", type: "general", dialogTitle: "曦望居", dialogText: "這裡是曦望居。", imgSrc: "img1/希望.png", visited: false },
        { x: 3780, y: 4700, width: 300, height: 250, name: "志道樓", type: "general", dialogTitle: "志道樓", dialogText: "這裡是志道樓。", imgSrc: "img1/志道.png", visited: false },
        //{ x: 300, y: 800, width: 50, height: 50, name: "洗衣店", type: "general", dialogTitle: "洗衣店", dialogText: "這裡是洗衣店。", imgSrc: "img1/排球場.png", visited: false },
        { x: 4900, y: 3850, width: 400, height: 300, name: "據德樓", type: "general", dialogTitle: "據德樓", dialogText: "這裡是據德樓。", imgSrc: "img1/據德.png", visited: false, effectHealth: 5 },
        //{ x: 500, y: 800, width: 50, height: 50, name: "游泳池", type: "general", dialogTitle: "游泳池", dialogText: "這裡是游泳池。", imgSrc: "img1/攀岩.png", visited: false, effectHealth: 5 },
        { x: 1950, y: 3550, width: 400, height: 200, name: "松苑餐廳", type: "general", dialogTitle: "松苑餐廳", dialogText: "這裡是松苑餐廳。", imgSrc: "img1/松苑.png", visited: false },
        { x: 1100, y: 1380, width: 600, height: 450, name: "游泳池", type: "general", dialogTitle: "游泳池", dialogText: "這裡是游泳池。", imgSrc: "img1/游泳池.png", visited: false },
        { x: 2200, y: 2050, width: 200, height: 300, name: "溜冰場", type: "general", dialogTitle: "溜冰場", dialogText: "這裡是溜冰場。", imgSrc: "img1/溜冰.png", visited: false },
        { x: 4500, y: 1450, width: 150, height: 100, name: "烏龜池", type: "general", dialogTitle: "烏龜池", dialogText: "這裡是烏龜池。", imgSrc: "img1/烏龜.png", visited: false },
        { x: 1950, y: 3800, width: 400, height: 300, name: "產學營運中心", type: "general", dialogTitle: "產學營運中心", dialogText: "這裡是產學營運中心。", imgSrc: "img1/產學.png", visited: false },
        { x: 4325, y: 4225, width: 425, height: 250, name: "男五", type: "general", dialogTitle: "男五", dialogText: "這裡是男五。", imgSrc: "img1/男5.png", visited: false, effectHealth: 10 },
        { x: 4800, y: 4400, width: 125, height: 250, name: "男6", type: "general", dialogTitle: "男6", dialogText: "這裡是男6。", imgSrc: "img1/男6.png", visited: false, effectHealth: 5 },
        { x: 4550, y: 5000, width: 500, height: 250, name: "男7", type: "general", dialogTitle: "男7", dialogText: "這裡是男7。", imgSrc: "img1/男7.png", visited: false },
        { x: 4600, y: 1550, width: 400, height: 200, name: "男9A", type: "general", dialogTitle: "男9A", dialogText: "這裡是男9A。", imgSrc: "img1/男9A.png", visited: false },
        { x: 4600, y: 1150, width: 400, height: 200, name: "男9B", type: "general", dialogTitle: "男9B", dialogText: "這裡是男9B。", imgSrc: "img1/男9B.png", visited: false },
        { x: 4450, y: 4700, width: 300, height: 270, name: "男11", type: "general", dialogTitle: "男11", dialogText: "這裡是男11。", imgSrc: "img1/男11.png", visited: false },
        { x: 4500, y: 600, width: 450, height: 200, name: "男12", type: "general", dialogTitle: "男12", dialogText: "這裡是男12。", imgSrc: "img1/男12.png", visited: false },
        { x: 5400, y: 3850, width: 500, height: 400, name: "男13", type: "general", dialogTitle: "男13", dialogText: "這裡是男13。", imgSrc: "img1/男13.png", visited: false },
        { x: 3325, y: 4650, width: 360, height: 270, name: "男三", type: "general", dialogTitle: "男三", dialogText: "這裡是男三。", imgSrc: "img1/男三.png", visited: false },
        {x: 1950, y: 3300, width: 200, height: 100, name: "白色能源屋", type: "general", dialogTitle: "白色能源屋", dialogText: "這裡是白色能源屋，補充10點體力。", imgSrc: "img1/白屋.png", visited: false, effectHealth: 10 },
        { x: 2000, y: 2050, width: 200, height: 300, name: "籃球場", type: "general", dialogTitle: "籃球場", dialogText: "這裡是籃球場。", imgSrc: "img1/籃球.png", visited: false },
        { x: 3300, y: 1600, width: 200, height: 200, name: "綜教館", type: "general", dialogTitle: "綜教館", dialogText: "這裡是綜教館。", imgSrc: "img1/綜教.png", visited: false },
        //{ x: 300, y: 1200, width: 50, height: 50, name: "計算機中心", type: "general", dialogTitle: "計算機中心", dialogText: "這裡是計算機中心。", imgSrc: "img1/網球.png", visited: false, effectScore: 5 },
        { x: 3625, y: 2920, width: 350, height: 325, name: "中正圖書館", type: "general", dialogTitle: "中正圖書館", dialogText: "這裡是中正圖書館。", imgSrc: "img1/中正.png", visited: false, effectScore: 5 },
        {x: 2100, y: 2350, width: 250, height: 300, name: "羽球館", type: "general", dialogTitle: "羽球館", dialogText: "這裡是羽球館。", imgSrc: "img1/羽球.png", visited: false, effectScore: 5 },
        { x: 3325, y: 4200, width: 50, height: 50, name: "蓮花池", type: "general", dialogTitle: "蓮花池", dialogText: "這裡是蓮花池。", imgSrc: "img1/蓮花.png", visited: false, effectScore: 5 },
        {  x: 4900, y: 2900, width: 300, height: 200, name: "警衛室", type: "general", dialogTitle: "警衛室", dialogText: "這裡是警衛室。", imgSrc: "img1/警衛.png", visited: false },
        //{ x: 500, y: 1300, width: 50, height: 50, name: "國際會議廳", type: "general", dialogTitle: "國際會議廳", dialogText: "這裡是國際會議廳。", imgSrc: "img1/體育.png", visited: false },
        {x: 4950, y: 4200, width: 300, height: 300, name: "遊藝館", type: "general", dialogTitle: "遊藝館", dialogText: "這裡是遊藝館。", imgSrc: "img1/遊藝.png", visited: false },
    ];

    // 重置地圖上的可拾取物品
    items = [];
    spawnItems(); // 生成新的物品

    // 重置暴動學生狀態
    riotStudents = [];
    studentsSpawned = false; // 重置生成標記
    isStudentCharmed = false; // 重置魅惑狀態

    currentWeather = "sunny"; // 重置天氣

    // 重置任務計數器
    successfulScienceTasksCount = 0;
    failedScienceTasksCount = 0;
    successfulArtsTasksCount = 0;
    failedArtsTasksCount = 0;

    // 重置 Boss 戰結果
    bossBattleResult = false;

    updateTaskUI(); // 初始化任務 UI

    // 更新 UI 顯示 
    hungerDisplay.textContent = hunger.toFixed(0);
    healthDisplay.textContent = health.toFixed(0);
    scoreDisplay.textContent = score;
    dayDisplay.textContent = day;
    weatherDisplay.textContent = "晴天";
    equippedWeaponDisplay.textContent = "無";

    hungerBar.style.width = `${hunger}%`;
    healthBar.style.width = `${health}%`;

    // 確保音效停止
    rainSound.pause();
    rainSound.currentTime = 0;
    thunderSound.pause();
    thunderSound.currentTime = 0;

    // 隱藏遊戲結束畫面 (如果可見)
    gameOverScreen.style.display = "none";
    majorSelectionScreen.style.display = "none"; // 隱藏主修選擇畫面
    minigame1Modal.style.display = "none"; // 隱藏籃球小遊戲 modal
    minigame2Modal.style.display = "none"; // 隱藏 Boss 戰小遊戲 modal
    quizModal.style.display = "none"; // 隱藏問答小遊戲 modal

    updateInventoryDisplay(); // 初始化物品欄顯示
    updateBuildingDialog("歡迎來到校園！", "點擊附近的建築物來探索吧！"); // 初始化對話框內容
}

/**
 * 更新任務 UI 的顯示。
 */
function updateTaskUI() {
    if (!taskUI) return;

    taskUI.innerHTML = '<h2>任務</h2><ul>';
    let hasTasksToDisplay = false;

    // 遍歷所有可能的任務來尋找那些可顯示或正在進行的任務
    for (const task of allPossibleTasks) {
        // 任務必須已開放且未完成
        if (day >= task.requiredDay && !task.completed) {
            // 特殊處理：主修選擇任務總是顯示，不受到 player.major 限制
            const isMajorChoiceTask = (task.id === 'major_choice_task');

            // 如果是理組任務 (但不是主修選擇任務)，且玩家未選擇理組，則不顯示
            if (task.isScienceTask && !isMajorChoiceTask && player.major !== 'science') {
                continue;
            }
            // 如果是文組任務，且玩家未選擇文組，則不顯示
            if (task.isArtsTask && player.major !== 'arts') {
                continue;
            }
            // 通識課任務需要已選擇主修
            if (task.isGeneralTask && !player.hasChosenMajor) {
                continue;
            }

            hasTasksToDisplay = true;
            if (!task.accepted) {
                // 任務可接取但尚未接取
                taskUI.innerHTML += `<li>[新任務] ${task.description} (前往 ${task.startBuilding} 接收)</li>`;
            } else {
                // 任務已接取且正在進行中
                let taskProgressText = task.description;
                if (task.id === 'errand_eng1_eng4') {
                    if (task.stage === 1) {
                        taskProgressText += ` (前往 ${task.targetBuilding})`;
                    } else if (task.stage === 2) {
                        taskProgressText += ` (回到 ${task.finalTargetBuilding} 回報)`;
                    }
                } else if (task.id === 'errand_small_wooden_house') { // 小木屋任務進度顯示
                    taskProgressText += ` (前往 ${task.targetBuilding})`;
                }
                // 其他單階段任務，如果已接受，則顯示目標建築
                else if (task.targetBuilding && task.startBuilding !== task.targetBuilding) {
                    taskProgressText += ` (前往 ${task.targetBuilding})`;
                }
                taskUI.innerHTML += `<li>${taskProgressText}</li>`;
            }
        }
    }

    if (!hasTasksToDisplay) {
        taskUI.innerHTML += '<li>目前沒有任務</li>';
    }

    taskUI.innerHTML += '</ul>';
}

/**
 * 完成指定ID的任務。
 * @param {string} taskId 要完成的任務ID。
 * @param {boolean} success 任務是否成功完成。
 */
function completeTask(taskId, success = true) {
    const task = allPossibleTasks.find(t => t.id === taskId);
    if (task) {
        task.completed = true;
        console.log(`任務完成：${task.description}, 成功: ${success}`);

        if (task.isScienceTask) { // 理組任務計數
            if (success) {
                successfulScienceTasksCount++;
            } else {
                failedScienceTasksCount++;
            }
        } else if (task.isArtsTask) { // 文組任務計數
            if (success) {
                successfulArtsTasksCount++;
            } else {
                failedArtsTasksCount++;
            }
        } else if (task.isGeneralTask) { // 通識任務計數 (文理組都算)
            if (success) {
                successfulScienceTasksCount++; // 算入理組成功
                successfulArtsTasksCount++; // 算入文組成功
            } else {
                failedScienceTasksCount++; // 算入理組失敗
                failedArtsTasksCount++; // 算入文組失敗
            }
        }


        // 應用獎勵或懲罰
        if (success && task.reward) {
            health = Math.min(health + (task.reward.health || 0), 100);
            hunger = Math.max(0, hunger + (task.reward.hunger || 0));
            score += (task.reward.score || 0);
        } else if (!success && task.penalty) {
            health = Math.max(0, health + (task.penalty.health || 0));
            hunger = Math.max(0, hunger + (task.penalty.hunger || 0));
            score += (task.penalty.score || 0); // 失敗也可能扣分
        }
    }
    updateTaskUI(); // 更新任務 UI
}

/**
 * 生成地圖上的食物物品。
 */
function spawnFood() {
    while (foodItems.length < 5) {
        // 確保地圖上至少有 5 個食物
        foodItems.push({
            x: Math.random() * mapWidth,
            y: Math.random() * mapHeight,
            size: 10,
            type: 'food', // 標記為食物
            name: '食物'
        });
    }
}

/**
 * 生成地圖上的可拾取物品 (雨傘、防雷帽、急救包、武器)。
 */
function spawnItems() {
    const itemTypes = ['umbrella', 'lightningRod', 'firstAidKit', 'weapon'];
    const itemNames = {
        'umbrella': '雨傘',
        'lightningRod': '防雷帽',
        'firstAidKit': '急救包',
        'weapon': '武器',
    };
    const numItemsToSpawn = 5;

    for (let i = 0; i < numItemsToSpawn; i++) {
        const randomX = Math.random() * mapWidth;
        const randomY = Math.random() * mapHeight;
        const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        let item = {
            x: randomX,
            y: randomY,
            size: 15,
            type: itemType,
            name: itemNames[itemType]
        };
        items.push(item);
    }
}

/**
 * 更新物品欄的顯示。
 */
function updateInventoryDisplay() {
    if (!inventoryDisplay) return;

    inventoryDisplay.innerHTML = ""; // 清空現有的顯示

    // 填充 9 個物品槽位，即使沒有物品也顯示空槽位
    for (let i = 0; i < 9; i++) {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("inventory-item");

        if (player.inventory[i]) {
            // 如果有物品，顯示物品名稱
            itemDiv.textContent = `${i + 1}. ${player.inventory[i].name}`;
            if (i === selectedItemIndex) {
                itemDiv.classList.add('selected'); // 高亮選中的物品
            }
            // 為有物品的槽位添加點擊事件，用於選中
            itemDiv.addEventListener("click", () => {
                document.querySelectorAll('.inventory-item').forEach(div => {
                    div.classList.remove('selected');
                });
                itemDiv.classList.add('selected');
                selectedItemIndex = i; // 更新選中物品的索引
                console.log(`選中物品：${player.inventory[selectedItemIndex].name}`);
            });
        } else {
            // 如果沒有物品，顯示空槽位編號
            itemDiv.textContent = `${i + 1}. 空`;
            itemDiv.classList.add('empty'); // 可以添加一個空槽位的樣式
        }
        inventoryDisplay.appendChild(itemDiv);
    }
}


/**
 * 生成暴動學生。
 */
function spawnRiotStudents() {
    // 只有在達到指定天數且尚未生成時才生成
    if (day >= studentSpawnDay && !studentsSpawned) {
        for (let i = 0; i < 3; i++) { // 假設生成 3 個學生
            riotStudents.push({
                x: Math.random() * mapWidth,
                y: Math.random() * mapHeight,
                size: 25, // 學生大小
                health: studentInitialHealth,
                damage: studentAttackDamage,
                speed: studentSpeed,
                lastAttackTime: 0, // 上次攻擊時間，用於攻擊冷卻
                isCharmed: false, // 是否被魅惑
                gender: Math.random() < 0.5 ? 'male' : 'female', // 隨機產生性別
            });
        }
        studentsSpawned = true; // 設定標記，避免重複生成
        console.log(`第 ${day} 天，暴動學生出現了！`);
    }
}

/**
 * 找到離玩家最近的暴走學生，在指定範圍內。
 * @param {number} range 搜尋範圍半徑。
 * @returns {object|null} 最近的暴走學生物件，如果沒有則返回 null。
 */
function findClosestStudent(range) {
    let closestDist = Infinity;
    let closestStudent = null;
    for (let student of riotStudents) {
        // 排除已被魅惑的學生
        if (student.isCharmed) continue;

        let dist = Math.sqrt(Math.pow(player.x - student.x, 2) + Math.pow(player.y - student.y, 2));
        if (dist < closestDist && dist <= range) { // 檢查是否在範圍內
            closestDist = dist;
            closestStudent = student;
        }
    }
    return closestStudent; // 如果沒有在範圍內的學生，會回傳 null
}


/**
 * 更新暴動學生的狀態 (移動、攻擊)。
 * @param {number} deltaTime 自上一幀以來經過的時間（秒）。
 */
function updateRiotStudents(deltaTime) {
    const now = Date.now();
    for (let i = riotStudents.length - 1; i >= 0; i--) {
        const student = riotStudents[i];

        if (student.isCharmed) {
            // 被魅惑的學生跟隨玩家
            const dx = player.x - student.x;
            const dy = player.y - student.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // 保持一定距離，避免完全重疊
            if (dist > player.size * 1.5) {
                const angle = Math.atan2(dy, dx);
                student.x += Math.cos(angle) * student.speed * deltaTime * 60; // 乘以 deltaTime 和 60 (假設每秒 60 幀)
                student.y += Math.sin(angle) * student.speed * deltaTime * 60;
            }
        } else {
            // 學生移動：朝向玩家移動
            const dx = player.x - student.x;
            const dy = player.y - student.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > player.size + student.size / 2) { // 如果學生不在玩家攻擊範圍內，則移動
                const angle = Math.atan2(dy, dx);
                student.x += Math.cos(angle) * student.speed * deltaTime * 60;
                student.y += Math.sin(angle) * student.speed * deltaTime * 60;
            }

            // 學生攻擊玩家
            // 檢查學生是否足夠靠近玩家，並且攻擊冷卻時間已過
            if (dist < player.size + student.size / 2 && now - student.lastAttackTime >= studentAttackCooldown) {
                health -= student.damage;
                damageTaken += student.damage; // 累計玩家受到的傷害
                student.lastAttackTime = now; // 更新上次攻擊時間
                console.log(`暴動學生攻擊你！血量 -${student.damage}`);
                if (health <= 0) {
                    health = 0;
                    endGame(day - 1, calculateFinalScore());
                    return; // 遊戲結束，停止更新其他學生
                }
            }
        }
    }
}

/**
 * 更新遊戲時間（白天/夜晚）和天氣。
 */
function updateTimeAndWeather() {
    const now = Date.now();
    const dayDurationMs = 2 * 60 * 1000; // 2 分鐘為一個白天/夜晚週期

    // 判斷是否切換白天/夜晚
    if (now - lastDaySwitch >= dayDurationMs / 2) {
        isDaytime = !isDaytime;
        if (isDaytime) {
            day++; // 天數增加
            // 檢查並移除過期的效果
            if (day > player.effectEndDay.noSlow) {
                player.activeEffects.noSlow = false;
                console.log("雨傘效果已結束。");
            }
            if (day > player.effectEndDay.lightningImmune) {
                player.activeEffects.lightningImmune = false;
                console.log("防雷帽效果已結束。");
            }

            // 每天重置小遊戲建築的 visited 狀態
            for (let b of buildings) {
                if (b.type === 'minigame1') { // 針對兩種小遊戲類型重置 || b.type === 'minigame2'
                    b.visited = false;
                }
            }

            // 檢查遊戲勝利條件 (15天)
            if (day > 15) {
                gameOver = true;
                endGame(day - 1, calculateFinalScore()); // 遊戲勝利，呼叫 endGame
            }

            // 檢查新的遊戲失敗條件 (第12天任務未達標或失敗過多)
            if (day === 12) {
                let currentSuccessfulTasks = 0;
                let currentFailedTasks = 0;

                if (player.major === 'science') {
                    currentSuccessfulTasks = successfulScienceTasksCount;
                    currentFailedTasks = failedScienceTasksCount;
                } else if (player.major === 'arts') {
                    currentSuccessfulTasks = successfulArtsTasksCount;
                    currentFailedTasks = failedArtsTasksCount;
                }

                if (player.major !== null && (currentSuccessfulTasks < REQUIRED_SUCCESSFUL_TASKS || currentFailedTasks >= MAX_FAILED_TASKS)) {
                    gameOver = true;
                    endGame(day - 1, calculateFinalScore(), "die_due_to_tasks");
                    return; // 遊戲結束
                }
            } else if (day > 12 && player.major !== null) {
                let currentFailedTasks = 0;
                if (player.major === 'science') {
                    currentFailedTasks = failedScienceTasksCount;
                } else if (player.major === 'arts') {
                    currentFailedTasks = failedArtsTasksCount;
                }
                // 如果在12天後才達到失敗任務數，也觸發結局
                if (currentFailedTasks >= MAX_FAILED_TASKS) {
                    gameOver = true;
                    endGame(day - 1, calculateFinalScore(), "die_due_to_tasks");
                    return; // 遊戲結束
                }
            }

            // 檢查 Boss 戰結局 (第14天結束時未參與或失敗)
            const bossBattleBuilding = buildings.find(b => b.minigameType === 'boss-battle');
            // 失敗就立即 Game Over（不論哪一天）
            if (bossBattleBuilding.visited && bossBattleResult === false) {
                gameOver = true;
                endGame(day, calculateFinalScore(), "die_due_to_boss");
                console.log('輸掉 Boss Battle 小遊戲');
            return;
            }

// 超過截止日還沒挑戰就 Game Over
if (!bossBattleBuilding.visited && day > bossBattleBuilding.deadlineDay) {
    gameOver = true;
    endGame(day, calculateFinalScore(), "die_due_to_boss");
    return;
}


            dayDisplay.textContent = day; // 更新天數顯示
            updateTaskUI(); // 每天更新任務 UI
        }
        lastDaySwitch = now;
    }

    // 判斷是否改變天氣
    const weatherChangeInterval = 15 * 1000; // 每 15 秒改變一次天氣
    if (now - lastWeatherChange >= weatherChangeInterval) {
        const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        // 如果天氣改變，則播放或停止雨聲
        if (newWeather !== currentWeather) {
            if (newWeather === "rain" || newWeather === "storm") {
                rainSound.volume = 0.4;
                rainSound.play();
            } else {
                rainSound.pause();
                rainSound.currentTime = 0;
            }
        }
        currentWeather = newWeather; // 更新當前天氣
        lastWeatherChange = now;
    }

    // 更新天氣顯示文字
    weatherDisplay.textContent =
        currentWeather === "sunny" ? "晴天" :
        currentWeather === "rain" ? "下雨" : "雷雨";
}

/**
 * 計算最終遊戲分數。
 * @returns {number} 最終分數。
 */
function calculateFinalScore() {
    const daysSurvived = day - 1;
    let playerScore = daysSurvived * 100 + foodCollected * 10 - damageTaken * 5;
    return Math.max(0, playerScore);
}

/**
 * 處理遊戲結束的邏輯，顯示結局畫面和分數。
 * @param {number} daysSurvived 玩家存活的天數。
 * @param {number} finalScore 玩家的最終分數。
 * @param {string} endingType 結局類型 (可選，例如 "die_due_to_tasks")
 */

document.getElementById("submit-score-button").addEventListener("click", () => {
    const nameInput = document.getElementById("player-name");
    const playerName = nameInput.value.trim();
    if (!playerName) {
        alert("請輸入名字！");
        return;
    }

    const newEntry = firebase.database().ref("scores").push();
    newEntry.set({
        name: playerName,
        score: score, // 使用全域 score 或傳入的 finalScore
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        document.getElementById("submit-score-button").disabled = true;
        loadLeaderboard();
    });
});




function endGame(daysSurvived, finalScore, endingType = "normal") {
    gameOver = true;
    cancelAnimationFrame(animationId);
    gamePaused = true; // 遊戲結束時暫停主遊戲

    let ending = "";
    if (endingType === "easter_ending") {
    ending = "你揭開了日記的秘密，看見了從未有人發現的真相。";
    }
    else if (endingType === "die_due_to_tasks") {
        ending = "你未能完成足夠的任務，或失敗次數過多，最終死當，被學校退學了！";
    } else if (endingType === "die_due_to_boss") {
        ending = "你未能通過期末考，最終被學校退學了！";
    } else if (daysSurvived <= 5) {
        ending = "你努力撐過了新手村的洗禮，但仍有許多挑戰等著你。";
    } else if (daysSurvived <= 10) {
        ending = "你逐漸融入了校園生活，開始找到了自己的節奏。";
    } else if (daysSurvived <= 14) {
        ending = "你成功應對了各種挑戰，成為校園中人人稱羨的傳說。";
    } else {
        ending = "你完成了整整15天的生存試煉，成為最終的生存之王！";
    }

    endingText.textContent = ending;
    scoreText.textContent = `你的分數：${score}`;
    gameOverScreen.style.display = "flex";

    // 顯示排行榜功能（✅ 加這段）
    document.getElementById("player-name").value = ""; // 清空輸入欄
    document.getElementById("submit-score-button").disabled = false;
    loadLeaderboard(); // 顯示前10名
}
/**
 * 更新遊戲狀態，包括玩家移動、飢餓度、血量、食物收集和天氣影響。
 * @param {number} deltaTime 自上一幀以來經過的時間（秒）。
 */
function update(deltaTime) {
    if (gameOver || gamePaused) return; // 遊戲結束或暫停時不更新主遊戲

    updateTimeAndWeather();
    spawnRiotStudents();
    updateRiotStudents(deltaTime); // 傳入 deltaTime

    let currentMoveSpeed = player.speed;
    if (currentWeather === "rain" && !player.activeEffects.noSlow) {
        currentMoveSpeed *= 0.7;
    } else if (!isDaytime) {
        currentMoveSpeed *= 0.9;
    }

    let dx = 0;
    let dy = 0;
    if (keys["ArrowUp"]) dy -= 1;
    if (keys["ArrowDown"]) dy += 1;
    if (keys["ArrowLeft"]) dx -= 1;
    if (keys["ArrowRight"]) dx += 1;

    const moveLength = Math.sqrt(dx * dx + dy * dy);

    if (moveLength > 0) {
        player.x += (dx / moveLength) * currentMoveSpeed * deltaTime;
        player.y += (dy / moveLength) * currentMoveSpeed * deltaTime;

        if (keys["Shift"]) {
            hunger -= (isDaytime ? 0.2 : 0.35) * 1.5 * deltaTime;
        }
    }

    const hungerRate = isDaytime ? 0.2 : 0.35;
    if (!keys["Shift"] || moveLength === 0) {
        hunger -= hungerRate * deltaTime;
    }

    if (hunger <= 0 && !gameOver) {
        hunger = 0;
        endGame(day - 1, calculateFinalScore());
    }

    const playerHalfSize = player.size / 2;
    player.x = Math.max(playerHalfSize, Math.min(mapWidth - playerHalfSize, player.x));
    player.y = Math.max(playerHalfSize, Math.min(mapHeight - playerHalfSize, player.y));

    for (let i = foodItems.length - 1; i >= 0; i--) {
        const food = foodItems[i];
        const dx = food.x - player.x;
        const dy = food.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < player.size + food.size) {
            foodItems.splice(i, 1);
            hunger = Math.min(hunger + 10, 100);
            score += 5;
            foodCollected++;
        }
    }

    const now = Date.now();
    const lightningCooldown = 12000;
    if (currentWeather === "storm" && now - lastLightningStrike >= lightningCooldown) {
        if (Math.random() < 0.2) {
            if (!player.activeEffects.lightningImmune) {
                health -= 10;
                damageTaken += 10;
                console.log("閃電擊中你！受傷 -10 血量");
            } else {
                console.log("防雷帽擋住了閃電！");
            }
            lastLightningStrike = now;
            thunderSound.currentTime = 0;
            thunderSound.play();

            if (health <= 0 && !gameOver) {
                health = 0;
                endGame(day - 1, calculateFinalScore());
            }
        }
    }

    hungerDisplay.textContent = hunger.toFixed(0);
    healthDisplay.textContent = health.toFixed(0);
    scoreDisplay.textContent = score;

    hungerBar.style.width = `${hunger}%`;
    healthBar.style.width = `${health}%`;
}

/**
 * 繪製夜晚視野效果。
 */
function drawNightVision() {
    const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, 200);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * 繪製天氣效果（下雨和雷雨）。
 */
function drawWeatherEffect() {
    if (currentWeather === "rain") {
        ctx.strokeStyle = "rgba(0,0,255,0.7)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 2, y + 10);
            ctx.stroke();
        }
    } else if (currentWeather === "storm" && Math.random() < 0.05) {
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

/**
 * 繪製暴動學生。
 */
function drawRiotStudents() {
    const viewX = player.x - canvas.width / 2;
    const viewY = player.y - canvas.height / 2;

    for (let student of riotStudents) {
        const sx = student.x - viewX;
        const sy = student.y - viewY;

        if (sx + student.size > 0 && sx < canvas.width &&
            sy + student.size > 0 && sy < canvas.height) {

            // 根據性別繪製不同顏色或形狀
            if (student.gender === 'male') {
                ctx.fillStyle = "darkred"; // 男生暴動學生
            } else {
                ctx.fillStyle = "purple"; // 女生暴動學生
            }
            ctx.fillRect(sx - student.size / 2, sy - student.size / 2, student.size, student.size);
            ctx.strokeStyle = "black";
            ctx.strokeRect(sx - student.size / 2, sy - student.size / 2, student.size, student.size);

            // 魅惑狀態的視覺回饋
            if (student.isCharmed) {
                ctx.fillStyle = "rgba(0, 255, 255, 0.5)"; // 青色半透明
                ctx.beginPath();
                ctx.arc(sx, sy, student.size / 2 + 5, 0, Math.PI * 2);
                ctx.fill();
            }

            const healthBarWidth = student.size;
            const healthBarHeight = 3;
            const healthRatio = student.health / studentInitialHealth;
            ctx.fillStyle = "gray";
            ctx.fillRect(sx - healthBarWidth / 2, sy - student.size / 2 - healthBarHeight - 5, healthBarWidth, healthBarHeight);
            ctx.fillStyle = "lime";
            ctx.fillRect(sx - healthBarWidth / 2, sy - student.size / 2 - healthBarHeight - 5, healthBarWidth * healthRatio, healthBarHeight);
        }
    }
}

/**
 * 繪製背景地圖。
 */
function drawBackground() {
    if (!backgroundLoaded) {
        ctx.fillStyle = isDaytime ? "#e0f7fa" : "#001a33";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
    }

    const sourceX = Math.max(0, Math.min(player.x - canvas.width / 2, mapWidth - canvas.width));
    const sourceY = Math.max(0, Math.min(player.y - canvas.height / 2, mapHeight - canvas.height));

    ctx.drawImage(
        backgroundImage,
        sourceX,
        sourceY,
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height
    );
}

/**
 * 繪製食物。
 */
function drawFood() {
    const viewX = player.x - canvas.width / 2;
    const viewY = player.y - canvas.height / 2;

    for (let f of foodItems) {
        const fx = f.x - viewX;
        const fy = f.y - viewY;
        if (fx + f.size > 0 && fx - f.size < canvas.width &&
            fy + f.size > 0 && fy - f.size < canvas.height) {
            ctx.fillStyle = "#ff9800";
            ctx.beginPath();
            ctx.arc(fx, fy, f.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

/**
 * 繪製建築物。
 */
function drawBuildings() {
    const viewX = player.x - canvas.width / 2;
    const viewY = player.y - canvas.height / 2;

    // 根據建築物名稱定義顏色映射，用於沒有圖片的建築物
    const buildingColors = {
        '依仁堂': '#03A9F4', // 淺藍色
        '總圖': '#795548', // 棕色
        '行政大樓': '#FFEB3B', // 黃色
        '體育館': '#673AB7', // 紫色
        '工程一館': '#FF5722', // 橙紅色
        '工程二館': '#FF5722', // 橙紅色
        '工程三館': '#FF5722', // 橙紅色
        '工程四館': '#FF5722', // 橙紅色
        '工程五館': '#FF5722', // 橙紅色
        '文學一館': '#9C27B0', // 紫色
        '文學二館': '#9C27B0', // 紫色
        '文學三館': '#9C27B0', // 紫色
        '客家學院': '#66BB6A', // 淺綠色
        '教研大樓': '#FFD700', // 金色
        '期末考場': '#8B0000', // 深紅色
        '神秘商店': '#008B8B', // 暗青色
    };

    for (let b of buildings) {
        // 特殊處理：神秘商店只在暴動學生出現當天顯示
        if (b.type === 'special' && b.name === '神秘商店') {
            if (day !== studentSpawnDay) {
                continue; // 不在指定天數則不繪製
            }
        }
        // 特殊處理：期末考場只在指定天數顯示
        if (b.minigameType === 'boss-battle') {
            if (day < b.availableDay || day > b.deadlineDay + 1) { // 顯示到截止日期的第二天
                continue; // 不在指定天數則不繪製
            }
        }


        const bx = b.x - viewX;
        const by = b.y - viewY;

        if (bx + b.width > 0 && bx < canvas.width &&
            by + b.height > 0 && by < canvas.height) {

            // 繪製建築物圖片或顏色
            if (b.imgSrc) {
                // 檢查圖片是否已經載入，如果沒有則載入
                if (!b.image) {
                    b.image = new Image();
                    b.image.src = b.imgSrc;
                    b.image.onerror = () => {
                        console.error(`圖片載入失敗: ${b.imgSrc}`);
                        b.image = null; // 標記為載入失敗，下次直接繪製顏色
                    };
                }

                // 如果圖片已載入完成，則繪製圖片
                if (b.image && b.image.complete) {
                    ctx.drawImage(b.image, bx, by, b.width, b.height);
                } else {
                    // 如果圖片正在載入或載入失敗，則繪製替代顏色
                    ctx.fillStyle = buildingColors[b.name] || '#4caf50'; // 預設綠色
                    ctx.fillRect(bx, by, b.width, b.height);
                }
            } else {
                // 如果沒有提供圖片路徑，則繪製顏色
                ctx.fillStyle = buildingColors[b.name] || '#4caf50'; // 預設綠色
                ctx.fillRect(bx, by, b.width, b.height);
            }

            ctx.strokeStyle = "#000";
            ctx.strokeRect(bx, by, b.width, b.height);

            // 繪製 "visited" 效果 (半透明黑色覆蓋層)
            if (b.visited) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                ctx.fillRect(bx, by, b.width, b.height);
            }

            // 在建築物上繪製文字標示名稱
            ctx.fillStyle = "white";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(b.name, bx + b.width / 2, by + b.height / 2);
        }
    }
}

function loadLeaderboard() {
    firebase.database().ref("scores")
        .once("value", snapshot => {
            const allData = [];
            snapshot.forEach(child => {
                const entry = child.val();
                if (entry.name && typeof entry.score === "number") {
                    allData.push(entry);
                }
            });

            // 依分數高到低排序，取前 10 名
            const top10 = allData.sort((a, b) => b.score - a.score).slice(0, 10);

            const leaderboard = document.getElementById("leaderboard");
            leaderboard.innerHTML = "";

            top10.forEach((entry, index) => {
                const li = document.createElement("li");
                li.textContent = `${index + 1}. ${entry.name} - ${entry.score} 分`;
                leaderboard.appendChild(li);
            });
        });
}






/**
 * 繪製地圖上的可拾取物品。
 */
function drawItems() {
    const viewX = player.x - canvas.width / 2;
    const viewY = player.y - canvas.height / 2;

    for (let item of items) {
        const ix = item.x - viewX;
        const iy = item.y - viewY;
        if (ix + item.size > 0 && ix < canvas.width &&
            iy + item.size > 0 && iy < canvas.height) {
            let itemColor = "purple";

            switch (item.type) { // 物品的 type 仍然保留，用於區分物品類型
                case 'food': // 食物也應該有自己的顏色
                    itemColor = "#ff9800";
                    break;
                case 'umbrella':
                    itemColor = "#8BC34A";
                    break;
                case 'lightningRod':
                    itemColor = "#FFC107";
                    break;
                case 'firstAidKit':
                    itemColor = "#F44336";
                    break;
                case 'weapon':
                    itemColor = "#607D8B";
                    break;
                case 'special':
                    itemColor = "#FF69B4"; // 愛的香水
                    break;
                default: // 如果有其他物品類型，可以設定預設顏色
                    itemColor = "purple";
                    break;
            }

            ctx.fillStyle = itemColor;
            ctx.fillRect(ix - item.size / 2, iy - item.size / 2, item.size, item.size);
            ctx.strokeStyle = "black";
            ctx.strokeRect(ix - item.size / 2, iy - item.size / 2, item.size, item.size);
        }
    }
}

/**
 * 更新建築物對話框的內容。
 * @param {string} title 對話框標題。
 * @param {string} text 對話框內容。
 */
function updateBuildingDialog(title, text) {
    dialogTitle.textContent = title;
    dialogText.innerHTML = text; // 使用 innerHTML 以便支持 <br> 標籤
    // 因為對話框現在是固定在 UI 內，所以不需要控制 display 屬性
}


/**
 * 繪製所有遊戲元素。
 */
function draw() {
    drawBackground(); // 自定義背景畫面

    // 計算相對視角偏移量（玩家固定在畫面中央）
    const viewX = player.x - canvas.width / 2;
    const viewY = player.y - canvas.height / 2;

    // 繪製地圖網格線（每 100px 一格）
    ctx.strokeStyle = "#ccc";
    for (let x = -viewX % 100; x < canvas.width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = -viewY % 100; y < canvas.height; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // 繪製各種遊戲物件
    drawBuildings(viewX, viewY);     // 建築物
    drawFood(viewX, viewY);          // 食物
    drawItems(viewX, viewY);         // 道具
    drawRiotStudents(viewX, viewY);  // 暴動學生

    // 繪製玩家（永遠在畫面正中央）
    ctx.fillStyle = "blue";
    ctx.fillRect(canvas.width / 2 - player.size / 2, canvas.height / 2 - player.size / 2, player.size, player.size);
    ctx.strokeStyle = "black";
    ctx.strokeRect(canvas.width / 2 - player.size / 2, canvas.height / 2 - player.size / 2, player.size, player.size);

    // 繪製攝影機彩蛋（若已出現）
    if (cameraEasterEggShown && cameraIconImage.complete) {
        ctx.drawImage(cameraIconImage, cameraX - viewX, cameraY - viewY, 64, 48);
    }

    // 夜晚視野限制
    if (!isDaytime) {
        drawNightVision();
    }

    // 天氣效果（雨、閃電等）
    drawWeatherEffect();
}

document.getElementById("start-button").addEventListener("click", () => {
    document.getElementById("start-screen").style.display = "none";
    initializeGameState();
    lastUpdateTime = performance.now();
    animationId = requestAnimationFrame(gameLoop);
});

restartButton.addEventListener("click", () => {
    //initializeGameState();
    //lastUpdateTime = performance.now();
    //animationId = requestAnimationFrame(gameLoop);
    location.reload(); // 重新載入整個網頁
});

let lastUpdateTime = 0;

function gameLoop(currentTime) {
    if (gameOver) {
        return;
    }

    const deltaTime = (currentTime - lastUpdateTime) / 1000;
    lastUpdateTime = currentTime;

    if (!gamePaused) { // 只有在遊戲沒有暫停時才更新和繪製主遊戲
        updateEasterEggTrigger();
        update(deltaTime);
        draw();
    }

    animationId = requestAnimationFrame(gameLoop);
}

// 首次載入時，顯示開始畫面，不直接啟動遊戲迴圈
// 遊戲迴圈將在點擊「開始遊戲」按鈕後啟動
// 初始化對話框為初始內容
updateBuildingDialog("歡迎來到校園！", "點擊附近的建築物來探索吧！");


// =====================================
// 籃球小遊戲邏輯 (Minigame 1)
// =====================================

/**
 * 重置小遊戲 1 的所有狀態變數。
 */
function resetMinigame1() {
    minigame1Active = false;
    minigame1Score = 0;
    minigame1Time = 15; // 重置時間為 15 秒
    ball.active = false;
    ball.x = minigame1Canvas.width / 2;
    ball.y = minigame1Canvas.height - 20;
    ball.vy = 0;
    hoop.x = minigame1Canvas.width / 2;
    hoop.dx = 2; // 這裡可以保留一個預設值，但實際會被 startBasketballGame 覆蓋

    if (minigame1AnimationFrameId) {
        cancelAnimationFrame(minigame1AnimationFrameId);
        minigame1AnimationFrameId = null; // 清除動畫幀 ID
    }
    if (minigame1TimerInterval) {
        clearInterval(minigame1TimerInterval);
        minigame1TimerInterval = null; // 清除計時器 ID
    }
}

startMinigame1Button.addEventListener('click', () => {
    minigame1Instructions.style.display = 'none'; // 隱藏說明
    minigame1GameArea.style.display = 'block'; // 顯示遊戲區
    minigame1ResultsScreen.style.display = 'none'; // 隱藏結果畫面
    startActualMinigame1(); // 真正開始小遊戲
});

minigame1ShootButton.addEventListener('click', () => {
    if (!ball.active) {
        ball.active = true;
        ball.x = minigame1Canvas.width / 2;
        ball.y = minigame1Canvas.height - 20;
        ball.vy = SHOOT_VELOCITY; // 使用定義的投籃初速度
    }
});

minigame1ExitButton.addEventListener('click', () => {
    minigame1Modal.style.display = 'none'; // 隱藏 modal
    gamePaused = false; // 恢復主遊戲
    resetMinigame1(); // 重置小遊戲狀態，確保下次進入時是初始狀態
});

/**
 * 顯示小遊戲 1 說明並準備開始遊戲。
 * @param {object} reward 小遊戲成功時的獎勵。
 * @param {object} penalty 小遊戲失敗時的懲罰。
 */
function startBasketballGame(reward, penalty) {
    resetMinigame1(); // 確保每次開始前都重置狀態

    minigame1TimeDisplay.textContent = minigame1Time; // 顯示初始時間
    minigame1ScoreDisplay.textContent = minigame1Score; // 顯示初始分數

    // 重置籃框位置並設定隨機速度和方向
    hoop.x = minigame1Canvas.width / 2;
    // 生成一個介於 2 到 5 之間的隨機速度，並隨機決定方向 (正數或負數)
    hoop.dx = (Math.random() * 3 + 2) * (Math.random() < 0.5 ? 1 : -1);


    // 顯示說明畫面，隱藏遊戲區和結果畫面
    minigame1Instructions.style.display = 'block';
    minigame1GameArea.style.display = 'none';
    minigame1ResultsScreen.style.display = 'none';

    // 儲存獎勵和懲罰，以便在遊戲結束時使用
    currentMinigame1Reward = reward;
    currentMinigame1Penalty = penalty;
}

/**
 * 真正開始籃球小遊戲的邏輯。
 */
function startActualMinigame1() {
    minigame1Active = true;
    minigame1Time = 15; // 確保時間從 15 開始倒數
    minigame1Score = 0; // 確保分數從 0 開始
    minigame1TimeDisplay.textContent = minigame1Time; // 立即更新顯示
    minigame1ScoreDisplay.textContent = minigame1Score; // 立即更新顯示

    // 重置球和籃框狀態 (雖然 resetMinigame1 已經做過，但這裡再次確保)
    ball.active = false;
    ball.x = minigame1Canvas.width / 2;
    ball.y = minigame1Canvas.height - 20;
    ball.vy = 0;
    // 籃框速度在 startBasketballGame 中已設定，這裡不需要重複設定 hoop.dx

    minigame1TimerInterval = setInterval(() => {
        minigame1Time--;
        minigame1TimeDisplay.textContent = minigame1Time;
        if (minigame1Time <= 0) {endMinigame1
            clearInterval(minigame1TimerInterval); // 清除計時器
            endMinigame1(true); // 時間到，結束遊戲
        }
    }, 1000);

    minigame1AnimationFrameId = requestAnimationFrame(minigame1Loop);
}


function minigame1Loop() {
    if (!minigame1Active) return;

    updateMinigame1();
    drawMinigame1();

    minigame1AnimationFrameId = requestAnimationFrame(minigame1Loop);
}

function updateMinigame1() {
    // 更新籃框位置
    hoop.x += hoop.dx; // 這裡使用 hoop.dx
    if (hoop.x + hoop.width > minigame1Canvas.width || hoop.x < 0) {
        hoop.dx *= -1; // 碰到邊界反向
    }

    // 更新球的位置
    if (ball.active) {
        ball.y += ball.vy;
        ball.vy += GRAVITY; // 使用定義的重力

        // 檢查球是否出界 (如果球掉到畫面底部)
        if (ball.y > minigame1Canvas.height - ball.radius) {
            ball.active = false; // 球出界，重置
            ball.y = minigame1Canvas.height - 20; // 重置到發射位置
            ball.vy = 0;
        }

        // 檢查球是否碰到籃框 (簡單的碰撞檢測)
        // 判斷球的中心點是否在籃框的水平範圍內，並且球的底部在籃框的垂直範圍內
        if (ball.y + ball.radius >= hoop.y && ball.y + ball.radius <= hoop.y + hoop.height &&
            ball.x >= hoop.x && ball.x <= hoop.x + hoop.width) {
            minigame1Score++;
            minigame1ScoreDisplay.textContent = minigame1Score;
            ball.active = false; // 球進籃，重置
            ball.y = minigame1Canvas.height - 20; // 重置到發射位置
            ball.vy = 0;

            // 如果得分達到勝利條件，立即結束遊戲
            if (minigame1Score >= 5) {
                endMinigame1(false); // 第二個參數 false 表示不是時間到結束，而是成功結束
            }
        }
    }
}

function drawMinigame1() {
    minigame1Ctx.clearRect(0, 0, minigame1Canvas.width, minigame1Canvas.height); // 清除畫布

    // 繪製籃框
    minigame1Ctx.fillStyle = 'orange';
    minigame1Ctx.fillRect(hoop.x, hoop.y, hoop.width, hoop.height);

    // 繪製籃網 (簡單的線條)
    minigame1Ctx.strokeStyle = 'white';
    minigame1Ctx.lineWidth = 1;
    minigame1Ctx.beginPath();
    minigame1Ctx.moveTo(hoop.x, hoop.y + hoop.height);
    minigame1Ctx.lineTo(hoop.x + 10, hoop.y + hoop.height + 20);
    minigame1Ctx.moveTo(hoop.x + hoop.width, hoop.y + hoop.height);
    minigame1Ctx.lineTo(hoop.x + hoop.width - 10, hoop.y + hoop.height + 20);
    minigame1Ctx.stroke();

    // 繪製球
    if (ball.active) {
        minigame1Ctx.fillStyle = 'brown';
        minigame1Ctx.beginPath();
        minigame1Ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        minigame1Ctx.fill();
    }

    // 繪製地面
    minigame1Ctx.fillStyle = '#4CAF50'; // 綠色
    minigame1Ctx.fillRect(0, minigame1Canvas.height - 10, minigame1Canvas.width, 10);
}

/**
 * 結束小遊戲 1 並根據結果應用獎勵或懲罰。
 * @param {boolean} timeUp 是否因為時間到而結束。
 */
function endMinigame1(timeUp) {
    minigame1Active = false;
    cancelAnimationFrame(minigame1AnimationFrameId);
    clearInterval(minigame1TimerInterval);

    let resultText = "";
    const REQUIRED_SCORE = 5; // 勝利所需分數

    if (minigame1Score >= REQUIRED_SCORE) { // 優先判斷是否達到勝利分數
        health = Math.min(health + (currentMinigame1Reward.health || 0), 100);
        hunger = Math.max(0, hunger + (currentMinigame1Reward.hunger || 0));
        resultText = `恭喜您成功了，獎勵您食物與一把雨傘。`;
        // 給予物品獎勵
        if (currentMinigame1Reward.items) {
            for (const item of currentMinigame1Reward.items) {
                player.inventory.push(item);
            }
            updateInventoryDisplay();
        }
    } else { // 未達到勝利分數
        health = Math.max(0, health + (currentMinigame1Penalty.health || 0));
        hunger = Math.max(0, hunger + (currentMinigame1Penalty.hunger || 0));
        resultText = `遺憾您失敗了，扣除${Math.abs(currentMinigame1Penalty.health)}點體力值，並增加${Math.abs(currentMinigame1Penalty.hunger)}點飢餓值。`;
    }

    // 更新主遊戲 UI 狀態條
    hungerBar.style.width = `${hunger}%`;
    healthBar.style.width = `${health}%`;
    hungerDisplay.textContent = hunger.toFixed(0);
    healthDisplay.textContent = health.toFixed(0);

    // 隱藏遊戲區和說明，顯示結果畫面
    minigame1GameArea.style.display = 'none';
    minigame1Instructions.style.display = 'none';
    minigame1ResultsScreen.style.display = 'flex'; // 顯示結果畫面 (使用 flex 以便內容居中)
    minigame1ResultText.textContent = resultText; // 更新結果文字

    // 這裡不再直接隱藏 modal，而是等待玩家點擊「離開」按鈕
    gamePaused = true; // 遊戲結束時暫停主遊戲
}


// =====================================
// 小問答邏輯 (工程二館 / 文學二館 / 客家學院)
// =====================================

startQuizButton.addEventListener('click', () => {
    quizInstructions.style.display = 'none';
    quizGameArea.style.display = 'flex'; // 使用 flex 讓內容垂直居中
    quizResultsScreen.style.display = 'none';
    startActualQuiz();
});

quizExitButton.addEventListener('click', () => {
    quizModal.style.display = 'none';
    gamePaused = false;
    resetQuiz();
});

/**
 * 重置問答小遊戲的所有狀態變數。
 */
function resetQuiz() {
    quizActive = false;
    currentQuizQuestionIndex = 0;
    currentQuizScore = 0;
    // 確保按鈕事件監聽器被移除或重置，避免重複觸發
    quizOptionButtons.forEach(button => {
        button.removeEventListener('click', handleQuizOptionClick);
    });
}

/**
 * 啟動問答小遊戲。
 * @param {string} taskId 當前問答任務的ID，用於判斷使用哪套題目。
 */
function startQuizMinigame(taskId) {
    resetQuiz(); // 重置問答狀態
    quizActive = true;
    quizModal.style.display = 'flex';
    quizInstructions.style.display = 'block';
    quizGameArea.style.display = 'none';
    quizResultsScreen.style.display = 'none';
    gamePaused = true; // 暫停主遊戲

    // 根據任務ID選擇題目集
    if (taskId === 'quiz_eng2') {
        quizQuestions = [...scienceQuizQuestions].sort(() => Math.random() - 0.5);
    } else if (taskId === 'arts2_quiz' || taskId === 'hakka2_quiz') {
        quizQuestions = [...artsQuizQuestions].sort(() => Math.random() - 0.5);
    } else {
        console.error("未知的問答任務ID:", taskId);
        quizQuestions = []; // 避免錯誤
    }

    displayNextQuizQuestion();
}

/**
 * 顯示下一道問答題目。
 */
function displayNextQuizQuestion() {
    if (currentQuizQuestionIndex < quizQuestions.length) {
        const questionData = quizQuestions[currentQuizQuestionIndex];
        quizQuestionDisplay.textContent = questionData.question;
        quizCurrentQuestionNum.textContent = `${currentQuizQuestionIndex + 1}`;
        quizScoreDisplay.textContent = currentQuizScore;

        // 清空並重新設定選項按鈕
        quizOptionsContainer.innerHTML = ''; // 清空舊按鈕
        questionData.options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('quiz-option-button');
            button.textContent = option;
            button.addEventListener('click', handleQuizOptionClick);
            quizOptionsContainer.appendChild(button);
        });
    } else {
        // 所有問題都已回答，結束問答
        endQuizMinigame();
    }
}

/**
 * 處理問答選項點擊事件。
 * @param {Event} event 點擊事件。
 */
function handleQuizOptionClick(event) {
    if (!quizActive) return;

    const selectedOption = event.target.textContent;
    const currentQuestion = quizQuestions[currentQuizQuestionIndex];

    if (selectedOption === currentQuestion.correctAnswer) {
        currentQuizScore++;
        console.log("答對了！");
    } else {
        console.log("答錯了！");
    }

    currentQuizQuestionIndex++;
    displayNextQuizQuestion(); // 顯示下一題或結束問答
}

/**
 * 結束問答小遊戲並根據結果應用獎勵或懲罰。
 */
function endQuizMinigame() {
    quizActive = false;
    gamePaused = true; // 保持主遊戲暫停，直到玩家點擊離開

    // 找到當前是哪個問答任務結束了
    let currentQuizTaskId = null;
    for(const task of allPossibleTasks) {
        if((task.id === 'quiz_eng2' || task.id === 'arts2_quiz' || task.id === 'hakka2_quiz') && task.accepted && !task.completed) {
            currentQuizTaskId = task.id;
            break;
        }
    }

    let quizTask = allPossibleTasks.find(t => t.id === currentQuizTaskId);
    let success = currentQuizScore >= QUIZ_REQUIRED_CORRECT;
    let resultText = "";

    if (success) {
        resultText = `恭喜你！你答對了 ${currentQuizScore} 題，成功完成了問答！`;
        completeTask(currentQuizTaskId, true); // 任務成功
        updateBuildingDialog(quizTask.dialogTitle, quizTask.dialog.complete);
    } else {
        resultText = `很遺憾，你只答對了 ${currentQuizScore} 題，未能完成問答。`;
        completeTask(currentQuizTaskId, false); // 任務失敗
        updateBuildingDialog(quizTask.dialogTitle, quizTask.dialog.fail);
    }

    quizResultText.textContent = resultText;
    quizGameArea.style.display = 'none';
    quizInstructions.style.display = 'none';
    quizResultsScreen.style.display = 'flex'; // 顯示結果畫面
}


// =====================================
// Boss 戰射擊小遊戲邏輯 (Minigame 2)
// =====================================

// 初始化射擊小遊戲
function initShootingMinigame2() {
    if (!minigame2Canvas || !minigame2Ctx) {
        console.error("minigame2Canvas or context not found!");
        return;
    }

    minigame2Canvas.width = BOSS_MINIGAME_WIDTH;
    minigame2Canvas.height = BOSS_MINIGAME_HEIGHT;

    bossMinigamePlayer = {
        x: BOSS_MINIGAME_WIDTH / 2,
        y: BOSS_MINIGAME_HEIGHT - BOSS_PLAYER_SIZE - 10,
        width: BOSS_PLAYER_SIZE,
        height: BOSS_PLAYER_SIZE,
        health: 10,
        displayElement: minigame2PlayerHealthDisplay
    };

    bossMinigameProfessor = {
        x: BOSS_MINIGAME_WIDTH / 2,
        y: BOSS_PLAYER_SIZE + 10,
        width: BOSS_PROFESSOR_SIZE,
        height: BOSS_PROFESSOR_SIZE,
        health: 20,
        speed: 2,
        directionX: 1,
        directionY: 1,
        displayElement: minigame2ProfessorHealthDisplay
    };

    bossMinigamePlayerProjectiles = [];
    bossMinigameProfessorProjectiles = [];

    // 確保只綁定一次事件
    minigame2Canvas.removeEventListener('click', firePlayerProjectile2);
    minigame2Canvas.addEventListener('click', firePlayerProjectile2);

    updateBossMinigame2HealthDisplays();
}

// 玩家發射子彈
function firePlayerProjectile2(event) {
    if (!minigame2Active) return;

    const rect = minigame2Canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const dx = mouseX - bossMinigamePlayer.x;
    const dy = mouseY - bossMinigamePlayer.y;
    const angle = Math.atan2(dy, dx);

    bossMinigamePlayerProjectiles.push({
        x: bossMinigamePlayer.x,
        y: bossMinigamePlayer.y,
        angle: angle,
        width: BOSS_PROJECTILE_SIZE,
        height: BOSS_PROJECTILE_SIZE,
    });
}

// 教授發射子彈
function fireProfessorProjectile2() {
    const dx = bossMinigamePlayer.x - bossMinigameProfessor.x;
    const dy = bossMinigamePlayer.y - bossMinigameProfessor.y;
    const angle = Math.atan2(dy, dx);

    bossMinigameProfessorProjectiles.push({
        x: bossMinigameProfessor.x,
        y: bossMinigameProfessor.y,
        angle: angle,
        width: BOSS_PROJECTILE_SIZE,
        height: BOSS_PROJECTILE_SIZE,
    });
}

// 更新血量顯示
function updateBossMinigame2HealthDisplays() {
    if (minigame2PlayerHealthDisplay) {
        minigame2PlayerHealthDisplay.textContent = bossMinigamePlayer.health;
    }
    if (minigame2ProfessorHealthDisplay) {
        minigame2ProfessorHealthDisplay.textContent = bossMinigameProfessor.health;
    }
}

// 更新遊戲狀態
function updateShootingMinigame2() {
    // 教授移動
    bossMinigameProfessor.x += bossMinigameProfessor.speed * bossMinigameProfessor.directionX;
    bossMinigameProfessor.y += bossMinigameProfessor.speed * bossMinigameProfessor.directionY;

    // 水平邊界反轉
    if (bossMinigameProfessor.x - BOSS_PROFESSOR_SIZE / 2 < 0 ||
        bossMinigameProfessor.x + BOSS_PROFESSOR_SIZE / 2 > BOSS_MINIGAME_WIDTH) {
        bossMinigameProfessor.directionX *= -1;
    }
    // 垂直限制在畫面上半部並反轉
    if (bossMinigameProfessor.y - BOSS_PROFESSOR_SIZE / 2 < 0 ||
        bossMinigameProfessor.y + BOSS_PROFESSOR_SIZE / 2 > BOSS_MINIGAME_HEIGHT / 2) {
        bossMinigameProfessor.directionY *= -1;
    }

    // 教授射擊
    if (Date.now() - bossProfessorLastFired > BOSS_PROFESSOR_FIRE_RATE) {
        fireProfessorProjectile2();
        bossProfessorLastFired = Date.now();
    }

    // 更新玩家子彈位置與移除出界子彈
    bossMinigamePlayerProjectiles = bossMinigamePlayerProjectiles.filter(p => {
        p.x += Math.cos(p.angle) * BOSS_PLAYER_PROJECTILE_SPEED;
        p.y += Math.sin(p.angle) * BOSS_PLAYER_PROJECTILE_SPEED;
        return p.x > 0 && p.x < BOSS_MINIGAME_WIDTH && p.y > 0 && p.y < BOSS_MINIGAME_HEIGHT;
    });

    // 更新教授子彈位置與移除出界子彈
    bossMinigameProfessorProjectiles = bossMinigameProfessorProjectiles.filter(p => {
        p.x += Math.cos(p.angle) * BOSS_PROFESSOR_PROJECTILE_SPEED;
        p.y += Math.sin(p.angle) * BOSS_PROFESSOR_PROJECTILE_SPEED;
        return p.x > 0 && p.x < BOSS_MINIGAME_WIDTH && p.y > 0 && p.y < BOSS_MINIGAME_HEIGHT;
    });

    // 碰撞檢測
    checkCollisions2();

    // 更新血量顯示
    updateBossMinigame2HealthDisplays();
}

// 繪製遊戲
function drawShootingMinigame2() {
    if (!minigame2Ctx) return;

    minigame2Ctx.clearRect(0, 0, BOSS_MINIGAME_WIDTH, BOSS_MINIGAME_HEIGHT);

    // 玩家（藍色）
    minigame2Ctx.fillStyle = 'blue';
    minigame2Ctx.fillRect(
        bossMinigamePlayer.x - bossMinigamePlayer.width / 2,
        bossMinigamePlayer.y - bossMinigamePlayer.height / 2,
        bossMinigamePlayer.width,
        bossMinigamePlayer.height
    );

    // 教授（紅色）
    minigame2Ctx.fillStyle = 'red';
    minigame2Ctx.fillRect(
        bossMinigameProfessor.x - bossMinigameProfessor.width / 2,
        bossMinigameProfessor.y - bossMinigameProfessor.height / 2,
        bossMinigameProfessor.width,
        bossMinigameProfessor.height
    );

    // 玩家子彈（白色）
    minigame2Ctx.fillStyle = 'white';
    bossMinigamePlayerProjectiles.forEach(p => {
        minigame2Ctx.fillRect(
            p.x - p.width / 2,
            p.y - p.height / 2,
            p.width,
            p.height
        );
    });

    // 教授子彈（黃色）
    minigame2Ctx.fillStyle = 'yellow';
    bossMinigameProfessorProjectiles.forEach(p => {
        minigame2Ctx.fillRect(
            p.x - p.width / 2,
            p.y - p.height / 2,
            p.width,
            p.height
        );
    });
}

// 碰撞偵測
function checkCollisions2() {
    // 玩家子彈與教授碰撞
    for (let i = bossMinigamePlayerProjectiles.length - 1; i >= 0; i--) {
        const p = bossMinigamePlayerProjectiles[i];
        if (rectsOverlap(p, bossMinigameProfessor)) {
            bossMinigamePlayerProjectiles.splice(i, 1);
            bossMinigameProfessor.health--;
            score++;
            if (bossMinigameProfessor.health <= 0) {
                bossBattleResult = true;
                endBossBattleMinigame();
                return;
            }
        }
    }

    // 教授子彈與玩家碰撞
    for (let i = bossMinigameProfessorProjectiles.length - 1; i >= 0; i--) {
        const p = bossMinigameProfessorProjectiles[i];
        if (rectsOverlap(p, bossMinigamePlayer)) {
            bossMinigameProfessorProjectiles.splice(i, 1);
            bossMinigamePlayer.health--;
            if (bossMinigamePlayer.health <= 0) {
                bossBattleResult = false;
                endBossBattleMinigame();
                return;
            }
        }
    }
}

// 矩形碰撞判定
function rectsOverlap(a, b) {
    return !(
        a.x + a.width / 2 < b.x - b.width / 2 ||
        a.x - a.width / 2 > b.x + b.width / 2 ||
        a.y + a.height / 2 < b.y - b.height / 2 ||
        a.y - a.height / 2 > b.y + b.height / 2
    );
}

// 遊戲主迴圈
function runShootingMinigame2() {
    if (!minigame2Active) {
        cancelAnimationFrame(bossMinigameAnimationFrameId);
        return;
    }
    
    updateShootingMinigame2();
    drawShootingMinigame2();

    bossMinigameAnimationFrameId = requestAnimationFrame(runShootingMinigame2);
}

// 計時器倒數開始
function startBossMinigame2Timer() {
    let remainingTime = BOSS_BATTLE_DURATION;
    if (minigame2TimeDisplay) {
        minigame2TimeDisplay.textContent = remainingTime;
    }

    bossMinigameTimer = setInterval(() => {
        remainingTime--;
        if (minigame2TimeDisplay) {
            minigame2TimeDisplay.textContent = remainingTime;
        }
        if (remainingTime <= 0) {
            clearInterval(bossMinigameTimer);
            bossBattleResult = bossMinigameProfessor.health <= 0;
            endBossBattleMinigame();
        }
    }, 1000);
}

// 結束小遊戲
function endBossBattleMinigame() {
    minigame2Active = false;
    clearInterval(bossMinigameTimer);
    cancelAnimationFrame(bossMinigameAnimationFrameId);

    // 顯示結果畫面
    minigame2GameArea.style.display = 'none';
    minigame2ResultsScreen.style.display = 'block';

    if (bossBattleResult) {
        minigame2ResultText.textContent = '你擊敗了教授，獲得高分！恭喜！';
        // 增加主遊戲玩家屬性
        health = Math.min(health + 20, 100);
        hunger = Math.max(hunger - 15, 0);
        healthBar.value = health;
        hungerBar.value = hunger;
        healthDisplay.textContent = health;
        hungerDisplay.textContent = hunger;
    } else {
        minigame2ResultText.textContent = '你被教授擊敗了！';
    }
}

// 顯示小遊戲說明與「開始考試」按鈕
function startBossBattleMinigame() {
    minigame2Instructions.innerHTML = `
        <p>擊敗教授！使用滑鼠點擊射擊，躲避教授的攻擊。</p>
        <p>你有 <span id="minigame2-time-display">${BOSS_BATTLE_DURATION}</span> 秒的時間。</p>
        <button id="start-minigame2-button-real">開始考試</button>
    `;
    minigame2Instructions.style.display = 'block';
    minigame2GameArea.style.display = 'none';
    minigame2ResultsScreen.style.display = 'none';

    // 綁定真正開始遊戲的按鈕（避免重複綁定，先解除舊監聽）
    const realStartBtn = document.getElementById('start-minigame2-button-real');
    if (realStartBtn) {
        realStartBtn.removeEventListener('click', onRealStartClick);
        realStartBtn.addEventListener('click', onRealStartClick);
    }
}

function onRealStartClick() {
    // 初始化遊戲狀態與畫面
    initShootingMinigame2();

    minigame2Instructions.style.display = 'none';
    minigame2GameArea.style.display = 'block';
    minigame2ResultsScreen.style.display = 'none';

    minigame2Active = true;
    bossProfessorLastFired = Date.now();

    startBossMinigame2Timer();
    runShootingMinigame2();
}

// 綁定開始小遊戲的按鈕
if (startMinigame2Button) {
    startMinigame2Button.addEventListener('click', () => {
        console.log('開始 Boss Battle 小遊戲');
        startBossBattleMinigame();
    });
}

minigame2ExitButton.addEventListener('click', () => {
    // 停止小遊戲動畫與計時器
    minigame2Active = false;
    clearInterval(bossMinigameTimer);
    cancelAnimationFrame(bossMinigameAnimationFrameId);

    // 隱藏小遊戲相關元素（視你 HTML 結構調整）
    minigame2GameArea.style.display = 'none';
    minigame2Instructions.style.display = 'none';
    minigame2ResultsScreen.style.display = 'none';
    minigame2Modal.style.display = 'none'; 

    // 若有主遊戲 UI，這裡可以恢復主畫面或其他狀態
    gamePaused = false; // 恢復主遊戲
    console.log('離開 Boss Battle 小遊戲');
});
