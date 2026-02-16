'use client';

interface FilterDropdownsProps {
  direction: 'all' | 'sent' | 'received';
  onDirectionChange: (direction: 'all' | 'sent' | 'received') => void;
  hasAttachment: boolean | undefined;
  onHasAttachmentChange: (hasAttachment: boolean | undefined) => void;
  chatType: 'all' | 'group' | 'individual';
  onChatTypeChange: (chatType: 'all' | 'group' | 'individual') => void;
}

function RadioOption({ name, value, checked, onChange, label }: {
  name: string; value: string; checked: boolean; onChange: () => void; label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer py-0.5">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="w-3.5 h-3.5 accent-[var(--accent)]"
      />
      <span className="text-xs" style={{ color: 'var(--foreground)' }}>{label}</span>
    </label>
  );
}

export function FilterDropdowns({
  direction, onDirectionChange,
  hasAttachment, onHasAttachmentChange,
  chatType, onChatTypeChange,
}: FilterDropdownsProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Direction</label>
        <div className="space-y-1">
          <RadioOption name="direction" value="all" checked={direction === 'all'} onChange={() => onDirectionChange('all')} label="All messages" />
          <RadioOption name="direction" value="sent" checked={direction === 'sent'} onChange={() => onDirectionChange('sent')} label="Sent only" />
          <RadioOption name="direction" value="received" checked={direction === 'received'} onChange={() => onDirectionChange('received')} label="Received only" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Attachments</label>
        <div className="space-y-1">
          <RadioOption name="attachment" value="any" checked={hasAttachment === undefined} onChange={() => onHasAttachmentChange(undefined)} label="Any" />
          <RadioOption name="attachment" value="with" checked={hasAttachment === true} onChange={() => onHasAttachmentChange(true)} label="With attachments" />
          <RadioOption name="attachment" value="without" checked={hasAttachment === false} onChange={() => onHasAttachmentChange(false)} label="Without attachments" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Chat Type</label>
        <div className="space-y-1">
          <RadioOption name="chatType" value="all" checked={chatType === 'all'} onChange={() => onChatTypeChange('all')} label="All chats" />
          <RadioOption name="chatType" value="individual" checked={chatType === 'individual'} onChange={() => onChatTypeChange('individual')} label="1-on-1 only" />
          <RadioOption name="chatType" value="group" checked={chatType === 'group'} onChange={() => onChatTypeChange('group')} label="Group chats only" />
        </div>
      </div>
    </div>
  );
}
