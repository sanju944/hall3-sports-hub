
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from 'lucide-react';

interface User {
  id: string;
  rollNumber: string;
  name: string;
  phoneNumber: string;
  roomNumber: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  available: number;
}

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  currentUser: User;
  users: User[];
  onTransfer: (itemId: string, itemName: string, fromUserId: string, fromUserName: string, toUserId: string, toUserName: string, notes?: string) => Promise<void>;
}

const TransferDialog: React.FC<TransferDialogProps> = ({
  open,
  onOpenChange,
  item,
  currentUser,
  users,
  onTransfer
}) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleTransfer = async () => {
    if (!item || !selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user to transfer to.",
        variant: "destructive",
      });
      return;
    }

    const selectedUser = users.find(u => u.id === selectedUserId);
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Selected user not found.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onTransfer(
        item.id,
        item.name,
        currentUser.id,
        currentUser.name,
        selectedUser.id,
        selectedUser.name,
        notes
      );

      toast({
        title: "Transfer Request Sent",
        description: `Transfer request for ${item.name} sent to ${selectedUser.name}.`,
      });

      setSelectedUserId('');
      setNotes('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send transfer request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-blue-600 flex items-center justify-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Transfer Item
          </DialogTitle>
        </DialogHeader>
        
        {item && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-gray-600">Category: {item.category}</p>
              <p className="text-sm text-gray-600">Available: {item.available}</p>
            </div>

            <div className="space-y-2">
              <Label>Transfer to:</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.id !== currentUser.id).map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.rollNumber}) - Room {user.roomNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes (optional):</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for the transfer..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTransfer}
                disabled={!selectedUserId || isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {isSubmitting ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransferDialog;
