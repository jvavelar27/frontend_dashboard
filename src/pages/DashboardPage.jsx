import React, { useEffect, useState } from 'react';
import { useAPI } from '../hooks/useAPI';
import MetricsGrid from '../components/Dashboard/MetricsGrid';
import HourlyChart from '../components/Dashboard/HourlyChart';
import LeadsDonut from '../components/Dashboard/LeadsDonut';
import SegmentedControl from '../components/UI/SegmentedControl';
import Skeleton from '../components/UI/Skeleton';
import { useToast } from '../components/UI/Toast';

export default function DashboardPage() {
    const { request } = useAPI();
    const { addToast } = useToast();
    const [rangeDays, setRangeDays] = useState(1);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        metrics: {},
        hourly: Array(24).fill(0),
        leads: []
    });

    const loadData = async (days) => {
        const res = await request(`/dashboard/metrics?rangeDays=${days}`);
        if (res?.success) {
            const d = res.data || res;
            setData(prev => ({
                ...prev,
                metrics: d.metrics || prev.metrics,
                hourly: d.hourly || prev.hourly
            }));
        } else {
            addToast("Falha ao atualizar métricas", "error");
        }
    };

    const loadInitial = async () => {
        try {
            const res = await request('/api/sync');
            console.log('Dashboard API response:', res);
            if (res?.success) {
                const d = res.data || res;
                setData({
                    metrics: d.metrics || {},
                    hourly: d.hourly || Array(24).fill(0),
                    leads: d.leads || []
                });
            }
        } catch (error) {
            console.error('Dashboard load error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitial();
        // Fallback timeout in case API never responds
        const timeout = setTimeout(() => setLoading(false), 5000);
        return () => clearTimeout(timeout);
    }, []);

    const handleRangeChange = (val) => {
        setRangeDays(val);
        loadData(val);
    };

    const computePie = () => {
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const total = data.leads.length || 1;
        const newLeads = data.leads.filter(l => new Date(l.primeiroContato) >= todayStart).length;
        const pctNew = Math.round(newLeads / total * 100);
        const pctOld = 100 - pctNew;
        return { pctNew, pctOld };
    };

    const { pctNew, pctOld } = computePie();

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-[400px] lg:col-span-2" />
                    <Skeleton className="h-[400px]" />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <MetricsGrid metrics={data.metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 items-stretch">
                <HourlyChart hourlyData={data.hourly} />
                <LeadsDonut pctNew={pctNew} pctOld={pctOld} />
            </div>

            <div className="mt-6 flex items-center gap-4 p-5 bg-[var(--surface)] border border-[var(--card-border)] rounded-2xl backdrop-blur-md">
                <span className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide">Período de análise</span>
                <SegmentedControl
                    options={[
                        { label: 'Hoje', value: 1 },
                        { label: '7 dias', value: 7 }
                    ]}
                    value={rangeDays}
                    onChange={handleRangeChange}
                />
            </div>
        </div>
    );
}
