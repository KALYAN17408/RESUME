import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { CertificationItem } from '../../types/resume.types';
import { Plus, Trash2, Award } from 'lucide-react';

interface CertificationsFormProps {
  certifications: CertificationItem[];
  onAdd: () => void;
  onUpdate: (id: string, partial: Partial<CertificationItem>) => void;
  onDelete: (id: string) => void;
}

export const CertificationsForm: React.FC<CertificationsFormProps> = ({
  certifications,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Certifications & Licenses</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cloud, security, and specialized professional certifications.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onAdd}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Certification
        </Button>
      </div>

      {certifications.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">No certifications added</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Add vendor certifications such as AWS Solutions Architect or CKA.
            </p>
          </div>
          <Button size="sm" variant="primary" onClick={onAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Certification
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  {cert.name || 'Certification Name'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remove certification "${cert.name || 'this certification'}"?`)) {
                      onDelete(cert.id);
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete certification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Certification Name"
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={cert.name}
                  onChange={(e) => onUpdate(cert.id, { name: e.target.value })}
                />
                <Input
                  label="Issuing Organization"
                  placeholder="e.g. Amazon Web Services (AWS)"
                  value={cert.issuer}
                  onChange={(e) => onUpdate(cert.id, { issuer: e.target.value })}
                />
                <Input
                  label="Issue Date"
                  placeholder="YYYY-MM (e.g. 2023-04)"
                  value={cert.issueDate}
                  onChange={(e) => onUpdate(cert.id, { issueDate: e.target.value })}
                />
                <Input
                  label="Expiry Date (Optional)"
                  placeholder="YYYY-MM (e.g. 2026-04)"
                  value={cert.expiryDate || ''}
                  onChange={(e) => onUpdate(cert.id, { expiryDate: e.target.value })}
                />
              </div>

              <Input
                label="Credential Verification URL (Optional)"
                placeholder="https://..."
                value={cert.credentialUrl || ''}
                onChange={(e) => onUpdate(cert.id, { credentialUrl: e.target.value })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
