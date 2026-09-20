import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Award } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import Slider from '../../components/common/Slider';
import {
  getSiteContent,
  getCertificates,
  getTestimonials,
  getPackages,
  getSubscriptions,
  getSiteSettings
} from '../../services/api';

function AnimatedCounter({ end, suffix = '', duration = 1200 }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const target = Number(end) || 0;
    if (target === 0) {
      setCount(0);
      return;
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setCount(target);
      return;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          let startTime = null;

          const step = timestamp => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Smooth easeOutCubic
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(ease * target));

            if (progress < 1) {
              animFrameRef.current = requestAnimationFrame(step);
            } else {
              setCount(target);
            }
          };

          animFrameRef.current = requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [end, duration]);

  return (
    <strong ref={elementRef}>
      {count}{suffix}
    </strong>
  );
}

function AnimatedStat({ rawValue, duration = 1200 }) {
  const str = String(rawValue ?? '').trim();
  const match = str.match(/^([^\d]*)(\d+)([^\d]*)$/);
  if (!match) {
    return <strong>{str}</strong>;
  }
  const prefix = match[1];
  const num = parseInt(match[2], 10);
  const suffix = match[3];

  return (
    <strong>
      {prefix}
      <AnimatedCounter key={num} end={num} duration={duration} />
      {suffix}
    </strong>
  );
}

export default function HomePage() {
  const location = useLocation();
  const [content, setContent] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  // Dynamic Statistics
  const [packagesCount, setPackagesCount] = useState(0);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [experienceYears, setExperienceYears] = useState(7);

  async function loadData() {
    try {
      const [siteContent, certs, tests, packs, subs, siteSettings] = await Promise.all([
        getSiteContent(),
        getCertificates(),
        getTestimonials(),
        getPackages(),
        getSubscriptions(),
        getSiteSettings()
      ]);

      if (siteContent) setContent(siteContent);
      if (certs) setCertificates((certs || []).filter(c => c.is_published !== false));
      if (tests) setTestimonials((tests || []).filter(t => t.is_published !== false));

      // 1. Published Packages Count
      const publishedPackages = (packs || []).filter(p => p.is_published !== false);
      setPackagesCount(publishedPackages.length);

      // 2. Actual Subscriptions Count
      const actualSubs = subs || [];
      setSubscribersCount(actualSubs.length);

      // 3. Experience Years from Site Settings
      const exp = Number(siteSettings?.experience_years) || 7;
      setExperienceYears(exp);
    } catch (err) {
      console.error('Error loading homepage data:', err);
    }
  }

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash, location.pathname]);

  useEffect(() => {
    loadData();

    // Auto-update when returning to tab or navigating back
    function handleSync() {
      loadData();
    }
    window.addEventListener('focus', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const hero = content?.hero || {
    eyebrow: 'أهلًا بكِ مع كوتش شيخة',
    title: 'صحتك تبدأ بخطة تناسبك',
    description: 'أساعدك على تحقيق أهدافك الصحية من خلال خطط غذائية مخصصة ومتابعة مستمرة تراعي احتياجاتك ونمط حياتك، لتصلي إلى نتائج مستدامة بخطوات بسيطة وفعّالة.',
    primary_button_text: 'تعرّفي علي أكثر',
    secondary_button_text: 'اكتشفي الباقات',
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85'
  };

  const about = content?.about || {
    title: 'عن الكوتش',
    paragraph_1: 'بدأت رحلتي الصحية عام 2018 بوزن 68 كجم، وخلال سنة ونصف فقدت 28 كجم، حتى وصلت إلى نحافة شديدة جعلتني أدرك أن النحافة لا تعني دائماً الصحة.',
    paragraph_2: 'بعدها بدأت رحلة جديدة لاستعادة توازني وبناء جسمي بطريقة صحية، وتمكنت من تحقيق نتائج أفضل بنظرة محبة ومتزنة، لأن التوازن ورؤية الذات أهم من أي رقم على الميزان.'
  };

  const journeySteps = content?.journey?.steps || [
    { number: '1', title: 'اختاري الباقة المناسبة', description: 'تصفحي الباقات واختاري الباقة التي تناسبك وأهدافك.' },
    { number: '2', title: 'املئي بيانات الاشتراك', description: 'أدخلي بياناتك الشخصية وأرفقي سند الدفع.' },
    { number: '3', title: 'أرسلي سند الدفع', description: 'قومي بتحويل قيمة الباقة وإرسال السند لتأكيد الاشتراك.' }
  ];

  const cta = content?.cta || {
    title: 'ابدئي رحلتك اليوم',
    description: 'نحو حياة صحية أكثر توازنًا وسعادة',
    button_text: 'اشتركي الآن'
  };

  return (
    <PublicLayout>
      {/* 1. Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">{hero.eyebrow}</span>
          <h1>{hero.title}</h1>
          <p>{hero.description}</p>
          <div className="actions">
            <Link className="button" to="/subscription">
              {hero.primary_button_text || 'تعرّفي علي أكثر'}
            </Link>
            <Link className="button outline" to="/packages">
              {hero.secondary_button_text || 'اكتشفي الباقات'}
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <img src={hero.image_url} alt="كوتش شيخة" />
        </div>
      </section>

      {/* 2. Statistics Section (100% Dynamic from site_content stats) */}
      <section className="stats">
        {(content?.stats?.items || [
          { value: '4', label: 'برامج غذائية متنوعة' },
          { value: '+100', label: 'مشتركة حققت أهدافها' },
          { value: '+7', label: 'سنوات الخبرة والمتابعة' }
        ]).slice(0, 3).map((item, idx) => (
          <div key={idx}>
            <AnimatedStat rawValue={item.value} />
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      {/* 3. About Section */}
      <section id="about" className="about section">
        <div className="about-art">🥗</div>
        <div className="about-content">
          <h2>{about.title}</h2>
          <p>{about.paragraph_1}</p>
          <p>{about.paragraph_2}</p>
        </div>
      </section>

      {/* 4. Certificates Section with Slider */}
      <section className="certificates section">
        <h2>الشهادات والاعتمادات المعتمدة</h2>
        <Slider
          items={
            certificates.length > 0
              ? certificates
              : [
                  {
                    id: 'cert-1',
                    title: 'Mezan Academy',
                    description: 'Certificate of Completion - تدريب وتغذية رياضية',
                    image_url: '/لوقو شيخه.jpeg'
                  },
                  {
                    id: 'cert-2',
                    title: 'إدراك',
                    description: 'Level Completion Certificate - تصميم خطة إنقاص وزن شخصية',
                    image_url: '/لوقو شيخه.jpeg'
                  }
                ]
          }
          desktopItems={2}
          tabletItems={2}
          mobileItems={1}
          renderItem={(c) => (
            <article className="certificate-card" key={c.id}>
              <div className="certificate-img-wrapper">
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.title}
                    loading="lazy"
                    className="certificate-actual-image"
                  />
                ) : (
                  <div className="certificate-fallback-icon">
                    <Award size={48} />
                  </div>
                )}
              </div>
              <div className="certificate-meta">
                <b>{c.title}</b>
                {c.description && <small>{c.description}</small>}
              </div>
            </article>
          )}
        />
      </section>

      {/* 5. How to Start Journey */}
      <section className="section centered">
        <h2>{content?.journey?.title || 'كيف تبدئين رحلتك مع كوتش شيخة ؟'}</h2>
        <div className="steps">
          {journeySteps.map(step => (
            <article key={step.number}>
              <i>{step.number}</i>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 6. Success Stories / Testimonials with Slider */}
      <section className="testimonials section centered">
        <h2>قصص نجاح ملهمة</h2>
        <Slider
          items={
            testimonials.length > 0
              ? testimonials
              : [
                  {
                    id: 'test-1',
                    name: 'نورا محمد',
                    content: 'كوتش رسمنا ما شاء الله، اللهم بارك مقاسي تغير من L إلى M',
                    tag: 'مشتركة نشيطة',
                    rating: '★★★★★'
                  },
                  {
                    id: 'test-2',
                    name: 'بنت شيفاء',
                    content: 'والحمدلله اليوم صار 105.5 لي سنتين ثابتة على الوزن',
                    tag: 'مشتركة نشيطة',
                    rating: '★★★★★'
                  },
                  {
                    id: 'test-3',
                    name: 'شيماء علي',
                    content: 'نزلت 12 كيلو معاك بالكوتش كان حلم بالنسبة لي واليوم أعيش حلمي',
                    tag: 'مشتركة نشيطة',
                    rating: '★★★★★'
                  }
                ]
          }
          desktopItems={3}
          tabletItems={2}
          mobileItems={1}
          renderItem={(t) => (
            <article className="testimonial-card" key={t.id}>
              <p>{t.content}</p>
              <hr />
              <b>{t.name}</b>
              <small>مشتركة نشيطة</small>
              <span>★★★★★</span>
            </article>
          )}
        />
      </section>

      {/* 7. CTA Section */}
      <section className="cta">
        <div>
          <h2>{cta.title}</h2>
          <p>{cta.description}</p>
          <Link className="button" to="/subscription">
            {cta.button_text || 'اشتركي الآن'}
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
