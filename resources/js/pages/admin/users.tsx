import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import api from '@/services/api';
import { User } from '@/types';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/components/ui/table';

interface Props {
    initialUsers?: User[];
}

export default function AdminUsers({ initialUsers = [] }: Props) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users', { params: { search, per_page: 100 } });
            const data = res.data?.data?.data ?? res.data?.data ?? res.data;
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [search]);

    const toggleStatus = async (id: number) => {
        try {
            await api.put(`/admin/users/${id}/toggle-status`);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal mengubah status user');
        }
    };

    return (
        <AdminLayout>
            <Head title="Kelola Pengguna" />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Pengguna</h1>
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cari nama, email, telepon..."
                    className="border rounded-lg px-3 py-2 text-sm w-72"
                />
            </div>

            <div className="bg-white shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Telepon</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Terdaftar</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-500">
                                    Memuat data...
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-500">
                                    Tidak ada pengguna.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map(u => (
                                <TableRow key={u.id}>
                                    <TableCell className="font-mono text-xs">{u.id}</TableCell>
                                    <TableCell className="font-medium text-gray-900">{u.name}</TableCell>
                                    <TableCell className="text-gray-600">{u.email}</TableCell>
                                    <TableCell className="text-gray-600">{u.phone || '-'}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                u.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {u.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-xs">
                                        {new Date(u.created_at).toLocaleDateString('id-ID')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <button
                                            onClick={() => toggleStatus(u.id)}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            {u.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
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
