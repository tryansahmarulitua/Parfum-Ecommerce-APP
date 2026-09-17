import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import api from '@/services/api';
import { TrendingUp, Printer, Calendar, DollarSign, ShoppingBag, Award } from 'lucide-react';
import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';

const fmt = (x: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(x);

const formatDateStr = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

interface SalesItem {
    date?: string;
    month?: string;
    total_transactions: number;
    total_revenue: number;
}

interface TopProduct {
    product_id: number;
    product_name: string;
    total_sold: number;
    total_revenue: number;
}

interface Props {
    initialSales?: SalesItem[];
    initialMonthlySales?: SalesItem[];
    initialTopProducts?: TopProduct[];
    startDate?: string;
    endDate?: string;
    summary?: {
        total_revenue: number;
        total_transactions: number;
    };
}

export default function AdminReports({
    initialSales = [],
    initialMonthlySales = [],
    initialTopProducts = [],
    startDate: defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: defaultEnd = new Date().toISOString().split('T')[0],
    summary: initialSummary = { total_revenue: 0, total_transactions: 0 },
}: Props) {
    const [periodMode, setPeriodMode] = useState<'daily' | 'monthly'>('daily');
    const [startDate, setStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState(defaultEnd);
    const [showCalendar, setShowCalendar] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(defaultStart + 'T00:00:00'),
        to: new Date(defaultEnd + 'T00:00:00'),
    });
    const [sales, setSales] = useState<SalesItem[]>(initialSales);

    const handleSelectRange = (range: DateRange | undefined) => {
        setDateRange(range);
        if (range?.from) {
            const fromStr = formatDateStr(range.from);
            setStartDate(fromStr);
            if (range?.to) {
                setEndDate(formatDateStr(range.to));
            } else {
                setEndDate(fromStr);
            }
        }
    };
    const [monthlySales, setMonthlySales] = useState<SalesItem[]>(initialMonthlySales);
    const [topProducts, setTopProducts] = useState<TopProduct[]>(initialTopProducts);
    const [summary, setSummary] = useState(initialSummary);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/reports/sales', {
                params: { start_date: startDate, end_date: endDate },
            });
            if (res.data?.success) {
                setSales(res.data.data.sales || []);
                if (res.data.data.monthly_sales) {
                    setMonthlySales(res.data.data.monthly_sales);
                }
                setSummary({
                    total_revenue: res.data.data.total_revenue || 0,
                    total_transactions: res.data.data.total_transactions || 0,
                });
            }
        } catch (err) {
            console.error('Error fetching sales report', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTopProducts = async () => {
        try {
            const res = await api.get('/admin/reports/top-products', { params: { limit: 5 } });
            if (res.data?.success) {
                setTopProducts(res.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching top products', err);
        }
    };

    useEffect(() => {
        fetchReport();
        fetchTopProducts();
    }, [startDate, endDate]);

    const handlePrint = () => {
        window.print();
    };

    const chartData = periodMode === 'daily'
        ? sales.map(s => ({
            period: s.date ? new Date(s.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '',
            Pendapatan: Number(s.total_revenue),
            Transaksi: Number(s.total_transactions),
        }))
        : monthlySales.slice().reverse().map(m => ({
            period: m.month ? new Date(m.month + '-01').toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '',
            Pendapatan: Number(m.total_revenue),
            Transaksi: Number(m.total_transactions),
        }));

    const displayRevenue = periodMode === 'daily' ? summary.total_revenue : monthlySales.reduce((acc, m) => acc + Number(m.total_revenue), 0);
    const displayTransactions = periodMode === 'daily' ? summary.total_transactions : monthlySales.reduce((acc, m) => acc + Number(m.total_transactions), 0);

    return (
        <AdminLayout>
            <Head title="Laporan Keuangan" />

            {/* Print Header (Only visible when printing) */}
            <div className="hidden print:block mb-8 text-center border-b pb-4">
                <h1 className="text-3xl font-bold uppercase tracking-wide">LAPORAN KEUANGAN & PENJUALAN</h1>
                <p className="text-sm text-gray-600 mt-1">Becca Parfum Store</p>
                <p className="text-xs text-gray-500 mt-1">
                    Periode: {periodMode === 'daily' ? `${startDate} s/d ${endDate}` : 'Laporan Bulanan'} | Dicetak pada: {new Date().toLocaleDateString('id-ID')}
                </p>
            </div>

            {/* Top Toolbar (Hidden when printing) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 print:hidden">
                <div>
                    <h1 className="text-2xl font-black text-foreground">Laporan Keuangan & Penjualan</h1>
                    <p className="text-sm font-base text-foreground/70">Pantau performa penjualan harian dan bulanan</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-main text-main-foreground px-4 py-2.5 border-2 border-border font-bold text-sm shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                >
                    <Printer className="w-4 h-4" />
                    Cetak Laporan PDF
                </button>
            </div>

            {/* Filter Section (Hidden when printing) */}
            <div className="bg-secondary-background p-5 border-2 border-border shadow-shadow mb-6 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-foreground">Tampilan:</span>
                        <div className="flex border-2 border-border bg-background p-1 gap-1">
                            <button
                                onClick={() => setPeriodMode('daily')}
                                className={`px-3 py-1.5 text-xs font-bold transition-all border-2 ${
                                    periodMode === 'daily'
                                        ? 'bg-main text-main-foreground border-border shadow-shadow'
                                        : 'bg-transparent text-foreground border-transparent hover:border-border'
                                }`}
                            >
                                Harian
                            </button>
                            <button
                                onClick={() => setPeriodMode('monthly')}
                                className={`px-3 py-1.5 text-xs font-bold transition-all border-2 ${
                                    periodMode === 'monthly'
                                        ? 'bg-main text-main-foreground border-border shadow-shadow'
                                        : 'bg-transparent text-foreground border-transparent hover:border-border'
                                }`}
                            >
                                Bulanan
                            </button>
                        </div>
                    </div>

                    {periodMode === 'daily' && (
                        <div className="relative">
                            <button
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="flex items-center gap-2 bg-background border-2 border-border px-3 py-1.5 text-xs font-bold text-foreground shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                            >
                                <Calendar className="w-4 h-4 text-foreground" />
                                <span>{startDate} s/d {endDate}</span>
                            </button>

                            {showCalendar && (
                                <div className="absolute right-0 top-full mt-2 z-50 bg-secondary-background border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2">
                                    <div className="flex justify-between items-center p-2 border-b-2 border-border mb-2">
                                        <span className="text-xs font-black uppercase">Pilih Rentang Tanggal</span>
                                        <button
                                            onClick={() => setShowCalendar(false)}
                                            className="text-xs font-bold bg-main text-main-foreground px-2 py-0.5 border-2 border-border"
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                    <CalendarComponent
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={handleSelectRange}
                                        numberOfMonths={2}
                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary-background p-6 border-2 border-border shadow-shadow flex items-center gap-4">
                    <div className="w-12 h-12 border-2 border-border bg-main text-main-foreground flex items-center justify-center font-black">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-foreground uppercase tracking-wider">Total Pendapatan</p>
                        <p className="text-2xl font-black text-foreground mt-1">{fmt(displayRevenue)}</p>
                    </div>
                </div>

                <div className="bg-secondary-background p-6 border-2 border-border shadow-shadow flex items-center gap-4">
                    <div className="w-12 h-12 border-2 border-border bg-main text-main-foreground flex items-center justify-center font-black">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-foreground uppercase tracking-wider">Total Transaksi Selesai</p>
                        <p className="text-2xl font-black text-foreground mt-1">{displayTransactions} Transaksi</p>
                    </div>
                </div>
            </div>

            {/* Chart Component */}
            <div className="bg-secondary-background p-6 border-2 border-border shadow-shadow mb-6 print:break-inside-avoid">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-black text-foreground">Grafik Penjualan ({periodMode === 'daily' ? 'Harian' : 'Bulanan'})</h2>
                        <p className="text-xs font-base text-foreground/70">Visualisasi pendapatan dalam periode terpilih</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-black text-main-foreground bg-main px-2.5 py-1 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Data Terverifikasi</span>
                    </div>
                </div>

                <div className="h-72 w-full pt-4">
                    {chartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-foreground font-bold text-sm">
                            Tidak ada data penjualan pada periode ini.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#000" strokeWidth={2} />
                                <XAxis dataKey="period" tickLine={true} axisLine={true} tick={{ fontSize: 12, fill: '#000', fontWeight: 'bold' }} />
                                <YAxis yAxisId="left" orientation="left" tickLine={true} axisLine={true} tick={{ fontSize: 12, fill: '#000', fontWeight: 'bold' }} tickFormatter={(v) => `Rp${v / 1000}k`} />
                                <YAxis yAxisId="right" orientation="right" tickLine={true} axisLine={true} tick={{ fontSize: 12, fill: '#000', fontWeight: 'bold' }} />
                                <Tooltip
                                    formatter={(value: any, name: any) => [
                                        name === 'Pendapatan' ? fmt(Number(value)) : `${value} Transaksi`,
                                        name
                                    ]}
                                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #000', boxShadow: '4px 4px 0px 0px #000', fontWeight: 'bold' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: 10, fontWeight: 'bold' }} />
                                <Bar yAxisId="left" dataKey="Pendapatan" fill="var(--main)" stroke="#000" strokeWidth={2} maxBarSize={40} />
                                <Bar yAxisId="right" dataKey="Transaksi" fill="var(--chart-4)" stroke="#000" strokeWidth={2} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Detail Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:break-inside-avoid">
                {/* Sales Table */}
                <div className="lg:col-span-2 bg-secondary-background border-2 border-border shadow-shadow overflow-hidden">
                    <div className="p-5 border-b-2 border-border bg-main/10">
                        <h3 className="font-black text-foreground">Rincian Penjualan ({periodMode === 'daily' ? 'Harian' : 'Bulanan'})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-black">Periode</TableHead>
                                    <TableHead className="font-black">Jumlah Transaksi</TableHead>
                                    <TableHead className="text-right font-black">Pendapatan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(periodMode === 'daily' ? sales : monthlySales).length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-foreground font-bold">Belum ada data penjualan.</TableCell>
                                    </TableRow>
                                ) : (
                                    (periodMode === 'daily' ? sales : monthlySales).map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-bold text-foreground">{item.date || item.month}</TableCell>
                                            <TableCell className="text-foreground font-base">{item.total_transactions} transaksi</TableCell>
                                            <TableCell className="text-right font-black text-foreground">{fmt(Number(item.total_revenue))}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-secondary-background border-2 border-border shadow-shadow overflow-hidden">
                    <div className="p-5 border-b-2 border-border bg-main/10 flex items-center gap-2">
                        <Award className="w-5 h-5 text-foreground" />
                        <h3 className="font-black text-foreground">Produk Terlaris</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        {topProducts.length === 0 ? (
                            <p className="text-center text-foreground font-bold text-sm py-4">Belum ada data produk.</p>
                        ) : (
                            topProducts.map((p, idx) => (
                                <div key={p.product_id || idx} className="flex items-center justify-between p-3 border-2 border-border bg-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <div>
                                        <p className="font-black text-sm text-foreground line-clamp-1">{p.product_name}</p>
                                        <p className="text-xs text-foreground/70 font-bold mt-0.5">{p.total_sold} Terjual</p>
                                    </div>
                                    <p className="font-black text-xs text-foreground">{fmt(Number(p.total_revenue))}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Print Footer */}
            <div className="hidden print:block mt-12 pt-8 border-t flex justify-between text-xs text-gray-500">
                <div>Manajer Operasional</div>
                <div>Laporan Resmi Sistem Informasi Parfum App</div>
            </div>
        </AdminLayout>
    );
}
