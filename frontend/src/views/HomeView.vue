<template>
  <div class="home-container">
    <!-- 导航栏 -->
    <nav class="glass-nav">
      <div class="nav-wrapper">
        <div class="nav-logo">
          <img src="@/assets/hearhere-logo.png" alt="Hearhere" class="logo-img" />
        </div>
        <div class="nav-links">
          <a href="#" class="nav-link active">首页</a>
          <a href="#why" class="nav-link">为什么选择我们</a>
          <a href="#features" class="nav-link">产品优势</a>
          <a href="#users" class="nav-link">适用人群</a>
          <a href="#" class="nav-link" @click.prevent="$router.push('/pricing')">定价</a>
        </div>
        <button class="login-btn" @click="$router.push('/login')">登录</button>
      </div>
    </nav>

    <!-- 首屏 Hero -->
    <section class="hero-section">
      <div class="hero-wrapper">
        <h1 class="hero-title">为每一位学习者生成适合自己的听力材料</h1>
        <div class="hero-highlights">
          <span class="highlight-item">一个课堂</span>
          <span class="highlight-divider">·</span>
          <span class="highlight-item">不同水平的学生</span>
        </div>
        <p class="hero-desc">
          Hearhere 可以根据学习者能力自动生成听力任务。<br>
          文本、题目和音频，一次生成。让听力练习真正实现个性化。
        </p>
        <div class="hero-buttons">
          <button class="btn-primary lg" @click="$router.push('/login')">登录使用</button>
          <button class="btn-outline lg" @click="$router.push('/trial')">免费试用</button>
        </div>
      </div>
    </section>

    <!-- 为什么选择我们 -->
    <section id="why" class="why-section">
      <div class="section-wrapper">
        <h2 class="section-title">为什么选择 Hearhere</h2>
        
        <div class="problem-card">
          <div class="problem-content">
            <h3>英语听力教学面临一个长期存在的问题：</h3>
            <p>在同一课堂中，学生的语言能力并不相同。有的学生能够轻松理解复杂语篇，而有的学生仍在努力跟上基础听力内容。</p>
          </div>
          <div class="problem-split">
            <div class="problem-item">
              <div class="problem-label">然而现实是</div>
              <p class="problem-text">大多数听力材料却只有一个难度</p>
            </div>
            <div class="problem-arrow">→</div>
            <div class="problem-item">
              <div class="problem-label">结果是</div>
              <p class="problem-text">许多学生要么听不懂材料，要么缺乏挑战</p>
            </div>
          </div>
        </div>

        <div class="solution-card">
          <h3 class="solution-title">我们希望改变这一点</h3>
          <p class="solution-intro">
            本平台基于<strong>生成式人工智能与智能体（AI Agent）技术</strong>，通过结构化提示词与语言难度控制机制，能够自动生成符合不同能力水平的英语听力材料。
          </p>
          
          <div class="solution-flow">
            <div class="flow-step">
              <div class="step-label">用户只需选择</div>
              <div class="step-items">
                <span class="step-tag">主题</span>
                <span class="step-tag">目标难度</span>
                <span class="step-tag">题型或任务形式</span>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-label">系统即可生成</div>
              <div class="step-items">
                <span class="step-tag primary">听力文本</span>
                <span class="step-tag primary">配套选择题</span>
                <span class="step-tag primary">可播放的听力音频</span>
              </div>
            </div>
          </div>

          <p class="solution-desc">
            所有材料都围绕<strong>真实语言使用场景</strong>设计，帮助学习者在接近真实语境的条件下提升听力能力。
          </p>
        </div>

        <div class="mission-card">
          <p class="mission-text">
            Hearhere 致力于为<strong>不同水平的学习者</strong>快速生成可调节难度的听力任务。
          </p>
          <p class="mission-text">
            在这里，<strong>教师</strong>可以轻松获得教学材料，<strong>学习者</strong>可以获得与自身能力匹配的听力练习。
          </p>
          <p class="mission-highlight">
            高质量听力材料，不再需要花费大量时间准备。
          </p>
        </div>
      </div>
    </section>

    <!-- 产品优势 -->
    <section id="features" class="features-section">
      <div class="section-wrapper">
        <h2 class="section-title">我们的独特之处</h2>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>基于研究的听力材料生成</h3>
            <p>不同于普通 AI 生成工具，Hearhere 的生成机制建立在语言测评研究与语料分析基础上。</p>
            <p>系统通过对真实英语考试语料的分析，构建了听力材料的语言指标体系。这些指标被嵌入到提示词框架中，使生成内容更加稳定、可控。</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>可调节的难度生成</h3>
            <p>平台支持根据学习者能力生成不同难度的听力材料。</p>
            <p>教师和学习者可以快速获得：</p>
            <ul class="feature-list">
              <li>练习型听力材料</li>
              <li>能力检测任务</li>
              <li>不同难度版本的同一主题内容</li>
            </ul>
            <p>让听力训练真正实现<strong>个性化与层级化</strong>。</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>几秒生成完整听力任务</h3>
            <p>传统听力试题开发往往需要：</p>
            <ul class="feature-list">
              <li>编写脚本</li>
              <li>设计题目</li>
              <li>制作音频</li>
            </ul>
            <p>而本平台可以在<strong>几秒内</strong>自动生成完整听力任务，包括：</p>
            <ul class="feature-list">
              <li>听力文本</li>
              <li>多项选择题</li>
              <li>自动语音音频</li>
            </ul>
            <p>让教师把更多时间用于教学，而不是材料准备。</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📚</div>
            <h3>面向学习与教学的工具</h3>
            <p>本平台适用于多种场景：</p>
            <ul class="feature-list">
              <li><strong>英语教师</strong>：快速生成不同难度的听力材料，用于课堂教学、听力训练、作业与测验设计等场景</li>
              <li><strong>学校&机构</strong>：支持机构级部署与批量使用，便于统一管理教学资源与学习数据</li>
              <li><strong>英语学习者</strong>：获得与自身水平匹配的听力练习材料，进行自主训练</li>
              <li><strong>教育研究者</strong>：生成难度可控的听力实验材料，为教学研究与测评实验提供稳定的数据来源</li>
            </ul>
            <p>通过智能生成的听力任务，学习者能够持续获得与自身水平匹配的语言输入。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 适用人群 -->
    <section id="users" class="users-section">
      <div class="section-wrapper">
        <h2 class="section-title">适用人群</h2>
        
        <div class="users-grid">
          <div class="user-card">
            <div class="user-icon">👨‍🏫</div>
            <h3>英语教师</h3>
            <p>快速生成不同难度的听力材料，用于课堂教学、听力训练、作业与测验设计等场景。通过自动化生成听力任务，教师可以大幅减少备课时间，将更多精力投入到课堂互动与学生学习表现的关注中。</p>
          </div>

          <div class="user-card">
            <div class="user-icon">🏫</div>
            <h3>学校&机构</h3>
            <p>支持机构级部署与批量使用，便于统一管理教学资源与学习数据。平台支持根据不同学习阶段和能力水平生成个性化听力材料，帮助机构开展更加分层化、定制化的听力教学。</p>
          </div>

          <div class="user-card">
            <div class="user-icon">🎓</div>
            <h3>英语学习者</h3>
            <p>学习者可以获得与自身水平匹配的听力练习材料，进行自主训练。通过持续接触难度适配的听力输入，逐步提升听力理解能力。</p>
          </div>

          <div class="user-card">
            <div class="user-icon">🔬</div>
            <h3>教育研究者</h3>
            <p>平台可用于语言教学与语言测评相关研究，支持生成难度可控的听力实验材料，为教学研究与测评实验提供稳定的数据来源。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="cta-wrapper">
        <h2 class="cta-title">让听力学习更智能</h2>
        <p class="cta-desc">
          让高质量、可调节难度的英语听力材料触手可及。<br>
          在 Hearhere，<strong>每一位英语学习者都能找到适合自己的挑战</strong>。
        </p>
        <button class="btn-primary lg" @click="$router.push('/trial')">开始免费试用</button>
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
</script>

<style scoped>
/* 容器 */
.home-container {
  font-family: 'Times New Roman', Times, serif;
  color: #333333;
  background: #ffffff;
  min-height: 100vh;
}

.section-wrapper,
.nav-wrapper,
.hero-wrapper,
.cta-wrapper,
.footer-wrapper {
  max-width: 1100px;
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

.nav-link:hover,
.nav-link.active {
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

/* 按钮 */
.btn-primary {
  background: #ff3b30;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Times New Roman', Times, serif;
}

.btn-primary:hover {
  background: #cc2f26;
}

.btn-primary.lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.btn-outline {
  background: transparent;
  color: #ff3b30;
  border: 2px solid #ff3b30;
  border-radius: 6px;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Times New Roman', Times, serif;
}

.btn-outline:hover {
  background: rgba(255, 59, 48, 0.1);
}

.btn-outline.lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Hero 区 */
.hero-section {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
  padding: 4rem 5%;
}

.hero-wrapper {
  max-width: 1200px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-title {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 1.5rem;
  color: #333333;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  text-align: center;
}

.hero-highlights {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  color: #ff3b30;
  font-weight: 600;
}

.highlight-divider {
  color: #cccccc;
}

.hero-desc {
  font-size: 1.1rem;
  color: #666666;
  line-height: 1.8;
  margin-bottom: 2.5rem;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

/* 章节标题 */
.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  padding-top: 4rem;
  color: #333333;
}

/* 为什么选择我们 */
.why-section {
  background: #ffffff;
  padding-bottom: 4rem;
}

.problem-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  border: 1px solid #eeeeee;
}

.problem-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 1rem;
}

.problem-content p {
  color: #666666;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.problem-split {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.problem-item {
  text-align: center;
  padding: 1.5rem 2rem;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  min-width: 250px;
}

.problem-label {
  font-size: 0.85rem;
  color: #999999;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.problem-text {
  font-size: 1rem;
  font-weight: 600;
  color: #333333;
}

.problem-arrow {
  font-size: 1.5rem;
  color: #ff3b30;
  font-weight: bold;
}

.solution-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  border: 2px solid #ff3b30;
}

.solution-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ff3b30;
  margin-bottom: 1.5rem;
  text-align: center;
}

.solution-intro {
  color: #666666;
  line-height: 1.8;
  margin-bottom: 2rem;
  text-align: center;
}

.solution-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
  padding: 2rem;
  background: #fafafa;
  border-radius: 8px;
}

.flow-step {
  text-align: center;
}

.step-label {
  font-size: 0.9rem;
  color: #666666;
  margin-bottom: 1rem;
}

.step-items {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.step-tag {
  padding: 0.5rem 1rem;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #666666;
}

.step-tag.primary {
  background: #ff3b30;
  color: #ffffff;
  border-color: #ff3b30;
}

.flow-arrow {
  font-size: 1.5rem;
  color: #ff3b30;
  font-weight: bold;
}

.solution-desc {
  color: #666666;
  line-height: 1.8;
  text-align: center;
}

.mission-card {
  background: linear-gradient(135deg, #ff3b30 0%, #ff6b6b 100%);
  border-radius: 12px;
  padding: 2.5rem;
  color: #ffffff;
  text-align: center;
}

.mission-text {
  font-size: 1.05rem;
  line-height: 1.8;
  margin-bottom: 1rem;
}

.mission-highlight {
  font-size: 1.2rem;
  font-weight: 700;
  margin-top: 1.5rem;
}

/* 产品优势 */
.features-section {
  background: #fafafa;
  padding-bottom: 4rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.feature-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #eeeeee;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333333;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #666666;
  line-height: 1.7;
  margin-bottom: 0.8rem;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0.8rem 0;
}

.feature-list li {
  color: #666666;
  line-height: 1.7;
  padding-left: 1.5rem;
  position: relative;
  margin-bottom: 0.5rem;
}

.feature-list li::before {
  content: "•";
  color: #ff3b30;
  position: absolute;
  left: 0;
  font-weight: bold;
}

/* 适用人群 */
.users-section {
  background: #ffffff;
  padding-bottom: 4rem;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.user-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  text-align: center;
  border: 1px solid #eeeeee;
  transition: transform 0.3s, box-shadow 0.3s;
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.user-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.user-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333333;
  margin-bottom: 1rem;
}

.user-card p {
  color: #666666;
  line-height: 1.7;
  font-size: 0.9rem;
}

/* CTA 区 */
.cta-section {
  background: #333333;
  color: #ffffff;
  padding: 6rem 0;
  text-align: center;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.cta-desc {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 2.5rem;
  color: #cccccc;
}

/* Footer */
.glass-footer {
  background: #ffffff;
  padding: 1.5rem 0;
  text-align: center;
  border-top: 1px solid #e0e0e0;
}

.footer-wrapper p {
  color: #666666;
  font-size: 0.9rem;
}

/* 移动端适配 */
@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: 1fr;
  }

  .users-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: clamp(1.2rem, 3vw, 2rem);
    white-space: nowrap;
    min-width: max-content;
  }

  .hero-highlights {
    flex-direction: column;
    gap: 0.5rem;
  }

  .highlight-divider {
    display: none;
  }

  .nav-links {
    display: none;
  }

  .nav-wrapper {
    padding-left: 5%;
  }

  .hero-buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .problem-split {
    flex-direction: column;
  }

  .problem-arrow {
    transform: rotate(90deg);
  }

  .solution-flow {
    flex-direction: column;
  }

  .flow-arrow {
    transform: rotate(90deg);
  }

  .users-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .cta-title {
    font-size: 1.8rem;
  }
}
</style>
