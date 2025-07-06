
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, X, ArrowRightLeft } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];
type TransferRequestRow = Database['public']['Tables']['transfer_requests']['Row'];

interface TransferNotificationsProps {
  notifications: NotificationRow[];
  transferRequests: TransferRequestRow[];
  currentUser: { rollNumber: string; name: string } | null;
  onApproveTransfer: (transferId: string) => void;
  onRejectTransfer: (transferId: string) => void;
  onMarkAsRead: (notificationId: string) => void;
  onRemoveNotification: (notificationId: string) => void;
}

const TransferNotifications: React.FC<TransferNotificationsProps> = ({
  notifications,
  transferRequests,
  currentUser,
  onApproveTransfer,
  onRejectTransfer,
  onMarkAsRead,
  onRemoveNotification
}) => {
  // Filter notifications for current user's transfer requests
  const userTransferNotifications = notifications.filter(notification => 
    notification.type === 'transfer_request' && 
    notification.data && 
    typeof notification.data === 'object' && 
    'to_user_id' in notification.data && 
    notification.data.to_user_id === currentUser?.rollNumber
  );

  const unreadCount = userTransferNotifications.filter(n => !n.read).length;

  if (!currentUser) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-white border-orange-500 text-orange-600 hover:bg-orange-50 relative"
        >
          <ArrowRightLeft className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white max-w-md max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transfer Requests
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {userTransferNotifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No transfer requests</p>
          ) : (
            userTransferNotifications.map((notification) => {
              const transferRequest = transferRequests.find(tr => 
                notification.data && 
                typeof notification.data === 'object' && 
                'transfer_id' in notification.data && 
                tr.id === notification.data.transfer_id
              );

              return (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${notification.read ? 'bg-gray-50' : 'bg-orange-50 border-orange-200'} relative`}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => onRemoveNotification(notification.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div onClick={() => onMarkAsRead(notification.id)}>
                    <p className="text-sm font-medium pr-6">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                    {transferRequest && transferRequest.status === 'pending' && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onApproveTransfer(transferRequest.id);
                          }}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRejectTransfer(transferRequest.id);
                          }}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {transferRequest && transferRequest.status !== 'pending' && (
                      <Badge 
                        variant={transferRequest.status === 'approved' ? 'default' : 'destructive'}
                        className="mt-2"
                      >
                        {transferRequest.status.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferNotifications;
