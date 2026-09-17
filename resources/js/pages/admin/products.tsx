import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import api from '@/services/api';
import { Product, Category, Brand } from '@/types';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/components/ui/table';

const fmt = (x: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(x);

const empty = { name: '', slug: '', brand_id: '', category_id: '', gender: 'unisex', price: '', stock: '', description: '', notes_top: '', notes_middle: '', notes_base: '' };

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState<any>(empty);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<any[]>([]);

    const fetchData = () => {
        api.get('/products', { params: { per_page: 100 } }).then(r => setProducts(r.data.data?.data ?? r.data.data));
        api.get('/categories').then(r => setCategories(r.data.data?.data ?? r.data.data));
        api.get('/brands').then(r => setBrands(r.data.data?.data ?? r.data.data));
    };
    useEffect(() => { fetchData(); }, []);

    const openCreate = () => { setForm(empty); setEditId(null); setThumbnailFile(null); setImageFiles([]); setExistingImages([]); setShowModal(true); };
    const openEdit = (p: any) => {
        setForm({
            name: p.name,
            slug: p.slug,
            brand_id: p.brand_id,
            category_id: p.category_id,
            gender: p.gender,
            price: p.price,
            stock: p.stock,
            description: p.description ?? '',
            notes_top: p.top_notes ?? p.notes?.top ?? '',
            notes_middle: p.middle_notes ?? p.notes?.middle ?? '',
            notes_base: p.base_notes ?? p.notes?.base ?? ''
        });
        setThumbnailFile(null);
        setImageFiles([]);
        setExistingImages(p.images ?? []);
        setEditId(p.id);
        setShowModal(true);
    };

    const removeExistingImage = async (imageId: number) => {
        try {
            await api.delete(`/admin/products/images/${imageId}`);
            setExistingImages(prev => prev.filter(img => img.id !== imageId));
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menghapus gambar');
        }
    };

    const handleNameChange = (val: string) => {
        const slugified = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        setForm((prev: any) => ({
            ...prev,
            name: val,
            slug: editId ? prev.slug : slugified,
        }));
    };

    const save = async () => {
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('slug', form.slug);
            formData.append('brand_id', String(Number(form.brand_id)));
            formData.append('category_id', String(Number(form.category_id)));
            formData.append('gender', form.gender);
            formData.append('price', String(Number(form.price) || 0));
            formData.append('stock', String(Number(form.stock) || 0));
            formData.append('description', form.description ?? '');
            formData.append('notes_top', form.notes_top ?? '');
            formData.append('notes_middle', form.notes_middle ?? '');
            formData.append('notes_base', form.notes_base ?? '');

            if (thumbnailFile) {
                if (thumbnailFile.size > 10 * 1024 * 1024) {
                    alert('Gambar thumbnail maksimal 10MB!');
                    return;
                }
                formData.append('thumbnail', thumbnailFile);
            }

            imageFiles.forEach(f => {
                if (f.size > 10 * 1024 * 1024) {
                    alert(`Gambar "${f.name}" melebihi 10MB!`);
                    return;
                }
                formData.append('images[]', f);
            });

            if (editId) {
                formData.append('_method', 'PUT');
                await api.post(`/admin/products/${editId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/admin/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setShowModal(false); fetchData();
        } catch (err: any) {
            const errors = err.response?.data?.errors;
            if (errors) {
                const msgs = Object.values(errors).flat().join('\n');
                alert(msgs);
            } else {
                alert(err.response?.data?.message || 'Gagal menyimpan produk');
            }
        }
    };

    const remove = async (id: number) => {
        if (!confirm('Delete this product?')) return;
        try {
            await api.delete(`/admin/products/${id}`); fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menghapus produk');
        }
    };

    const filteredProducts = products.filter(p => {
        const q = search.toLowerCase();
        return (
            p.name.toLowerCase().includes(q) ||
            p.brand?.name?.toLowerCase().includes(q) ||
            p.category?.name?.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q))
        );
    });

    return (
        <AdminLayout>
            <Head title="Products" />
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Products</h1>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="border rounded-lg px-3 py-2 text-sm w-64"
                    />
                    <button onClick={openCreate} className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 shrink-0">Add Product</button>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredProducts.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                                No products found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredProducts.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>{p.brand?.name}</TableCell>
                                <TableCell>{fmt(p.price)}</TableCell>
                                <TableCell>{p.stock}</TableCell>
                                <TableCell className="space-x-2">
                                    <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline">Edit</button>
                                    <button onClick={() => remove(p.id)} className="text-red-600 hover:underline">Delete</button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Add'} Product</h2>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <input placeholder="Name" value={form.name} onChange={e => handleNameChange(e.target.value)} className="border rounded px-2 py-1 col-span-2" />
                            <input placeholder="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="border rounded px-2 py-1 col-span-2" />
                            <select value={form.brand_id} onChange={e => setForm({ ...form, brand_id: e.target.value })} className="border rounded px-2 py-1">
                                <option value="">Brand</option>
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                            <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="border rounded px-2 py-1">
                                <option value="">Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="border rounded px-2 py-1">
                                <option value="men">Men</option><option value="women">Women</option><option value="unisex">Unisex</option>
                            </select>
                            <input type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="border rounded px-2 py-1" />
                            <input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="border rounded px-2 py-1" />
                            <input placeholder="Top notes" value={form.notes_top} onChange={e => setForm({ ...form, notes_top: e.target.value })} className="border rounded px-2 py-1" />
                            <input placeholder="Middle notes" value={form.notes_middle} onChange={e => setForm({ ...form, notes_middle: e.target.value })} className="border rounded px-2 py-1" />
                            <input placeholder="Base notes" value={form.notes_base} onChange={e => setForm({ ...form, notes_base: e.target.value })} className="border rounded px-2 py-1" />
                            <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="border rounded px-2 py-1 col-span-2" rows={3} />
                            <div className="col-span-2 border-2 border-dashed border-gray-300 rounded-lg p-3">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Thumbnail (Gambar Utama) — Maks 10MB
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setThumbnailFile(e.target.files?.[0] || null)}
                                    className="w-full text-xs"
                                />
                                {thumbnailFile && (
                                    <p className="text-xs text-green-600 mt-1">
                                        ✓ {thumbnailFile.name} ({(thumbnailFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                )}
                            </div>
                            {existingImages.length > 0 && (
                                <div className="col-span-2 bg-purple-50/50 border border-purple-200 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-purple-900 mb-2">🖼️ Gambar Tersimpan Saat Ini ({existingImages.length}):</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {existingImages.map((img: any) => (
                                            <div key={img.id} className="relative group border border-purple-300 rounded-lg overflow-hidden bg-white">
                                                <img src={img.image} alt="" className="w-full h-16 object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(img.id)}
                                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Hapus gambar ini"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="col-span-2 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 transition-all hover:bg-gray-100">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    📸 Gambar Produk Lainnya (Bisa Pilih Banyak) — Maks 10MB per Gambar
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={e => setImageFiles(Array.from(e.target.files || []))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center transition-all hover:border-purple-400 hover:bg-purple-50">
                                        <div className="text-3xl mb-2">📁</div>
                                        <p className="text-sm text-gray-600 font-medium">Klik untuk memilih banyak gambar</p>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG hingga 10MB per file</p>
                                    </div>
                                </div>
                                {imageFiles.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm font-semibold text-green-700 mb-2">📋 File Terpilih ({imageFiles.length}):</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {imageFiles.map((f, i) => (
                                                <div key={i} className="relative group border-2 border-green-300 rounded-lg overflow-hidden bg-white">
                                                    <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-20 object-cover" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">{f.name}</span>
                                                    </div>
                                                    <button type="button" onClick={() => setImageFiles(imageFiles.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                            <button onClick={save} className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
