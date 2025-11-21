import React, { useState, useEffect, useCallback } from 'react';
import { useAPI } from '../hooks/useAPI';
import ConnectionStatus from '../components/WhatsApp/ConnectionStatus';
import { useToast } from '../components/UI/Toast';

export default function WhatsAppPage() {
    const { request } = useAPI();
    const { addToast } = useToast();
    const [status, setStatus] = useState('offline');
    const [qr, setQr] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkStatus = useCallback(async () => {
        const res = await request('/whatsapp/status');
        if (res?.success) {
            setStatus(res.data?.status || res.status || 'offline');
        }
    }, [request]);

    const refreshQR = async () => {
        setLoading(true);
        const res = await request('/whatsapp/refresh-qr', 'POST');
        if (res?.success) {
            if (res.data?.qr) setQr(res.data.qr);
            addToast('QR Code atualizado');
            checkStatus();
        } else {
            addToast('Falha ao atualizar QR Code');
        }
        setLoading(false);
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, [checkStatus]);

    useEffect(() => {
        if (status === 'offline' && !qr) {
            refreshQR();
        }
    }, [status]);

    return (
        <div className="animate-in fade-in duration-500 py-10">
            <ConnectionStatus
                status={status}
                qr={qr}
                onRefresh={refreshQR}
                loading={loading}
            />
        </div>
    );
}
