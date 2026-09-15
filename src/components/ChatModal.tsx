import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { RentalListing, SubletListing, ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { X, Send, MapPin, Sparkles, Clock, CheckCheck, Lock, User, Users, MessageSquare } from 'lucide-react';
import '../styles/modal.css';

interface ChatModalProps {
  listing: RentalListing | SubletListing;
  onClose: () => void;
  onOpenViewingScheduler?: (listing: RentalListing | SubletListing) => void;
}

const QUICK_PROMPTS = [
  '🔥 Is heat & hot water included in rent?',
  '🚗 Is driveway/off-street parking available for the winter ban?',
  '📹 Can we schedule a live video walkthrough (Google Meet)?',
  '🐾 Are cats or small pets permitted?'
];

export const ChatModal: React.FC<ChatModalProps> = ({
  listing,
  onClose,
  onOpenViewingScheduler
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isRental = 'price' in listing;
  const price = isRental ? (listing as RentalListing).price : (listing as SubletListing).subletPrice;
  const listerName = isRental ? (listing as RentalListing).landlord.name : (listing as SubletListing).lister.name;
  const listerAvatar = isRental ? (listing as RentalListing).landlord.avatar : (listing as SubletListing).lister.avatar;
  const listerResponse = isRental ? (listing as RentalListing).landlord.responseRate : 'Under 2 hours';
  const landlordId = listing.userId || 'landlord-owner';

  // Determine current active role view
  const isActualLandlord = user?.id ? user.id === listing.userId : false;
  const [activeRoleView, setActiveRoleView] = useState<'tenant' | 'landlord'>(
    isActualLandlord ? 'landlord' : 'tenant'
  );

  // Tenant identity: logged in user or local demo tenant
  const currentTenantId = user && user.id !== landlordId ? user.id : 'tenant-alex-dal';
  const currentTenantName = user && user.id !== landlordId ? user.name : 'Alex (Dal Student)';

  // For landlord view: which tenant's private conversation is selected
  const [selectedTenantId, setSelectedTenantId] = useState<string>(currentTenantId);

  // Storage key for this listing's private conversations
  const storageKey = `hfx_private_msgs_${listing.id}`;

  // Load existing messages
  useEffect(() => {
    const localSaved = localStorage.getItem(storageKey);
    let initialList: ChatMessage[] = [];

    if (localSaved) {
      try {
        initialList = JSON.parse(localSaved);
      } catch (e) {
        console.error('Failed to parse private chat history', e);
      }
    } else {
      // Seed a realistic private inquiry thread for demonstration
      initialList = [
        {
          id: `seed-1-${listing.id}`,
          listingId: listing.id,
          tenantId: 'tenant-alex-dal',
          tenantName: 'Alex (Dal Student)',
          senderId: 'landlord',
          senderName: listerName,
          receiverId: 'tenant-alex-dal',
          content: `Hi Alex! Thanks for reaching out about ${listing.title}. What questions can I answer for you?`,
          createdAt: '11:15 AM',
          isRead: true
        },
        {
          id: `seed-2-${listing.id}`,
          listingId: listing.id,
          tenantId: 'tenant-alex-dal',
          tenantName: 'Alex (Dal Student)',
          senderId: 'tenant-alex-dal',
          senderName: 'Alex (Dal Student)',
          receiverId: landlordId,
          content: `Hi! Is heat and hot water included in the monthly rent? Also is there parking during the HRM winter ban?`,
          createdAt: '11:18 AM',
          isRead: true
        },
        {
          id: `seed-3-${listing.id}`,
          listingId: listing.id,
          tenantId: 'tenant-sarah-smu',
          tenantName: 'Sarah M. (SMU Renter)',
          senderId: 'tenant-sarah-smu',
          senderName: 'Sarah M. (SMU Renter)',
          receiverId: landlordId,
          content: `Hello! Would it be possible to schedule a live Google Meet video walkthrough tomorrow afternoon?`,
          createdAt: '12:05 PM',
          isRead: true
        }
      ];
      localStorage.setItem(storageKey, JSON.stringify(initialList));
    }
    setMessages(initialList);

    // Fetch from Supabase if configured
    const client = supabase;
    if (client) {
      const fetchSupabaseMessages = async () => {
        try {
          const { data, error } = await client
            .from('messages')
            .select('*')
            .eq('listing_id', listing.id)
            .order('created_at', { ascending: true });

          if (!error && data && data.length > 0) {
            const mapped: ChatMessage[] = data.map((d: any) => ({
              id: d.id,
              listingId: d.listing_id,
              tenantId: d.tenant_id || d.sender_id,
              tenantName: d.tenant_name || d.sender_name,
              senderId: d.sender_id,
              senderName: d.sender_name,
              receiverId: d.receiver_id,
              content: d.content,
              createdAt: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isRead: d.is_read
            }));
            setMessages(mapped);
          }
        } catch (err) {
          console.warn('Fallback to local private messages', err);
        }
      };

      fetchSupabaseMessages();

      const channel = client
        .channel(`private_chat_${listing.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `listing_id=eq.${listing.id}` },
          (payload: any) => {
            const newMsg: ChatMessage = {
              id: payload.new.id,
              listingId: payload.new.listing_id,
              tenantId: payload.new.tenant_id || payload.new.sender_id,
              tenantName: payload.new.tenant_name || payload.new.sender_name,
              senderId: payload.new.sender_id,
              senderName: payload.new.sender_name,
              receiverId: payload.new.receiver_id,
              content: payload.new.content,
              createdAt: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isRead: payload.new.is_read
            };
            setMessages((prev) => [...prev, newMsg]);
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, [listing.id, listerName, landlordId, storageKey]);

  // List of all distinct tenants who have messaged about this listing (for Landlord View)
  const tenantInquiries = useMemo(() => {
    const map = new Map<string, { tenantId: string; tenantName: string; lastMessage: string; lastTime: string }>();
    messages.forEach((m) => {
      map.set(m.tenantId, {
        tenantId: m.tenantId,
        tenantName: m.tenantName,
        lastMessage: m.content,
        lastTime: m.createdAt
      });
    });
    return Array.from(map.values());
  }, [messages]);

  // Determine active conversation tenant ID
  const activeConversationTenantId = activeRoleView === 'tenant' ? currentTenantId : selectedTenantId;
  const activeConversationTenantName =
    activeRoleView === 'tenant'
      ? currentTenantName
      : tenantInquiries.find((t) => t.tenantId === selectedTenantId)?.tenantName || 'Tenant';

  // Filter messages for ONLY the active private conversation
  const activeConversationMessages = useMemo(() => {
    return messages.filter((m) => m.tenantId === activeConversationTenantId);
  }, [messages, activeConversationTenantId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationMessages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const isSendingAsLandlord = activeRoleView === 'landlord';
    const senderId = isSendingAsLandlord ? landlordId : activeConversationTenantId;
    const senderName = isSendingAsLandlord ? listerName : activeConversationTenantName;
    const receiverId = isSendingAsLandlord ? activeConversationTenantId : landlordId;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      listingId: listing.id,
      tenantId: activeConversationTenantId,
      tenantName: activeConversationTenantName,
      senderId,
      senderName,
      receiverId,
      content: text,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setInputText('');
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Persist to Supabase if connected
    const client = supabase;
    if (client) {
      setIsSubmitting(true);
      try {
        await client.from('messages').insert({
          listing_id: listing.id,
          tenant_id: activeConversationTenantId,
          tenant_name: activeConversationTenantName,
          sender_id: senderId,
          receiver_id: receiverId,
          sender_name: senderName,
          content: text
        });
      } catch (err) {
        console.warn('Saved message locally (Supabase unavailable)', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content chat-modal-content private-chat-layout" onClick={(e) => e.stopPropagation()}>
        {/* Top Control Bar */}
        <div className="chat-modal-header">
          <div className="chat-header-lister">
            <div className="chat-avatar-wrapper">
              <img
                src={activeRoleView === 'tenant' ? listerAvatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt="Profile"
                className="chat-lister-avatar"
              />
              <span className="online-indicator" title="Online" />
            </div>
            <div>
              <div className="chat-lister-name-row">
                <span className="chat-lister-name">
                  {activeRoleView === 'tenant' ? `Private Chat with ${listerName}` : `Inquiries for ${listing.title}`}
                </span>
                <span className="badge badge-teal" style={{ fontSize: '0.7rem', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Lock size={10} /> 1-on-1 Private
                </span>
              </div>
              <div className="chat-lister-meta">
                <Clock size={11} />
                <span>
                  {activeRoleView === 'tenant' ? `Landlord replies ${listerResponse}` : `${tenantInquiries.length} Active Tenant Inquiries`}
                </span>
              </div>
            </div>
          </div>

          <div className="chat-header-actions">
            {/* Role Switcher Toggle */}
            <div className="chat-role-switcher" title="Toggle between Tenant and Landlord view to test private chats">
              <button
                type="button"
                className={`role-tab ${activeRoleView === 'tenant' ? 'active' : ''}`}
                onClick={() => setActiveRoleView('tenant')}
              >
                <User size={13} />
                <span>Tenant View</span>
              </button>
              <button
                type="button"
                className={`role-tab ${activeRoleView === 'landlord' ? 'active' : ''}`}
                onClick={() => setActiveRoleView('landlord')}
              >
                <Users size={13} />
                <span>Landlord View ({tenantInquiries.length})</span>
              </button>
            </div>

            {onOpenViewingScheduler && activeRoleView === 'tenant' && (
              <button
                className="btn btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                onClick={() => {
                  onClose();
                  onOpenViewingScheduler(listing);
                }}
              >
                📅 Schedule Viewing
              </button>
            )}

            <button className="modal-close-btn" onClick={onClose} aria-label="Close Chat">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Listing Mini Context Bar */}
        <div className="chat-listing-context">
          <img src={listing.images[0]} alt={listing.title} className="chat-listing-thumb" />
          <div className="chat-listing-details">
            <h4 className="chat-listing-title">{listing.title}</h4>
            <div className="chat-listing-sub">
              <MapPin size={12} />
              <span>{listing.neighborhood}</span>
              <span className="bullet">•</span>
              <strong style={{ color: 'var(--teal-400)' }}>${price.toLocaleString()} CAD/mo</strong>
            </div>
          </div>
          <div className="private-security-pill">
            <Lock size={12} color="var(--amber-400)" />
            <span>End-to-End Private Chat</span>
          </div>
        </div>

        {/* Dual Panel Body for Landlord vs Tenant */}
        <div className="private-chat-body-container">
          {/* Left Panel: Tenant Inquiries List (Only visible in Landlord View) */}
          {activeRoleView === 'landlord' && (
            <aside className="chat-inquiries-sidebar">
              <div className="inquiries-sidebar-header">
                <MessageSquare size={14} color="var(--teal-400)" />
                <span>Prospective Tenants</span>
              </div>
              <div className="inquiries-sidebar-list">
                {tenantInquiries.length > 0 ? (
                  tenantInquiries.map((inq) => (
                    <div
                      key={inq.tenantId}
                      className={`inquiry-tenant-item ${selectedTenantId === inq.tenantId ? 'active' : ''}`}
                      onClick={() => setSelectedTenantId(inq.tenantId)}
                    >
                      <div className="inquiry-tenant-avatar">
                        <User size={16} />
                      </div>
                      <div className="inquiry-tenant-info">
                        <div className="inquiry-tenant-name">{inq.tenantName}</div>
                        <div className="inquiry-tenant-snippet">{inq.lastMessage}</div>
                      </div>
                      <div className="inquiry-tenant-time">{inq.lastTime}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.8rem' }}>
                    No tenant inquiries yet.
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* Main Chat Thread Pane */}
          <main className="chat-main-thread-pane">
            {/* Confidentiality Alert Banner */}
            <div className="chat-privacy-banner">
              <Lock size={13} color="var(--teal-400)" />
              <span>
                Private conversation between <strong>{activeConversationTenantName}</strong> and Landlord <strong>{listerName}</strong>. Other tenants cannot see this thread.
              </span>
            </div>

            {/* Messages Stream */}
            <div className="chat-messages-stream">
              {activeConversationMessages.length > 0 ? (
                activeConversationMessages.map((msg) => {
                  const isCurrentRoleSender =
                    (activeRoleView === 'tenant' && msg.senderId === activeConversationTenantId) ||
                    (activeRoleView === 'landlord' && msg.senderId === landlordId);

                  return (
                    <div key={msg.id} className={`chat-message-row ${isCurrentRoleSender ? 'outgoing' : 'incoming'}`}>
                      {!isCurrentRoleSender && (
                        <div className="chat-bubble-avatar-wrapper">
                          <img
                            src={activeRoleView === 'tenant' ? listerAvatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                            alt={msg.senderName}
                            className="chat-bubble-avatar"
                          />
                        </div>
                      )}
                      <div className="chat-bubble-wrapper">
                        <div className="chat-sender-name">
                          {isCurrentRoleSender ? 'You' : msg.senderName}
                        </div>
                        <div className="chat-bubble-text">{msg.content}</div>
                        <div className="chat-bubble-time">
                          <span>{msg.createdAt}</span>
                          {isCurrentRoleSender && <CheckCheck size={13} color="var(--teal-400)" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.88rem' }}>
                  👋 Start the private conversation with {activeRoleView === 'tenant' ? listerName : activeConversationTenantName}.
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts (Only shown for tenants) */}
            {activeRoleView === 'tenant' && (
              <div className="chat-quick-prompts">
                <div className="quick-prompts-label">
                  <Sparkles size={12} color="var(--amber-400)" />
                  <span>Quick Halifax questions:</span>
                </div>
                <div className="quick-prompts-strip">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="quick-prompt-chip"
                      onClick={() => handleSendMessage(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form
              className="chat-input-bar"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                type="text"
                className="chat-text-input"
                placeholder={
                  activeRoleView === 'tenant'
                    ? `Message ${listerName} privately... (Press Enter to send)`
                    : `Reply privately to ${activeConversationTenantName}...`
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting}
                autoFocus
              />
              <button
                type="submit"
                className="btn btn-primary chat-send-btn"
                disabled={!inputText.trim() || isSubmitting}
              >
                <Send size={15} />
                <span>Send</span>
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};
