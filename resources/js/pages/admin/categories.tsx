import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import api from '@/services/api';
import { Category } from '@/types';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/components/ui/table';

interface Props {
    initialCategories?: Category[];
}

const empty = { name: '', slug: '', description: '', is_active: true };

export default function AdminCategories({ initialCategories = [] }: Props) {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState(empty);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/categories', { params: { per_page: 100 } });
            const data = res.data?.data?.data ?? res.data?.data ?? res.data;
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openCreate = () => {
        setForm(empty);
        setEditId(null);
        setShowModal(true);
    };

    const openEdit = (cat: Category) => {
        setForm({
            name: cat.name,
            slug: cat.slug,
            description: cat.description ?? '',
            is_active: Boolean(cat.is_active),
        });
        setEditId(cat.id);
        setShowModal(true);
    };

    const handleNameChange = (val: string) => {
        const slugified = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        setForm(prev => ({
            ...prev,
            name: val,
            slug: editId ? prev.slug : slugified,
        }));
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/admin/categories/${editId}`, form);
            } else {
                await api.post('/admin/categories', form);
            }
            setShowModal(false);
            fetchCategories();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menyimpan kategori');
        }
    };

    const remove = async (id: number) => {
        if (!confirm('Hapus kategori ini?')) return;
        try {
            await api.delete(`/admin/categories/${id}`);
            fetchCategories();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menghapus kategori');
        }
    };

    return (
        <AdminLayout>
            <Head title="Kelola Kategori" />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Kategori Produk</h1>
                <button
                    onClick={openCreate}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
                >
                    + Tambah Kategori
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Deskripsi</TableHead>
                            <TableHead>Jumlah Produk</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-500">
                                    Memuat data...
                                </TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-500">
                                    Belum ada kategori.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map(c => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-mono text-xs">{c.id}</TableCell>
                                    <TableCell className="font-medium text-gray-900">{c.name}</TableCell>
                                    <TableCell className="text-gray-500 font-mono text-xs">{c.slug}</TableCell>
                                    <TableCell className="text-gray-600 max-w-xs truncate">
                                        {c.description || '-'}
                                    </TableCell>
                                    <TableCell>{c.products_count ?? 0}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                c.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {c.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <button
                                            onClick={() => openEdit(c)}
                                            className="text-blue-600 hover:underline text-xs"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => remove(c.id)}
                                            className="text-red-600 hover:underline text-xs"
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
                        <h2 className="text-xl font-bold">
                            {editId ? 'Edit Kategori' : 'Tambah Kategori'}
                        </h2>
                        <form onSubmit={save} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium mb-1">Nama Kategori</label>
                                <input
                                    required
                                    type="text"
                                    value={form.name}
                                    onChange={e => handleNameChange(e.target.value)}
                                    className="w-full border rounded-lg p-2 text-sm"
                                    placeholder="Contoh: EDP, EDT, Unisex..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Slug</label>
                                <input
                                    required
                                    type="text"
                                    value={form.slug}
                                    onChange={e => setForm({ ...form, slug: e.target.value })}
                                    className="w-full border rounded-lg p-2 text-sm bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Deskripsi</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full border rounded-lg p-2 text-sm"
                                    placeholder="Keterangan singkat..."
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={form.is_active}
                                    onChange={e => setForm({ ...form, is_active: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium">
                                    Status Aktif
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
