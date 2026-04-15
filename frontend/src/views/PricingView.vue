<template>
  <div class="pricing-page">
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

    <!-- Hero 区域 -->
    <section class="pricing-hero">
      <div class="hero-wrapper">
        <h1 class="hero-title">选择适合您的方案</h1>
        <p class="hero-subtitle">从日常学习到企业级解决方案，总有一款适合您</p>
      </div>
    </section>

    <!-- 套餐卡片 -->
    <section class="pricing-cards">
      <div class="cards-grid">
        
        <!-- 基础版 -->
        <div class="plan-card basic">
          <div class="plan-header">
            <h3 class="plan-name">基础使用账户</h3>
            <p class="plan-desc">日常学习够用</p>
          </div>
          <div class="plan-price">
            <span class="price-amount">¥0</span>
            <span class="price-period">/永久</span>
          </div>
          <button class="plan-btn outline" @click="$router.push('/register')">立即开始</button>
          
          <div class="plan-features">
            <h4 class="features-title">功能权限</h4>
            <ul class="features-list">
              <li class="feature-item">
                <span class="feature-label">生成</span>
                <span class="feature-value">每日最多 3 次，单次 ≤200 字</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">任务</span>
                <span class="feature-value">基础题型、自动生成答案解析</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">导出</span>
                <span class="feature-value">MP3 音频 + Word 文本下载</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">操作</span>
                <span class="feature-value">三步极简</span>
              </li>
              <li class="feature-item disabled">
                <span class="feature-label">预览</span>
                <span class="feature-value">无在线预览 / 试听</span>
              </li>
              <li class="feature-item disabled">
                <span class="feature-label">数据</span>
                <span class="feature-value">仅基础数据，无学情/错题/补练</span>
              </li>
              <li class="feature-item disabled">
                <span class="feature-label">资源</span>
                <span class="feature-value">无资源库、无管理功能</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Plus 畅享版 -->
        <div class="plan-card plus">
          <div class="plan-badge">热门推荐</div>
          <div class="plan-header">
            <h3 class="plan-name">Plus 畅享版</h3>
            <p class="plan-desc">进阶功能，适配复杂教学</p>
          </div>
          <div class="plan-price">
            <span class="price-amount">¥{{ billingCycle === 'monthly' ? '11.9' : '119' }}</span>
            <span class="price-period">/{{ billingCycle === 'monthly' ? '月' : '年' }}</span>
          </div>
          <p class="price-note" v-if="billingCycle === 'yearly'">相当于 10 个月，赠送 2 个月</p>
          
          <div class="billing-toggle">
            <button 
              :class="{ active: billingCycle === 'monthly' }"
              @click="billingCycle = 'monthly'"
            >月付</button>
            <button 
              :class="{ active: billingCycle === 'yearly' }"
              @click="billingCycle = 'yearly'"
            >年付 <span class="save-tag">省¥23</span></button>
          </div>
          
          <button class="plan-btn filled" @click="handleSelect('plus')">立即开通</button>
          
          <div class="plan-features">
            <h4 class="features-title">含基础版全部功能</h4>
            <ul class="features-list">
              <li class="feature-item">
                <span class="feature-label">生成</span>
                <span class="feature-value">每月 ≤50 次，单次 ≤450 字</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">输入</span>
                <span class="feature-value">支持多模态文件上传（课件、图片等）</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">预览</span>
                <span class="feature-value">在线试听 + 文本预览</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">导出</span>
                <span class="feature-value">多格式导出、数据同步</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">资源</span>
                <span class="feature-value">个人资源库、分类检索、收藏</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">学情</span>
                <span class="feature-value">开启错题/学情/补练入口</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Pro 进阶版 -->
        <div class="plan-card pro">
          <div class="plan-header">
            <h3 class="plan-name">Pro 进阶版</h3>
            <p class="plan-desc">全流程闭环，专业学情追踪</p>
          </div>
          <div class="plan-price">
            <span class="price-amount">¥{{ billingCycle === 'monthly' ? '19.9' : '199' }}</span>
            <span class="price-period">/{{ billingCycle === 'monthly' ? '月' : '年' }}</span>
          </div>
          <p class="price-note" v-if="billingCycle === 'yearly'">相当于 10 个月，赠送 2 个月</p>
          
          <div class="billing-toggle">
            <button 
              :class="{ active: billingCycle === 'monthly' }"
              @click="billingCycle = 'monthly'"
            >月付</button>
            <button 
              :class="{ active: billingCycle === 'yearly' }"
              @click="billingCycle = 'yearly'"
            >年付 <span class="save-tag">省¥39</span></button>
          </div>
          
          <button class="plan-btn outline" @click="handleSelect('pro')">立即开通</button>
          
          <div class="plan-features">
            <h4 class="features-title">含 Plus 全部功能</h4>
            <ul class="features-list">
              <li class="feature-item">
                <span class="feature-label">生成</span>
                <span class="feature-value">每月 ≤100 次，更长文本、复杂场景</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">答题评阅</span>
                <span class="feature-value">在线答题、自动评分、错题记录</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">学情</span>
                <span class="feature-value">个人学情档案、可视化报告</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">补练</span>
                <span class="feature-value">AI 个性化补练推荐、效果跟踪</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">资源</span>
                <span class="feature-value">优先下载、自定义分类、历史复用</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">管理</span>
                <span class="feature-value">生成记录、错题、资源统一管理</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 校企 Pro 进阶版 -->
        <div class="plan-card enterprise">
          <div class="plan-header">
            <h3 class="plan-name">校企 Pro 进阶版</h3>
            <p class="plan-desc">学校 / 机构专属方案</p>
          </div>
          <div class="plan-price">
            <span class="price-amount">¥119</span>
            <span class="price-period">/人/年</span>
          </div>
          <p class="price-note">打包订阅 ¥2000-30000/年</p>
          
          <button class="plan-btn enterprise-btn" @click="handleSelect('enterprise')">联系我们</button>
          
          <div class="plan-features">
            <h4 class="features-title">含 Pro 全部功能</h4>
            <ul class="features-list">
              <li class="feature-item">
                <span class="feature-label">生成</span>
                <span class="feature-value">批量生成、按班级分配内容</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">管理</span>
                <span class="feature-value">学校-班级-个人三级权限</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">学情</span>
                <span class="feature-value">班级整体报告 + 单个学生分析</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">补练</span>
                <span class="feature-value">教师跟踪班级补练效果、数据统计</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">资源</span>
                <span class="feature-value">共建共享资源库、上传/分配/回收</span>
              </li>
              <li class="feature-item">
                <span class="feature-label">数据</span>
                <span class="feature-value">层级隔离、访问留痕、私有化部署</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </section>

    <!-- 功能对比表 -->
    <section class="comparison-section">
      <div class="section-wrapper">
        <h2 class="section-title">各等级功能权限总表</h2>
        
        <div class="table-container">
          <table class="comparison-table">
            <thead>
              <tr>
                <th class="feature-col">功能模块</th>
                <th>基础版</th>
                <th class="highlight-col">Plus 畅享版</th>
                <th>Pro 进阶版</th>
                <th>校企 Pro</th>
              </tr>
            </thead>
            <tbody>
              <!-- 生成相关 -->
              <tr class="category-row">
                <td colspan="5"><strong>听力材料生成</strong></td>
              </tr>
              <tr>
                <td>生成次数</td>
                <td>3次/天</td>
                <td class="highlight-col">50次/月</td>
                <td>100次/月</td>
                <td>不限量</td>
              </tr>
              <tr>
                <td>单次最大字数</td>
                <td>≤200字</td>
                <td class="highlight-col">≤450字</td>
                <td>更长文本</td>
                <td>不限</td>
              </tr>
              <tr>
                <td>多模态文件上传</td>
                <td class="no">-</td>
                <td class="highlight-col yes">支持</td>
                <td class="yes">支持</td>
                <td class="yes">支持</td>
              </tr>
              <tr>
                <td>批量生成</td>
                <td class="no">-</td>
                <td class="highlight-col no">-</td>
                <td class="no">-</td>
                <td class="yes">支持</td>
              </tr>
              
              <!-- 预览与导出 -->
              <tr class="category-row">
                <td colspan="5"><strong>预览与导出</strong></td>
              </tr>
              <tr>
                <td>在线预览/试听</td>
                <td class="no">-</td>
                <td class="highlight-col yes">支持</td>
                <td class="yes">支持</td>
                <td class="yes">支持</td>
              </tr>
              <tr>
                <td>导出格式</td>
                <td>MP3/Word</td>
                <td class="highlight-col">多格式</td>
                <td>全格式</td>
                <td>全格式</td>
              </tr>
              
              <!-- 答题与评阅 -->
              <tr class="category-row">
                <td colspan="5"><strong>答题与评阅</strong></td>
              </tr>
              <tr>
                <td>在线答题</td>
                <td class="no">-</td>
                <td class="highlight-col no">-</td>
                <td class="yes">支持</td>
                <td class="yes">支持</td>
              </tr>
              <tr>
                <td>自动评分</td>
                <td class="no">-</td>
                <td class="highlight-col no">-</td>
                <td class="yes">支持</td>
                <td class="yes">支持</td>
              </tr>
              
              <!-- 学情与补练 -->
              <tr class="category-row">
                <td colspan="5"><strong>学情与补练</strong></td>
              </tr>
              <tr>
                <td>学情分析</td>
                <td class="no">-</td>
                <td class="highlight-col">入口</td>
                <td class="yes">可视化报告</td>
                <td class="yes">班级报告</td>
              </tr>
              <tr>
                <td>AI 补练推荐</td>
                <td class="no">-</td>
                <td class="highlight-col">入口</td>
                <td class="yes">支持</td>
                <td class="yes">支持</td>
              </tr>
              <tr>
                <td>错题记录</td>
                <td class="no">-</td>
                <td class="highlight-col">入口</td>
                <td class="yes">完整记录</td>
                <td class="yes">支持</td>
              </tr>
              
              <!-- 资源管理 -->
              <tr class="category-row">
                <td colspan="5"><strong>资源与管理</strong></td>
              </tr>
              <tr>
                <td>个人资源库</td>
                <td class="no">-</td>
                <td class="highlight-col yes">支持</td>
                <td class="yes">支持</td>
                <td class="yes">支持</td>
              </tr>
              <tr>
                <td>共建资源库</td>
                <td class="no">-</td>
                <td class="highlight-col no">-</td>
                <td class="no">-</td>
                <td class="yes">支持</td>
              </tr>
              <tr>
                <td>班级管理</td>
                <td class="no">-</td>
                <td class="highlight-col no">-</td>
                <td class="no">-</td>
                <td class="yes">支持</td>
              </tr>
              <tr>
                <td>私有化部署</td>
                <td class="no">-</td>
                <td class="highlight-col no">-</td>
                <td class="no">-</td>
                <td class="yes">支持</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="faq-section">
      <div class="section-wrapper">
        <h2 class="section-title">常见问题</h2>
        
        <div class="faq-list">
          <div v-for="(faq, index) in faqs" :key="index" class="faq-item">
            <h3 class="faq-question">{{ faq.q }}</h3>
            <p class="faq-answer">{{ faq.a }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部 CTA -->
    <section class="cta-section">
      <div class="cta-wrapper">
        <h2 class="cta-title">准备好开始了吗？</h2>
        <p class="cta-desc">从免费版开始，体验 Hearhere 的强大功能</p>
        <button class="cta-btn" @click="$router.push('/register')">立即免费注册</button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2026 Hearhere. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const billingCycle = ref('monthly');

const faqs = [
  {
    q: '免费版每天3次用完了怎么办？',
    a: '免费版每日重置，您可以第二天继续使用。如果需要更频繁的使用，建议升级到 Plus 畅享版或 Pro 进阶版。'
  },
  {
    q: '升级后剩余次数会叠加吗？',
    a: 'Plus 和 Pro 的月度次数在每月初重置，不会叠加。校企版支持定制化的使用量方案。'
  },
  {
    q: '校企版如何定价？',
    a: '校企版支持按教师账号订阅（¥119/人/年）或打包订阅（¥2000-30000/年），价格根据人员规模浮动。请联系我们获取详细方案。'
  },
  {
    q: '支付方式有哪些？',
    a: '支持微信支付、支付宝、银行卡等主流支付方式。校企版支持对公转账。'
  },
  {
    q: '可以开具发票吗？',
    a: '可以，我们提供增值税普通发票或专用发票。如需发票，请联系客服。'
  }
];

const handleSelect = (plan) => {
  if (plan === 'enterprise') {
    alert('请联系客服获取企业版报价方案');
  } else {
    alert(`即将开通 ${plan.toUpperCase()} 版本`);
  }
};
</script>

<style scoped>
.pricing-page {
  font-family: 'Times New Roman', Times, serif;
  background: #ffffff;
  color: #333333;
}

.section-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 5%;
}

/* 导航栏 */
.glass-nav {
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 1rem 0;
}

.nav-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 5%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 3rem;
  padding-left: 12%;
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

/* Hero */
.pricing-hero {
  background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
  padding: 4rem 5%;
  text-align: center;
}

.hero-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333333;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #666666;
}

/* 套餐卡片 */
.pricing-cards {
  padding: 3rem 5%;
  background: #ffffff;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.plan-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid #eeeeee;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.plan-card.plus {
  border-color: #ff3b30;
  box-shadow: 0 5px 30px rgba(255, 59, 48, 0.15);
}

.plan-card.enterprise {
  background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%);
  color: #ffffff;
  border-color: #333333;
}

.plan-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff3b30;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.4rem 1rem;
  border-radius: 20px;
}

.plan-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.plan-desc {
  font-size: 0.9rem;
  color: #999999;
}

.enterprise .plan-desc {
  color: #999999;
}

.plan-price {
  text-align: center;
  margin-bottom: 1rem;
}

.price-amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333333;
}

.enterprise .price-amount {
  color: #ffffff;
}

.price-period {
  font-size: 1rem;
  color: #666666;
}

.enterprise .price-period {
  color: #999999;
}

.price-note {
  text-align: center;
  font-size: 0.85rem;
  color: #ff3b30;
  margin-bottom: 1rem;
}

/* 计费切换 */
.billing-toggle {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.billing-toggle button {
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.billing-toggle button.active {
  background: #ff3b30;
  color: #ffffff;
  border-color: #ff3b30;
}

.save-tag {
  font-size: 0.75rem;
  background: #ff3b30;
  color: #ffffff;
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  margin-left: 0.25rem;
}

.billing-toggle button.active .save-tag {
  background: #ffffff;
  color: #ff3b30;
}

/* 按钮 */
.plan-btn {
  width: 100%;
  padding: 0.9rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 1.5rem;
}

.plan-btn.outline {
  background: transparent;
  border: 2px solid #ff3b30;
  color: #ff3b30;
}

.plan-btn.outline:hover {
  background: rgba(255, 59, 48, 0.1);
}

.plan-btn.filled {
  background: #ff3b30;
  border: 2px solid #ff3b30;
  color: #ffffff;
}

.plan-btn.filled:hover {
  background: #cc2f26;
  border-color: #cc2f26;
}

.plan-btn.enterprise-btn {
  background: #ffffff;
  border: 2px solid #ffffff;
  color: #333333;
}

.plan-btn.enterprise-btn:hover {
  background: #f0f0f0;
}

/* 功能列表 */
.plan-features {
  border-top: 1px solid #eeeeee;
  padding-top: 1.5rem;
  flex: 1;
}

.enterprise .plan-features {
  border-top-color: #555555;
}

.features-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #ff3b30;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-item {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.enterprise .feature-item {
  border-bottom-color: #444444;
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #999999;
  margin-bottom: 0.25rem;
}

.feature-value {
  font-size: 0.9rem;
  color: #333333;
}

.enterprise .feature-value {
  color: #cccccc;
}

.feature-item.disabled .feature-value {
  color: #cccccc;
}

/* 功能对比表 */
.comparison-section {
  background: #fafafa;
  padding: 4rem 0;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: #333333;
}

.table-container {
  overflow-x: auto;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.comparison-table th,
.comparison-table td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #eeeeee;
}

.comparison-table th {
  background: #333333;
  color: #ffffff;
  font-weight: 600;
}

.comparison-table th.feature-col {
  text-align: left;
  width: 30%;
}

.comparison-table th.highlight-col {
  background: #ff3b30;
}

.comparison-table td {
  font-size: 0.95rem;
}

.comparison-table td:first-child {
  text-align: left;
  font-weight: 500;
}

.comparison-table tr:hover {
  background: #fafafa;
}

.comparison-table .category-row {
  background: #f5f5f5;
}

.comparison-table .category-row td {
  font-weight: 600;
  color: #333333;
}

.comparison-table .yes {
  color: #34c759;
  font-weight: 600;
}

.comparison-table .no {
  color: #cccccc;
}

.comparison-table .highlight-col {
  background: rgba(255, 59, 48, 0.05);
}

/* FAQ */
.faq-section {
  background: #ffffff;
  padding: 4rem 0;
}

.faq-list {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  padding: 1.5rem;
  border-bottom: 1px solid #eeeeee;
}

.faq-question {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 0.75rem;
}

.faq-answer {
  font-size: 1rem;
  color: #666666;
  line-height: 1.7;
}

/* CTA */
.cta-section {
  background: #333333;
  padding: 5rem 5%;
  text-align: center;
}

.cta-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
}

.cta-desc {
  font-size: 1.1rem;
  color: #cccccc;
  margin-bottom: 2rem;
}

.cta-btn {
  background: #ff3b30;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 1rem 3rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.cta-btn:hover {
  background: #cc2f26;
  transform: translateY(-2px);
}

/* Footer */
.footer {
  background: #ffffff;
  padding: 1.5rem;
  text-align: center;
  border-top: 1px solid #e0e0e0;
}

.footer p {
  color: #666666;
  font-size: 0.9rem;
}

/* 响应式 */
@media (max-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .nav-wrapper {
    padding-left: 5%;
  }
  
  .nav-links {
    display: none;
  }
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .comparison-table {
    font-size: 0.85rem;
  }
  
  .comparison-table th,
  .comparison-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>
