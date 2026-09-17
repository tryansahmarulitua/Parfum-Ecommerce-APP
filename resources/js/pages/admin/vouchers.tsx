import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import api from '@/services/api';
import { Voucher } from '@/types';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/components/ui/table';

interface Props {
    initialVouchers?: Voucher[];
}

const empty = {
    code: '',
    name: '',
    type: 'percentage',
    value: '',
    min_purchase: '',
    max_discount: '',
    quota: '',
    start_at: '',
    end_at: '',
    is_active: true,
};

const fmt = (x: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(x);

export default function AdminVouchers({ initialVouchers = [] }: Props) {
    const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<any>(empty);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/vouchers', { params: { per_page: 100 } });
            const data = res.data?.data?.data ?? res.data?.data ?? res.data;
            setVouchers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // If no initial vouchers, fetch them. 
        // We also fetch to ensure we have the latest data if navigating client-side.
        fetchVouchers();
    }, []);

    const openCreate = () => {
        setForm(empty);
        setEditId(null);
        setShowModal(true);
    };

    const openEdit = (v: Voucher) => {
        setForm({
            code: v.code,
            name: v.name,
            type: v.type,
            value: v.value,
            min_purchase: v.min_purchase ?? '',
            max_discount: v.max_discount ?? '',
            quota: v.quota ?? '',
            start_at: v.start_at.slice(0, 16),
            end_at: v.end_at.slice(0, 16),
            is_active: Boolean(v.is_active),
        });
        setEditId(v.id);
        setShowModal(true);
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Format dates for backend if they are datetime-local strings
            const data = { ...form };
            if (data.start_at.includes('T')) data.start_at = data.start_at.replace('T', ' ') + ':00';
            if (data.end_at.includes('T')) data.end_at = data.end_at.replace('T', ' ') + ':00';

            if (editId) {
                await api.put(`/admin/vouchers/${editId}`, data);
            } else {
                await api.post('/admin/vouchers', data);
            }
            setShowModal(false);
            fetchVouchers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menyimpan voucher');
        }
    };

    const remove = async (id: number) => {
        if (!confirm('Hapus voucher ini?')) return;
        try {
            await api.delete(`/admin/vouchers/${id}`);
            fetchVouchers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menghapus voucher');
        }
    };

    return (
        <AdminLayout>
            <Head title="Kelola Voucher" />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Voucher</h1>
                <button onClick={openCreate} className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">
                    + Tambah Voucher
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kode</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Diskon</TableHead>
                            <TableHead>Kuota / Terpakai</TableHead>
                            <TableHead>Masa Berlaku</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && vouchers.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center text-gray-500">Memuat data...</TableCell></TableRow>
                        ) : vouchers.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center text-gray-500">Belum ada voucher.</TableCell></TableRow>
                        ) : (
                            vouchers.map(v => (
                                <TableRow key={v.id}>
                                    <TableCell className="font-mono font-bold text-gray-900">{v.code}</TableCell>
                                    <TableCell>{v.name}</TableCell>
                                    <TableCell>
                                        {v.type === 'percentage' ? `${v.value}%` : fmt(v.value)}
                                    </TableCell>
                                    <TableCell>
                                        {v.quota ? `${v.used_count} / ${v.quota}` : `${v.used_count} (Tanpa Batas)`}
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-600">
                                        {new Date(v.start_at).toLocaleDateString('id-ID')} - <br/>
                                        {new Date(v.end_at).toLocaleDateString('id-ID')}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${v.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {v.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <button onClick={() => openEdit(v)} className="text-blue-600 hover:underline text-xs">Edit</button>
                                        <button onClick={() => remove(v.id)} className="text-red-600 hover:underline text-xs">Hapus</button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Voucher' : 'Tambah Voucher'}</h2>
                        <form onSubmit={save} className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-medium mb-1">Nama Voucher</label>
                                <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Kode (Unik)</label>
                                <input required type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full border rounded-lg p-2 text-sm uppercase" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Tipe Diskon</label>
                                <select required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full border rounded-lg p-2 text-sm">
                                    <option value="percentage">Persentase (%)</option>
                                    <option value="fixed">Nominal Tetap (Rp)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Nilai Diskon</label>
                                <input required type="number" min="0" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Min. Pembelian</label>
                                <input type="number" min="0" value={form.min_purchase} onChange={e => setForm({ ...form, min_purchase: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Maks. Diskon (Opsional)</label>
                                <input type="number" min="0" value={form.max_discount} onChange={e => setForm({ ...form, max_discount: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Kuota (Kosongkan jika unlimit)</label>
                                <input type="number" min="0" value={form.quota} onChange={e => setForm({ ...form, quota: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Mulai Berlaku</label>
                                <input required type="datetime-local" value={form.start_at} onChange={e => setForm({ ...form, start_at: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Berakhir Pada</label>
                                <input required type="datetime-local" value={form.end_at} onChange={e => setForm({ ...form, end_at: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
                            </div>
                            <div className="col-span-2 flex items-center gap-2 mt-2">
                                <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                                <label htmlFor="is_active" className="text-sm font-medium">Voucher Aktif</label>
                            </div>

                            <div className="col-span-2 flex justify-end gap-2 pt-4 border-t mt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg text-sm">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
