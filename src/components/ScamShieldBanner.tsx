import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Video, FileText, Lock, CheckCircle } from 'lucide-react';
import '../styles/monetization.css';

export const ScamShieldBanner: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  const handleBook = (serviceName: string) => {
    setSelectedService(serviceName);
    setBooked(true);
  };

  return (
    <div className="scam-shield-page">
      <div className="scam-hero-card">
        <div className="scam-badge">
          <AlertTriangle size={14} />
          <span>Zero-Tolerance for Rental Scams</span>
        </div>

        <h2 className="scam-hero-title">
          Halifax Rental <span style={{ color: 'var(--teal-400)' }}>Scam Shield</span>
        </h2>

        <p className="scam-hero-desc">
          Halifax has an extremely competitive rental market, making incoming Dalhousie, Saint Mary's, and international students prime targets for wire transfer fraud and fake landlord listings on Facebook & Kijiji. HfxRentals provides verified local safety layers before you send a single dollar.
        </p>

        {booked && (
          <div style={{ background: 'rgba(0, 168, 150, 0.2)', border: '1px solid var(--teal-500)', padding: '16px', borderRadius: 'var(--radius-md)', maxWidth: 500, margin: '0 auto 20px auto' }}>
            <CheckCircle size={32} color="var(--teal-400)" style={{ margin: '0 auto 6px auto' }} />
            <h4 style={{ color: '#ffffff' }}>Booking Request Received for {selectedService}!</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-200)', marginTop: 4 }}>
              Our Halifax campus coordinator will contact you in under 2 hours with payment details and inspector matching.
            </p>
          </div>
        )}
      </div>

      {/* Services Grid */}
      <div className="scam-services-grid">
        {/* Service 1: Remote Student Physical Inspection */}
        <div className="scam-service-card">
          <div className="scam-service-icon">
            <Video size={28} />
          </div>
          <h3 className="scam-service-title">In-Person Unit Inspection</h3>
          <div className="scam-service-price">$69 CAD</div>
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-400)', marginBottom: 16 }}>
            For students currently living outside Nova Scotia or overseas.
          </p>

          <ul className="scam-service-features">
            <li>A vetted Halifax university ambassador visits the address in person</li>
            <li>Live 1080p FaceTime or recorded 4K video walkthrough</li>
            <li>Checks water pressure, heating mini-split, window locks & cleanliness</li>
            <li>Confirms the landlord or building manager has physical keys</li>
          </ul>

          <button
            className="btn btn-primary"
            onClick={() => handleBook('In-Person Unit Inspection')}
          >
            Request Inspection ($69)
          </button>
        </div>

        {/* Service 2: Verified Renter Fast-Pass */}
        <div className="scam-service-card" style={{ borderColor: 'rgba(244, 162, 97, 0.4)' }}>
          <div className="scam-service-icon" style={{ background: 'rgba(244, 162, 97, 0.15)', color: 'var(--amber-500)' }}>
            <FileText size={28} />
          </div>
          <h3 className="scam-service-title">Verified Renter Fast-Pass™</h3>
          <div className="scam-service-price">$19 CAD <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>one-time</span></div>
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-400)', marginBottom: 16 }}>
            Bypass the 50-message flood. Stand out to legitimate landlords instantly.
          </p>

          <ul className="scam-service-features">
            <li>Soft Equifax credit verification (doesn't hurt your credit score)</li>
            <li>Dal / SMU / MSVU student status email verification</li>
            <li>Proof of income / guarantor letter pre-approval</li>
            <li>Sharable 1-page secure link for all Halifax applications</li>
          </ul>

          <button
            className="btn btn-accent"
            onClick={() => handleBook('Verified Renter Fast-Pass')}
          >
            Get Fast-Pass™ ($19)
          </button>
        </div>

        {/* Service 3: Land Title & Ownership Audit */}
        <div className="scam-service-card">
          <div className="scam-service-icon">
            <Lock size={28} />
          </div>
          <h3 className="scam-service-title">Property Registry Audit</h3>
          <div className="scam-service-price">$39 CAD</div>
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-400)', marginBottom: 16 }}>
            Absolute certainty before sending a standard 1/2 month security deposit.
          </p>

          <ul className="scam-service-features">
            <li>Official Nova Scotia Land Registry database cross-check</li>
            <li>Verification that the individual listing the flat actually owns it</li>
            <li>Checks for pending municipal HRM code violations or disputes</li>
            <li>Official audit certificate issued in 4 business hours</li>
          </ul>

          <button
            className="btn btn-secondary"
            onClick={() => handleBook('Property Registry Audit')}
          >
            Order Land Audit ($39)
          </button>
        </div>
      </div>

      {/* Red Flags Guide */}
      <div className="red-flags-card">
        <h3 className="red-flags-title">
          <ShieldCheck size={24} />
          4 Common Halifax Rental Red Flags to Avoid
        </h3>

        <div className="red-flags-grid">
          <div className="red-flag-item">
            <div className="red-flag-heading">1. Demanding an e-Transfer before viewing</div>
            <div className="red-flag-desc">
              Never send a security deposit or "holding fee" before you or a designated proxy physically inspects the interior of the apartment.
            </div>
          </div>

          <div className="red-flag-item">
            <div className="red-flag-heading">2. The "Missionary / Overseas" Landlord Story</div>
            <div className="red-flag-desc">
              Scammers often claim they purchased a luxury flat for their son at Dalhousie who dropped out, and they are currently abroad so keys must be mailed.
            </div>
          </div>

          <div className="red-flag-item">
            <div className="red-flag-heading">3. Excessively below market rent</div>
            <div className="red-flag-desc">
              A 2-bedroom luxury flat on Spring Garden Road or South Street for $1,000/mo is virtually guaranteed to be a copied listing from a sold real estate ad.
            </div>
          </div>

          <div className="red-flag-item">
            <div className="red-flag-heading">4. Illegal Security Deposit Amounts</div>
            <div className="red-flag-desc">
              Under the Nova Scotia Residential Tenancies Act, the maximum legal security deposit is <strong>1/2 of one month's rent</strong>. Asking for first and last month upfront as a deposit is illegal in NS.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
