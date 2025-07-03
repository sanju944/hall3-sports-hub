import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Bell, Check, X, ArrowRight } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  data: any;
  created_at: string;
}

interface TransferRequest {
  id: string;
  item_id: string;
  item_name: string;
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  to_user_name: string;
  status: string;
  notes?: string;
  request_date: string;
}

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Notification[];
  transferRequests: TransferRequest[];
  currentUser: { id: string; name: string; rollNumber: string } | null;
  onApproveTransfer: (transferId: string) => Promise<void>;
  onRejectTransfer: (transferId: string) => Promise<void>;
  onMarkAsRead: (notificationId: string) => Promise<void>;
}

const NotificationsDialog: React.FC<NotificationsDialogProps> = ({
  open,
  onOpenChange,
  notifications,
  transferRequests,
  currentUser,
  onApproveTransfer,
  onRejectTransfer,
  onMarkAsRead
}) => {
  const { toast } = useToast();

  // Get pending transfer requests for current user
  const pendingTransfers = transferRequests.filter(
    req => req.to_user_id === currentUser?.rollNumber && req.status === 'pending'
  );

  const handleApprove = async (transferId: string) => {
    try {
      await onApproveTransfer(transferId);
      toast({
        title: "Transfer Approved",
        description: "The transfer request has been approved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve transfer request.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (transferId: string) => {
    try {
      await onRejectTransfer(transferId);
      toast({
        title: "Transfer Rejected",
        description: "The transfer request has been rejected.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject transfer request.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-blue-600 flex items-center justify-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transfer Requests */}
          {pendingTransfers.length > 0 && (
            <div>
              <h3 className="font-medium text-lg mb-2">Transfer Requests</h3>
              <div className="space-y-2">
                {pendingTransfers.map((transfer) => (
                  <Card key={transfer.id} className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <ArrowRight className="h-4 w-4 text-orange-600" />
                            <span className="font-medium">{transfer.item_name}</span>
                            <Badge variant="secondary">Transfer Request</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            From: <strong>{transfer.from_user_name}</strong>
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            Date: {transfer.request_date}
                          </p>
                          {transfer.notes && (
                            <p className="text-sm text-gray-600 mb-2">
                              Notes: {transfer.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(transfer.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(transfer.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Other Notifications */}
          {notifications.length > 0 && (
            <div>
              <h3 className="font-medium text-lg mb-2">Other Notifications</h3>
              <div className="space-y-2">
                {notifications.slice(0, 10).map((notification) => (
                  <Card key={notification.id} className={notification.read ? 'opacity-60' : ''}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onMarkAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {pendingTransfers.length === 0 && notifications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsDialog;
