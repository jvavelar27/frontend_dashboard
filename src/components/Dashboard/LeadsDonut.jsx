import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card, { CardHeader, CardBody } from '../UI/Card';

export default function LeadsDonut({ pctNew, pctOld }) {
    const data = [
        { name: 'Novos', value: pctNew },
        { name: 'Antigos', value: pctOld },
    ];

    const COLORS = ['var(--accent-solid)', 'var(--muted-soft)'];

    return (
        <Card>
            <CardHeader>
                <span>Distribuição de Leads</span>
            </CardHeader>
            <CardBody>
                <div className="flex flex-col items-center justify-center h-[320px]">
                    <div className="relative w-[180px] h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={80}
                                    startAngle={90}
                                    endAngle={-270}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                    cornerRadius={4}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card)',
                                        borderColor: 'var(--card-border)',
                                        borderRadius: '12px',
                                        color: 'var(--text)',
                                        boxShadow: 'var(--shadow-lg)',
                                        fontSize: '12px'
                                    }}
                                    formatter={(val) => `${val}%`}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-[var(--text)] tracking-tight">{pctNew}%</span>
                            <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mt-1">Novos</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-8 mt-8 w-full">
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[var(--accent-solid)]" />
                                <span className="text-xs font-medium text-[var(--muted)]">Novos</span>
                            </div>
                            <span className="text-sm font-bold text-[var(--text)]">{pctNew}%</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[var(--muted-soft)]" />
                                <span className="text-xs font-medium text-[var(--muted)]">Antigos</span>
                            </div>
                            <span className="text-sm font-bold text-[var(--text)]">{pctOld}%</span>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
