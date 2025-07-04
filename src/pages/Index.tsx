import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { 
  User, 
  Shield, 
  UserPlus, 
  Package, 
  FileText, 
  RotateCcw, 
  Users, 
  Plus, 
  Upload, 
  Pencil, 
  Trash2,
  ArrowRightLeft,
  Check,
  X
} from 'lucide-react';
import UserProfile from '@/components/UserProfile';
import NotificationsDialog from '@/components/NotificationsDialog';

interface User {
  id: string;
  rollNumber: string;
  name: string;
  phoneNumber: string;
  roomNumber: string;
  password: string;
  registeredDate: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  available: number;
  condition: string;
  addedDate: string;
  notes?: string;
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

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUserSignin, setShowUserSignin] = useState(false);
  const [showAdminSignin, setShowAdminSignin] = useState(false);
  const [showUserSignup, setShowUserSignup] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showUploadStudents, setShowUploadStudents] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [userCredentials, setUserCredentials] = useState({ rollNumber: '', password: '' });
  const [signupData, setSignupData] = useState({
    rollNumber: '',
    name: '',
    phoneNumber: '',
    roomNumber: '',
    password: ''
  });
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 0,
    condition: 'Good',
    notes: ''
  });
  const [transferData, setTransferData] = useState({
    toRollNumber: '',
    notes: ''
  });
  const [csvData, setCsvData] = useState('');

  const { toast } = useToast();
  const {
    inventory,
    users,
    issues,
    returnRequests,
    notifications,
    authorizedStudents,
    transferRequests,
    loading,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addUser,
    updateUser,
    addIssue,
    updateIssue,
    addReturnRequest,
    updateReturnRequest,
    addNotification,
    updateNotification,
    deleteNotification,
    addAuthorizedStudents,
    addTransferRequest,
    updateTransferRequest
  } = useSupabaseData();

  const handleTransfer = async (transferData: {
    itemId: string;
    itemName: string;
    toRollNumber: string;
    notes?: string;
  }) => {
    if (!currentUser) return;

    const toUser = users.find(u => u.roll_number === transferData.toRollNumber);
    if (!toUser) {
      toast({
        title: "Error",
        description: "User with this roll number not found.",
        variant: "destructive",
      });
      return;
    }

    try {
      const transferRequest = {
        item_id: transferData.itemId,
        item_name: transferData.itemName,
        from_user_id: currentUser.rollNumber,
        from_user_name: currentUser.name,
        to_user_id: transferData.toRollNumber,
        to_user_name: toUser.name,
        notes: transferData.notes || null,
      };

      await addTransferRequest(transferRequest);

      // Create notification for the recipient
      await addNotification({
        type: 'transfer_request',
        message: `${currentUser.name} wants to transfer "${transferData.itemName}" to you`,
        data: { transfer_id: transferRequest.item_id }
      });

      toast({
        title: "Transfer Request Sent",
        description: `Transfer request sent to ${toUser.name}`,
      });

      setShowTransferDialog(false);
    } catch (error) {
      console.error('Error creating transfer request:', error);
      toast({
        title: "Error",
        description: "Failed to send transfer request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApproveTransfer = async (transferId: string) => {
    const transfer = transferRequests.find(t => t.id === transferId);
    if (!transfer) return;

    try {
      // Update transfer request status
      await updateTransferRequest(transferId, { status: 'approved' });

      // Find the current issue and update it to transfer to new user
      const currentIssue = issues.find(issue => 
        issue.item_id === transfer.item_id && 
        issue.student_id === transfer.from_user_id && 
        issue.status === 'issued'
      );

      if (currentIssue) {
        // Return the item from the current user
        await updateIssue(currentIssue.id, { 
          status: 'returned',
          return_date: new Date().toISOString().split('T')[0]
        });

        // Issue the item to the new user
        await addIssue({
          item_id: transfer.item_id,
          item_name: transfer.item_name,
          student_id: transfer.to_user_id,
          student_name: transfer.to_user_name,
          phone_number: users.find(u => u.roll_number === transfer.to_user_id)?.phone_number || '',
          room_number: users.find(u => u.roll_number === transfer.to_user_id)?.room_number || '',
          notes: `Transferred from ${transfer.from_user_name}`
        });
      }

      toast({
        title: "Transfer Approved",
        description: `Item transferred successfully to ${transfer.to_user_name}`,
      });

    } catch (error) {
      console.error('Error approving transfer:', error);
      toast({
        title: "Error",
        description: "Failed to approve transfer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectTransfer = async (transferId: string) => {
    try {
      await updateTransferRequest(transferId, { status: 'rejected' });
      toast({
        title: "Transfer Rejected",
        description: "Transfer request has been rejected",
      });
    } catch (error) {
      console.error('Error rejecting transfer:', error);
      toast({
        title: "Error",
        description: "Failed to reject transfer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAdminSignin = () => {
    if (adminCredentials.username === 'admin' && adminCredentials.password === 'admin123') {
      setIsAdmin(true);
      setCurrentUser({
        id: 'admin',
        rollNumber: 'ADMIN',
        name: 'Administrator',
        phoneNumber: '',
        roomNumber: '',
        password: 'admin123',
        registeredDate: new Date().toISOString().split('T')[0]
      });
      setShowAdminSignin(false);
      setAdminCredentials({ username: '', password: '' });
      toast({
        title: "Welcome Admin",
        description: "You have successfully signed in as administrator.",
      });
    } else {
      toast({
        title: "Invalid Credentials",
        description: "Please check your username and password.",
        variant: "destructive",
      });
    }
  };

  const handleUserSignin = () => {
    const user = users.find(u => u.roll_number === userCredentials.rollNumber && u.password === userCredentials.password);
    if (user) {
      setCurrentUser({
        id: user.id,
        rollNumber: user.roll_number,
        name: user.name,
        phoneNumber: user.phone_number,
        roomNumber: user.room_number,
        password: user.password,
        registeredDate: user.registered_date
      });
      setShowUserSignin(false);
      setUserCredentials({ rollNumber: '', password: '' });
      toast({
        title: "Welcome",
        description: `Hello ${user.name}! You have successfully signed in.`,
      });
    } else {
      toast({
        title: "Invalid Credentials",
        description: "Please check your roll number and password.",
        variant: "destructive",
      });
    }
  };

  const handleUserSignup = async () => {
    if (!signupData.rollNumber || !signupData.name || !signupData.phoneNumber || !signupData.roomNumber || !signupData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check if user already exists
    const existingUser = users.find(u => u.roll_number === signupData.rollNumber);
    if (existingUser) {
      toast({
        title: "User Already Exists",
        description: "A user with this roll number already exists.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authorized
    const isAuthorized = authorizedStudents.some(student => student.roll_number === signupData.rollNumber);
    if (!isAuthorized) {
      toast({
        title: "Not Authorized",
        description: "Your roll number is not in the authorized list. Please contact the administrator.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addUser({
        roll_number: signupData.rollNumber,
        name: signupData.name,
        phone_number: signupData.phoneNumber,
        room_number: signupData.roomNumber,
        password: signupData.password
      });

      setSignupData({
        rollNumber: '',
        name: '',
        phoneNumber: '',
        roomNumber: '',
        password: ''
      });
      setShowUserSignup(false);

      toast({
        title: "Account Created",
        description: "Your account has been created successfully. You can now sign in.",
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || newItem.quantity <= 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields with valid values.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addInventoryItem({
        name: newItem.name,
        category: newItem.category,
        quantity: newItem.quantity,
        available: newItem.quantity,
        condition: newItem.condition,
        notes: newItem.notes || null
      });

      setNewItem({
        name: '',
        category: '',
        quantity: 0,
        condition: 'Good',
        notes: ''
      });
      setShowAddItem(false);

      toast({
        title: "Item Added",
        description: "New inventory item has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = async () => {
    if (!selectedItem || !newItem.name || !newItem.category || newItem.quantity < 0) {
      toast({
        title: "Invalid Data",
        description: "Please provide valid item information.",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentIssued = selectedItem.quantity - selectedItem.available;
      const newAvailable = Math.max(0, newItem.quantity - currentIssued);

      await updateInventoryItem(selectedItem.id, {
        name: newItem.name,
        category: newItem.category,
        quantity: newItem.quantity,
        available: newAvailable,
        condition: newItem.condition,
        notes: newItem.notes || null
      });

      setShowEditItem(false);
      setSelectedItem(null);
      setNewItem({
        name: '',
        category: '',
        quantity: 0,
        condition: 'Good',
        notes: ''
      });

      toast({
        title: "Item Updated",
        description: "Inventory item has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    // Check if item has active issues
    const activeIssues = issues.filter(issue => issue.item_id === itemId && issue.status === 'issued');
    if (activeIssues.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "This item has active issues and cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteInventoryItem(itemId);
      toast({
        title: "Item Deleted",
        description: "Inventory item has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleIssueItem = async (item: InventoryItem) => {
    if (!currentUser || item.available <= 0) return;

    try {
      // Add issue record
      await addIssue({
        item_id: item.id,
        item_name: item.name,
        student_id: currentUser.rollNumber,
        student_name: currentUser.name,
        phone_number: currentUser.phoneNumber,
        room_number: currentUser.roomNumber,
        notes: null
      });

      // Update inventory availability
      await updateInventoryItem(item.id, {
        available: item.available - 1
      });

      // Create notification for admin
      await addNotification({
        type: 'issue',
        message: `${currentUser.name} has issued "${item.name}"`,
        data: { item_id: item.id, student_id: currentUser.rollNumber }
      });

      toast({
        title: "Item Issued",
        description: `${item.name} has been issued to you successfully.`,
      });
    } catch (error) {
      console.error('Error issuing item:', error);
      toast({
        title: "Error",
        description: "Failed to issue item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRequestReturn = async (item: InventoryItem) => {
    if (!currentUser) return;

    // Check if user has this item issued
    const userIssue = issues.find(issue => 
      issue.item_id === item.id && 
      issue.student_id === currentUser.rollNumber && 
      issue.status === 'issued'
    );

    if (!userIssue) {
      toast({
        title: "No Active Issue",
        description: "You don't have this item currently issued.",
        variant: "destructive",
      });
      return;
    }

    // Check if return request already exists
    const existingRequest = returnRequests.find(request => 
      request.issue_id === userIssue.id && 
      request.status === 'pending'
    );

    if (existingRequest) {
      toast({
        title: "Request Already Exists",
        description: "You already have a pending return request for this item.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addReturnRequest({
        issue_id: userIssue.id,
        item_id: item.id,
        item_name: item.name,
        student_id: currentUser.rollNumber,
        student_name: currentUser.name,
        notes: null
      });

      // Create notification for admin
      await addNotification({
        type: 'return_request',
        message: `${currentUser.name} has requested to return "${item.name}"`,
        data: { return_id: userIssue.id, item_id: item.id }
      });

      toast({
        title: "Return Requested",
        description: `Return request for ${item.name} has been submitted.`,
      });
    } catch (error) {
      console.error('Error requesting return:', error);
      toast({
        title: "Error",
        description: "Failed to submit return request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApproveReturn = async (returnId: string) => {
    const returnRequest = returnRequests.find(r => r.id === returnId);
    if (!returnRequest) return;

    try {
      // Update return request status
      await updateReturnRequest(returnId, { status: 'approved' });

      // Update issue status
      await updateIssue(returnRequest.issue_id, { 
        status: 'returned',
        return_date: new Date().toISOString().split('T')[0]
      });

      // Update inventory availability
      const item = inventory.find(i => i.id === returnRequest.item_id);
      if (item) {
        await updateInventoryItem(item.id, {
          available: item.available + 1
        });
      }

      toast({
        title: "Return Approved",
        description: `Return request for ${returnRequest.item_name} has been approved.`,
      });
    } catch (error) {
      console.error('Error approving return:', error);
      toast({
        title: "Error",
        description: "Failed to approve return. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectReturn = async (returnId: string) => {
    try {
      await updateReturnRequest(returnId, { status: 'rejected' });
      toast({
        title: "Return Rejected",
        description: "Return request has been rejected.",
      });
    } catch (error) {
      console.error('Error rejecting return:', error);
      toast({
        title: "Error",
        description: "Failed to reject return. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUploadStudents = async () => {
    if (!csvData.trim()) {
      toast({
        title: "No Data",
        description: "Please enter CSV data.",
        variant: "destructive",
      });
      return;
    }

    try {
      const lines = csvData.trim().split('\n');
      const students = lines.map(line => {
        const [roll_number, name] = line.split(',').map(s => s.trim());
        return { roll_number, name };
      }).filter(student => student.roll_number && student.name);

      if (students.length === 0) {
        toast({
          title: "Invalid Data",
          description: "No valid student data found. Please check the CSV format.",
          variant: "destructive",
        });
        return;
      }

      await addAuthorizedStudents(students, true); // Replace existing data

      setCsvData('');
      setShowUploadStudents(false);

      toast({
        title: "Students Uploaded",
        description: `${students.length} students have been added to the authorized list.`,
      });
    } catch (error) {
      console.error('Error uploading students:', error);
      toast({
        title: "Error",
        description: "Failed to upload students. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (userId: string, newPassword: string) => {
    try {
      await updateUser(userId, { password: newPassword });
      
      if (currentUser && currentUser.id === userId) {
        setCurrentUser({ ...currentUser, password: newPassword });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setActiveTab('inventory');
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    });
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await updateNotification(notificationId, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleRemoveNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  const handleTransferSubmit = () => {
    if (!selectedItem || !transferData.toRollNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    handleTransfer({
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      toRollNumber: transferData.toRollNumber,
      notes: transferData.notes
    });

    setTransferData({ toRollNumber: '', notes: '' });
  };

  // Convert database records to component interfaces
  const convertedInventory: InventoryItem[] = inventory.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    available: item.available,
    condition: item.condition,
    addedDate: item.added_date,
    notes: item.notes || undefined
  }));

  const convertedUsers: User[] = users.map(user => ({
    id: user.id,
    rollNumber: user.roll_number,
    name: user.name,
    phoneNumber: user.phone_number,
    roomNumber: user.room_number,
    password: user.password,
    registeredDate: user.registered_date
  }));

  const convertedIssues: IssueRecord[] = issues.map(issue => ({
    id: issue.id,
    itemId: issue.item_id,
    itemName: issue.item_name,
    studentName: issue.student_name,
    studentId: issue.student_id,
    roomNumber: issue.room_number,
    phoneNumber: issue.phone_number,
    issueDate: issue.issue_date,
    returnDate: issue.return_date || undefined,
    status: issue.status as 'issued' | 'returned',
    notes: issue.notes || undefined
  }));

  const userNotifications = notifications.filter(notification => {
    if (isAdmin) {
      return notification.type === 'issue' || notification.type === 'return_request';
    } else {
      return notification.type === 'transfer_request' && 
             transferRequests.some(tr => 
               tr.to_user_id === currentUser?.rollNumber && 
               notification.data?.transfer_id === tr.item_id
             );
    }
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  useEffect(() => {
    if (selectedItem && showEditItem) {
      setNewItem({
        name: selectedItem.name,
        category: selectedItem.category,
        quantity: selectedItem.quantity,
        condition: selectedItem.condition,
        notes: selectedItem.notes || ''
      });
    }
  }, [selectedItem, showEditItem]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img 
                  src="/lovable-uploads/f4cee27c-9d5b-471d-93bc-0755082abef9.png" 
                  alt="Logo" 
                  className="h-10 w-auto"
                />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-purple-600">Inventory Management</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser && (
                <>
                  {/* Notifications - positioned on the left for users, right for admin */}
                  {!isAdmin && (
                    <NotificationsDialog
                      notifications={userNotifications}
                      unreadCount={unreadCount}
                      onMarkAsRead={handleMarkNotificationAsRead}
                      onRemove={handleRemoveNotification}
                      onApproveTransfer={handleApproveTransfer}
                      onRejectTransfer={handleRejectTransfer}
                    />
                  )}
                  <Button
                    onClick={() => setShowProfile(true)}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {currentUser.name}
                  </Button>
                  {isAdmin && (
                    <NotificationsDialog
                      notifications={userNotifications}
                      unreadCount={unreadCount}
                      onMarkAsRead={handleMarkNotificationAsRead}
                      onRemove={handleRemoveNotification}
                      onApproveReturn={handleApproveReturn}
                      onRejectReturn={handleRejectReturn}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {!currentUser ? (
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Welcome to Inventory Management System
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Sign in to manage your inventory efficiently
              </p>
            </div>
            
            <div className="flex justify-center space-x-4 mb-8">
              <Button
                onClick={() => setShowUserSignin(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <User className="h-4 w-4 mr-2" />
                Student Sign In
              </Button>
              <Button
                onClick={() => setShowAdminSignin(true)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Sign In
              </Button>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-4">Don't have an account?</p>
              <Button
                onClick={() => setShowUserSignup(true)}
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Student Sign Up
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-4 py-6 sm:px-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white border border-purple-200">
                <TabsTrigger 
                  value="inventory" 
                  className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Inventory
                </TabsTrigger>
                <TabsTrigger 
                  value="issues" 
                  className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Issues
                </TabsTrigger>
                <TabsTrigger 
                  value="returns" 
                  className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Returns
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger 
                    value="users" 
                    className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Users
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Inventory Tab */}
              <TabsContent value="inventory" className="space-y-4">
                <div className="bg-white rounded-lg shadow border border-purple-100">
                  <div className="p-6 border-b border-purple-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                      <h3 className="text-lg font-medium text-gray-900">Available Items</h3>
                      {isAdmin && (
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <Button 
                            onClick={() => setShowAddItem(true)}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 w-full sm:w-auto"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                          </Button>
                          <Button 
                            onClick={() => setShowUploadStudents(true)}
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Students
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {convertedInventory
                        .filter(item => 
                          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((item) => (
                          <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-sm text-gray-600">
                                  <div>Category: <span className="font-medium">{item.category}</span></div>
                                  <div>Available: <span className="font-medium text-green-600">{item.available}</span></div>
                                  <div>Total: <span className="font-medium">{item.quantity}</span></div>
                                  <div>Condition: <span className="font-medium">{item.condition}</span></div>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                                {!isAdmin && item.available > 0 && (
                                  <>
                                    <Button
                                      onClick={() => handleIssueItem(item)}
                                      size="sm"
                                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 w-full sm:w-auto"
                                    >
                                      <Package className="h-3 w-3 mr-1" />
                                      Issue
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        setSelectedItem(item);
                                        setShowTransferDialog(true);
                                      }}
                                      size="sm"
                                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 w-full sm:w-auto"
                                    >
                                      <ArrowRightLeft className="h-3 w-3 mr-1" />
                                      Transfer
                                    </Button>
                                    <Button
                                      onClick={() => handleRequestReturn(item)}
                                      size="sm"
                                      variant="outline"
                                      className="border-purple-200 text-purple-600 hover:bg-purple-50 w-full sm:w-auto"
                                    >
                                      <RotateCcw className="h-3 w-3 mr-1" />
                                      Request
                                    </Button>
                                  </>
                                )}
                                {isAdmin && (
                                  <div className="flex space-x-2 w-full sm:w-auto">
                                    <Button
                                      onClick={() => {
                                        setSelectedItem(item);
                                        setShowEditItem(true);
                                      }}
                                      size="sm"
                                      variant="outline"
                                      className="border-blue-200 text-blue-600 hover:bg-blue-50 flex-1 sm:flex-none"
                                    >
                                      <Pencil className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button>
                                    <Button
                                      onClick={() => handleDeleteItem(item.id)}
                                      size="sm"
                                      variant="outline"
                                      className="border-red-200 text-red-600 hover:bg-red-50 flex-1 sm:flex-none"
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Issues Tab */}
              <TabsContent value="issues" className="space-y-4">
                <div className="bg-white rounded-lg shadow border border-purple-100">
                  <div className="p-6 border-b border-purple-100">
                    <h3 className="text-lg font-medium text-gray-900">Issue Records</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {convertedIssues
                        .filter(issue => isAdmin || issue.studentId === currentUser?.rollNumber)
                        .map((issue) => (
                          <div key={issue.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{issue.itemName}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-sm text-gray-600">
                                  <div>Student: <span className="font-medium">{issue.studentName}</span></div>
                                  <div>Issue Date: <span className="font-medium">{issue.issueDate}</span></div>
                                  <div>Status: 
                                    <Badge 
                                      variant={issue.status === 'issued' ? 'default' : 'secondary'}
                                      className="ml-1"
                                    >
                                      {issue.status}
                                    </Badge>
                                  </div>
                                </div>
                                {issue.returnDate && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    Return Date: <span className="font-medium">{issue.returnDate}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Returns Tab */}
              <TabsContent value="returns" className="space-y-4">
                <div className="bg-white rounded-lg shadow border border-purple-100">
                  <div className="p-6 border-b border-purple-100">
                    <h3 className="text-lg font-medium text-gray-900">Return Requests</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {returnRequests
                        .filter(request => isAdmin || request.student_id === currentUser?.rollNumber)
                        .map((request) => (
                          <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{request.item_name}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-sm text-gray-600">
                                  <div>Student: <span className="font-medium">{request.student_name}</span></div>
                                  <div>Request Date: <span className="font-medium">{request.request_date}</span></div>
                                  <div>Status: 
                                    <Badge 
                                      variant={
                                        request.status === 'pending' ? 'default' : 
                                        request.status === 'approved' ? 'secondary' : 'destructive'
                                      }
                                      className="ml-1"
                                    >
                                      {request.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              {isAdmin && request.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => handleApproveReturn(request.id)}
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600"
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectReturn(request.id)}
                                    size="sm"
                                    variant="destructive"
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Users Tab (Admin only) */}
              {isAdmin && (
                <TabsContent value="users" className="space-y-4">
                  <div className="bg-white rounded-lg shadow border border-purple-100">
                    <div className="p-6 border-b border-purple-100">
                      <h3 className="text-lg font-medium text-gray-900">Registered Users</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {convertedUsers.map((user) => (
                          <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                              <div>
                                <Label className="text-sm text-gray-600">Name</Label>
                                <p className="font-medium">{user.name}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-gray-600">Roll Number</Label>
                                <p className="font-medium">{user.rollNumber}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-gray-600">Phone</Label>
                                <p className="font-medium">{user.phoneNumber}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-gray-600">Room</Label>
                                <p className="font-medium">{user.roomNumber}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </main>

      {/* User Profile Dialog */}
      {currentUser && (
        <UserProfile
          user={currentUser}
          issues={convertedIssues}
          onPasswordChange={handlePasswordChange}
          onLogout={handleLogout}
          open={showProfile}
          onOpenChange={setShowProfile}
        />
      )}

      {/* User Sign In Dialog */}
      <Dialog open={showUserSignin} onOpenChange={setShowUserSignin}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Student Sign In</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number</Label>
              <Input
                id="rollNumber"
                value={userCredentials.rollNumber}
                onChange={(e) => setUserCredentials({...userCredentials, rollNumber: e.target.value})}
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={userCredentials.password}
                onChange={(e) => setUserCredentials({...userCredentials, password: e.target.value})}
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            <Button 
              onClick={handleUserSignin} 
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Sign In Dialog */}
      <Dialog open={showAdminSignin} onOpenChange={setShowAdminSignin}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Sign In</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminUsername">Username</Label>
              <Input
                id="adminUsername"
                value={adminCredentials.username}
                onChange={(e) => setAdminCredentials({...adminCredentials, username: e.target.value})}
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Password</Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminCredentials.password}
                onChange={(e) => setAdminCredentials({...adminCredentials, password: e.target.value})}
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            <Button 
              onClick={handleAdminSignin} 
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Sign Up Dialog */}
      <Dialog open={showUserSignup} onOpenChange={setShowUserSignup}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Student Sign Up</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signupRollNumber">Roll Number</Label>
              <Input
                id="signupRollNumber"
                value={signupData.rollNumber}
                onChange={(e) => setSignupData({...signupData, rollNumber: e.target.value})}
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signupName">Full Name</Label>
              <Input
                id="signupName"
                value={signupData.name}
                onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signupPhone">Phone Number</Label>
              <Input
                id="signupPhone"
                value={signupData.phoneNumber}
                onChange={(e) => setSignupData({...signupData, phoneNumber: e.target.value})}
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signupRoom">Room Number</Label>
              <Input
                id="signupRoom"
                value={signupData.roomNumber}
                onChange={(e) => setSignupData({...signupData, roomNumber: e.target.value})}
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signupPassword">Password</Label>
              <Input
                id="signupPassword"
                type="password"
                value={signupData.password}
                onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            <Button 
              onClick={handleUserSignup} 
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              Sign Up
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemCategory">Category</Label>
              <Input
                id="itemCategory"
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemQuantity">Quantity</Label>
              <Input
                id="itemQuantity"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemCondition">Condition</Label>
              <Select value={newItem.condition} onValueChange={(value) => setNewItem({...newItem, condition: value})}>
                <SelectTrigger className="border-gray-300 focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemNotes">Notes (Optional)</Label>
              <Textarea
                id="itemNotes"
                value={newItem.notes}
                onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            <Button 
              onClick={handleAddItem} 
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              Add Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditItem} onOpenChange={setShowEditItem}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editItemName">Item Name</Label>
              <Input
                id="editItemName"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editItemCategory">Category</Label>
              <Input
                id="editItemCategory"
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editItemQuantity">Quantity</Label>
              <Input
                id="editItemQuantity"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editItemCondition">Condition</Label>
              <Select value={newItem.condition} onValueChange={(value) => setNewItem({...newItem, condition: value})}>
                <SelectTrigger className="border-gray-300 focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editItemNotes">Notes (Optional)</Label>
              <Textarea
                id="editItemNotes"
                value={newItem.notes}
                onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                className="border-gray-300 focus:border-purple-500"
              />
            </div>
            <Button 
              onClick={handleEditItem} 
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Update Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Students Dialog */}
      <Dialog open={showUploadStudents} onOpenChange={setShowUploadStudents}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Authorized Students</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csvData">CSV Data (Roll Number, Name)</Label>
              <Textarea
                id="csvData"
                placeholder="2021001, John Doe&#10;2021002, Jane Smith&#10;2021003, Bob Johnson"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                className="border-gray-300 focus:border-purple-500 h-32"
              />
            </div>
            <p className="text-sm text-gray-600">
              Enter one student per line in format: Roll Number, Full Name
            </p>
            <Button 
              onClick={handleUploadStudents} 
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Upload Students
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Item: {selectedItem.name}</p>
                <p className="text-sm text-gray-600">Category: {selectedItem.category}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="toRollNumber">To Roll Number</Label>
              <Input
                id="toRollNumber"
                value={transferData.toRollNumber}
                onChange={(e) => setTransferData({...transferData, toRollNumber: e.target.value})}
                className="border-gray-300 focus:border-purple-500"
                placeholder="Enter recipient's roll number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transferNotes">Notes (Optional)</Label>
              <Textarea
                id="transferNotes"
                value={transferData.notes}
                onChange={(e) => setTransferData({...transferData, notes: e.target.value})}
                className="border-gray-300 focus:border-purple-500"
                placeholder="Add any notes about the transfer"
              />
            </div>
            <Button 
              onClick={handleTransferSubmit} 
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              Send Transfer Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
