import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Upload,
  Copy,
  Check,
  Landmark,
  AlertCircle,
  FileCheck,
  Lock,
  Clock
} from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import SuccessModal from '../../components/public/SuccessModal';
import { getPackages, getBanks, getSiteSettings, createSubscription, isRegistrationCurrentlyOpen, isPackageCurrentlyAvailable, getPackageStatusInfo } from '../../services/api';
import { generateWhatsAppSubscriptionMessage, buildWhatsAppUrl } from '../../utils/whatsapp';
import { formatFileSize } from '../../utils/formatters';

export default function SubscriptionPage() {
  const [params] = useSearchParams();
  const packageParam = params.get('package');

  const [packages, setPackages] = useState([]);
  const [banks, setBanks] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [chosenPackageId, setChosenPackageId] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const [copiedBankId, setCopiedBankId] = useState(null);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [registeredCustomerName, setRegisteredCustomerName] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch published packages
    getPackages().then(res => {
      const published = (res || []).filter(p => p.is_published !== false);
      setPackages(published);

      if (packageParam) {
        // match by slug or id
        const match = published.find(
          p => p.slug === packageParam || String(p.id) === String(packageParam)
        );
        if (match && isPackageCurrentlyAvailable(match)) {
          setChosenPackageId(match.id);
        } else {
          // If match is closed or not found, select first available
          const firstAvailable = published.find(p => isPackageCurrentlyAvailable(p)) || published[0];
          setChosenPackageId(firstAvailable?.id || '');
        }
      } else if (published.length > 0) {
        // default select first available package
        const firstAvailable = published.find(p => isPackageCurrentlyAvailable(p)) || published[0];
        setChosenPackageId(firstAvailable?.id || '');
      }
    });

    // Fetch published bank accounts
    getBanks().then(res => {
      const published = (res || []).filter(b => b.is_published !== false);
      setBanks(published);
    });

    // Fetch settings for dynamic registration status & coach phone number
    setLoadingSettings(true);
    getSiteSettings()
      .then(setSettings)
      .finally(() => setLoadingSettings(false));
  }, [packageParam]);

  const selectedPackage = packages.find(p => p.id === chosenPackageId) || null;
  const isSelectedPackageClosed = selectedPackage && !isPackageCurrentlyAvailable(selectedPackage);

  // Validate File (Type and Size up to 10MB)
  function handleFileChange(e) {
    const selectedFile = e.target.files?.[0];
    setFileError('');
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError('عذراً، نوع الملف غير مدعوم. المسموح: JPG, PNG, PDF فقط.');
      setFile(null);
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (selectedFile.size > maxSize) {
      setFileError('حجم الملف كبير جداً. الحد الأقصى المسموح به هو 10 ميجابايت.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  }

  function handleCopyAccount(bankId, accountNumber) {
    navigator.clipboard.writeText(accountNumber);
    setCopiedBankId(bankId);
    setTimeout(() => {
      setCopiedBankId(null);
    }, 2500);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!isRegistrationOpen) {
      return setFormError('التسجيل مغلق حالياً، يرجى المحاولة لاحقاً.');
    }

    if (!chosenPackageId || !selectedPackage) {
      return setFormError('يرجى اختيار باقة للاشتراك.');
    }

    if (isSelectedPackageClosed) {
      return setFormError('هذه الباقة مغلقة حالياً ولا يمكن استقبال طلبات جديدة عليها.');
    }

    if (!file) {
      return setFormError('يرجى إرفاق صورة أو ملف سند التحويل البنكي.');
    }

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('full_name')?.toString().trim();
    const phone = formData.get('phone')?.toString().trim();
    const age = parseInt(formData.get('age')?.toString() || '0', 10);
    const notes = formData.get('notes')?.toString().trim() || '';

    // Validation
    if (!fullName) return setFormError('يرجى كتابة الاسم الكامل.');
    if (!phone) return setFormError('يرجى إدخال رقم الجوال.');
    if (!age || age < 12 || age > 100) return setFormError('يرجى إدخال عمر صحيح بين 12 و 100 عام.');

    setLoading(true);

    try {
      await createSubscription(
        { full_name: fullName, age, phone, notes },
        file,
        selectedPackage
      );

      // Prepare WhatsApp message
      const coachWhatsapp = settings?.whatsapp || '967770870321';
      const msg = generateWhatsAppSubscriptionMessage({
        fullName,
        age,
        phone,
        packageName: selectedPackage.name,
        packagePrice: selectedPackage.price,
        durationValue: selectedPackage.duration_value,
        durationUnit: selectedPackage.duration_unit,
        notes
      });

      const waLink = buildWhatsAppUrl(coachWhatsapp, msg);

      setRegisteredCustomerName(fullName);
      setWhatsappUrl(waLink);
      setShowSuccessModal(true);

      // Try opening WhatsApp automatically after a brief pause
      setTimeout(() => {
        try {
          window.open(waLink, '_blank');
        } catch {
          // If browser popup blocker intercepts, the user has the clear button in the modal!
        }
      }, 800);
    } catch (err) {
      setFormError(err.message || 'حدث خطأ أثناء إرسال طلب الاشتراك. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }

  const isRegistrationOpen = isRegistrationCurrentlyOpen(settings);
  const registrationStatusText = isRegistrationOpen
    ? 'التسجيل متاح حاليًا لجميع الباقات التدريبية'
    : 'التسجيل مغلق حاليًا، يرجى المحاولة لاحقًا.';

  return (
    <PublicLayout>
      <section className="signup-title">
        <span className="eyebrow">خطوة واحدة تفصلك عن التغيير</span>
        <h1>ابدئي رحلتك الصحية</h1>
        <p>أكملي بياناتك للتسجيل في برامج كوتش شيخة والبدء بخطتك المخصصة فوراً.</p>
      </section>

      {loadingSettings ? (
        <section className="section centered" style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="custom-spinner" />
          <p style={{ marginTop: '16px', color: '#666' }}>جاري التحقق من حالة التسجيل...</p>
        </section>
      ) : !isRegistrationOpen ? (
        <section className="section centered">
          <div
            className="registration-closed-box"
            style={{
              maxWidth: '650px',
              margin: '30px auto 60px',
              padding: '40px 25px',
              background: '#fff5f5',
              border: '2px solid #e53e3e',
              borderRadius: '16px',
              color: '#c53030',
              boxShadow: '0 4px 15px rgba(229, 62, 62, 0.12)',
              textAlign: 'center'
            }}
          >
            <Lock size={48} style={{ color: '#e53e3e', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '24px', margin: '0 0 12px', color: '#9b2c2c' }}>
              التسجيل مغلق حالياً
            </h2>
            <p style={{ fontSize: '18px', fontWeight: '600', lineHeight: '1.7', margin: 0, color: '#c53030' }}>
              {registrationStatusText}
            </p>
          </div>
        </section>
      ) : (
        <form className="subscription reference-subscription section" onSubmit={handleSubmit}>
          {/* Personal Details */}
          <h2>المعلومات الشخصية</h2>
          <div className="fields ref-fields">
            <label>
              الاسم الكامل <span className="req">*</span>
              <input
                name="full_name"
                required
                placeholder="مثال: سارة محمد"
                disabled={loading}
              />
            </label>
            <label>
              رقم الجوال (WhatsApp) <span className="req">*</span>
              <input
                name="phone"
                type="tel"
                required
                inputMode="tel"
                placeholder="05xxxxxxxx أو +966..."
                disabled={loading}
              />
            </label>
            <label>
              العمر <span className="req">*</span>
              <input
                type="number"
                name="age"
                required
                min="12"
                max="100"
                placeholder="25"
                disabled={loading}
              />
            </label>
          </div>

          {/* Package Selector */}
          <h2>الباقة المختارة</h2>
          <div className="package-pick">
            {packages.map(p => {
              const statusInfo = getPackageStatusInfo(p);
              const isClosed = !statusInfo.isAvailable;
              const isChosen = chosenPackageId === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  className={`package-pick-btn ${isChosen ? 'chosen' : ''} ${isClosed ? 'closed-pick' : ''}`}
                  onClick={() => {
                    if (!isClosed) setChosenPackageId(p.id);
                  }}
                  disabled={loading || isClosed}
                  title={statusInfo.text}
                >
                  <b>{p.name.replace('باقة ', '')}</b>
                  <span className="pick-price">{p.price} ر.س</span>
                  {p.duration_value && (
                    <small className="pick-duration">
                      <Clock size={12} /> {p.duration_value} {p.duration_unit || 'يوم'}
                    </small>
                  )}
                  {isClosed && <span className="pick-closed-label">{statusInfo.text}</span>}
                </button>
              );
            })}
          </div>

          {isSelectedPackageClosed && (
            <div className="closed-package-warning">
              <Lock size={18} />
              <span>
                تنبيه: باقة ({selectedPackage.name}) غير متوفرة حالياً. يرجى اختيار باقة أخرى متوفرة.
              </span>
            </div>
          )}

          {/* Bank Accounts Section */}
          <h2>بيانات الحسابات البنكية للتحويل</h2>
          <div className="bank-list">
            {banks.map(b => {
              const isCopied = copiedBankId === b.id;
              return (
                <article key={b.id} className="bank-card">
                  <Landmark className="bank-icon" size={24} />
                  <div className="bank-info">
                    <b>{b.bank_name}</b>
                    {b.account_name && (
                      <small className="bank-owner">صاحب الحساب: {b.account_name}</small>
                    )}
                    <span>رقم الحساب</span>
                    <strong dir="ltr">{b.account_number}</strong>
                  </div>
                  <button
                    type="button"
                    className={`copy-btn ${isCopied ? 'copied' : ''}`}
                    aria-label="نسخ رقم الحساب"
                    onClick={() => handleCopyAccount(b.id, b.account_number)}
                    title="نسخ رقم الحساب"
                  >
                    {isCopied ? <Check size={18} /> : <Copy size={18} />}
                    <span className="copy-tooltip">{isCopied ? 'تم النسخ!' : 'نسخ'}</span>
                  </button>
                </article>
              );
            })}
          </div>

          <p className="notice">
            يرجى إتمام عملية التحويل البنكي أولاً لحساب الكوتش، ثم إرفاق صورة الإيصال أو سند التحويل أدناه لتأكيد حجزك ومطابقة الحوالة.
          </p>

          {/* Payment Receipt Upload */}
          <h2>رفع سند الإيداع <span className="req">*</span></h2>
          <label className={`upload ${file ? 'has-file' : ''} ${fileError ? 'has-error' : ''}`}>
            {file ? <FileCheck size={36} color="#48863f" /> : <Upload size={36} />}
            <b>{file ? file.name : 'اضغطي لاختيار صورة السند أو اسحبي الملف هنا'}</b>
            <small>
              {file
                ? `الحجم: ${formatFileSize(file.size)} | جاهز للرفع`
                : 'صيغ مدعومة: JPG, PNG, PDF (الحد الأقصى 10 ميجابايت)'}
            </small>
            <input
              type="file"
              required
              accept="image/png,image/jpeg,image/jpg,application/pdf"
              onChange={handleFileChange}
              disabled={loading}
            />
          </label>
          {fileError && <p className="file-error-msg"><AlertCircle size={16} /> {fileError}</p>}

          {/* Additional Notes */}
          <h2>ملاحظات إضافية (اختياري)</h2>
          <label>
            <textarea
              name="notes"
              rows="3"
              placeholder="اكتبي أي معلومات إضافية أو وقت مفضل للتواصل ترغبين أن تعرفها الكوتش مسبقاً..."
              disabled={loading}
            />
          </label>

          {formError && (
            <div className="form-status error">
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          <button
            className="button submit"
            type="submit"
            disabled={loading || isSelectedPackageClosed}
          >
            {loading ? 'جاري رفع السند وتسجيل الطلب...' : 'تأكيد وإرسال الطلب'}
          </button>

          <p className="privacy">جميع بياناتك وسنداتك محفوظة بسرية وأمان تام تحت إشراف الكوتش مباشرة.</p>
        </form>
      )}

      {/* Success Modal with WhatsApp Action */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        whatsappUrl={whatsappUrl}
        customerName={registeredCustomerName}
      />
    </PublicLayout>
  );
}
