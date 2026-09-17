import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import api from '@/services/api';
import { Address } from '@/types';
import { MapPin, CreditCard, Lock, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const emptyAddress = {
    label: '',
    recipient_name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    postal_code: '',
    address: '',
    is_default: false,
};

export default function Settings() {
    const [activeTab, setActiveTab] = useState<'address' | 'payment' | 'password'>('address');

    // Address state
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editAddressId, setEditAddressId] = useState<number | null>(null);
    const [addressForm, setAddressForm] = useState(emptyAddress);
    const [addressMsg, setAddressMsg] = useState('');
    const [addressErr, setAddressErr] = useState('');

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passMsg, setPassMsg] = useState('');
    const [passErr, setPassErr] = useState('');
    const [passLoading, setPassLoading] = useState(false);

    const fetchAddresses = async () => {
        try {
            const res = await api.get('/addresses');
            setAddresses(res.data.data ?? []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const openCreateAddress = () => {
        setAddressForm(emptyAddress);
        setEditAddressId(null);
        setAddressErr('');
        setShowAddressModal(true);
    };

    const openEditAddress = (addr: Address) => {
        setAddressForm({
            label: addr.label,
            recipient_name: addr.recipient_name,
            phone: addr.phone,
            province: addr.province,
            city: addr.city,
            district: addr.district,
            postal_code: addr.postal_code,
            address: addr.address,
            is_default: addr.is_default,
        });
        setEditAddressId(addr.id);
        setAddressErr('');
        setShowAddressModal(true);
    };

    const saveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddressErr('');
        try {
            if (editAddressId) {
                await api.put(`/addresses/${editAddressId}`, addressForm);
                setAddressMsg('Alamat berhasil diperbarui.');
            } else {
                await api.post('/addresses', addressForm);
                setAddressMsg('Alamat baru berhasil ditambahkan.');
            }
            setShowAddressModal(false);
            fetchAddresses();
        } catch (err: any) {
            setAddressErr(err.response?.data?.message || 'Gagal menyimpan alamat.');
        }
    };

    const deleteAddress = async (id: number) => {
        if (!confirm('Hapus alamat ini?')) return;
        try {
            await api.delete(`/addresses/${id}`);
            setAddressMsg('Alamat berhasil dihapus.');
            fetchAddresses();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menghapus alamat.');
        }
    };

    const changePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassMsg('');
        setPassErr('');

        if (newPassword !== confirmPassword) {
            setPassErr('Konfirmasi password baru tidak cocok.');
            return;
        }

        setPassLoading(true);
        try {
            const res = await api.post('/change-password', {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword,
            });
            setPassMsg(res.data.message || 'Password berhasil diperbarui.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setPassErr(err.response?.data?.message || 'Gagal memperbarui password.');
        } finally {
            setPassLoading(false);
        }
    };

    return (
        <UserLayout>
            <Head title="Pengaturan Akun" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Pengaturan Akun</h1>
                    <p className="text-sm text-foreground/70">Kelola alamat, metode pembayaran, dan keamanan sandi akun Anda.</p>
                </div>

                <div className="flex border-b-2 border-border gap-2 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('address')}
                        className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 -mb-[2px] transition-all ${
                            activeTab === 'address'
                                ? 'border-main text-main'
                                : 'border-transparent text-foreground/70 hover:text-foreground'
                        }`}
                    >
                        <MapPin className="w-4 h-4" /> Kelola Alamat
                    </button>

                    <button
                        onClick={() => setActiveTab('payment')}
                        className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 -mb-[2px] transition-all ${
                            activeTab === 'payment'
                                ? 'border-main text-main'
                                : 'border-transparent text-foreground/70 hover:text-foreground'
                        }`}
                    >
                        <CreditCard className="w-4 h-4" /> Kelola Pembayaran
                    </button>

                    <button
                        onClick={() => setActiveTab('password')}
                        className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 -mb-[2px] transition-all ${
                            activeTab === 'password'
                                ? 'border-main text-main'
                                : 'border-transparent text-foreground/70 hover:text-foreground'
                        }`}
                    >
                        <Lock className="w-4 h-4" /> Ubah Password
                    </button>
                </div>

                {/* ADDRESS TAB */}
                {activeTab === 'address' && (
                    <div className="space-y-4">
                        {addressMsg && (
                            <div className="p-3 bg-green-100 border-2 border-green-500 text-green-800 rounded-base text-sm font-medium">
                                {addressMsg}
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">Daftar Alamat Pengiriman</h2>
                            <button
                                onClick={openCreateAddress}
                                className="bg-main text-main-foreground font-semibold px-4 py-2 rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all text-xs flex items-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" /> Tambah Alamat
                            </button>
                        </div>

                        <div className="grid gap-3">
                            {addresses.map(addr => (
                                <div
                                    key={addr.id}
                                    className="bg-secondary-background border-2 border-border rounded-base p-4 shadow-shadow flex flex-col sm:flex-row justify-between gap-4"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-base">{addr.label}</span>
                                            {addr.is_default && (
                                                <span className="bg-main text-main-foreground px-2 py-0.5 rounded-base text-[10px] font-bold border border-border">
                                                    Utama
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold">{addr.recipient_name} ({addr.phone})</p>
                                        <p className="text-xs text-foreground/80 leading-relaxed">
                                            {addr.address}, {addr.district}, {addr.city}, {addr.province} {addr.postal_code}
                                        </p>
                                    </div>

                                    <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                                        <button
                                            onClick={() => openEditAddress(addr)}
                                            className="px-3 py-1 text-xs font-semibold border-2 border-border rounded-base bg-background hover:bg-main transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteAddress(addr.id)}
                                            className="px-3 py-1 text-xs font-semibold border-2 border-border rounded-base text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {addresses.length === 0 && (
                                <p className="text-center text-foreground/60 py-8 bg-secondary-background border-2 border-border rounded-base text-sm">
                                    Belum ada alamat pengiriman. Silakan tambah alamat baru.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* PAYMENT TAB */}
                {activeTab === 'payment' && (
                    <div className="bg-secondary-background border-2 border-border rounded-base p-6 shadow-shadow space-y-4">
                        <h2 className="text-lg font-bold">Metode Pembayaran Tersimpan</h2>
                        <p className="text-sm text-foreground/80">
                            Pembayaran di ParfumStore menggunakan metode transfer bank manual, QRIS, dan E-Wallet yang diverifikasi secara instan saat transaksi.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4 pt-2">
                            <div className="border-2 border-border rounded-base p-4 bg-background">
                                <p className="font-bold text-sm mb-1">🏦 Transfer Bank BCA</p>
                                <p className="text-xs font-semibold text-foreground/70">No. Rekening: 123-456-7890</p>
                                <p className="text-xs text-foreground/60">a.n ParfumStore Indonesia</p>
                            </div>

                            <div className="border-2 border-border rounded-base p-4 bg-background">
                                <p className="font-bold text-sm mb-1">🏦 Transfer Bank Mandiri</p>
                                <p className="text-xs font-semibold text-foreground/70">No. Rekening: 987-000-1234</p>
                                <p className="text-xs text-foreground/60">a.n ParfumStore Indonesia</p>
                            </div>

                            <div className="border-2 border-border rounded-base p-4 bg-background">
                                <p className="font-bold text-sm mb-1">📱 E-Wallet & QRIS</p>
                                <p className="text-xs font-semibold text-foreground/70">GoPay / OVO / DANA: 0812-3456-7890</p>
                                <p className="text-xs text-foreground/60">a.n ParfumStore</p>
                            </div>

                            <div className="border-2 border-border rounded-base p-4 bg-background">
                                <p className="font-bold text-sm mb-1">💵 Cash on Delivery (COD)</p>
                                <p className="text-xs text-foreground/70">Tersedia untuk wilayah Jabodetabek</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* PASSWORD TAB */}
                {activeTab === 'password' && (
                    <div className="bg-secondary-background border-2 border-border rounded-base p-6 shadow-shadow space-y-4 max-w-md">
                        <h2 className="text-lg font-bold">Ubah Password</h2>

                        {passMsg && (
                            <div className="p-3 bg-green-100 border-2 border-green-500 text-green-800 rounded-base text-sm font-medium">
                                {passMsg}
                            </div>
                        )}
                        {passErr && (
                            <div className="p-3 bg-red-100 border-2 border-red-500 text-red-800 rounded-base text-sm font-medium">
                                {passErr}
                            </div>
                        )}

                        <form onSubmit={changePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Password Saat Ini</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    required
                                    className="w-full border-2 border-border rounded-base px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Password Baru</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full border-2 border-border rounded-base px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Konfirmasi Password Baru</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full border-2 border-border rounded-base px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={passLoading}
                                className="bg-main text-main-foreground font-semibold px-6 py-2 rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all text-sm w-full disabled:opacity-50"
                            >
                                {passLoading ? 'Memproses...' : 'Simpan Password Baru'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* ADDRESS MODAL */}
            {showAddressModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-background border-2 border-border rounded-base max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold">{editAddressId ? 'Edit Alamat' : 'Tambah Alamat Baru'}</h3>

                        {addressErr && (
                            <div className="p-3 bg-red-100 border-2 border-red-500 text-red-800 rounded-base text-sm font-medium">
                                {addressErr}
                            </div>
                        )}

                        <form onSubmit={saveAddress} className="space-y-3 text-sm">
                            <div>
                                <label className="block font-medium mb-1">Label Alamat (cth: Rumah, Kantor)</label>
                                <input
                                    type="text"
                                    value={addressForm.label}
                                    onChange={e => setAddressForm({ ...addressForm, label: e.target.value })}
                                    required
                                    className="w-full border-2 border-border rounded-base px-3 py-2 bg-secondary-background"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium mb-1">Nama Penerima</label>
                                    <input
                                        type="text"
                                        value={addressForm.recipient_name}
                                        onChange={e => setAddressForm({ ...addressForm, recipient_name: e.target.value })}
                                        required
                                        className="w-full border-2 border-border rounded-base px-3 py-2 bg-secondary-background"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Nomor HP</label>
                                    <input
                                        type="text"
                                        value={addressForm.phone}
                                        onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                                        required
                                        className="w-full border-2 border-border rounded-base px-3 py-2 bg-secondary-background"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium mb-1">Provinsi</label>
                                    <input
                                        type="text"
                                        value={addressForm.province}
                                        onChange={e => setAddressForm({ ...addressForm, province: e.target.value })}
                                        required
                                        className="w-full border-2 border-border rounded-base px-3 py-2 bg-secondary-background"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Kota/Kabupaten</label>
                                    <input
                                        type="text"
                                        value={addressForm.city}
                                        onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                        required
                                        className="w-full border-2 border-border rounded-base px-3 py-2 bg-secondary-background"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium mb-1">Kecamatan</label>
                                    <input
                                        type="text"
                                        value={addressForm.district}
                                        onChange={e => setAddressForm({ ...addressForm, district: e.target.value })}
                                        required
                                        className="w-full border-2 border-border rounded-base px-3 py-2 bg-secondary-background"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Kode Pos</label>
                                    <input
                                        type="text"
                                        value={addressForm.postal_code}
                                        onChange={e => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                                        required
                                        className="w-full border-2 border-border rounded-base px-3 py-2 bg-secondary-background"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium mb-1">Alamat Lengkap</label>
                                <textarea
                                    value={addressForm.address}
                                    onChange={e => setAddressForm({ ...addressForm, address: e.target.value })}
                                    required
                                    rows={3}
                                    className="w-full border-2 border-border rounded-base px-3 py-2 bg-secondary-background"
                                />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer font-medium pt-1">
                                <input
                                    type="checkbox"
                                    checked={addressForm.is_default}
                                    onChange={e => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                                    className="rounded border-border text-main focus:ring-main"
                                />
                                Jadikan Alamat Utama
                            </label>

                            <div className="flex justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddressModal(false)}
                                    className="px-4 py-2 border-2 border-border rounded-base font-semibold text-xs"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-main text-main-foreground font-semibold px-5 py-2 rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all text-xs"
                                >
                                    Simpan Alamat
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </UserLayout>
    );
}
