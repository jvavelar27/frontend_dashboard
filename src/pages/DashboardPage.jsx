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
        setLoading(true);
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
        setLoading(false);
    };

    useEffect(() => {
        loadData(rangeDays);
    }, []);

    const handleRangeChange = (val) => {
        setRangeDays(val);
        loadData(val);
    };

    const computePie = () => {
        // Try to use pre-calculated metrics if available
        if (data.metrics?.leads !== undefined && data.metrics?.newLeads !== undefined) {
            const total = data.metrics.leads || 1;
            const newLeadsCount = data.metrics.newLeads;
            const pctNew = Math.round(newLeadsCount / total * 100);
            const pctOld = 100 - pctNew;
            return { pctNew, pctOld };
        }

        // Fallback to legacy array calculation (will likely be empty now)
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
