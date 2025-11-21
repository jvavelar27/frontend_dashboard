import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { Save } from 'lucide-react';

export default function LeadModal({ isOpen, onClose, lead, onSave }) {
    const [formData, setFormData] = useState({
        nome: '',
        telefone: '',
        primeiroContato: ''
    });

    useEffect(() => {
        if (lead) {
            const toLocal = (iso) => {
                if (!iso) return '';
                const d = new Date(iso);
                const off = d.getTimezoneOffset();
                const local = new Date(d.getTime() - off * 60000);
                return local.toISOString().slice(0, 16);
            };

            setFormData({
                nome: lead.nome || '',
                telefone: lead.telefone || '',
                primeiroContato: toLocal(lead.primeiroContato)
            });
        }
    }, [lead]);

    const handleSubmit = () => {
        const fromLocal = (local) => {
            if (!local) return null;
            return new Date(local).toISOString();
        };

        onSave({
            ...lead,
            nome: formData.nome,
            telefone: formData.telefone,
            primeiroContato: fromLocal(formData.primeiroContato)
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar Lead"
            footer={
                <>
                    <Button onClick={onClose} variant="secondary">Cancelar</Button>
                    <Button onClick={handleSubmit} variant="primary">
                        <Save size={16} />
                        Salvar
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Nome Completo</label>
                    <Input
                        value={formData.nome}
                        onChange={e => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Digite o nome completo"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Telefone</label>
                    <Input
                        value={formData.telefone}
                        onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                        placeholder="(00) 00000-0000"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Primeiro Contato</label>
                    <Input
                        type="datetime-local"
                        value={formData.primeiroContato}
                        onChange={e => setFormData({ ...formData, primeiroContato: e.target.value })}
                    />
                </div>
            </div>
        </Modal>
    );
}
