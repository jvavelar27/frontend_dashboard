import React, { useState } from 'react';
import Card, { CardHeader, CardBody } from '../UI/Card';
import Button from '../UI/Button';
import { Search, Plus, Trash2, Edit, Brain } from 'lucide-react';
import Input from '../UI/Input';

export default function MemoryList({ memories = [], onEdit, onDelete, onAdd }) {
    const [search, setSearch] = useState('');

    const filtered = memories.filter(m =>
        m?.pergunta?.toLowerCase().includes(search.toLowerCase()) ||
        m?.resposta?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Brain className="text-[var(--accent-solid)]" size={18} strokeWidth={2} />
                    <span>Base de Conhecimento</span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--card-border)] text-xs font-bold">
                        {filtered.length}
                    </span>
                </div>
                <Button onClick={onAdd} variant="primary" className="w-full sm:w-auto">
                    <Plus size={16} />
                    Nova Memória
                </Button>
            </CardHeader>

            <CardBody className="flex-1 flex flex-col overflow-hidden gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                    <Input
                        placeholder="Pesquisar conhecimentos..."
                        className="pl-10"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-[var(--muted)] text-center">
                            <Brain size={40} className="mb-3 opacity-20" />
                            <p>Nenhuma memória encontrada</p>
                            <p className="text-xs">Adicione novos conhecimentos para treinar sua IA</p>
                        </div>
                    ) : (
                        filtered.map(mem => (
                            <div
                                key={mem.id}
                                className="group p-4 rounded-xl bg-[var(--bg-soft)] border border-[var(--card-border)] hover:border-[var(--accent-solid)] transition-all duration-200"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-[var(--accent-solid)] uppercase tracking-wider">Pergunta</span>
                                        </div>
                                        <h4 className="font-semibold text-[var(--text)]">{mem.pergunta}</h4>

                                        <div className="pt-2">
                                            <span className="text-xs font-bold text-[var(--accent-2-solid)] uppercase tracking-wider">Resposta</span>
                                            <p className="text-sm text-[var(--text-soft)] mt-1 leading-relaxed whitespace-pre-wrap">{mem.resposta}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => onEdit(mem)}
                                            className="p-2 rounded-lg hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(mem.id)}
                                            className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500 transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
