
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
import { LogIn, LogOut, Plus, Edit, Trash2, Download, Package, Users, Activity, Trophy } from 'lucide-react';

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
  issueDate: string;
  returnDate?: string;
  status: 'issued' | 'returned';
  notes?: string;
}

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
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
    notes: ''
  });

  useEffect(() => {
    // Load data from localStorage
    const savedInventory = localStorage.getItem('hall3-inventory');
    const savedIssues = localStorage.getItem('hall3-issues');
    const savedAuth = localStorage.getItem('hall3-auth');

    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    }
    if (savedIssues) {
      setIssues(JSON.parse(savedIssues));
    }
    if (savedAuth === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    if (email === 'sanjaykhara9876@gmail.com' && password === 'bakchodHall3') {
      setIsLoggedIn(true);
      localStorage.setItem('hall3-auth', 'true');
      toast({
        title: "Login Successful",
        description: "Welcome to Hall-3 Sports Inventory Tracker!",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Access denied.",
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
      title: "Logged Out",
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
    if (!issueForm.itemId || !issueForm.studentName || !issueForm.studentId) {
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

    setIssueForm({ itemId: '', studentName: '', studentId: '', notes: '' });
    setShowIssueDialog(false);

    toast({
      title: "Item Issued",
      description: `${item.name} issued to ${issueForm.studentName}`,
    });
  };

  const returnItem = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    const updatedIssues = issues.map(i => 
      i.id === issueId 
        ? { ...i, status: 'returned' as const, returnDate: new Date().toISOString().split('T')[0] }
        : i
    );

    const updatedInventory = inventory.map(i => 
      i.id === issue.itemId 
        ? { ...i, available: i.available + 1 }
        : i
    );

    setIssues(updatedIssues);
    setInventory(updatedInventory);
    localStorage.setItem('hall3-issues', JSON.stringify(updatedIssues));
    localStorage.setItem('hall3-inventory', JSON.stringify(updatedInventory));

    toast({
      title: "Item Returned",
      description: `${issue.itemName} returned by ${issue.studentName}`,
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
      ['Item Name', 'Student Name', 'Student ID', 'Issue Date', 'Return Date', 'Status', 'Notes'],
      ...issues.map(issue => [
        issue.itemName,
        issue.studentName,
        issue.studentId,
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        {/* Hero Section with Logo */}
        <div className="relative h-64 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <img 
            src="/lovable-uploads/5b532a8c-4c79-4972-b351-f890ab065309.png" 
            alt="Hall-3 Sports Logo" 
            className="absolute top-4 left-1/2 transform -translate-x-1/2 h-32 w-32 object-contain z-10"
          />
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white mt-16">
              <h1 className="text-4xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Hall-3 Sports Inventory Tracker
              </h1>
              <p className="text-xl md:text-2xl font-semibold opacity-90">
                Sports Equipment Management System
              </p>
            </div>
          </div>
        </div>

        {/* Login Section */}
        <div className="flex items-center justify-center py-16">
          <Card className="w-full max-w-md shadow-2xl border-2 border-red-200">
            <CardHeader className="text-center bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <LogIn className="h-6 w-6" />
                Admin Login
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-red-200 focus:border-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-red-200 focus:border-red-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button 
                onClick={handleLogin} 
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              >
                Login
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-4">
          <div className="text-center">
            <p className="text-2xl font-bold mb-1">🔥 HALL 3 KA TEMPO HIGH HAI 🔥</p>
            <p className="text-sm opacity-80">Website created by Sanjay Khara (Y23), all rights are reserved to him.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/5b532a8c-4c79-4972-b351-f890ab065309.png" 
                alt="Hall-3 Sports Logo" 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold">Hall-3 Sports Inventory Tracker</h1>
                <p className="text-sm opacity-90">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={exportToExcel}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Items</p>
                  <p className="text-2xl font-bold">{inventory.length}</p>
                </div>
                <Package className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Available Items</p>
                  <p className="text-2xl font-bold">{inventory.reduce((sum, item) => sum + item.available, 0)}</p>
                </div>
                <Trophy className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Currently Issued</p>
                  <p className="text-2xl font-bold">{issues.filter(i => i.status === 'issued').length}</p>
                </div>
                <Users className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Issues</p>
                  <p className="text-2xl font-bold">{issues.length}</p>
                </div>
                <Activity className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
            <TabsTrigger value="issues">Issue & Return</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Sports Inventory</h2>
              <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select onValueChange={(value) => setNewItem({...newItem, category: value})}>
                        <SelectTrigger>
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="condition">Condition</Label>
                      <Select onValueChange={(value) => setNewItem({...newItem, condition: value})}>
                        <SelectTrigger>
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
                    <Button onClick={addInventoryItem} className="w-full">
                      Add Item
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {inventory.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <span>Category: <Badge variant="outline">{item.category}</Badge></span>
                          <span>Total: {item.quantity}</span>
                          <span>Available: <Badge variant={item.available > 0 ? "default" : "destructive"}>{item.available}</Badge></span>
                          <span>Condition: <Badge variant="secondary">{item.condition}</Badge></span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Added: {item.addedDate}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingItem(item)}
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Issue & Return Management</h2>
              <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Issue Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Issue Sports Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="item">Select Item</Label>
                      <Select onValueChange={(value) => setIssueForm({...issueForm, itemId: value})}>
                        <SelectTrigger>
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        value={issueForm.studentId}
                        onChange={(e) => setIssueForm({...issueForm, studentId: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={issueForm.notes}
                        onChange={(e) => setIssueForm({...issueForm, notes: e.target.value})}
                      />
                    </div>
                    <Button onClick={issueItem} className="w-full">
                      Issue Item
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {issues.map((issue) => (
                <Card key={issue.id} className={`border-l-4 ${issue.status === 'issued' ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{issue.itemName}</h3>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <span>Student: {issue.studentName}</span>
                          <span>ID: {issue.studentId}</span>
                          <span>Issue Date: {issue.issueDate}</span>
                          {issue.returnDate && <span>Return Date: {issue.returnDate}</span>}
                          <Badge variant={issue.status === 'issued' ? "default" : "secondary"}>
                            {issue.status.toUpperCase()}
                          </Badge>
                        </div>
                        {issue.notes && <p className="text-sm text-gray-600 mt-1">Notes: {issue.notes}</p>}
                      </div>
                      {issue.status === 'issued' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => returnItem(issue.id)}
                          className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        >
                          Mark Returned
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 mt-12">
        <div className="text-center">
          <p className="text-2xl font-bold mb-2">🔥 HALL 3 KA TEMPO HIGH HAI 🔥</p>
          <p className="text-sm opacity-80">Website created by Sanjay Khara (Y23), all rights are reserved to him.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
