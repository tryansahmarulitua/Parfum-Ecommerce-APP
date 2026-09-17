import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import api from '@/services/api';
import { Brand } from '@/types';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/components/ui/table';

interface Props {
    initialBrands?: Brand[];
}

const empty = { name: '', slug: '', description: '', is_active: true };

export default function AdminBrands({ initialBrands = [] }: Props) {
    const [brands, setBrands] = useState<Brand[]>(initialBrands);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState(empty);
    const [search, setSearch] = useState('');

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const res = await api.get('/brands', { params: { per_page: 100 } });
            const data = res.data?.data?.data ?? res.data?.data ?? res.data;
            setBrands(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const openCreate = () => {
        setForm(empty);
        setEditId(null);
        setShowModal(true);
    };

    const openEdit = (brand: Brand) => {
        setForm({
            name: brand.name,
            slug: brand.slug,
            description: brand.description ?? '',
            is_active: Boolean(brand.is_active),
        });
        setEditId(brand.id);
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
                await api.put(`/admin/brands/${editId}`, form);
            } else {
                await api.post('/admin/brands', form);
            }
            setShowModal(false);
            fetchBrands();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menyimpan brand');
        }
    };

    const remove = async (id: number) => {
        if (!confirm('Hapus brand ini?')) return;
        try {
            await api.delete(`/admin/brands/${id}`);
            fetchBrands();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menghapus brand');
        }
    };

    const filteredBrands = brands.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.slug.toLowerCase().includes(search.toLowerCase()) ||
        (b.description && b.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <AdminLayout>
            <Head title="Kelola Brand" />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Brand Produk</h1>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari brand..."
                        className="border rounded-lg px-3 py-2 text-sm w-64"
                    />
                    <button
                        onClick={openCreate}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 shrink-0"
                    >
                        + Tambah Brand
                    </button>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Logo</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Deskripsi</TableHead>
                            <TableHead>Jumlah Produk</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && brands.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-gray-500">
                                    Memuat data...
                                </TableCell>
                            </TableRow>
                        ) : filteredBrands.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-gray-500">
                                    Belum ada brand.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBrands.map(b => (
                                <TableRow key={b.id}>
                                    <TableCell className="font-mono text-xs">{b.id}</TableCell>
                                    <TableCell>
                                        {b.logo ? (
                                            <img
                                                src={b.logo}
                                                alt={b.name}
                                                className="w-10 h-10 object-contain rounded"
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900">{b.name}</TableCell>
                                    <TableCell className="text-gray-500 font-mono text-xs">{b.slug}</TableCell>
                                    <TableCell className="text-gray-600 max-w-xs truncate">
                                        {b.description || '-'}
                                    </TableCell>
                                    <TableCell>{b.products_count ?? 0}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                b.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {b.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <button
                                            onClick={() => openEdit(b)}
                                            className="text-blue-600 hover:underline text-xs"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => remove(b.id)}
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
                            {editId ? 'Edit Brand' : 'Tambah Brand'}
                        </h2>
                        <form onSubmit={save} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium mb-1">Nama Brand</label>
                                <input
                                    required
                                    type="text"
                                    value={form.name}
                                    onChange={e => handleNameChange(e.target.value)}
                                    className="w-full border rounded-lg p-2 text-sm"
                                    placeholder="Contoh: Dior, Chanel, Gucci..."
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