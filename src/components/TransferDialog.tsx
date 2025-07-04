
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft } from 'lucide-react';

interface User {
  id: string;
  rollNumber: string;
  name: string;
  phoneNumber: string;
  roomNumber: string;
  password: string;
  registeredDate: string;
}

interface Issue {
  id: string;
  item_id: string;
  item_name: string;
  student_name: string;
  student_id: string;
  room_number: string;
  phone_number: string;
  issue_date: string;
  return_date: string | null;
  status: string;
  notes: string | null;
}

interface TransferDialogProps {
  currentUser: User;
  issues: Issue[];
  users: User[];
  onTransferRequest: (transferData: {
    itemId: string;
    itemName: string;
    fromUserId: string;
    fromUserName: string;
    toUserRollNumber: string;
    toUserName: string;
    notes?: string;
  }) => void;
}

const TransferDialog: React.FC<TransferDialogProps> = ({
  currentUser,
  issues,
  users,
  onTransferRequest
}) => {
  const [open, setOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState('');
  const [toUserRollNumber, setToUserRollNumber] = useState('');
  const [notes, setNotes] = useState('');

  const userIssues = issues.filter(issue => 
    issue.student_id === currentUser.rollNumber && 
    issue.status === 'issued'
  );

  const handleTransfer = () => {
    if (!selectedIssueId || !toUserRollNumber.trim()) return;

    const selectedIssue = issues.find(issue => issue.id === selectedIssueId);
    const toUser = users.find(user => user.rollNumber.toLowerCase() === toUserRollNumber.toLowerCase());
    
    if (!selectedIssue || !toUser) return;

    onTransferRequest({
      itemId: selectedIssue.item_id,
      itemName: selectedIssue.item_name,
      fromUserId: currentUser.rollNumber,
      fromUserName: currentUser.name,
      toUserRollNumber: toUser.rollNumber,
      toUserName: toUser.name,
      notes
    });

    // Reset form
    setSelectedIssueId('');
    setToUserRollNumber('');
    setNotes('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-purple-500 text-purple-600 hover:bg-purple-50 flex-1 sm:flex-none"
          disabled={userIssues.length === 0}
        >
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium">Transferring from: {currentUser.name}</p>
            <p className="text-sm text-gray-600">Roll Number: {currentUser.rollNumber}</p>
          </div>
          
          <div>
            <Label htmlFor="transferItem">Select Your Item to Transfer</Label>
            <Select onValueChange={setSelectedIssueId}>
              <SelectTrigger className="border-gray-300 focus:border-purple-500">
                <SelectValue placeholder="Select item to transfer" />
              </SelectTrigger>
              <SelectContent>
                {userIssues.map(issue => (
                  <SelectItem key={issue.id} value={issue.id}>
                    {issue.item_name} (Issued: {issue.issue_date})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="toUserRoll">Recipient Roll Number</Label>
            <Input
              id="toUserRoll"
              value={toUserRollNumber}
              onChange={(e) => setToUserRollNumber(e.target.value)}
              className="border-gray-300 focus:border-purple-500"
              placeholder="Enter recipient's roll number"
            />
          </div>

          <div>
            <Label htmlFor="transferNotes">Notes (Optional)</Label>
            <Textarea
              id="transferNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-gray-300 focus:border-purple-500"
              placeholder="Any notes about the transfer..."
            />
          </div>

          <Button 
            onClick={handleTransfer} 
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            disabled={!selectedIssueId || !toUserRollNumber.trim()}
          >
            Request Transfer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferDialog;
