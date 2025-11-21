import React, { useState, useEffect } from 'react';
import { useAPI } from '../hooks/useAPI';
import MemoryList from '../components/Memoria/MemoryList';
import MemoryModal from '../components/Memoria/MemoryModal';
import { useToast } from '../components/UI/Toast';
import Skeleton from '../components/UI/Skeleton';

export default function MemoriaPage() {
    const { request } = useAPI();
    const { addToast } = useToast();
    const [memories, setMemories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMem, setEditingMem] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);

    const loadMemories = async () => {
        const res = await request('/memoria');
        console.log('Memoria API Response:', res);
        if (res?.success) {
            const data = res.data || res.items || [];
            console.log('Memories loaded:', data);
            console.log('First memory object:', data[0]);
            console.log('Object keys:', data[0] ? Object.keys(data[0]) : 'no data');
            setMemories(data);
        } else {
            console.error('Failed to load memories:', res);
        }
        setInitialLoad(false);
    };

    useEffect(() => {
        loadMemories();
    }, []);

    const handleSave = async (memData) => {
        const isEdit = !!memData.id;
        const endpoint = isEdit ? '/memoria/update' : '/memoria';
        const method = isEdit ? 'PUT' : 'POST';

        const res = await request(endpoint, method, memData);

        if (res?.success) {
            addToast(isEdit ? 'Memória atualizada' : 'Memória criada');
            loadMemories();
            setIsModalOpen(false);
            setEditingMem(null);
        } else {
            addToast('Erro ao salvar memória', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta memória?')) return;

        const res = await request('/memoria/delete', 'DELETE', { id });
        if (res?.success) {
            addToast('Memória excluída');
            setMemories(prev => prev.filter(m => m.id !== id));
        } else {
            addToast('Erro ao excluir', 'error');
        }
    };

    const openNew = () => {
        setEditingMem(null);
        setIsModalOpen(true);
    };

    const openEdit = (mem) => {
        setEditingMem(mem);
        setIsModalOpen(true);
    };

    if (initialLoad) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[200px] w-full" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-100px)] animate-in fade-in duration-500">
            <MemoryList
                memories={memories}
                onAdd={openNew}
                onEdit={openEdit}
                onDelete={handleDelete}
            />

            <MemoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                memory={editingMem}
                onSave={handleSave}
            />
        </div>
    );
}
