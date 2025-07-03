import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LogIn, LogOut, Plus, Edit, Trash2, Download, Package, Users, Activity, Trophy, Shield, ArrowRight, ArrowLeft, Bell, Check, X, Phone, Upload, UserPlus, User, Linkedin, RefreshCw } from 'lucide-react';
import UserSignup from '@/components/UserSignup';
import UserSignin from '@/components/UserSignin';
import UserProfile from '@/components/UserProfile';
import TransferDialog from '@/components/TransferDialog';
import NotificationsDialog from '@/components/NotificationsDialog';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [showSignin, setShowSignin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 0,
    available: 0,
    condition: 'Good'
  });
  const [requestForm, setRequestForm] = useState({
    studentName: '',
    studentId: '',
    roomNumber: '',
    phoneNumber: '',
    notes: ''
  });
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [selectedItemForTransfer, setSelectedItemForTransfer] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);

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

  const { toast } = useToast();

  // Convert database types to component types
  const convertedInventory = inventory.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    available: item.available,
    condition: item.condition,
    addedDate: item.added_date
  }));

  const convertedUsers = users.map(user => ({
    id: user.id,
    rollNumber: user.roll_number,
    name: user.name,
    phoneNumber: user.phone_number,
    roomNumber: user.room_number,
    password: user.password,
    registeredDate: user.registered_date
  }));

  const convertedIssues = issues.map(issue => ({
    id: issue.id,
    itemId: issue.item_id,
    itemName: issue.item_name,
    studentName: issue.student_name,
    studentId: issue.student_id,
    roomNumber: issue.room_number,
    phoneNumber: issue.phone_number,
    issueDate: issue.issue_date,
    returnDate: issue.return_date,
    status: issue.status as 'issued' | 'returned',
    notes: issue.notes
  }));

  const convertedReturnRequests = returnRequests.map(request => ({
    id: request.id,
    issueId: request.issue_id,
    requestDate: request.request_date,
    status: request.status,
    notes: request.notes
  }));

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSignup = async (userData: any) => {
    try {
      await addUser({
        roll_number: userData.rollNumber,
        name: userData.name,
        phone_number: userData.phoneNumber,
        room_number: userData.roomNumber,
        password: userData.password,
        registered_date: new Date().toISOString().split('T')[0]
      });

      toast({
        title: "Registration Successful",
        description: "You can now sign in with your credentials.",
      });
      setShowSignup(false);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignin = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setShowSignin(false);
    toast({
      title: "Welcome!",
      description: `Signed in as ${user.name}`,
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setShowProfile(false);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handlePasswordChange = async (userId: string, newPassword: string) => {
    try {
      await updateUser(userId, { password: newPassword });
      
      // Update current user if it's their password being changed
      if (currentUser && currentUser.id === userId) {
        const updatedUser = { ...currentUser, password: newPassword };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password.",
        variant: "destructive",
      });
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addInventoryItem({
        name: newItem.name,
        category: newItem.category,
        quantity: newItem.quantity,
        available: newItem.available,
        condition: newItem.condition,
        added_date: new Date().toISOString().split('T')[0]
      });

      setNewItem({ name: '', category: '', quantity: 0, available: 0, condition: 'Good' });
      setShowAddItem(false);
      toast({
        title: "Item Added",
        description: "New inventory item has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      await updateInventoryItem(editingItem.id, {
        name: editingItem.name,
        category: editingItem.category,
        quantity: editingItem.quantity,
        available: editingItem.available,
        condition: editingItem.condition
      });

      setShowEditDialog(false);
      setEditingItem(null);
      toast({
        title: "Item Updated",
        description: "Inventory item has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteInventoryItem(id);
        toast({
          title: "Item Deleted",
          description: "Inventory item has been deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete item.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRequest = (item: any) => {
    if (!currentUser) {
      toast({
        title: "Please Sign In",
        description: "You need to sign in to request items.",
        variant: "destructive",
      });
      return;
    }

    setSelectedItem(item);
    setRequestForm({
      studentName: currentUser.name,
      studentId: currentUser.rollNumber,
      roomNumber: currentUser.roomNumber,
      phoneNumber: currentUser.phoneNumber,
      notes: ''
    });
    setShowRequestDialog(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedItem || !requestForm.studentName || !requestForm.studentId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addIssue({
        item_id: selectedItem.id,
        item_name: selectedItem.name,
        student_name: requestForm.studentName,
        student_id: requestForm.studentId,
        room_number: requestForm.roomNumber,
        phone_number: requestForm.phoneNumber,
        status: 'issued',
        issue_date: new Date().toISOString().split('T')[0],
        notes: requestForm.notes || null
      });

      // Update inventory available count
      await updateInventoryItem(selectedItem.id, {
        available: Math.max(0, selectedItem.available - 1)
      });

      // Add notification
      await addNotification({
        type: 'issue',
        message: `New item issued: ${selectedItem.name} to ${requestForm.studentName}`,
        read: false,
        data: { itemId: selectedItem.id, studentName: requestForm.studentName }
      });

      setShowRequestDialog(false);
      setRequestForm({ studentName: '', studentId: '', roomNumber: '', phoneNumber: '', notes: '' });
      toast({
        title: "Request Submitted",
        description: "Your item request has been submitted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request.",
        variant: "destructive",
      });
    }
  };

  const handleReturnRequest = async (issueId: string) => {
    try {
      await addReturnRequest({
        issue_id: issueId,
        status: 'pending',
        request_date: new Date().toISOString().split('T')[0],
        notes: null
      });

      // Add notification
      const issue = convertedIssues.find(i => i.id === issueId);
      if (issue) {
        await addNotification({
          type: 'return_request',
          message: `Return request submitted for ${issue.itemName} by ${issue.studentName}`,
          read: false,
          data: { issueId, itemName: issue.itemName, studentName: issue.studentName }
        });
      }

      toast({
        title: "Return Request Submitted",
        description: "Your return request has been submitted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit return request.",
        variant: "destructive",
      });
    }
  };

  const handleApproveReturn = async (requestId: string) => {
    try {
      const returnRequest = convertedReturnRequests.find(r => r.id === requestId);
      if (!returnRequest) return;

      const issue = convertedIssues.find(i => i.id === returnRequest.issueId);
      if (!issue) return;

      // Update return request status
      await updateReturnRequest(requestId, { status: 'approved' });

      // Update issue status and return date
      await updateIssue(issue.id, {
        status: 'returned',
        return_date: new Date().toISOString().split('T')[0]
      });

      // Update inventory available count
      const item = convertedInventory.find(i => i.id === issue.itemId);
      if (item) {
        await updateInventoryItem(issue.itemId, {
          available: item.available + 1
        });
      }

      toast({
        title: "Return Approved",
        description: "The return request has been approved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve return.",
        variant: "destructive",
      });
    }
  };

  const handleRejectReturn = async (requestId: string) => {
    try {
      await updateReturnRequest(requestId, { status: 'rejected' });
      toast({
        title: "Return Rejected",
        description: "The return request has been rejected.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject return.",
        variant: "destructive",
      });
    }
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const items = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 5) {
          items.push({
            name: values[0],
            category: values[1],
            quantity: parseInt(values[2]) || 0,
            available: parseInt(values[3]) || 0,
            condition: values[4] || 'Good',
            added_date: new Date().toISOString().split('T')[0]
          });
        }
      }

      try {
        for (const item of items) {
          await addInventoryItem(item);
        }
        toast({
          title: "CSV Uploaded",
          description: `Successfully added ${items.length} items from CSV.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload CSV data.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleBulkStudentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      
      const students = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 2) {
          students.push({
            roll_number: values[0],
            name: values[1]
          });
        }
      }

      try {
        await addAuthorizedStudents(students);
        toast({
          title: "Students Added",
          description: `Successfully added ${students.length} authorized students.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload student data.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleTransferRequest = async (
    itemId: string,
    itemName: string,
    fromUserId: string,
    fromUserName: string,
    toUserId: string,
    toUserName: string,
    notes?: string
  ) => {
    try {
      await addTransferRequest({
        item_id: itemId,
        item_name: itemName,
        from_user_id: fromUserId,
        from_user_name: fromUserName,
        to_user_id: toUserId,
        to_user_name: toUserName,
        notes: notes || null,
        status: 'pending',
        request_date: new Date().toISOString().split('T')[0]
      });

      // Add notification for the recipient
      await addNotification({
        type: 'transfer_request',
        message: `${fromUserName} wants to transfer "${itemName}" to you.`,
        read: false,
        data: { transferItemId: itemId, fromUser: fromUserName }
      });

    } catch (error) {
      throw error;
    }
  };

  const handleApproveTransfer = async (transferId: string) => {
    const transfer = transferRequests.find(t => t.id === transferId);
    if (!transfer) return;

    try {
      // Update transfer status
      await updateTransferRequest(transferId, { status: 'approved' });

      // Create an issue for the new user
      const toUser = users.find(u => u.roll_number === transfer.to_user_id);
      if (toUser) {
        await addIssue({
          item_id: transfer.item_id,
          item_name: transfer.item_name,
          student_name: transfer.to_user_name,
          student_id: transfer.to_user_id,
          room_number: toUser.room_number,
          phone_number: toUser.phone_number,
          status: 'issued',
          issue_date: new Date().toISOString().split('T')[0],
          notes: `Transferred from ${transfer.from_user_name}`
        });

        // Update inventory available count
        const item = inventory.find(i => i.id === transfer.item_id);
        if (item) {
          await updateInventoryItem(transfer.item_id, {
            available: Math.max(0, item.available - 1)
          });
        }
      }

      // Add notification for the original requester
      await addNotification({
        type: 'transfer_request',
        message: `Your transfer request for "${transfer.item_name}" has been approved by ${transfer.to_user_name}.`,
        read: false,
        data: { transferItemId: transfer.item_id }
      });

    } catch (error) {
      throw error;
    }
  };

  const handleRejectTransfer = async (transferId: string) => {
    const transfer = transferRequests.find(t => t.id === transferId);
    if (!transfer) return;

    try {
      await updateTransferRequest(transferId, { status: 'rejected' });

      // Add notification for the original requester
      await addNotification({
        type: 'transfer_request',
        message: `Your transfer request for "${transfer.item_name}" has been rejected by ${transfer.to_user_name}.`,
        read: false,
        data: { transferItemId: transfer.item_id }
      });

    } catch (error) {
      throw error;
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await updateNotification(notificationId, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const openTransferDialog = (item: any) => {
    setSelectedItemForTransfer(item);
    setShowTransferDialog(true);
  };

  // Count unread notifications and pending transfers
  const unreadCount = notifications.filter(n => !n.read).length + 
    transferRequests.filter(t => t.to_user_id === currentUser?.rollNumber && t.status === 'pending').length;

  // Dashboard stats
  const totalItems = convertedInventory.reduce((sum, item) => sum + item.quantity, 0);
  const availableItems = convertedInventory.reduce((sum, item) => sum + item.available, 0);
  const issuedItems = convertedIssues.filter(issue => issue.status === 'issued').length;
  const totalUsers = convertedUsers.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <img 
              src="/lovable-uploads/5b532a8c-4c79-4972-b351-f890ab065309.png" 
              alt="Hall 3 Logo" 
              className="h-12 w-12 rounded-full border-2 border-white shadow-md"
            />
            <div>
              <h1 className="text-xl md:text-3xl font-bold">HALL 3 INVENTORY SYSTEM</h1>
              <p className="text-xs md:text-sm opacity-90">Manage your hostel inventory efficiently</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Notifications Button */}
            {currentUser && (
              <Button
                onClick={() => setShowNotifications(true)}
                variant="outline"
                size="sm"
                className="relative border-white text-white hover:bg-white hover:text-red-600"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowProfile(true)}
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white hover:text-red-600"
                >
                  <User className="h-4 w-4 mr-1" />
                  {currentUser.name}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowSignin(true)}
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white hover:text-red-600"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Sign In
                </Button>
                <Button
                  onClick={() => setShowSignup(true)}
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white hover:text-red-600"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-8">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Package className="h-8 w-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalItems}</p>
              <p className="text-xs opacity-90">Total Items</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{availableItems}</p>
              <p className="text-xs opacity-90">Available</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{issuedItems}</p>
              <p className="text-xs opacity-90">Issued</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-xs opacity-90">Users</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 bg-white shadow-sm">
            <TabsTrigger value="inventory" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <Package className="h-4 w-4 mr-1" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="issues" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <Activity className="h-4 w-4 mr-1" />
              Issues
            </TabsTrigger>
            <TabsTrigger value="returns" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Returns
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-1" />
              Users
            </TabsTrigger>
            {currentUser?.rollNumber === 'admin' && (
              <>
                <TabsTrigger value="authorized" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                  <Shield className="h-4 w-4 mr-1" />
                  Authorized
                </TabsTrigger>
                <TabsTrigger value="reports" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                  <Download className="h-4 w-4 mr-1" />
                  Reports
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="mt-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Package className="h-5 w-5" />
                  Inventory Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Add Item Form - Admin Only */}
                {currentUser?.rollNumber === 'admin' && (
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Add New Item</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <Label htmlFor="itemName">Item Name</Label>
                        <Input
                          id="itemName"
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                          placeholder="Enter item name"
                          className="border-gray-300 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                          <SelectTrigger className="border-gray-300 focus:border-red-500">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Furniture">Furniture</SelectItem>
                            <SelectItem value="Books">Books</SelectItem>
                            <SelectItem value="Tools">Tools</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity">Total Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                          className="border-gray-300 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="available">Available</Label>
                        <Input
                          id="available"
                          type="number"
                          value={newItem.available}
                          onChange={(e) => setNewItem({...newItem, available: parseInt(e.target.value) || 0})}
                          className="border-gray-300 focus:border-red-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button 
                          onClick={handleAddItem}
                          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* CSV Upload Section */}
                {currentUser?.rollNumber === 'admin' && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 text-blue-800">CSV Upload</h3>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="flex-1">
                        <Label htmlFor="csvFile">Upload CSV File</Label>
                        <Input
                          id="csvFile"
                          type="file"
                          accept=".csv"
                          onChange={handleCSVUpload}
                          className="border-blue-300 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCSVUpload}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 whitespace-nowrap"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload CSV
                        </Button>
                        <Button
                          onClick={() => {
                            const input = document.getElementById('csvFile') as HTMLInputElement;
                            if (input) input.click();
                          }}
                          variant="outline"
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 whitespace-nowrap"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Replace File
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      CSV should have columns: name, category, quantity, available, condition
                    </p>
                  </div>
                )}

                <div className="grid gap-4">
                  {convertedInventory.map((item) => (
                    <Card key={item.id} className="border-l-4 border-l-red-500 bg-white shadow-md">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge variant="outline">{item.category}</Badge>
                              <Badge variant={item.quantity > 0 ? "default" : "destructive"}>Qty: {item.quantity}</Badge>
                              <Badge variant={item.available > 0 ? "default" : "destructive"}>Available: {item.available}</Badge>
                              <Badge variant="secondary">{item.condition}</Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Added: {item.addedDate}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {currentUser && (
                              <>
                                <Button
                                  onClick={() => handleRequest(item)}
                                  disabled={item.available <= 0}
                                  size="sm"
                                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                >
                                  Request
                                </Button>
                                <Button
                                  onClick={() => openTransferDialog(item)}
                                  disabled={item.available <= 0}
                                  size="sm"
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                >
                                  <ArrowRight className="h-4 w-4 mr-1" />
                                  Transfer
                                </Button>
                              </>
                            )}
                            {currentUser?.rollNumber === 'admin' && (
                              <>
                                <Button
                                  onClick={() => handleEdit(item)}
                                  size="sm"
                                  variant="outline"
                                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(item.id)}
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="mt-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Activity className="h-5 w-5" />
                  Current Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {convertedIssues.filter(issue => issue.status === 'issued').map((issue) => (
                    <Card key={issue.id} className="border-l-4 border-l-orange-500 bg-white shadow-md">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{issue.itemName}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                              <p><strong>Student:</strong> {issue.studentName}</p>
                              <p><strong>Roll No:</strong> {issue.studentId}</p>
                              <p><strong>Room:</strong> {issue.roomNumber}</p>
                              <p><strong>Phone:</strong> {issue.phoneNumber}</p>
                              <p><strong>Issue Date:</strong> {issue.issueDate}</p>
                              {issue.notes && <p><strong>Notes:</strong> {issue.notes}</p>}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge variant="default">Active</Badge>
                            {(currentUser?.rollNumber === issue.studentId || currentUser?.rollNumber === 'admin') && (
                              <Button
                                onClick={() => handleReturnRequest(issue.id)}
                                size="sm"
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                              >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Request Return
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Returns Tab */}
          <TabsContent value="returns" className="mt-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <ArrowLeft className="h-5 w-5" />
                  Return Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {convertedReturnRequests.filter(request => request.status === 'pending').map((request) => {
                    const issue = convertedIssues.find(i => i.id === request.issueId);
                    if (!issue) return null;
                    
                    return (
                      <Card key={request.id} className="border-l-4 border-l-blue-500 bg-white shadow-md">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">{issue.itemName}</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                <p><strong>Student:</strong> {issue.studentName}</p>
                                <p><strong>Roll No:</strong> {issue.studentId}</p>
                                <p><strong>Room:</strong> {issue.roomNumber}</p>
                                <p><strong>Issue Date:</strong> {issue.issueDate}</p>
                                <p><strong>Return Request:</strong> {request.requestDate}</p>
                                {request.notes && <p><strong>Notes:</strong> {request.notes}</p>}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Badge variant="secondary">Pending Return</Badge>
                              {currentUser?.rollNumber === 'admin' && (
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleApproveReturn(request.id)}
                                    size="sm"
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectReturn(request.id)}
                                    size="sm"
                                    variant="destructive"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Users className="h-5 w-5" />
                  Registered Users
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {convertedUsers.map((user) => (
                    <Card key={user.id} className="border-l-4 border-l-purple-500 bg-white shadow-md">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{user.name}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                              <p><strong>Roll Number:</strong> {user.rollNumber}</p>
                              <p><strong>Room:</strong> {user.roomNumber}</p>
                              <p><strong>Phone:</strong> {user.phoneNumber}</p>
                              <p><strong>Registered:</strong> {user.registeredDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default">Active</Badge>
                            <Button
                              onClick={() => window.open(`tel:${user.phoneNumber}`)}
                              size="sm"
                              variant="outline"
                              className="border-purple-300 text-purple-600 hover:bg-purple-50"
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authorized Students Tab - Admin Only */}
          {currentUser?.rollNumber === 'admin' && (
            <TabsContent value="authorized" className="mt-6">
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Shield className="h-5 w-5" />
                    Authorized Students
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Bulk Upload Section */}
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 text-green-800">Bulk Upload Students</h3>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="flex-1">
                        <Label htmlFor="studentsFile">Upload CSV File</Label>
                        <Input
                          id="studentsFile"
                          type="file"
                          accept=".csv"
                          onChange={handleBulkStudentUpload}
                          className="border-green-300 focus:border-green-500"
                        />
                      </div>
                      <Button
                        onClick={() => document.getElementById('studentsFile')?.click()}
                        className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Students
                      </Button>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      CSV should have columns: roll_number, name
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {authorizedStudents.map((student) => (
                      <Card key={student.id} className="border-l-4 border-l-green-500 bg-white shadow-md">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{student.name}</h3>
                              <p className="text-sm text-gray-600">Roll Number: {student.roll_number}</p>
                            </div>
                            <Badge variant="default">Authorized</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Reports Tab - Admin Only */}
          {currentUser?.rollNumber === 'admin' && (
            <TabsContent value="reports" className="mt-6">
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Download className="h-5 w-5" />
                    Reports & Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-2 border-indigo-200">
                      <CardContent className="p-4 text-center">
                        <Download className="h-12 w-12 mx-auto mb-4 text-indigo-600" />
                        <h3 className="text-lg font-semibold mb-2">Inventory Report</h3>
                        <p className="text-sm text-gray-600 mb-4">Download complete inventory data</p>
                        <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                          Download CSV
                        </Button>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-purple-200">
                      <CardContent className="p-4 text-center">
                        <Activity className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                        <h3 className="text-lg font-semibold mb-2">Issues Report</h3>
                        <p className="text-sm text-gray-600 mb-4">Download all issue records</p>
                        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                          Download CSV
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Dialogs */}
      <UserSignup 
        open={showSignup} 
        onOpenChange={setShowSignup}
        authorizedStudents={authorizedStudents}
        onSignup={handleSignup}
      />

      <UserSignin 
        open={showSignin} 
        onOpenChange={setShowSignin}
        users={convertedUsers}
        onSignin={handleSignin}
      />

      {currentUser && (
        <>
          <UserProfile
            user={currentUser}
            issues={convertedIssues}
            onPasswordChange={handlePasswordChange}
            onLogout={handleLogout}
            open={showProfile}
            onOpenChange={setShowProfile}
          />

          <TransferDialog
            open={showTransferDialog}
            onOpenChange={setShowTransferDialog}
            item={selectedItemForTransfer}
            currentUser={currentUser}
            users={convertedUsers}
            onTransfer={handleTransferRequest}
          />

          <NotificationsDialog
            open={showNotifications}
            onOpenChange={setShowNotifications}
            notifications={notifications}
            transferRequests={transferRequests}
            currentUser={currentUser}
            onApproveTransfer={handleApproveTransfer}
            onRejectTransfer={handleRejectTransfer}
            onMarkAsRead={handleMarkNotificationAsRead}
          />
        </>
      )}

      {/* Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">Request Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-medium">{selectedItem.name}</h3>
                <p className="text-sm text-gray-600">Category: {selectedItem.category}</p>
                <p className="text-sm text-gray-600">Available: {selectedItem.available}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name</Label>
                  <Input
                    id="studentName"
                    value={requestForm.studentName}
                    onChange={(e) => setRequestForm({...requestForm, studentName: e.target.value})}
                    className="border-gray-300 focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentId">Roll Number</Label>
                  <Input
                    id="studentId"
                    value={requestForm.studentId}
                    onChange={(e) => setRequestForm({...requestForm, studentId: e.target.value})}
                    className="border-gray-300 focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input
                    id="roomNumber"
                    value={requestForm.roomNumber}
                    onChange={(e) => setRequestForm({...requestForm, roomNumber: e.target.value})}
                    className="border-gray-300 focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={requestForm.phoneNumber}
                    onChange={(e) => setRequestForm({...requestForm, phoneNumber: e.target.value})}
                    className="border-gray-300 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={requestForm.notes}
                  onChange={(e) => setRequestForm({...requestForm, notes: e.target.value})}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="border-gray-300 focus:border-green-500"
                />
              </div>
              <Button 
                onClick={handleSubmitRequest} 
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                Submit Request
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-orange-600">Edit Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Item Name</Label>
                <Input
                  id="editName"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  className="border-gray-300 focus:border-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCategory">Category</Label>
                <Select value={editingItem.category} onValueChange={(value) => setEditingItem({...editingItem, category: value})}>
                  <SelectTrigger className="border-gray-300 focus:border-orange-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Books">Books</SelectItem>
                    <SelectItem value="Tools">Tools</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editQuantity">Total Quantity</Label>
                  <Input
                    id="editQuantity"
                    type="number"
                    value={editingItem.quantity}
                    onChange={(e) => setEditingItem({...editingItem, quantity: parseInt(e.target.value) || 0})}
                    className="border-gray-300 focus:border-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editAvailable">Available</Label>
                  <Input
                    id="editAvailable"
                    type="number"
                    value={editingItem.available}
                    onChange={(e) => setEditingItem({...editingItem, available: parseInt(e.target.value) || 0})}
                    className="border-gray-300 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCondition">Condition</Label>
                <Select value={editingItem.condition} onValueChange={(value) => setEditingItem({...editingItem, condition: value})}>
                  <SelectTrigger className="border-gray-300 focus:border-orange-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleUpdateItem} 
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Update Item
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 mt-12">
        <div className="text-center">
          <p className="text-xl md:text-2xl font-bold mb-2">🔥 HALL 3 KA TEMPO HIGH HAI 🔥</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-xs md:text-sm opacity-80">Website created by Sanjay Khara (Y23). All rights reserved</p>
            <a 
              href="https://www.linkedin.com/in/sanjay-khara-340abb2a0" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              <Linkedin className="h-3 w-3 text-white" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
