import React, { useState, useEffect } from 'react';
import { useAPI } from '../hooks/useAPI';
import Card, { CardHeader, CardBody } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input, { TextArea } from '../components/UI/Input';
import { Send, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../components/UI/Toast';
import SegmentedControl from '../components/UI/SegmentedControl';

export default function DisparoPage() {
    const { request, loading } = useAPI();
    const { addToast } = useToast();

    const [message, setMessage] = useState('');
    const [mode, setMode] = useState('all'); // 'all' or 'selected'
    const [schedule, setSchedule] = useState('');
    const [history, setHistory] = useState([]);
    const [leads, setLeads] = useState([]);
    const [selectedLeads, setSelectedLeads] = useState([]);

    // Load history and leads
    useEffect(() => {
        const loadData = async () => {
            const [resHistory, resLeads] = await Promise.all([
                request('/whatsapp/history'),
                request('/leads')
            ]);

            if (resHistory?.success) setHistory(resHistory.data || []);
            if (resLeads?.success) setLeads(resLeads.data || []);
        };
        loadData();
    }, []);

    const handleSend = async () => {
        if (!message.trim()) {
            addToast('Digite uma mensagem', 'error');
            return;
        }
        if (mode === 'selected' && selectedLeads.length === 0) {
            addToast('Selecione pelo menos um lead', 'error');
            return;
        }

        const payload = {
            message,
            mode,
            leadIds: mode === 'selected' ? selectedLeads : [],
            scheduled: schedule ? new Date(schedule).toISOString() : null
        };

        const res = await request('/whatsapp/send-bulk', 'POST', payload);
        if (res?.success) {
            addToast(schedule ? 'Disparo agendado' : 'Disparo iniciado');
            setMessage('');
            setSchedule('');
            setSelectedLeads([]);
            // Refresh history
            const hRes = await request('/whatsapp/history');
            if (hRes?.success) setHistory(hRes.data || []);
        } else {
            addToast('Erro ao enviar', 'error');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
            {/* Composer */}
            <div className="lg:col-span-7 space-y-6">
                <Card>
                    <CardHeader>
                        <span>Nova Mensagem</span>
                    </CardHeader>
                    <CardBody className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Destinatários</label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <SegmentedControl
                                    options={[
                                        { label: 'Todos os Leads', value: 'all' },
                                        { label: 'Selecionar', value: 'selected' }
                                    ]}
                                    value={mode}
                                    onChange={setMode}
                                />
                                {mode === 'selected' && (
                                    <div className="flex-1 text-sm text-[var(--muted)] flex items-center">
                                        {selectedLeads.length} leads selecionados
                                    </div>
                                )}
                            </div>

                            {mode === 'selected' && (
                                <div className="mt-2 h-40 overflow-y-auto border border-[var(--card-border)] rounded-xl p-2 scrollbar-thin">
                                    {leads.map(lead => (
                                        <label key={lead.id} className="flex items-center gap-3 p-2 hover:bg-[var(--bg-soft)] rounded-lg cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedLeads.includes(lead.id)}
                                                onChange={e => {
                                                    if (e.target.checked) setSelectedLeads(prev => [...prev, lead.id]);
                                                    else setSelectedLeads(prev => prev.filter(id => id !== lead.id));
                                                }}
                                                className="rounded border-[var(--card-border)] text-[var(--accent-solid)] focus:ring-0"
                                            />
                                            <span className="text-sm text-[var(--text)]">{lead.nome}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Mensagem</label>
                            <TextArea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Digite sua mensagem aqui..."
                                className="min-h-[150px]"
                            />
                            <p className="text-xs text-[var(--muted)] text-right">
                                * Variáveis disponíveis: {`{nome}`}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Agendamento (Opcional)</label>
                            <Input
                                type="datetime-local"
                                value={schedule}
                                onChange={e => setSchedule(e.target.value)}
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button onClick={handleSend} disabled={loading} variant="primary" className="w-full sm:w-auto">
                                {loading ? <Clock className="animate-spin" size={18} /> : <Send size={18} />}
                                {schedule ? 'Agendar Disparo' : 'Enviar Agora'}
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* History */}
            <div className="lg:col-span-5">
                <Card className="h-full max-h-[calc(100vh-120px)] flex flex-col">
                    <CardHeader>
                        <span>Histórico de Envios</span>
                    </CardHeader>
                    <CardBody className="flex-1 overflow-y-auto scrollbar-thin space-y-4">
                        {history.length === 0 ? (
                            <div className="text-center py-10 text-[var(--muted)]">
                                Nenhum envio registrado
                            </div>
                        ) : (
                            history.map((item, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-[var(--bg-soft)] border border-[var(--card-border)]">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${item.scheduled && new Date(item.when) > new Date()
                                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                            : item.ok
                                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                            {item.scheduled && new Date(item.when) > new Date() ? 'Agendado' : (item.ok ? 'Enviado' : 'Falha')}
                                        </span>
                                        <span className="text-xs text-[var(--muted)]">
                                            {new Date(item.when).toLocaleString('pt-BR')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--text)] mb-3 line-clamp-2">{item.message}</p>
                                    <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                                        <div className="flex items-center gap-1">
                                            <Users size={14} />
                                            <span>{item.count || 0} leads</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
