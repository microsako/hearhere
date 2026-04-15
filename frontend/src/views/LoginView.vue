<template>
  <div class="login-container">
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
    <section class="login-section">
      <div class="section-wrapper">
        <h1 class="login-title">欢迎回来</h1>
        <p class="login-subtitle">登录您的账户</p>

        <div v-if="errorMessage" class="error-box">{{ errorMessage }}</div>

        <!-- 白色卡片 - 与 Trial 完全一致 -->
        <div class="glass-card login-card">
          <form @submit.prevent="handleLogin" class="login-form">
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
                placeholder="请输入密码"
                required
                autocomplete="current-password"
              />
            </div>

            <button type="submit" class="submit-btn" :disabled="loading">
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </form>
        </div>

        <p class="switch-text">
          还没有账户？<router-link to="/register">立即注册</router-link>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();

// 检查是否有刚注册的邮箱，自动填充
const justRegisteredEmail = localStorage.getItem('justRegisteredEmail') || '';
const form = ref({ email: justRegisteredEmail, password: '' });
const errorMessage = ref('');
const loading = ref(false);

// 如果有刚注册的邮箱，清除它（只自动填充一次）
if (justRegisteredEmail) {
  localStorage.removeItem('justRegisteredEmail');
}

const handleLogin = async () => {
  errorMessage.value = '';
  loading.value = true;

  try {
    const result = await userStore.login(form.value.email, form.value.password);
    if (result.success) {
      router.push('/dashboard');
    } else {
      errorMessage.value = result.message || '登录失败，请检查邮箱和密码';
    }
  } catch (error) {
    errorMessage.value = error.message || '登录失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 容器与背景 - 完全复制 Trial 风格 */
.login-container {
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

/* 登录区域 - 与 Trial 完全一致 */
.login-section {
  padding: 3rem 0;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 70px);
}

.login-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #ff3b30;
}

.login-subtitle {
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

.login-card {
  padding: 2.5rem;
}

/* 表单 - 与 Trial 输入框完全一致 */
.login-form {
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

/* 注册链接 */
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

  .login-title {
    font-size: 2rem;
  }

  .login-subtitle {
    font-size: 0.95rem;
  }

  .login-card {
    padding: 1.5rem;
  }
}
</style>