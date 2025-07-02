
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Home, Key, Settings, LogOut } from 'lucide-react';

interface User {
  id: string;
  rollNumber: string;
  name: string;
  phoneNumber: string;
  roomNumber: string;
  password: string;
  registeredDate: string;
}

interface IssueRecord {
  id: string;
  itemId: string;
  itemName: string;
  studentName: string;
  studentId: string;
  roomNumber: string;
  phoneNumber: string;
  issueDate: string;
  returnDate?: string;
  status: 'issued' | 'returned';
  notes?: string;
}

interface UserProfileProps {
  user: User;
  issues: IssueRecord[];
  onPasswordChange: (userId: string, newPassword: string) => void;
  onLogout: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  issues,
  onPasswordChange,
  onLogout,
  open,
  onOpenChange
}) => {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  const userIssues = issues.filter(issue => issue.studentId === user.rollNumber);
  const activeIssues = userIssues.filter(issue => issue.status === 'issued');

  const handlePasswordChange = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.currentPassword !== user.password) {
      toast({
        title: "Error",
        description: "Current password is incorrect.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 4) {
      toast({
        title: "Error",
        description: "New password must be at least 4 characters long.",
        variant: "destructive",
      });
      return;
    }

    onPasswordChange(user.id, passwordForm.newPassword);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordChange(false);

    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-purple-600 text-xl font-bold flex items-center justify-center gap-2">
            <User className="h-6 w-6" />
            User Profile
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* User Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Name</Label>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Roll Number</Label>
                  <p className="font-medium">{user.rollNumber}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Phone Number</Label>
                  <p className="font-medium">{user.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Room Number</Label>
                  <p className="font-medium">{user.roomNumber}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Registration Date</Label>
                <p className="font-medium">{user.registeredDate}</p>
              </div>
            </CardContent>
          </Card>

          {/* Active Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Active Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {activeIssues.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active issues</p>
              ) : (
                <div className="space-y-2">
                  {activeIssues.map((issue) => (
                    <div key={issue.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{issue.itemName}</p>
                          <p className="text-sm text-gray-600">Issued: {issue.issueDate}</p>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowPasswordChange(true)}
              variant="outline"
              className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Password Change Dialog */}
        <Dialog open={showPasswordChange} onOpenChange={setShowPasswordChange}>
          <DialogContent className="bg-white max-w-md">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="border-gray-300 focus:border-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="border-gray-300 focus:border-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="border-gray-300 focus:border-purple-500"
                />
              </div>
              <Button 
                onClick={handlePasswordChange} 
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                Update Password
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile;
