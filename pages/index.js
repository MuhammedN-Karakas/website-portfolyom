import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

/* ─── TYPEWRITER HOOK ─── */
function useTypewriter(words, speed = 80, pause = 1800) {
  const [text, setText] = useState('');
  const [wIdx, setWIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wIdx];
    let timeout = speed;
    if (deleting) timeout = speed / 2;
    if (!deleting && charIdx === current.length) { timeout = pause; setDeleting(true); return; }
    if (deleting && charIdx === 0) { setDeleting(false); setWIdx((w) => (w + 1) % words.length); return; }
    const t = setTimeout(() => {
      setText(current.slice(0, charIdx + (deleting ? -1 : 1)));
      setCharIdx((c) => c + (deleting ? -1 : 1));
    }, timeout);
    return () => clearTimeout(t);
  }, [charIdx, deleting, wIdx, words, speed, pause]);

  return text;
}

/* ─── STAR CANVAS ─── */
function SpaceCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let W, H;
    let stars = [], meteors = [];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function mkStar() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.2,
        a: Math.random(),
        speed: Math.random() * 0.003 + 0.001,
        phase: Math.random() * Math.PI * 2,
      };
    }
    function mkMeteor() {
      return {
        x: Math.random() * W * 1.5,
        y: -20,
        len: Math.random() * 120 + 60,
        speed: Math.random() * 8 + 5,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        alpha: 0,
        life: 0,
      };
    }

    for (let i = 0; i < 220; i++) stars.push(mkStar());
    let t = 0;

    function loop() {
      ctx.clearRect(0, 0, W, H);

      // draw stars
      for (const s of stars) {
        const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,255,${alpha * 0.9})`;
        ctx.fill();
      }

      // draw meteors
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life++;
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        if (m.life < 10) m.alpha = m.life / 10;
        else if (m.life > 50) m.alpha = Math.max(0, 1 - (m.life - 50) / 20);
        if (m.alpha <= 0) { meteors.splice(i, 1); continue; }
        const tail = { x: m.x - Math.cos(m.angle) * m.len, y: m.y - Math.sin(m.angle) * m.len };
        const grad = ctx.createLinearGradient(tail.x, tail.y, m.x, m.y);
        grad.addColorStop(0, `rgba(79,195,247,0)`);
        grad.addColorStop(1, `rgba(79,195,247,${m.alpha * 0.9})`);
        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.lineTo(m.x, m.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // nebula glow blobs (static, drawn once is fine via tiny alpha)
      ctx.beginPath();
      const ng = ctx.createRadialGradient(W * 0.8, H * 0.2, 0, W * 0.8, H * 0.2, 300);
      ng.addColorStop(0, 'rgba(79,195,247,0.04)');
      ng.addColorStop(1, 'rgba(79,195,247,0)');
      ctx.fillStyle = ng;
      ctx.fillRect(0, 0, W, H);

      ctx.beginPath();
      const ng2 = ctx.createRadialGradient(W * 0.1, H * 0.7, 0, W * 0.1, H * 0.7, 250);
      ng2.addColorStop(0, 'rgba(124,131,255,0.05)');
      ng2.addColorStop(1, 'rgba(124,131,255,0)');
      ctx.fillStyle = ng2;
      ctx.fillRect(0, 0, W, H);

      t += 0.016;
      animId = requestAnimationFrame(loop);
    }

    loop();
    const meteorInterval = setInterval(() => {
      if (meteors.length < 3 && Math.random() < 0.4) meteors.push(mkMeteor());
    }, 2500);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(meteorInterval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} id="space-canvas" />;
}

/* ─── SCROLL REVEAL HOOK ─── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .timeline-item');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─── DATA ─── */
const LEARN_GOALS = [
  { icon: '🛡️', cat: 'Siber Güvenlik', items: ['Sızma Testi (Pentesting)', 'Ağ Güvenliği & Protokolleri', 'Kriptografi Temelleri', 'Web Uygulama Güvenliği'] },
  { icon: '💻', cat: 'Yazılım Geliştirme', items: ['C# ile İleri Nesne Yönelimli Programlama', 'Python ile Otomasyon & Scripting', 'REST API Geliştirme', 'Veritabanı Tasarımı & SQL'] },
  { icon: '☁️', cat: 'Bulut & Modern Altyapı', items: ['Bulut Güvenliği (AWS/Azure Temelleri)', 'DevSecOps Kavramları', 'SIEM & SOC Araçları', 'Güvenlik Otomasyonu'] },
];
const EDU = [
  {
    date: '2025 — Devam Ediyor',
    school: 'Üniversite (Önlisans)',
    dept: 'Bilgisayar Programcılığı',
    badge: 'Aktif',
  },
  {
    date: '2024 — Devam Ediyor',
    school: 'Üniversite (Önlisans)',
    dept: 'Tıbbi Sekreterlik ve Büro Hizmetleri',
    badge: 'Aktif',
  },
  {
    date: '2020 — 2024',
    school: 'Anadolu Lisesi',
    dept: 'Lise Diploması',
    badge: 'Mezun',
  },
];
const CAREER_GOALS = [
  { icon: '🛡️', title: 'Siber Güvenlik Uzmanlığı', desc: 'Sızma testleri, ağ güvenliği ve dijital adli bilişim alanında lisanslı bir uzman olmak.' },
  { icon: '🎓', title: 'DGS ile Lisans', desc: 'Dikey Geçiş Sınavı (DGS) ile lisans programına geçerek akademik yolculuğu taçlandırmak.' },
  { icon: '💼', title: 'Bilişim Sektörü', desc: 'Teknik bilgi ve idari yetkinliği birleştirerek BT & siber güvenlik sektöründe kariyer inşa etmek.' },
];

/* ─── MAIN COMPONENT ─── */
export default function Home() {
  const typed = useTypewriter([
    'Siber Güvenlik Tutkunu',
    'C# Geliştiricisi',
    'Bilgisayar Programcısı',
    'Geleceğin BT Uzmanı',
  ]);
  useReveal();

  return (
    <>
      <Head>
        <title>Muhammed Necip Karakaş | Portfolio</title>
        <meta name="description" content="Siber güvenlik ve yazılım geliştirme alanında uzmanlaşmakta olan Muhammed Necip Karakaş'ın kişisel portfolyo sitesi." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>" />
      </Head>

      <SpaceCanvas />

      {/* ── NAV ── */}
      <nav>
        <a href="#hero" className="nav-logo">MNK<span>.dev</span></a>
        <ul className="nav-links">
          {[['01', 'Hakkımda', '#about'], ['02', 'Hedefler', '#goals'], ['03', 'Eğitim', '#education'], ['04', 'İletişim', '#contact']].map(([n, label, href]) => (
            <li key={n}>
              <a href={href}><span className="num">{n}.</span>{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <main>
        {/* ── HERO ── */}
        <section id="hero" style={{ position: 'relative' }}>
          <p className="hero-greeting">↗ Merhaba, ben</p>
          <h1 className="hero-name">
            Muhammed Necip<br />
            <span className="last">Karakaş</span>
          </h1>
          <div className="hero-typewriter">
            {typed}<span className="cursor" />
          </div>
          <p className="hero-desc">
            Siber güvenlik & yazılım geliştirme yolculuğumda ilerleyen, teknolojiyi sevgiyle harmanlayan bir bilgisayar programcısıyım.
          </p>
          <div className="hero-cta">
            <a href="#about" className="btn-primary">Keşfet →</a>
            <a href="#goals" className="btn-secondary">Hedeflerim</a>
          </div>
          <div className="scroll-indicator">
            <div className="scroll-dot" />
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section id="about">
          <div className="section-label reveal">
            <span className="section-num">01</span>
            <h2 className="section-title">Hakkımda</h2>
            <span className="section-line" />
          </div>
          <div className="about-grid">
            <div className="about-text reveal">
              <p>
                Ben <strong>Muhammed Necip Karakaş</strong>; Bilgisayar Programcılığı ve Tıbbi Sekreterlik bölümlerinde eş zamanlı eğitimime devam eden, teknik ve idari yetkinlikleri bir arada geliştiren bir teknoloji tutkunu.
              </p>
              <p>
                <strong>C#</strong> diline olan hakimiyetimi sürekli artırırken siber güvenlik sahasında derinleşmek en büyük önceliğim. Yazılım geliştirmeyi salt bir meslek olarak değil, <strong>severek yaptığım bir hobi</strong> olarak görüyorum.
              </p>
              <p>
                Siber güvenlik dünyasına duyduğum derin ilgi, dijital sistemlerin nasıl korunduğunu ve savunma mekanizmalarının nasıl inşa edildiğini öğrenme merakımdan besleniyor. Hedefim, bu alandaki sarsılmaz motivasyonumu akademik eğitimimle birleştirerek bilişim sektöründe değer katan donanımlı bir profesyonel olmak.
              </p>
            </div>
            <div className="about-stats">
              {[
                { num: '2', label: 'Aktif Önlisans Programı' },
                { num: '100%', label: 'Siber Güvenlik İlgisi' },
              ].map((s, i) => (
                <div className="stat-card reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GOALS (unified) ── */}
        <section id="goals">
          <div className="section-label reveal">
            <span className="section-num">02</span>
            <h2 className="section-title">Hedefler</h2>
            <span className="section-line" />
          </div>

          {/* Kariyer hedefleri */}
          <div className="goals-grid" style={{ marginBottom: 56 }}>
            {CAREER_GOALS.map((g, i) => (
              <div className="goal-card reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
                <span className="goal-icon">{g.icon}</span>
                <div className="goal-title">{g.title}</div>
                <div className="goal-desc">{g.desc}</div>
              </div>
            ))}
          </div>

          {/* Öğrenmek istediklerim */}
          <div className="section-label reveal" style={{ marginBottom: 32 }}>
            <span className="section-num" style={{ fontSize: '0.65rem' }}>→</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Öğrenmek İstediklerim</h3>
            <span className="section-line" />
          </div>
          <p className="reveal" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '32px', lineHeight: 1.8 }}>
            Henüz yolculuğumun başındayım. Bu alanlarda kendimi geliştirerek siber güvenlik dünyasında donanımlı bir profesyonel olmayı hedefliyorum.
          </p>
          <div className="goals-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {LEARN_GOALS.map((g, i) => (
              <div className="goal-card reveal" key={i} style={{ transitionDelay: `${i * 0.08}s` }}>
                <span className="goal-icon">{g.icon}</span>
                <div className="goal-title" style={{ marginBottom: 14 }}>{g.cat}</div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {g.items.map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--accent)', fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', marginTop: 2, flexShrink: 0 }}>→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── EDUCATION ── */}
        <section id="education" style={{ paddingTop: 60 }}>
          <div className="section-label reveal">
            <span className="section-num">03</span>
            <h2 className="section-title">Eğitim</h2>
            <span className="section-line" />
          </div>
          <div className="timeline">
            {EDU.map((e, i) => (
              <div className="timeline-item" key={i} style={{ transitionDelay: `${i * 0.15}s` }}>
                <div className="timeline-dot" />
                <div className="timeline-date">{e.date}</div>
                <div className="timeline-school">{e.school}</div>
                <div className="timeline-dept">{e.dept}</div>
                <span className="timeline-badge">{e.badge}</span>
              </div>
            ))}
          </div>
        </section>


        {/* ── CONTACT ── */}
        <section id="contact" style={{ paddingTop: 60 }}>
          <div className="section-label reveal">
            <span className="section-num">04</span>
            <h2 className="section-title">İletişim</h2>
            <span className="section-line" />
          </div>
          <p className="reveal" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '40px', lineHeight: 1.8 }}>
            Siber güvenlik projeleri, kariyer fırsatları veya sadece teknoloji üzerine sohbet etmek için benimle iletişim kurabilirsiniz.
          </p>
          <div className="goals-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <a href="https://www.linkedin.com/in/muhammed-karakaş-bba25b3b0?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div className="goal-card reveal" style={{ transitionDelay: '0.1s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <span className="goal-icon" style={{ fontSize: '2rem' }}>💼</span>
                <div className="goal-title">LinkedIn</div>
                <div className="goal-desc">Profesyonel ağım ve kariyer güncellemelerim</div>
              </div>
            </a>
            <a href="https://github.com/MuhammedN-Karakas" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div className="goal-card reveal" style={{ transitionDelay: '0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <span className="goal-icon" style={{ fontSize: '2rem' }}>💻</span>
                <div className="goal-title">GitHub</div>
                <div className="goal-desc">Açık kaynak projelerim ve kod denemelerim</div>
              </div>
            </a>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-inner">
          <div>
            <div className="footer-brand">MNK.dev</div>
            <div className="footer-tagline">Siber güvenlik & yazılım · 2026</div>
          </div>
          <div className="footer-nav">
            <div className="footer-nav-col">
              <h4>Navigasyon</h4>
              {[['01', 'Hakkımda', '#about'], ['02', 'Hedefler', '#goals'], ['03', 'Eğitim', '#education'], ['04', 'İletişim', '#contact']].map(([n, label, href]) => (
                <a href={href} key={n}>
                  <span className="footer-link-num">{n}</span>{label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 Muhammed Necip Karakaş · Tüm hakları saklıdır.</div>
          <div className="footer-social">
            <a href="https://github.com/MuhammedN-Karakas" target="_blank" rel="noopener noreferrer" title="GitHub">GH</a>
            <a href="https://www.linkedin.com/in/muhammed-karakaş-bba25b3b0?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank" rel="noopener noreferrer" title="LinkedIn">LI</a>
          </div>
        </div>
      </footer>
    </>
  );
}
