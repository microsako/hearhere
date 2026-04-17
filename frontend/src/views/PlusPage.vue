<template>
  <div class="plus-container">
    <!-- 导航栏 -->
    <nav class="glass-nav">
      <div class="nav-wrapper">
        <div class="nav-logo">
          <img src="@/assets/hearhere-logo.png" alt="Hearhere" class="logo-img" />
          <span class="plus-badge">PLUS</span>
        </div>
        <div class="nav-links">
          <a href="#" class="nav-link" @click.prevent="$router.push('/')">首页</a>
          <a href="#" class="nav-link">为什么选择我们</a>
          <a href="#" class="nav-link">产品优势</a>
          <a href="#" class="nav-link">适用人群</a>
        </div>
        <!-- 剩余次数显示 -->
        <div class="nav-stats">
          <!-- Plus/Pro 用户无每日限制，只显示本月剩余 -->
          <div class="stat-item" v-if="userPlan === 'plus' || userPlan === 'pro'">
            <span class="stat-label">本月剩余</span>
            <span class="stat-value">{{ remainingMonthly }} 次</span>
          </div>
          <!-- 免费版用户显示今日和本月剩余 -->
          <template v-else>
            <div class="stat-item">
              <span class="stat-label">今日剩余</span>
              <span class="stat-value">{{ remainingDaily }} 次</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">本月剩余</span>
              <span class="stat-value">{{ remainingMonthly }} 次</span>
            </div>
          </template>
        </div>
        <button class="login-btn" @click="handleLogout">退出登录</button>
      </div>
    </nav>

    <!-- 主内容：听力材料生成（Plus 多模态版） -->
    <section class="generate-section">
      <div class="section-wrapper">
        <h1 class="generate-title">多模态听力材料生成</h1>
        <p class="generate-subtitle">
          填写基础信息，选择题目类型，上传文档/图片/PPT，自动生成定制化听力材料
        </p>

        <!-- 主卡片 -->
        <div class="glass-card generate-card">
          <!-- 基础信息 -->
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

            <div class="form-item length-item">
              <label>语料长度</label>
              <input
                v-model.number="form.text_length"
                type="number"
                min="100"
                max="450"
                placeholder="默认 150"
                @input="handleLengthInput"
                @blur="handleLengthBlur"
              />
              <span v-if="lengthHint" class="length-hint">{{ lengthHint }}</span>
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
              <select v-model="form.speed_ratio" class="speed-select">
                <option value="0.85">缓慢</option>
                <option value="0.95">较慢</option>
                <option value="1.1">正常</option>
                <option value="1.3">较快</option>
              </select>
            </div>
          </div>

          <!-- 多模态上传区域 -->
          <div class="multimodal-section">
            <h3>📎 多模态输入（可选）</h3>
            <p class="multimodal-hint">上传文档、图片或PPT，为AI提供更丰富的参考素材</p>

            <div class="upload-grid">
              <!-- Docs 上传 -->
              <div class="upload-card">
                <div class="upload-icon">📄</div>
                <div class="upload-label">文档</div>
                <div class="upload-area">
                  <input
                    type="file"
                    :ref="el => docsInputRef = el"
                    accept=".docx,.doc,.txt"
                    multiple
                    @change="handleFileUpload($event, 'docs')"
                  />
                  <div v-if="form.docs.length === 0" class="upload-placeholder" @click="docsInputRef?.click()">
                    <span>📎 点击上传文档</span>
                    <span class="upload-hint">.docx .doc .txt</span>
                  </div>
                  <div v-else class="file-list">
                    <div v-for="(file, idx) in form.docs" :key="idx" class="file-item">
                      <span class="file-name">{{ file.name || file }}</span>
                      <button class="remove-btn" @click.stop="removeFile('docs', idx)">×</button>
                    </div>
                    <div class="add-more" @click="docsInputRef?.click()">+ 添加更多</div>
                  </div>
                </div>
              </div>

              <!-- Images 上传 -->
              <div class="upload-card">
                <div class="upload-icon">🖼️</div>
                <div class="upload-label">图片</div>
                <div class="upload-area">
                  <input
                    type="file"
                    :ref="el => imagesInputRef = el"
                    accept="image/*"
                    multiple
                    @change="handleFileUpload($event, 'images')"
                  />
                  <div v-if="form.images.length === 0" class="upload-placeholder" @click="imagesInputRef?.click()">
                    <span>🖼️ 点击上传图片</span>
                    <span class="upload-hint">.jpg .png .webp</span>
                  </div>
                  <div v-else class="file-list">
                    <div v-for="(file, idx) in form.images" :key="idx" class="file-item">
                      <span class="file-name">{{ file.name || file }}</span>
                      <button class="remove-btn" @click.stop="removeFile('images', idx)">×</button>
                    </div>
                    <div class="add-more" @click="imagesInputRef?.click()">+ 添加更多</div>
                  </div>
                </div>
              </div>

              <!-- PPTs 上传 -->
              <div class="upload-card">
                <div class="upload-icon">📊</div>
                <div class="upload-label">PPT</div>
                <div class="upload-area">
                  <input
                    type="file"
                    :ref="el => pptsInputRef = el"
                    accept=".pptx,.ppt"
                    multiple
                    @change="handleFileUpload($event, 'ppts')"
                  />
                  <div v-if="form.ppts.length === 0" class="upload-placeholder" @click="pptsInputRef?.click()">
                    <span>📊 点击上传PPT</span>
                    <span class="upload-hint">.pptx .ppt</span>
                  </div>
                  <div v-else class="file-list">
                    <div v-for="(file, idx) in form.ppts" :key="idx" class="file-item">
                      <span class="file-name">{{ file.name || file }}</span>
                      <button class="remove-btn" @click.stop="removeFile('ppts', idx)">×</button>
                    </div>
                    <div class="add-more" @click="pptsInputRef?.click()">+ 添加更多</div>
                  </div>
                </div>
              </div>
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

            <!-- 音频播放器 -->
            <div v-if="taskResult.audioUrl" class="audio-player-section">
              <h4>🎧 在线试听</h4>
              <audio controls class="audio-player">
                <source :src="taskResult.audioUrl" type="audio/m4a" />
                <source :src="taskResult.audioUrl" type="audio/mp4" />
                <source :src="taskResult.audioUrl" type="audio/mpeg" />
                您的浏览器不支持音频播放
              </audio>
            </div>

            <!-- 文本内容预览（直接显示 cleanedoutput） -->
            <div v-if="taskResult.cleanedoutput" class="text-preview-section">
              <h4>📄 文本预览</h4>
              <div class="text-preview-content" v-html="formatTextPreview(taskResult.cleanedoutput)"></div>
            </div>

            <div v-if="taskResult.docUrl" class="result-link">
              <a :href="taskResult.docUrl" target="_blank" class="link-btn">
                下载题目与原文
              </a>
            </div>

            <!-- 微调反馈区域 -->
            <div class="regenerate-section">
              <h4>需要微调内容？</h4>
              <textarea
                v-model="reflection"
                placeholder="输入你的修改需求，例如：&#10;- 想要更多关于xxx的内容&#10;- 难度降低一些&#10;- 听力速度慢一点"
                class="reflection-input"
                rows="3"
              ></textarea>
              <div class="regenerate-actions">
                <button class="retry-btn" @click="handleRegenerate">微调并重新生成</button>
                <button class="new-btn" @click="handleNewGenerate">全新生成</button>
              </div>
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

let docsInputRef = null;
let imagesInputRef = null;
let pptsInputRef = null;

const form = reactive({
  unit_topic: '',
  core_words: '',
  text_length: 150,
  supplementary_material: '',
  difficulty: '4',
  speed_ratio: '1.1',
  docs: [],
  images: [],
  ppts: []
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

// 剩余次数
const remainingDaily = ref(3);
const remainingMonthly = ref(50);
const userPlan = ref('free'); // 用户套餐类型: free, plus, pro

// 二次生成相关
const reflection = ref('');  // 用户微调需求
const lastDocUrl = ref(''); // 上一次生成的文档链接
const errorMsg = ref('');
const lengthHint = ref('');
let pollTimer = null;

const handleInputTrim = (field) => {
  form[field] = form[field].trim();
};

const handleLengthInput = () => {
  const value = form.text_length;
  if (isNaN(value) || value === '') {
    lengthHint.value = '';
    return;
  }
  if (value > 500) {
    form.text_length = 500;
    lengthHint.value = '最大500字';
  } else if (value < 100) {
    lengthHint.value = '最小100字';
  } else {
    lengthHint.value = '';
  }
};

const handleLengthBlur = () => {
  const value = form.text_length;
  if (isNaN(value) || value === '') {
    form.text_length = 150;
  } else if (value < 100) {
    form.text_length = 100;
    lengthHint.value = '最小100字';
  } else if (value > 500) {
    form.text_length = 500;
    lengthHint.value = '最大500字';
  } else {
    lengthHint.value = '';
  }
  clearTaskResult();
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
  if (isNaN(textLength) || textLength < 100 || textLength > 500) return false;

  const hasChecked = questionTypes.value.some((t) => t.checked);
  if (!hasChecked) return false;

  const totalCount = questionTypes.value
    .filter((t) => t.checked)
    .reduce((sum, t) => sum + (t.count || 0), 0);

  if (totalCount <= 0) return false;

  // 检查剩余次数限制
  if (userPlan.value === 'free') {
    // 免费用户：需要每日或月度有剩余
    if (remainingDaily.value <= 0 && remainingMonthly.value <= 0) {
      return false;
    }
  } else if (userPlan.value === 'plus' || userPlan.value === 'pro') {
    // Plus/Pro 用户：只需要月度有剩余
    if (remainingMonthly.value <= 0) {
      return false;
    }
  }

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

const handleFileUpload = (event, type) => {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;
  form[type] = [...form[type], ...files];
  event.target.value = '';
  clearTaskResult();
};

const removeFile = (type, index) => {
  form[type].splice(index, 1);
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
  return localStorage.getItem('token');
};

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

// 获取用户信息（含实时剩余次数）
const fetchUserInfo = async () => {
  try {
    const token = getToken();
    if (!token) return;

    const response = await fetch('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    if (result.success && result.data) {
      userPlan.value = result.data.user?.plan || 'free';
      remainingDaily.value = result.data.remainingDaily ?? 3;
      const expectedMonthly = userPlan.value === 'plus' ? 100 : 
                            userPlan.value === 'pro' ? 200 : 50;
      remainingMonthly.value = result.data.remainingMonthly ?? expectedMonthly;
    }
  } catch (err) {
    console.error('获取用户信息失败:', err);
  }
};

onMounted(() => {
  fetchUserInfo();
});

// 格式化文本预览（将换行符转换为 HTML）
const formatTextPreview = (text) => {
  if (!text) return '';
  // 转义 HTML 特殊字符
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // 转换换行符为 <br>
  return escaped.replace(/\n/g, '<br>');
};

const buildParams = () => {
  const params = {
    workflowType: 'plus',  // Plus 页面使用 Plus 工作流
    Unit_Topic: form.unit_topic.trim(),
    Core_Vocabulary: form.core_words.trim(),
    Text_Length: Number(form.text_length),
    S_m: form.supplementary_material.trim() || ' ',
    difficulty: Number(form.difficulty),
    speed_ratio: Number(form.speed_ratio),
    // docs/images/ppts 已经是对象数组 [{file_id: "xxx"}, ...]
    docs: form.docs.map(f => f.file_id ? { file_id: f.file_id } : {}),
    images: form.images.map(f => f.file_id ? { file_id: f.file_id } : {}),
    ppts: form.ppts.map(f => f.file_id ? { file_id: f.file_id } : {})
  };

  questionTypes.value.forEach(type => {
    if (type.checked && type.count > 0) {
      params[type.key] = Number(type.count);
    }
  });

  return params;
};

const uploadFiles = async () => {
  // 只上传 File 对象（未上传的文件），过滤掉已转换的 {file_id: xxx} 对象
  const allFiles = [
    ...form.docs.map((f, idx) => ({ file: f, type: 'docs', idx })),
    ...form.images.map((f, idx) => ({ file: f, type: 'images', idx })),
    ...form.ppts.map((f, idx) => ({ file: f, type: 'ppts', idx }))
  ].filter(item => item.file instanceof File);

  console.log('📎 待上传文件:', allFiles);

  if (allFiles.length === 0) return;

  for (const { file, type, idx } of allFiles) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/audio/upload-multimodal', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        body: formData
      });

      const result = await response.json();
      console.log(`📎 上传${type}结果:`, result);
      
      if (result.success) {
        // 替换 File 对象为 {file_id, name} 对象
        if (type === 'docs') form.docs[idx] = { file_id: result.data.file_id, name: file.name };
        if (type === 'images') form.images[idx] = { file_id: result.data.file_id, name: file.name };
        if (type === 'ppts') form.ppts[idx] = { file_id: result.data.file_id, name: file.name };
      } else {
        console.error(`上传${type}失败:`, result.message);
      }
    } catch (err) {
      console.error(`上传 ${type} 文件失败:`, err);
    }
  }
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

    const hasFiles = form.docs.length > 0 || form.images.length > 0 || form.ppts.length > 0;
    if (hasFiles) {
      await uploadFiles();
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
      // 更新剩余次数（根据用户计划）
      if (userPlan.value === 'free') {
        // 免费用户：更新每日和每月剩余
        remainingDaily.value = result.data.remainingTrials ?? remainingDaily.value;
        if (result.data.monthlyRemaining !== undefined) {
          remainingMonthly.value = result.data.monthlyRemaining;
        }
      } else {
        // Plus/Pro 用户：只更新每月剩余
        if (result.data.monthlyRemaining !== undefined) {
          remainingMonthly.value = result.data.monthlyRemaining;
        }
      }
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
          cleanedoutput: task.cleanedoutput || '',
          errorMsg: task.errorMsg,
        };

        if (task.status === 'completed') {
          // 保存 docUrl 用于二次生成
          lastDocUrl.value = task.docUrl || '';
          stopPolling();
        } else if (task.status === 'failed') {
          stopPolling();
        }
      }
    } catch (err) {
      console.error('轮询失败:', err);
    }
  }, 3000);
};

// 微调并重新生成
const handleRegenerate = async () => {
  if (!reflection.value.trim()) {
    errorMsg.value = '请输入微调需求';
    return;
  }

  if (!lastDocUrl.value) {
    errorMsg.value = '缺少上一次生成的文档链接';
    return;
  }

  isGenerating.value = true;
  errorMsg.value = '';

  try {
    const token = getToken();
    const params = buildParams();

    // 添加二次生成专用参数
    params.link_of_doc = lastDocUrl.value;
    params.reflection = reflection.value.trim();

    const response = await fetch('/api/audio/regenerate', {
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
      };
      // 清空微调内容
      reflection.value = '';
      startPolling(result.data.taskId);
    } else {
      errorMsg.value = result.message || '微调生成失败';
    }
  } catch (err) {
    console.error('微调生成失败:', err);
    errorMsg.value = '网络错误，请重试';
  } finally {
    isGenerating.value = false;
  }
};

// 全新生成（清空当前内容）
const handleNewGenerate = () => {
  clearTaskResult();
  reflection.value = '';
  lastDocUrl.value = '';
  // 重置表单
  form.unit_topic = '';
  form.core_words = '';
  form.docs = [];
  form.images = [];
  form.ppts = [];
  form.supplementary_material = '';
};

onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped>
/* 容器 */
.plus-container {
  font-family: 'Times New Roman', Times, serif;
  background: #f5f5f5;
  min-height: 100vh;
  color: #333333;
  position: relative;
  overflow-x: hidden;
}

/* 通用容器 */
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

/* 导航栏剩余次数 */
.nav-stats {
  display: flex;
  gap: 1.5rem;
  margin-left: auto;
  padding-right: 1rem;
}

.nav-stats .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-stats .stat-label {
  font-size: 0.7rem;
  color: #999;
}

.nav-stats .stat-value {
  font-size: 0.85rem;
  color: #ff3b30;
  font-weight: 600;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-img {
  height: 40px;
  width: auto;
}

.plus-badge {
  background: #ff3b30;
  color: #ffffff;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
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

.length-item {
  position: relative;
}

.length-hint {
  font-size: 0.8rem;
  color: #ff3b30;
  margin-top: 0.3rem;
  display: block;
}

/* 多模态上传区域 */
.multimodal-section {
  background: #fafafa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 2px dashed #e0e0e0;
}

.multimodal-section h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333333;
  margin-bottom: 0.5rem;
}

.multimodal-hint {
  color: #666666;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.upload-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 1.2rem;
  text-align: center;
  border: 1px solid #e0e0e0;
  transition: all 0.3s;
}

.upload-card:hover {
  border-color: #ff3b30;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.upload-label {
  font-weight: 600;
  color: #333333;
  margin-bottom: 1rem;
}

.upload-area {
  position: relative;
  min-height: 80px;
}

.upload-area input[type="file"] {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border: 2px dashed #d0d0d0;
  border-radius: 8px;
  color: #666666;
  font-size: 0.9rem;
  transition: all 0.3s;
  background: #f5f5f5;
}

.upload-placeholder:hover {
  border-color: #ff3b30;
  background: #fff5f5;
}

.upload-hint {
  font-size: 0.75rem;
  color: #999999;
  margin-top: 0.3rem;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f5f5;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  position: relative;
}

.file-item .remove-btn {
  position: relative;
  z-index: 10;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333333;
}

.remove-btn {
  background: #ff3b30;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  margin-left: 0.5rem;
  transition: background 0.3s;
}

.remove-btn:hover {
  background: #cc2f26;
}

.add-more {
  color: #ff3b30;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.5rem;
  text-align: center;
  border: 1px dashed #ff3b30;
  border-radius: 6px;
  transition: all 0.3s;
}

.add-more:hover {
  background: #fff5f5;
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
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-radius: 4px;
  font-size: 0.85rem;
  margin-left: 0.6rem;
  text-align: center;
  font-family: 'Times New Roman', Times, serif;
}

.type-count-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
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
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
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

/* 微调反馈区域 */
.regenerate-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px dashed #ddd;
}

.regenerate-section h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.reflection-input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  min-height: 80px;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.reflection-input:focus {
  outline: none;
  border-color: #ff3b30;
}

.regenerate-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.new-btn {
  padding: 0.7rem 1.2rem;
  background: #666;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}

.new-btn:hover {
  background: #444;
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

/* 文本内容预览 */
.text-preview-section {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8f8f8;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.text-preview-section h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
}

.text-preview-content {
  max-height: 500px;
  overflow-y: auto;
  padding: 1rem;
  background: #fff;
  border-radius: 6px;
  font-size: 0.9rem;
  line-height: 1.8;
  color: #444;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 音频播放器 */
.audio-player-section {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8f8f8;
  border-radius: 8px;
}

.audio-player-section h4 {
  margin: 0 0 0.8rem 0;
  color: #333;
  font-size: 1rem;
}

.audio-player {
  width: 100%;
  height: 40px;
  border-radius: 20px;
}

/* 预览按钮 */
.preview-btn {
  padding: 0.7rem 1.2rem;
  background: #666;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: 0.5rem;
}

.preview-btn:hover {
  background: #444;
}

/* 文档预览弹窗 */
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-content {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.preview-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.close-preview-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-preview-btn:hover {
  color: #ff3b30;
}

.preview-body {
  flex: 1;
  overflow: hidden;
}

.doc-iframe {
  width: 100%;
  height: 70vh;
  border: none;
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

  .upload-grid {
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