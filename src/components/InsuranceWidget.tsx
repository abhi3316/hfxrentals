import React, { useState } from 'react';
import { Shield, ExternalLink, CheckCircle } from 'lucide-react';
import '../styles/monetization.css';

export const InsuranceWidget: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handlePartnerClick = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <aside className="insurance-banner" aria-label="Tenant Insurance Partner">
      <div className="insurance-left">
        <div className="insurance-icon-box">
          <Shield size={26} />
        </div>
        <div>
          <div className="insurance-title">
            Moving soon? Most Halifax landlords require Proof of Tenant Insurance.
          </div>
          <p className="insurance-desc">
            Protect your belongings and satisfy your NS Standard Lease requirement in under 3 minutes with our Canadian digital partner. Plans start at just $14.50/month.
          </p>
        </div>
      </div>

      <button
        className="insurance-btn"
        onClick={handlePartnerClick}
      >
        {copied ? (
          <>
            <CheckCircle size={16} />
            <span>Discount Applied!</span>
          </>
        ) : (
          <>
            <span>Get Instant Policy</span>
            <ExternalLink size={16} />
          </>
        )}
      </button>
    </aside>
  );
};
