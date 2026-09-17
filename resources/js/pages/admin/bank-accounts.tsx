import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import api from '@/services/api';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/components/ui/table';

interface BankAccount {
    id: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    type: 'bank' | 'e_wallet';
    qr_code?: string | null;
    instructions?: string | null;
    is_active: boolean;
}

interface Props {
    initialAccounts?: BankAccount[];
}

const emptyForm = {
    bank_name: '',
    account_number: '',
    account_name: '',
    type: 'bank' as 'bank' | 'e_wallet',
    instructions: '',
    is_active: true,
};

export default function AdminBankAccounts({ initialAccounts = [] }: Props) {
    const [accounts, setAccounts] = useState<BankAccount[]>(initialAccounts);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [qrFile, setQrFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/bank-accounts');
            if (res.data?.data) {
                setAccounts(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const openCreate = () => {
        setForm(emptyForm);
        setQrFile(null);
        setEditId(null);
        setShowModal(true);
    };

    const openEdit = (acc: BankAccount) => {
        setForm({
            bank_name: acc.bank_name,
            account_number: acc.account_number,
            account_name: acc.account_name,
            type: acc.type,
            instructions: acc.instructions || '',
            is_active: Boolean(acc.is_active),
        });
        setQrFile(null);
        setEditId(acc.id);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('bank_name', form.bank_name);
            formData.append('account_number', form.account_number);
            formData.append('account_name', form.account_name);
            formData.append('type', form.type);
            formData.append('instructions', form.instructions || '');
            formData.append('is_active', form.is_active ? '1' : '0');
            if (qrFile) {
                formData.append('qr_code', qrFile);
            }

            if (editId) {
                formData.append('_method', 'PUT');
                await api.post(`/admin/bank-accounts/${editId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await api.post('/admin/bank-accounts', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            setShowModal(false);
            fetchAccounts();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menyimpan akun pembayaran.');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (id: number) => {
        try {
            await api.put(`/admin/bank-accounts/${id}/toggle-status`);
            fetchAccounts();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal mengubah status.');
        }
    };

    const remove = async (id: number) => {
        if (!confirm('Hapus akun pembayaran ini?')) return;
        try {
            await api.delete(`/admin/bank-accounts/${id}`);
            fetchAccounts();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menghapus akun pembayaran.');
        }
    };

    return (
        <AdminLayout>
            <Head title="Kelola Akun Bank & E-Wallet" />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black">Akun Bank & E-Wallet</h1>
                    <p className="text-sm text-gray-600">Kelola rekening bank dan akun e-wallet untuk pembayaran manual pelanggan.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="bg-main text-main-foreground font-black px-4 py-2 border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                >
                    + Tambah Akun
                </button>
            </div>

            <div className="bg-secondary-background border-4 border-border shadow-shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b-4 border-border bg-main/10">
                            <TableHead className="font-black text-foreground">Nama Bank / E-Wallet</TableHead>
                            <TableHead className="font-black text-foreground">Tipe</TableHead>
                            <TableHead className="font-black text-foreground">Nomor Rekening</TableHead>
                            <TableHead className="font-black text-foreground">Atas Nama</TableHead>
                            <TableHead className="font-black text-foreground">QR Code</TableHead>
                            <TableHead className="font-black text-foreground">Status</TableHead>
                            <TableHead className="font-black text-foreground text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && accounts.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-8 font-bold">Memuat data...</TableCell></TableRow>
                        ) : accounts.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-8 font-bold">Belum ada akun bank/e-wallet.</TableCell></TableRow>
                        ) : (
                            accounts.map(acc => (
                                <TableRow key={acc.id} className="border-b-2 border-border">
                                    <TableCell className="font-black">{acc.bank_name}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 text-xs font-black border-2 border-border ${acc.type === 'bank' ? 'bg-blue-200 text-blue-900' : 'bg-purple-200 text-purple-900'}`}>
                                            {acc.type === 'bank' ? 'Bank Transfer' : 'E-Wallet'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-mono font-bold">{acc.account_number}</TableCell>
                                    <TableCell className="font-bold">{acc.account_name}</TableCell>
                                    <TableCell>
                                        {acc.qr_code ? (
                                            <a href={`/${acc.qr_code}`} target="_blank" rel="noreferrer" className="text-xs font-bold underline text-main">
                                                Lihat QR
                                            </a>
                                        ) : (
                                            <span className="text-xs text-gray-400">Tidak ada</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => toggleStatus(acc.id)}
                                            className={`px-2.5 py-1 text-xs font-black border-2 border-border ${acc.is_active ? 'bg-green-300 text-green-900' : 'bg-red-300 text-red-900'}`}
                                        >
                                            {acc.is_active ? 'Aktif' : 'Nonaktif'}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <button
                                            onClick={() => openEdit(acc)}
                                            className="px-2.5 py-1 text-xs font-black bg-yellow-300 text-black border-2 border-border shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => remove(acc.id)}
                                            className="px-2.5 py-1 text-xs font-black bg-red-400 text-white border-2 border-border shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5"
                                        >
                                            Hapus
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-secondary-background border-4 border-border shadow-shadow w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b-2 border-border pb-3">
                            <h2 className="text-xl font-black">{editId ? 'Edit Akun Pembayaran' : 'Tambah Akun Pembayaran'}</h2>
                            <button onClick={() => setShowModal(false)} className="font-black text-lg">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase mb-1">Tipe Akun</label>
                                <select
                                    value={form.type}
                                    onChange={e => setForm({ ...form, type: e.target.value as any })}
                                    className="w-full border-2 border-border p-2 font-bold bg-background"
                                >
                                    <option value="bank">Bank Transfer (BCA, Mandiri, dll)</option>
                                    <option value="e_wallet">E-Wallet (GoPay, OVO, Dana, QRIS)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase mb-1">Nama Bank / E-Wallet</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: BCA / GoPay"
                                    value={form.bank_name}
                                    onChange={e => setForm({ ...form, bank_name: e.target.value })}
                                    className="w-full border-2 border-border p-2 font-bold bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase mb-1">Nomor Rekening / Nomor Akun</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: 1234567890"
                                    value={form.account_number}
                                    onChange={e => setForm({ ...form, account_number: e.target.value })}
                                    className="w-full border-2 border-border p-2 font-bold bg-background font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase mb-1">Atas Nama (Owner)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: PT Parfum Store Indonesia"
                                    value={form.account_name}
                                    onChange={e => setForm({ ...form, account_name: e.target.value })}
                                    className="w-full border-2 border-border p-2 font-bold bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase mb-1">Gambar QR Code (Opsional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setQrFile(e.target.files?.[0] || null)}
                                    className="w-full border-2 border-border p-2 text-xs font-bold bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase mb-1">Instruksi Pembayaran (Opsional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Instruksi khusus transfer..."
                                    value={form.instructions}
                                    onChange={e => setForm({ ...form, instructions: e.target.value })}
                                    className="w-full border-2 border-border p-2 font-bold bg-background text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={form.is_active}
                                    onChange={e => setForm({ ...form, is_active: e.target.checked })}
                                    className="w-4 h-4 border-2 border-border accent-main"
                                />
                                <label htmlFor="is_active" className="text-sm font-black">Aktifkan Akun Ini</label>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t-2 border-border">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border-2 border-border font-black bg-gray-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 border-2 border-border font-black bg-main text-main-foreground shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
                                >
                                    {submitting ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
