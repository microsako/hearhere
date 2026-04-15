<template>
  <div class="trial-container">
    <!-- 动态背景 -->
    <div class="bg-gradient"></div>
    
    <!-- 导航栏 -->
    <nav class="glass-nav">
      <div class="nav-wrapper">
        <div class="nav-logo">
          <img src="@/assets/hearhere-logo.png" alt="Hearhere" class="logo-img" />
        </div>
        <div class="nav-links">
          <a href="#" class="nav-link" @click.prevent="$router.push('/')">首页</a>
          <a href="#" class="nav-link">为什么选择我们</a>
          <a href="#" class="nav-link">产品优势</a>
          <a href="#" class="nav-link">适用人群</a>
        </div>
        <button class="login-btn" @click="$router.push('/login')">登录</button>
      </div>
    </nav>

    <!-- 主内容：听力材料生成 -->
    <section class="generate-section">
      <div class="section-wrapper">
        <h1 class="generate-title">听力材料生成</h1>
        <p class="generate-subtitle">
          填写基础信息，并选择题目类型与占比，自动生成定制化听力材料。
        </p>

        <!-- 液态玻璃卡片 -->
        <div class="glass-card generate-card">
          <!-- 左侧：基础信息输入 -->
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
                rows="3"
                @input="clearTaskResult"
              ></textarea>
            </div>

            <div class="form-item">
              <label>难度</label>
              <select
                v-model="form.difficulty"
                @change="handleDifficultyChange"
                class="difficulty-select"
              >
                <option value="1">初中</option>
                <option value="2">高中</option>
                <option value="3">大学非英语专业</option>
                <option value="4">大学英语专业</option>
                <option value="5">高阶水平</option>
              </select>
            </div>

            <div class="form-item">
              <label>语速</label>
              <select
                v-model="form.speed_ratio"
                class="speed-select"
              >
                <option value="0.85">缓慢</option>
                <option value="0.95">较慢</option>
                <option value="1.1">正常</option>
                <option value="1.3">较快</option>
              </select>
            </div>
          </div>

          <!-- 右侧：题型选择 + 题量 -->
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

          <!-- 生成按钮 -->
          <button
            class="generate-btn"
            @click="handleGenerate"
            :disabled="!canGenerate || isGenerating"
          >
            <span v-if="!isGenerating">生成听力材料</span>
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
            <h3>生成成功！</h3>
            <p>任务 ID：{{ taskResult.taskId }}</p>
            
            <div v-if="taskResult.audioUrl" class="result-link">
              <a :href="taskResult.audioUrl" target="_blank" class="link-btn">
                收听/下载听力音频
              </a>
            </div>

            <div v-if="taskResult.docUrl" class="result-link">
              <a :href="taskResult.docUrl" target="_blank" class="link-btn">
                查看/下载题目与原文（PDF/DOCX）
              </a>
            </div>
          </div>

          <div v-if="taskResult.status === 'failed'" class="result-failed">
            <h3>生成失败</h3>
            <p>任务 ID：{{ taskResult.taskId }}</p>
            <p class="error-msg">{{ taskResult.errorMsg || '未知错误，请重试' }}</p>
            <button class="retry-btn" @click="handleGenerate">重新生成</button>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMsg" class="glass-card error-card">
          <p>{{ errorMsg }}</p>
          <button class="close-btn" @click="errorMsg = ''">×</button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="glass-footer">
      <div class="footer-wrapper">
        <p>© 2026 Hearhere. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
// hearhere 独有的功能逻辑，完整保留
import { ref, reactive, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

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

const canGenerate = computed(() => {
  const unitTopic = form.unit_topic.trim();
  const coreWords = form.core_words.trim();
  const textLength = Number(form.text_length);

  if (!unitTopic) return false;
  if (!coreWords) return false;
  if (isNaN(textLength) || textLength < 100 || textLength > 150) return false;

  const hasChecked = questionTypes.value.some((t) => t.checked);
  if (!hasChecked) return false;

  // 计算总题量，只要 > 0 即可
  const totalCount = questionTypes.value
    .filter((t) => t.checked)
    .reduce((sum, t) => sum + (t.count || 0), 0);
  
  if (totalCount <= 0) return false;

  return true;
});

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
  const token = localStorage.getItem('trial_token') || localStorage.getItem('token');
  if (!token) {
    generateTrialToken();
    return '';
  }
  return token;
};

const generateTrialToken = async () => {
  try {
    const response = await fetch('/api/trial/generate-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    if (result.success) {
      localStorage.setItem('trial_token', result.data.token);
    }
  } catch (err) {
    console.error('自动生成Token失败:', err);
  }
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

  // 只包含题量大于0的题型
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
      errorMsg.value = '试用Token获取失败，请刷新页面重试';
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

onUnmounted(() => {
  stopPolling();
});

generateTrialToken();
</script>

<style scoped>
/* 容器与背景 */
.trial-container {
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

/* 通用容器样式 */
.section-wrapper,
.nav-wrapper,
.footer-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 5%;
  position: relative;
  z-index: 1;
}

/* 导航栏 */
.glass-nav {
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 1rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.nav-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 3rem;
  padding-left: 15%;
}

.nav-logo {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 40px;
  width: auto;
}

.nav-links {
  display: flex;
  gap: 2rem;
  margin-left: auto;
}

.nav-link {
  color: #666666;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #ff3b30;
}

.login-btn {
  background: #ff3b30;
  color: #ffffff;
  border: none;
  border-radius: 25px;
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Times New Roman', Times, serif;
}

.login-btn:hover {
  background: #cc2f26;
}

/* 生成区域 */
.generate-section {
  padding: 3rem 0;
  position: relative;
  z-index: 1;
}

.generate-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #ff3b30;
}

.generate-subtitle {
  text-align: center;
  color: #333333;
  margin-bottom: 2.5rem;
  font-size: 1rem;
  font-weight: 400;
}

/* 白色卡片 */
.glass-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
  max-width: 900px;
  margin: 0 auto 1.5rem;
}

.generate-card {
  padding: 2.5rem;
}

/* 表单布局 */
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
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s;
  background: #ffffff;
  color: #333333;
  font-family: 'Times New Roman', Times, serif;
}

.form-item input::placeholder,
.form-item textarea::placeholder {
  color: #999999;
}

.form-item textarea {
  resize: vertical;
  min-height: 70px;
}

.form-item input:focus,
.form-item textarea:focus,
.form-item select:focus {
  outline: none;
  border-color: #ff3b30;
  box-shadow: 0 0 0 2px rgba(255, 59, 48, 0.1);
}

.form-item select option {
  background: #ffffff;
  color: #333333;
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
  justify-content: center;
  padding: 0.8rem 1.5rem;
  background: #ffffff;
  border-radius: 6px;
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
  font-family: 'Times New Roman', Times, serif;
}

.type-count-input:focus {
  outline: 2px solid #ff3b30;
  border-color: #ff3b30;
}

.type-count-input::placeholder {
  color: #999999;
}

/* 生成按钮 */
.generate-btn {
  width: 100%;
  padding: 1rem;
  background: #888888;
  color: #fff;
  border: none;
  border-radius: 6px;
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
  background: #666666;
}

/* 加载卡片 */
.loading-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #666666;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #ff3b30;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 结果卡片 */
.result-card h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #ff3b30;
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
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s;
  margin-right: 1rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ff3b30;
}

.link-btn:hover {
  background: #ff3b30;
  color: #ffffff;
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
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}

.retry-btn:hover {
  background: #cc2f26;
}

/* 错误卡片 */
.error-card {
  background: #fff5f5;
  border: 1px solid #ffcccc;
  color: #333333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem;
}

.close-btn {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  color: #666666;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #ff3b30;
  color: #ffffff;
  border-color: #ff3b30;
}

/* Footer */
.glass-footer {
  background: #ffffff;
  padding: 1.5rem 0;
  text-align: center;
  border-top: 1px solid #e0e0e0;
  position: relative;
  z-index: 1;
}

.footer-wrapper p {
  color: #666666;
  font-size: 0.9rem;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .generate-title {
    font-size: 2rem;
  }

  .nav-links {
    display: none;
  }

  .link-btn {
    display: block;
    width: 100%;
    margin-right: 0;
    text-align: center;
  }
  
  .type-item {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }

  .type-count-input {
    width: 45px;
  }
}
</style>
