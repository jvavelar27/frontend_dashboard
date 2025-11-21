import React from 'react';
import Card, { CardBody } from '../UI/Card';
import { TrendingUp, Send, Zap } from 'lucide-react';

export default function MetricsGrid({ metrics }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:-translate-y-1 transition-transform duration-300">
                <CardBody className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--muted)]">Total de Leads</span>
                        <div className="p-2 rounded-lg bg-[var(--bg-soft)] text-[var(--accent-solid)]">
                            <TrendingUp size={18} strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-bold text-[var(--text)] tracking-tight">
                            {metrics.leads?.toLocaleString('pt-BR') || 0}
                        </span>
                        <p className="text-xs font-medium text-[var(--muted)] mt-1">
                            {metrics.leadsHint || 'leads cadastrados'}
                        </p>
                    </div>
                </CardBody>
            </Card>

            <Card className="hover:-translate-y-1 transition-transform duration-300">
                <CardBody className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--muted)]">Mensagens Enviadas</span>
                        <div className="p-2 rounded-lg bg-[var(--bg-soft)] text-[var(--accent-2-solid)]">
                            <Send size={18} strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-bold text-[var(--text)] tracking-tight">
                            {metrics.sent?.toLocaleString('pt-BR') || 0}
                        </span>
                        <p className="text-xs font-medium text-[var(--muted)] mt-1">
                            {metrics.sentHint || 'mensagens hoje'}
                        </p>
                    </div>
                </CardBody>
            </Card>

            <Card className="hover:-translate-y-1 transition-transform duration-300">
                <CardBody className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--muted)]">Tempo de Resposta</span>
                        <div className="p-2 rounded-lg bg-[var(--bg-soft)] text-[var(--warning)]">
                            <Zap size={18} strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-bold text-[var(--text)] tracking-tight">
                            {metrics.responseTime || 0}<span className="text-lg text-[var(--muted)] ml-0.5">s</span>
                        </span>
                        <p className="text-xs font-medium text-[var(--muted)] mt-1">
                            {metrics.responseHint || 'tempo médio'}
                        </p>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
