import React from 'react';
import Card, { CardHeader, CardBody } from '../UI/Card';
import Button from '../UI/Button';
import { User, Phone, Calendar, MessageCircle, Edit } from 'lucide-react';

export default function LeadProfile({ lead, onEdit }) {
    if (!lead) {
        return (
            <Card className="h-full flex items-center justify-center p-10 text-center">
                <div className="flex flex-col items-center gap-4 text-[var(--muted)]">
                    <div className="w-20 h-20 rounded-full bg-[var(--bg-soft)] flex items-center justify-center border-2 border-[var(--card-border)] border-dashed">
                        <User size={40} />
                    </div>
                    <p>Selecione um lead para ver detalhes</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <span>Perfil do Lead</span>
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs border border-green-500/20 font-medium">
                    Ativo
                </span>
            </CardHeader>
            <CardBody className="flex flex-col items-center text-center gap-6">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-[var(--bg-soft)] border-4 border-[var(--card-border)] overflow-hidden shadow-lg group-hover:border-[var(--accent-solid)] transition-colors duration-300">
                        {lead.foto ? (
                            <img src={lead.foto} alt={lead.nome} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                                <User size={48} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-[var(--text)]">{lead.nome}</h2>
                    <p className="text-[var(--muted)] font-medium flex items-center justify-center gap-2">
                        <Phone size={16} />
                        {lead.telefone}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 w-full max-w-xs text-sm">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-soft)] border border-[var(--card-border)]">
                        <Calendar size={18} className="text-[var(--accent-solid)]" />
                        <div className="text-left">
                            <div className="text-[var(--muted)] text-xs">Primeiro Contato</div>
                            <div className="font-medium">{new Date(lead.primeiroContato).toLocaleString('pt-BR')}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-soft)] border border-[var(--card-border)]">
                        <MessageCircle size={18} className="text-[var(--accent-2-solid)]" />
                        <div className="text-left">
                            <div className="text-[var(--muted)] text-xs">Última Mensagem</div>
                            <div className="font-medium">{new Date(lead.ultimaMensagem).toLocaleString('pt-BR')}</div>
                        </div>
                    </div>
                </div>

                <Button onClick={onEdit} variant="secondary" className="mt-auto w-full max-w-xs">
                    <Edit size={16} />
                    Editar Lead
                </Button>
            </CardBody>
        </Card>
    );
}
