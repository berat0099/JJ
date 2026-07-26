import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CreditCard, Building2, Clock, CheckCircle2, XCircle, AlertCircle, Receipt } from 'lucide-react';

interface PaymentHistoryTableProps {
  userEmail: string;
}

export interface PaymentRecord {
  id: string;
  type: 'card' | 'bank';
  amount: number | string;
  currency?: string;
  orderCode?: string;
  transactionId?: string;
  methodName: string;
  status: 'approved' | 'pending' | 'rejected' | 'completed';
  createdAt: string;
  senderName?: string;
  transferNote?: string;
}

export const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({ userEmail }) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) {
      setPayments([]);
      setIsLoading(false);
      return;
    }

    const cleanEmail = userEmail.trim().toLowerCase();
    let cardList: PaymentRecord[] = [];
    let bankList: PaymentRecord[] = [];

    // Subscribe to Card Transactions
    const txnRef = collection(db, 'transactions');
    const unsubCard = onSnapshot(txnRef, (snapshot) => {
      const records: PaymentRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if ((data.userEmail || '').trim().toLowerCase() === cleanEmail) {
          records.push({
            id: docSnap.id,
            type: 'card',
            amount: data.amount || 0,
            currency: data.currency || '₺',
            transactionId: data.transactionId || docSnap.id,
            methodName: 'Kredi / Banka Kartı (3D Secure)',
            status: 'completed',
            createdAt: data.createdAt || new Date().toISOString(),
          });
        }
      });
      cardList = records;
      combineAndSort();
    }, (err) => {
      console.warn('Card transactions fetch error:', err);
      setIsLoading(false);
    });

    // Subscribe to Bank Transfers
    const bankRef = collection(db, 'bank_transfers');
    const unsubBank = onSnapshot(bankRef, (snapshot) => {
      const records: PaymentRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if ((data.userEmail || '').trim().toLowerCase() === cleanEmail) {
          records.push({
            id: docSnap.id,
            type: 'bank',
            amount: data.amount || 0,
            currency: data.currency || '₺',
            orderCode: data.orderCode || '-',
            methodName: `Havale / EFT (${data.bank || 'Banka'})`,
            status: data.status || 'pending',
            createdAt: data.createdAt || new Date().toISOString(),
            senderName: data.senderName,
            transferNote: data.transferNote
          });
        }
      });
      bankList = records;
      combineAndSort();
    }, (err) => {
      console.warn('Bank transfers fetch error:', err);
      setIsLoading(false);
    });

    function combineAndSort() {
      const all = [...cardList, ...bankList];
      all.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setPayments(all);
      setIsLoading(false);
    }

    return () => {
      unsubCard();
      unsubBank();
    };
  }, [userEmail]);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Clock className="w-4 h-4 animate-spin text-purple-400" />
        <span>Ödeme geçmişiniz yükleniyor...</span>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
          <Receipt className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Henüz Ödeme Kaydı Bulunmuyor</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Satın aldığınız Pro üyelikler, kredi kartı ödemeleri ve havale bildirimleriniz burada listelenecektir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-slate-300">İşlem ve Ödeme Kayıtlarınız ({payments.length})</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60">
        <table className="w-full text-left text-xs text-slate-300">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-bold bg-white/5">
              <th className="p-3">Tarih</th>
              <th className="p-3">Ödeme Yöntemi</th>
              <th className="p-3">Referans / Sipariş No</th>
              <th className="p-3">Tutar</th>
              <th className="p-3 text-right">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="p-3 text-slate-400 text-[11px] font-medium whitespace-nowrap">
                  {p.createdAt ? new Date(p.createdAt).toLocaleString('tr-TR') : '-'}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    {p.type === 'card' ? (
                      <CreditCard className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span>{p.methodName}</span>
                  </div>
                  {p.senderName && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">Gönderen: {p.senderName}</span>
                  )}
                </td>
                <td className="p-3 font-mono text-[11px] text-amber-300">
                  {p.orderCode || p.transactionId || '-'}
                </td>
                <td className="p-3 font-black text-emerald-400 text-sm">
                  {p.amount} {p.currency || '₺'}
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  {(p.status === 'completed' || p.status === 'approved') && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Onaylandı</span>
                    </span>
                  )}
                  {p.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30 animate-pulse">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>Onay Bekliyor</span>
                    </span>
                  )}
                  {p.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold border border-rose-500/30">
                      <XCircle className="w-3 h-3 text-rose-400" />
                      <span>Reddedildi</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
