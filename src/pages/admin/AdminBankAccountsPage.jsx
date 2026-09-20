import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Landmark,
  AlertCircle
} from 'lucide-react';
import { getBanks, saveBankAccount, deleteBankAccount } from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function AdminBankAccountsPage() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [editingBank, setEditingBank] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('شيخة');
  const [accountNumber, setAccountNumber] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  async function load() {
    try {
      setLoading(true);
      const data = await getBanks();
      setBanks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleOpenAdd() {
    setEditingBank(null);
    setBankName('');
    setAccountName('شيخة');
    setAccountNumber('');
    setImageUrl('');
    setIsPublished(true);
    setDisplayOrder(banks.length + 1);
    setError('');
    setShowModal(true);
  }

  function handleOpenEdit(b) {
    setEditingBank(b);
    setBankName(b.bank_name || b.name || '');
    setAccountName(b.account_name || b.owner || '');
    setAccountNumber(b.account_number || b.account || '');
    setImageUrl(b.image_url || '');
    setIsPublished(b.is_published !== false);
    setDisplayOrder(b.display_order || 0);
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!bankName.trim()) return setError('اسم البنك مطلوب.');
    if (!accountNumber.trim()) return setError('رقم الحساب أو الآيبان مطلوب.');

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        bank_name: bankName.trim(),
        account_name: accountName.trim(),
        account_number: accountNumber.trim(),
        image_url: imageUrl.trim() || null,
        is_published: isPublished,
        display_order: Number(displayOrder) || 0
      };

      if (editingBank) {
        payload.id = editingBank.id;
      }

      await saveBankAccount(payload);
      await load();
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'فشل حفظ الحساب البنكي.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePublish(b) {
    try {
      await saveBankAccount({
        ...b,
        is_published: !b.is_published
      });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingId) return;
    try {
      await deleteBankAccount(deletingId);
      setBanks(prev => prev.filter(b => b.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="admin-banks-page">
      <div className="admin-page-header-row">
        <div>
          <h1>إدارة الحسابات البنكية</h1>
          <p>الحسابات المعتمدة المعروضة للمشتركات للتحويل في صفحة الاشتراك</p>
        </div>
        <div className="admin-page-header-actions">
          <button type="button" className="button small" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>إضافة حساب بنكي</span>
          </button>
        </div>
      </div>

      <section className="admin-panel">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="custom-spinner" />
            <p style={{ marginTop: '12px' }}>جاري تحميل الحسابات...</p>
          </div>
        ) : banks.length === 0 ? (
          <div className="empty-panel">
            <p>لا توجد حسابات بنكية مضافة بعد.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-custom-table">
              <thead>
                <tr>
                  <th>الترتيب</th>
                  <th>اسم البنك</th>
                  <th>صاحب الحساب</th>
                  <th>رقم الحساب</th>
                  <th>الحالة</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {banks.map(b => {
                  const isPub = b.is_published !== false;
                  return (
                    <tr key={b.id}>
                      <td>#{b.display_order || 0}</td>
                      <td>
                        <strong>{b.bank_name || b.name}</strong>
                      </td>
                      <td>{b.account_name || b.owner || '—'}</td>
                      <td>
                        <code dir="ltr" style={{ fontSize: '15px', fontWeight: 'bold' }}>
                          {b.account_number || b.account}
                        </code>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`status-toggle-btn ${isPub ? 'published' : 'draft'}`}
                          onClick={() => handleTogglePublish(b)}
                        >
                          {isPub ? <Eye size={14} /> : <EyeOff size={14} />}
                          <span>{isPub ? 'مفعل' : 'معطل'}</span>
                        </button>
                      </td>
                      <td>
                        <div className="table-actions-cell">
                          <button
                            type="button"
                            className="icon-btn"
                            title="تعديل"
                            onClick={() => handleOpenEdit(b)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            title="حذف"
                            onClick={() => setDeletingId(b.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingBank ? 'تعديل الحساب البنكي' : 'إضافة حساب بنكي جديد'}
        maxWidth="500px"
      >
        <form onSubmit={handleSubmit} className="admin-modal-form">
          {error && (
            <div className="form-status error" style={{ marginBottom: '14px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="admin-form-grid">
            <label className="span-2">
              <span>اسم البنك أو المصرف *</span>
              <input
                required
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                placeholder="مثال: شركة العمقي وإخوانه"
              />
            </label>

            <label className="span-2">
              <span>اسم المستفيد / صاحب الحساب</span>
              <input
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                placeholder="شيخة"
              />
            </label>

            <label className="span-2">
              <span>رقم الحساب أو الآيبان *</span>
              <input
                required
                dir="ltr"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                placeholder="254092562"
              />
            </label>

            <label>
              <span>ترتيب العرض</span>
              <input
                type="number"
                value={displayOrder}
                onChange={e => setDisplayOrder(e.target.value)}
              />
            </label>

            <label className="span-2">
              <span>رابط شعار البنك (اختياري)</span>
              <input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://... أو /bank-logo.png"
              />
            </label>

            <div className="admin-checkbox-row span-2">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                />
                <span>تفعيل وظهور الحساب في صفحة الاشتراك</span>
              </label>
            </div>
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              className="button outline small"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              إلغاء
            </button>
            <button type="submit" className="button small" disabled={submitting}>
              {submitting ? 'جاري الحفظ...' : editingBank ? 'حفظ التعديلات' : 'إضافة الحساب'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="حذف الحساب البنكي"
        message="هل أنت متأكدة من حذف هذا الحساب البنكي نهائياً؟"
      />
    </div>
  );
}
