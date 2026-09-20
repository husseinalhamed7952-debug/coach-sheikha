import React, { useState, useEffect } from 'react';
import { getSiteContent, saveSiteContent } from '../../services/api';
import { Check, AlertCircle, Save } from 'lucide-react';

export default function AdminContentPage() {
  const [content, setContent] = useState(null);
  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  // Hero Fields
  const [heroEyebrow, setHeroEyebrow] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroDesc, setHeroDesc] = useState('');
  const [heroBtnPrimary, setHeroBtnPrimary] = useState('');
  const [heroBtnSecondary, setHeroBtnSecondary] = useState('');
  const [heroImage, setHeroImage] = useState('');

  // Stats Fields
  const [statsItems, setStatsItems] = useState([]);

  // Package Comparison Fields
  const [compTitle, setCompTitle] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compCard1Title, setCompCard1Title] = useState('');
  const [compCard1Desc, setCompCard1Desc] = useState('');
  const [compCard1Features, setCompCard1Features] = useState('');
  const [compCard2Title, setCompCard2Title] = useState('');
  const [compCard2Desc, setCompCard2Desc] = useState('');
  const [compCard2Features, setCompCard2Features] = useState('');

  // About Fields
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutP1, setAboutP1] = useState('');
  const [aboutP2, setAboutP2] = useState('');

  // Journey Steps
  const [journeyTitle, setJourneyTitle] = useState('');
  const [journeySteps, setJourneySteps] = useState([]);

  // CTA Fields
  const [ctaTitle, setCtaTitle] = useState('');
  const [ctaDesc, setCtaDesc] = useState('');
  const [ctaBtn, setCtaBtn] = useState('');

  // Testimonials Section Header Fields
  const [testiTitle, setTestiTitle] = useState('');
  const [testiDesc, setTestiDesc] = useState('');

  // Footer Fields
  const [footerAbout, setFooterAbout] = useState('');
  const [footerContact, setFooterContact] = useState('');

  async function load() {
    try {
      setLoading(true);
      const data = await getSiteContent();
      setContent(data);

      // Hero
      setHeroEyebrow(data?.hero?.eyebrow || '');
      setHeroTitle(data?.hero?.title || '');
      setHeroDesc(data?.hero?.description || '');
      setHeroBtnPrimary(data?.hero?.primary_button_text || '');
      setHeroBtnSecondary(data?.hero?.secondary_button_text || '');
      setHeroImage(data?.hero?.image_url || '');

      // Stats
      const defaultStats = [
        { value: '4', label: 'برامج غذائية متنوعة' },
        { value: '+100', label: 'مشتركة حققت أهدافها' },
        { value: '+7', label: 'سنوات الخبرة والمتابعة' }
      ];
      setStatsItems(
        data?.stats?.items && data.stats.items.length === 3
          ? data.stats.items
          : defaultStats
      );

      // Package Comparison
      const comp = data?.package_comparison || {};
      setCompTitle(comp.title || 'الفرق بين الباقات');
      setCompDesc(comp.description || 'نوضح لكِ الفرق بين برامج المتابعة لاختيار الباقة التي تلبي احتياجاتك وأهدافك بدقة');
      setCompCard1Title(comp.card1?.title || 'باقات المتابعة العامة / الشهرية');
      setCompCard1Desc(comp.card1?.description || 'مناسبة لمن ترغب بخطة غذائية واضحة وقوائم متنوعة مع متابعة دورية');
      setCompCard1Features(Array.isArray(comp.card1?.features) ? comp.card1.features.join('\n') : '');
      setCompCard2Title(comp.card2?.title || 'باقات المتابعة المخصصة والمكثفة (VIP)');
      setCompCard2Desc(comp.card2?.description || 'مناسبة لمن تحتاج دعماً مستمراً وتعديلات فورية وتواصلاً يومياً ومباشراً');
      setCompCard2Features(Array.isArray(comp.card2?.features) ? comp.card2.features.join('\n') : '');

      // About
      setAboutTitle(data?.about?.title || '');
      setAboutP1(data?.about?.paragraph_1 || '');
      setAboutP2(data?.about?.paragraph_2 || '');

      // Journey
      setJourneyTitle(data?.journey?.title || '');
      setJourneySteps(data?.journey?.steps || []);

      // CTA
      setCtaTitle(data?.cta?.title || '');
      setCtaDesc(data?.cta?.description || '');
      setCtaBtn(data?.cta?.button_text || '');

      // Testimonials Header
      setTestiTitle(data?.testimonials?.title || 'قصص نجاح وتجارب مشتركاتنا');
      setTestiDesc(data?.testimonials?.description || 'قصص حقيقية وتجارب ملهمة لمشتركات حققن أهدافهن الصحية والبدنية مع كوتش شيخة.');

      // Footer
      setFooterAbout(data?.footer?.about_text || 'منصة كوتش شيخة للياقة والتغذية الصحية، نساعدك على تحقيق أهدافك بأسلوب حياة صحي ومستدام.');
      setFooterContact(data?.footer?.contact_prompt || 'تواصلوا معنا عبر الواتساب للاستفسارات والاشتراكات');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSaveHero(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ text: '', type: '' });
    try {
      await saveSiteContent('hero', {
        eyebrow: heroEyebrow,
        title: heroTitle,
        description: heroDesc,
        primary_button_text: heroBtnPrimary,
        secondary_button_text: heroBtnSecondary,
        image_url: heroImage
      });
      setStatusMsg({ text: 'تم حفظ محتوى قسم البداية بنجاح!', type: 'success' });
    } catch (err) {
      setStatusMsg({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveStats(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ text: '', type: '' });
    try {
      await saveSiteContent('stats', { items: statsItems });
      setStatusMsg({ text: 'تم حفظ شريط الإحصائيات بنجاح!', type: 'success' });
    } catch (err) {
      setStatusMsg({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePackageComparison(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ text: '', type: '' });
    try {
      const card1FeaturesList = compCard1Features.split('\n').map(s => s.trim()).filter(Boolean);
      const card2FeaturesList = compCard2Features.split('\n').map(s => s.trim()).filter(Boolean);

      await saveSiteContent('package_comparison', {
        title: compTitle.trim(),
        description: compDesc.trim(),
        card1: {
          title: compCard1Title.trim(),
          description: compCard1Desc.trim(),
          features: card1FeaturesList
        },
        card2: {
          title: compCard2Title.trim(),
          description: compCard2Desc.trim(),
          features: card2FeaturesList
        }
      });
      setStatusMsg({ text: 'تم حفظ قسم الفرق بين الباقات بنجاح!', type: 'success' });
    } catch (err) {
      setStatusMsg({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAbout(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ text: '', type: '' });
    try {
      await saveSiteContent('about', {
        title: aboutTitle,
        paragraph_1: aboutP1,
        paragraph_2: aboutP2
      });
      setStatusMsg({ text: 'تم حفظ محتوى عن الكوتش بنجاح!', type: 'success' });
    } catch (err) {
      setStatusMsg({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveJourney(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ text: '', type: '' });
    try {
      await saveSiteContent('journey', {
        title: journeyTitle,
        steps: journeySteps
      });
      setStatusMsg({ text: 'تم حفظ خطوات البدء بنجاح!', type: 'success' });
    } catch (err) {
      setStatusMsg({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveCta(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ text: '', type: '' });
    try {
      await saveSiteContent('cta', {
        title: ctaTitle,
        description: ctaDesc,
        button_text: ctaBtn
      });
      setStatusMsg({ text: 'تم حفظ قسم الدعوة للاشتراك بنجاح!', type: 'success' });
    } catch (err) {
      setStatusMsg({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveTestimonials(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ text: '', type: '' });
    try {
      await saveSiteContent('testimonials', {
        title: testiTitle,
        description: testiDesc
      });
      setStatusMsg({ text: 'تم حفظ عناوين قسم الآراء والتجارب بنجاح!', type: 'success' });
    } catch (err) {
      setStatusMsg({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveFooter(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ text: '', type: '' });
    try {
      await saveSiteContent('footer', {
        about_text: footerAbout,
        contact_prompt: footerContact
      });
      setStatusMsg({ text: 'تم حفظ نصوص الفوتر بنجاح!', type: 'success' });
    } catch (err) {
      setStatusMsg({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-content-page">
      <div className="admin-page-header-row">
        <div>
          <h1>إدارة محتوى الموقع</h1>
          <p>تعديل النصوص والعناوين والصور في أقسام الصفحة الرئيسية مباشرة</p>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`form-status ${statusMsg.type}`} style={{ marginBottom: '20px' }}>
          {statusMsg.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Tabs Row */}
      <div className="admin-tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          قسم البداية (Hero)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          الإحصائيات (Stats)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          عن الكوتش (About)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'journey' ? 'active' : ''}`}
          onClick={() => setActiveTab('journey')}
        >
          خطوات البدء (Journey)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'cta' ? 'active' : ''}`}
          onClick={() => setActiveTab('cta')}
        >
          دعوة الاشتراك (CTA)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'testimonials' ? 'active' : ''}`}
          onClick={() => setActiveTab('testimonials')}
        >
          قسم الآراء (Testimonials)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'package_comparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('package_comparison')}
        >
          الفرق بين الباقات (Comparison)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'footer' ? 'active' : ''}`}
          onClick={() => setActiveTab('footer')}
        >
          تذييل الصفحة (Footer)
        </button>
      </div>

      <section className="admin-panel" style={{ marginTop: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="custom-spinner" />
            <p>جاري تحميل المحتوى...</p>
          </div>
        ) : (
          <>
            {/* HERO TAB */}
            {activeTab === 'hero' && (
              <form onSubmit={handleSaveHero} className="admin-modal-form">
                <div className="admin-form-grid">
                  <label>
                    <span>الشارة الترحيبية (Eyebrow)</span>
                    <input
                      value={heroEyebrow}
                      onChange={e => setHeroEyebrow(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>العنوان الرئيسي الكبير (Title)</span>
                    <input
                      value={heroTitle}
                      onChange={e => setHeroTitle(e.target.value)}
                    />
                  </label>
                  <label className="span-2">
                    <span>الوصف الترحيبي</span>
                    <textarea
                      rows="3"
                      value={heroDesc}
                      onChange={e => setHeroDesc(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>نص الزر الرئيسي</span>
                    <input
                      value={heroBtnPrimary}
                      onChange={e => setHeroBtnPrimary(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>نص الزر الثانوي</span>
                    <input
                      value={heroBtnSecondary}
                      onChange={e => setHeroBtnSecondary(e.target.value)}
                    />
                  </label>
                  <label className="span-2">
                    <span>رابط صورة الكوتش في الـ Hero</span>
                    <input
                      value={heroImage}
                      onChange={e => setHeroImage(e.target.value)}
                    />
                  </label>
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="button small" disabled={saving}>
                    <Save size={16} />
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ قسم البداية'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* STATS TAB */}
            {activeTab === 'stats' && (
              <form onSubmit={handleSaveStats} className="admin-modal-form">
                <div className="stats-editor-list">
                  {statsItems.map((item, idx) => (
                    <div key={idx} className="stat-editor-row">
                      <label>
                        <span>الرقم أو النسبة</span>
                        <input
                          value={item.value}
                          onChange={e => {
                            const copy = [...statsItems];
                            copy[idx] = { ...copy[idx], value: e.target.value };
                            setStatsItems(copy);
                          }}
                        />
                      </label>
                      <label style={{ flex: 2 }}>
                        <span>النص التوضيحي</span>
                        <input
                          value={item.label}
                          onChange={e => {
                            const copy = [...statsItems];
                            copy[idx] = { ...copy[idx], label: e.target.value };
                            setStatsItems(copy);
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="button small" disabled={saving}>
                    <Save size={16} />
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ الإحصائيات'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* ABOUT TAB */}
            {activeTab === 'about' && (
              <form onSubmit={handleSaveAbout} className="admin-modal-form">
                <div className="admin-form-grid">
                  <label className="span-2">
                    <span>عنوان قسم عن الكوتش</span>
                    <input
                      value={aboutTitle}
                      onChange={e => setAboutTitle(e.target.value)}
                    />
                  </label>
                  <label className="span-2">
                    <span>الفقرة الأولى (بداية الرحلة والقصة)</span>
                    <textarea
                      rows="3"
                      value={aboutP1}
                      onChange={e => setAboutP1(e.target.value)}
                    />
                  </label>
                  <label className="span-2">
                    <span>الفقرة الثانية (التوازن والرسالة)</span>
                    <textarea
                      rows="3"
                      value={aboutP2}
                      onChange={e => setAboutP2(e.target.value)}
                    />
                  </label>
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="button small" disabled={saving}>
                    <Save size={16} />
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ قصة الكوتش'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* JOURNEY TAB */}
            {activeTab === 'journey' && (
              <form onSubmit={handleSaveJourney} className="admin-modal-form">
                <div className="admin-form-grid">
                  <label className="span-2">
                    <span>عنوان القسم</span>
                    <input
                      value={journeyTitle}
                      onChange={e => setJourneyTitle(e.target.value)}
                    />
                  </label>
                </div>
                <div className="steps-editor-list" style={{ marginTop: '16px' }}>
                  {journeySteps.map((s, idx) => (
                    <div key={idx} className="step-editor-box">
                      <strong>الخطوة {s.number}</strong>
                      <label>
                        <span>عنوان الخطوة</span>
                        <input
                          value={s.title}
                          onChange={e => {
                            const copy = [...journeySteps];
                            copy[idx].title = e.target.value;
                            setJourneySteps(copy);
                          }}
                        />
                      </label>
                      <label>
                        <span>شرح الخطوة</span>
                        <input
                          value={s.description}
                          onChange={e => {
                            const copy = [...journeySteps];
                            copy[idx].description = e.target.value;
                            setJourneySteps(copy);
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="button small" disabled={saving}>
                    <Save size={16} />
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ خطوات الرحلة'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* CTA TAB */}
            {activeTab === 'cta' && (
              <form onSubmit={handleSaveCta} className="admin-modal-form">
                <div className="admin-form-grid">
                  <label className="span-2">
                    <span>عنوان الدعوة للاشتراك</span>
                    <input
                      value={ctaTitle}
                      onChange={e => setCtaTitle(e.target.value)}
                    />
                  </label>
                  <label className="span-2">
                    <span>نص الشرح المحفز</span>
                    <textarea
                      rows="3"
                      value={ctaDesc}
                      onChange={e => setCtaDesc(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>نص الزر</span>
                    <input
                      value={ctaBtn}
                      onChange={e => setCtaBtn(e.target.value)}
                    />
                  </label>
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="button small" disabled={saving}>
                    <Save size={16} />
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ قسم الدعوة'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TESTIMONIALS TAB */}
            {activeTab === 'testimonials' && (
              <form onSubmit={handleSaveTestimonials} className="admin-modal-form">
                <div className="admin-form-grid">
                  <label className="span-2">
                    <span>عنوان قسم الآراء والتجارب</span>
                    <input
                      value={testiTitle}
                      onChange={e => setTestiTitle(e.target.value)}
                    />
                  </label>
                  <label className="span-2">
                    <span>الوصف التوضيحي للقسم</span>
                    <textarea
                      rows="3"
                      value={testiDesc}
                      onChange={e => setTestiDesc(e.target.value)}
                    />
                  </label>
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="button small" disabled={saving}>
                    <Save size={16} />
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ عناوين قسم الآراء'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* PACKAGE COMPARISON TAB */}
            {activeTab === 'package_comparison' && (
              <form onSubmit={handleSavePackageComparison} className="admin-modal-form">
                <div className="admin-form-grid">
                  <label className="span-2">
                    <span>عنوان قسم المقارنة</span>
                    <input
                      value={compTitle}
                      onChange={e => setCompTitle(e.target.value)}
                      placeholder="الفرق بين الباقات"
                    />
                  </label>
                  <label className="span-2">
                    <span>وصف القسم</span>
                    <textarea
                      rows="2"
                      value={compDesc}
                      onChange={e => setCompDesc(e.target.value)}
                      placeholder="نوضح لكِ الفرق بين برامج المتابعة..."
                    />
                  </label>

                  {/* Card 1 */}
                  <div className="span-2" style={{ border: '1px solid #decabb', borderRadius: '10px', padding: '16px', background: '#fdfaf8' }}>
                    <h3 style={{ margin: '0 0 12px', color: '#633200', fontSize: '16px' }}>الكارد الأول (مثال: الباقات العامة)</h3>
                    <div className="admin-form-grid">
                      <label className="span-2">
                        <span>عنوان الكارد الأول</span>
                        <input
                          value={compCard1Title}
                          onChange={e => setCompCard1Title(e.target.value)}
                        />
                      </label>
                      <label className="span-2">
                        <span>وصف الكارد الأول</span>
                        <input
                          value={compCard1Desc}
                          onChange={e => setCompCard1Desc(e.target.value)}
                        />
                      </label>
                      <label className="span-2">
                        <span>مميزات الكارد الأول (اكتبي كل ميزة في سطر منفصل)</span>
                        <textarea
                          rows="4"
                          value={compCard1Features}
                          onChange={e => setCompCard1Features(e.target.value)}
                          placeholder="خطة غذائية متكاملة&#10;خيارات وبدائل متنوعة&#10;متابعة أسبوعية"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="span-2" style={{ border: '1px solid #decabb', borderRadius: '10px', padding: '16px', background: '#fdfaf8' }}>
                    <h3 style={{ margin: '0 0 12px', color: '#633200', fontSize: '16px' }}>الكارد الثاني (مثال: الباقات المخصصة VIP)</h3>
                    <div className="admin-form-grid">
                      <label className="span-2">
                        <span>عنوان الكارد الثاني</span>
                        <input
                          value={compCard2Title}
                          onChange={e => setCompCard2Title(e.target.value)}
                        />
                      </label>
                      <label className="span-2">
                        <span>وصف الكارد الثاني</span>
                        <input
                          value={compCard2Desc}
                          onChange={e => setCompCard2Desc(e.target.value)}
                        />
                      </label>
                      <label className="span-2">
                        <span>مميزات الكارد الثاني (اكتبي كل ميزة في سطر منفصل)</span>
                        <textarea
                          rows="4"
                          value={compCard2Features}
                          onChange={e => setCompCard2Features(e.target.value)}
                          placeholder="خطة غذائية مفصلة 100%&#10;تعديل دوري مستمر&#10;متابعة يومية دقيقة&#10;تواصل واستشارات مباشرة"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="admin-form-actions" style={{ marginTop: '20px' }}>
                  <button type="submit" className="button small" disabled={saving}>
                    <Save size={16} />
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ مقارنة الباقات'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* FOOTER TAB */}
            {activeTab === 'footer' && (
              <form onSubmit={handleSaveFooter} className="admin-modal-form">
                <div className="admin-form-grid">
                  <label className="span-2">
                    <span>نبذة الفوتر (About Text)</span>
                    <textarea
                      rows="3"
                      value={footerAbout}
                      onChange={e => setFooterAbout(e.target.value)}
                    />
                  </label>
                  <label className="span-2">
                    <span>عبارة التواصل الموجهة للواتساب (Contact Prompt)</span>
                    <input
                      value={footerContact}
                      onChange={e => setFooterContact(e.target.value)}
                    />
                  </label>
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="button small" disabled={saving}>
                    <Save size={16} />
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ نصوص الفوتر'}</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </section>
    </div>
  );
}
