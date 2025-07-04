
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, X } from 'lucide-react';

interface NotificationRow {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  data: any;
}

interface NotificationsDialogProps {
  notifications: NotificationRow[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
  onApproveTransfer?: (transferId: string) => void;
  onRejectTransfer?: (transferId: string) => void;
  onApproveReturn?: (returnId: string) => void;
  onRejectReturn?: (returnId: string) => void;
}

const NotificationsDialog: React.FC<NotificationsDialogProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onRemove,
  onApproveTransfer,
  onRejectTransfer,
  onApproveReturn,
  onRejectReturn
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-white border-blue-500 text-blue-600 hover:bg-blue-50 relative"
        >
          <Bell className="h-3 w-3" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white max-w-md max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No notifications</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'} relative`}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => onRemove(notification.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div onClick={() => onMarkAsRead(notification.id)}>
                  <p className="text-sm font-medium pr-6">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                  
                  {notification.type === 'transfer_request' && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onApproveTransfer && notification.data?.transfer_id) {
                            onApproveTransfer(notification.data.transfer_id);
                          }
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
                          if (onRejectTransfer && notification.data?.transfer_id) {
                            onRejectTransfer(notification.data.transfer_id);
                          }
                        }}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {notification.type === 'return_request' && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onApproveReturn && notification.data?.return_id) {
                            onApproveReturn(notification.data.return_id);
                          }
                        }}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onRejectReturn && notification.data?.return_id) {
                            onRejectReturn(notification.data.return_id);
                          }
                        }}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsDialog;
