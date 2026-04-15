<template>
  <div class="dashboard-container">
    <!-- 动态背景 -->
    <div class="bg-gradient"></div>

    <!-- 用户导航栏 -->
    <nav class="user-nav">
      <div class="nav-wrapper">
        <div class="nav-logo">
          <img src="@/assets/hearhere-logo.png" alt="Hearhere" class="logo-img" @click="$router.push('/')" />
        </div>

        <div class="nav-links">
          <a href="#" class="nav-link active">听力材料生成</a>
          <a href="#" class="nav-link" @click.prevent="activeTab = 'library'">我的资源库</a>
          <a href="#" class="nav-link" @click.prevent="activeTab = 'analytics'">学情分析</a>
        </div>

        <div class="nav-user">
          <div class="user-info">
            <span class="user-name">{{ userInfo.username }}</span>
            <span class="user-plan">{{ planName }}</span>
          </div>
          <div class="user-avatar" @click="showUserMenu = !showUserMenu">
            {{ userInfo.username?.charAt(0).toUpperCase() }}
          </div>
          <!-- 用户菜单 -->
          <div v-if="showUserMenu" class="user-menu">
            <a href="#" @click.prevent="logout">退出登录</a>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="dashboard-main">
      <div class="main-wrapper">

        <!-- 左侧边栏：用户信息 -->
        <aside class="sidebar">
          <div class="user-card glass-card">
            <div class="user-avatar-large">
              {{ userInfo.username?.charAt(0).toUpperCase() }}
            </div>
            <h3 class="user-title">{{ userInfo.username }}</h3>
            <p class="user-plan-badge">{{ planName }}</p>

            <div class="usage-stats">
              <div class="stat-item">
                <span class="stat-label">今日剩余</span>
                <span class="stat-value">{{ remainingDaily }} 次</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">本月剩余</span>
                <span class="stat-value">{{ remainingMonthly }} 次</span>
              </div>
            </div>

            <div class="upgrade-section" v-if="userInfo.plan === 'free'">
              <p class="upgrade-hint">免费版功能受限</p>
              <button class="upgrade-btn" @click="$router.push('/pricing')">
                升级到 Plus
              </button>
            </div>
          </div>

          <!-- 快速操作 -->
          <div class="quick-actions glass-card">
            <h4>快捷操作</h4>
            <button class="action-btn" @click="$router.push('/pricing')">
              <span class="icon">📚</span> 查看定价
            </button>
            <button class="action-btn" @click="showHistory">
              <span class="icon">📋</span> 生成记录
            </button>
          </div>
        </aside>

        <!-- 右侧内容区 -->
        <section class="content-area">

          <!-- Tab: 生成听力材料 -->
          <div v-if="activeTab === 'generate'" class="tab-content">
            <div class="section-header">
              <h2>听力材料生成</h2>
              <p>填写基础信息，选择题目类型与占比，自动生成定制化听力材料</p>
            </div>

            <div class="glass-card generate-form">
              <div class="form-grid">
                <div class="form-item">
                  <label>单元主题</label>
                  <input
                    v-model="form.unit_topic"
                    type="text"
                    placeholder="例如：Preparing for Future Career"
                    @blur="handleInputTrim('unit_topic'); clearTaskResult()"
                    @input="clearTaskResult()"
                  />
                </div>

                <div class="form-item">
                  <label>核心词汇</label>
                  <input
                    v-model="form.core_words"
                    type="text"
                    placeholder="例如：resume,tuition（逗号分隔）"
                    @blur="handleInputTrim('core_words'); clearTaskResult()"
                    @input="clearTaskResult()"
                  />
                </div>

                <div class="form-item">
                  <label>语料长度</label>
                  <input
                    v-model.number="form.text_length"
                    type="number"
                    min="100"
                    max="150"
                    placeholder="默认 150"
                    @input="handleLengthInput; clearTaskResult()"
                  />
                </div>

                <div class="form-item">
                  <label>补充材料</label>
                  <textarea
                    v-model="form.supplementary_material"
                    placeholder="可选：提供额外的背景信息或要求（可留空）"
                    rows="2"
                    @input="clearTaskResult"
                  ></textarea>
                </div>

                <div class="form-item">
                  <label>难度</label>
                  <select v-model="form.difficulty" @change="handleDifficultyChange" class="difficulty-select">
                    <option value="1">初中</option>
                    <option value="2">高中</option>
                    <option value="3">大学非英语专业</option>
                    <option value="4">大学英语专业</option>
                    <option value="5">高阶水平</option>
                  </select>
                </div>

                <div class="form-item">
                  <label>语速</label>
                  <select v-model="form.speed_ratio" class="speed-select">
                    <option value="0.85">缓慢</option>
                    <option value="0.95">较慢</option>
                    <option value="1.1">正常</option>
                    <option value="1.3">较快</option>
                  </select>
                </div>
              </div>

              <!-- 题型选择 -->
              <div class="question-types">
                <h3>选择题目类型（点击选中，输入题量）</h3>
                <div class="type-grid">
                  <div
                    v-for="(item, idx) in questionTypes"
                    :key="idx"
                    class="type-item"
                    :class="{ active: item.checked }"
                    @click="toggleQuestionType(item)"
                  >
                    {{ item.name }}
                    <input
                      v-if="item.checked"
                      :value="item.count"
                      @input="handleCountInput(item, $event)"
                      type="text"
                      placeholder="题量"
                      class="type-count-input"
                      @click.stop
                    />
                  </div>
                </div>
              </div>

              <button
                class="generate-btn"
                @click="handleGenerate"
                :disabled="!canGenerate || isGenerating"
              >
                <span v-if="!isGenerating">🎧 生成听力材料</span>
                <span v-if="isGenerating">生成中...（请勿刷新）</span>
              </button>
            </div>

            <!-- 加载提示 -->
            <div v-if="isPolling" class="glass-card loading-card">
              <div class="loading-spinner"></div>
              <p>正在查询生成结果...（{{ pollCount }}/120）</p>
            </div>

            <!-- 结果展示 -->
            <div v-if="taskResult" class="glass-card result-card">
              <div v-if="taskResult.status === 'processing'" class="result-processing">
                <h3>任务处理中</h3>
                <p>任务 ID：{{ taskResult.taskId }}</p>
                <p>请稍候，听力材料正在生成...</p>
              </div>

              <div v-if="taskResult.status === 'completed'" class="result-success">
                <h3>✅ 生成成功！</h3>
                <p>任务 ID：{{ taskResult.taskId }}</p>

                <div v-if="taskResult.audioUrl" class="result-link">
                  <a :href="taskResult.audioUrl" target="_blank" class="link-btn">
                    🎵 收听/下载听力音频
                  </a>
                </div>

                <div v-if="taskResult.docUrl" class="result-link">
                  <a :href="taskResult.docUrl" target="_blank" class="link-btn">
                    📄 查看/下载题目与原文
                  </a>
                </div>

                <div class="result-actions">
                  <button class="action-btn-primary" @click="saveToLibrary">保存到资源库</button>
                  <button class="action-btn-secondary" @click="clearTaskResult">继续生成</button>
                </div>
              </div>

              <div v-if="taskResult.status === 'failed'" class="result-failed">
                <h3>❌ 生成失败</h3>
                <p>任务 ID：{{ taskResult.taskId }}</p>
                <p class="error-msg">{{ taskResult.errorMsg || '未知错误，请重试' }}</p>
                <button class="retry-btn" @click="handleGenerate">重新生成</button>
              </div>
            </div>
          </div>

          <!-- Tab: 我的资源库 -->
          <div v-if="activeTab === 'library'" class="tab-content">
            <div class="section-header">
              <h2>我的资源库</h2>
              <p>管理您生成的所有听力材料和练习题</p>
            </div>

            <div class="library-filters">
              <button
                v-for="filter in libraryFilters"
                :key="filter.key"
                :class="{ active: currentFilter === filter.key }"
                @click="currentFilter = filter.key"
              >
                {{ filter.label }}
              </button>
            </div>

            <div class="library-grid" v-if="libraryItems.length > 0">
              <div v-for="item in filteredLibrary" :key="item.id" class="library-item glass-card">
                <div class="item-header">
                  <span class="item-type">{{ item.type }}</span>
                  <span class="item-date">{{ item.date }}</span>
                </div>
                <h4 class="item-title">{{ item.title }}</h4>
                <div class="item-stats">
                  <span>📝 {{ item.questionCount }} 题</span>
                  <span>⏱️ {{ item.duration }}</span>
                </div>
                <div class="item-actions">
                  <button class="item-btn" @click="previewItem(item)">预览</button>
                  <button class="item-btn" @click="downloadItem(item)">下载</button>
                </div>
              </div>
            </div>

            <div v-else class="empty-state glass-card">
              <p>暂无资源</p>
              <button class="generate-btn" @click="activeTab = 'generate'">开始生成</button>
            </div>
          </div>

          <!-- Tab: 学情分析 -->
          <div v-if="activeTab === 'analytics'" class="tab-content">
            <div class="section-header">
              <h2>学情分析</h2>
              <p>查看您的学习进度和能力提升</p>
            </div>

            <div class="analytics-cards">
              <div class="stat-card glass-card">
                <h4>累计生成</h4>
                <p class="stat-number">28</p>
                <p class="stat-desc">份听力材料</p>
              </div>
              <div class="stat-card glass-card">
                <h4>平均正确率</h4>
                <p class="stat-number">76%</p>
                <p class="stat-desc">较上月 ↑12%</p>
              </div>
              <div class="stat-card glass-card">
                <h4>学习时长</h4>
                <p class="stat-number">5.2h</p>
                <p class="stat-desc">本周累计</p>
              </div>
            </div>

            <div class="glass-card weak-points">
              <h3>📌 薄弱点分析</h3>
              <div class="point-list">
                <div class="point-item">
                  <span class="point-name">时态判断</span>
                  <div class="point-bar">
                    <div class="point-fill" style="width: 65%"></div>
                  </div>
                  <span class="point-rate">正确率 65%</span>
                </div>
                <div class="point-item">
                  <span class="point-name">介词选择</span>
                  <div class="point-bar">
                    <div class="point-fill" style="width: 72%"></div>
                  </div>
                  <span class="point-rate">正确率 72%</span>
                </div>
                <div class="point-item">
                  <span class="point-name">连词使用</span>
                  <div class="point-bar">
                    <div class="point-fill" style="width: 80%"></div>
                  </div>
                  <span class="point-rate">正确率 80%</span>
                </div>
              </div>
            </div>
          </div>

        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="glass-footer">
      <div class="footer-wrapper">
        <p>© 2026 Hearhere. All rights reserved.</p>
      </div>
    </footer>

    <!-- 错误提示 -->
    <div v-if="errorMsg" class="glass-card error-card">
      <p>{{ errorMsg }}</p>
      <button class="close-btn" @click="errorMsg = ''">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 用户信息
const userInfo = ref({
  username: '用户',
  plan: 'free',
  remainingDaily: 3,
  remainingMonthly: 50
});

const showUserMenu = ref(false);

// 套餐名称映射
const planNameMap = {
  'free': '免费版',
  'plus': 'Plus 畅享版',
  'pro': 'Pro 进阶版',
  'school': '校企版'
};

const planName = computed(() => planNameMap[userInfo.value.plan] || '免费版');

// Tab 控制
const activeTab = ref('generate');

// 资源库
const libraryFilters = [
  { key: 'all', label: '全部' },
  { key: 'listening', label: '听力材料' },
  { key: 'exercises', label: '习题' },
  { key: 'favorites', label: '收藏' }
];
const currentFilter = ref('all');
const libraryItems = ref([]);

const filteredLibrary = computed(() => {
  if (currentFilter.value === 'all') return libraryItems.value;
  return libraryItems.value.filter(item => item.type === currentFilter.value);
});

// 表单数据
const form = reactive({
  unit_topic: '',
  core_words: '',
  text_length: 150,
  supplementary_material: '',
  difficulty: '4',
  speed_ratio: '1.1'
});

const questionTypes = ref([
  { name: '事实信息', key: 'Factual_Information', checked: true, count: 5 },
  { name: '推理判断', key: 'Inference_Judgment', checked: true, count: 2 },
  { name: '观点态度', key: 'Attitude_Opinion', checked: true, count: 2 },
  { name: '主旨大意', key: 'Main_Idea', checked: true, count: 1 },
]);

const taskResult = ref(null);
const isGenerating = ref(false);
const isPolling = ref(false);
const pollCount = ref(0);
const errorMsg = ref('');
let pollTimer = null;

// 计算属性
const remainingDaily = computed(() => userInfo.value.remainingDaily);
const remainingMonthly = computed(() => userInfo.value.remainingMonthly);

const canGenerate = computed(() => {
  const unitTopic = form.unit_topic.trim();
  const coreWords = form.core_words.trim();
  const textLength = Number(form.text_length);

  if (!unitTopic) return false;
  if (!coreWords) return false;
  if (isNaN(textLength) || textLength < 100 || textLength > 150) return false;
  if (remainingDaily.value <= 0) return false;

  const hasChecked = questionTypes.value.some((t) => t.checked);
  if (!hasChecked) return false;

  const totalCount = questionTypes.value
    .filter((t) => t.checked)
    .reduce((sum, t) => sum + (t.count || 0), 0);

  if (totalCount <= 0) return false;

  return true;
});

// 方法
const handleInputTrim = (field) => {
  form[field] = form[field].trim();
};

const handleLengthInput = () => {
  const value = form.text_length;
  if (isNaN(value) || value === '') {
    form.text_length = 150;
  } else {
    form.text_length = Math.max(100, Math.min(150, value));
  }
};

const handleDifficultyChange = () => {
  const difficultySpeedMap = {
    '1': '0.85',
    '2': '1.1',
    '3': '1.1',
    '4': '1.1',
    '5': '1.3'
  };
  form.speed_ratio = difficultySpeedMap[form.difficulty];
  clearTaskResult();
};

const toggleQuestionType = (item) => {
  item.checked = !item.checked;
  if (!item.checked) {
    item.count = 0;
  }
  clearTaskResult();
};

const handleCountInput = (item, event) => {
  let value = event.target.value.replace(/[^0-9]/g, '');
  if (value === '') {
    item.count = 0;
  } else {
    item.count = parseInt(value, 10);
  }
  clearTaskResult();
};

const clearTaskResult = () => {
  taskResult.value = null;
  errorMsg.value = '';
  stopPolling();
};

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  isPolling.value = false;
  pollCount.value = 0;
};

const getToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('trial_token');
};

const buildParams = () => {
  const params = {
    Unit_Topic: form.unit_topic.trim(),
    Core_Vocabulary: form.core_words.trim(),
    Text_Length: Number(form.text_length),
    S_m: form.supplementary_material.trim() || ' ',
    difficulty: Number(form.difficulty),
    speed_ratio: Number(form.speed_ratio)
  };

  questionTypes.value.forEach(type => {
    if (type.checked && type.count > 0) {
      params[type.key] = Number(type.count);
    }
  });

  return params;
};

const handleGenerate = async () => {
  if (!canGenerate.value) return;
  clearTaskResult();
  isGenerating.value = true;
  errorMsg.value = '';

  try {
    const token = getToken();
    if (!token) {
      errorMsg.value = '请先登录';
      isGenerating.value = false;
      return;
    }

    const params = buildParams();

    const response = await fetch('/api/audio/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();
    if (result.success) {
      taskResult.value = {
        taskId: result.data.taskId,
        status: 'processing',
        remainingTrials: result.data.remainingTrials,
      };
      userInfo.value.remainingDaily--;
      startPolling(result.data.taskId);
    } else {
      errorMsg.value = result.message || '生成任务提交失败';
    }
  } catch (err) {
    console.error('提交任务失败:', err);
    errorMsg.value = '网络错误，请检查后端服务是否运行';
  } finally {
    isGenerating.value = false;
  }
};

const startPolling = (taskId) => {
  stopPolling();
  isPolling.value = true;
  pollCount.value = 0;

  pollTimer = setInterval(async () => {
    pollCount.value += 1;
    if (pollCount.value >= 120) {
      stopPolling();
      taskResult.value = {
        ...taskResult.value,
        status: 'failed',
        errorMsg: '生成超时，请重新尝试'
      };
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`/api/audio/task/${taskId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        const task = result.data;
        taskResult.value = {
          ...taskResult.value,
          status: task.status,
          audioUrl: task.audioUrl,
          docUrl: task.docUrl,
          errorMsg: task.errorMsg,
        };

        if (task.status === 'completed' || task.status === 'failed') {
          stopPolling();
        }
      }
    } catch (err) {
      console.error('轮询失败:', err);
    }
  }, 3000);
};

const saveToLibrary = () => {
  // TODO: 保存到资源库
  alert('功能开发中');
};

const showHistory = () => {
  activeTab.value = 'library';
};

const previewItem = (item) => {
  // TODO: 预览功能
  console.log('preview', item);
};

const downloadItem = (item) => {
  // TODO: 下载功能
  console.log('download', item);
};

const logout = () => {
  localStorage.removeItem('token');
  router.push('/');
};

// 初始化
onMounted(() => {
  const token = getToken();
  if (!token) {
    router.push('/login');
    return;
  }

  // TODO: 调用API获取用户信息
  // 这里先用模拟数据
  const storedUser = localStorage.getItem('userInfo');
  if (storedUser) {
    userInfo.value = JSON.parse(storedUser);
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-user')) {
      showUserMenu.value = false;
    }
  });
});

onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped>
.dashboard-container {
  font-family: 'Times New Roman', Times, serif;
  background: #f5f5f5;
  min-height: 100vh;
  color: #333333;
  position: relative;
  overflow-x: hidden;
}

.bg-gradient {
  display: none;
}

/* 通用容器 */
.main-wrapper,
.nav-wrapper,
.footer-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 5%;
  position: relative;
  z-index: 1;
}

/* 用户导航栏 */
.user-nav {
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0.8rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.nav-wrapper {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-logo {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 36px;
  width: auto;
  cursor: pointer;
}

.nav-links {
  display: flex;
  gap: 2rem;
  margin-left: 2rem;
}

.nav-link {
  color: #666666;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
}

.nav-link:hover,
.nav-link.active {
  color: #ff3b30;
  border-bottom-color: #ff3b30;
}

.nav-user {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-weight: 600;
  color: #333333;
}

.user-plan {
  font-size: 0.8rem;
  color: #ff3b30;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #ff3b30);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.3s;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-width: 120px;
}

.user-menu a {
  display: block;
  padding: 0.8rem 1.2rem;
  color: #333333;
  text-decoration: none;
  transition: background 0.3s;
}

.user-menu a:hover {
  background: #fff5f5;
  color: #ff3b30;
}

/* 主内容区 */
.dashboard-main {
  padding: 2rem 0;
  position: relative;
  z-index: 1;
}

.main-wrapper {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.glass-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
}

.user-card {
  text-align: center;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #ff3b30);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 2rem;
  margin: 0 auto 1rem;
}

.user-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #333333;
}

.user-plan-badge {
  color: #ff3b30;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.usage-stats {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  background: #f8f8f8;
  border-radius: 8px;
}

.stat-label {
  color: #666666;
  font-size: 0.9rem;
}

.stat-value {
  color: #ff3b30;
  font-weight: 600;
}

.upgrade-section {
  padding-top: 1rem;
  border-top: 1px solid #e8e8e8;
}

.upgrade-hint {
  color: #666666;
  font-size: 0.85rem;
  margin-bottom: 0.8rem;
}

.upgrade-btn {
  width: 100%;
  padding: 0.8rem;
  background: linear-gradient(135deg, #ff6b6b, #ff3b30);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
}

.upgrade-btn:hover {
  transform: scale(1.02);
}

.quick-actions h4 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #333333;
}

.quick-actions .action-btn {
  width: 100%;
  padding: 0.7rem 1rem;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #333333;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-actions .action-btn:hover {
  background: #fff5f5;
  border-color: #ff3b30;
  color: #ff3b30;
}

/* 内容区 */
.content-area {
  min-height: 600px;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.8rem;
  color: #333333;
  margin-bottom: 0.5rem;
}

.section-header p {
  color: #666666;
}

/* 表单 */
.generate-form {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-item label {
  font-weight: 600;
  font-size: 0.95rem;
  color: #333333;
}

.form-item input,
.form-item textarea,
.form-item select {
  padding: 0.8rem 1rem;
  border: 1px solid #cccccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  background: #ffffff;
  color: #333333;
  font-family: 'Times New Roman', Times, serif;
}

.form-item input:focus,
.form-item textarea:focus,
.form-item select:focus {
  outline: none;
  border-color: #ff3b30;
  box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.1);
}

.form-item textarea {
  resize: vertical;
  min-height: 60px;
}

/* 题型选择 */
.question-types {
  margin-bottom: 2rem;
}

.question-types h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333333;
}

.type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.type-item {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.5rem;
  background: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  font-size: 0.95rem;
  color: #333333;
  border: 2px solid #e0e0e0;
}

.type-item:hover {
  border-color: #ff3b30;
  color: #ff3b30;
}

.type-item.active {
  background: #ff3b30;
  color: #ffffff;
  border-color: #ff3b30;
}

.type-count-input {
  width: 50px;
  padding: 4px 6px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  color: #333333;
  border-radius: 4px;
  font-size: 0.85rem;
  margin-left: 0.6rem;
  text-align: center;
}

.type-count-input:focus {
  outline: 2px solid #ffffff;
  border-color: #ffffff;
}

/* 生成按钮 */
.generate-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #ff6b6b, #ff3b30);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.generate-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.generate-btn:hover:not(:disabled) {
  transform: scale(1.01);
  box-shadow: 0 4px 15px rgba(255, 59, 48, 0.3);
}

/* 加载 */
.loading-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  color: #666666;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e0e0e0;
  border-top: 3px solid #ff3b30;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 结果卡片 */
.result-card {
  padding: 2rem;
}

.result-card h3 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
}

.result-processing h3 {
  color: #ff6b6b;
}

.result-success h3 {
  color: #28a745;
}

.result-failed h3 {
  color: #ff3b30;
}

.result-link {
  margin-top: 1rem;
}

.link-btn {
  display: inline-block;
  padding: 0.8rem 1.2rem;
  background: #ffffff;
  color: #ff3b30;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  margin-right: 1rem;
  margin-bottom: 0.5rem;
  border: 2px solid #ff3b30;
}

.link-btn:hover {
  background: #ff3b30;
  color: #ffffff;
}

.result-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
}

.action-btn-primary {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #ff6b6b, #ff3b30);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.action-btn-secondary {
  padding: 0.8rem 1.5rem;
  background: #ffffff;
  color: #666666;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.action-btn-secondary:hover {
  border-color: #ff3b30;
  color: #ff3b30;
}

.error-msg {
  color: #ff3b30;
  margin: 0.8rem 0;
}

.retry-btn {
  padding: 0.7rem 1.2rem;
  background: #ff3b30;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* 资源库 */
.library-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.library-filters button {
  padding: 0.6rem 1.2rem;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  color: #666666;
  cursor: pointer;
  transition: all 0.3s;
}

.library-filters button.active,
.library-filters button:hover {
  background: #ff3b30;
  border-color: #ff3b30;
  color: #ffffff;
}

.library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.library-item {
  padding: 1.2rem;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

.item-type {
  background: #fff5f5;
  color: #ff3b30;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.item-date {
  color: #999999;
  font-size: 0.85rem;
}

.item-title {
  font-size: 1.1rem;
  color: #333333;
  margin-bottom: 0.8rem;
}

.item-stats {
  display: flex;
  gap: 1rem;
  color: #666666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.item-actions {
  display: flex;
  gap: 0.8rem;
}

.item-btn {
  flex: 1;
  padding: 0.6rem;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #333333;
  cursor: pointer;
  transition: all 0.3s;
}

.item-btn:hover {
  background: #ff3b30;
  border-color: #ff3b30;
  color: #ffffff;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666666;
}

.empty-state .generate-btn {
  max-width: 200px;
  margin: 1.5rem auto 0;
}

/* 学情分析 */
.analytics-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  text-align: center;
  padding: 2rem;
}

.stat-card h4 {
  color: #666666;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ff3b30;
  margin-bottom: 0.3rem;
}

.stat-desc {
  color: #999999;
  font-size: 0.9rem;
}

.weak-points {
  padding: 1.5rem;
}

.weak-points h3 {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: #333333;
}

.point-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.point-item {
  display: grid;
  grid-template-columns: 100px 1fr 100px;
  align-items: center;
  gap: 1rem;
}

.point-name {
  color: #333333;
  font-weight: 500;
}

.point-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.point-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #ff3b30);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.point-rate {
  color: #ff3b30;
  font-weight: 600;
  text-align: right;
}

/* Footer */
.glass-footer {
  background: #ffffff;
  padding: 1.5rem 0;
  text-align: center;
  border-top: 1px solid #e0e0e0;
  margin-top: 2rem;
}

.footer-wrapper p {
  color: #666666;
  font-size: 0.9rem;
}

/* 错误卡片 */
.error-card {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: #fff5f5;
  border: 1px solid #ffcccc;
  color: #333333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  min-width: 300px;
  z-index: 1000;
}

.close-btn {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  color: #666666;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  margin-left: 1rem;
}

.close-btn:hover {
  background: #ff3b30;
  color: #ffffff;
  border-color: #ff3b30;
}

/* 移动端适配 */
@media (max-width: 1024px) {
  .main-wrapper {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: -1;
    flex-direction: row;
    overflow-x: auto;
  }

  .user-card,
  .quick-actions {
    min-width: 250px;
  }

  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .analytics-cards {
    grid-template-columns: 1fr;
  }

  .point-item {
    grid-template-columns: 80px 1fr 80px;
  }
}
</style>
