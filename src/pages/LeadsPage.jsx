import React, { useState, useEffect } from 'react';
import { useAPI } from '../hooks/useAPI';
import LeadsList from '../components/Leads/LeadsList';
import LeadProfile from '../components/Leads/LeadProfile';
import LeadModal from '../components/Leads/LeadModal';
import { useToast } from '../components/UI/Toast';

export default function LeadsPage() {
    const { request } = useAPI();
    const { addToast } = useToast();
    const [leads, setLeads] = useState([]);
    const [activeLead, setActiveLead] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadLeads = async () => {
        const res = await request('/leads?limit=100');
        if (res?.success) {
            setLeads(res.data || res.items || []);
        }
    };

    useEffect(() => {
        loadLeads();
    }, []);

    const handleSaveLead = async (updatedLead) => {
        const res = await request('/leads/update', 'PUT', updatedLead);
        if (res?.success) {
            const saved = res.data || updatedLead;
            setLeads(prev => prev.map(l => l.id === saved.id ? saved : l));
            setActiveLead(saved);
            setIsModalOpen(false);
            addToast('Lead salvo com sucesso');
        } else {
            addToast('Erro ao salvar lead');
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                <div className="lg:col-span-7 h-full min-h-[400px]">
                    <LeadsList
                        leads={leads}
                        activeId={activeLead?.id}
                        onSelect={setActiveLead}
                    />
                </div>
                <div className="lg:col-span-5 h-full min-h-[400px]">
                    <LeadProfile
                        lead={activeLead}
                        onEdit={() => setIsModalOpen(true)}
                    />
                </div>
            </div>

            <LeadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                lead={activeLead}
                onSave={handleSaveLead}
            />
        </div>
    );
}
