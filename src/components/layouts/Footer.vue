<template>
  <footer class="footer">
    <div class="footer-inner container">
      <div class="footer-brand">
        <span class="footer-logo headline-md">서울메이트</span>
        <p class="footer-copy body-md">
          © 2026 서울메이트. All rights reserved.<br />
          공공데이터(서울 권역) 기반 지역 정보 공유 커뮤니티
        </p>
      </div>

      <nav class="footer-nav">
        <a href="#" class="footer-link label-sm">이용약관</a>
        <a href="#" class="footer-link label-sm">개인정보처리방침</a>
        <a href="#" class="footer-link label-sm">고객센터</a>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--color-surface-container-low);
  border-top: 1px solid var(--color-outline-variant);
}

.footer-inner {
  padding-top: var(--stack-lg);
  padding-bottom: var(--stack-lg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: var(--stack-md);
}

@media (min-width: 768px) {
  .footer-inner {
    flex-direction: row;
  }
}

.footer-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

@media (min-width: 768px) {
  .footer-brand {
    align-items: flex-start;
  }
}

.footer-logo {
  font-weight: 700;
}

.footer-copy {
  color: var(--color-secondary);
  text-align: center;
  max-width: 28rem;
}

@media (min-width: 768px) {
  .footer-copy {
    text-align: left;
  }
}

.footer-nav {
  display: flex;
  gap: 24px;
}

.footer-link {
  color: var(--color-secondary);
  transition: color 0.15s ease;
}

.footer-link:hover {
  color: var(--color-primary);
}
</style>
