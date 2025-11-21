import React from 'react';
import Card, { CardHeader, CardBody } from '../UI/Card';
import Button from '../UI/Button';
import { RefreshCw, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';

export default function ConnectionStatus({ status, qr, onRefresh, loading }) {
    const isOnline = status === 'online';

    return (
        <Card glow={isOnline} className="max-w-3xl mx-auto">
            <CardHeader>
                <span>Conexão WhatsApp</span>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full border-2 border-[var(--card-border)] ${isOnline ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-[var(--muted)]'}`} />
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-soft)] border border-[var(--card-border)] text-xs font-bold">
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
            </CardHeader>
            <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* QR Code Area */}
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="relative w-full max-w-[300px] aspect-square rounded-[20px] border-2 border-[var(--card-border)] bg-[var(--bg-soft)] overflow-hidden flex items-center justify-center shadow-inner">
                            {isOnline ? (
                                <div className="flex flex-col items-center gap-4 text-green-500 animate-in zoom-in duration-500">
                                    <CheckCircle size={64} />
                                    <span className="font-bold text-lg text-center">WhatsApp Conectado!</span>
                                </div>
                            ) : qr ? (
                                <img src={qr} alt="QR Code" className="w-full h-full object-cover animate-in fade-in duration-300" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-[var(--muted)]">
                                    <Smartphone size={48} className="opacity-50" />
                                    <span className="text-sm">Aguardando QR Code...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions & Instructions */}
                    <div className="flex flex-col gap-6">
                        {!isOnline && (
                            <Button onClick={onRefresh} disabled={loading} variant="secondary" className="w-full">
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                {loading ? 'Atualizando...' : 'Atualizar QR Code'}
                            </Button>
                        )}

                        <div className="p-5 rounded-2xl bg-[var(--bg-soft)] border border-[var(--card-border)]">
                            <h4 className="font-bold mb-3 flex items-center gap-2">
                                <Smartphone size={18} />
                                Como Conectar
                            </h4>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--muted)] marker:font-bold marker:text-[var(--accent-solid)]">
                                <li>Abra o WhatsApp no seu telefone</li>
                                <li>Toque em <strong>Mais opções</strong> (⋮) e depois <strong>Aparelhos conectados</strong></li>
                                <li>Toque em <strong>Conectar um aparelho</strong></li>
                                <li>Aponte a câmera para o QR code ao lado</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
