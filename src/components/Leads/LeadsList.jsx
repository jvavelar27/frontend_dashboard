import React, { useState } from 'react';
import Card, { CardHeader, CardBody } from '../UI/Card';
import { Search } from 'lucide-react';
import Input from '../UI/Input';

export default function LeadsList({ leads, onSelect, activeId }) {
    const [search, setSearch] = useState('');

    const filtered = leads.filter(l =>
        l.nome.toLowerCase().includes(search.toLowerCase()) ||
        l.telefone.includes(search)
    );

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between w-full">
                    <span>Lista de Leads</span>
                    <span className="px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--card-border)] text-xs font-bold">
                        {filtered.length}
                    </span>
                </div>
            </CardHeader>
            <CardBody className="flex-1 flex flex-col overflow-hidden">
                <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                    <Input
                        placeholder="Buscar por nome ou telefone..."
                        className="pl-10"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-1 scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-[var(--card)] z-10 text-xs uppercase text-[var(--muted)] font-bold">
                            <tr>
                                <th className="p-3 border-b border-[var(--card-border)]">Nome</th>
                                <th className="p-3 border-b border-[var(--card-border)] hidden sm:table-cell">Telefone</th>
                                <th className="p-3 border-b border-[var(--card-border)] hidden md:table-cell">Última Msg</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(lead => (
                                <tr
                                    key={lead.id}
                                    onClick={() => onSelect(lead)}
                                    className={`
                    cursor-pointer transition-colors duration-200 rounded-lg
                    ${activeId === lead.id
                                            ? 'bg-[var(--accent-solid)] text-white'
                                            : 'hover:bg-[var(--bg-soft)] text-[var(--text-soft)]'
                                        }
                  `}
                                >
                                    <td className="p-3 border-b border-[var(--card-border)] font-medium rounded-l-lg">
                                        {lead.nome}
                                    </td>
                                    <td className="p-3 border-b border-[var(--card-border)] hidden sm:table-cell">
                                        {lead.telefone}
                                    </td>
                                    <td className="p-3 border-b border-[var(--card-border)] hidden md:table-cell rounded-r-lg">
                                        {new Date(lead.ultimaMensagem).toLocaleDateString('pt-BR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <div className="text-center py-10 text-[var(--muted)]">
                            Nenhum lead encontrado
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
