import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import api from '@/services/api';
import { Review, User, Product } from '@/types';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/components/ui/table';

interface ExtendedReview extends Review {
    product?: Product;
}

interface Props {
    initialReviews?: ExtendedReview[];
}

export default function AdminReviews({ initialReviews = [] }: Props) {
    const [reviews, setReviews] = useState<ExtendedReview[]>(initialReviews);

    const toggleVisibility = async (id: number) => {
        try {
            await api.put(`/admin/reviews/${id}/toggle-visibility`);
            setReviews(prev =>
                prev.map(r => (r.id === id ? { ...r, is_visible: !r.is_visible } : r))
            );
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal mengubah visibilitas ulasan');
        }
    };

    const remove = async (id: number) => {
        if (!confirm('Hapus ulasan ini?')) return;
        try {
            await api.delete(`/admin/reviews/${id}`);
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menghapus ulasan');
        }
    };

    return (
        <AdminLayout>
            <Head title="Kelola Ulasan" />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Ulasan Produk</h1>
            </div>

            <div className="bg-white shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pengguna</TableHead>
                            <TableHead>Produk</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Komentar</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-gray-500">
                                    Belum ada ulasan.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reviews.map(r => (
                                <TableRow key={r.id}>
                                    <TableCell className="font-medium text-gray-900">
                                        {r.user?.name || 'Anonim'}
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        {r.product?.name || `Product #${r.id}`}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-yellow-500 font-bold">★ {r.rating}</span>
                                    </TableCell>
                                    <TableCell className="text-gray-700 max-w-xs truncate">
                                        {r.comment || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                r.is_visible
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {r.is_visible ? 'Tampil' : 'Sembunyi'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <button
                                            onClick={() => toggleVisibility(r.id)}
                                            className="text-blue-600 hover:underline text-xs"
                                        >
                                            {r.is_visible ? 'Sembunyikan' : 'Tampilkan'}
                                        </button>
                                        <button
                                            onClick={() => remove(r.id)}
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
        </AdminLayout>
    );
}
