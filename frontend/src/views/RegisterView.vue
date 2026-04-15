<template>
  <div class="register-container">
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

    <!-- 主内容 -->
    <section class="register-section">
      <div class="section-wrapper">
        <h1 class="register-title">创建账户</h1>
        <p class="register-subtitle">加入 Hearhere，开始您的个性化听力之旅</p>

        <div v-if="errorMessage" class="error-box">{{ errorMessage }}</div>

        <!-- 白色卡片 - 与 Trial 完全一致 -->
        <div class="glass-card register-card">
          <form @submit.prevent="handleRegister" class="register-form">
            <div class="form-item">
              <label>用户名</label>
              <input
                type="text"
                v-model="form.username"
                placeholder="设置您的用户名"
                required
                autocomplete="username"
                minlength="3"
                maxlength="20"
              />
              <p class="input-hint">3-20个字符，可包含字母、数字、下划线</p>
            </div>

            <div class="form-item">
              <label>邮箱地址</label>
              <input
                type="email"
                v-model="form.email"
                placeholder="请输入邮箱"
                required
                autocomplete="email"
              />
            </div>

            <div class="form-item">
              <label>密码</label>
              <input
                type="password"
                v-model="form.password"
                placeholder="设置密码"
                required
                autocomplete="new-password"
                @input="checkPasswordStrength"
              />
              <div class="password-strength" v-if="form.password">
                <div class="strength-bar">
                  <div class="strength-fill" :class="passwordStrengthClass" :style="{ width: passwordStrengthWidth }"></div>
                </div>
                <p class="strength-text" :class="passwordStrengthClass">{{ passwordStrengthText }}</p>
              </div>
              <p class="password-requirements">
                密码要求：至少8位，包含大写字母、小写字母、数字
              </p>
            </div>

            <div class="form-item">
              <label>确认密码</label>
              <input
                type="password"
                v-model="form.confirmPassword"
                placeholder="再次输入密码"
                required
                autocomplete="new-password"
              />
              <p v-if="form.confirmPassword && form.password !== form.confirmPassword" class="password-error">
                两次输入的密码不一致
              </p>
            </div>

            <button type="submit" class="submit-btn" :disabled="loading || !isFormValid">
              {{ loading ? '注册中...' : '注册' }}
            </button>
          </form>
        </div>

        <p class="switch-text">
          已有账户？<router-link to="/login">立即登录</router-link>
        </p>
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();

const form = ref({ username: '', email: '', password: '', confirmPassword: '' });
const errorMessage = ref('');
const loading = ref(false);

// 密码强度
const passwordStrength = ref(0);
const passwordStrengthClass = computed(() => {
  if (passwordStrength.value === 0) return '';
  if (passwordStrength.value === 1) return 'weak';
  if (passwordStrength.value === 2) return 'fair';
  if (passwordStrength.value === 3) return 'good';
  return 'strong';
});
const passwordStrengthText = computed(() => {
  if (passwordStrength.value === 0) return '';
  if (passwordStrength.value === 1) return '弱';
  if (passwordStrength.value === 2) return '一般';
  if (passwordStrength.value === 3) return '良好';
  return '强';
});
const passwordStrengthWidth = computed(() => {
  return `${passwordStrength.value * 25}%`;
});

const checkPasswordStrength = () => {
  const pwd = form.value.password;
  let strength = 0;
  
  // 长度 >= 8
  if (pwd.length >= 8) strength++;
  // 同时包含大小写
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
  // 包含数字
  if (/\d/.test(pwd)) strength++;
  // 包含特殊字符（加分项）
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;
  
  passwordStrength.value = Math.min(strength, 4);
};

// 密码验证规则
const isPasswordValid = computed(() => {
  const pwd = form.value.password;
  return pwd.length >= 8 && 
         /[a-z]/.test(pwd) && 
         /[A-Z]/.test(pwd) && 
         /\d/.test(pwd);
});

// 用户名验证规则
const isUsernameValid = computed(() => {
  const username = form.value.username;
  return username.length >= 3 && 
         username.length <= 20 && 
         /^[a-zA-Z0-9_]+$/.test(username);
});

// 表单是否有效
const isFormValid = computed(() => {
  return form.value.username && 
         form.value.email && 
         isPasswordValid.value && 
         form.value.confirmPassword && 
         form.value.password === form.value.confirmPassword;
});

const handleRegister = async () => {
  if (!isFormValid.value) {
    errorMessage.value = '请完善注册信息';
    return;
  }
  
  if (!isUsernameValid.value) {
    errorMessage.value = '用户名格式不正确（3-20个字符，可含字母、数字、下划线）';
    return;
  }
  
  if (!isPasswordValid.value) {
    errorMessage.value = '密码必须至少8位，包含大写字母、小写字母和数字';
    return;
  }

  errorMessage.value = '';
  loading.value = true;

  try {
    const result = await userStore.register(form.value.email, form.value.password, form.value.username);
    if (result.success) {
      // 注册成功后，把邮箱存起来，用于登录页面自动填充
      localStorage.setItem('justRegisteredEmail', form.value.email);
      router.push('/login');
    } else {
      errorMessage.value = result.message || '注册失败，请稍后重试';
    }
  } catch (error) {
    errorMessage.value = error.message || '注册失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 容器与背景 - 完全复制 Trial 风格 */
.register-container {
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

/* 导航栏 - 与 Trial 完全一致 */
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
  color: #333333;
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

/* 注册区域 - 与 Trial 完全一致 */
.register-section {
  padding: 3rem 0;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 70px);
}

.register-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #ff3b30;
}

.register-subtitle {
  text-align: center;
  color: #333333;
  margin-bottom: 2.5rem;
  font-size: 1rem;
  font-weight: 400;
}

/* 白色卡片 - 与 Trial 完全一致 */
.glass-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
  max-width: 500px;
  margin: 0 auto;
}

.register-card {
  padding: 2.5rem;
}

/* 表单 - 与 Trial 输入框完全一致 */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.form-item input {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid #cccccc;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s;
  background: #ffffff;
  color: #333333;
  font-family: 'Times New Roman', Times, serif;
  text-align: center;
  box-sizing: border-box;
}

/* 覆盖浏览器自动填充的灰色背景 */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
  -webkit-text-fill-color: #333333 !important;
  caret-color: #333333;
}

.form-item input::placeholder {
  color: #999999;
}

.form-item input:focus {
  outline: none;
  border-color: #ff3b30;
  box-shadow: 0 0 0 2px rgba(255, 59, 48, 0.1);
}

.password-error {
  color: #ff3b30;
  font-size: 0.85rem;
  margin-top: 0.3rem;
}

.input-hint {
  font-size: 0.8rem;
  color: #999999;
  margin-top: 0.3rem;
}

.password-requirements {
  font-size: 0.8rem;
  color: #999999;
  margin-top: 0.3rem;
}

/* 密码强度指示器 */
.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s;
  border-radius: 2px;
}

.strength-fill.weak { background: #ff3b30; width: 25%; }
.strength-fill.fair { background: #ff9500; width: 50%; }
.strength-fill.good { background: #34c759; width: 75%; }
.strength-fill.strong { background: #00c853; width: 100%; }

.strength-text {
  font-size: 0.8rem;
  margin-top: 0.3rem;
}

.strength-text.weak { color: #ff3b30; }
.strength-text.fair { color: #ff9500; }
.strength-text.good { color: #34c759; }
.strength-text.strong { color: #00c853; }

/* 提交按钮 - 与 Trial 生成按钮一致 */
.submit-btn {
  width: 100%;
  padding: 1rem;
  background: #ff3b30;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.5rem;
}

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background: #cc2f26;
}

/* 登录链接 */
.switch-text {
  text-align: center;
  color: #333333;
  font-size: 0.9rem;
  margin-top: 1.5rem;
}

.switch-text a {
  color: #ff3b30;
  text-decoration: none;
  font-weight: 600;
}

.switch-text a:hover {
  text-decoration: underline;
}

/* 错误提示 */
.error-box {
  background: #fff5f5;
  color: #ff3b30;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  text-align: center;
  border: 1px solid #ffcccc;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

/* Footer - 与 Trial 完全一致 */
.glass-footer {
  background: #ffffff;
  padding: 1.5rem 0;
  text-align: center;
  border-top: 1px solid #e0e0e0;
  position: relative;
  z-index: 1;
}

.footer-wrapper p {
  color: #333333;
  font-size: 0.9rem;
}

/* 移动端适配 - 与 Trial 一致 */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .nav-wrapper {
    padding-left: 5%;
    gap: 1rem;
  }

  .register-title {
    font-size: 2rem;
  }

  .register-subtitle {
    font-size: 0.95rem;
  }

  .register-card {
    padding: 1.5rem;
  }
}
</style>