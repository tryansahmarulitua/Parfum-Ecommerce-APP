import { Head } from '@inertiajs/react';
import * as React from 'react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import api from '@/services/api';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Package, Users, ShoppingBag, DollarSign } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fmt = (x: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(x);

interface UserChartItem {
    date: string;
    active: number;
    inactive: number;
}

interface DashboardProps {
    initialStats?: {
        products: number;
        users: number;
        orders: number;
        revenue: number;
    };
    initialUserChart?: UserChartItem[];
}

const chartConfig = {
  users: {
    label: "Pengguna",
  },
  active: {
    label: "User Aktif",
    color: "var(--main)",
  },
  inactive: {
    label: "User Nonaktif",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export default function AdminDashboard({ initialStats, initialUserChart = [] }: DashboardProps) {
    const [stats, setStats] = useState({
        products: initialStats?.products ?? 0,
        users: initialStats?.users ?? 0,
        orders: initialStats?.orders ?? 0,
        revenue: initialStats?.revenue ?? 0,
    });
    const [userChartData, setUserChartData] = useState<UserChartItem[]>(initialUserChart);
    const [timeRange, setTimeRange] = React.useState("90d");

    useEffect(() => {
        api.get('/admin/reports/dashboard')
            .then(r => {
                const data = r.data?.data || {};
                setStats({
                    products: data.total_products ?? data.products ?? 0,
                    users: data.total_users ?? data.users ?? 0,
                    orders: data.total_orders ?? data.orders ?? 0,
                    revenue: data.total_revenue ?? data.revenue ?? 0,
                });
                if (data.user_chart) {
                    setUserChartData(
                        data.user_chart.map((item: any) => ({
                            date: item.date,
                            active: Number(item.active) || 0,
                            inactive: Number(item.inactive) || 0,
                        }))
                    );
                }
            })
            .catch(() => {});
    }, []);

    const filteredData = userChartData.filter((item) => {
        const date = new Date(item.date);
        const referenceDate = new Date();
        let daysToSubtract = 90;
        if (timeRange === "30d") {
            daysToSubtract = 30;
        } else if (timeRange === "7d") {
            daysToSubtract = 7;
        }
        const startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - daysToSubtract);
        return date >= startDate;
    });

    const statCards = [
        { label: 'Total Produk', value: stats.products, icon: Package, badgeBg: 'bg-main text-main-foreground' },
        { label: 'Total Pengguna', value: stats.users, icon: Users, badgeBg: 'bg-chart-4 text-foreground' },
        { label: 'Total Pesanan', value: stats.orders, icon: ShoppingBag, badgeBg: 'bg-chart-3 text-foreground' },
        { label: 'Total Pendapatan', value: fmt(stats.revenue), icon: DollarSign, badgeBg: 'bg-chart-5 text-white' },
    ];

    return (
        <AdminLayout>
            <Head title="Dashboard Admin" />

            <div className="mb-6">
                <h1 className="text-2xl font-black text-foreground">Dashboard Admin</h1>
                <p className="text-sm font-base text-foreground/70">Ikhtisar statistik dan aktivitas platform</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((c, idx) => {
                    const Icon = c.icon;
                    return (
                        <div
                            key={idx}
                            className="rounded-base border-2 border-border bg-secondary-background p-5 shadow-shadow flex items-center justify-between"
                        >
                            <div>
                                <p className="text-xs font-black uppercase text-foreground/70">{c.label}</p>
                                <p className="text-2xl font-black text-foreground mt-1">{c.value}</p>
                            </div>
                            <div className={`w-12 h-12 border-2 border-border flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${c.badgeBg}`}>
                                <Icon className="w-6 h-6 stroke-[2.5]" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Interactive Area Chart for Active vs Nonactive Users */}
            <Card className="bg-secondary-background text-foreground border-2 border-border shadow-shadow">
                <CardHeader className="flex items-center sm:gap-2 gap-4 space-y-0 sm:flex-row flex-col border-b-2 border-border pb-4">
                    <div className="grid flex-1 gap-1 text-center sm:text-left">
                        <CardTitle className="text-xl font-black">Statistik Pengguna Aktif vs Nonaktif</CardTitle>
                        <CardDescription className="font-bold text-foreground/70">
                            Grafik perbandingan jumlah pengguna aktif dan nonaktif dalam periode terpilih
                        </CardDescription>
                    </div>
                    <Select
                        value={timeRange}
                        onValueChange={(value) => value && setTimeRange(value)}
                    >
                        <SelectTrigger
                            className="w-[160px] sm:ml-auto"
                            aria-label="Pilih rentang waktu"
                        >
                            <SelectValue placeholder="3 Bulan Terakhir" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="90d">3 Bulan Terakhir</SelectItem>
                            <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                            <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent className="px-2 pt-6 sm:px-6">
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[300px] w-full"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={filteredData}>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#000" strokeWidth={2} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={true}
                                    axisLine={true}
                                    tickMargin={8}
                                    minTickGap={32}
                                    tick={{ fontSize: 12, fill: '#000', fontWeight: 'bold' }}
                                    tickFormatter={(value) => {
                                        const date = new Date(value);
                                        return date.toLocaleDateString("id-ID", {
                                            month: "short",
                                            day: "numeric",
                                        });
                                    }}
                                />
                                <YAxis
                                    tickLine={true}
                                    axisLine={true}
                                    tick={{ fontSize: 12, fill: '#000', fontWeight: 'bold' }}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            labelFormatter={(value: any) => {
                                                return new Date(value as string).toLocaleDateString(
                                                    "id-ID",
                                                    {
                                                        month: "long",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    }
                                                );
                                            }}
                                            indicator="dot"
                                        />
                                    }
                                />
                                <Area
                                    dataKey="inactive"
                                    type="natural"
                                    fill="var(--chart-5)"
                                    stroke="#000"
                                    strokeWidth={2}
                                    fillOpacity={0.6}
                                    stackId="a"
                                    activeDot={{
                                        fill: "#000",
                                        r: 6,
                                    }}
                                />
                                <Area
                                    dataKey="active"
                                    type="natural"
                                    fill="var(--main)"
                                    stroke="#000"
                                    strokeWidth={2}
                                    fillOpacity={0.8}
                                    stackId="a"
                                    activeDot={{
                                        fill: "#000",
                                        r: 6,
                                    }}
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
