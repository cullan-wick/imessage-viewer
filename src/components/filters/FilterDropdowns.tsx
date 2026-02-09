'use client';

import clsx from 'clsx';

interface FilterDropdownsProps {
  direction: 'all' | 'sent' | 'received';
  onDirectionChange: (direction: 'all' | 'sent' | 'received') => void;
  hasAttachment: boolean | undefined;
  onHasAttachmentChange: (hasAttachment: boolean | undefined) => void;
  chatType: 'all' | 'group' | 'individual';
  onChatTypeChange: (chatType: 'all' | 'group' | 'individual') => void;
}

export function FilterDropdowns({
  direction,
  onDirectionChange,
  hasAttachment,
  onHasAttachmentChange,
  chatType,
  onChatTypeChange,
}: FilterDropdownsProps) {
  return (
    <div className="space-y-4">
      {/* Direction filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Direction
        </label>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="direction"
              value="all"
              checked={direction === 'all'}
              onChange={() => onDirectionChange('all')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">All messages</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="direction"
              value="sent"
              checked={direction === 'sent'}
              onChange={() => onDirectionChange('sent')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Sent only</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="direction"
              value="received"
              checked={direction === 'received'}
              onChange={() => onDirectionChange('received')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Received only</span>
          </label>
        </div>
      </div>

      {/* Attachment filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Attachments
        </label>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="attachment"
              checked={hasAttachment === undefined}
              onChange={() => onHasAttachmentChange(undefined)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Any</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="attachment"
              checked={hasAttachment === true}
              onChange={() => onHasAttachmentChange(true)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">With attachments</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="attachment"
              checked={hasAttachment === false}
              onChange={() => onHasAttachmentChange(false)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">No attachments</span>
          </label>
        </div>
      </div>

      {/* Chat type filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Chat Type
        </label>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="chatType"
              value="all"
              checked={chatType === 'all'}
              onChange={() => onChatTypeChange('all')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">All chats</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="chatType"
              value="individual"
              checked={chatType === 'individual'}
              onChange={() => onChatTypeChange('individual')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">1-on-1 only</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="chatType"
              value="group"
              checked={chatType === 'group'}
              onChange={() => onChatTypeChange('group')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Group chats only</span>
          </label>
        </div>
      </div>
    </div>
  );
}
