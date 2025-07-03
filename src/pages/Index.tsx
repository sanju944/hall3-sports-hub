import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LogIn, LogOut, Plus, Edit, Trash2, Download, Package, Users, Activity, Trophy, Shield, ArrowRight, ArrowLeft, Bell, Check, X, Phone, Upload, UserPlus, User, Linkedin } from 'lucide-react';
import UserSignup from '@/components/UserSignup';
import UserSignin from '@/components/UserSignin';
import UserProfile from '@/components/UserProfile';
import { useSupabaseData } from '@/hooks/useSupabaseData';

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
}

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showUserSignin, setShowUserSignin] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  const {
    inventory,
    users,
    issues,
    returnRequests,
    notifications,
    authorizedStudents,
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
    addAuthorizedStudents
  } = useSupabaseData();

  // Form states
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 0,
    condition: 'Good'
  });

  const [issueForm, setIssueForm] = useState({
    itemId: '',
    notes: ''
  });

  const [returnForm, setReturnForm] = useState({
    issueId: '',
    notes: ''
  });

  useEffect(() => {
    // Load auth state from localStorage
    const savedAuth = localStorage.getItem('hall3-auth');
    const savedCurrentUser = localStorage.getItem('hall3-current-user');

    if (savedAuth === 'true') {
      setIsLoggedIn(true);
    }
    if (savedCurrentUser) {
      setCurrentUser(JSON.parse(savedCurrentUser));
    }
  }, []);

  const handleLogin = () => {
    if (email === 'sanjaykhara9876@gmail.com' && password === 'Hall3isbest') {
      setIsLoggedIn(true);
      localStorage.setItem('hall3-auth', 'true');
      setShowLogin(false);
      setEmail('');
      setPassword('');
      toast({
        title: "Admin Login Successful",
        description: "Welcome to Hall-3 Sports Inventory Admin Panel!",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid admin credentials. Access denied.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('hall3-auth');
    setEmail('');
    setPassword('');
    toast({
      title: "Admin Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const handleUserLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('hall3-current-user', JSON.stringify(user));
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hall3-current-user');
    setShowUserProfile(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const handleUserRegister = async (user: User) => {
    try {
      await addUser({
        roll_number: user.rollNumber,
        name: user.name,
        phone_number: user.phoneNumber,
        room_number: user.roomNumber,
        password: user.password,
        registered_date: user.registeredDate
      });
      toast({
        title: "User Registered",
        description: "User has been registered successfully.",
      });
    } catch (error) {
      console.error('Error registering user:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (userId: string, newPassword: string) => {
    try {
      await updateUser(userId, { password: newPassword });

      if (currentUser && currentUser.id === userId) {
        const updatedCurrentUser = { ...currentUser, password: newPassword };
        setCurrentUser(updatedCurrentUser);
        localStorage.setItem('hall3-current-user', JSON.stringify(updatedCurrentUser));
      }

      toast({
        title: "Password Updated",
        description: "Password has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const students: { roll_number: string; name: string }[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            const [rollNumber, name] = line.split(',').map(item => item.trim().replace(/"/g, ''));
            if (rollNumber && name) {
              students.push({ roll_number: rollNumber, name });
            }
          }
        }

        await addAuthorizedStudents(students);
        setShowUploadDialog(false);
        
        toast({
          title: "Student List Uploaded",
          description: `${students.length} authorized students loaded successfully.`,
        });
      } catch (error) {
        console.error('Error uploading students:', error);
        toast({
          title: "Upload Failed",
          description: "Failed to upload student list. Please try again.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const isStudentAuthorized = (rollNumber: string, studentName: string) => {
    if (authorizedStudents.length === 0) return true;
    return authorizedStudents.some(student => 
      student.roll_number.toLowerCase() === rollNumber.toLowerCase() && 
      student.name.toLowerCase() === studentName.toLowerCase()
    );
  };

  const handleAddInventoryItem = async () => {
    if (!newItem.name || !newItem.category || newItem.quantity <= 0) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
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
        added_date: new Date().toISOString().split('T')[0]
      });

      setNewItem({ name: '', category: '', quantity: 0, condition: 'Good' });
      setShowAddItem(false);
      
      toast({
        title: "Item Added",
        description: `${newItem.name} has been added to inventory.`,
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Add Failed",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInventoryItem = async (id: string) => {
    try {
      await deleteInventoryItem(id);
      toast({
        title: "Item Deleted",
        description: "Item has been removed from inventory.",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleIssueItem = async () => {
    if (!issueForm.itemId || !currentUser) {
      toast({
        title: "Error",
        description: "Please select an item and make sure you're logged in.",
        variant: "destructive",
      });
      return;
    }

    const item = inventory.find(i => i.id === issueForm.itemId);
    if (!item || item.available <= 0) {
      toast({
        title: "Error",
        description: "Item not available for issue.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Add issue record
      await addIssue({
        item_id: issueForm.itemId,
        item_name: item.name,
        student_name: currentUser.name,
        student_id: currentUser.rollNumber,
        room_number: currentUser.roomNumber,
        phone_number: currentUser.phoneNumber,
        issue_date: new Date().toISOString().split('T')[0],
        status: 'issued',
        notes: issueForm.notes || null,
        return_date: null
      });

      // Update inventory availability
      await updateInventoryItem(issueForm.itemId, { 
        available: item.available - 1 
      });

      // Add notification
      await addNotification({
        type: 'issue',
        message: `New item issued: ${item.name} to ${currentUser.name} (${currentUser.rollNumber})`,
        read: false,
        data: { item_name: item.name, student_name: currentUser.name, student_id: currentUser.rollNumber }
      });

      setIssueForm({ itemId: '', notes: '' });
      setShowIssueDialog(false);

      toast({
        title: "Item Issued",
        description: `${item.name} issued successfully`,
      });
    } catch (error) {
      console.error('Error issuing item:', error);
      toast({
        title: "Issue Failed",
        description: "Failed to issue item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRequestReturn = async () => {
    if (!returnForm.issueId || !currentUser) {
      toast({
        title: "Error",
        description: "Please select an item and make sure you're logged in.",
        variant: "destructive",
      });
      return;
    }

    const issue = issues.find(i => i.id === returnForm.issueId);
    if (!issue) return;

    try {
      await addReturnRequest({
        issue_id: returnForm.issueId,
        request_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        notes: returnForm.notes || null
      });

      await addNotification({
        type: 'return_request',
        message: `Return request for ${issue.item_name} by ${issue.student_name} (${issue.student_id})`,
        read: false,
        data: { issue_id: issue.id, item_name: issue.item_name, student_name: issue.student_name }
      });

      setReturnForm({ issueId: '', notes: '' });
      setShowReturnDialog(false);

      toast({
        title: "Return Request Submitted",
        description: `Return request for ${issue.item_name} has been submitted to admin.`,
      });
    } catch (error) {
      console.error('Error requesting return:', error);
      toast({
        title: "Request Failed",
        description: "Failed to submit return request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApproveReturnRequest = async (requestId: string) => {
    const returnRequest = returnRequests.find(r => r.id === requestId);
    if (!returnRequest) return;

    const issue = issues.find(i => i.id === returnRequest.issue_id);
    if (!issue) return;

    try {
      // Update return request status
      await updateReturnRequest(requestId, { status: 'approved' });

      // Update issue status
      await updateIssue(returnRequest.issue_id, { 
        status: 'returned',
        return_date: new Date().toISOString().split('T')[0]
      });

      // Update inventory availability
      const item = inventory.find(i => i.id === issue.item_id);
      if (item) {
        const newAvailable = Math.min(item.available + 1, item.quantity);
        await updateInventoryItem(issue.item_id, { available: newAvailable });
      }

      // Remove notification
      const notificationToRemove = notifications.find(n => 
        n.data && typeof n.data === 'object' && 'issue_id' in n.data && n.data.issue_id === returnRequest.issue_id
      );
      if (notificationToRemove) {
        await deleteNotification(notificationToRemove.id);
      }

      toast({
        title: "Return Approved",
        description: `${issue.item_name} return approved for ${issue.student_name}`,
      });
    } catch (error) {
      console.error('Error approving return:', error);
      toast({
        title: "Approval Failed",
        description: "Failed to approve return. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectReturnRequest = async (requestId: string) => {
    try {
      await updateReturnRequest(requestId, { status: 'rejected' });

      const notificationToRemove = notifications.find(n => 
        n.data && typeof n.data === 'object' && 'issue_id' in n.data
      );
      if (notificationToRemove) {
        await deleteNotification(notificationToRemove.id);
      }

      toast({
        title: "Return Request Rejected",
        description: "Return request has been rejected.",
      });
    } catch (error) {
      console.error('Error rejecting return:', error);
      toast({
        title: "Rejection Failed",
        description: "Failed to reject return. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkNotificationAsRead = async (id: string) => {
    try {
      await updateNotification(id, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleRemoveNotification = async (id: string) => {
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  const exportToExcel = () => {
    const csvContent = [
      ['INVENTORY DATA'],
      ['Item Name', 'Category', 'Total Quantity', 'Available', 'Condition', 'Added Date'],
      ...inventory.map(item => [
        item.name,
        item.category,
        item.quantity,
        item.available,
        item.condition,
        item.added_date
      ]),
      [''],
      ['ISSUE/RETURN DATA'],
      ['Item Name', 'Student Name', 'Student ID', 'Room Number', 'Phone Number', 'Issue Date', 'Return Date', 'Status', 'Notes'],
      ...issues.map(issue => [
        issue.item_name,
        issue.student_name,
        issue.student_id,
        issue.room_number,
        issue.phone_number,
        issue.issue_date,
        issue.return_date || 'Not Returned',
        issue.status,
        issue.notes || ''
      ]),
      [''],
      ['REGISTERED USERS DATA'],
      ['Roll Number', 'Name', 'Phone Number', 'Room Number', 'Registration Date'],
      ...users.map(user => [
        user.roll_number,
        user.name,
        user.phone_number,
        user.room_number,
        user.registered_date
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hall3_Sports_Inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "All data has been exported to CSV file.",
    });
  };

  const getUserIssues = (studentId: string) => {
    return issues.filter(issue => 
      issue.student_id === studentId && 
      issue.status === 'issued'
    );
  };

  // Convert inventory data with proper field mapping
  const convertedInventory = inventory.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    available: item.available,
    condition: item.condition,
    addedDate: item.added_date
  }));

  // Convert users data for components
  const convertedUsers = users.map(user => ({
    id: user.id,
    rollNumber: user.roll_number,
    name: user.name,
    phoneNumber: user.phone_number,
    roomNumber: user.room_number,
    password: user.password,
    registeredDate: user.registered_date
  }));

  const convertedAuthorizedStudents = authorizedStudents.map(student => ({
    rollNumber: student.roll_number,
    name: student.name
  }));

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Sort issues by latest first
  const sortedIssues = [...issues].sort((a, b) => {
    const dateA = new Date(a.issue_date + 'T00:00:00');
    const dateB = new Date(b.issue_date + 'T00:00:00');
    return dateB.getTime() - dateA.getTime();
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Hall-3 Sports Inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Logo */}
      <div className="relative h-56 md:h-72 bg-gradient-to-r from-slate-100 to-gray-100 border-b-4 border-red-500">
        {/* Logo - Centered and Enlarged */}
        <img 
          src="/lovable-uploads/5b532a8c-4c79-4972-b351-f890ab065309.png" 
          alt="Hall-3 Sports Logo" 
          className="absolute top-3 md:top-6 left-1/2 transform -translate-x-1/2 h-12 w-12 md:h-20 md:w-20 lg:h-24 lg:w-24 object-contain z-10"
        />
        
        {/* Student Auth Buttons */}
        {!currentUser && !isLoggedIn && (
          <>
            <div className="absolute top-2 md:top-4 left-2 md:left-4 z-20">
              <Button 
                onClick={() => setShowSignup(true)}
                variant="outline" 
                size="sm"
                className="bg-white border-green-500 text-green-600 hover:bg-green-50 shadow-lg text-xs"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Sign Up
              </Button>
            </div>
            
            <div className="absolute top-2 md:top-4 right-2 md:right-4 z-20">
              <Button 
                onClick={() => setShowUserSignin(true)}
                variant="outline" 
                size="sm"
                className="bg-white border-blue-500 text-blue-600 hover:bg-blue-50 shadow-lg text-xs"
              >
                <LogIn className="h-3 w-3 mr-1" />
                Sign In
              </Button>
            </div>
          </>
        )}

        {currentUser && (
          <div className="absolute top-2 md:top-4 right-2 md:right-4 z-20">
            <Button 
              onClick={() => setShowUserProfile(true)}
              variant="outline" 
              size="sm"
              className="bg-white border-purple-500 text-purple-600 hover:bg-purple-50 shadow-lg text-xs"
            >
              <User className="h-3 w-3 mr-1" />
              {currentUser.name}
            </Button>
          </div>
        )}
        
        {/* Main Title and Subtitle */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full pt-16 md:pt-24">
          <div className="text-center text-gray-800 px-4">
            <h1 className="text-lg md:text-3xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Hall-3 Sports Inventory Tracker
            </h1>
            <p className="text-xs md:text-lg lg:text-xl font-semibold text-gray-600 mb-4">
              Sports Equipment Management System
            </p>
            
            <div className="flex justify-center">
              {!isLoggedIn ? (
                <Dialog open={showLogin} onOpenChange={setShowLogin}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white border-red-500 text-red-600 hover:bg-red-50 shadow-lg text-xs"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Admin Login
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-center text-red-600 text-xl font-bold flex items-center justify-center gap-2">
                        <LogIn className="h-6 w-6" />
                        Admin Login
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 p-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-gray-300 focus:border-red-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="border-gray-300 focus:border-red-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        />
                      </div>
                      <Button 
                        onClick={handleLogin} 
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                      >
                        Login as Admin
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge variant="default" className="bg-green-600 text-white text-xs">Admin</Badge>
                  
                  <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white border-purple-500 text-purple-600 hover:bg-purple-50"
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Upload
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle>Upload Student List</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="excel-file">Upload Excel/CSV File</Label>
                          <Input
                            id="excel-file"
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleExcelUpload}
                            className="border-gray-300 focus:border-red-500"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Upload CSV with columns: Roll Number, Student Name
                          </p>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Current authorized students: <Badge>{authorizedStudents.length}</Badge></p>
                          <p>Registered users: <Badge>{users.length}</Badge></p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white border-blue-500 text-blue-600 hover:bg-blue-50 relative"
                      >
                        <Bell className="h-3 w-3" />
                        {unreadNotifications > 0 && (
                          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
                            {unreadNotifications}
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
                                onClick={() => handleRemoveNotification(notification.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <div onClick={() => handleMarkNotificationAsRead(notification.id)}>
                                <p className="text-sm font-medium pr-6">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notification.created_at).toLocaleString()}
                                </p>
                                {notification.type === 'return_request' && (
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const returnRequest = returnRequests.find(r => 
                                          notification.data && typeof notification.data === 'object' && 'issue_id' in notification.data && r.issue_id === notification.data.issue_id
                                        );
                                        if (returnRequest) {
                                          handleApproveReturnRequest(returnRequest.id);
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
                                        const returnRequest = returnRequests.find(r => 
                                          notification.data && typeof notification.data === 'object' && 'issue_id' in notification.data && r.issue_id === notification.data.issue_id
                                        );
                                        if (returnRequest) {
                                          handleRejectReturnRequest(returnRequest.id);
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

                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="bg-white border-red-500 text-red-600 hover:bg-red-50 text-xs"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Issue/Return Action Buttons */}
      {currentUser && (
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex-1 sm:flex-none">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Issue Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white max-w-md">
                  <DialogHeader>
                    <DialogTitle>Issue Sports Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">Issuing to: {currentUser.name}</p>
                      <p className="text-sm text-gray-600">Roll Number: {currentUser.rollNumber}</p>
                    </div>
                    <div>
                      <Label htmlFor="item">Select Item</Label>
                      <Select onValueChange={(value) => setIssueForm({...issueForm, itemId: value})}>
                        <SelectTrigger className="border-gray-300 focus:border-red-500">
                          <SelectValue placeholder="Select item to issue" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventory.filter(item => item.available > 0).map(item => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} (Available: {item.available})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={issueForm.notes}
                        onChange={(e) => setIssueForm({...issueForm, notes: e.target.value})}
                        className="border-gray-300 focus:border-red-500"
                      />
                    </div>
                    <Button onClick={handleIssueItem} className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                      Issue Item
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50 flex-1 sm:flex-none">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Request Return
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white max-w-md">
                  <DialogHeader>
                    <DialogTitle>Request Item Return</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="returnItem">Select Your Issued Item</Label>
                      <Select onValueChange={(value) => setReturnForm({...returnForm, issueId: value})}>
                        <SelectTrigger className="border-gray-300 focus:border-red-500">
                          <SelectValue placeholder="Select your issued item" />
                        </SelectTrigger>
                        <SelectContent>
                          {getUserIssues(currentUser.rollNumber).map(issue => (
                            <SelectItem key={issue.id} value={issue.id}>
                              {issue.item_name} (Issued: {issue.issue_date})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="returnNotes">Return Notes (Optional)</Label>
                      <Textarea
                        id="returnNotes"
                        value={returnForm.notes}
                        onChange={(e) => setReturnForm({...returnForm, notes: e.target.value})}
                        className="border-gray-300 focus:border-red-500"
                        placeholder="Any damage or notes about the return..."
                      />
                    </div>
                    <Button onClick={handleRequestReturn} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      Request Return
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      )}

      {/* Admin Controls Bar */}
      {isLoggedIn && (
        <div className="bg-red-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold">Admin Dashboard</h2>
              </div>
              <Button
                onClick={exportToExcel}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90">Total Items</p>
                  <p className="text-lg md:text-2xl font-bold">{convertedInventory.length}</p>
                </div>
                <Package className="h-6 w-6 md:h-8 md:w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90">Available</p>
                  <p className="text-lg md:text-2xl font-bold">{convertedInventory.reduce((sum, item) => sum + item.available, 0)}</p>
                </div>
                <Trophy className="h-6 w-6 md:h-8 md:w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90">Issued</p>
                  <p className="text-lg md:text-2xl font-bold">{issues.filter(i => i.status === 'issued').length}</p>
                </div>
                <Users className="h-6 w-6 md:h-8 md:w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90">Users</p>
                  <p className="text-lg md:text-2xl font-bold">{users.length}</p>
                </div>
                <Activity className="h-6 w-6 md:h-8 md:w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
            <TabsTrigger value="inventory" className="data-[state=active]:bg-white">Sports Inventory</TabsTrigger>
            <TabsTrigger value="issues" className="data-[state=active]:bg-white">Issue & Return</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Sports Inventory</h2>
              {isLoggedIn && (
                <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Add New Sports Item</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Item Name</Label>
                        <Input
                          id="name"
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                          className="border-gray-300 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select onValueChange={(value) => setNewItem({...newItem, category: value})}>
                          <SelectTrigger className="border-gray-300 focus:border-red-500">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cricket">Cricket</SelectItem>
                            <SelectItem value="Football">Football</SelectItem>
                            <SelectItem value="Basketball">Basketball</SelectItem>
                            <SelectItem value="Badminton">Badminton</SelectItem>
                            <SelectItem value="Tennis">Tennis</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                          className="border-gray-300 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="condition">Condition</Label>
                        <Select onValueChange={(value) => setNewItem({...newItem, condition: value})}>
                          <SelectTrigger className="border-gray-300 focus:border-red-500">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Excellent">Excellent</SelectItem>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Fair">Fair</SelectItem>
                            <SelectItem value="Poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddInventoryItem} className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                        Add Item
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="grid gap-4">
              {convertedInventory.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-red-500 bg-white shadow-md">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                          <span>Category: <Badge variant="outline" className="border-red-200 text-red-700">{item.category}</Badge></span>
                          <span>Total: {item.quantity}</span>
                          <span>Available: <Badge variant={item.available > 0 ? "default" : "destructive"}>{item.available}</Badge></span>
                          <span>Condition: <Badge variant="secondary">{item.condition}</Badge></span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Added: {item.addedDate}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentUser && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={item.available <= 0}
                                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 disabled:opacity-50"
                              >
                                <ArrowRight className="h-4 w-4 mr-1" />
                                Issue
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white max-w-md">
                              <DialogHeader>
                                <DialogTitle>Issue {item.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm font-medium">Item: {item.name}</p>
                                  <p className="text-sm text-gray-600">Available: {item.available}</p>
                                  <p className="text-sm text-gray-600">Issuing to: {currentUser.name} ({currentUser.rollNumber})</p>
                                </div>
                                <div>
                                  <Label htmlFor="notes">Notes (Optional)</Label>
                                  <Textarea
                                    id="notes"
                                    value={issueForm.notes}
                                    onChange={(e) => setIssueForm({...issueForm, notes: e.target.value})}
                                    className="border-gray-300 focus:border-red-500"
                                  />
                                </div>
                                <Button 
                                  onClick={() => {
                                    setIssueForm({...issueForm, itemId: item.id});
                                    handleIssueItem();
                                  }} 
                                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                >
                                  Issue {item.name}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        
                        {isLoggedIn && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingItem(item)}
                              className="border-gray-300 hover:bg-gray-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteInventoryItem(item.id)}
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
              
              {inventory.length === 0 && (
                <Card className="bg-gray-50">
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No sports equipment added yet.</p>
                    {isLoggedIn && <p className="text-sm text-gray-500 mt-2">Add your first item using the "Add Item" button above.</p>}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Issue & Return Management</h2>
            </div>

            <div className="grid gap-4">
              {sortedIssues.map((issue) => (
                <Card key={issue.id} className={`border-l-4 ${issue.status === 'issued' ? 'border-l-yellow-500' : 'border-l-green-500'} bg-white shadow-md`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{issue.item_name}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                          <span>Student: {issue.student_name}</span>
                          <span>Roll No: {issue.student_id}</span>
                          <span>Room: {issue.room_number}</span>
                          <span>Phone: {issue.phone_number}</span>
                          <span>Issue Date: {issue.issue_date}</span>
                          {issue.return_date && <span>Return Date: {issue.return_date}</span>}
                          <span>
                            <Badge variant={issue.status === 'issued' ? "default" : "secondary"}>
                              {issue.status.toUpperCase()}
                            </Badge>
                          </span>
                        </div>
                        {issue.notes && <p className="text-sm text-gray-600 mt-1">Notes: {issue.notes}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {issues.length === 0 && (
                <Card className="bg-gray-50">
                  <CardContent className="p-8 text-center">
                    <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No items have been issued yet.</p>
                    <p className="text-sm text-gray-500 mt-2">Start issuing equipment using the "Issue Item" button above.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Auth Components */}
      <UserSignup
        authorizedStudents={convertedAuthorizedStudents}
        users={convertedUsers}
        onUserRegister={handleUserRegister}
        open={showSignup}
        onOpenChange={setShowSignup}
      />

      <UserSignin
        users={convertedUsers}
        onUserLogin={handleUserLogin}
        open={showUserSignin}
        onOpenChange={setShowUserSignin}
      />

      {currentUser && (
        <UserProfile
          user={currentUser}
          issues={issues.map(issue => ({
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
          }))}
          onPasswordChange={handlePasswordChange}
          onLogout={handleUserLogout}
          open={showUserProfile}
          onOpenChange={setShowUserProfile}
        />
      )}

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
