import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import api from '@/services/api';
import { Banner } from '@/types';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/components/ui/table';

interface Props {
    initialBanners?: Banner[];
}

const empty = {
    title: '',
    subtitle: '',
    link: '',
    sort_order: 0,
    is_active: true,
};

export default function AdminBanners({ initialBanners = [] }: Props) {
    const [banners, setBanners] = useState<Banner[]>(initialBanners);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<any>(empty);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await api.get('/banners');
            const data = res.data?.data?.data ?? res.data?.data ?? res.data;
            setBanners(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const openCreate = () => {
        setForm(empty);
        setImageFile(null);
        setEditId(null);
        setShowModal(true);
    };

    const openEdit = (b: Banner) => {
        setForm({
            title: b.title ?? '',
            subtitle: b.subtitle ?? '',
            link: b.link ?? '',
            sort_order: b.sort_order,
            is_active: Boolean(b.is_active),
        });
        setImageFile(null);
        setEditId(b.id);
        setShowModal(true);
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('subtitle', form.subtitle);
            formData.append('link', form.link);
            formData.append('sort_order', form.sort_order.toString());
            formData.append('is_active', form.is_active ? '1' : '0');

            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (editId) {
                formData.append('_method', 'PUT');
                await api.post(`/admin/banners/${editId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                if (!imageFile) {
                    alert('Gambar banner wajib diisi!');
                    return;
                }
                await api.post('/admin/banners', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setShowModal(false);
            fetchBanners();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menyimpan banner');
        }
    };

    const remove = async (id: number) => {
        if (!confirm('Hapus banner ini?')) return;
        try {
            await api.delete(`/admin/banners/${id}`);
            fetchBanners();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menghapus banner');
        }
    };

    return (
        <AdminLayout>
            <Head title="Kelola Banner" />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Banner Promo</h1>
                <button onClick={openCreate} className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">
                    + Tambah Banner
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Gambar</TableHead>
                            <TableHead>Judul / Subtitle</TableHead>
                            <TableHead>Link</TableHead>
                            <TableHead>Urutan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && banners.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center text-gray-500">Memuat data...</TableCell></TableRow>
                        ) : banners.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center text-gray-500">Belum ada banner.</TableCell></TableRow>
                        ) : (
                            banners.map(b => (
                                <TableRow key={b.id}>
                                    <TableCell>
                                        {b.image ? (
                                            <img src={b.image} alt={b.title || 'banner'} className="w-24 h-12 object-cover rounded-lg" />
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-gray-900">{b.title || '-'}</div>
                                        <div className="text-xs text-gray-500">{b.subtitle || '-'}</div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-blue-600 truncate max-w-xs">{b.link || '-'}</TableCell>
                                    <TableCell className="font-mono text-xs">{b.sort_order}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {b.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <button onClick={() => openEdit(b)} className="text-blue-600 hover:underline text-xs">Edit</button>
                                        <button onClick={() => remove(b.id)} className="text-red-600 hover:underline text-xs">Hapus</button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Banner' : 'Tambah Banner'}</h2>
                        <form onSubmit={save} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium mb-1">Judul Banner</label>
                                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg p-2 text-sm" placeholder="Opsional" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Sub Judul</label>
                                <input type="text" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="w-full border rounded-lg p-2 text-sm" placeholder="Opsional" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Link URL</label>
                                <input type="text" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} className="w-full border rounded-lg p-2 text-sm" placeholder="/products atau https://..." />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Gambar Banner</label>
                                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full border rounded-lg p-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Urutan Tampil</label>
                                <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full border rounded-lg p-2 text-sm" />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                                <label htmlFor="is_active" className="text-sm font-medium">Status Aktif</label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
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
