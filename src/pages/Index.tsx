
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
import { LogIn, LogOut, Plus, Edit, Trash2, Download, Package, Users, Activity, Trophy, Shield, ArrowRight, ArrowLeft, Bell, Check, X } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  available: number;
  condition: string;
  addedDate: string;
}

interface IssueRecord {
  id: string;
  itemId: string;
  itemName: string;
  studentName: string;
  studentId: string;
  roomNumber: string;
  issueDate: string;
  returnDate?: string;
  status: 'issued' | 'returned';
  notes?: string;
}

interface ReturnRequest {
  id: string;
  issueId: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

interface Notification {
  id: string;
  type: 'issue' | 'return_request';
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  // Form states
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 0,
    condition: 'Good'
  });

  const [issueForm, setIssueForm] = useState({
    itemId: '',
    studentName: '',
    studentId: '',
    roomNumber: '',
    notes: ''
  });

  const [returnForm, setReturnForm] = useState({
    issueId: '',
    notes: ''
  });

  useEffect(() => {
    // Load data from localStorage
    const savedInventory = localStorage.getItem('hall3-inventory');
    const savedIssues = localStorage.getItem('hall3-issues');
    const savedReturnRequests = localStorage.getItem('hall3-return-requests');
    const savedNotifications = localStorage.getItem('hall3-notifications');
    const savedAuth = localStorage.getItem('hall3-auth');

    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    }
    if (savedIssues) {
      setIssues(JSON.parse(savedIssues));
    }
    if (savedReturnRequests) {
      setReturnRequests(JSON.parse(savedReturnRequests));
    }
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
    if (savedAuth === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const addNotification = (type: 'issue' | 'return_request', message: string, data?: any) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      data
    };
    
    const updatedNotifications = [notification, ...notifications];
    setNotifications(updatedNotifications);
    localStorage.setItem('hall3-notifications', JSON.stringify(updatedNotifications));
  };

  const markNotificationAsRead = (id: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('hall3-notifications', JSON.stringify(updatedNotifications));
  };

  const handleLogin = () => {
    if (email === 'sanjaykhara9876@gmail.com' && password === 'bakchodHall3') {
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

  const addInventoryItem = () => {
    if (!newItem.name || !newItem.category || newItem.quantity <= 0) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    const item: InventoryItem = {
      id: Date.now().toString(),
      name: newItem.name,
      category: newItem.category,
      quantity: newItem.quantity,
      available: newItem.quantity,
      condition: newItem.condition,
      addedDate: new Date().toISOString().split('T')[0]
    };

    const updatedInventory = [...inventory, item];
    setInventory(updatedInventory);
    localStorage.setItem('hall3-inventory', JSON.stringify(updatedInventory));
    
    setNewItem({ name: '', category: '', quantity: 0, condition: 'Good' });
    setShowAddItem(false);
    
    toast({
      title: "Item Added",
      description: `${item.name} has been added to inventory.`,
    });
  };

  const deleteInventoryItem = (id: string) => {
    const updatedInventory = inventory.filter(item => item.id !== id);
    setInventory(updatedInventory);
    localStorage.setItem('hall3-inventory', JSON.stringify(updatedInventory));
    
    toast({
      title: "Item Deleted",
      description: "Item has been removed from inventory.",
    });
  };

  const issueItem = () => {
    if (!issueForm.itemId || !issueForm.studentName || !issueForm.studentId || !issueForm.roomNumber) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
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

    const issue: IssueRecord = {
      id: Date.now().toString(),
      itemId: issueForm.itemId,
      itemName: item.name,
      studentName: issueForm.studentName,
      studentId: issueForm.studentId,
      roomNumber: issueForm.roomNumber,
      issueDate: new Date().toISOString().split('T')[0],
      status: 'issued',
      notes: issueForm.notes
    };

    // Update inventory availability
    const updatedInventory = inventory.map(i => 
      i.id === issueForm.itemId 
        ? { ...i, available: i.available - 1 }
        : i
    );
    
    const updatedIssues = [...issues, issue];

    setInventory(updatedInventory);
    setIssues(updatedIssues);
    localStorage.setItem('hall3-inventory', JSON.stringify(updatedInventory));
    localStorage.setItem('hall3-issues', JSON.stringify(updatedIssues));

    // Add notification for admin
    addNotification('issue', `New item issued: ${item.name} to ${issueForm.studentName} (${issueForm.studentId})`, issue);

    setIssueForm({ itemId: '', studentName: '', studentId: '', roomNumber: '', notes: '' });
    setShowIssueDialog(false);

    toast({
      title: "Item Issued",
      description: `${item.name} issued to ${issueForm.studentName}`,
    });
  };

  const requestReturn = () => {
    if (!returnForm.issueId) {
      toast({
        title: "Error",
        description: "Please select an item to return.",
        variant: "destructive",
      });
      return;
    }

    const issue = issues.find(i => i.id === returnForm.issueId);
    if (!issue) return;

    const returnRequest: ReturnRequest = {
      id: Date.now().toString(),
      issueId: returnForm.issueId,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: returnForm.notes
    };

    const updatedReturnRequests = [...returnRequests, returnRequest];
    setReturnRequests(updatedReturnRequests);
    localStorage.setItem('hall3-return-requests', JSON.stringify(updatedReturnRequests));

    // Add notification for admin
    addNotification('return_request', `Return request for ${issue.itemName} by ${issue.studentName} (${issue.studentId})`, { issue, returnRequest });

    setReturnForm({ issueId: '', notes: '' });
    setShowReturnDialog(false);

    toast({
      title: "Return Request Submitted",
      description: `Return request for ${issue.itemName} has been submitted to admin.`,
    });
  };

  const approveReturnRequest = (requestId: string) => {
    const returnRequest = returnRequests.find(r => r.id === requestId);
    if (!returnRequest) return;

    const issue = issues.find(i => i.id === returnRequest.issueId);
    if (!issue) return;

    // Update return request status
    const updatedReturnRequests = returnRequests.map(r => 
      r.id === requestId ? { ...r, status: 'approved' as const } : r
    );

    // Update issue status
    const updatedIssues = issues.map(i => 
      i.id === returnRequest.issueId 
        ? { ...i, status: 'returned' as const, returnDate: new Date().toISOString().split('T')[0] }
        : i
    );

    // Update inventory availability
    const updatedInventory = inventory.map(i => 
      i.id === issue.itemId 
        ? { ...i, available: i.available + 1 }
        : i
    );

    setReturnRequests(updatedReturnRequests);
    setIssues(updatedIssues);
    setInventory(updatedInventory);

    localStorage.setItem('hall3-return-requests', JSON.stringify(updatedReturnRequests));
    localStorage.setItem('hall3-issues', JSON.stringify(updatedIssues));
    localStorage.setItem('hall3-inventory', JSON.stringify(updatedInventory));

    toast({
      title: "Return Approved",
      description: `${issue.itemName} return approved for ${issue.studentName}`,
    });
  };

  const rejectReturnRequest = (requestId: string) => {
    const updatedReturnRequests = returnRequests.map(r => 
      r.id === requestId ? { ...r, status: 'rejected' as const } : r
    );
    setReturnRequests(updatedReturnRequests);
    localStorage.setItem('hall3-return-requests', JSON.stringify(updatedReturnRequests));

    toast({
      title: "Return Request Rejected",
      description: "Return request has been rejected.",
    });
  };

  const exportToExcel = () => {
    const csvContent = [
      // Inventory Header
      ['INVENTORY DATA'],
      ['Item Name', 'Category', 'Total Quantity', 'Available', 'Condition', 'Added Date'],
      ...inventory.map(item => [
        item.name,
        item.category,
        item.quantity,
        item.available,
        item.condition,
        item.addedDate
      ]),
      [''],
      // Issues Header
      ['ISSUE/RETURN DATA'],
      ['Item Name', 'Student Name', 'Student ID', 'Room Number', 'Issue Date', 'Return Date', 'Status', 'Notes'],
      ...issues.map(issue => [
        issue.itemName,
        issue.studentName,
        issue.studentId,
        issue.roomNumber,
        issue.issueDate,
        issue.returnDate || 'Not Returned',
        issue.status,
        issue.notes || ''
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
      description: "Inventory data has been exported to CSV file.",
    });
  };

  const getUserIssues = (studentName: string, studentId: string) => {
    return issues.filter(issue => 
      issue.studentName === studentName && 
      issue.studentId === studentId && 
      issue.status === 'issued'
    );
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Logo */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-slate-100 to-gray-100 border-b-4 border-red-500">
        <img 
          src="/lovable-uploads/5b532a8c-4c79-4972-b351-f890ab065309.png" 
          alt="Hall-3 Sports Logo" 
          className="absolute top-4 md:top-8 left-1/2 transform -translate-x-1/2 h-20 w-20 md:h-28 md:w-28 object-contain z-10"
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-gray-800 mt-16 md:mt-20 px-4">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Hall-3 Sports Inventory Tracker
            </h1>
            <p className="text-sm md:text-xl lg:text-2xl font-semibold text-gray-600">
              Sports Equipment Management System
            </p>
          </div>
        </div>
        
        {/* Admin Login Button - Top Right */}
        <div className="absolute top-2 md:top-4 right-2 md:right-4 z-20">
          {!isLoggedIn ? (
            <Dialog open={showLogin} onOpenChange={setShowLogin}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white border-red-500 text-red-600 hover:bg-red-50 shadow-lg text-xs md:text-sm"
                >
                  <Shield className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
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
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600 text-white text-xs">Admin</Badge>
              
              {/* Notifications Button */}
              <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white border-blue-500 text-blue-600 hover:bg-blue-50 relative"
                  >
                    <Bell className="h-3 w-3 md:h-4 md:w-4" />
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
                          className={`p-3 rounded-lg border ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <p className="text-sm font-medium">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                          {notification.type === 'return_request' && notification.data && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  approveReturnRequest(notification.data.returnRequest.id);
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
                                  rejectReturnRequest(notification.data.returnRequest.id);
                                }}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
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
                className="bg-white border-red-500 text-red-600 hover:bg-red-50 text-xs md:text-sm"
              >
                <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Issue/Return Action Buttons - Visible to Everyone */}
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
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input
                      id="studentName"
                      value={issueForm.studentName}
                      onChange={(e) => setIssueForm({...issueForm, studentName: e.target.value})}
                      className="border-gray-300 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentId">Roll Number</Label>
                    <Input
                      id="studentId"
                      value={issueForm.studentId}
                      onChange={(e) => setIssueForm({...issueForm, studentId: e.target.value})}
                      className="border-gray-300 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input
                      id="roomNumber"
                      value={issueForm.roomNumber}
                      onChange={(e) => setIssueForm({...issueForm, roomNumber: e.target.value})}
                      className="border-gray-300 focus:border-red-500"
                    />
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
                  <Button onClick={issueItem} className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
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
                        {issues.filter(issue => issue.status === 'issued').map(issue => (
                          <SelectItem key={issue.id} value={issue.id}>
                            {issue.itemName} - {issue.studentName} ({issue.studentId})
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
                  <Button onClick={requestReturn} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                    Request Return
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

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
                  <p className="text-lg md:text-2xl font-bold">{inventory.length}</p>
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
                  <p className="text-lg md:text-2xl font-bold">{inventory.reduce((sum, item) => sum + item.available, 0)}</p>
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
                  <p className="text-xs md:text-sm opacity-90">Total Issues</p>
                  <p className="text-lg md:text-2xl font-bold">{issues.length}</p>
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
                      <Button onClick={addInventoryItem} className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                        Add Item
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="grid gap-4">
              {inventory.map((item) => (
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
                        {/* Issue Button for each item */}
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
                              </div>
                              <div>
                                <Label htmlFor="studentName">Student Name</Label>
                                <Input
                                  id="studentName"
                                  value={issueForm.studentName}
                                  onChange={(e) => setIssueForm({...issueForm, studentName: e.target.value, itemId: item.id})}
                                  className="border-gray-300 focus:border-red-500"
                                />
                              </div>
                              <div>
                                <Label htmlFor="studentId">Roll Number</Label>
                                <Input
                                  id="studentId"
                                  value={issueForm.studentId}
                                  onChange={(e) => setIssueForm({...issueForm, studentId: e.target.value})}
                                  className="border-gray-300 focus:border-red-500"
                                />
                              </div>
                              <div>
                                <Label htmlFor="roomNumber">Room Number</Label>
                                <Input
                                  id="roomNumber"
                                  value={issueForm.roomNumber}
                                  onChange={(e) => setIssueForm({...issueForm, roomNumber: e.target.value})}
                                  className="border-gray-300 focus:border-red-500"
                                />
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
                                  issueItem();
                                }} 
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                              >
                                Issue {item.name}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
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
                              onClick={() => deleteInventoryItem(item.id)}
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
              {issues.map((issue) => (
                <Card key={issue.id} className={`border-l-4 ${issue.status === 'issued' ? 'border-l-yellow-500' : 'border-l-green-500'} bg-white shadow-md`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{issue.itemName}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                          <span>Student: {issue.studentName}</span>
                          <span>Roll No: {issue.studentId}</span>
                          <span>Room: {issue.roomNumber}</span>
                          <span>Issue Date: {issue.issueDate}</span>
                          {issue.returnDate && <span>Return Date: {issue.returnDate}</span>}
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

      {/* Footer */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 mt-12">
        <div className="text-center">
          <p className="text-xl md:text-2xl font-bold mb-2">🔥 HALL 3 KA TEMPO HIGH HAI 🔥</p>
          <p className="text-xs md:text-sm opacity-80">Website created by Sanjay Khara (Y23), all rights are reserved to him.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
