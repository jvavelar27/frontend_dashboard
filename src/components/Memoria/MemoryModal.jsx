import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import Input, { TextArea } from '../UI/Input';
import Button from '../UI/Button';
import { Save, Plus } from 'lucide-react';

export default function MemoryModal({ isOpen, onClose, memory, onSave }) {
    const [formData, setFormData] = useState({
        pergunta: '',
        resposta: ''
    });

    useEffect(() => {
        if (memory) {
            setFormData({
                pergunta: memory.pergunta || '',
                resposta: memory.resposta || ''
            });
        } else {
            setFormData({ pergunta: '', resposta: '' });
        }
    }, [memory, isOpen]);

    const handleSubmit = () => {
        if (!formData.pergunta.trim() || !formData.resposta.trim()) return;
        onSave({
            ...(memory || {}),
            pergunta: formData.pergunta,
            resposta: formData.resposta
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={memory ? "Editar Memória" : "Nova Memória"}
            footer={
                <>
                    <Button onClick={onClose} variant="secondary">Cancelar</Button>
                    <Button onClick={handleSubmit} variant="primary">
                        {memory ? <Save size={16} /> : <Plus size={16} />}
                        {memory ? 'Salvar' : 'Criar'}
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Pergunta / Gatilho</label>
                    <Input
                        value={formData.pergunta}
                        onChange={e => setFormData({ ...formData, pergunta: e.target.value })}
                        placeholder="Ex: Qual o horário de funcionamento?"
                        autoFocus
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide">Resposta da IA</label>
                    <TextArea
                        value={formData.resposta}
                        onChange={e => setFormData({ ...formData, resposta: e.target.value })}
                        placeholder="Ex: Funcionamos de segunda a sexta, das 9h às 18h."
                        rows={5}
                    />
                </div>
            </div>
        </Modal>
    );
}
