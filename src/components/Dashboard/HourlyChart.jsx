import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import Card, { CardHeader, CardBody } from '../UI/Card';
import { Clock } from 'lucide-react';

export default function HourlyChart({ hourlyData }) {
    const data = hourlyData.map((val, idx) => ({
        hour: idx,
        value: val,
        label: `${idx}h`
    }));

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[var(--muted)]" />
                    <span>Atividade por Horário</span>
                </div>
            </CardHeader>
            <CardBody>
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={24}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" opacity={0.5} />
                            <XAxis
                                dataKey="label"
                                tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                                interval={2}
                                dy={10}
                            />
                            <Tooltip
                                cursor={{ fill: 'var(--bg-soft)', opacity: 0.5 }}
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    borderColor: 'var(--card-border)',
                                    borderRadius: '12px',
                                    color: 'var(--text)',
                                    boxShadow: 'var(--shadow-lg)',
                                    padding: '8px 12px',
                                    fontSize: '12px'
                                }}
                                itemStyle={{ color: 'var(--text)', fontWeight: 600 }}
                                formatter={(value) => [`${value} msgs`, 'Volume']}
                                labelStyle={{ color: 'var(--muted)', marginBottom: '4px' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                                {data.map((entry, index) => {
                                    const isBiz = index >= 9 && index <= 18;
                                    return <Cell key={`cell-${index}`} fill={isBiz ? 'var(--accent-solid)' : 'var(--muted-soft)'} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardBody>
        </Card>
    );
}
